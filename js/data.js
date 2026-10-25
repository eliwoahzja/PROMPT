// ATLAS data layer.
// Every target carries the sources it was written from and an honest evidence label:
//   'official' = the vendor publishes prompting guidance for this product/model
//   'docs'     = the vendor publishes product docs, but no dedicated prompting guide
//   'none'     = no vendor guidance found; the template uses general agent practice only
// Source checks were last run on CHECKED_ON. Re-check before relying on them after that date.
export const CHECKED_ON = '2026-10-26';

export const targets = [
  { id:'freebuff', label:'FreeBuff', tag:'Terminal coding agent', kind:'agent', layout:'plain',
    evidence:'none',
    evidenceNote:'No official prompting guide found. FreeBuff is the free tier of Codebuff and splits work across file-picker, planner, editor and reviewer agents, so the template names files, order and a checkable finish line.',
    note:'Name the files, the order of work and how to check it. Small, concrete tasks suit a multi-agent loop.',
    sources:[{label:'FreeBuff README (CodebuffAI)',url:'https://github.com/CodebuffAI/freebuff'}],
    how:[
      'Find the files that matter first, then plan the order of edits, then edit, then review the diff.',
      'Work on one task at a time. Finish and check it before starting the next.',
      'If a knowledge.md or similar project notes file exists, read it before editing.'
    ],
    format:'Reply with the changed file paths, a short summary per file, and the result of any check you actually ran.' },

  { id:'chatgpt', label:'ChatGPT', tag:'General assistant', kind:'chat', layout:'xml',
    evidence:'official',
    evidenceNote:'Based on OpenAI\u2019s GPT-5.2 prompting guide: sectioned prompts, explicit length and scope limits, no contradicting instructions, a stated output format.',
    note:'Give one task, hard limits on length and scope, and the exact output shape.',
    sources:[{label:'OpenAI GPT-5.2 Prompting Guide (Dec 2025)',url:'https://developers.openai.com/cookbook/examples/gpt-5/gpt-5-2_prompting_guide'}],
    how:[
      'Do exactly what the request says. Do not add features, sections or styling that were not asked for.',
      'If two readings are possible, take the simplest valid one and say which you took.',
      'Separate what the request states from what you are assuming.'
    ],
    format:'Lead with the deliverable. Keep prose short and use bullets only where they help. Do not restate the request.' },

  { id:'kilo', label:'Kilo AI', tag:'Coding agent (VS Code / CLI)', kind:'agent', layout:'plain',
    evidence:'official',
    evidenceNote:'Based on Kilo\u2019s prompt-engineering page and agent docs: be specific, plan then execute then review, keep instructions short, use AGENTS.md for standing rules.',
    note:'Pick the agent for the job (plan, code, debug, ask). Say what to change, what not to touch, and how to check.',
    sources:[
      {label:'Kilo: Prompt engineering',url:'https://kilo.ai/docs/customize/prompt-engineering'},
      {label:'Kilo: Using agents and modes',url:'https://kilo.ai/docs/basic-usage/using-modes'}],
    how:[
      'Read AGENTS.md and any project rules before editing.',
      'Plan the change in a few lines, then make it one step at a time, then review each step before the next.',
      'Edit real files. Keep existing interfaces and behavior unless the request says to change them.'
    ],
    format:'End with: files changed, what was verified, what is still open.' },

  { id:'codex', label:'Codex', tag:'Coding agent (CLI / IDE / cloud)', kind:'agent', layout:'plain',
    evidence:'official',
    evidenceNote:'Based on OpenAI\u2019s Codex prompting guide: less is more. Start minimal, add only essential guidance, and give a way to verify the work.',
    note:'Keep it short: the goal, the context it cannot discover, the limits, and what \u201cdone\u201d means.',
    sources:[{label:'OpenAI GPT-5-Codex Prompting Guide',url:'https://cookbook.openai.com/examples/gpt-5-codex_prompting_guide'}],
    how:[
      'Read the repo instructions (AGENTS.md) and the relevant code. Do not ask for files you can open.',
      'Make a focused change. Run the narrowest check that proves it.'
    ],
    format:'Report changed paths, the check you ran and its result, and anything left undone. No long checklist.' },

  { id:'cursor', label:'Cursor', tag:'AI code editor (Agent / Plan)', kind:'agent', layout:'plain',
    evidence:'official',
    evidenceNote:'Based on Cursor\u2019s agent best-practices post and rules docs: plan first for multi-file work, let the agent find context, give verifiable goals (tests, types, linters).',
    note:'Use Plan mode for anything bigger than one file. Do not tag every file; let the agent search. Give a check it can run.',
    sources:[
      {label:'Cursor: Best practices for coding with agents (Jan 2026)',url:'https://cursor.com/blog/agent-best-practices'},
      {label:'Cursor docs: Rules',url:'https://docs.cursor.com/en/context/rules'}],
    how:[
      'Search the codebase for the files and patterns involved before editing. Follow the conventions you find.',
      'For work touching more than one file, write a short plan first and wait for approval.',
      'Use the project\u2019s own tests, type checker and linter as the pass/fail signal.'
    ],
    format:'Show the plan first when the change spans several files. After editing, list changed files and check results.' },

  { id:'lovable', label:'Lovable', tag:'App builder (React + Supabase)', kind:'builder', layout:'plain',
    evidence:'official',
    evidenceNote:'Based on Lovable\u2019s prompting docs: one feature or component per prompt, name the page and expected behavior, say what must not change, state the stack explicitly, connect Supabase after the front end is stable.',
    note:'One feature or component per prompt. Name the page, the behavior, and what must stay untouched.',
    sources:[
      {label:'Lovable docs: Prompting',url:'https://docs.lovable.dev/prompting/prompting-one'},
      {label:'Lovable docs: Best practices',url:'https://docs.lovable.dev/tips-tricks/best-practice'}],
    how:[
      'Build only the one feature or component described. Do not touch other pages, shared layout or unrelated logic unless it is required.',
      'Name the page or route you are changing and describe the expected behavior before writing code.',
      'If a service such as Supabase is needed, use it only where the request says so.',
      'If the scope is unclear, ask before building.'
    ],
    format:'Build it, then give a short list of what changed and what to test in the preview.' },

  { id:'mimo', label:'MiMo 2.6 Flash', tag:'Xiaomi MiMo-V2.6-Flash', kind:'model', layout:'numbered',
    evidence:'docs',
    evidenceNote:'Xiaomi documents deep thinking (on by default) and its API parameters for MiMo-V2.6-Flash, but publishes no dedicated prompt-writing guide. The template uses numbered requirements and an exact deliverable, which is general practice, not a MiMo-specific finding.',
    note:'Numbered requirements and an exact deliverable. Deep thinking is a setting you control in the API, not in the prompt.',
    sources:[
      {label:'MiMo docs: Deep thinking',url:'https://mimo.mi.com/docs/en-US/quick-start/usage-guide/text-generation/deep-thinking'},
      {label:'MiMo-V2-Flash model card',url:'https://github.com/xiaomimimo/MiMo-V2-Flash'}],
    how:[
      'Follow the numbered requirements in order.',
      'Keep names, numbers and formats exactly as given.',
      'If a detail is missing, state one short assumption and continue.'
    ],
    format:'Produce the requested artifact itself, not a description of how to make it.' },

  { id:'zai', label:'Z.ai / GLM-5.3-Flash', tag:'GLM-5.3-Flash · multimodal model', kind:'model', layout:'numbered',
    evidence:'official',
    evidenceNote:'Z.ai documents glm-5.3-flash, native image/video/file input, tool calling and structured output. Its official visual-coding example asks for design-system inspection, implementation, rendering and screenshot comparison. Numbered steps are an ATLAS clarity choice; Z.ai does not mandate a unique prompt syntax. Thinking controls are API parameters, not prose commands.',
    note:'Give a concrete objective and acceptance criteria. For UI work, provide references if available, then request rendered comparison and revision when tools permit. GLM-5.3-Flash requires thinking enabled; reasoning effort is configured in the API, not the prompt.',
    sources:[
      {label:'Z.ai: GLM-5.3-Flash official model guide',url:'https://docs.z.ai/guides/vlm/glm-5.3-flash'},
      {label:'Z.ai: Deep Thinking and reasoning-effort parameters',url:'https://docs.z.ai/guides/capabilities/thinking'},
      {label:'Z.ai: GLM-5.3-Flash release notes',url:'https://docs.z.ai/release-notes/new-released'}],
    how:[
      'Identify the objective, exact input context, constraints and acceptance criteria before implementing. Preserve all supplied names and exclusions.',
      'For coding or UI tasks, inspect the available source files and reference images before editing. Explain only decisions grounded in what you actually inspected.',
      'Implement the requested result and, if preview or browser tools are available, render it, compare it against the reference, and correct concrete visual or functional differences.',
      'Use only tools actually available in this environment. Clearly label any build, screenshot comparison, API call, or verification that you could not perform.'
    ],
    format:'Deliver the requested artifact or answer first. If you made changes, report modified paths, actual checks and their results; identify blocked validation without claiming success.' },

  { id:'deepseek', label:'DeepSeek', tag:'DeepSeek V4 (Flash / Pro)', kind:'model', layout:'plain',
    evidence:'docs',
    evidenceNote:'DeepSeek\u2019s current API models are V4 Flash and V4 Pro with thinking on by default. It publishes no dedicated prompt-writing guide, and older R1-era advice (no system prompt, no examples) does not describe the current models. The template is a plain task, limits and format.',
    note:'Plain task, limits and format. Thinking mode is an API setting. Ignore R1-era tips; those models were retired in July 2026.',
    sources:[
      {label:'DeepSeek API: Thinking mode',url:'https://api-docs.deepseek.com/guides/thinking_mode/'},
      {label:'DeepSeek API: Chat completions',url:'https://api-docs.deepseek.com/api/create-chat-completion/'}],
    how:[
      'Use only the context given. Keep every constraint.',
      'Say which parts of your answer are verified and which are assumptions.',
      'Do not claim to have run code, opened files or searched the web unless you actually did.'
    ],
    format:'Give the final deliverable in the requested format. Keep any explanation short.' }
,
  // These are destinations for generated prompts, NOT models called by the
  // ATLAS rewriting endpoint. apiId documents an official provider identifier
  // where there is one. GPT-6 in ChatGPT has no documented standalone API ID.
  { id:'gpt6-chat', label:'GPT-6 (ChatGPT)', tag:'ChatGPT · Intelligent UI', kind:'model', layout:'xml',
    evidence:'official', apiId:null,
    evidenceNote:'OpenAI introduced GPT-6 to ChatGPT on October 7, 2026, including Intelligent UI responses. The ChatGPT-facing GPT-6 name is not documented as a standalone Responses API model ID. XML sections here are an ATLAS organizational choice, not a GPT-6 requirement.',
    note:'For GPT-6 in ChatGPT: request the direct answer and specify the desired format when it matters. Interactive visuals are optional and should serve the task, not be forced.',
    sources:[
      {label:'OpenAI: GPT-6 and Intelligent UI (Oct 7, 2026)',url:'https://openai.com/index/gpt-6-for-everyone/'},
      {label:'OpenAI: Using GPT-6 family',url:'https://developers.openai.com/api/docs/guides/latest-model'}],
    how:[
      'Prioritize the requested result and its required format; do not pad the reply with process narration.',
      'Use structured explanations, tables or interactive elements only when they make the task easier; do not force visual UI for a text-only request.',
      'Respect every supplied constraint and mark uncertain or unavailable facts rather than fabricating details.'
    ],
    format:'Deliver the answer or artifact directly. Include any qualification needed for accuracy, without unnecessary introductory text.' },

  { id:'gpt6-astra', label:'GPT-6 Astra', tag:'OpenAI · gpt-6-astra', kind:'model', layout:'plain',
    evidence:'official', apiId:'gpt-6-astra',
    evidenceNote:'OpenAI documents gpt-6-astra as its flagship for deep reasoning, coding, research and multi-step tool workflows. API reasoning effort is low/medium/high/xhigh/max (not none). The concise task/constraints/evidence framing is an ATLAS editorial choice, not a mandatory syntax.',
    note:'Best for multi-stage research or engineering. State the objective, the evidence to inspect, boundaries, and a verifiable deliverable. Higher reasoning effort is configured outside the prompt.',
    sources:[
      {label:'OpenAI: GPT-6 Astra API model',url:'https://developers.openai.com/api/docs/models/gpt-6-astra'},
      {label:'OpenAI: Using GPT-6',url:'https://developers.openai.com/api/docs/guides/latest-model'}],
    how:[
      'Understand the end result first. For complex tasks inspect provided evidence and relevant sources before making technical claims.',
      'Plan only as much as the task requires, execute available steps, then verify the outcome against the stated acceptance criteria.',
      'Use tools only if available and appropriate; distinguish completed actions, unverified assumptions and blockers without inventing results.'
    ],
    format:'Present the completed result first, followed by material evidence, verification and limitations only where necessary.' },

  { id:'gpt6-1-sol', label:'GPT-6.1 Sol', tag:'OpenAI · gpt-6.1-sol', kind:'model', layout:'plain',
    evidence:'official', apiId:'gpt-6.1-sol',
    evidenceNote:'OpenAI identifies GPT-6.1 Sol as the newer Sol version for complex coding and professional work at lower cost than Astra. API reasoning effort supports low/medium(default)/high/xhigh/max; none is unsupported. Tool calling uses Responses API. No exclusive markdown or XML syntax is required.',
    note:'Balanced multi-step work: define deliverable, constraints, available context, and verification. Do not confuse reasoning-effort API settings with prompt text.',
    sources:[
      {label:'OpenAI: GPT-6.1 Sol API model',url:'https://developers.openai.com/api/docs/models/gpt-6.1-sol'},
      {label:'OpenAI: GPT-6 family guidance',url:'https://developers.openai.com/api/docs/guides/latest-model'}],
    how:[
      'Translate the request into a concrete deliverable and preserve named constraints and files.',
      'When editing code, inspect the existing implementation, make a focused change and run the relevant checks when tools exist.',
      'Avoid verbose work logs and unsupported success claims; report only material verification findings.'
    ],
    format:'Return the requested output first; for engineering tasks include changed paths, verified checks and unresolved blockers.' },

  { id:'gpt6-sol', label:'GPT-6 Sol', tag:'OpenAI · gpt-6-sol', kind:'model', layout:'plain',
    evidence:'official', apiId:'gpt-6-sol',
    evidenceNote:'OpenAI lists GPT-6 Sol as the earlier Sol model for complex coding and agentic workflows. GPT-6.1 Sol is newer. GPT-6 Sol allows reasoning.effort none/low/medium(default)/high/xhigh/max; its tool support differs by endpoint and reasoning mode.',
    note:'Focused agentic work: state the files, expected behavior, boundaries and regression tests. Use the newer 6.1 Sol target when that is the model actually selected.',
    sources:[
      {label:'OpenAI: GPT-6 Sol API model',url:'https://developers.openai.com/api/docs/models/gpt-6-sol'},
      {label:'OpenAI: GPT-6.1 Sol update',url:'https://developers.openai.com/api/docs/models/gpt-6.1-sol'}],
    how:[
      'Inspect the relevant repository rules and source before changing code, if those files are accessible.',
      'Implement the specific requested change while preserving unrelated behavior.',
      'Run narrow, reproducible checks where available and describe any untested functionality accurately.'
    ],
    format:'Show the deliverable or patch, affected paths, concrete validation results, and any unfinished work.' },

  { id:'gpt6-luna', label:'GPT-6 Luna', tag:'OpenAI · gpt-6-luna', kind:'model', layout:'numbered',
    evidence:'official', apiId:'gpt-6-luna',
    evidenceNote:'OpenAI documents gpt-6-luna as the efficient GPT-6-family model for focused or repeatable tasks. API reasoning effort includes none as well as low/medium/high/xhigh/max. Numbered instructions are chosen for clarity, not an officially required syntax.',
    note:'Specify a narrowly scoped task, exact inputs, must-keep details and output format. Prefer short, unambiguous steps to oversized instructions.',
    sources:[
      {label:'OpenAI: GPT-6 Luna model catalogue',url:'https://developers.openai.com/api/docs/models'},
      {label:'OpenAI: Using GPT-6 family',url:'https://developers.openai.com/api/docs/guides/latest-model'}],
    how:[
      'Perform the single stated task without adding adjacent features or unrelated analysis.',
      'Preserve all exact names, numbers, formats and user exclusions.',
      'Return the requested output directly and flag any essential unknown in one sentence.'
    ],
    format:'Return the completed result in the requested shape. Keep explanations brief unless explicitly requested.' },

  { id:'deepseek-v4-1-flash-1017', label:'DeepSeek V4.1 Flash (10/17)', tag:'DeepSeek · deepseek-flash', kind:'model', layout:'numbered',
    evidence:'docs', apiId:'deepseek-flash',
    evidenceNote:'DeepSeek announced DeepSeek-V4.1-Flash-1017 on October 17, 2026. The public API alias remains deepseek-flash (not deepseek-v4.1-flash-1017). Docs list 1M context, vision, tool calling, JSON output, and thinking/non-thinking modes; the API config sets thinking mode. No special numbered prompt syntax was verified.',
    note:'Target the October 17 Flash revision through deepseek-flash. Keep instructions explicit, bounded, and output-oriented. Do not put a fake version ID in API calls.',
    sources:[
      {label:'DeepSeek official change log: 2026-10-17 update',url:'https://api-docs.deepseek.com/updates/'},
      {label:'DeepSeek API: current models and alias',url:'https://api-docs.deepseek.com/quick_start/pricing/'}],
    how:[
      'Identify the exact task, relevant input context, exclusions and required final artifact.',
      'Use provided information as evidence and do not invent facts, files, tool access or test results.',
      'For coding tasks, inspect and verify where tools permit; otherwise clearly mark the steps that remain untested.'
    ],
    format:'Produce the final deliverable without prefatory filler. For implementation work include actual checks and blocked verification.' }

];

