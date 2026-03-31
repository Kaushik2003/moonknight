# 🌑 MoonKnight

**AI-powered Compact compiler & UI generator for Midnight Network.**
Describe your privacy-preserving dApp in plain English → get production-ready Compact contracts, ZK circuits, and a deployable frontend.

> *"Cursor for Midnight."* — Write zero-knowledge apps without writing zero-knowledge circuits.

---

## Why MoonKnight?

Midnight is a data-protection blockchain that splits state into **public** (on-chain, visible) and **private** (local, shielded) layers, bridged by zk-SNARK proofs. Its smart contract language **Compact** — a TypeScript-based DSL — compiles to zero-knowledge circuits automatically. But even with Compact abstracting away raw circuit design, the developer journey still demands deep understanding of dual-ledger semantics, witness management, proof generation, and Midnight.js SDK wiring.

MoonKnight removes that friction. An AI agent interprets your intent, generates correct Compact contracts with proper `public`/`private` annotations, compiles them to ZK circuits, scaffolds a React + Midnight.js frontend, and wires everything together — from wallet connection (Lace) to proof submission.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  MoonKnight AI                   │
│                                                  │
│  ┌───────────┐   ┌────────────┐   ┌───────────┐ │
│  │  Prompt    │──▸│  Compact   │──▸│  Circuit   │ │
│  │  Parser    │   │  Generator │   │  Compiler  │ │
│  └───────────┘   └────────────┘   └───────────┘ │
│        │                                  │      │
│        ▼                                  ▼      │
│  ┌───────────┐                    ┌───────────┐  │
│  │    UI      │◂─────────────────▸│  Midnight  │  │
│  │  Scaffold  │   proof pipeline  │  .js SDK   │  │
│  └───────────┘                    └───────────┘  │
└─────────────────────────────────────────────────┘
         │                                │
         ▼                                ▼
   React + Lace              Midnight Devnet / Testnet
```

---

## Features

| Feature | Description |
|---|---|
| **Natural Language → Compact** | Describe contract logic in English; MoonKnight generates valid Compact code with correct `ledger`, `witness`, `circuit`, and export annotations |
| **Dual-State Awareness** | AI understands Midnight's public/private ledger split — auto-routes sensitive fields to private state and public proofs to on-chain state |
| **ZK Circuit Compilation** | Invokes the Compact compiler under the hood, outputting zk-SNARK circuits (128-byte proofs) ready for on-chain verification |
| **Frontend Scaffold** | Generates a React UI wired to Midnight.js with Lace wallet integration, proof-generation hooks, and contract call bindings |
| **Selective Disclosure Templates** | Pre-built patterns for common privacy flows: age verification, balance proofs, credential checks, compliant KYC — all without revealing raw data |
| **Live Preview & Deploy** | In-browser preview against local Devnet; one-click deploy to Midnight Testnet |

---

## Quick Start

```bash
# Clone
git clone https://github.com/kaushik2003/moonknight.git && cd moonknight

# Install
bun install        # Midnight ecosystem uses Bun

# Configure
cp .env.example .env
# → Set MIDNIGHT_DEVNET_URL, OPENAI_API_KEY (or local LLM endpoint)

# Run
bun dev
```

Open `http://localhost:3000`, type a prompt like:

> *"Build a private voting dApp where each wallet can vote once. Votes are shielded but the final tally is public."*

Moonknight will generate:
1. A `voting.compact` contract with a private ballot ledger and a public tally
2. ZK circuit compilation output
3. A React UI with wallet connect, vote submission, and live tally display

---

## Example Prompts

| Prompt | What Gets Generated |
|---|---|
| *"KYC gate that proves user is 18+ without revealing birthdate"* | Compact contract with private `dob` witness, public boolean proof, and a gated-access UI |
| *"Private token transfer with compliance hook"* | ZSwap-style shielded transfer with an auditor disclosure circuit and transaction UI |
| *"Credential verifier for healthcare eligibility"* | Selective disclosure contract checking eligibility criteria against private medical flags |

---

## Project Structure

```
moonknight/
├── packages/
│   ├── ai-core/           # LLM prompt chains, Compact code generation, validation
│   ├── compact-compiler/   # Compact → ZK circuit compilation wrapper
│   ├── ui-generator/       # React + Midnight.js scaffold engine
│   └── sdk-bridge/         # Midnight.js SDK integration layer (wallets, proofs, tx)
├── templates/              # Selective disclosure & common privacy patterns
├── devnet/                 # Local Midnight Devnet config
└── app/                    # Web IDE frontend (Monaco + preview pane)
```

---

## Tech Stack

- **Runtime**: Bun
- **Smart Contracts**: Compact (TypeScript-based DSL → ZK circuits)
- **SDK**: Midnight.js — contract interaction, wallet ops, proof generation
- **Wallet**: Lace (Midnight-compatible)
- **Frontend**: React + TailwindCSS
- **AI Backend**: Pluggable — OpenAI, Anthropic, or local models via LiteLLM
- **Proof System**: zk-SNARKs via Midnight's Kachina proving system (128-byte proofs)

---

## Roadmap

- [x] Natural language → Compact contract generation
- [x] ZK circuit compilation pipeline
- [x] React UI scaffolding with Midnight.js bindings
- [ ] Multi-contract composition (cross-contract private state)
- [ ] Formal verification pass on generated Compact code
- [ ] Cardano bridge integration (Midnight ↔ Cardano asset transfers)
- [ ] Collaborative editing & version control for contracts
- [ ] Plugin system for custom privacy patterns

---

## Contributing

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Priority areas: Compact code generation accuracy, new privacy pattern templates, and Midnight.js SDK coverage.

---

## Resources

- [Midnight Docs](https://docs.midnight.network/)
- [Compact Language Reference](https://docs.midnight.network/compact)
- [Midnight.js SDK](https://github.com/midnightntwrk/midnight-js)
- [Midnight GitHub](https://github.com/midnightntwrk)
- [Nightpaper (Whitepaper)](https://midnight.network/whitepaper)

---

<p align="center">
  <sub>Built for the Midnight ecosystem — where privacy meets verifiability.</sub>
</p>