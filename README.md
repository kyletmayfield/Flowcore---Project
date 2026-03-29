# FlowCore — AI Workflow Engine with Trust & Observability

An AI workflow orchestration engine where every AI decision is **transparent**, **testable**, **graded for confidence**, and optionally **human-supervised**. Powers two front-ends: a visual workflow builder and a multi-platform caption generator.

## What Makes This Different

The AI workflow automation market (Zapier, n8n, Make, Relay.app) solves the **building** problem. Nobody solves the **trusting** problem. FlowCore uniquely combines:

| Feature | Description |
|---------|-------------|
| **AI Reasoning Traces** | Every AI decision shows its reasoning, factors considered, and alternatives rejected |
| **Grade-Based Confidence** | A-F letter grades on every decision, instantly understandable |
| **Conditional Human-in-the-Loop** | Low-confidence decisions pause for human input; high-confidence flows automatically |
| **Scenario Testing** | Batch-run sample inputs to find edge cases before going live |
| **Workflow Trust Scores** | Overall reliability grade based on aggregated performance |
| **Adaptive AI Assessment** | Underperforming branches automatically get AI-assisted evaluation |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   FLOWCORE (Shared Engine)               │
│                                                         │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │  Workflow    │ │  AI Reasoning│ │  Grade-Based     │  │
│  │  Executor   │ │  Trace       │ │  Confidence      │  │
│  └─────────────┘ └──────────────┘ └──────────────────┘  │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │  Graph       │ │  Scenario    │ │  Human-in-the-   │  │
│  │  Walker      │ │  Test Runner │ │  Loop Controller │  │
│  └─────────────┘ └──────────────┘ └──────────────────┘  │
│  ┌──────────────────────────────┐                       │
│  │  Adaptive AI Assessment      │                       │
│  └──────────────────────────────┘                       │
└──────────────────────┬──────────────────────────────────┘
                       │
            ┌──────────┴──────────┐
            │                     │
   ┌────────▼────────┐  ┌────────▼────────┐
   │   FLOWPILOT     │  │  THESOCIALFOX   │
   │   (Portfolio)   │  │  (SaaS Product) │
   │                 │  │                 │
   │ • React Flow    │  │ • Multi-platform│
   │   canvas        │  │   generation    │
   │ • 8 node types  │  │ • Persona +     │
   │ • Scenario      │  │   learned style │
   │   test panel    │  │ • Pre-gen       │
   │ • Trust score   │  │   confidence    │
   │   dashboard     │  │ • Side-by-side  │
   │ • Human-in-the- │  │   caption output│
   │   loop UI       │  │ • Reasoning     │
   │                 │  │   trace toggle  │
   └─────────────────┘  └─────────────────┘
```

## Monorepo Structure

```
flowcore-project/
├── packages/
│   └── flowcore/                # Shared engine — 73 tests
│       ├── src/
│       │   ├── types.ts         # All TypeScript interfaces
│       │   ├── executor.ts      # Workflow graph walker + execution
│       │   ├── grading.ts       # A-F confidence grading
│       │   ├── graph.ts         # Directed graph utilities
│       │   ├── ai-node.ts       # AI prompt builder + parser
│       │   ├── reasoning.ts     # Reasoning trace formatter
│       │   ├── human-review.ts  # HITL trigger + resolution
│       │   └── scenario-runner.ts # Batch testing + edge cases
│       └── tests/               # 7 test suites, 73 tests
├── apps/
│   ├── flowpilot/               # Visual workflow builder — React + Vite
│   │   ├── src/
│   │   │   ├── nodes/           # 8 custom React Flow node components
│   │   │   ├── hooks/           # State management, runner, scenarios
│   │   │   ├── components/      # Canvas, config panel, trace, HITL, settings
│   │   │   └── lib/             # Demo workflow, Supabase client
│   │   └── vercel.json          # Vercel deployment config
│   ├── socialfox-adapter/       # TheSocialFox integration — 66 tests
│   │   ├── src/
│   │   │   ├── orchestrator.ts  # Full generation pipeline
│   │   │   ├── platform-defaults.ts
│   │   │   ├── content-analyzer.ts
│   │   │   ├── caption-generator.ts
│   │   │   ├── confidence-heuristics.ts
│   │   │   ├── adaptive-assessment.ts
│   │   │   └── persona-learner.ts
│   │   └── tests/               # 7 test suites, 66 tests
│   └── thesocialfox/            # Caption generator UI — React + Vite
│       ├── src/
│       │   ├── hooks/           # State management + generation
│       │   └── components/      # Caption cards, confidence, learning
│       └── vercel.json          # Vercel deployment config
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── PROJECT_BRIEF_V2.md          # Complete project specification
```

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9

```bash
npm install -g pnpm
```

### Install & Build

```bash
pnpm install
pnpm build          # Builds all packages and apps
```

### Run Tests

```bash
pnpm test           # Runs all test suites (139 tests total)
```

### Development

```bash
pnpm dev:flowpilot   # Start FlowPilot dev server
pnpm dev:socialfox   # Start TheSocialFox dev server
```

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React 18 | Primary framework, HubSpot/IBM standard |
| Workflow Canvas | React Flow | Purpose-built for node-based editors |
| Styling | Tailwind CSS | Fast iteration, clean defaults |
| Backend / Auth / DB | Supabase | Existing expertise, real-time capabilities |
| AI | Claude API (Anthropic) | Structured output, reasoning capability |
| Shared Engine | TypeScript (strict) | Type safety for graph/trace data models |
| Monorepo | pnpm workspaces | Modern, fast, used by platform companies |
| Deployment | Vercel | Free tier, instant deploys |

## Key Technical Decisions

1. **Mock AI for demos** — The engine accepts an `AIExecutor` callback. In production it calls Claude API; in demos it returns realistic mock responses with keyword-based branching. No API key required to run the demo.

2. **Grade-based confidence** — A-F letter grades map to confidence percentages (A=90-100%, B=80-89%, C=70-79%, D=60-69%, F=0-59%). Instantly understandable by non-technical stakeholders.

3. **Conditional HITL** — Human review only triggers on F-grade decisions when `pause_on_fail` is enabled. High-confidence decisions flow automatically. During batch testing, HITL is disabled.

4. **Monorepo with project references** — TypeScript composite project references ensure type-safe cross-package imports. The engine is framework-agnostic; UI apps depend on it.

5. **Adaptive AI assessment** — When a platform's rolling average drops below 60%, an AI pre-assessment activates. Once recovered above 60%, it deactivates. Self-healing confidence system.

## Test Coverage

| Package | Test Files | Tests | Status |
|---------|-----------|-------|--------|
| @flowcore/engine | 7 | 73 | All passing |
| socialfox-adapter | 7 | 66 | All passing |
| **Total** | **14** | **139** | **All passing** |