// Structure of every style brief follows the same order a designer would brief in:
// idea, layout, type, colour, surfaces, motion, never, check.
// Names come from the style list on achref.dev; all wording below is original.
export const styles = [
  {id:'none',name:'No style',suitable:'Let the task decide'},
  {id:'neobrutalism',name:'Neo-Brutalism',suitable:'Creator tools, startups, anything that should feel direct',
    idea:'A sticker sheet taped to a wall: flat, loud, honest.',
    layout:'Visible blocky grid, left-aligned headline with one highlighted word, chunky tiles, stickers that stay inside the content width.',
    type:'Heavy grotesque for headings (Bricolage Grotesque 800 or Archivo Black), plain sans for body, mono only for code.',
    colour:'Paper background, pure black lines and text, one loud accent for the primary action, one highlight colour for selected states.',
    surfaces:'3px solid black borders, hard offset shadow (no blur) in one direction, radius 0\u20138px. Pressed state moves the element into its shadow.',
    motion:'One move: buttons and cards press in on click. Nothing else animates.',
    never:'Blurred shadows, gradients, 1px grey borders, glass, pastel tints.',
    check:'Every shadow has zero blur and the same offset. Border width is identical everywhere.'},
  {id:'claymorphism',name:'Claymorphism',suitable:'Friendly utilities, kids, wellness',
    idea:'Soft inflated clay you could press with a thumb.',
    layout:'A few large floating tiles with 32px+ gaps, one sculptural hero object.',
    type:'Rounded sans (Fredoka or Nunito), large and loose.',
    colour:'Chalk pastel base, three muted accents, plum-tinted text instead of black.',
    surfaces:'Radius 28\u201340px, one shared recipe: soft drop shadow plus inner highlight top-left and inner shade bottom-right. No borders.',
    motion:'One slow float on the hero object; buttons squash slightly on press.',
    never:'Glass, neon, hard black borders, flat tiles without the inner shading.',
    check:'All objects are lit from the same corner. Text on pastel still passes 4.5:1.'},
  {id:'cybercore',name:'Cybercore',suitable:'Tech launches, music, gaming gear',
    idea:'A 2001 vision of the future: chrome, glass, electric blue.',
    layout:'Deep field with one chrome hero object, thin wireframe grid behind, content in window-like panels.',
    type:'Wide display face in caps for headings, geometric sans for body, mono for data labels.',
    colour:'Navy base, electric blue, one cyan used only for highlights, cool chrome greys. No warm colours.',
    surfaces:'Glass panels with a 1px cyan edge, chrome pill buttons with a white top highlight.',
    motion:'One move: the chrome object turns slowly with scroll.',
    never:'Pastels, purple-to-pink gradients, rounded friendly fonts, glow on body text.',
    check:'Chrome reads as metal (light top, dark bottom). Caps are limited to headings and labels.'},
  {id:'scrapbook',name:'Scrapbook',suitable:'Stories, travel, events, food',
    idea:'A handmade page: prints, paper scraps and tape pinned slightly crooked.',
    layout:'Organic collage with a clear top-to-bottom reading path; small rotations (\u00b14\u00b0) per item.',
    type:'Display serif for headings, clean sans for body, handwriting only for short notes.',
    colour:'Warm paper, ink text, two tape colours, one accent for the main action.',
    surfaces:'White-bordered photo prints, torn-paper edges, tape strips, 5\u20136% paper grain.',
    motion:'Items drop in and settle once as they enter.',
    never:'Perfect alignment everywhere, glossy app chrome, gradients, handwriting for body text.',
    check:'Reading order is still obvious. Rotations never push content off a phone screen.'},
  {id:'surrealism',name:'Surrealism',suitable:'Art, fashion, releases, campaigns built on one image',
    idea:'One impossible but believable scene carries each screen.',
    layout:'Full-screen image as the stage, very little text placed in the calm area of the image, scenes instead of cards.',
    type:'Elegant italic serif for headings, small quiet sans for labels.',
    colour:'Pulled from the images; text colour chosen per scene for contrast.',
    surfaces:'Almost none. A hairline or a small pill button is enough.',
    motion:'Slow three-layer parallax; one floating object.',
    never:'Card rows, icon grids, stock illustrations, more than one impossible element per scene.',
    check:'Each scene has exactly one impossible element and text on it passes contrast.'},
  {id:'y2k',name:'Y2K Aesthetic',suitable:'Fashion, beauty, music, playful launches',
    idea:'The year-2000 internet: gloss, stickers, pop-up windows.',
    layout:'Big glossy headline, stickers around it, content in retro windows with title bars.',
    type:'Extra-bold display, friendly sans body, tiny pixel face for tags only.',
    colour:'Baby pink, baby blue, lilac, chrome, white. Iridescence on stickers only.',
    surfaces:'Glossy pill buttons with a highlight, window frames, white-outlined stickers.',
    motion:'Stickers twinkle in place; one marquee band.',
    never:'Muted earth tones, editorial serifs, iridescence behind body text.',
    check:'Stickers never cover a button. Body text is plain and readable.'},
  {id:'pixel',name:'Pixel Art',suitable:'Retro games, dev toys, hackathons',
    idea:'A menu screen from an 8-bit game.',
    layout:'8px grid, dialog boxes for headlines, stats as bars.',
    type:'Pixel face for headings only, readable mono for body.',
    colour:'One fixed palette of at most 16 colours; nothing outside it.',
    surfaces:'Square corners, 4px stepped borders, bevelled buttons, no blur.',
    motion:'One idle sprite loop in steps; text types in.',
    never:'Smooth-scaled pixels, gradients, rounded corners, pixel font for paragraphs.',
    check:'Sprites are scaled by whole numbers. Every colour is from the palette.'},
  {id:'synthwave',name:'Synthwave',suitable:'Music, events, nightlife',
    idea:'An 80s night drive: striped sun, glowing grid floor.',
    layout:'Hero scene with a horizon, headline above the sun, content on dark panels.',
    type:'Display face for the logo only, bold italic sans for headings, clean sans for body.',
    colour:'Midnight base, magenta, cyan, sunset gradient on the sun only.',
    surfaces:'Dark panels with a thin neon edge; glow only on edges and accents.',
    motion:'The grid floor scrolls towards the viewer.',
    never:'Light backgrounds, glow on paragraphs, more than two neon colours.',
    check:'Paragraphs have no glow and pass contrast. Grid motion stops under reduced motion.'},
  {id:'glassmorphism',name:'Glassmorphism',suitable:'Floating controls over rich colour',
    idea:'Frosted panels floating above vivid colour.',
    layout:'Colourful backdrop, two depth levels of glass at most.',
    type:'One clean sans in two weights.',
    colour:'Two or three vivid backdrop hues, panels as white at 12\u201320% fill, one action accent.',
    surfaces:'Backdrop blur with 1px light edge, radius 24px, solid fallback fill when blur is unsupported.',
    motion:'Slow background drift; panels tilt slightly towards the pointer.',
    never:'Glass on white, glass inside glass inside glass, text over busy areas without a stronger fill.',
    check:'Every text block on glass passes 4.5:1 and has a solid fallback.'},
  {id:'neumorphism',name:'Neumorphism',suitable:'Small tools, players, calculators',
    idea:'Controls moulded out of one soft surface.',
    layout:'Few large controls on one background colour, grouped on raised plates.',
    type:'One sans, darker than the style usually uses.',
    colour:'One surface colour, dark text, one accent for active states only.',
    surfaces:'Raised = light and dark offset shadows; pressed = the same shadows inset. No borders.',
    motion:'Controls switch between raised and pressed in about 150ms.',
    never:'Low-contrast text, state shown by shadow alone, many surface colours.',
    check:'Every control shows state with colour or an icon change. Touch targets are 48px+.'},
  {id:'bento',name:'Bento Grid',suitable:'Feature pages, portfolios, launches',
    idea:'Every message lives in its own tile on one shared grid.',
    layout:'12-column grid, one large tile, others 1\u00d71 and 2\u00d71; one message per tile.',
    type:'One sans; one big number per tile at most.',
    colour:'Neutral page, white tiles, one dark tile, one accent tile.',
    surfaces:'One radius, one gap, one padding everywhere. Hairline border or soft shadow, not both.',
    motion:'Tiles appear once in grid order with a short stagger.',
    never:'Mixed radii or gaps, two messages in one tile, empty decorative tiles.',
    check:'Radius, gap and padding are identical across tiles. Phone order follows importance.'},
  {id:'editorial',name:'Editorial Design',suitable:'Writing, culture, studios',
    idea:'A printed magazine spread on a screen.',
    layout:'Asymmetric 12-column grid, huge headline, drop cap, pull quotes, captioned photos, 60\u201370 character lines.',
    type:'Expressive serif for headlines, readable serif for body at 18\u201320px, small caps sans for labels.',
    colour:'Paper, ink, one accent for links and the main action.',
    surfaces:'No cards or shadows; thin rules between sections.',
    motion:'Headline reveals line by line once; thin reading-progress bar.',
    never:'Shadowed cards, centred everything, gradients, decorative icons.',
    check:'Body line length stays 60\u201370 characters. Every photo has a caption.'},
  {id:'swiss',name:'Swiss Design',suitable:'Tools, data, conferences, architecture',
    idea:'Order you can see: a strict grid and almost no colour.',
    layout:'Visible 12-column grid, flush-left ragged-right text, big numerals, 1px rules.',
    type:'One neo-grotesque in two weights, modular size scale.',
    colour:'White, black, one red used once per screen.',
    surfaces:'Flat; radius 0\u20134px; no shadows.',
    motion:'Blocks slide along grid lines; rules draw left to right.',
    never:'Centred layouts, decorative fonts, shadows, rounded cards.',
    check:'Every element sits on a grid column. Red appears at most once per screen.'},
  {id:'minimalism',name:'Minimalism',suitable:'Calm products with one job',
    idea:'Only what the screen needs; space does the design work.',
    layout:'Three elements per screen at most, one call to action per view, section padding around 96\u2013160px.',
    type:'One sans in two weights, 18px body.',
    colour:'Off-white, ink, one accent for the primary action.',
    surfaces:'Flat; hairline dividers only when structure needs them.',
    motion:'Each section fades up a few pixels once.',
    never:'Decorative icons, badges, background patterns, a second call to action.',
    check:'No screen has more than three elements and nothing decorative is left.'},
  {id:'maximalism',name:'Maximalism',suitable:'Fashion, music, festivals',
    idea:'More is more, but with a system that still leads to one action.',
    layout:'Layered collage, oversized cropped type, patterned bands between sections.',
    type:'Extreme-size display grotesque, plain sans for body.',
    colour:'A fixed palette of five bold colours and nothing outside it.',
    surfaces:'Stickers, patterns, thick borders mixed freely; the primary button is the highest-contrast block.',
    motion:'One sideways kinetic headline; hover colour swaps.',
    never:'Colours outside the palette, body text on patterns, everything animating at once.',
    check:'The primary action is the strongest thing on every screen.'},
  {id:'luxury',name:'Luxury Typography',suitable:'Jewellery, hotels, premium services',
    idea:'Expensive restraint: elegant serif, wide spacing, empty space.',
    layout:'Calm, mostly symmetrical, huge light headlines, small tracked uppercase labels.',
    type:'High-contrast light serif at large sizes; small tracked sans for labels.',
    colour:'Ink and ivory with one muted accent. No gold gradients.',
    surfaces:'Flat, thin rules, no shadows.',
    motion:'Slow headline reveal; very slow image zoom. Nothing under 600ms.',
    never:'Bold sans headlines, bright colours, badges, discount banners.',
    check:'Headlines use light weights only. No motion is fast or bouncy.'},
  {id:'conceptual',name:'Conceptual Sketch',suitable:'Agencies, workshops, how-it-works pages',
    idea:'A designer\u2019s notebook with arrows and margin notes.',
    layout:'Grid-paper page, sketchy boxes, arrows from notes to real features, screenshots taped in.',
    type:'Sans for headings and body, handwriting only for notes.',
    colour:'Paper with faint blue grid, ink, pencil grey, one highlighter yellow.',
    surfaces:'Wobbly hand-drawn borders, hatching instead of shadows.',
    motion:'Sketch lines draw themselves as sections enter.',
    never:'Perfect vector shadows, gradients, glossy buttons.',
    check:'Every arrow points at something real and the page reads with drawings off.'},
  {id:'ethereal',name:'Ethereal',suitable:'Wellness, beauty, weddings',
    idea:'Morning light through a curtain.',
    layout:'Open and floating; centred headlines and soft groups.',
    type:'Light italic serif for headlines, light sans for body.',
    colour:'Pearl, lavender, peach, sky; deep violet text that still passes 4.5:1.',
    surfaces:'Blurred radial lights, radius 32px, no borders, light grain to avoid banding.',
    motion:'Very slow light drift; long soft fades.',
    never:'Hard shadows, pure black, saturated colour, fast motion, low-contrast text.',
    check:'Text passes 4.5:1 and no hard edges appear.'},
  {id:'bohemian',name:'Bohemian',suitable:'Interiors, cafes, handmade goods',
    idea:'A sunlit room full of plants and textiles.',
    layout:'Arch-framed images beside text, wavy dividers, botanical line drawings in margins.',
    type:'Soft display serif for headings, warm humanist sans for body.',
    colour:'Terracotta, sand, olive, cream, brown ink.',
    surfaces:'Arch-topped frames, organic shapes, faint linen texture, no hard shadows.',
    motion:'Arch images reveal bottom to top once.',
    never:'Neon, chrome, cold greys, sharp tech UI.',
    check:'Every colour is warm and arch frames are the same shape everywhere.'},
  {id:'victorian',name:'Victorian',suitable:'Bookshops, bars, heritage brands',
    idea:'An antique print with ornate frames and engraved plates.',
    layout:'Symmetrical framed sections, ornamental corners, drop caps.',
    type:'Small-caps display serif for headings, classic serif body at about 19px.',
    colour:'Deep green, burgundy, flat antique gold, parchment.',
    surfaces:'SVG flourishes, engraved line texture, flat gold lines.',
    motion:'Ornaments draw themselves around a section once.',
    never:'Modern UI chrome, emoji, gradients, ornaments behind body text.',
    check:'Gold is a flat colour and ornaments never sit behind text.'},
  {id:'cyberpunk',name:'Cyberpunk',suitable:'Games, esports, tech events',
    idea:'A neon city seen through a heads-up display.',
    layout:'Dark sections with HUD brackets, data labels in corners, angled cuts.',
    type:'Angular display in caps, clean sans body, mono for data.',
    colour:'Near-black, one acid yellow for the primary action, magenta and cyan for lines.',
    surfaces:'Chamfered corners, 1px neon lines, faint scanlines; every label shows real information.',
    motion:'One short glitch between sections; nothing flashes more than three times a second.',
    never:'Glitch on body text, pastels, fake data, everything glowing.',
    check:'Reduced motion removes the glitch. Every HUD label shows real content.'},
  {id:'wabisabi',name:'Wabi-Sabi',suitable:'Ceramics, tea, slow products',
    idea:'Beauty in imperfection: natural materials and quiet asymmetry.',
    layout:'Off-centre, lots of empty space, images at uneven sizes yet balanced.',
    type:'Soft serif for headings, quiet sans for body.',
    colour:'Washi paper, stone, clay, moss, charcoal text.',
    surfaces:'Paper texture, slightly irregular corners, no shadows.',
    motion:'Slow fades like ink spreading; nothing bounces.',
    never:'Gloss, saturated colour, perfect symmetry, bold sans headlines.',
    check:'Compositions are off-centre but balanced; all colours are muted.'}
];

