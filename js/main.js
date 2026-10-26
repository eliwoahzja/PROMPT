import {enhanceSelect} from './combobox.js';
import {mountAudit} from './audit-ui.js';
import {readWorkContext} from './work-context.js';
import {buildResult,allPassed,metrics,targets,styles,CHECKED_ON} from './engine.js';
import {researchSources,skillNotes} from './data.js';

const $ = id => document.getElementById(id);
const styleSelect=$('style-select'), targetSelect=$('target-select'), detail=$('detail-group'), original=$('original-prompt'), hallmarkToggle=$('hallmark-review');
const result=$('enhanced-prompt'), resultStatus=$('result-mode'), resultCaption=$('result-caption'), empty=$('output-empty');
const EVIDENCE={official:'Official guide',docs:'Vendor docs only',none:'No official guide'};
let level='standard', supabase=null, session=null, currentMode='', busy=false, target='chatgpt';
let configuration={databaseConfigured:false,aiConfigured:false};
let workContext=null;

function el(tag,props={},...kids){const n=document.createElement(tag);for(const [k,v] of Object.entries(props)){if(k==='class')n.className=v;else if(k==='text')n.textContent=v;else n.setAttribute(k,v);}n.append(...kids);return n;}
const modelById=id=>targets.find(t=>t.id===id);
const message=(text,kind='info')=>{const f=$('feedback');f.textContent=text;f.dataset.kind=kind;};
const authMessage=text=>{$('auth-feedback').textContent=text;};

/* One Markdown attachment informs both workspaces; raw files remain local. */
const currentContext=()=>workContext?.text||'';
$('context-upload').addEventListener('change',async()=>{
  try{
    const file=$('context-upload').files?.[0];if(!file)return;
    workContext=await readWorkContext(file);
    $('context-status').textContent=workContext.name+' · '+(workContext.truncated?'first 10,500 characters included':'fully included');
    $('context-clear').hidden=false;
    window.dispatchEvent(new Event('atlas-context-change'));
    message('Work context attached. Next enhancement will use it. Review for sensitive credentials before sharing your prompt.');
  }catch(error){$('context-status').textContent=error.message;$('context-upload').value='';workContext=null;$('context-clear').hidden=true;window.dispatchEvent(new Event('atlas-context-change'));}
});
$('context-clear').addEventListener('click',()=>{workContext=null;$('context-upload').value='';$('context-status').textContent='Not attached · max 512 KB';$('context-clear').hidden=true;window.dispatchEvent(new Event('atlas-context-change'));});
const toggleWorkspace=audit=>{
  document.querySelector('.hero').hidden=audit;
  $('workbench').hidden=audit;
  document.querySelector('.method').hidden=audit;
  $('audit-workspace').hidden=!audit;
  $('tab-compose').setAttribute('aria-current',audit?'false':'page');
  $('tab-audit').setAttribute('aria-current',audit?'page':'false');
};
$('tab-compose').addEventListener('click',()=>toggleWorkspace(false));
$('tab-audit').addEventListener('click',()=>toggleWorkspace(true));


/* ---- build controls ---- */
const sections=[
  {label:'Platforms & coding agents',ids:['freebuff','chatgpt','kilo','codex','cursor','lovable']},
  {label:'OpenAI models',ids:['gpt6-chat','gpt6-astra','gpt6-1-sol','gpt6-sol','gpt6-luna']},
  {label:'Other AI models',ids:['mimo','zai','deepseek','deepseek-v4-1-flash-1017']}
];
for(const section of sections){
  const group=el('optgroup',{label:section.label});
  for(const id of section.ids){
    const t=targets.find(x=>x.id===id);
    if(!t)throw new Error('Missing target profile: '+id);
    group.append(el('option',{value:t.id,text:t.label}));
  }
  targetSelect.append(group);
}
if(targetSelect.querySelectorAll('option').length!==targets.length)throw new Error('A target is missing from the selector.');
targetSelect.value=target;
for(const grp of ['Websites and apps','Websites','Apps']){
  const g=el('optgroup',{label:grp});
  for(const s of styles.filter(x=>x.id!=='none'&&(x.group||'Websites and apps')===grp))g.append(el('option',{value:s.id,text:s.name,'data-keywords':s.suitable}));
  styleSelect.append(g);
}
for(const o of targetSelect.querySelectorAll('option')){const t=modelById(o.value);if(t)o.dataset.keywords=[t.id,t.kind,t.note].filter(Boolean).join(' ');}
targetSelect.dataset.placeholder='Search platforms and models';styleSelect.dataset.placeholder='Search styles, e.g. iOS, dashboard, print';
for(const sel of [targetSelect,styleSelect,$('audit-ai-used')])if(sel)enhanceSelect(sel);
$('checked-on').textContent=CHECKED_ON;

