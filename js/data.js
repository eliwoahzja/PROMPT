// Product-specific prompt templates, not claims of undocumented model capabilities.
export const targets = [
  { id:'freebuff', label:'FreeBuff', tag:'Coding agent', class:'agent',
    note:'Write a repository task with files, boundaries, checks and a tangible deliverable.',
    template:'Inspect the available project files before changes. Map the affected entry points and callers. Preserve existing behavior, make a coherent minimal diff, run available checks, and report actual outcomes. Do not assume tools or files you cannot access.' },
  { id:'chatgpt', label:'ChatGPT', tag:'General assistant', class:'chat',
    note:'Give a clear objective, relevant context, priority constraints and a concrete output.',
    template:'Work from the information provided. Distinguish facts from assumptions. Answer directly in the requested format. Use available tools only when they help and do not claim unseen actions or results.' },
  { id:'kilo', label:'Kilo AI', tag:'Coding agent', class:'agent',
    note:'Make workspace context, AGENTS.md rules, implementation scope and verification explicit.',
    template:'Inspect the repository and read applicable AGENTS.md instructions first. Identify affected modules, edit real files, preserve interfaces and run the project\'s relevant tests/build. Clearly report what was changed and what was blocked.' },
  { id:'codex', label:'Codex', tag:'Coding agent', class:'agent',
    note:'Prefer a lean, executable repository issue; do not duplicate project instructions.',
    template:'Check repository instructions and relevant code. Implement the requested change with a focused diff. Run proportionate verification. Report file paths, verified behavior and outstanding issues without repeating a long generic checklist.' },
  { id:'mimo', label:'MiMo 2.6 Flash', tag:'Model family', class:'model',
    note:'Use explicit numbered requirements and an unambiguous deliverable; avoid unsupported claims about model internals.',
    template:'Follow the numbered requirements in order. Keep names, constraints and output format exact. If a critical detail is absent, state one brief assumption. Produce the requested artifact rather than discussing how it could be made.' },
  { id:'deepseek', label:'DeepSeek', tag:'Model family', class:'model',
    note:'Separate task, constraints and output structure; do not assume a specific reasoning mode.',
    template:'Use the given context and complete the requested task. Respect constraints, provide the required final format, and distinguish verified findings from unknowns. Do not invent external access, tests or sources.' }
];

