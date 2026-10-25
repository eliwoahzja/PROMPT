import test from 'node:test';
import assert from 'node:assert/strict';
import {deflateRawSync} from 'node:zlib';
import {readZipEntries,inspectZip,rateSources,buildRepairPrompt,MAX_ZIP_BYTES} from '../js/archive.js';
import {readWorkContext,contextBrief} from '../js/work-context.js';
import {buildResult,allPassed,verifyPrompt} from '../js/engine.js';
const nameFile=(buf,name='app.zip')=>Object.assign(new Blob([buf]),{name});
function zip(files){
  const locals=[],dirs=[];let offset=0;
  for(const [path,content,compress=true] of files){
    const name=Buffer.from(path),raw=Buffer.from(content),packed=compress?deflateRawSync(raw):raw;
    const h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50,0);h.writeUInt16LE(20,4);h.writeUInt16LE(compress?8:0,8);h.writeUInt32LE(packed.length,18);h.writeUInt32LE(raw.length,22);h.writeUInt16LE(name.length,26);
    locals.push(h,name,packed);
    const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50,0);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(compress?8:0,10);c.writeUInt32LE(packed.length,20);c.writeUInt32LE(raw.length,24);c.writeUInt16LE(name.length,28);c.writeUInt32LE(offset,42);dirs.push(c,name);
    offset+=h.length+name.length+packed.length;
  }
  const dir=Buffer.concat(dirs);const e=Buffer.alloc(22);e.writeUInt32LE(0x06054b50,0);e.writeUInt16LE(files.length,8);e.writeUInt16LE(files.length,10);e.writeUInt32LE(dir.length,12);e.writeUInt32LE(offset,16);
  return Buffer.concat([...locals,dir,e]);
}
test('ZIP reader supports stored and deflate entries, skips traversal, and audits UI source',async()=>{
  const file=nameFile(zip([
    ['src/styles.css','body{background:linear-gradient(red, blue)} .hero{animation-iteration-count:infinite}'],
    ['index.html','<main><h1>Revolutionize your workflow</h1><p>Lorem ipsum</p></main>',false],
    ['../unsafe.html','<h1>Should not read</h1>'],
    ['.env','api_key="this_is_private"']
  ]));
  const entries=await readZipEntries(file);
  assert.ok(!entries.some(e=>e.name.startsWith('../')));
  const report=await inspectZip(file);
  assert.equal(report.scannedCount,2);
  assert.equal(report.entryCount,3);
  assert.ok(report.risk>0);
  assert.ok(report.findings.some(x=>x.id==='lorem'));
  assert.ok(report.findings.some(x=>x.id==='decorative-gradient'));
  assert.ok(report.findings.every(f=>f.evidence.every(e=>!e.excerpt.includes('this_is_private'))));
  const brief=buildRepairPrompt(report,{targetLabel:'Kilo AI',aiUsed:'unknown',context:'# Project\nKeep the payment flow.'});
  assert.match(brief,/src\/styles.css/);assert.match(brief,/Keep the payment flow/);assert.match(brief,/Kilo AI/);
});
test('100 MB boundary and corrupt ZIP are rejected before inspection',async()=>{
  const oversized={name:'test.zip',size:MAX_ZIP_BYTES+1};
  await assert.rejects(()=>readZipEntries(oversized),/100 MB/);
  await assert.rejects(()=>readZipEntries(nameFile(Buffer.from('not a zip'))),/valid ZIP/);
});
test('unknown creator does not imply authorship or change score',()=>{
  const a=rateSources({entries:[{name:'index.html'}],sources:[{path:'index.html',text:'<h1>Hello</h1>'}]});
  assert.equal(a.findings.length,0);
  const brief=buildRepairPrompt(a);assert.match(brief,/not supplied/);assert.match(brief,/does not prove AI authorship/i);
});
test('context.md file validates size and grounds the enhancer in work constraints',async()=>{
  const file=nameFile('# Product\nAtlas internal admin portal. Use Supabase and preserve test.csv.', 'context.md');
  const ctx=await readWorkContext(file);
  assert.equal(ctx.truncated,false);assert.match(contextBrief(ctx.text),/Supabase/);
  const out=buildResult({raw:'Improve our UI',target:'chatgpt',context:ctx.text});
  assert.ok(allPassed(out.checks));assert.match(out.prompt,/Atlas internal admin portal/);
  const omitted=verifyPrompt('Improve our UI','Improve our UI',{mode:'AI',context:ctx.text});
  assert.equal(omitted.find(x=>x.id==='context').pass,false);
  await assert.rejects(()=>readWorkContext(nameFile('hello','context.txt')),/\.md/);
});
