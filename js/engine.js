import {targets, styles, aiGuardrails, hallmarkReview, sharpeners, CHECKED_ON} from './data.js';

export const MAX_INPUT = 12000;
export const MAX_OUTPUT = 40000;

const uiPattern = /\b(ui|ux|website|web ?app|web ?page|landing|dashboard|front.?end|interface|html|css|tailwind|react|flutter|screen|component|page|layout|navbar|navigation bar|theme|redesign|mobile app|imgui|menu)\b/i;
const codingPattern = /\b(code|bug|fix|refactor|repository|repo|compile|build|test|implement|developer|javascript|typescript|python|kotlin|api|backend|android|function|endpoint|database|sql)\b/i;

const TECH = ['Next.js','React','Vue','Svelte','Angular','Tailwind','shadcn/ui','Lucide','Supabase','Vercel','Firebase','Node.js','Express','TypeScript','JavaScript','Python','Django','Flask','Flutter','SwiftUI','Kotlin','Jetpack Compose','PostgreSQL','MongoDB','Stripe','GitHub','CodeIgniter','Laravel','PHP','ImGui','Android NDK','Android','iOS','WordPress','Docker'];
const styleWords = {
  neobrutalism:/brutal/i, claymorphism:/clay/i, cybercore:/cybercore/i, scrapbook:/scrapbook/i, surrealism:/surreal/i,
  y2k:/\by2k\b/i, pixel:/pixel/i, synthwave:/synthwave|vaporwave|retrowave/i, glassmorphism:/glass/i, neumorphism:/neumorph/i,
  bento:/bento/i, editorial:/editorial/i, swiss:/swiss/i, minimalism:/minimal/i, maximalism:/maximal/i, luxury:/luxury/i,
  conceptual:/sketch/i, ethereal:/ethereal/i, bohemian:/bohemian|boho/i, victorian:/victorian/i, cyberpunk:/cyberpunk/i, wabisabi:/wabi/i
};

const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\\/]/g,'\\$&');

