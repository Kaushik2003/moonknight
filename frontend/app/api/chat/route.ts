import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { auth } from '@clerk/nextjs/server';
import { formatFileTreeWithExtensions, getFileLanguage } from '@/lib/fileTreeFormatter';
import { checkBuilderPass } from '@/lib/builder-pass/checkPass';
import { propagateAttributes } from '@langfuse/tracing';
import { langfuseSpanProcessor } from '@/instrumentation';

// Force dynamic route to enable streaming
export const dynamic = 'force-dynamic';

// Load Soroban SDK reference for smart contract mode
let sorobanReference = '';
try {
  sorobanReference = readFileSync(join(process.cwd(), 'lib', 'llms.txt'), 'utf-8');
  console.log(`[chat] Loaded Soroban reference: ${sorobanReference.length} chars`);
} catch (e) {
  console.warn('[chat] Could not load lib/llms.txt — Soroban reference will not be available');
}

// Initialize Google Generative AI client (Gemini)
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const google = createGoogleGenerativeAI({
  apiKey: geminiApiKey || '',
});

// Available Gemini models
const GEMINI_MODELS: Record<string, string> = {
  'gemini-2.5-flash': 'gemini-2.5-flash',
  'gemini-2.5-pro': 'gemini-2.5-pro',
};

// Known OpenAI model names (sent without prefix from frontend)
const OPENAI_MODELS = ['gpt-4o-mini'];

// Initialize DeepSeek client (OpenAI-compatible)
const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
const deepseek = createOpenAI({
  apiKey: deepseekApiKey || '',
  baseURL: 'https://api.deepseek.com',
});

// Initialize Groq client
const groqApiKey = process.env.GROQ_API_KEY;
const groq = createGroq({
  apiKey: groqApiKey || '',
});

// OpenRouter config (direct fetch, no SDK)
const openrouterApiKey = process.env.OPENROUTER_API_KEY;
const openrouterModel = process.env.OPENROUTER_MODEL || 'z-ai/glm-4.5-air:free';

