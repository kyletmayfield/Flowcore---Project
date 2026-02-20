# FlowCore Project

AI Workflow Engine with Trust & Observability.

## Monorepo Structure

```
flowcore-project/
├── packages/
│   └── flowcore/              # Shared engine (TypeScript)
├── apps/
│   ├── flowpilot/             # Visual workflow builder (React + Vite)
│   └── socialfox-adapter/     # TheSocialFox integration layer
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9

Install pnpm if you don't have it:

```bash
npm install -g pnpm
```

### Install Dependencies

```bash
pnpm install
```

### Build the Engine

```bash
pnpm --filter @flowcore/engine build
```

### Run Tests

```bash
pnpm --filter @flowcore/engine test
```

### Start FlowPilot Dev Server

```bash
pnpm dev:flowpilot
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Flow, Tailwind CSS |
| Backend / Auth / DB | Supabase |
| AI | Claude API (Anthropic) |
| Shared Engine | TypeScript |
| Monorepo | pnpm workspaces |
| Deployment | Vercel |