function renderTargetNote(){
  const t=modelById(target), note=$('target-note');
  note.replaceChildren(el('span',{class:'evidence','data-level':t.evidence,text:EVIDENCE[t.evidence]}),document.createTextNode(t.note));
}
function renderStyleNote(){
  const s=styles.find(x=>x.id===styleSelect.value);
  $('style-note').textContent=s.id==='none'?'No preset style. UI requests still get anti-generic rules.':s.suitable+'. '+s.idea;
}
function setDepth(next){
  level=['compact','standard','thorough'].includes(next)?next:'standard';
  for(const b of detail.querySelectorAll('[data-depth]'))b.setAttribute('aria-pressed',String(b.dataset.depth===level));
}
function updateInput(){$('input-count').textContent=original.value.length.toLocaleString('en-US')+' / 12,000';$('draft-button').disabled=!original.value.trim();}

/* ---- rendering a result ---- */
function renderReceipt(checks,notes){
  const list=$('receipt');list.replaceChildren();
  for(const c of checks){
    const li=el('li',{},el('span',{class:'badge','data-pass':String(c.pass),text:c.pass?'PASS':'FAIL'}),el('span',{text:c.label}));
    if(!c.pass&&c.detail)li.append(el('span',{class:'detail',text:c.detail}));
    list.append(li);
  }
  const passed=checks.filter(c=>c.pass).length;
  $('receipt-score').textContent=passed+'/'+checks.length;
  const n=$('notes');n.replaceChildren(...notes.map(t=>el('li',{text:t})));
  $('receipt-wrap').hidden=false;
}
function renderSources(){
  const t=modelById(target);
  $('sources-evidence').textContent=t.evidenceNote;
  $('sources').replaceChildren(...t.sources.map(s=>el('li',{},el('a',{href:s.url,target:'_blank',rel:'noopener',text:s.label}))));
  $('sources-date').textContent='Checked '+CHECKED_ON+'. Vendors change their docs; re-check before you rely on this.';
  $('sources-wrap').hidden=false;
}
function display(text,method,checks,notes){
  result.value=text;result.hidden=false;empty.hidden=true;currentMode=method;
  const ai=method==='AI';
  resultStatus.textContent=ai?'AI rewrite':'Structured draft';resultStatus.dataset.state=ai?'ai':'draft';
  resultCaption.textContent=ai?'Rewritten by the AI service, then re-checked.':'Built locally from the '+modelById(target).label+' template.';
  $('copy-button').disabled=false;$('save-button').disabled=false;
  $('word-count').textContent=metrics(original.value,text).after.toLocaleString('en-US')+' words';
  if(checks)renderReceipt(checks,notes||[]);
  renderSources();
}
function draft(){
  try{
    const r=buildResult({raw:original.value,target,style:styleSelect.value,depth:level,hallmark:hallmarkToggle.checked,context:currentContext()});
    display(r.prompt,'DRAFT',r.checks,r.warnings);
    message(allPassed(r.checks)?'Draft ready. All checks passed.':'Draft ready, but a check failed. Read the receipt before you copy.',allPassed(r.checks)?'info':'error');
    return r;
  }catch(e){message(e.message,'error');return null;}
}

/* ---- events ---- */
targetSelect.addEventListener('change',()=>{target=targetSelect.value;renderTargetNote();persistSettings();window.dispatchEvent(new Event('atlas-target-change'));});
styleSelect.addEventListener('change',()=>{renderStyleNote();persistSettings();});
hallmarkToggle.addEventListener('change',()=>{persistSettings();});
detail.addEventListener('click',e=>{const b=e.target.closest('[data-depth]');if(!b)return;setDepth(b.dataset.depth);persistSettings();});
original.addEventListener('input',updateInput);
$('example-button').addEventListener('click',()=>{
  original.value='Build a booking page for my dog-grooming shop. Customers pick a service and a time slot. Use React and Supabase. Make it modern and mobile friendly.';
  target='lovable';targetSelect.value=target;styleSelect.value='neobrutalism';
  renderTargetNote();renderStyleNote();updateInput();original.focus();
});
$('draft-button').addEventListener('click',draft);
$('enhance-button').addEventListener('click',async()=>{
  if(busy)return;
  const local=draft();if(!local)return;
  if(!configuration.aiConfigured||!configuration.databaseConfigured||!session){
    $('engine-note').textContent=configuration.aiConfigured&&configuration.databaseConfigured?'Sign in to add an AI rewrite on top of this draft.':'AI rewrite is off until Supabase and an AI key are set in Vercel. The structured draft above is complete.';
    return;
  }
  if(workContext && !confirm('The attached context.md excerpt will be included in the AI rewrite request. Review it for private data before continuing. Send it now?'))return;
  busy=true;const btn=$('enhance-button');btn.disabled=true;btn.firstElementChild.textContent='Enhancing\u2026';message('Requesting an AI rewrite\u2026');
  try{
    const response=await fetch('/api/enhance',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.access_token},body:JSON.stringify({raw:original.value,target,style:styleSelect.value,depth:level,hallmark:hallmarkToggle.checked,context:currentContext()}),signal:AbortSignal.timeout(45000)});
    let data={};try{data=await response.json();}catch{}
    if(!response.ok)throw new Error(data.error||'The rewrite service is unavailable. Your local draft is still here.');
    if(typeof data.prompt!=='string'||!data.prompt.trim())throw new Error('The rewrite service returned an empty result.');
    const ai=data.mode==='ai';
    display(data.prompt.trim(),ai?'AI':'DRAFT',data.checks||local.checks,ai?local.warnings:local.warnings.concat(data.notice?[data.notice]:[]));
    message(ai?'AI rewrite ready and re-checked.':data.notice||'Kept the verified draft.',ai?'info':'error');
    if(supabase&&session)await savePrompt(true);
  }catch(error){message(error.name==='TimeoutError'?'The rewrite timed out. Your local draft is kept.':error.message,'error');}
  finally{busy=false;btn.disabled=false;btn.firstElementChild.textContent='Enhance prompt';}
});
$('copy-button').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(result.value);message('Prompt copied.');}catch{result.focus();result.select();message('Select and copy the highlighted prompt.');}});
$('save-button').addEventListener('click',()=>savePrompt(false));

