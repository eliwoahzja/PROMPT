# Hallmark v2 integration — ATLAS v4

Research checked: 25 October 2026. Source of truth: the official [Nutlope/hallmark repository](https://github.com/Nutlope/hallmark) and [v2 SKILL.md](https://github.com/Nutlope/hallmark/blob/main/skills/hallmark/SKILL.md).

## What the user's guide says versus what we verified

The supplied AI Toolfinder page identifies Hallmark v2, the global install command `npx skills add nutlope/hallmark -g`, an audit-only action, a redesign action, non-invented metrics, anti-template rules, and checking actual browser widths. We verified the skill's **2.0.0** version and rules at its canonical GitHub source. The guide describes 48 themes; theme counts can change and are **not** embedded as hardcoded product promises in ATLAS.

Official sources:
- [SKILL.md](https://github.com/Nutlope/hallmark/blob/main/skills/hallmark/SKILL.md): required design floor, scoped default behavior, pre-flight inspection, theme/genre selection.
- [gates.md](https://github.com/Nutlope/hallmark/blob/main/skills/hallmark/references/gates.md): actionable anti-pattern checks, distinctions between mandatory and contextual quality rules.
- [redesign.md](https://github.com/Nutlope/hallmark/blob/main/skills/hallmark/references/redesign.md): preserving product structure and working content.
- [User-provided setup guide](https://ai-toolfinder.com/get/uqvuv8skett7if7d): terminal command and use cases (secondary source).

## How ATLAS applies the research

- Adds an **Independent design review** checkbox, checked by default. It applies only to UI and visual prompts, including when a style has been selected.
- The self-contained output block makes downstream models inspect the actual product, choose a content-appropriate genre, establish visual tokens, avoid invented content, test responsive states and independently critique the result.
- The rewrite endpoint passes the opt-in to its generator and refuses an AI rewrite that drops review instructions. The fallback is the verified local draft.
- Supabase persists the selected option in both saved prompt history and preferred user settings after the additive schema migration.
- Existing 22 original ATLAS visual styles are unchanged. This is a behavior option, **not** a new style or a Hallmark theme download.

## Boundaries

Hallmark is a **third-party skill**, not executable inside a static HTML prompt builder. ATLAS does **not** invoke `/hallmark`, install npm packages, run `sloplint.mjs`, open Chrome, or create screenshots merely because the checkbox is on. Those require an appropriately configured coding agent, installed skill and relevant permissions. ATLAS generates independently authored design-review *instructions* inspired by verified public principles; it does not copy Hallmark's SKILL.md into its own code.

If you want the actual Hallmark skill in your local coding agent, use the official installation documentation separately. The command from the user guide is:

```sh
npx skills add nutlope/hallmark -g
```

Only run external install commands on devices/environments you control and trust. Inspect the repository first, keep credentials out of the command and don't allow it to modify an active project without a backup.

## Migrating an existing Supabase project

After deploying v4, run `supabase/migrations/20261025_add_hallmark_review.sql` once. It only adds two boolean columns; existing prompt records remain intact and receive `hallmark=false` so old prompts are not incorrectly labelled reviewed. Fresh installs can use `supabase/schema.sql` directly.

## Test contract

Run `npm run check`. The tests cover UI/non-UI prompts, enabled/disabled modes, every target and style combination, user-token preservation, AI fallback, and syntax. Successful tests mean the generated *text* contains these rules; they do not mean any downstream site has been visually inspected or improved.
