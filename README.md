# ATLAS — Prompt Enhancer

An HTML-first editorial prompt workbench: 15 destinations (FreeBuff, ChatGPT, Kilo AI, Codex, Cursor, Lovable, MiMo 2.6 Flash, DeepSeek, Z.ai / GLM-5.3-Flash, GPT-6 (ChatGPT), GPT-6 Astra, GPT-6.1 Sol, GPT-6 Sol, GPT-6 Luna, DeepSeek V4.1 Flash (10/17)), 22 structured design briefs, an optional Hallmark-informed design-review mode and a receipt of real checks on every prompt, optional AI rewriting that is re-checked server-side, and Supabase Auth/History/Settings.

## Hallmark-informed design review (v4)
- For website/app design prompts, the **Independent design review** control adds a source-grounded checklist based on verified [Hallmark v2](https://github.com/Nutlope/hallmark) principles. It is on by default and can be switched off.
- No external skill is installed or run by the HTML page. ATLAS only prepares instructions for the target AI; actual audits, screenshots and linting need an authorized coding agent.
- For an existing Supabase project run `supabase/migrations/20261025_add_hallmark_review.sql` before deploying v4. This preserves existing data and adds review preferences to history/settings. For fresh installs use the updated `supabase/schema.sql`.
- See `docs/HALLMARK_INTEGRATION.md` for verified sources, exact behavior and caveats.

## What works out of the box
- Open `index.html` with a local static HTTP server (for example `python -m http.server 8080` then `http://localhost:8080`) to use **local drafting**, the receipt, copy, style picker and all 15 templates.
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
- For an existing Supabase database, run `supabase/migrations/20261026_add_specific_models.sql` to permit saving all 15 destinations, including Z.ai. New installs only need `supabase/schema.sql`.

## Project layout
```
index.html                HTML interface
styles.css                Neo-brutalist design system
js/data.js                15 targets (with sources + evidence level), 22 style briefs, vague-phrase sharpeners
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

## Model-specific profiles added October 26, 2026 (v5)
ATLAS now distinguishes **coding platforms** from **OpenAI models** and **other model providers** through one compact grouped dropdown. The profile changes the *generated prompt*, **not** the OpenAI model powering the optional semantic rewriter. API reasoning effort, tool permissions, and provider version are configured outside prompt text.

- **GPT-6 (ChatGPT)**: ChatGPT-facing model without a separately verified standalone `gpt-6` API ID. Intelligent UI is a ChatGPT product capability and is not forced by the prompt.
- **GPT-6 Astra**: documented `gpt-6-astra` API model. Complex reasoning and tool-supported work.
- **GPT-6.1 Sol**: documented `gpt-6.1-sol`; newer Sol. Reasoning `none` is *not* supported.
- **GPT-6 Sol**: documented `gpt-6-sol`; earlier Sol. Reasoning `none` is supported.
- **GPT-6 Luna**: documented `gpt-6-luna`; efficient, narrow tasks.
- **DeepSeek V4.1 Flash 10/17**: revision `DeepSeek-V4.1-Flash-1017`; **API alias is still `deepseek-flash`**, not a new date-based model ID.

Read `docs/NEW_MODELS_2026_10_26.md` for official source links, research/evidence boundaries and concise prompting profiles. On existing Supabase instances, run `supabase/migrations/20261026_add_specific_models.sql` before saving v5-specific targets.

### Testing boundaries
`npm test` exercises the local drafts and mocked authenticated rewrite route for all new targets. It does not perform real model inference or check permissions for the recipient's ChatGPT, Codex or API account. Live Vercel and Supabase integration should be tested after deploying.

## v6 — 100 MB Slop Rater + project context

This release adds a second **Slop Rater** workspace while preserving all 15 target models, 22 original design styles, existing prompt enhancement, Hallmark checks, magic-link login, and Supabase-backed history.

### ZIP source audit (works without login or AI API)
1. Select **Slop Rater**.
2. Attach a **standard `.zip` app/project archive of at most 100 MiB (104,857,600 bytes)**. Drag/drop is also supported.
3. Optionally state which AI was used. Default **Unknown** has no effect on the score; ATLAS never claims to identify authorship.
4. Press **Inspect project**. ATLAS reads the ZIP directory and a bounded sample of relevant UI code on the **client device**. It does **not** execute code, write extracted files to disk, or upload the full archive anywhere.
5. See the source-pattern risk score, category breakdown, file/line-based findings, recommended fixes, missing verification evidence, and a generated **detailed repair prompt**. Copy it, download a complete Markdown report with the prompt, or sign in and save the prompt into existing history.

**Scope:** This is a deterministic, heuristic **source-pattern rating** (higher number = more flagged patterns), **not an objective measure of visual quality, proof of AI authorship, runtime testing, or a review of every source file**. ZIP entries are listed, then at most **200 small UI code files / 6 MiB of uncompressed source text** are sampled for evidence. Max **18,000 entries**. ZIP64, multi-disk and encrypted ZIPs are not supported. Large binary files, vendor dependencies, `.env` and likely secrets are not scanned. Unsupported compressed sources are skipped, and confidence is labeled limited when necessary. `DecompressionStream('deflate-raw')` support is needed for typical compressed ZIPs. The interface identifies unverified issues instead of silently treating missing evidence as a pass.

### Optional screenshot-based visual review

You may attach **one screenshot of the running app** (PNG/JPEG/WebP, max **2.5 MiB**) in the Slop Rater. To request a subjective visual analysis and second opinion, sign in, configure the existing AI backend, and explicitly confirm sending **the screenshot + small source finding summaries + context excerpt** to your configured AI provider. The project ZIP itself is never transmitted. The AI's visual rating is shown **separately** from the deterministic code-pattern score and is not presented as an objective measurement. A model unable to accept image input may return an error; the local report remains intact.

This architecture avoids Vercel's 4.5 MB serverless body limit for the 100 MB project ZIP and avoids needing 100 MB uploads to Supabase Storage (whose Free tier has a 50 MB per-object maximum). It also avoids untrusted archive extraction on Vercel.

### `context.md` shared work context

Attach an optional Markdown file through **Project context**, above the workspace tabs. The file can be up to **512 KiB**, but at most **10,500 characters** are included in generated prompts; an overflow indicator tells you if it was shortened. Both the normal enhancer and the Slop Rater repair prompt incorporate those facts and project constraints. The local file is not stored automatically. Generated prompts can include content excerpts, so **remove passwords, keys, private customer data or confidential source information before attaching**. Sign-in/history saves **the generated prompt**, not the original Markdown file. An authenticated AI rewrite asks permission before sending its attached context excerpt. The Slop Rater AI critique also asks for consent.

### Deployment

**No new Supabase SQL migration is required for v6.** Existing `prompts` RLS and the per-user quota RPC already support saved repair briefs and optional AI reviews. Fresh installs should use `supabase/schema.sql`. Existing v5 installs should keep their prior schema and migrations. Deploy the updated project to your linked GitHub/Vercel repository, retaining the same environment variables in `.env.example`. The 100 MB ZIP is processed locally, so there is no server upload size setting to increase. Server API requests and signed-in AI features require the existing environment configuration.

### Verification

Run `npm run check` to validate JavaScript syntax and unit tests. See `qa/VALIDATION_v6.md` for performed tests and limitations. The recorded screenshots from `docs/screens/` are **static HTML/CSS layout previews**, not a real authenticated runtime/browser end-to-end test. The live Supabase/AI integration needs to be verified after deployment.

## v7 changes
- Selects are searchable comboboxes (`js/combobox.js`); the hidden native `<select>` stays the source of truth.
- Slop Rater score is density-based (no longer saturates), skips tests/docs/markdown, rule definitions, negated mentions and CSS chevrons.
- Local enhancer reads the task (fix, build, review, refactor, explain, write): intent-specific "Done when", "Limits you stated" from your own sentences, and "Resolve first" for what is missing. Local output is deterministic and instant by design; only the optional AI rewrite is a model call.
- 8 new styles: Raw Web Brutalism, Organic Earth, Risograph Print, Data Instrument Panel (websites); Native iOS, Material 3, Dense Utility, Game HUD (apps). 22 original styles + 8 + "No style" = 31 entries.
- v7.1: the local enhancer now rewrites the request (`js/rewrite.js`): fixes spelling and contractions, normalises tech-name casing, removes filler, turns "can you / I want you to" into direct instructions, splits run-ons. Links, files, quoted names, colours, numbers and sizes are locked and restored exactly; if anything would be lost it falls back to your original text and says so. The prompt header is now REQUEST (CLEANED).
- v7.2: vocabulary expanded (`js/vocabulary.js`): 89 named-pattern entries (layout, type, colour, brand, motion, access, native app, prompt structure, engineering) on top of the 13 originals. Built on the "name it, don't describe it" principle of achref.dev/keywords.pdf; all wording is original. Negated phrases ("no gradients") are never turned into the opposite; web, app and code entries route to the right requests; detail level caps how many are added (4, 8, 14).