/* ---- research dialog ---- */
function renderResearch(){
  const box=$('research-content');box.replaceChildren();
  box.append(el('p',{text:'Every source below was opened and read while building this version, on '+CHECKED_ON+'. Where a vendor publishes no prompting guide, ATLAS says so on the template instead of guessing.'}));
  for(const g of researchSources){
    box.append(el('h3',{text:g.group}));
    box.append(el('ul',{},...g.items.map(i=>el('li',{},el('a',{href:i.url,target:'_blank',rel:'noopener',text:i.label}),el('span',{text:i.use})))));
  }
  box.append(el('h3',{text:'Skills'}));
  box.append(el('ul',{},...skillNotes.map(s=>el('li',{},s.url?el('a',{href:s.url,target:'_blank',rel:'noopener',text:s.name}):el('strong',{text:s.name}),el('span',{text:s.purpose})))));
}
$('research-button').addEventListener('click',()=>{if(!$('research-content').children.length)renderResearch();$('research-dialog').showModal();});

/* ---- account, history ---- */
function persistSettings(){if(!supabase||!session)return;supabase.from('user_settings').upsert({user_id:session.user.id,preferred_target:target,preferred_style:styleSelect.value,preferred_depth:level,preferred_hallmark:hallmarkToggle.checked},{onConflict:'user_id'}).then(({error})=>{if(error)console.warn('Settings save failed.');});}
async function savePrompt(silent){
  if(!supabase||!session){if(!silent){$('auth-dialog').showModal();authMessage('Sign in to save prompts to your history.');}return;}
  if(!result.value.trim())return;
  const {error}=await supabase.from('prompts').insert({user_id:session.user.id,title:original.value.trim().slice(0,90),raw_prompt:original.value.trim(),enhanced_prompt:result.value,target,style:styleSelect.value,depth:level,method:currentMode,hallmark:hallmarkToggle.checked});
  if(error){if(!silent)message('Could not save the prompt. Check your Supabase setup.','error');return;}
  if(!silent)message('Saved to your history.');await refreshHistoryCount();
}
$('auth-dialog').addEventListener('close',()=>authMessage(''));
$('account-button').addEventListener('click',()=>{$('auth-dialog').showModal();if(session)authMessage('Signed in as '+session.user.email);});
$('auth-form').addEventListener('submit',async e=>{e.preventDefault();if(!supabase){authMessage('Supabase is not configured. See README.md.');return;}const email=$('email-input').value.trim();if(!email)return;const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname}});authMessage(error?'Could not send the sign-in email. Check Auth redirect URLs.':'Check your email for the sign-in link.');});
$('sign-out').addEventListener('click',async()=>{if(supabase)await supabase.auth.signOut();$('auth-dialog').close();});
$('history-link').addEventListener('click',async()=>{$('history-dialog').showModal();await loadHistory();});
$('history-refresh').addEventListener('click',loadHistory);