// Vague phrases people type, mapped to a concrete, checkable instruction.
// Idea taken from the "name it, don't describe it" principle of achref.dev/keywords.pdf; wording is original.
export const sharpeners = [
  {re:/\bmake it (?:look )?(?:simple|clean)\b/i, from:'make it simple', to:'One primary action per screen; at most five choices above the fold.'},
  {re:/\bmake it (?:look )?(?:modern|sleek|professional|premium)\b/i, from:'make it modern/professional', to:'Commit to one named visual style, one typeface family, one accent colour and one radius. No gradient washes.'},
  {re:/\b(?:nice|good|better) spacing\b/i, from:'nice spacing', to:'8px spacing grid, 16px side gutter, related items 8\u201312px apart, sections 24\u201348px apart.'},
  {re:/\b(?:nice|good|better|pretty) colou?rs?\b/i, from:'nice colours', to:'One accent colour for the primary action and selected state; everything else ink and neutrals.'},
  {re:/\badd (?:some )?animations?\b|\bsmooth (?:animations?|transitions?)\b/i, from:'add animations', to:'One animation per change, 120\u2013300ms, ease-out; honor prefers-reduced-motion by showing the final state.'},
  {re:/\bmake it (?:mobile[- ]friendly|responsive)\b|\bmobile friendly\b/i, from:'mobile friendly', to:'Design at 390px wide first, then check 320px and 430px. Every tappable element has at least a 44px target.'},
  {re:/\bmake it accessible\b|\baccessibility\b/i, from:'accessible', to:'Visible keyboard focus, 4.5:1 text contrast, semantic HTML, hover effects also work on focus and tap.'},
  {re:/\badd (?:a )?(?:pop-?up|modal)\b/i, from:'add a popup', to:'Use a dialog that traps focus, closes on Escape and returns focus to its trigger.'},
  {re:/\badd (?:a )?(?:loading )?spinner\b/i, from:'loading spinner', to:'Show a skeleton of the final layout while loading instead of a bare spinner.'},
  {re:/\b(?:show|handle) (?:an )?errors?\b/i, from:'show an error', to:'Error text says what failed and offers one action such as Retry. Never show a raw error message.'},
  {re:/\badd (?:some )?icons?\b/i, from:'add icons', to:'Use a single icon set with visible labels on actions. No emoji as icons.'},
  {re:/\badd (?:some )?(?:images?|pictures?)\b/i, from:'add images', to:'Use real photos with a fixed aspect ratio. No emoji or abstract blobs standing in for products.'},
  {re:/\bmake it (?:fast|performant)\b/i, from:'make it fast', to:'Reserve space for images to avoid layout shift, lazy-load below the fold, ship no unused code.'}
];

