import {buildPrompt,metrics,targets,styles} from './engine.js';

const $ = id => document.getElementById(id);
const modelSelect=$('model-select'), styleSelect=$('style-select'), detail=$('detail-group'), original=$('original-prompt');
const result=$('enhanced-prompt'), resultStatus=$('result-mode'), resultCaption=$('result-caption'), empty=$('output-empty');
let level='standard'; let supabase=null; let session=null; let configuration={databaseConfigured:false,aiConfigured:false};
let currentMode=''; let busy=false;

for(const s of styles.filter(x=>x.id!=='none')) {
  const o=document.createElement('option');o.value=s.id;o.textContent=s.name;styleSelect.appendChild(o);
}
function message(text,kind='info'){const el=$('feedback');el.textContent=text;el.dataset.kind=kind;}
function authMessage(text){$('auth-feedback').textContent=text;}
function textOfTarget(){ const p=targets.find(t=>t.id===modelSelect.value);$('target-note').textContent=p.note; }
function textOfStyle(){ const p=styles.find(t=>t.id===styleSelect.value);$('style-note').textContent=p?.id==='none'?'No preset style added.':p.suitable+' — '+p.brief.slice(0,94)+'…'; }
function updateInput(){ $('input-count').textContent=original.value.length.toLocaleString()+' / 12,000';$('draft-button').disabled=!original.value.trim(); }
function display(text,method){
  result.value=text;result.hidden=false;empty.hidden=true;currentMode=method;
  resultStatus.textContent=method==='AI'?'AI REWRITE':'STRUCTURED DRAFT';
  resultCaption.textContent=method==='AI'?'Refined by the configured AI service.':'Composed locally from transparent target-specific rules.';
  $('copy-button').disabled=false;$('save-button').disabled=false;
  const {after}=metrics(original.value,text);$('word-count').textContent=after+' WORDS';
}
function draft(){try{const out=buildPrompt({raw:original.value,target:modelSelect.value,style:styleSelect.value,depth:level});display(out,'DRAFT');message('Structured draft ready. Edit it before copying, or use AI rewrite when configured.');return out;}catch(e){message(e.message,'error');return null;}}
function persistSettings(){if(!supabase||!session)return;supabase.from('user_settings').upsert({user_id:session.user.id,preferred_target:modelSelect.value,preferred_style:styleSelect.value,preferred_depth:level},{onConflict:'user_id'}).then(({error})=>{if(error)console.warn('Settings save failed.');});}

textOfTarget();textOfStyle();updateInput();
modelSelect.addEventListener('change',()=>{textOfTarget();persistSettings();});
styleSelect.addEventListener('change',()=>{textOfStyle();persistSettings();});
detail.addEventListener('click',event=>{const b=event.target.closest('[data-depth]');if(!b)return;level=b.dataset.depth;for(const item of detail.querySelectorAll('[data-depth]')){const active=item===b;item.classList.toggle('selected',active);item.setAttribute('aria-pressed',String(active));}persistSettings();});
original.addEventListener('input',updateInput);
$('example-button').addEventListener('click',()=>{original.value='Redesign my app dashboard so it looks professionally designed, works well on phones, and keeps existing features.';modelSelect.value='codex';styleSelect.value='editorial';textOfTarget();textOfStyle();updateInput();original.focus();});
$('draft-button').addEventListener('click',draft);
$('enhance-button').addEventListener('click',async()=>{
  if(busy)return;
  const local=draft();if(!local)return;
  if(!configuration.aiConfigured || !configuration.databaseConfigured || !session){
    message(configuration.aiConfigured && configuration.databaseConfigured?'Structured draft ready. Sign in to use AI rewriting.':'Structured draft ready. Add Supabase and an AI provider key in Vercel to enable semantic rewriting.');
    return;
  }
  busy=true;const btn=$('enhance-button');btn.disabled=true;btn.firstElementChild.textContent='Enhancing…';message('Requesting a semantic rewrite…');
  try{
    const response=await fetch('/api/enhance',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.access_token},body:JSON.stringify({raw:original.value,target:modelSelect.value,style:styleSelect.value,depth:level}),signal:AbortSignal.timeout(45000)});
    let data={};try{data=await response.json();}catch{}
    if(!response.ok)throw new Error(data.error||'The rewrite service is unavailable. Your local draft is still available.');
    if(typeof data.prompt!=='string'||!data.prompt.trim())throw new Error('The rewrite service returned an empty result.');
    display(data.prompt.trim(),'AI');message('AI rewrite ready. Check the details before using it.');
    if(supabase && session) await savePrompt(true);
  }catch(error){message(error.name==='TimeoutError'?'The rewrite timed out. Your local draft is preserved.':error.message,'error');}
  finally{busy=false;btn.disabled=false;btn.firstElementChild.textContent='Enhance prompt';}
});
$('copy-button').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(result.value);message('Prompt copied.');}catch{result.focus();result.select();message('Select and copy the highlighted prompt.');}});
$('save-button').addEventListener('click',()=>savePrompt(false));
async function savePrompt(silent){
  if(!supabase || !session){if(!silent){$('auth-dialog').showModal();authMessage('Sign in to save prompts to your history.');}return;}
  if(!result.value.trim())return;
  const {error}=await supabase.from('prompts').insert({user_id:session.user.id,title:original.value.trim().slice(0,90),raw_prompt:original.value.trim(),enhanced_prompt:result.value,target:modelSelect.value,style:styleSelect.value,depth:level,method:currentMode});
  if(error){if(!silent)message('Could not save the prompt. Check your Supabase setup.','error');return;}
  if(!silent)message('Saved to your history.');await refreshHistoryCount();
}

