import {targets, styles, aiGuardrails} from './data.js';

const uiPattern = /\b(ui|ux|website|web ?app|webpage|landing|dashboard|frontend|front.end|design|interface|html|css|tailwind|react|flutter|android|screen|component|app)\b/i;
const codingPattern = /\b(code|bug|fix|refactor|repository|repo|compile|build|test|implement|developer|javascript|typescript|python|kotlin|api|backend|android)\b/i;
const extraStyles = styles.filter(s=>s.id !== 'none');

export function buildPrompt({raw, target='chatgpt', style='none', depth='standard'}) {
  const task = String(raw||'').trim();
  if (!task) throw new Error('Enter a prompt first.');
  if (task.length > 12000) throw new Error('Your prompt exceeds 12,000 characters.');
  const model = targets.find(x=>x.id===target);
  const chosen = styles.find(x=>x.id===style);
  if (!model || !chosen) throw new Error('Choose a supported target and design style.');
  if (!['compact','standard','thorough'].includes(depth)) throw new Error('Invalid level of detail.');
  const design = chosen.id !== 'none' || uiPattern.test(task);
  const coding = model.class === 'agent' || codingPattern.test(task);
  const parts = [];
  if(depth==='compact') {
    parts.push('TASK\n'+task);
    parts.push('TARGET ENVIRONMENT\n'+model.label);
    parts.push('DELIVERY RULES\n'+model.template);
    if(chosen.id !== 'none') parts.push('VISUAL DIRECTION — '+chosen.name.toUpperCase()+'\n'+chosen.brief);
    if(design) parts.push('QUALITY\nUse real content, specific typography and layout, keyboard/mobile accessibility and purposeful motion. Avoid generic visual filler.');
    parts.push('OUTPUT\nDeliver the requested result, not a discussion about it. State any unverified assumptions briefly.');
  } else {
    parts.push('OBJECTIVE\n'+task);
    parts.push('TARGET\n'+model.label+' — '+model.tag+'.');
    parts.push('EXECUTION INSTRUCTIONS\n'+model.template);
    parts.push('CONSTRAINTS\n- Preserve every named requirement, existing API, technology, file, and user-supplied reference.\n- Do not invent missing facts or claim tools, repository access or tests you have not actually used.\n- Ask a focused question only if an essential missing fact blocks safe progress; otherwise proceed with a stated assumption.');
    if(coding) parts.push('ENGINEERING DISCIPLINE\n- Inspect relevant code and its callers before making changes when source is available.\n- Change only what the task requires and preserve working behavior.\n- Run available checks; label real outcomes PASSED, FAILED or BLOCKED.\n- Report changed files and unresolved risks.');
    if(design) {
      parts.push('DESIGN DIRECTION\n'+(chosen.id==='none' ? 'Choose one distinctive style suited to the audience and subject. Explain your choice in one sentence before implementation.' : chosen.name+': '+chosen.brief));
      parts.push(aiGuardrails);
    }
    if(depth==='thorough') {
      parts.push('SELF-REVIEW BEFORE DELIVERY\nReview the result as (1) an implementer for correctness and regression risk; (2) a design critic for hierarchy, specificity and restraint where relevant; and (3) a user for clarity. Fix meaningful weaknesses. Do not invent verification or demand private reasoning transcripts.');
      parts.push('ACCEPTANCE CHECK\n- The original request is satisfied, with no silently dropped constraints.\n- The result is operational in the declared environment where tools permit.\n- Failure/empty/loading states are described where applicable.\n- The output is concise enough to act on immediately.');
    }
    parts.push('FINAL OUTPUT\nProvide the requested deliverable first. Include short implementation notes, verified test results and clearly marked limitations only when relevant.');
  }
  return parts.join('\n\n');
}

export function metrics(raw, enhanced) {
  const words = s => s.trim().split(/\s+/).filter(Boolean).length;
  return {before: words(raw), after: words(enhanced)};
}

export function styleOptions() { return extraStyles; }
export {targets, styles};