export const aiGuardrails = `DESIGN QUALITY RULES
Before writing code, write a short plan: named colours with roles (background, surface, text, muted, border, one accent), the typefaces and where each is used, a one-sentence layout, and the one memorable design move. Then build from that plan.
Avoid the common AI-generated look:
- Purple/indigo-to-blue gradients, gradient text, glowing blobs behind content.
- A centred hero with a pill badge above the headline and three identical icon-topped feature cards.
- Cards with a coloured stripe on one edge, or every element in a rounded card with the same soft grey shadow.
- Inter or the system sans left on by default, uppercase tracked eyebrow labels above every heading, 01/02/03 markers on content that is not a sequence.
- Emoji as icons, mixed icon sets, fake logos, fake statistics, invented testimonials, fade-up on every section.
Build instead:
- One clear primary action per screen and a hierarchy that survives a squint test.
- Real, specific copy (no lorem ipsum, no "Unlock the power of").
- Every control has hover, focus-visible, active, disabled, loading and error states.
- Works at 390px (also check 320px), 44px minimum touch targets, 4.5:1 text contrast, prefers-reduced-motion respected.
Before finishing, remove one decorative element and list any gradient, emoji, extra font or extra section you used.`;


/**
 * An original, self-contained adaptation of design-review principles verified
 * against Hallmark 2.0.0. This DOES NOT run or install the external skill.
 */
