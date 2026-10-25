# ATLAS v6 verification report

- **PASSED:** `npm run check` — Node syntax checks and **38 passing unit/regression tests** (see command output at release time).
- **PASSED:** ZIP parser handles stored and native deflate entries, skips directory traversal, rejects corrupt/oversized ZIPs, filters `.env` content from reported excerpts, and produces specific evidence references.
- **PASSED:** Existing platform/model/style combinations and context preservation checks.
- **PASSED:** Local scan of the actual previous ATLAS v5 project ZIP, with source-file findings and confidence displayed. This is not a visual quality assertion.
- **PASSED (static layout only):** Chromium layout previews created at 320, 390, 768 and 1366 pixels using `page.set_content()` with locally inlined CSS. No horizontal overflow. Screenshots in `docs/screens/` are static previews with placeholder audit values, not evidence that the interactive app ran successfully.
- **BLOCKED:** Complete browser end-to-end route test due to this environment's `net::ERR_BLOCKED_BY_ADMINISTRATOR` on localhost navigation.
- **NOT RUN:** Live Supabase session/Storage, Vercel deployment, actual OpenAI API text/vision requests, device-based usability tests; provider mocks only.

## How to validate after deployment

1. Generate and copy a local prompt for at least two destination models; confirm no console errors.
2. Attach a real `context.md`, regenerate the prompt and verify that project terminology and constraints appear; clear the attachment and confirm it disappears.
3. Upload a <=100 MB ordinary ZIP containing web/Android UI source. Confirm extracted source file references, source risk, downloadable report, explicit limitations and repair prompt.
4. Try a >100 MB ZIP and invalid/non-ZIP files; verify rejection without uploading.
5. Leave the AI-used selection as Unknown; confirm assessment still runs and does not make authorship claims.
6. If AI service is configured, sign in and try optional AI critique first without a screenshot, then with a screenshot; confirm consent and separate subjective visual rating. Verify quota and error handling.
7. Save a repair prompt; reopen it from Supabase History after refresh, then delete it. Check another account cannot read it.
8. Check real UI at 320/390/768/1366px, enlarged text, keyboard focus, reduced motion, long file names and slow networks.