/** Pull out the exact strings a rewrite must not lose. Deterministic; nothing is inferred. */
export function extractTokens(raw) {
  const text = String(raw||'');
  const found = new Set();
  const add = m => { const v = String(m).trim().replace(/[.,;:!?]+$/,''); if (v.length > 1) found.add(v); };
  (text.match(/https?:\/\/[^\s)>"'\]]+/g)||[]).forEach(add);
  (text.match(/\b[\w@.\/-]+\.(?:js|jsx|ts|tsx|py|html|css|json|md|yml|yaml|sql|kt|java|swift|go|rs|php|rb|cpp|c|h|sh|xml|gradle|toml|env)\b/gi)||[]).forEach(add);
  (text.match(/`[^`\n]{2,80}`/g)||[]).forEach(m=>add(m.slice(1,-1)));
  (text.match(/"[^"\n]{2,80}"/g)||[]).forEach(m=>add(m.slice(1,-1)));
  (text.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g)||[]).forEach(add);
  (text.match(/\b\d+(?:\.\d+)?\s?(?:px|rem|em|ms|kb|mb|gb|dp|sp|pt|%)(?![\w])/gi)||[]).forEach(add);
  for (const t of TECH) { if (new RegExp('(?<![\\w.])'+escapeRe(t)+'(?![\\w])','i').test(text)) { const m = text.match(new RegExp('(?<![\\w.])'+escapeRe(t)+'(?![\\w])','i')); add(m[0]); } }
  return [...found].slice(0,25);
}

export function detectNamedStyle(raw) {
  for (const [id,re] of Object.entries(styleWords)) if (re.test(raw)) return id;
  return null;
}

export function sharpen(raw) {
  return sharpeners.filter(s=>s.re.test(raw)).map(s=>({from:s.from,to:s.to}));
}

function numbered(lines){ return lines.map((l,i)=>(i+1)+'. '+l).join('\n'); }
function bullets(lines){ return lines.map(l=>'- '+l).join('\n'); }

function styleBlock(style, depth) {
  if (!style || style.id === 'none') return 'Choose one distinct visual direction that fits the audience and subject. Name it in one sentence before you build.';
  const rows = depth === 'standard'
    ? [['Idea',style.idea],['Type',style.type],['Colour',style.colour],['Never',style.never]]
    : [['Idea',style.idea],['Layout',style.layout],['Type',style.type],['Colour',style.colour],['Surfaces',style.surfaces],['Motion',style.motion],['Never',style.never],['Check',style.check]];
  return 'Style: '+style.name+'. Commit to it on every screen and do not blend it with another style.\n'+rows.map(([k,v])=>k+': '+v).join('\n');
}

/** Build the prompt plus everything the UI needs to show about it. */
export function buildResult({raw, target='chatgpt', style='none', depth='standard', hallmark=false}) {
  const task = String(raw||'').trim();
  if (!task) throw new Error('Enter a prompt first.');
  if (task.length > MAX_INPUT) throw new Error('Your prompt exceeds 12,000 characters.');
  const model = targets.find(x=>x.id===target);
  const chosen = styles.find(x=>x.id===style);
  if (!model || !chosen) throw new Error('Choose a supported target and design style.');
  if (!['compact','standard','thorough'].includes(depth)) throw new Error('Invalid level of detail.');
  if (typeof hallmark !== 'boolean') throw new Error('Invalid design review setting.');

  const isDesign = chosen.id !== 'none' || uiPattern.test(task);
  const isCoding = model.kind === 'agent' || model.kind === 'builder' || codingPattern.test(task);
  const tokens = extractTokens(task);
  const sharpened = isDesign ? sharpen(task) : [];
  const S = []; // {key,title,body}

  S.push({key:'request',title:'Request (verbatim)',body:task});
  if (tokens.length) S.push({key:'keep',title:'Keep exactly as written',body:tokens.join(', ')});
  if (sharpened.length) S.push({key:'specifics',title:'Vague phrases made specific',body:bullets(sharpened.map(s=>'\u201c'+s.from+'\u201d \u2192 '+s.to))});

  const how = depth === 'compact' ? model.how.slice(0,2) : model.how;
  S.push({key:'how',title:'How to work',body:model.layout==='numbered'?numbered(how):bullets(how)});

  if (depth !== 'compact') {
    S.push({key:'scope',title:'Scope',body:bullets([
      'Do only what the request asks. Add no extra features, files, sections or styling.',
      'Keep every name, number, technology and exclusion from the request.'])});
    S.push({key:'done',title:'Done when',body:bullets(isCoding
      ? ['Every requirement in the request is met.','Behavior outside the request still works.','A check you actually ran passes, or you state which check could not be run.']
      : ['Every requirement in the request is met.','The output is in the requested format.','Assumptions are listed, not hidden.'])});
  }
  if (isDesign) {
    const guard = depth === 'thorough' ? aiGuardrails : aiGuardrails.split('\n').filter(l=>!l.startsWith('Before writing code')).slice(0,14).join('\n');
    S.push({key:'design',title:'Design direction',body:styleBlock(chosen,depth)+(depth==='compact'?'':'\n\n'+guard)});
  }
  if (hallmark && isDesign) {
    S.push({key:'designreview',title:'Independent design review',body:hallmarkReview});
  }
  if (depth !== 'compact') S.push({key:'stop',title:'If something is missing',body:'If an essential detail is missing and you cannot proceed safely, ask one question before starting. Otherwise state one short assumption and continue.'});
  if (depth === 'thorough') {
    S.push({key:'never',title:'Never',body:bullets(['Invent files, APIs, test results, sources or tool access.','Say you ran or checked something you did not. If you cannot check it, say so.'])});
    if (isCoding) S.push({key:'verify',title:'Verify',body:'Run the project\u2019s own tests, linter and type checker where they exist. Report each as PASSED, FAILED or NOT RUN, with the real output.'});
  }
  S.push({key:'format',title:'Output',body:model.format});
  if (depth === 'thorough') {
    S.push({key:'selfcheck',title:'Check before you answer',body:bullets([
      'Re-read the request. Is every requirement met and nothing contradicted?',
      'Remove anything you added that was not asked for.']
      .concat(isDesign?['List every gradient, emoji, extra font and extra section you used. Remove any that break the rules above.']:[]))});
  }

  let prompt;
  if (model.layout === 'xml') prompt = S.map(s=>'<'+s.key+'>\n'+s.body+'\n</'+s.key+'>').join('\n\n');
  else prompt = S.map(s=>s.title.toUpperCase()+'\n'+s.body).join('\n\n');

  const warnings = [];
  const named = detectNamedStyle(task);
  if (named && chosen.id === 'none') warnings.push('Your request mentions '+styles.find(s=>s.id===named).name+'. Pick it under Visual direction to add the full brief.');
  if (named && chosen.id !== 'none' && named !== chosen.id) warnings.push('Your request mentions '+styles.find(s=>s.id===named).name+' but you picked '+chosen.name+'. The prompt keeps both; edit one so they do not conflict.');
  if (model.id === 'codex' && depth === 'thorough') warnings.push('OpenAI\u2019s Codex guide recommends a minimal prompt. Detailed adds sections it says you usually do not need; use Concise unless the task is risky.');
  const words = task.split(/\s+/).filter(Boolean).length;
  if (words < 8) warnings.push('Your request is only '+words+' words. The prompt can add structure, but only you can add the audience, the outcome and the limits.');

  const checks = verifyPrompt(task, prompt, {target, style, depth, mode:'draft', hallmark});
  return {prompt, checks, tokens, sharpened, warnings, isDesign, isCoding, hallmarkApplied:hallmark && isDesign};
}

export function buildPrompt(opts) { return buildResult(opts).prompt; }

/**
 * Real checks on a finished prompt. Nothing here predicts how a model will answer;
 * it only proves what the text contains.
 * mode 'draft': the local composer (verbatim request included).
 * mode 'AI': a model rewrote it, so required strings are checked individually.
 */
export function verifyPrompt(raw, out, {target='chatgpt', style='none', depth='standard', mode='draft', hallmark=false} = {}) {
  const task = String(raw||'').trim();
  const text = String(out||'');
  const model = targets.find(x=>x.id===target);
  const chosen = styles.find(x=>x.id===style);
  const tokens = extractTokens(task);
  const missing = tokens.filter(t=>!text.toLowerCase().includes(t.toLowerCase()));
  const checks = [];
  if (mode === 'draft') checks.push({id:'verbatim',label:'Your request appears word for word',pass:text.includes(task)});
  checks.push({id:'tokens',label:tokens.length ? 'All '+tokens.length+' exact names, numbers and links are kept' : 'No exact names or numbers needed protecting',pass:missing.length===0,detail:missing.length?'Missing: '+missing.join(', '):''});
  if (mode === 'draft' && model) {
    const ok = model.layout==='xml' ? /<request>[\s\S]*<\/request>/.test(text)
      : model.layout==='numbered' ? /(^|\n)1\. /.test(text)
      : /(^|\n)REQUEST \(VERBATIM\)\n/.test(text);
    checks.push({id:'layout',label:'Structure matches the '+model.label+' template',pass:ok});
  }
  if (chosen && chosen.id !== 'none') checks.push({id:'style',label:'Style \u201c'+chosen.name+'\u201d is named in the prompt',pass:text.includes(chosen.name)});
  if (hallmark && (chosen?.id !== 'none' || uiPattern.test(task))) {
    const present = mode === 'draft'
      ? text.includes('DESIGN REVIEW (Hallmark-informed; instructions, not an installed skill)')
      : /(?:review|critique|audit)/i.test(text) && /(?:layout|typography|accessible|accessibility|screenshots?|render|contrast|viewport|visual)/i.test(text);
    checks.push({id:'hallmark',label:'Independent design-review instructions are present',pass:present,
      detail:present?'':'The rewrite removed the requested design-review discipline.'});
  }

  const bad = /\bundefined\b|\[object|\bNaN\b|\{\{|\}\}/.test(text) && !/\bundefined\b|\[object|\bNaN\b|\{\{|\}\}/.test(task);
  checks.push({id:'clean',label:'No leftover placeholders or template errors',pass:!bad});
  if (mode === 'draft') {
    const heads = (text.match(/^[A-Z][A-Z \u2019()\/-]{3,}$/gm)||[]);
    checks.push({id:'dupes',label:'No section appears twice',pass:model && model.layout==='xml' ? true : new Set(heads).size===heads.length});
  }
  checks.push({id:'size',label:'Fits the '+MAX_OUTPUT.toLocaleString('en-US')+'-character save limit',pass:text.length<=MAX_OUTPUT && text.trim().length>0});
  return checks;
}

export const allPassed = checks => checks.every(c=>c.pass);

export function metrics(raw, enhanced) {
  const words = s => s.trim().split(/\s+/).filter(Boolean).length;
  return {before: words(raw), after: words(enhanced)};
}

export function styleOptions() { return styles.filter(s=>s.id !== 'none'); }
export {targets, styles, CHECKED_ON};