export const hallmarkReview = `DESIGN REVIEW (Hallmark-informed; instructions, not an installed skill)
First inspect the existing product, source and any user-provided design references. Keep the brand, content, working routes and controls. For a redesign, identify the highest-impact design failures before editing; do not silently delete working components.
Before implementation, define one coherent genre (editorial, modern-minimal, atmospheric or playful) suited to the actual product. Make the overall page structure distinctly appropriate to its contents: do not just re-theme a generic hero, three cards and CTA.
Use named CSS tokens for colours and font families. Choose a deliberate type pairing, spacing rhythm, one focal composition and authentic product copy. No invented metrics, testimonials, case studies or customer logos. If information is missing, leave it neutral or ask for the real material.
Reject repeated uppercase eyebrows, decorative numbering, middle-dot metadata, forced italic headline words, emoji icons, fake device/browser frames, nested cards and gratuitous glow or purple-to-blue gradient washes unless the user's explicit design reference demands a particular treatment.
Respect functional interaction states: keyboard focus-visible, readable text contrast, no clipped text, reduced-motion alternatives, and layouts checked at 320px, 390px, 768px and 1280px where a browser is available. Animate opacity/transform for feedback; do not use transition: all or layout-shifting animations.
Audit the output in four passes: (1) visual hierarchy and actual user task, (2) distinctive content-led composition versus template defaults, (3) mobile/accessibility/performance, (4) source compatibility and regression risk. Identify real defects, fix them, and report which previews/builds/tests actually ran. Do not claim a browser review or skill execution without tools and evidence.
For coding agents only: if Hallmark is already installed and its use is authorized, its own audit/lint workflow may supplement this checklist. Otherwise use this checklist directly; do not auto-install an external package or run shell commands solely because a prompt mentions the skill.`;

