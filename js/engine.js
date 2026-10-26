import {contextBrief} from './work-context.js';
import {rewriteRequest} from './rewrite.js';
import {vocabulary} from './vocabulary.js';
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

const NEGATED=/\b(?:no|not|never|without|avoid|don'?t|do not|skip|remove|ban(?:ned)?)\b[^.\n;,]{0,30}$/i;
const appWords=/\b(?:app|ios|android|flutter|swiftui|kotlin|react native|jetpack|screen)\b/i;
/** Turn vague phrases into named, checkable instructions (js/data.js sharpeners plus js/vocabulary.js).
 *  A phrase the user negated ("no gradients") is never "sharpened" into the opposite. */
export function sharpen(raw,{design=true,app=false,limit=8}={}){
  const seen=new Set(), out=[], webWords=/\b(?:website|web ?app|web ?site|landing|site|browser|html|css)\b/i.test(raw);
  const all=[...sharpeners.map(s=>({...s,kind:'design',area:'Design'})),...vocabulary];
  for(const s of all){
    if((s.kind==='design'||s.kind==='web'||s.kind==='app')&&!design)continue;
    if(s.kind==='app'&&!app)continue;
    if(s.kind==='web'&&app&&!webWords)continue;
    const m=new RegExp(s.re.source,s.re.flags.replace('g','')).exec(raw);
    if(!m||NEGATED.test(raw.slice(Math.max(0,m.index-40),m.index))||seen.has(s.from))continue;
    seen.add(s.from);out.push({from:s.from,to:s.to,area:s.area});
  }
  return out.slice(0,limit);
}


const INTENTS=[
  ['fix',/\b(fix|bug|broken|not working|doesn'?t work|error|crash(?:es|ing)?|fails?|failing|regression|stuck)\b/i],
  ['refactor',/\b(refactor|clean ?up|restructure|migrate|port|rewrite)\b/i],
  ['review',/\b(review|audit|critique|rate|analy[sz]e|inspect|check whether)\b/i],
  ['explain',/\b(explain|why does|how does|what is|teach|summari[sz]e)\b/i],
  ['write',/\b(write|draft|compose|email|blog|article|caption|copy for)\b/i],
  ['build',/\b(build|create|make|develop|generate|design|add|implement|set up|turn .+ into)\b/i]
];
const DONE={
  fix:['The reported symptom is reproduced before the change and gone after it.','The root cause is named, not just hidden.','Nearby behaviour still works; name the check that shows it.'],
  refactor:['Behaviour is unchanged: existing tests give the same results before and after.','Public names, routes and data formats are preserved unless the request says otherwise.','The diff touches only what the request names.'],
  review:['Each finding cites a file and line, or quotes the excerpt.','Findings are ordered by severity and marked confirmed or suspected.','Nothing is changed unless the request asks for changes.'],
  explain:['The answer to the actual question comes first, then the support.','Anything uncertain is marked as uncertain.'],
  write:['The tone and audience match what the request states or implies.','No invented facts, quotes or statistics.'],
  build:['Every requirement can be demonstrated, not just claimed.','Empty, loading and error states are handled.','Assumptions are listed.']
};
/** Read the request itself: what kind of task it is, which limits the user stated, and what is still unknown. */
export function analyzeTask(raw){
  const task=String(raw||'').trim();
  const intent=(INTENTS.find(([,re])=>re.test(task))||['general'])[0];
  const words=task.split(/\s+/).filter(Boolean).length;
  const constraints=task.split(/(?<=[.!?\n])\s+/).map(x=>x.trim()).filter(x=>x.length>6&&/\b(must|never|don'?t|do not|only|without|at least|at most|exactly|keep|preserve|no more than|should not|avoid)\b/i.test(x)).map(x=>x.slice(0,180)).slice(0,6);
  const has=re=>re.test(task), ui=uiPattern.test(task), gaps=[];
  if(intent==='fix'&&!has(/\b(error|exception|stack|log|screenshot|steps|expected|instead|when i|happens when)\b/i))gaps.push('What exactly happens, and what should happen instead? Paste the error text or the steps to reproduce it.');
  if(intent==='build'&&!has(/\b(for|users?|audience|customers?|students?|team|developers?|visitors?)\b/i))gaps.push('Who is it for?');
  if(intent==='build'&&ui&&!has(/\b(mobile|desktop|responsive|ios|android|web|tablet|phone)\b/i))gaps.push('Which platform and screen sizes must it work on?');
  if(intent==='build'&&!TECH.some(t=>new RegExp('(?<![\\w.])'+escapeRe(t)+'(?![\\w])','i').test(task)))gaps.push('Which stack should it use, or may the agent choose?');
  if(intent==='review'&&!has(/\b(file|repo|zip|code|url|attached|diff|pr|pull request)\b/i))gaps.push('Which files, repository or URL should be reviewed?');
  if(words<12)gaps.push('Describe the result you want to see when this is finished.');
  return {intent,words,constraints,gaps};
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
export function buildResult({raw, target='chatgpt', style='none', depth='standard', hallmark=false, context=''}) {
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
  const rewrite = rewriteRequest(task);
  const isApp = chosen.group === 'Apps' || appWords.test(task);
  const sharpened = sharpen(rewrite.text, {design:isDesign, app:isApp, limit:depth==='compact'?4:depth==='thorough'?14:8});
  const analysis = analyzeTask(rewrite.text.replace(/^- /gm,''));
  const S = []; // {key,title,body}

  S.push({key:'request',title:'Request (cleaned)',body:rewrite.text});
  if(context) S.push({key:'workcontext',title:'Work context',body:contextBrief(context)});
  if (tokens.length) S.push({key:'keep',title:'Keep exactly as written',body:tokens.join(', ')});
  if (sharpened.length) S.push({key:'specifics',title:'Vague phrases made specific',body:bullets(sharpened.map(s=>'\u201c'+s.from+'\u201d \u2192 '+s.to))});

  if (analysis.constraints.length) S.push({key:'constraints',title:'Limits you stated',body:bullets(analysis.constraints)});
  if (analysis.gaps.length && depth !== 'compact') S.push({key:'gaps',title:'Resolve first',body:'These are not in your request. Ask about them, or state the assumption you make:\n'+bullets(analysis.gaps)});

  const how = depth === 'compact' ? model.how.slice(0,2) : model.how;
  S.push({key:'how',title:'How to work',body:model.layout==='numbered'?numbered(how):bullets(how)});

  if (depth !== 'compact') {
    S.push({key:'scope',title:'Scope',body:bullets([
      'Do only what the request asks. Add no extra features, files, sections or styling.',
      'Keep every name, number, technology and exclusion from the request.'])});
    const doneBase = DONE[analysis.intent] || ['Every requirement in the request is met.','The output is in the requested format.','Assumptions are listed, not hidden.'];
    S.push({key:'done',title:'Done when',body:bullets(isCoding && analysis.intent!=='explain' && analysis.intent!=='write' ? doneBase.concat(['A check you actually ran passes, or you state which check could not be run.']) : doneBase)});
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
  const words = analysis.words;
  if (rewrite.fallback) warnings.unshift('The request could not be cleaned safely'+(rewrite.lost.length?' (it would have lost: '+rewrite.lost.join(', ')+')':'')+', so it is included as you wrote it.');
  else if (rewrite.changes.length) warnings.unshift('Rewrote your request: '+rewrite.changes.slice(0,4).map(c=>c.kind==='filler'?'removed filler':'\u201c'+c.from+'\u201d \u2192 \u201c'+c.to+'\u201d').join('; ')+(rewrite.changes.length>4?'; and '+(rewrite.changes.length-4)+' more.':'.'));
  if (analysis.gaps.length) warnings.unshift('Read as a '+analysis.intent+' task. '+analysis.gaps.length+' gap'+(analysis.gaps.length>1?'s':'')+' flagged under Resolve first.');
  if (words < 8) warnings.push('Your request is only '+words+' words. The prompt can add structure, but only you can add the audience, the outcome and the limits.');

  const checks = verifyPrompt(task, prompt, {target, style, depth, mode:'draft', hallmark, context});
  return {prompt, checks, tokens, sharpened, warnings, analysis, rewrite, isDesign, isCoding, hallmarkApplied:hallmark && isDesign};
}

export function buildPrompt(opts) { return buildResult(opts).prompt; }

/**
 * Real checks on a finished prompt. Nothing here predicts how a model will answer;
 * it only proves what the text contains.
 * mode 'draft': the local composer (cleaned request included; exact strings kept).
 * mode 'AI': a model rewrote it, so required strings are checked individually.
 */
export function verifyPrompt(raw, out, {target='chatgpt', style='none', depth='standard', mode='draft', hallmark=false, context=''} = {}) {
  const task = String(raw||'').trim();
  const text = String(out||'');
  const model = targets.find(x=>x.id===target);
  const chosen = styles.find(x=>x.id===style);
  const tokens = extractTokens(task);
  const missing = tokens.filter(t=>!text.toLowerCase().includes(t.toLowerCase()));
  const checks = [];
  if (mode === 'draft') {const rw=rewriteRequest(task);checks.push({id:'verbatim',label:rw.fallback?'Your request is included as written':'Your cleaned-up request is included',pass:text.includes(rw.text)});}
  checks.push({id:'tokens',label:tokens.length ? 'All '+tokens.length+' exact names, numbers and links are kept' : 'No exact names or numbers needed protecting',pass:missing.length===0,detail:missing.length?'Missing: '+missing.join(', '):''});
  if (mode === 'draft' && model) {
    const ok = model.layout==='xml' ? /<request>[\s\S]*<\/request>/.test(text)
      : model.layout==='numbered' ? /(^|\n)1\. /.test(text)
      : /(^|\n)REQUEST \(CLEANED\)\n/.test(text);
    checks.push({id:'layout',label:'Structure matches the '+model.label+' template',pass:ok});
  }
  if(context){
    const anchors=extractTokens(context).slice(0,12);
    const present=text.includes('WORK CONTEXT') && anchors.every(t=>text.toLowerCase().includes(t.toLowerCase()));
    checks.push({id:'context',label:'Attached work context and exact anchors are preserved',pass:present,detail:present?'':'Rewrite omitted supplied project context.'});
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
