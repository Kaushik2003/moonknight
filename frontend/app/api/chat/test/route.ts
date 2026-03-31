import { NextRequest } from 'next/server';
import { after } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { auth } from '@clerk/nextjs/server';
import { getStellarContext } from '@/lib/stellaRAG';
import { propagateAttributes } from '@langfuse/tracing';
import { langfuseSpanProcessor } from '@/instrumentation';

export const dynamic = 'force-dynamic';

// ─── Load Soroban SDK reference (llms.txt) ──────────────────────────
let sorobanReference = '';
try {
    sorobanReference = readFileSync(join(process.cwd(), 'lib', 'llms.txt'), 'utf-8');
    console.log(`[test] Loaded Soroban reference: ${sorobanReference.length} chars`);
} catch {
    console.warn('[test] Could not load lib/llms.txt');
}

// ─── Provider clients (same as route.ts) ────────────────────────────
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const google = createGoogleGenerativeAI({ apiKey: geminiApiKey || '' });

const GEMINI_MODELS: Record<string, string> = {
    'gemini-2.5-flash': 'gemini-2.5-flash',
    'gemini-2.5-pro': 'gemini-2.5-pro',
};
const OPENAI_MODELS = ['gpt-4o-mini'];

const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
const deepseek = createOpenAI({ apiKey: deepseekApiKey || '', baseURL: 'https://api.deepseek.com' });

const groqApiKey = process.env.GROQ_API_KEY;
const groq = createGroq({ apiKey: groqApiKey || '' });

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = createOpenAI({ apiKey: openaiApiKey || '' });

