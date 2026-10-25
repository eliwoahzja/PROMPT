# ATLAS v5 validation — October 26, 2026

## Results
- **PASSED:** Node `npm test` — 30 tests, 0 failures. Includes 15 target profiles × 23 style selections × 3 detail settings = **1,035** deterministic generation cases.
- **PASSED:** Source-level model profile checks for distinct GPT-6 IDs and the DeepSeek 1017 alias.
- **PASSED:** Mock API rewrite route tests with the added model destinations.
- **PASSED:** Static UI registry and Supabase schema/migration whitelist checks, including 15 unique supported targets.
- **PASSED:** `node --check` across application JavaScript and serverless API modules.
- **PASSED:** Static HTML parse / duplicate-ID check and CSS parser.
- **BLOCKED:** Browser smoke test (`tests/visual_smoke.py`). Chromium returned `ERR_BLOCKED_BY_ADMINISTRATOR` when navigating to `http://127.0.0.1` in this environment. No v5 screenshot or actual visual/browser interaction pass is claimed.
- **NOT TESTED:** Real provider inference, live deployed Vercel API, live Supabase persistence and SQL migration execution.

## Changes
1. Added GPT-6 (ChatGPT), GPT-6 Astra, GPT-6.1 Sol, GPT-6 Sol, GPT-6 Luna, DeepSeek V4.1 Flash (10/17).
2. Added evidence labels, live source links, and documented distinctions between GPT-6 family IDs, reasoning settings, and DeepSeek version alias.
3. Replaced nine radio-card buttons with one grouped native select to avoid pushing the prompt editor far below the fold on small screens.
4. Updated Supabase SQL target constraint for new installs and provided an additive migration for existing databases.
5. Preserved prior nine profile IDs, styles, Hallmark review mode, RLS, save/history behavior and separate AI rewrite configuration.

## Deployment check
1. Apply `supabase/migrations/20261026_add_specific_models.sql` on existing Supabase projects (fresh installations should use current `supabase/schema.sql`).
2. Deploy full project to Vercel.
3. At 320px, 390px, 768px and desktop widths: test selector, generation, copying, account settings and history restore.
4. Verify a saved new target loads without an invalid-value error.
5. Test genuine AI rewrite with a configured provider and sign-in. The selected **destination model** does not change the backend OpenAI `OPENAI_MODEL`.