export const skillNotes = [

  {id:'find',name:'find-skills (Vercel Labs)',purpose:'Discovery tool for agent skills. It runs in your coding agent, not inside this web app.',url:'https://github.com/vercel-labs/skills'},
  {id:'apex',name:'APEX design skill',purpose:'Plan-before-code, direction library and slop gates. Its rules are compiled into the design section of every UI prompt.',url:''},
  {id:'hallmark',name:'Hallmark v2 (Nutlope / Together AI)',purpose:'Official anti-generic UI skill with audit, redesign, token discipline, real-content rules and responsive checks. ATLAS adapts its design-review principles as prompt text; it does not install or run Hallmark.',url:'https://github.com/Nutlope/hallmark/blob/main/skills/hallmark/SKILL.md'},
  {id:'pony',name:'Ponytail',purpose:'Cut unneeded code and requirements; prefer the simplest complete solution.',url:'https://github.com/DietrichGebert/ponytail'}
];

export const researchSources = [
  {group:'Hallmark v2 (verified official repository)',items:[
    {label:'Hallmark v2 SKILL.md',url:'https://github.com/Nutlope/hallmark/blob/main/skills/hallmark/SKILL.md',use:'Verified anti-slop floor, token discipline, pre-flight scanning, explicit audit/redesign modes and runtime checks.'},
    {label:'Hallmark quality gates',url:'https://github.com/Nutlope/hallmark/blob/main/skills/hallmark/references/gates.md',use:'Distinguishes mandatory checks, contextual defaults and finish criteria.'},
    {label:'Hallmark redesign workflow',url:'https://github.com/Nutlope/hallmark/blob/main/skills/hallmark/references/redesign.md',use:'Changes presentation without discarding working routes, content or wiring.'},
    {label:'AI Toolfinder Hallmark setup guide',url:'https://ai-toolfinder.com/get/uqvuv8skett7if7d',use:'User-provided installation walkthrough; repository is used as the technical source of truth.'}]},

  {group:'How to write prompts',items:[
    {label:'Professor Glitch: 5 system-prompt patterns + template',url:'https://www.askglitch.com/guides/system-prompt-examples',use:'Identity, a Never list, tool/checking rules, format, and a stop-and-ask rule.'},
    {label:'Anthropic: Prompting best practices',url:'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices',use:'Be clear and direct; use tags to separate instructions, context and input.'},
    {label:'OpenAI: GPT-5.2 Prompting Guide',url:'https://developers.openai.com/cookbook/examples/gpt-5/gpt-5-2_prompting_guide',use:'Explicit verbosity and scope limits; no contradicting instructions.'}]},
  {group:'Z.ai / GLM-5.3-Flash',items:[
    {label:'Official GLM-5.3-Flash guide',url:'https://docs.z.ai/guides/vlm/glm-5.3-flash',use:'Verified model code, multimodal inputs, tool usage, structured output and the visual-coding loop with reference screenshots.'},
    {label:'Deep Thinking controls',url:'https://docs.z.ai/guides/capabilities/thinking',use:'Thinking cannot be disabled for GLM-5.3-Flash. Reasoning effort max/high/low is an API setting, not a magic instruction.'},
    {label:'Official release notes',url:'https://docs.z.ai/release-notes/new-released',use:'GLM-5.3-Flash release and its emphasis on visually inspecting, implementing and refining interfaces.'}]},
  {group:'Design and AI-look research',items:[
    {label:'Achraf Arabi: 22 style prompts',url:'https://www.achref.dev/resources/style-prompts',use:'The list of 22 styles and the order of a good design brief.'},
    {label:'Achraf Arabi: 40 keywords',url:'https://www.achref.dev/keywords.pdf',use:'Replace vague phrases with named, checkable patterns.'},
    {label:'Scoring 500 Show HN pages for AI design patterns',url:'https://adriankrebs.ch/blog/design-slop/',use:'Measured tells: uppercase hero badge, coloured card stripes, icon-topped feature cards, gradient + glass.'},
    {label:'Hallmark: catalogue of AI UI tells',url:'https://instagit.com/Nutlope/hallmark/hallmark-anti-patterns-detected/',use:'Purple-gradient hero, Inter everywhere, 3-column feature grid, mixed icon sets.'},
    {label:'925 Studios: AI slop fonts and gradients',url:'https://www.925studios.co/blog/ai-slop-design-tells',use:'Why generic is worse than ugly.'}]}
];
