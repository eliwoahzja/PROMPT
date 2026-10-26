import test from 'node:test';
import assert from 'node:assert/strict';
import {rankOptions} from '../js/combobox.js';
import {rateSources} from '../js/archive.js';
import {buildResult, analyzeTask, styles} from '../js/engine.js';

const items=[{value:'a',label:'GPT-6 Sol',group:'OpenAI models'},{value:'b',label:'DeepSeek V4.1 Flash',group:'Other AI models',keywords:'deepseek-flash'},{value:'c',label:'Kilo AI',group:'Platforms'}];
test('combobox search ranks prefix matches first and searches group and keywords',()=>{
  assert.equal(rankOptions(items,'').length,3);
  assert.deepEqual(rankOptions(items,'kilo').map(i=>i.value),['c']);
  assert.deepEqual(rankOptions(items,'openai sol').map(i=>i.value),['a']);
  assert.deepEqual(rankOptions(items,'deepseek-flash').map(i=>i.value),['b']);
  assert.equal(rankOptions(items,'zzz').length,0);
});
const src=(path,text)=>({path,text});
const entries=n=>Array.from({length:n},(_,i)=>({name:'f'+i+'.css'}));
test('Slop Rater separates a sloppy project from a clean one and does not saturate',()=>{
  const sloppy=rateSources({sources:[src('index.html','<div class="bg-gradient-to-r rounded-2xl shadow-xl">Seamlessly elevate. Trusted by 10,000+ teams. Lorem ipsum</div><button class="focus:outline-none animate-pulse">'),src('a.css','body{background:linear-gradient(#a0f,#f0a);box-shadow:0 0 40px rgba(160,0,255,.5)}a{outline:none}')],entries:entries(2)});
  const clean=rateSources({sources:[src('index.html','<main><h1>Studio hours</h1></main>'),src('a.css',':focus-visible{outline:2px solid #000}@media (prefers-reduced-motion:reduce){*{animation:none}}')],entries:entries(2)});
  assert.ok(sloppy.risk>=70,'sloppy '+sloppy.risk);
  assert.equal(clean.risk,0);
});
test('Slop Rater ignores rule text, negated mentions and CSS chevrons',()=>{
  const r=rateSources({sources:[src('data.js',"- Real copy (no lorem ipsum, never \"Unlock the power of\")."),src('b.js',"const x={pattern:/linear-gradient\\(/ig}"),src('c.css','select{background-image:linear-gradient(45deg,transparent 50%,#000 50%)}')],entries:entries(3)});
  assert.equal(r.findings.length,0);
});
test('Slop Rater risk grows with how widespread a pattern is',()=>{
  const one=rateSources({sources:[src('a.css','a{background:linear-gradient(#000,#fff)}'),...Array.from({length:9},(_,i)=>src('c'+i+'.css','p{margin:0}'))],entries:entries(10)});
  const many=rateSources({sources:Array.from({length:10},(_,i)=>src('c'+i+'.css','a{background:linear-gradient(#000,#fff)}')),entries:entries(10)});
  assert.ok(many.risk>one.risk,one.risk+' vs '+many.risk);
});
test('different tasks produce different prompts, not one template',()=>{
  const fix=buildResult({raw:'fix the login, it is broken'}), build=buildResult({raw:'Build a landing page for visitors of a ceramics studio, responsive on mobile, in Next.js. Never use gradients.'});
  assert.equal(fix.analysis.intent,'fix');assert.equal(build.analysis.intent,'build');
  assert.ok(fix.prompt.includes('<gaps>')&&!build.prompt.includes('<gaps>'));
  assert.ok(fix.prompt.includes('reproduced before')&&!build.prompt.includes('reproduced before'));
  assert.ok(build.prompt.includes('Never use gradients'));
  assert.ok(fix.checks.every(c=>c.pass)&&build.checks.every(c=>c.pass));
});
test('analysis flags what is genuinely missing and nothing when it is present',()=>{
  assert.equal(analyzeTask('Fix the crash: error "x is undefined" happens when I click Save, expected a saved note.').gaps.length,0);
  assert.equal(analyzeTask('fix the login').gaps.length,2);
  assert.ok(analyzeTask('review it').gaps.some(g=>g.includes('Which files')));
});
test('every style, including the website and app additions, has a complete brief',()=>{
  const need=['idea','layout','type','colour','surfaces','motion','never','check'];
  for(const s of styles.filter(x=>x.id!=='none'))for(const k of need)assert.ok(s[k]&&s[k].length>10,s.id+'.'+k);
  assert.deepEqual(['ios','material','dense','hud'].map(id=>styles.find(s=>s.id===id).group),['Apps','Apps','Apps','Apps']);
});
import {rewriteRequest} from '../js/rewrite.js';
test('the request is genuinely rewritten: grammar fixed, phrasing direct, exact strings untouched',()=>{
  const raw='hey claude, i want you to make a login page for my site, dont use gradients lol. also make it responsiv pls and use #1A1A1A with 16px text in js/main.js';
  const r=rewriteRequest(raw);
  assert.equal(r.fallback,false);
  assert.ok(r.text.startsWith('Make a login page'),r.text);
  for(const bad of [/\bi\b/,/\bdont\b/,/\bresponsiv\b/,/\blol\b/,/\bpls\b/])assert.ok(!bad.test(r.text),bad+' in '+r.text);
  for(const keep of ['#1A1A1A','16px','js/main.js',"don't",'responsive'])assert.ok(r.text.includes(keep),keep);
  assert.notEqual(r.text,raw);
});
test('rewriter never drops numbers, links or quoted names and falls back when unsure',()=>{
  const raw='can you check "saveNote" in https://x.dev/a?b=1 for 3 bugs?!!';
  const r=rewriteRequest(raw);
  for(const keep of ['"saveNote"','https://x.dev/a?b=1','3'])assert.ok(r.text.includes(keep),keep);
  assert.ok(r.text.startsWith('Check '));assert.ok(!/[?!]{2}/.test(r.text));
});
test('built prompt contains the cleaned request, not the messy original, and reports what changed',()=>{
  const raw='pls make a todo app lol, it dont need login. use react';
  const res=buildResult({raw,target:'chatgpt'});
  assert.ok(res.prompt.includes('<request>\nMake a todo app'));assert.ok(!/\blol\b/.test(res.prompt));
  assert.ok(res.warnings.some(w=>w.startsWith('Rewrote your request')));
  assert.ok(res.checks.find(c=>c.id==='verbatim').pass);assert.ok(res.checks.every(c=>c.pass));
});
import {vocabulary} from '../js/vocabulary.js';
import {sharpen} from '../js/engine.js';
test('vocabulary is well-formed: unique ids, each example triggers its own entry, no slop words in instructions',()=>{
  assert.ok(vocabulary.length>=85,String(vocabulary.length));
  assert.equal(new Set(vocabulary.map(v=>v.id)).size,vocabulary.length);
  for(const v of vocabulary){
    assert.ok(['web','app','code','any'].includes(v.kind),v.id);
    assert.ok(v.re.test(v.ex),v.id+' does not match its example');
    assert.ok(v.to.length>=40&&v.to.length<=330,v.id+' length '+v.to.length);
    assert.ok(!/seamless|revolutioni|elevate|unlock the power|cutting.edge|game.changer|[\u{1F300}-\u{1FAFF}]/iu.test(v.to),v.id);
  }
});
test('every vocabulary example is understood in a full request, once, with the right instruction',()=>{
  for(const v of vocabulary){
    const out=sharpen(v.ex+'.',{design:true,app:v.kind==='app',limit:99});
    assert.ok(out.some(o=>o.from===v.from&&o.to===v.to),v.id+' not produced for "'+v.ex+'"');
  }
});
test('a phrase the user negated is not turned into its opposite',()=>{
  assert.ok(!sharpen('landing page for a bakery, no gradients and never add shadows',{design:true}).some(o=>/gradient|shadow/i.test(o.from)));
  assert.ok(sharpen('landing page with a gradient background',{design:true}).some(o=>o.from==='gradient'));
});
test('web, app and code vocabulary route to the right requests',()=>{
  assert.ok(!sharpen('a pull to refresh feed for the website',{design:true,app:false}).some(o=>o.from==='pull to refresh'));
  assert.ok(sharpen('an ios app with pull to refresh',{design:true,app:true}).some(o=>o.from==='pull to refresh'));
  assert.ok(sharpen('make this api secure and add tests',{design:false}).some(o=>o.area==='Code'));
});
test('prompt detail level caps how many vocabulary lines are added',()=>{
  const raw='a dashboard with a hero section, pricing, testimonials, a footer, a form, a table, dark mode, a carousel, parallax, a marquee and shadows and glow and illustrations';
  const n=d=>buildResult({raw,depth:d}).sharpened.length;
  assert.ok(n('compact')<=4&&n('standard')<=8&&n('thorough')<=14&&n('compact')<n('thorough'));
});
test('a negation in one clause does not suppress a phrase in the next clause',()=>{
  const out=sharpen('an ios app, no gradients, make it feel native',{design:true,app:true});
  assert.ok(out.some(o=>o.from==='native feel'));
  assert.ok(sharpen('build me an ios workout tracking app',{design:true,app:true}).some(o=>o.from==='build me an app'));
});
