import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPrompt,styles,targets,metrics} from '../js/engine.js';

test('six targets, 22 original named styles',()=>{
  assert.equal(targets.length,6);
  assert.equal(styles.length,23);
  assert.equal(new Set(styles.map(x=>x.id)).size,23);
});
test('all target/style combinations compile',()=>{
  for(const t of targets)for(const s of styles){
    const out=buildPrompt({raw:'Build a reading app. Keep keyboard navigation. Use Supabase.',target:t.id,style:s.id});
    assert.ok(out.includes('Keep keyboard navigation. Use Supabase.'));
    assert.ok(out.includes(t.label));
    if(s.id!=='none')assert.ok(out.includes(s.name));
  }
});
test('simple non-design task does not get visual requirements',()=>{
  const out=buildPrompt({raw:'Summarize this paragraph',target:'chatgpt',style:'none'});
  assert.ok(!out.includes('VISUAL QUALITY REQUIREMENTS'));
});
test('visual requests get anti-generic design requirements',()=>{
  const out=buildPrompt({raw:'Build a website',target:'mimo'});
  assert.ok(out.includes('VISUAL QUALITY REQUIREMENTS'));
  assert.ok(out.includes('390px'));
});
test('compact and thorough differ',()=>{
  const short=buildPrompt({raw:'Fix my login route',target:'codex',depth:'compact'});
  const long=buildPrompt({raw:'Fix my login route',target:'codex',depth:'thorough'});
  assert.ok(long.length>short.length);
  assert.ok(long.includes('SELF-REVIEW'));
});
test('reject invalid inputs',()=>{
  assert.throws(()=>buildPrompt({raw:'   '}),/Enter a prompt/);
  assert.throws(()=>buildPrompt({raw:'x'.repeat(12001)}),/exceeds/);
  assert.throws(()=>buildPrompt({raw:'abc',target:'other'}),/Choose a supported/);
});
test('word metrics count reliably',()=>{
  assert.deepEqual(metrics('hello world','hello world again'),{before:2,after:3});
});
