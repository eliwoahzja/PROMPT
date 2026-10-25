import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { targets } from '../js/engine.js';

const root=new URL('../',import.meta.url);
const text=p=>fs.readFileSync(new URL(p,root),'utf8');

test('grouped selector enumerates each saved target exactly once',()=>{
  const ui=text('js/main.js');
  const groupSource=ui.match(/const sections=\[([\s\S]*?)\];\nfor\(const section/);
  assert.ok(groupSource,'Expected grouped target selector.');
  const ids=[...groupSource[1].matchAll(/'([a-z0-9-]+)'/g)].map(m=>m[1]);
  const names=new Set(targets.map(t=>t.id));
  assert.equal(ids.length,15);
  assert.equal(new Set(ids).size,ids.length);
  assert.deepEqual(new Set(ids),names);
  assert.match(text('index.html'),/id="target-select"/);
  assert.doesNotMatch(text('js/main.js'),/targetBox/);
});

test('fresh schema and additive migration allow all defined targets',()=>{
  for(const path of ['supabase/schema.sql','supabase/migrations/20261026_add_specific_models.sql']){
    const sql=text(path);
    const check=sql.match(/target in \(([\s\S]*?)\)/i);
    assert.ok(check,path);
    const ids=[...check[1].matchAll(/'([^']+)'/g)].map(x=>x[1]);
    assert.equal(ids.length,targets.length,path);
    assert.deepEqual(new Set(ids),new Set(targets.map(t=>t.id)),path);
  }
});
