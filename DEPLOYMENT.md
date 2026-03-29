# FlowCore — Deployment Guide

## Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- An [Anthropic API key](https://console.anthropic.com/)
- A [Supabase](https://supabase.com/) project (optional — works without it)
- A [Vercel](https://vercel.com/) account (for deployment)

---

## 1. Supabase Setup (Optional)

Supabase provides persistent storage for workflows and personas. Without it, FlowPilot saves to localStorage.

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
3. Copy your project URL and anon key from **Settings > API**

---

## 2. Vercel Deployment

### FlowPilot

1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repo
2. Set **Root Directory** to `apps/flowpilot`
3. Vercel auto-detects the framework (Vite) — no changes needed
4. Add environment variables in **Settings > Environment Variables**:
   ```
   ANTHROPIC_API_KEY = sk-ant-your-key-here
   VITE_SUPABASE_URL = https://your-project.supabase.co    (optional)
   VITE_SUPABASE_ANON_KEY = your-anon-key                  (optional)
   ```
5. Deploy

### TheSocialFox

1. Create a second Vercel project from the same repo
2. Set **Root Directory** to `apps/thesocialfox`
3. Add the same environment variables as above
4. Deploy

### How the API Proxy Works

Both apps include a serverless function at `/api/ai` that proxies requests to the Anthropic API. This keeps your API key server-side (never exposed to the browser). The frontend calls `/api/ai` which the Vercel Edge Function handles.

```
Browser → /api/ai (Vercel Edge Function) → Anthropic API
```

If the API key is not set, the apps automatically fall back to mock responses for demo purposes.

---

## 3. Local Development

```bash
# Install dependencies
pnpm install

# Build the shared engine
pnpm --filter @flowcore/engine build

# Run FlowPilot locally
pnpm --filter flowpilot dev

# Run TheSocialFox locally
pnpm --filter thesocialfox dev

# Run all tests
pnpm test
```

### Local API Key Setup

For local development with real AI, you have two options:

**Option A: Use `vercel dev` (recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
cd apps/flowpilot
vercel link

# Set environment variables
vercel env add ANTHROPIC_API_KEY

# Run with serverless functions
vercel dev
```

**Option B: Run without API (mock mode)**

Simply run `pnpm --filter flowpilot dev` — the app automatically uses mock responses when the `/api/ai` endpoint is unavailable.

---

## 4. Running Tests

```bash
# All tests
pnpm test

# FlowCore engine tests only (73 tests)
pnpm --filter @flowcore/engine test

# TheSocialFox adapter tests only (66 tests)
pnpm --filter socialfox-adapter test
```

---

## 5. Build

```bash
# Build everything
pnpm build

# Build specific package
pnpm --filter flowpilot build
```
