# PlumbSpark — Starter (Next.js + Tailwind + AI)
A minimal scaffold for the PlumbSpark quoting app.

## What’s inside
- Next.js (App Router) + Tailwind
- Basic pages: Home, Login (dev), Dashboard, New Quote, Quote Detail
- LocalStorage persistence for quotes (DB comes later)
- `/api/ai/suggest` route calling OpenAI Responses API (gpt-4o-mini)

## Setup
1) Install deps
```bash
npm install
# or yarn / pnpm
```
2) Env vars — copy `.env.example` to `.env.local`
```
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_NAME=PlumbSpark
```
3) Run dev
```bash
npm run dev
```

## Deploy
- Create a new Vercel project, import this repo, set ENV var `OPENAI_API_KEY`.
- Build & deploy. The API route runs on Vercel by default.

## Next steps
- Replace dev login with proper auth (Supabase or NextAuth).
- Move persistence from LocalStorage to Postgres (Supabase).
- Add PDF export.
- Wire up external integrations (Xero, QuickBooks, etc.).
