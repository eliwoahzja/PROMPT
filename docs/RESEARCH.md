## Hallmark v2 update (25 October 2026)

The user supplied the AI Toolfinder guide in full. We verified `Nutlope/hallmark` v2 at the official GitHub SKILL.md, along with its quality gates and redesign rules. See `docs/HALLMARK_INTEGRATION.md`. ATLAS adapts the inspection and anti-template principles into original prompt instructions; the skill is not installed or executed in the web app.

# Research notes

Sources were opened and read on **2026-10-25**. Vendors change docs often; re-check before relying on any template after that date.

## How each tool template was built

| Tool | Evidence | What the template uses | Source |
|---|---|---|---|
| ChatGPT | Official guide | Sectioned (XML-tag) prompt, explicit length and scope limits, simplest valid reading when ambiguous, no conflicting instructions | OpenAI GPT-5.2 Prompting Guide (Dec 2025) |
| Codex | Official guide | "Less is more": minimal prompt, only essential guidance, a way to verify | OpenAI GPT-5-Codex Prompting Guide (Sep 2025) |
| Cursor | Official guide | Plan first for multi-file work, let the agent search for context, verifiable goals (tests, types, linters), focused rules | Cursor blog "Best practices for coding with agents" (Jan 2026); Cursor docs: Rules |
| Lovable | Official docs | One feature/component per prompt, name page and behavior, say what must not change, state stack explicitly, ask when scope is unclear | Lovable docs: Prompting; Best practices |
| Kilo AI | Official docs | Be specific, plan then execute then review, concise standing instructions, AGENTS.md; "Fix everything" is the documented bad prompt | Kilo docs: Prompt engineering; Using agents and modes |
| FreeBuff | **No official prompting guide found** | Built on Codebuff's multi-agent flow (file picker, planner, editor, reviewer), so the template names files, order and a checkable finish | FreeBuff README |
| MiMo 2.6 Flash | Vendor docs only | Numbered requirements, exact deliverable (general practice, not a MiMo finding). Deep thinking is an API setting, on by default | MiMo docs: Deep thinking; MiMo-V2-Flash model card |
| DeepSeek | Vendor docs only | Plain task, limits, format. Current API models are V4 Flash and V4 Pro with thinking on by default | DeepSeek API docs: Thinking mode; Chat completions |
| Z.ai / GLM-5.3-Flash | Official model/UI-coding guidance | Numbered acceptance criteria are an ATLAS readability choice, not a vendor-imposed syntax. Source inspection and render/compare/revise loops follow Z.ai’s published examples. Thinking required; reasoning effort is an API setting | Official GLM-5.3-Flash guide; Deep Thinking; Release notes |

### Things found that change common advice
- **DeepSeek R1-era tips are out of date.** Guides that say "no system prompt, no few-shot examples" were written for R1. A source reviewed for this project reports `deepseek-reasoner` was retired on 2026-07-24 and V4 replaced it. DeepSeek's own API docs list only V4 Flash and V4 Pro. ATLAS does not apply R1 rules.
- **MiMo-V2.6-Flash**: thinking is on by default and, while it is on, custom `temperature`/`top_p` are not honored (per Xiaomi's docs). Third-party reports say some agent frameworks mishandle `reasoning_content` in multi-turn tool use; that is a report, not a vendor statement.
- **Codex** guidance is to keep prompts short, so ATLAS warns when you combine Codex with Detailed.
- **Kilo**: the dedicated Orchestrator agent is documented as deprecated; the template does not tell you to use it.

## How to write a good prompt (what the engine encodes)
From Professor Glitch's five patterns (read in full): who it is, what it never does, how to use tools/check, how to format, when to stop and ask. ATLAS maps these to Scope, Never, Verify, Output and "If something is missing". From Anthropic's prompting docs: be clear and direct, separate instructions from context, use tags for complex prompts. From OpenAI's GPT-5.2 guide: state limits on length and scope, avoid contradictions.

## What makes a UI look AI-made (what the design rules encode)
- Measured: a 500-page Show HN audit found the same tells repeatedly: uppercase hero badge above the H1, cards with a coloured top-border stripe, icon-topped feature-card grids, gradient backgrounds with glass cards.
- Cataloged by designers/tools: purple-to-blue gradient hero, gradient-clipped headline text, Inter everywhere, 3-column feature grid, mixed icon sets, coloured left-border cards, glow blobs, fake logos and statistics.
- Why it matters: models fill every decision you did not make with the most common answer, so the fix is naming decisions (style, type, one accent, one radius, one primary action), not adding adjectives.
- Source for the 22 styles and the brief order (idea, layout, type, colour, surfaces, images, motion, phone, never, check): achref.dev/resources/style-prompts. Source for "name it, do not describe it": achref.dev/keywords.pdf (40 keywords). ATLAS uses the style names and the brief order; **all wording is original**.
- The APEX design skill's rules (plan block before code, one memorable move, 37 slop gates) are compiled into the Design section.

## Not verified
- **find-skills (Vercel Labs)** is a tool for discovering agent skills and runs in a coding agent. It cannot run inside this web page, so ATLAS does not call it. It was not run for this release.
- Prompt quality was **not benchmarked** against live models. Templates follow vendor guidance; they are not measured results.
- The Ponytail repository was not opened this session; ATLAS cites it only for the "simplest complete solution" idea already present in the project.

## Z.ai model and skill follow-up (2026-10-25)

See `docs/ZAI_RESEARCH.md` for model identity, capabilities, source links, prompt template rationale, and what remains unverified. The user-supplied AI Toolfinder URL could not be resolved using available retrieval methods. Its contents and licensing are **unverified**, so it has not been copied, installed or executed.