// Titles follow the linked inspiration library; prompt wording and content are original.
// Each style specifies an actual implementation brief, not just an aesthetic label.
export const styles = [
  {id:'none', name:'No style', suitable:'Use task-appropriate defaults', brief:''},
  {id:'claymorphism',name:'Claymorphism',suitable:'Friendly utilities',brief:'Make tactile soft-volume surfaces with gentle occlusion and a muted chalk palette. Use one dominant sculptural control, roomy labels and shallow shadows. Keep inputs sharp enough to recognize and avoid multiplying inflated cards.'},
  {id:'cybercore',name:'Cybercore',suitable:'Experimental developer tools',brief:'Build a dense high-contrast grid with controlled electric-lime accents, terminal-like detail and deliberate type size differences. Use compact rails and meaningful system data. No fake telemetry, random hex strings or illegible microscopic labels.'},
  {id:'neobrutalism',name:'Neo-Brutalism',suitable:'Bold creator tools',brief:'Use flat ink-black outlines, one abrupt high-chroma accent, weighty sans type, hard shadows only under primary actions, and asymmetric blocks. Let interaction states feel immediate. Avoid thick borders on every tiny label.'},
  {id:'scrapbook',name:'Scrapbook',suitable:'Personal stories',brief:'Compose like a curated physical journal with uneven image crops, carefully restrained torn-paper edges and annotation-like typography. Preserve a stable interactive grid beneath the handmade surface. No randomized rotations on form fields.'},
  {id:'surrealism',name:'Surrealism',suitable:'Art projects',brief:'Use one impossible but legible focal image, unexpected scale and vast neutral space. Let the composition carry the strangeness while navigation stays calm. Avoid stock dream-cloud gradients and unrelated floating objects.'},
  {id:'y2k',name:'Y2K Aesthetic',suitable:'Culture and music',brief:'Use reflective aluminum surfaces, digital-era condensed lettering and a single vivid gloss accent. Set a clear rhythm between tight display details and generous usable controls. Do not bury labels in chrome effects.'},
  {id:'pixel',name:'Pixel Art',suitable:'Retro games',brief:'Use a disciplined pixel grid for illustrations and dividers, crisp stepping in icons and an intentionally small palette. Pair bitmap display lettering with accessible smooth body text. Avoid fake CRT distortion over form content.'},
  {id:'synthwave',name:'Synthwave',suitable:'Audio interfaces',brief:'Pair midnight plum with sunset copper and a single horizon motif. Give large display typography a cinematic rhythm and keep workspace surfaces dark and stable. Avoid fluorescent grids under every component.'},
  {id:'glassmorphism',name:'Glassmorphism',suitable:'Floating controls',brief:'Use translucency only for navigation or temporary overlays placed over a structured photographic or solid field. Maintain readable opaque form surfaces, high contrast and controlled blur. Avoid stacking glass cards inside glass cards.'},
  {id:'neumorphism',name:'Neumorphism',suitable:'Low-density controls',brief:'Make a small set of tactile inset and raised controls on a uniform stone-gray surface; include hard focus rings and clear selected states. Never make an interactive element depend on shadow alone.'},
  {id:'bento',name:'Bento Grid',suitable:'Distinct feature groups',brief:'Arrange genuinely different information types in an asymmetric modular grid: one dominant live preview, one concise index and one detailed work area. Use consistent gaps, not a collection of identical square feature cards.'},
  {id:'editorial',name:'Editorial Design',suitable:'Writing and knowledge',brief:'Compose as a restrained periodical spread: an expressive high-contrast serif title, narrow annotations and generous text measure. Use one severe alignment axis, crisp captions and image crops. Avoid fake issue numbers.'},
  {id:'swiss',name:'Swiss Design',suitable:'Tools and data',brief:'Use a rigorous twelve-column system, typographic scale contrast, flush-left blocks, thin meaningful rules and one red signal color. Make navigation and data relationships immediately visible; never add arbitrary microtype for atmosphere.'},
  {id:'minimalism',name:'Minimalism',suitable:'Focused products',brief:'Reduce the interface to one obvious action per view, clear text hierarchy and a restrained neutral palette. Use a consistent 8px spacing rhythm, meaningful white space and borders only where they clarify grouping.'},
  {id:'maximalism',name:'Maximalism',suitable:'Creative portfolios',brief:'Build a deliberately layered composition with two dominant visual families, oversized cropped typography and curated imagery. Preserve a quiet functional path and clear readable hit targets. No accidental clutter or unrelated iconography.'},
  {id:'luxury',name:'Luxury Typography',suitable:'Premium catalogs',brief:'Lead with confident large-scale serif typography, tactile near-black or ivory surfaces, generous whitespace and image-led storytelling. Keep buttons low-chrome and precise. Avoid gold trim, fake crests and excessive tracking.'},
  {id:'conceptual',name:'Conceptual Sketch',suitable:'Illustrated interfaces',brief:'Treat the UI as one carefully drawn composition with expressive imperfect strokes, relaxed spacing and intentional asymmetry. Keep functional geometry accurate and type legible. Avoid ordinary cards disguised with random wobble borders.'},
  {id:'ethereal',name:'Ethereal',suitable:'Atmospheric experiences',brief:'Build a calm low-light atmosphere with sparse luminous contours, subtle violet depth and soft editorial hierarchy. Use illumination only to communicate focus or change. Avoid particle storms, repeated glows and fantasy badges.'},
  {id:'bohemian',name:'Bohemian',suitable:'Artisan businesses',brief:'Use sun-softened pigments, natural textile-inspired texture and hand-arranged photographic objects. Make type warm but exact, with an organic asymmetric rhythm. Avoid cliché tan everything and ornamental flourishes on controls.'},
  {id:'victorian',name:'Victorian',suitable:'Archival storytelling',brief:'Use bookish serif typesetting, high-contrast illustrations and occasional engraved separator motifs. Keep accessible modern interaction geometry beneath the historical surface. Never mimic antique scripts for small body labels.'},
  {id:'cyberpunk',name:'Cyberpunk',suitable:'Gaming systems',brief:'Use precise modular industrial panels, restrained signal magenta and cool steel accents on near-black. Make numbers and system status functional. Limit angular cuts to major regions, not every component.'},
  {id:'wabisabi',name:'Wabi-Sabi',suitable:'Quiet products',brief:'Favor asymmetry, soft mineral neutrals, imperfect natural textures and simple honest shapes. Allow one raw-material visual to anchor the page. Keep controls clean and never manufacture random distress in text.'}
];

export const aiGuardrails = `VISUAL QUALITY REQUIREMENTS
- Define exact typography roles (display, body, controls), a functional 4–6 color palette and consistent spacing tokens.
- Choose one distinctive compositional idea tied to the real subject; use real domain-specific copy.
- Avoid generic centered hero + three equal icon cards, purple gradient wash, random glow orbs, generic pill badges, stock testimonials and filler metrics.
- State mobile layout behavior at 390px, handle 320px and long text, visible keyboard focus, minimum 44px touch targets and reduced-motion support.
- Visual details must convey meaning; remove decorative elements with no role.
- Inspect and correct spacing, contrast, hierarchy and overflow before claiming completion.`;

export const skillNotes = [
  {id:'find',name:'find-skills / Vercel Labs',purpose:'Discovery tool, not a runtime enhancement API',url:'https://github.com/vercel-labs/skills'},
  {id:'web',name:'web-design-guidelines',purpose:'Accessible controls, feedback, structure and usability review',url:'https://github.com/vercel-labs/web-interface-guidelines'},
  {id:'pony',name:'Ponytail',purpose:'Cut unnecessary code and requirements; prefer the simplest complete solution',url:'https://github.com/DietrichGebert/ponytail'},
  {id:'front',name:'frontend-design',purpose:'Distinct visual direction and context-specific composition',url:'https://github.com/vercel-labs/agent-eval/tree/main/packages/playground/.agents/skills/frontend-design'}
];
