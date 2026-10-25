# ATLAS v5 — Target-specific model research
Checked: **October 26, 2026**. This file records primary sources and ATLAS's editorial decisions separately. Target selection optimizes a prompt; it does not set the backend rewrite provider model.

| Target | Verified official identifier | Official findings | ATLAS template decision (not a vendor requirement) |
|---|---|---|---|
| GPT-6 in ChatGPT | No independent `gpt-6` API identifier verified | GPT-6 rolled out to ChatGPT with Intelligent UI on October 7 | XML-style sections to separate instructions, not required by GPT-6 |
| GPT-6 Astra | `gpt-6-astra` | Flagship for complex reasoning, coding and tool-supported tasks; reasoning low/medium/high/xhigh/max | Concise objective/context/evidence/verification |
| GPT-6.1 Sol | `gpt-6.1-sol` | Newer Sol, low/medium/high/xhigh/max; no `none`; Responses API for tools | Explicit acceptance and tested output |
| GPT-6 Sol | `gpt-6-sol` | Previous Sol, includes `none` reasoning; agentic coding | Compact file/behavior/verification brief |
| GPT-6 Luna | `gpt-6-luna` | Efficiency-oriented model; supports `none` reasoning | Numbered focused steps; no invented ideal word count |
| DeepSeek-V4.1-Flash-1017 | `deepseek-flash` | Oct 17 revision; vision, JSON, tools; thinking/non-thinking via API | Plain short numbered instructions |

## Primary sources
- OpenAI: [GPT-6 and Intelligent UI for everyone](https://openai.com/index/gpt-6-for-everyone/) — Oct 7, 2026 release.
- OpenAI: [Using GPT-6](https://developers.openai.com/api/docs/guides/latest-model) — family positioning and differences in reasoning settings.
- OpenAI: [GPT-6 Astra](https://developers.openai.com/api/docs/models/gpt-6-astra) — flagship API ID and reasoning options.
- OpenAI: [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol) — updated Sol model, tool use and reasoning options.
- OpenAI: [GPT-6 Sol](https://developers.openai.com/api/docs/models/gpt-6-sol) — earlier Sol model.
- OpenAI: [OpenAI API model catalog](https://developers.openai.com/api/docs/models) — Luna and API family listing.
- DeepSeek: [Change log](https://api-docs.deepseek.com/updates/) — Oct 17 `DeepSeek-V4.1-Flash-1017` release.
- DeepSeek: [Models and pricing](https://api-docs.deepseek.com/quick_start/pricing/) — `deepseek-flash` mapping and supported features.

## Verified versus not verified
- **Verified:** the product/model names, API IDs above, family position, listed reasoning configurations and date of DeepSeek revision.
- **Not verified:** vendor-required XML, Markdown, or numbered prompt syntax for these models; any model-specific ideal prompt length; that every ChatGPT account exposes every model; claims of one-shot prompt success rates; account-level API access.
- **ATLAS adaptation:** target-tailored workflow sentences, labels and output format. These reflect task design rather than vendor-prescribed magic syntax.

## Operational distinction
1. Target selector changes the generated prompt's instructions and output format.
2. The authenticated AI rewrite is performed by the separate server-side `OPENAI_MODEL` in Vercel.
3. Reasoning effort, provider, tools and model IDs are API/client configuration; merely writing them in a prompt does not switch the active model.
4. Selecting DeepSeek's October 17 revision does not pin a permanent snapshot; the `deepseek-flash` alias can advance when the provider updates it.
