import test from 'node:test';
import assert from 'node:assert/strict';
import {buildResult,buildPrompt,verifyPrompt,extractTokens,allPassed,styles,targets,metrics} from '../js/engine.js';

const DEPTHS=['compact','standard','thorough'];

test('15 targets including six verified model-specific additions and 30 styles plus none',()=>{
  assert.deepEqual(targets.map(t=>t.id),['freebuff','chatgpt','kilo','codex','cursor','lovable','mimo','zai','deepseek','gpt6-chat','gpt6-astra','gpt6-1-sol','gpt6-sol','gpt6-luna','deepseek-v4-1-flash-1017']);
  assert.equal(targets.length,15);
  assert.equal(styles.length,31);
  assert.ok(targets.find(t=>t.id==='zai').sources.some(x=>x.url.includes('docs.z.ai')));
  assert.equal(new Set(styles.map(s=>s.id)).size,31);
});
test('every target states its evidence level and has at least one source link',()=>{
  for(const t of targets){
    assert.ok(['official','docs','none'].includes(t.evidence),t.id);
    assert.ok(t.sources.length>=1&&t.sources.every(s=>/^https:\/\//.test(s.url)),t.id);
    assert.ok(t.evidenceNote.length>40,t.id);
  }
});
test('every target x style x depth compiles and passes all of its own checks',()=>{
  const raw='Build a reading app in "Library.jsx". Keep keyboard navigation, use Supabase, accent #FF4D1A, 44px targets. See https://example.com/spec';
  for(const t of targets)for(const s of styles)for(const d of DEPTHS){
    const r=buildResult({raw,target:t.id,style:s.id,depth:d});
    assert.ok(allPassed(r.checks),t.id+'/'+s.id+'/'+d+' '+JSON.stringify(r.checks.filter(c=>!c.pass)));
    assert.ok(r.prompt.includes(r.rewrite.text)&&r.rewrite.text.includes('"Library.jsx"')&&r.rewrite.text.includes('https://example.com/spec'));
    if(s.id!=='none')assert.ok(r.prompt.includes(s.name));
  }
});
test('exact tokens are extracted: urls, files, hex, units, quotes, tech names',()=>{
  const t=extractTokens('Edit settings.cpp, use #FF4D1A at 44px with "Space Grotesk" and Supabase from https://x.dev/a. Keep `useAuth`.');
  for(const v of ['settings.cpp','#FF4D1A','44px','Space Grotesk','Supabase','https://x.dev/a','useAuth'])assert.ok(t.includes(v),v);
});
test('verify catches a rewrite that drops something the user wrote',()=>{
  const raw='Use Supabase and keep 44px targets in app.js';
  const bad=verifyPrompt(raw,'Build the thing with a database.',{mode:'AI'});
  assert.equal(allPassed(bad),false);
  assert.ok(bad.find(c=>c.id==='tokens').detail.includes('Supabase'));
  const good=verifyPrompt(raw,'Use Supabase, keep 44px targets, edit app.js.',{mode:'AI'});
  assert.equal(allPassed(good),true);
});
test('verify catches template junk and a missing style name',()=>{
  const junk=verifyPrompt('hello there friend','Prompt undefined {{x}}',{style:'swiss',mode:'AI'});
  assert.equal(junk.find(c=>c.id==='clean').pass,false);
  assert.equal(junk.find(c=>c.id==='style').pass,false);
});
test('non-UI task gets no design section; UI task gets anti-generic rules',()=>{
  const plain=buildPrompt({raw:'Summarize this paragraph about tax law',target:'chatgpt'});
  assert.ok(!/design direction/i.test(plain));
  const ui=buildPrompt({raw:'Build a website for my bakery',target:'lovable',depth:'thorough'});
  assert.ok(ui.includes('DESIGN DIRECTION')&&ui.includes('390px')&&ui.includes('gradient'));
});
test('vague phrases are made specific and listed',()=>{
  const r=buildResult({raw:'Make it modern and mobile friendly website',target:'cursor'});
  assert.ok(r.sharpened.length>=2);
  assert.ok(r.prompt.includes('390px'));
});
test('layouts differ by target: xml tags, numbered list, plain headings',()=>{
  assert.match(buildPrompt({raw:'Explain DNS clearly please',target:'chatgpt'}),/<request>/);
  assert.match(buildPrompt({raw:'Explain DNS clearly please',target:'mimo'}),/\n1\. /);
  assert.match(buildPrompt({raw:'Explain DNS clearly please',target:'zai'}),/\n1\. /);
  assert.match(buildPrompt({raw:'Explain DNS clearly please',target:'deepseek'}),/^REQUEST \(CLEANED\)/);
});
test('detail levels grow and only detailed adds the self-check',()=>{
  const c=buildPrompt({raw:'Fix my login route',target:'kilo',depth:'compact'});
  const s=buildPrompt({raw:'Fix my login route',target:'kilo',depth:'standard'});
  const t=buildPrompt({raw:'Fix my login route',target:'kilo',depth:'thorough'});
  assert.ok(c.length<s.length&&s.length<t.length);
  assert.ok(!s.includes('CHECK BEFORE YOU ANSWER')&&t.includes('CHECK BEFORE YOU ANSWER'));
});
test('warnings: style conflict, unpicked named style, very short request, long Codex prompt',()=>{
  const a=buildResult({raw:'Minimalism landing page for a tea shop',target:'lovable',style:'maximalism'});
  assert.ok(a.warnings.some(w=>/Minimalism/.test(w)&&/Maximalism/.test(w)));
  const b=buildResult({raw:'Brutalist landing page for a tea shop',target:'lovable'});
  assert.ok(b.warnings.some(w=>/Neo-Brutalism/.test(w)));
  assert.ok(buildResult({raw:'Fix bug',target:'codex'}).warnings.some(w=>/only 2 words/.test(w)));
  assert.ok(buildResult({raw:'Fix the login bug in auth.js today please',target:'codex',depth:'thorough'}).warnings.some(w=>/minimal prompt/.test(w)));
});
test('reject invalid inputs',()=>{
  assert.throws(()=>buildPrompt({raw:'   '}),/Enter a prompt/);
  assert.throws(()=>buildPrompt({raw:'x'.repeat(12001)}),/exceeds/);
  assert.throws(()=>buildPrompt({raw:'abc',target:'other'}),/Choose a supported/);
  assert.throws(()=>buildPrompt({raw:'abc',depth:'huge'}),/Invalid level/);
});
test('word metrics count reliably',()=>{
  assert.deepEqual(metrics('hello world','hello world again'),{before:2,after:3});
});

test('Hallmark mode adds independent critique only for design tasks and does not execute a skill',()=>{
  const raw='Redesign my booking page in React. Preserve existing navigation.';
  const normal=buildResult({raw,target:'codex',hallmark:false});
  const reviewed=buildResult({raw,target:'codex',hallmark:true});
  assert.ok(!normal.prompt.includes('DESIGN REVIEW (Hallmark-informed'));
  assert.ok(reviewed.prompt.includes('DESIGN REVIEW (Hallmark-informed'));
  assert.ok(reviewed.prompt.includes('No invented metrics'));
  assert.ok(reviewed.prompt.includes('320px'));
  assert.ok(reviewed.prompt.includes('do not auto-install') || reviewed.prompt.includes('do not auto-install an external package'));
  assert.ok(reviewed.hallmarkApplied);
  assert.ok(allPassed(reviewed.checks));
  assert.ok(!buildResult({raw:'Explain DNA replication',target:'mimo',hallmark:true}).prompt.includes('Hallmark-informed'));
  assert.throws(()=>buildResult({raw,target:'chatgpt',hallmark:'enabled'}),/Invalid design review/);
});

test('Hallmark mode works across every target and design style without losing intent',()=>{
  const raw='Create a website in index.html for a public library with navigation and accessible forms.';
  for(const target of targets) for(const style of styles) {
    const out=buildResult({raw,target:target.id,style:style.id,hallmark:true});
    assert.ok(out.hallmarkApplied);
    assert.ok(allPassed(out.checks),`${target.id}/${style.id} ${JSON.stringify(out.checks)}`);
  }
});

test('Hallmark AI rewrite receipt rejects outputs that strip the review and keeps the non-design scope',()=>{
  const raw='Redesign a dashboard in app.tsx with keyboard controls';
  const bad=verifyPrompt(raw,'Redesign a dashboard in app.tsx with keyboard controls.',{mode:'AI',hallmark:true});
  assert.equal(bad.find(x=>x.id==='hallmark').pass,false);
  const good=verifyPrompt(raw,'Redesign a dashboard in app.tsx with keyboard controls. Review typography, layout and mobile visual output.',{mode:'AI',hallmark:true});
  assert.equal(good.find(x=>x.id==='hallmark').pass,true);
  const writing=verifyPrompt('Write a thank-you email','Write a thank-you email.',{mode:'AI',hallmark:true});
  assert.equal(writing.some(x=>x.id==='hallmark'),false);
});


test('specific GPT-6 family destinations preserve distinct API identifiers and documented reasoning limits',()=>{
  const lookup=id=>targets.find(t=>t.id===id);
  assert.equal(lookup('gpt6-astra').apiId,'gpt-6-astra');
  assert.equal(lookup('gpt6-1-sol').apiId,'gpt-6.1-sol');
  assert.equal(lookup('gpt6-sol').apiId,'gpt-6-sol');
  assert.equal(lookup('gpt6-luna').apiId,'gpt-6-luna');
  assert.equal(lookup('gpt6-chat').apiId,null);
  assert.match(lookup('gpt6-1-sol').evidenceNote,/none is unsupported/i);
  assert.match(lookup('gpt6-sol').evidenceNote,/none\/low/);
  assert.match(lookup('gpt6-chat').evidenceNote,/not documented as a standalone/i);
});
test('DeepSeek 10/17 revision is documented as the deepseek-flash API alias, not a new fake ID',()=>{
  const model=targets.find(x=>x.id==='deepseek-v4-1-flash-1017');
  assert.equal(model.apiId,'deepseek-flash');
  assert.ok(model.sources.some(x=>x.url.includes('api-docs.deepseek.com/updates')));
  const result=buildResult({raw:'Refactor UI in index.html',target:model.id,depth:'thorough'});
  assert.ok(allPassed(result.checks));
  assert.match(result.prompt,/Inspect|provided|source|code/i);
});
test('each new target is saved as a distinct selection and not an execution model',()=>{
  for(const id of ['gpt6-chat','gpt6-astra','gpt6-1-sol','gpt6-sol','gpt6-luna','deepseek-v4-1-flash-1017']){
    const model=targets.find(t=>t.id===id);
    assert.ok(model);
    const out=buildResult({raw:'Explain async await with a code example',target:id});
    assert.ok(out.prompt.includes('Explain async await with a code example'));
    assert.ok(allPassed(out.checks));
    assert.ok(model.evidenceNote.length>40);
  }
});