// Initialize OpenAI client
const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = createOpenAI({
  apiKey: openaiApiKey || '',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, model = 'gemini-2.5-flash', context, fileTree, fileContents, chatSessionId } = body;
    const modelStr = typeof model === 'string' ? model : 'gemini-2.5-flash';

    // ─── Resolve user identity (always, for analytics) ───────────────────────
    const { userId } = await auth();
    const tracedUserId = userId || 'anonymous';
    // ─────────────────────────────────────────────────────────────────────────

    // We only actively gatekeep premium models
    const isPremiumModel = ['gpt-4o-mini', 'claude-sonnet'].includes(modelStr);

    // ─── Builder Pass Guard ────────────────────────────────────────────────────
    if (isPremiumModel) {
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const pass = await checkBuilderPass(userId);
      if (!pass.active) {
        return NextResponse.json(
          {
            error: 'Builder Pass required',
            code: 'PASS_REQUIRED',
            message: 'You need an active Builder Pass to use AI features. Get one for ₹150/24h.',
          },
          { status: 402 }
        );
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Determine provider from model string prefix or known model names
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
      // Known OpenAI model sent without prefix (e.g. "gpt-4o-mini")
      provider = 'openai';
      resolvedModelName = modelStr;
    } else {
      // Default to Gemini — validate against known models
      provider = 'gemini';
      resolvedModelName = GEMINI_MODELS[modelStr] || GEMINI_MODELS['gemini-2.5-flash'];
    }

    // Get the last user message
    const lastUserMessage = messages
      .filter((msg: any) => msg.role === 'user')
      .pop()?.content || '';

    // Build system prompt with structured JSON response format
    let systemPrompt = `You are an AI code editor embedded inside a Soroban (Stellar) development IDE.

Your primary objective is to produce CORRECT, COMPILABLE, SIMPLE Soroban smart contracts.
Correctness is MORE IMPORTANT than completeness or feature richness.

You MUST strictly follow all rules below.
If any rule cannot be satisfied with certainty, you MUST briefly state the issue in chat.message (1-2 sentences max) and make NO code changes.

────────────────────────────────────────────
RESPONSE FORMAT (MANDATORY)
────────────────────────────────────────────

You MUST respond with valid JSON ONLY.

{
  "chat": {
    "message": string
  },
  "editor": {
    "changes": [
      {
        "path": string,
        "action": "create" | "update" | "delete",
        "content": string
      }
    ]
  }
}

- chat.message → Brief, direct response (2-3 sentences maximum)
- editor.changes[].content → FULL file content, CODE ONLY
- If no file change is required → editor.changes MUST be []

────────────────────────────────────────────
CHAT MESSAGE RULES (chat.message)
────────────────────────────────────────────

- **KEEP IT SHORT**: Maximum 2-3 sentences
- **BE DIRECT**: Address ONLY the specific issue or question
- **NO FLUFF**: No lengthy explanations, no background context, no design rationale
- **FOCUSED**: State what was done, nothing more
- MUST be natural language only
- MUST NOT contain code snippets
- MUST NOT mention internal policies or system rules
- MUST NOT include reasoning, decision process, or "why" explanations
- Example format: "Implemented [feature]. [Brief one-sentence explanation if needed]."

────────────────────────────────────────────
EDITOR RULES (editor.changes)
────────────────────────────────────────────

- CODE ONLY — NO explanations, NO comments, NO markdown
- MUST include FULL file content
- NEVER use diffs or partial edits
- NEVER include chat text or reasoning
- NEVER include placeholder logic or stubs

────────────────────────────────────────────
FILE SAFETY RULES
────────────────────────────────────────────

- NEVER modify files not listed in the Project File Tree
- NEVER invent new paths unless explicitly instructed
- NEVER modify Cargo.toml - it is pre-configured and MUST NOT be changed
- NEVER mix languages across files:
  - .rs → Rust only
  - .ts/.tsx → TypeScript only
  - .json → strict JSON only
  - Cargo.toml → DO NOT MODIFY (read-only)

────────────────────────────────────────────
SOROBAN CONTRACT HARD RULES (.rs FILES)
────────────────────────────────────────────

GENERAL
- MUST start with \`#![no_std]\`
- MUST use ONLY \`soroban_sdk\`
- MUST follow Soroban SDK v21+ patterns
- MUST target wasm32v1-none compatibility
- MUST compile with:
  cargo build --target wasm32-unknown-unknown --release
- **CONTRACT SIZE LIMIT (CRITICAL)**: The entire contract file MUST NOT exceed 100 lines
  - Count ALL lines including imports, structs, impl blocks, and functions
  - If requirements would exceed 100 lines, prioritize core functionality
  - Simplify or remove non-essential features to stay within limit
  - This limit enforces simplicity and best practices

STRUCTURE (MANDATORY)
- \`use soroban_sdk::{contract, contractimpl, Env, ...}\` imports
- \`#[contract]\` struct
- \`#[contractimpl]\` impl block
- All functions inside the impl block
- **Keep structure minimal**: Use concise Rust patterns to stay within 100-line limit
  - Combine related functionality
  - Use helper functions sparingly
  - Avoid excessive type definitions

STORAGE (MANDATORY)
- ALL state MUST use:
  - env.storage().persistent().set()
  - env.storage().persistent().get()
  - env.storage().persistent().has()
- Storage keys MUST be defined using \`#[contracttype]\`
- NO simulated balances
- NO fake ownership
- NO in-memory state

FORBIDDEN (STRICT)
- NO comments of any kind (// or /* */)
- NO TODO / FIXME / placeholder text
- NO \`unimplemented!()\` or \`todo!()\`
- NO dummy return values like \`symbol_short!("SUCCESS")\`
- NO \`std\`
- NO imaginary SDK APIs
- NO unused imports

AUTH & SAFETY
- Any state-changing function MUST require authorization when applicable
- Ownership and access rules MUST be enforced
- Invalid state MUST panic deterministically

────────────────────────────────────────────
TOKEN CONTRACT RULES (CRITICAL)
────────────────────────────────────────────

- Env DOES NOT expose native asset helpers
- NEVER call env.native_asset_id(), env.xlm(), or similar
- Token contracts MUST be provided explicitly via Address
- Native XLM MUST be passed as a token contract Address
- token::Client::new() MUST always receive an Address argument
- If a token Address is required and not provided, DO NOT guess or invent one

────────────────────────────────────────────
COMPILATION & VERIFICATION RULES (CRITICAL)
────────────────────────────────────────────

Before returning ANY Rust code, you MUST internally:

1. Verify the code is syntactically valid Rust
2. Verify all imports exist in soroban_sdk
3. Verify all types are correct and available
4. Verify no forbidden constructs are used
5. Verify every function has real, complete logic
6. **VERIFY line count: Contract MUST be ≤ 100 lines total**
   - Count every line in the file (including blank lines)
   - If over 100 lines, simplify or remove features
   - Prioritize core functionality over completeness

If you are NOT 100% confident the code compiles:
- DO NOT generate code
- Briefly state the issue in chat.message (1 sentence)
- Return editor.changes = []

If the contract would exceed 100 lines:
- Simplify the implementation
- Remove non-essential features
- Use more concise Rust patterns
- Briefly note the simplification in chat.message (1 sentence)

────────────────────────────────────────────
LATEST STANDARDS RULE
────────────────────────────────────────────

- ALWAYS prefer the latest stable Soroban contract patterns
- DO NOT rely on outdated or deprecated APIs
- If unsure about an API or pattern:
  - DO NOT generate code
  - Briefly state the uncertainty in chat.message (1 sentence)
  - Return editor.changes = []

────────────────────────────────────────────
PRIORITY RULE
────────────────────────────────────────────

Correctness > Simplicity > Completeness > Features

**Size Constraint**: All contracts MUST be ≤ 100 lines
- This limit is NON-NEGOTIABLE
- Simplicity and conciseness are critical
- Prefer minimal, focused implementations over feature-rich code

If production-level correctness is not achievable:
- Generate a smaller, simpler, but CORRECT contract
- Stay within 100-line limit by prioritizing essential functionality
- Or briefly state limitations in chat.message (1 sentence) and refuse to modify code

────────────────────────────────────────────
FAIL-SAFE BEHAVIOR
────────────────────────────────────────────

If requirements are ambiguous, unsafe, or unverifiable:
- Briefly state the issue in chat.message (1-2 sentences)
- Make NO editor changes`;

    // CONTEXT PRIORITY ORDER:
    // 1. PRIMARY: Selected code (if any) - HIGHEST PRIORITY
    // 2. SECONDARY: Full current file content - Use for surrounding context
    // 3. TERTIARY: Project file tree (paths + languages only) - Reference only if needed

    // PRIMARY CONTEXT: Selected code (highest priority)
    if (context?.selection?.selectedText) {
      systemPrompt += `\n\n────────────────────────────────────────────
PRIMARY CONTEXT: SELECTED CODE (HIGHEST PRIORITY)
────────────────────────────────────────────
The user has selected the following code. This is the PRIMARY focus of your response.
You MUST prioritize understanding and responding to this selected code above all else.

File: ${context.activeFilePath || 'Unknown'}
Lines: ${context.selection.startLine}-${context.selection.endLine}

Selected Code:
${context.selection.selectedText}

IMPORTANT: Focus your response on this selected code. Keep chat.message brief and direct (2-3 sentences max).

────────────────────────────────────────────`;
    }

    // SECONDARY CONTEXT: Full current file content
    if (context?.activeFilePath) {
      const activeFileContent = fileContents?.[context.activeFilePath] || "";
      const activeFileLanguage = getFileLanguage(context.activeFilePath);

      systemPrompt += `\n\n────────────────────────────────────────────
SECONDARY CONTEXT: FULL FILE CONTENT
────────────────────────────────────────────
This is the complete content of the file containing the selected code.
Use this to understand the surrounding context and file structure.

Path: ${context.activeFilePath}
Language: ${activeFileLanguage}

Full File Content:
${activeFileContent}

────────────────────────────────────────────`;
    } else {
      systemPrompt += `\n\nSECONDARY CONTEXT: No active file`;
    }

    // TERTIARY CONTEXT: Project file tree (paths + languages only)
    if (fileTree && Array.isArray(fileTree)) {
      // Format file tree with paths and languages only (no content)
      const fileTreeStr = formatFileTreeWithExtensions(fileTree);
      systemPrompt += `\n\n────────────────────────────────────────────
TERTIARY CONTEXT: PROJECT FILE TREE
────────────────────────────────────────────
This shows the project structure. Only reference other files if absolutely necessary. Keep responses brief and focused.

${fileTreeStr}

────────────────────────────────────────────`;
    }

    // Add context-specific mode information
    if (context) {
      if (context.mode === 'contract') {
        systemPrompt += `\n\nCurrent Mode: Contract Development (Rust/Soroban)`;

        // Inject Soroban SDK reference as context
        if (sorobanReference) {
          systemPrompt += `\n\n────────────────────────────────────────────
SOROBAN SDK REFERENCE (USE THIS AS YOUR PRIMARY API REFERENCE)
────────────────────────────────────────────
${sorobanReference}
────────────────────────────────────────────`;
        }
      } else if (context.mode === 'frontend') {
        systemPrompt += `\n\nCurrent Mode: Frontend Development (React/Next.js)`;
      }

      if (context.intent) {
        if (context.intent === 'explain') {
          systemPrompt += `\n\n────────────────────────────────────────────
USER INTENT: EXPLAIN (READ-ONLY)
────────────────────────────────────────────
The user wants an explanation of the selected code.

CRITICAL RULES FOR "EXPLAIN":
- This is READ-ONLY - DO NOT make any editor changes
- Return editor.changes = [] (empty array)
- Provide brief explanation ONLY in chat.message (2-3 sentences maximum)
- State what the code does directly, no background or rationale
- Reference the selected code as PRIMARY context
- Use the full file content as SECONDARY context for surrounding context
- Do NOT suggest modifications or fixes

────────────────────────────────────────────`;
        } else if (context.intent === 'debug') {
          systemPrompt += `\n\n────────────────────────────────────────────
USER INTENT: DEBUG (SUGGESTIONS ONLY)
────────────────────────────────────────────
The user is debugging an issue in the selected code.

CRITICAL RULES FOR "DEBUG":
- DO NOT automatically modify code
- Provide brief debugging suggestions in chat.message (2-3 sentences maximum)
- You MAY suggest fixes in chat.message, but DO NOT apply them automatically
- Return editor.changes = [] (empty array) unless explicitly requested
- State the issue and solution directly, no lengthy explanations
- Reference the selected code as PRIMARY context
- Use the full file content as SECONDARY context to understand the issue

────────────────────────────────────────────`;
        } else {
          systemPrompt += `\n\nUser Intent: ${context.intent}`;
        }
      }
    }

    // Add user instruction (last user message)
    systemPrompt += `\n\nUser Instruction:
${lastUserMessage}`;

    // Convert messages to the format expected by AI SDK
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    const encoder = new TextEncoder();

    // Collect the full response to parse JSON
    let fullResponse = "";

    // Resolve the AI SDK model instance based on provider
    let aiModel;
    switch (provider) {
      case 'deepseek':
        if (!deepseekApiKey) {
          return new Response(
            JSON.stringify({ error: 'DEEPSEEK_API_KEY environment variable is required.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
        aiModel = deepseek.chat(resolvedModelName);
        console.log(`[chat] Using DeepSeek provider, model: ${resolvedModelName}`);
        break;
      case 'groq':
        if (!groqApiKey) {
          return new Response(
            JSON.stringify({ error: 'GROQ_API_KEY environment variable is required.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
        aiModel = groq(resolvedModelName);
        console.log(`[chat] Using Groq provider, model: ${resolvedModelName}`);
        break;
      case 'openrouter': {
        // Read API key fresh from env (module-level may be stale)
        const orApiKey = process.env.OPENROUTER_API_KEY;
        if (!orApiKey) {
          return new Response(
            JSON.stringify({ error: 'OPENROUTER_API_KEY environment variable is required.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
        // Use AI SDK with OpenRouter's OpenAI-compatible endpoint
        // so the call goes through streamText() and gets auto-traced by Langfuse OTEL
        const openrouter = createOpenAI({
          apiKey: orApiKey,
          baseURL: 'https://openrouter.ai/api/v1',
          headers: {
            'HTTP-Referer': 'http://localhost',
            'X-Title': 'MoonKnight',
          },
        });
        aiModel = openrouter.chat(resolvedModelName);
        console.log(`[chat] Using OpenRouter provider (via AI SDK), model: ${resolvedModelName}`);
        break;
      }
      case 'openai':
        if (!openaiApiKey) {
          return new Response(
            JSON.stringify({ error: 'OPENAI_API_KEY environment variable is required.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
        aiModel = openai.chat(resolvedModelName);
        console.log(`[chat] Using OpenAI provider, model: ${resolvedModelName}`);
        break;
      default:
        if (!geminiApiKey) {
          console.error('[chat] GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY is missing');
          return new Response(
            JSON.stringify({
              error: 'GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY environment variable is required. Please set it in your .env.local file.',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
        aiModel = google(resolvedModelName);
        console.log(`[chat] Using Gemini provider, model: ${resolvedModelName}`);
        break;
    }

    // Stream the response (unified for all providers)
    // Langfuse: propagate userId + sessionId, then enable OTEL telemetry
    const result = await propagateAttributes(
      {
        traceName: 'contract-chat',
        userId: tracedUserId,
        sessionId: chatSessionId || undefined,
        tags: ['contract-mode', `model:${resolvedModelName}`, `provider:${provider}`],
      },
      () => streamText({
        model: aiModel,
        system: systemPrompt,
        messages: formattedMessages,
        temperature: 0.7,
        experimental_telemetry: {
          isEnabled: true,
        },
      }),
    );

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream provider output (and accumulate for JSON parsing)
          for await (const chunk of result.textStream) {
            const text = typeof chunk === 'string' ? chunk : String(chunk);
            fullResponse += text;
            controller.enqueue(encoder.encode(text));
          }

          // Try to parse JSON from the response with robust error handling
          try {
            // Extract JSON from markdown code blocks if present
            let jsonStr = fullResponse.trim();

            // Remove markdown code blocks
            if (jsonStr.includes("```json")) {
              const jsonBlockMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```/);
              if (jsonBlockMatch) {
                jsonStr = jsonBlockMatch[1].trim();
              }
            } else if (jsonStr.includes("```")) {
              const codeBlockMatch = jsonStr.match(/```\s*([\s\S]*?)\s*```/);
              if (codeBlockMatch) {
                jsonStr = codeBlockMatch[1].trim();
              }
            }

            // Try multiple strategies to extract and parse JSON
            let parsed: any = null;
            let parseSuccess = false;

            // Strategy 1: Try to find JSON object with balanced braces
            const findBalancedJson = (str: string): string | null => {
              let depth = 0;
              let start = -1;

              for (let i = 0; i < str.length; i++) {
                if (str[i] === '{') {
                  if (depth === 0) start = i;
                  depth++;
                } else if (str[i] === '}') {
                  depth--;
                  if (depth === 0 && start !== -1) {
                    return str.substring(start, i + 1);
                  }
                }
              }
              return null;
            };

            const balancedJson = findBalancedJson(jsonStr);
            if (balancedJson) {
              try {
                parsed = JSON.parse(balancedJson);
                parseSuccess = true;
              } catch (e) {
                // Try to fix common JSON issues
                try {
                  // Fix unescaped newlines in strings
                  let fixedJson = balancedJson.replace(/("(?:[^"\\]|\\.)*")\s*\n\s*(")/g, '$1\\n$2');
                  // Fix unescaped quotes in strings (basic attempt)
                  fixedJson = fixedJson.replace(/([^\\])"/g, (match, char) => {
                    // Don't fix if it's already part of a string structure
                    return match;
                  });
                  parsed = JSON.parse(fixedJson);
                  parseSuccess = true;
                } catch (e2) {
                  // Strategy 2: Try to extract just the JSON structure manually
                  try {
                    const chatMatch = jsonStr.match(/"chat"\s*:\s*\{[^}]*"message"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
                    const editorMatch = jsonStr.match(/"editor"\s*:\s*\{[^}]*"changes"\s*:\s*(\[[\s\S]*?\])/);

                    if (chatMatch && editorMatch) {
                      // Try to reconstruct a valid JSON
                      const chatMessage = chatMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
                      let changesArray;
                      try {
                        changesArray = JSON.parse(editorMatch[1]);
                      } catch {
                        changesArray = [];
                      }

                      parsed = {
                        chat: { message: chatMessage },
                        editor: { changes: changesArray }
                      };
                      parseSuccess = true;
                    }
                  } catch (e3) {
                    // All strategies failed
                  }
                }
              }
            }

            // If parsing succeeded, validate and log
            if (parseSuccess && parsed) {
              // Validate structure
              if (parsed.chat && parsed.editor) {
                console.log('[chat] Parsed structured response:', {
                  chatMessage: parsed.chat.message?.substring(0, 100) + '...',
                  changesCount: parsed.editor.changes?.length || 0,
                  changePaths: parsed.editor.changes?.map((c: any) => c.path) || [],
                });

                // Log validation warnings
                if (parsed.editor.changes && parsed.editor.changes.length > 0) {
                  parsed.editor.changes.forEach((change: any) => {
                    if (change.action === "update" && !change.content) {
                      console.warn(`[chat] Warning: Update action for ${change.path} has no content`);
                    }
                    if ((change.action === "create" || change.action === "update") && change.content) {
                      const contentLength = change.content.length;
                      console.log(`[chat] File ${change.path}: ${contentLength} characters`);
                    }
                  });
                }
              } else {
                console.warn('[chat] Parsed JSON but missing chat or editor keys');
              }
            } else {
              // Log the problematic JSON for debugging
              const preview = jsonStr.substring(0, 500);
              const errorPosition = jsonStr.length > 500 ? '...' : '';
              console.warn('[chat] Could not parse JSON from response. Preview:', preview + errorPosition);
              console.warn('[chat] Full response length:', fullResponse.length);
            }
          } catch (parseError) {
            // If JSON parsing fails, log with more context
            const errorMsg = parseError instanceof Error ? parseError.message : String(parseError);
            console.warn('[chat] JSON parsing error:', errorMsg);
            // Log a preview of the response for debugging
            const preview = fullResponse.substring(0, 1000);
            console.warn('[chat] Response preview (first 1000 chars):', preview);
          }

          controller.close();
        } catch (error) {
          console.error('[chat] Stream error:', error);

          // Avoid hard stream aborts that show up in the browser as
          // "TypeError: Failed to fetch" with no actionable detail.
          const errorMessage = error instanceof Error
            ? error.message
            : 'The AI response stream failed unexpectedly. Please retry.';

          const fallbackPayload = {
            chat: {
              message: `Unable to complete this response: ${errorMessage}`,
            },
            editor: {
              changes: [],
            },
          };

          try {
            controller.enqueue(encoder.encode(JSON.stringify(fallbackPayload)));
          } catch (enqueueError) {
            console.error('[chat] Failed to enqueue stream fallback payload:', enqueueError);
          }

          controller.close();
        }
      },
    });

    // Langfuse: flush traces before serverless function terminates
    after(async () => await langfuseSpanProcessor.forceFlush());

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[chat] Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to process chat request'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
