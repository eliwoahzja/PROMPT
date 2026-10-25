# ATLAS — Prompt Enhancer

An HTML-first editorial prompt workbench: nine destinations (FreeBuff, ChatGPT, Kilo AI, Codex, Cursor, Lovable, MiMo 2.6 Flash, DeepSeek, Z.ai / GLM-5.3-Flash), 22 structured design briefs, an optional Hallmark-informed design-review mode and a receipt of real checks on every prompt, optional AI rewriting that is re-checked server-side, and Supabase Auth/History/Settings.

## Hallmark-informed design review (v4)
- For website/app design prompts, the **Independent design review** control adds a source-grounded checklist based on verified [Hallmark v2](https://github.com/Nutlope/hallmark) principles. It is on by default and can be switched off.
- No external skill is installed or run by the HTML page. ATLAS only prepares instructions for the target AI; actual audits, screenshots and linting need an authorized coding agent.
- For an existing Supabase project run `supabase/migrations/20261025_add_hallmark_review.sql` before deploying v4. This preserves existing data and adds review preferences to history/settings. For fresh installs use the updated `supabase/schema.sql`.
- See `docs/HALLMARK_INTEGRATION.md` for verified sources, exact behavior and caveats.

## What works out of the box
- Open `index.html` with a local static HTTP server (for example `python -m http.server 8080` then `http://localhost:8080`) to use **local drafting**, the receipt, copy, style picker and all nine templates.
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
- The receipt proves what a prompt contains (your words kept, structure, style named). It cannot prove how a model will respond; do not present prompts as guaranteed one-shot successes.
- For an existing Supabase database, run `supabase/migrations/20261025_add_zai_target.sql` to permit saving Z.ai prompts. New installs only need `supabase/schema.sql`.

## Project layout
```
index.html                HTML interface
styles.css                Neo-brutalist design system
js/data.js                Nine targets (with sources + evidence level), 22 style briefs, vague-phrase sharpeners
js/engine.js              Deterministic prompt generation + verifyPrompt() checks
js/main.js                Controls, account, history, copy, persistence
api/config.js             Public non-secret runtime config
api/enhance.js            Authenticated server-side AI rewrite
supabase/schema.sql       Tables, RLS and daily quota
docs/RESEARCH.md        Research sources and verified limits
docs/EXAMPLES.md        Three before-and-after examples
tests/engine.test.js    Source-level regression tests
```

## Z.ai / GLM-5.3-Flash target (added 2026-10-25)
- Choose **Z.ai / GLM-5.3-Flash** in the target selector. This changes the prompt profile and does **not** change the hosted AI rewriter, which remains the configured OpenAI model.
- Official model code: `glm-5.3-flash`. The model offers multimodal input, tool calling and structured JSON output. For UI tasks, its published example emphasizes reviewing reference images, rendering the implementation and iterating based on screenshots.
- Z.ai requires thinking enabled for this model; `reasoning_effort` is an API setting (supported `max`, `high`, `low`), **not** something ATLAS can set through copy-ready prompt text. No exclusive XML/Markdown preference was verified.
- Sources and limitations: `docs/ZAI_RESEARCH.md`.
- The user provided the complete AI Toolfinder guide; we verified Hallmark at its official repository and adapted its design-review principles in v4 without installing or copying the external skill.

Screenshots in `docs/screens/` show the previous ATLAS v2 layout as design references; the v3 browser smoke test could not run in this environment.