$('auth-dialog').addEventListener('close',()=>authMessage(''));
$('account-button').addEventListener('click',()=>{$('auth-dialog').showModal();if(session)authMessage('Signed in as '+session.user.email);});
$('auth-form').addEventListener('submit',async e=>{e.preventDefault();if(!supabase){authMessage('Supabase is not configured. See README.md.');return;}const email=$('email-input').value.trim();if(!email)return;const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname}});authMessage(error?'Could not send the sign-in email. Check Auth redirect URLs.':'Check your email for the sign-in link.');});
$('sign-out').addEventListener('click',async()=>{if(supabase)await supabase.auth.signOut();$('auth-dialog').close();});
$('history-link').addEventListener('click',async()=>{$('history-dialog').showModal();await loadHistory();});
$('history-refresh').addEventListener('click',loadHistory);
$('research-button').addEventListener('click',()=>$('research-dialog').showModal());

function updateSession(newSession){session=newSession;$('account-button').firstChild.textContent=session?'Account ':'Sign in ';$('sign-out').hidden=!session;$('auth-form').hidden=!!session;if(session)authMessage('Signed in as '+session.user.email);refreshHistoryCount();}
async function refreshHistoryCount(){if(!session||!supabase){$('history-count').textContent='0';return;}const {count,error}=await supabase.from('prompts').select('id',{count:'exact',head:true});if(!error)$('history-count').textContent=String(count??0);}
async function loadHistory(){const list=$('history-list');list.replaceChildren();if(!session||!supabase){$('history-explainer').textContent='Sign in to access your saved prompts.';return;}$('history-explainer').textContent='Only you can access your saved prompts.';
  const {data,error}=await supabase.from('prompts').select('id,title,raw_prompt,enhanced_prompt,target,style,depth,created_at,method').order('created_at',{ascending:false}).limit(30);
  if(error){const d=document.createElement('p');d.className='history-empty';d.textContent='Could not load history. Review the database schema and permissions.';list.appendChild(d);return;}
  if(!data.length){const d=document.createElement('p');d.className='history-empty';d.textContent='Nothing saved yet. Enhance a prompt, then select Save to history.';list.appendChild(d);return;}
  for(const record of data){const row=document.createElement('article');row.className='history-entry';const title=document.createElement('div');const h=document.createElement('h3');h.textContent=record.title||'Untitled prompt';const small=document.createElement('small');small.textContent=record.target.toUpperCase()+'  /  '+new Date(record.created_at).toLocaleDateString();title.append(h,small);
    const actions=document.createElement('div');actions.className='history-actions';const use=document.createElement('button');use.type='button';use.textContent='Open';use.addEventListener('click',()=>{original.value=record.raw_prompt;modelSelect.value=record.target;styleSelect.value=record.style;level=['compact','standard','thorough'].includes(record.depth)?record.depth:'standard';for(const b of detail.querySelectorAll('[data-depth]')){const active=b.dataset.depth===level;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));}updateInput();textOfTarget();textOfStyle();display(record.enhanced_prompt,record.method==='AI'?'AI':'DRAFT');$('history-dialog').close();$('workbench').scrollIntoView({behavior:'smooth'});});const del=document.createElement('button');del.type='button';del.className='delete';del.textContent='Delete';del.setAttribute('aria-label','Delete '+record.title);del.addEventListener('click',async()=>{if(!confirm('Delete this saved prompt?'))return;const {error}=await supabase.from('prompts').delete().eq('id',record.id);if(error){message('Delete failed.','error');return;}await loadHistory();await refreshHistoryCount();});actions.append(use,del);row.append(title,actions);list.appendChild(row);
  }
}

async function initialize(){
  try{const response=await fetch('/api/config',{signal:AbortSignal.timeout(6000)});if(response.ok)configuration=await response.json();}catch{}
  const available=configuration.databaseConfigured && configuration.aiConfigured;
  $('connection-status').innerHTML='';const dot=document.createElement('span');dot.className='status-dot';$('connection-status').append(dot,document.createTextNode(available?' AI service ready':' Local drafting available'));
  if(!configuration.databaseConfigured)return;
  try{
    const module=await import('https://esm.sh/@supabase/supabase-js@2.95.0');
    supabase=module.createClient(configuration.supabaseUrl,configuration.supabaseAnonKey,{auth:{detectSessionInUrl:true,autoRefreshToken:true,persistSession:true}});
    const {data}=await supabase.auth.getSession();updateSession(data.session);
    supabase.auth.onAuthStateChange((_event,next)=>{updateSession(next);if(next)queueMicrotask(()=>loadSettings());});
    if(data.session)await loadSettings();
  }catch{message('Account sync is unavailable. Local drafting still works.','error');}
}
async function loadSettings(){if(!session||!supabase)return;const {data}=await supabase.from('user_settings').select('preferred_target,preferred_style,preferred_depth').maybeSingle();if(!data)return;if(targets.some(t=>t.id===data.preferred_target))modelSelect.value=data.preferred_target;if(styles.some(s=>s.id===data.preferred_style))styleSelect.value=data.preferred_style;if(['compact','standard','thorough'].includes(data.preferred_depth))level=data.preferred_depth;for(const b of detail.querySelectorAll('[data-depth]')){const active=b.dataset.depth===level;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));}textOfTarget();textOfStyle();}
initialize();