function updateSession(next){
  session=next;$('account-button').textContent=session?'Account':'Sign in';$('sign-out').hidden=!session;$('auth-form').hidden=!!session;
  if(session)authMessage('Signed in as '+session.user.email);refreshHistoryCount();
}
async function refreshHistoryCount(){
  if(!session||!supabase){$('history-count').textContent='0';return;}
  const {count,error}=await supabase.from('prompts').select('id',{count:'exact',head:true});
  if(!error)$('history-count').textContent=String(count??0);
}
function openRecord(r){
  original.value=r.raw_prompt;
  if(modelById(r.target)){target=r.target;targetSelect.value=target;}
  if(styles.some(s=>s.id===r.style))styleSelect.value=r.style;hallmarkToggle.checked=r.hallmark!==false;
  setDepth(r.depth);updateInput();renderTargetNote();renderStyleNote();
  let notes=[],checks=null;
  try{const re=buildResult({raw:r.raw_prompt,target,style:styleSelect.value,depth:level});checks=re.checks;notes=re.warnings;}catch{}
  display(r.enhanced_prompt,r.method==='AI'?'AI':'DRAFT',checks,notes);
  $('history-dialog').close();$('workbench').scrollIntoView({behavior:'smooth'});
}
async function loadHistory(){
  const list=$('history-list');list.replaceChildren();
  if(!session||!supabase){$('history-explainer').textContent='Sign in to see your saved prompts.';return;}
  $('history-explainer').textContent='Only you can see these.';
  const {data,error}=await supabase.from('prompts').select('id,title,raw_prompt,enhanced_prompt,target,style,depth,created_at,method,hallmark').order('created_at',{ascending:false}).limit(30);
  if(error){list.append(el('p',{class:'history-empty',text:'Could not load history. Check the database schema and permissions.'}));return;}
  if(!data.length){list.append(el('p',{class:'history-empty',text:'Nothing saved yet. Enhance a prompt, then choose Save to history.'}));return;}
  for(const r of data){
    const open=el('button',{type:'button',text:'Open'});open.addEventListener('click',()=>openRecord(r));
    const del=el('button',{type:'button',class:'delete',text:'Delete','aria-label':'Delete '+(r.title||'prompt')});
    del.addEventListener('click',async()=>{if(!confirm('Delete this saved prompt?'))return;const {error:e}=await supabase.from('prompts').delete().eq('id',r.id);if(e){message('Delete failed.','error');return;}await loadHistory();await refreshHistoryCount();});
    list.append(el('article',{class:'history-entry'},el('div',{},el('h3',{text:r.title||'Untitled prompt'}),el('small',{text:(modelById(r.target)?.label||r.target)+'  \u00b7  '+new Date(r.created_at).toLocaleDateString()})),el('div',{class:'history-actions'},open,del)));
  }
}
async function loadSettings(){
  if(!session||!supabase)return;
  const {data}=await supabase.from('user_settings').select('preferred_target,preferred_style,preferred_depth,preferred_hallmark').maybeSingle();if(!data)return;
  if(modelById(data.preferred_target)){target=data.preferred_target;targetSelect.value=target;}
  if(styles.some(s=>s.id===data.preferred_style))styleSelect.value=data.preferred_style;
  setDepth(data.preferred_depth);hallmarkToggle.checked=data.preferred_hallmark!==false;renderTargetNote();renderStyleNote();
}
async function initialize(){
  try{const response=await fetch('/api/config',{signal:AbortSignal.timeout(6000)});if(response.ok)configuration=await response.json();}catch{}
  if(configuration.aiConfigured&&configuration.databaseConfigured)$('engine-note').textContent='AI rewrite is available when you are signed in. Every rewrite is re-checked.';
  if(!configuration.databaseConfigured)return;
  try{
    const module=await import('https://esm.sh/@supabase/supabase-js@2.95.0');
    supabase=module.createClient(configuration.supabaseUrl,configuration.supabaseAnonKey,{auth:{detectSessionInUrl:true,autoRefreshToken:true,persistSession:true}});
    const {data}=await supabase.auth.getSession();updateSession(data.session);
    supabase.auth.onAuthStateChange((_e,next)=>{updateSession(next);if(next)queueMicrotask(()=>loadSettings());});
    if(data.session)await loadSettings();
  }catch{message('Account sync is unavailable. Local drafting still works.','error');}
}

renderTargetNote();renderStyleNote();setDepth('standard');updateInput();
mountAudit({getContext:currentContext,getTarget:()=>modelById(target),getSession:()=>session,targets,getConfiguration:()=>configuration,
  saveAuditPrompt:async({name,repair})=>{
    if(!session||!supabase){$('auth-dialog').showModal();authMessage('Sign in before saving a repair prompt.');throw new Error('Sign-in required.');}
    if(repair.length>40000)throw new Error('Repair prompt exceeds the 40,000-character history limit. Download the Markdown instead.');
    const {error}=await supabase.from('prompts').insert({user_id:session.user.id,title:('UI audit — '+name).slice(0,90),raw_prompt:('Review and repair the UI of '+name).slice(0,12000),enhanced_prompt:repair,target,style:'none',depth:'thorough',method:'DRAFT',hallmark:true});
    if(error)throw new Error('Unable to save to Supabase. Check the database configuration.');
    await refreshHistoryCount();
  }
});
initialize();
