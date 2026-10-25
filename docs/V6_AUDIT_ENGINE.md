# ATLAS v6: Slop Rater engineering notes

## Architecture

- ZIP handling is local to the user's browser. The ZIP's end-of-central-directory listing is read using byte-range Blob slices. Individual source files are selectively decompressed with native `DecompressionStream('deflate-raw')` or read as stored entries. There is no direct-to-Vercel upload of the project ZIP.
- Defensive limits: ZIP 100 MiB; 18,000 directory entries; central directory <=12 MiB; scan at most 200 relevant UI files (each <=160 KiB, with a cumulative 6 MiB source budget); skip encrypted, traversal and secret-like paths and vendor/build folders; do not execute archived code.
- Source patterns are heuristics, not deterministic proof of design quality or AI authorship. The reviewer may flag a justified gradient or a word in sample/mock content. Every finding includes a source location so a human agent can confirm and critique it. Missing focus/motion/responsiveness markers are a prompt to verify manually, not automatic defects.
- An optional authenticated Vercel endpoint accepts only compact findings and an optional single screenshot. The server rechecks authentication, daily quota and size/type restrictions, and sends a constrained critique task to the selected **server-side provider model**. The target model shown in the UI determines how the *repair prompt* is structured, and does not control which model is used to perform the optional critique.
- Uploaded `context.md` is local Markdown content; it is limited to a bounded excerpt and is not automatically persisted. Both workspaces consume the same excerpt. On an explicitly requested AI action, the user is warned that relevant excerpts are sent to the AI provider.
- Supabase history stores the **generated text** under the user's existing RLS-protected `prompts` table. Original app ZIP and Markdown files are not stored.

## Rating interpretation

The 0-100 code-based number is a reproducible, rule-weighted risk index derived from matching CSS/JS/HTML, frameworks and supported view/controller code. It is NOT a scientifically validated aesthetic metric. Positive or negative assessment of screenshots must use actual images and a vision-capable model; that subjective second opinion is displayed separately. Claims about functionality and visual appearance need runtime evidence.

## Limits and compatibility

- Standard ZIP files using stored or DEFLATE compression only. ZIP64/multi-volume/encrypted archives not supported. Unsupported entry formats are skipped.
- Some browsers/platforms may not support `deflate-raw`; ZIP scanning then reports fewer source files. Reduced coverage lowers confidence.
- No malware scanning or sandbox execution is performed. Files remain on the local user's device, but the app is not a malware analysis product.
- The 100 MB limit applies to each ZIP archive, not screenshot/context or AI request payloads. This is appropriate because Vercel functions cannot accept a full 100 MB POST body.
- An AI rewrite or AI audit consumes the existing per-user daily quota and may incur provider charges.

## Design

Two workspaces, not another card-based feature grid. The existing ATLAS print-editorial identity remains: typography first, one signal-orange action, measured spacing, hard-edge controls and no decorative gradients. The review report's prominent visual anchor is the source-risk figure and its evidence list, not abstract AI imagery.
