# ATLAS — Research and evidence notes

Reviewed: 2026-10-25. Sources are linked inline. This is a product design memo, not a benchmark.

## 1. Prompt design principles

[AskGlitch](https://www.askglitch.com/guides/system-prompt-examples) explains the difference between system-level instructions and user messages through recurring practical concepts: role, hard constraints, tools, output expectations and when to seek clarification. We derive our own plain-language task template from these ideas; no source prompt is copied.

**Common source-independent core:** objective; context the model actually has; constraints (including preservation); actionable steps where useful; output format; evidence/truthfulness requirements. Avoid mandatory plans for trivial requests, fake assurance, and demands for hidden reasoning.

**Length:** There is no verified universal optimum prompt length across these six choices. ATLAS offers concise / balanced / detailed user settings rather than claiming a magic token count.

## 2. Target-specific configurations

| Target | Category | Recommended structure | Verified and limitations |
|---|---|---|---|
| FreeBuff | Coding agent, environment may vary | State repo, file access, the change, restrictions, concrete tests and deliverable | [Official FreeBuff product](https://freebuff.com/) demonstrates coding agent execution; exact priority of system/user instruction is unverified for the user-selected FreeBuff model. |
| ChatGPT | Application using selectable OpenAI models | Clear objective, context, critical constraints, expected result | [OpenAI prompt practices](https://platform.openai.com/docs/guides/prompt-engineering) differ across models; exact ideal length unverified. |
| Kilo AI | Coding-agent platform; provider/model selectable | Repository scope, AGENTS.md, allowed edits, verification | [Kilo AGENTS.md](https://kilo.ai/docs/customize/agents-md), [custom models](https://kilo.ai/docs/code-with-ai/agents/custom-models). Underlying model varies; no universal Kilo syntax. |
| Codex | Repository coding agent | One focused implementation request + repo instructions, narrow tests, evidence report | [OpenAI Codex prompting guide](https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide), [skills instruction optimization](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra). Avoid redundant boilerplate. |
| MiMo 2.6 Flash | Model family | Explicit task, numbered conditions, specified deliverable; avoid phantom tool claims | The official [MiMo model release notes](https://mimo.mi.com/docs/en-US/updates/model) identify API model `mimo-v2.6-flash`; preferred XML syntax and ideal prompt length remain **unverified**. |
| DeepSeek | Model family/API; Flash and Pro are distinct | Task + input + constraints + output; don't conflate thinking API mode and prompt wording | [Official DeepSeek updates](https://api-docs.deepseek.com/updates/) document `deepseek-flash` and reasoning mode; exact ideal prompt length and XML superiority **unverified**. |

Where the agent platform matters more than the base model, ATLAS prioritizes the *workflow*: inspect evidence, work in source when available, preserve behavior, verify and report.

## 3. Skills / practices selected

The [Vercel Labs skills CLI](https://github.com/vercel-labs/skills) offers `npx skills find <query>` and `npx skills use <source>@<skill>`; it is a skill discovery/invocation utility, **not** a JavaScript prompt rewrite API. Our application uses the documented concepts; it does not pretend that its browser executes Vercel skills.

- **find-skills** (Vercel Labs CLI workflow): relevant to discovering new skills; studied as a discovery workflow, not executed as a CLI in this environment or embedded into runtime.
- **web-design-guidelines** ([Vercel Labs](https://github.com/vercel-labs/web-interface-guidelines)): clear component states, keyboard support, error copy and interaction quality; informs ATLAS interface and generated UI acceptance criteria.
- **frontend-design** ([reference](https://github.com/vercel-labs/agent-eval/blob/main/packages/playground/.agents/skills/frontend-design/SKILL.md)): deliberate creative direction, cohesive typography and context-specific composition; informs generated design briefs.
- **ponytail** ([DietrichGebert](https://github.com/DietrichGebert/ponytail)): minimal complete diff and YAGNI; informs restraint and review instructions.

No external skill was installed or executed as a plugin inside the running page. We do not claim otherwise.

## 4. AI-slop research

[Achref's style prompts](https://www.achref.dev/resources/style-prompts) enumerate **22** named aesthetic families. We kept the style taxonomy but wrote our own implementation briefs in `js/data.js`. The source uses audience/action, one visual idea, layout, type, palette, surfaces, motion, mobile and exclusions. ATLAS derives an original optional design brief with those roles.

[40 Keywords](https://www.achref.dev/keywords.pdf) advises replacing broad adjectives with operational requirements. Our default UI rules include one primary action per view, 390px-first mobile adaptation, long-text wrapping, accessible focus, reduced-motion support and domain-specific copy. Exact colors and fonts should fit the actual client, not be fixed across all outputs.

Signals of weak UI: repeated same-radius cards, decorative gradients and glows, anonymous typography, meaningless micro-labels, centered long copy, unrelated illustration, stock social proof, missing data and error states. Expert critique asks what each element does and removes anything that does not help. Usability acceptance tests matter more than a subjective score.

## 5. Honest boundaries

- Target selection changes the destination prompt format, **not** which provider answers it.
- Local composer creates deterministic structure and can run without secrets. It is not a semantic AI model.
- Optional authenticated AI rewrite uses a separately configured OpenAI Responses API model server-side.
- Draft quality may differ by task and no cross-model prompt efficacy benchmark has been performed.
- Live GitHub pushing, Vercel deployment, and Supabase data operations must be done in the user’s accounts; building project files does not equal deployment.
