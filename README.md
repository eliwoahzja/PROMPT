# ATLAS — Prompt Enhancer

A complete HTML-first prompt workbench: six destinations (FreeBuff, ChatGPT, Kilo AI, Codex, MiMo 2.6 Flash, DeepSeek), 22 original design style briefs, local drafting, optional AI rewriting, and Supabase Auth/History/Settings.

## What works out of the box
- Open `index.html` with a local static HTTP server (for example `python -m http.server 8080` then `http://localhost:8080`) to use **local drafting**, copy, style picker and all six templates.
- Open `docs/RESEARCH.md`, `docs/EXAMPLES.md` for the research basis and examples.
- Run `npm test` (Node >=18) for the template test suite.

## Setup Supabase (saved prompts and settings)
1. Create a project at https://supabase.com.
2. In SQL Editor, run `supabase/schema.sql` once. It adds per-user RLS and a daily 20-request quota RPC.
3. Under Authentication > Providers, enable Email sign-ins/magic links. In URL Configuration add the deployed site URL and `http://localhost:3000` as permitted redirect URLs for local dev.
4. Copy **Project URL** and **public anon/publishable key**. Never paste a service role key into browser code.
5. In Vercel's project Environment Variables set `SUPABASE_URL` and `SUPABASE_ANON_KEY`. The public `/api/config` endpoint supplies these to the frontend.

## Setup semantic AI enhancement
1. Create an API key for the OpenAI Responses API.
2. Add `OPENAI_API_KEY` **only** in Vercel server-side Environment Variables.
3. Set `OPENAI_MODEL` to a currently supported Responses API model available to your account; no unsupported model is guessed by this project.
4. The selected **destination** in the UI (FreeBuff, ChatGPT, etc.) determines the resulting prompt template. The API model is the separate *rewriter*.
5. AI calls require Supabase Auth and a successful daily quota RPC; without these, the local deterministic composer remains usable.

**Costs and limits:** OpenAI API requests may incur charges. Set spend caps in the provider dashboard, and monitor Vercel usage. Quota uses 20 AI rewrite attempts/user/day UTC. The count is consumed before contacting the provider; transient errors still count. Production operators should additionally configure edge/network abuse prevention and Supabase email rate limits.

## Run locally
- For static/offline composer: `python -m http.server 8080` or any static server.
- For authentication + API routes: install Vercel CLI (`npm i -g vercel`, requires network), run `vercel login`, link the project, pull environment variables, and start `vercel dev`. `npm run dev` works when Vercel CLI is available.
- Never commit real `.env` credentials. `.env.example` is only a list of names, not valid credentials.

## GitHub and Vercel deployment
1. Create a **new empty GitHub repository**.
2. From this directory: `git init && git add . && git commit -m "Build ATLAS prompt workbench"`.
3. Add your GitHub remote (`git remote add origin <your-repository-url>`) then `git push -u origin main` (rename your branch to `main` first if necessary).
4. In Vercel: **Add New Project → Import GitHub repository**. Framework preset: **Other**. Root directory: `.`. There is no bundler/build command, and static root files are served directly; Vercel deploys `api/` as Functions. Configure environment variables before production deployment.
5. In Supabase Auth URL Configuration, add the deployed URL and permitted redirect URLs. Redeploy to apply updated environment variables.
6. Sign in with email, generate a local draft, test authenticated AI rewrite, save it, refresh and reopen History. Verify a second user cannot access the first user's prompts.

## Important implementation notes
- This is a real HTML/CSS/JavaScript page with Vercel serverless functions; it does not need React, Next.js, or a frontend build step.
- Browser-side Supabase auth loads the official SDK from `https://esm.sh/@supabase/supabase-js@2.95.0` only if configured. A production operator can pin/vendor the dependency for resilience.
- The local composer adds research-driven *structure* but does not claim to perform an LLM semantic rewrite. The server's AI route performs the actual semantic rewrite.
- Source inputs are sent to the configured AI provider only after signed-in users activate AI enhancement.
- The browser only sees Supabase public keys. The OpenAI key is kept server-side. RLS isolates saved prompt records.
- Do not present these prompts as guaranteed one-shot successes: quality depends on the completeness and feasibility of the task, actual tools and available context.

## Project layout
```
index.html                HTML interface
styles.css                Editorial design system
js/data.js                Six templates + original 22 design styles
js/engine.js              Deterministic local prompt generation
js/main.js                Controls, account, history, copy, persistence
api/config.js             Public non-secret runtime config
api/enhance.js            Authenticated server-side AI rewrite
supabase/schema.sql       Tables, RLS and daily quota
docs/RESEARCH.md        Research sources and verified limits
docs/EXAMPLES.md        Three before-and-after examples
tests/engine.test.js    Source-level regression tests
```
