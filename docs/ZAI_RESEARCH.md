# Z.ai / GLM-5.3-Flash — source-verified research

Checked **2026-10-25** against official Z.ai documentation.

## Verified

- Provider: Z.ai. Target model code: **`glm-5.3-flash`**. FlashX is a related distinct variant (`glm-5.3-flashx`); it is not the target selected by this app.
- Official model overview describes image, video, text and file input; text output, tool calls, structured output and a 1M-token context. These are provider capabilities, **not** claims that ATLAS uploads those modalities.
- Published best-practice for visual frontend coding: supply reference screenshots or URLs; inspect the design system, shared components, interaction states and animations; build; render; compare reference images; revise specific differences. This applies **only when the receiving environment can open sources and run/render the project**.
- GLM-5.3-Flash requires thinking enabled. Z.ai documents `reasoning_effort` = `max`, `high`, `low`; the model guide recommends `max`. These are API configuration settings and are not controlled by prompt text.
- The model is suitable for coding and multimodal tasks, but benchmark scores in marketing material are not performance guarantees for user requests.

## Unverified / not claimed

- No universal mandatory XML, Markdown or numbered-list prompt syntax was established by the reviewed vendor documentation. ATLAS uses concise numbered working steps for readability.
- No empirically optimal prompt length was published or benchmarked for this project's enhancement tasks.
- This project has not run live comparative evaluations on GLM-5.3-Flash. The model selector builds a target-specific *prompt*; the server-based AI rewriter is a separately configured OpenAI model.
- No live model API calls were made with the user's account.

## Official sources

1. https://docs.z.ai/guides/vlm/glm-5.3-flash
2. https://docs.z.ai/guides/capabilities/thinking
3. https://docs.z.ai/release-notes/new-released

## User-provided external skill link

https://ai-toolfinder.com/get/uqvuv8skett7if7d could not be retrieved as a verifiable original skill document. No claim is made about what it is or what rules it contains. It was **not executed, copied, installed or added to the prompt engine**. To review this skill, provide its original repository page or SKILL.md file and verify licensing before reuse.