export async function POST(request: NextRequest) {
    try {
        const { code, fileName, model, fileContents, chatSessionId } = await request.json();

        // ─── Resolve user identity (for Langfuse analytics) ─────────────
        const { userId } = await auth();
        const tracedUserId = userId || 'anonymous';
        // ─────────────────────────────────────────────────────────────────

        if (!code || typeof code !== 'string' || !code.trim()) {
            return new Response(
                JSON.stringify({ error: 'No contract code provided' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        console.log(`[test] Validating: ${fileName || 'unknown'} (${code.length} chars) with model: ${model || 'default'}`);

        // ─── Resolve model & provider (same logic as route.ts) ────────
        const modelStr = typeof model === 'string' ? model : 'gemini-2.5-flash';
        let provider: 'gemini' | 'deepseek' | 'groq' | 'openrouter' | 'openai';
        let resolvedModelName = modelStr;

        if (modelStr.startsWith('deepseek:')) {
            provider = 'deepseek';
            resolvedModelName = modelStr.slice('deepseek:'.length);
        } else if (modelStr.startsWith('groq:')) {
            provider = 'groq';
            resolvedModelName = modelStr.slice('groq:'.length);
        } else if (modelStr.startsWith('openrouter:')) {
            provider = 'openrouter';
            resolvedModelName = modelStr.slice('openrouter:'.length);
        } else if (OPENAI_MODELS.includes(modelStr)) {
            provider = 'openai';
        } else {
            provider = 'gemini';
            resolvedModelName = GEMINI_MODELS[modelStr] || GEMINI_MODELS['gemini-2.5-flash'];
        }

        // ─── Get Stellar docs context from StellaRAG ──────────────────
        let stellarDocs = '';
        try {
            stellarDocs = await getStellarContext(
                `Soroban smart contract compilation and deployment validation for: ${fileName}`
            );
        } catch (e) {
            console.warn('[test] StellaRAG context fetch failed:', e);
        }

        // ─── Build surrounding file context ───────────────────────────
        let otherFilesContext = '';
        if (fileContents && typeof fileContents === 'object') {
            const otherFiles = Object.entries(fileContents)
                .filter(([path]) => path !== fileName)
                .slice(0, 5); // limit to 5 other files

            if (otherFiles.length > 0) {
                otherFilesContext = '\n\nOTHER PROJECT FILES (for reference):\n' +
                    otherFiles.map(([path, content]) =>
                        `── ${path} ──\n${(content as string).slice(0, 500)}${(content as string).length > 500 ? '\n... (truncated)' : ''}`
                    ).join('\n\n');
            }
        }

        // ─── Validation system prompt ─────────────────────────────────
        const systemPrompt = `You are a Soroban smart contract compilation & deployment validator.

Your ONLY job is to determine whether this contract will:
1. COMPILE successfully with \`soroban contract build\` (Rust/no_std/Soroban SDK 21.0.0)
2. DEPLOY successfully to Stellar testnet

═══════════════════════════════════════════
SOROBAN SDK 21.0.0 REFERENCE (AUTHORITATIVE)
═══════════════════════════════════════════
${sorobanReference}
═══════════════════════════════════════════

${stellarDocs ? `STELLAR DOCUMENTATION CONTEXT:\n${stellarDocs}\n` : ''}

CRITICAL COMPILATION RULES TO CHECK:
1. #![no_std] must be present
2. Vec uses push_back() NOT push()
3. Map takes OWNED keys, NOT &references (use .clone())
4. Symbol::new(&env, "name") NOT Symbol::from("name")
5. String::from_str(&env, "text") NOT String::from("text")
6. Custom structs in Vec need #[derive(Clone)]
7. No to_string() in no_std — use integers directly
8. require_auth() BEFORE any state changes
9. Correct storage API usage (instance/persistent/temporary)
10. Proper imports from soroban_sdk
11. env.prng() methods — only gen, gen_range, gen_len, fill, shuffle, seed exist
12. token::Client methods use & references for addresses/amounts

CONTRACT TO VALIDATE:
\`\`\`rust
${code}
\`\`\`
File: ${fileName || 'lib.rs'}
${otherFilesContext}

RESPONSE FORMAT:
- If it WILL compile & deploy: "✅ Contract will compile and deploy successfully." + 1-2 line summary of what it does
- If it WILL NOT compile: "❌ Compilation errors found:" + numbered list of SPECIFIC errors with line numbers and exact fixes
- If it compiles but has deployment concerns: "⚠️ Compiles but has deployment issues:" + numbered list of issues

Be PRECISE. Reference exact line numbers and show the wrong code → correct code.
Keep your response SHORT (max 10 lines).`;

        // ─── Resolve AI model (unified — including OpenRouter via AI SDK) ────
        let aiModel;
        switch (provider) {
            case 'deepseek':
                aiModel = deepseek.chat(resolvedModelName);
                break;
            case 'groq':
                aiModel = groq(resolvedModelName);
                break;
            case 'openai':
                aiModel = openai.chat(resolvedModelName);
                break;
            case 'openrouter': {
                const orApiKey = process.env.OPENROUTER_API_KEY;
                if (!orApiKey) {
                    return new Response(
                        JSON.stringify({ error: 'OPENROUTER_API_KEY is required' }),
                        { status: 500, headers: { 'Content-Type': 'application/json' } }
                    );
                }
                const openrouter = createOpenAI({
                    apiKey: orApiKey,
                    baseURL: 'https://openrouter.ai/api/v1',
                    headers: {
                        'HTTP-Referer': 'http://localhost',
                        'X-Title': 'MoonKnight',
                    },
                });
                aiModel = openrouter.chat(resolvedModelName);
                break;
            }
            default:
                aiModel = google(resolvedModelName);
        }

        // ─── Call LLM with Langfuse tracing ─────────────────────────────
        const { text } = await propagateAttributes(
            {
                traceName: 'contract-test',
                userId: tracedUserId,
                sessionId: chatSessionId || undefined,
                tags: ['contract-test', `model:${resolvedModelName}`, `provider:${provider}`],
            },
            () => generateText({
                model: aiModel,
                system: systemPrompt,
                prompt: 'Validate this contract for compilation and deployment.',
                temperature: 0.3,
                experimental_telemetry: { isEnabled: true },
            }),
        );

        after(async () => await langfuseSpanProcessor.forceFlush());

        return new Response(
            JSON.stringify({ result: text || 'No response from validator' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('[test] Validation error:', error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Validation failed' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
