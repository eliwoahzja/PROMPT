import {inspectZip,MAX_ZIP_BYTES,buildRepairPrompt,buildAuditReportMarkdown} from './archive.js';
const $=id=>document.getElementById(id);
const make=(tag,cls='',text='')=>{const e=document.createElement(tag);if(cls)e.className=cls;e.textContent=text;return e;};
export function mountAudit({getContext,getTarget,getSession,targets,getConfiguration,saveAuditPrompt}){
  const select=$('audit-ai-used');
  targets.forEach(t=>{const option=new Option(t.label,t.id);select.append(option);});
  let archive=null,report=null,screenshotData=null,previewUrl=null;
  const status=(t,isError=false)=>{const e=$('audit-status');e.textContent=t;e.dataset.kind=isError?'error':'info';};
  $('audit-screenshot').addEventListener('change',async()=>{
    screenshotData=null;if(previewUrl)URL.revokeObjectURL(previewUrl);
    const file=$('audit-screenshot').files?.[0];if(!file){$('audit-preview').hidden=true;return;}
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>2.5*1024*1024){status('Screenshot must be a PNG, JPEG or WebP smaller than 2.5 MB.',true);$('audit-screenshot').value='';$('audit-preview').hidden=true;return;}
    previewUrl=URL.createObjectURL(file);$('audit-preview').src=previewUrl;$('audit-preview').hidden=false;
    screenshotData=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});
    $('audit-visual-rating').textContent='Screenshot ready. Select AI critique to request a visual assessment.';
  });
  const input=$('project-zip');
  input.addEventListener('change',()=>setFile(input.files?.[0]));
  const drop=$('zip-drop');
  drop.addEventListener('dragover',event=>{event.preventDefault();drop.classList.add('dropping');});
  drop.addEventListener('dragleave',()=>drop.classList.remove('dropping'));
  drop.addEventListener('drop',event=>{event.preventDefault();drop.classList.remove('dropping');setFile(event.dataTransfer.files?.[0]);});
  function setFile(file){
    if(!file)return;
    if(!/\.zip$/i.test(file.name)||file.size>MAX_ZIP_BYTES){archive=null;status('Choose a .zip file no larger than 100 MB.',true);$('zip-file-status').textContent='Archive rejected.';return;}
    archive=file;report=null;$('audit-results').hidden=true;$('audit-empty').hidden=false;$('audit-state').textContent='Ready';
    $('zip-file-status').textContent=file.name+' · '+(file.size/1024/1024).toFixed(1)+' MB';status('Ready. Choose Inspect project.');
  }
  $('audit-run').addEventListener('click',async()=>{
    if(!archive){status('Choose a project ZIP first.',true);return;}
    const button=$('audit-run');button.disabled=true;button.textContent='Reading archive…';
    try{
      report=await inspectZip(archive,{onProgress:p=>status('Inspecting source files '+p.done+'/'+p.total+'…')});
      render(report);status('Source analysis complete. Confirm visual findings by running the actual app.');
    }catch(error){status(error.message||'Unable to read this ZIP.',true);}
    finally{button.disabled=false;button.textContent='Inspect project';}
  });
  function render(a){
    $('audit-empty').hidden=true;$('audit-results').hidden=false;
    $('audit-state').textContent=a.confidence==='INSUFFICIENT'?'Insufficient':'Source review';
    $('audit-score').textContent=a.risk??'—';
    $('audit-confidence').textContent='Confidence: '+a.confidence.toLowerCase()+' · '+a.scannedCount+' of '+a.uiFileCount+' UI files sampled';
    $('audit-summary').textContent=a.entryCount+' archive entries · '+a.imageCount+' image files listed · '+a.findings.length+' flagged source patterns. Higher number means more detected risk; it is not a measurement of visual quality or proof of AI authorship.';
    $('audit-breakdown').replaceChildren(...a.ratings.map(r=>{const row=make('div','audit-bar-row');const label=make('span','',r.name);const bar=make('div','audit-bar-track');const fill=make('div','audit-bar-fill');fill.style.width=r.risk+'%';bar.append(fill);row.append(label,bar,make('strong','',String(r.risk)));return row;}));
    $('audit-findings').replaceChildren(...(a.findings.length?a.findings.slice().sort((a,b)=>b.severity-a.severity).map(f=>{
      const article=make('article','audit-finding');article.append(make('strong','',f.title),make('p','',f.area+' · severity '+f.severity+'/4 · '+f.hits+' matches'));
      const list=make('ul');f.evidence.forEach(ref=>list.append(make('li','',ref.file+':'+ref.line+' — '+ref.excerpt)));article.append(list,make('p','audit-remedy',f.action));return article;
    }):[make('p','help','No patterns were flagged in scanned source. This is not evidence that the design looks good.') ]));
    $('audit-limits').replaceChildren(...[...a.restrictions,...a.review.map(r=>r.title+': not found in scanned files; verify manually.')].map(x=>make('li','',x)));
    updatePrompt();
  }
  function updatePrompt(){
    if(!report)return;
    $('audit-prompt').value=buildRepairPrompt(report,{targetLabel:getTarget().label,aiUsed:select.value==='unknown'?'unknown':targets.find(t=>t.id===select.value)?.label||'unknown',context:getContext()});
  }
  select.addEventListener('change',updatePrompt);
  window.addEventListener('atlas-context-change',updatePrompt);
  window.addEventListener('atlas-target-change',updatePrompt);
  $('audit-copy').addEventListener('click',async()=>{updatePrompt();try{await navigator.clipboard.writeText($('audit-prompt').value);status('Repair prompt copied.');}catch{ $('audit-prompt').focus();$('audit-prompt').select();status('Select and copy the highlighted prompt.');}});
  $('audit-download').addEventListener('click',()=>{updatePrompt();const url=URL.createObjectURL(new Blob([buildAuditReportMarkdown(report,{aiUsed:select.value==='unknown'?'unknown':targets.find(t=>t.id===select.value)?.label||'unknown',repairPrompt:$('audit-prompt').value})],{type:'text/markdown'}));const link=document.createElement('a');link.href=url;link.download='ATLAS_UI_Audit_and_Repair.md';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  $('audit-save').addEventListener('click',async()=>{if(!report)return;updatePrompt();try{await saveAuditPrompt({name:report.fileName,repair:$('audit-prompt').value});status('Repair prompt saved to your history.');}catch(e){status(e.message||'Unable to save repair prompt.',true);}});
  $('audit-ai-review').addEventListener('click',async()=>{
    if(!report)return;
    const s=getSession();if(!s){status('Sign in to use optional AI critique. The local report and repair prompt work without an account.',true);return;}
    if(!getConfiguration().aiConfigured){status('AI rewriting is not configured on this deployment.',true);return;}
    if(!confirm('Send summarized findings, attached context, and '+(screenshotData?'the selected screenshot':'no screenshot')+' to the configured AI provider? The project ZIP stays on this device.'))return;
    const button=$('audit-ai-review');button.disabled=true;button.textContent='Requesting critique…';
    try{
      const response=await fetch('/api/audit',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+s.access_token},body:JSON.stringify({summary:{fileName:report.fileName,entries:report.entryCount,scanned:report.scannedCount,findings:report.findings.map(f=>({title:f.title,area:f.area,severity:f.severity,evidence:f.evidence,action:f.action})).slice(0,30)},context:getContext(),target:getTarget().label,screenshot:screenshotData}),signal:AbortSignal.timeout(50000)});
      const out=await response.json();if(!response.ok)throw new Error(out.error||'AI critique unavailable');
      $('audit-prompt').value+='\n\nOPTIONAL AI CRITIQUE (verify each claim against the project)\n'+out.review;
      if(typeof out.visualRisk==='number')$('audit-visual-rating').textContent='Visual slop risk: '+out.visualRisk+'/100 (subjective AI opinion from the provided screenshot; not an objective metric).';
      else $('audit-visual-rating').textContent='Visual rating: not assessed; no valid screenshot-based score was returned.';
      status('AI critique appended to repair prompt. No source archive was sent.');
    }catch(e){status(e.message,true);}
    finally{button.disabled=false;button.textContent='AI critique (optional)';}
  });
}
