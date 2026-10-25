import test from 'node:test';
import assert from 'node:assert/strict';
import {POST} from '../api/enhance.js';
import {GET} from '../api/config.js';
const keys=['SUPABASE_URL','SUPABASE_ANON_KEY','OPENAI_API_KEY','OPENAI_MODEL'];
const oldEnv=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
function init(){process.env.SUPABASE_URL='https://db.example.test';process.env.SUPABASE_ANON_KEY='anon-key';process.env.OPENAI_API_KEY='openai-key';process.env.OPENAI_MODEL='test-model';}
function restore(){for(const key of keys){if(oldEnv[key]===undefined)delete process.env[key];else process.env[key]=oldEnv[key];}}
function req(body,token='some.valid.token'){return new Request('https://example.test/api/enhance',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${token}`},body:JSON.stringify(body)});}
function mockFetch(providerText,calls=[]){
  return async(url)=>{
    calls.push(String(url));
    if(String(url).includes('/auth/v1/user'))return new Response('{}',{status:200});
    if(String(url).includes('/rpc/consume_enhancement_quota'))return new Response('true',{status:200,headers:{'content-type':'application/json'}});
    return new Response(JSON.stringify({output:[{type:'message',content:[{type:'output_text',text:providerText}]}]}),{status:200,headers:{'content-type':'application/json'}});
  };
}
test('public config never exposes provider secret',async()=>{init();const res=GET();restore();const j=await res.json();assert.equal(j.aiConfigured,true);assert.ok(!('OPENAI_API_KEY' in j));assert.equal(j.supabaseAnonKey,'anon-key');});
test('requires provider and Supabase before rewrite',async()=>{for(const key of keys)delete process.env[key];const res=await POST(req({raw:'test'}));assert.equal(res.status,503);restore();});
test('rejects unauthenticated requests',async()=>{init();const res=await POST(req({raw:'Fix my bug'},''));assert.equal(res.status,401);restore();});
test('rejects invalid target before network calls',async()=>{init();const res=await POST(req({raw:'hello',target:'not-valid'}));assert.equal(res.status,400);restore();});
test('accepts Cursor, Lovable and Z.ai as targets',async()=>{
  init();const original=globalThis.fetch;
  globalThis.fetch=mockFetch('Use Supabase on the booking page.');
  try{for(const target of ['cursor','lovable','zai']){const res=await POST(req({raw:'Add a booking page using Supabase',target}));assert.equal(res.status,200);}}
  finally{globalThis.fetch=original;restore();}
});
test('a rewrite that keeps everything is returned as AI',async()=>{
  init();const original=globalThis.fetch;const calls=[];
  globalThis.fetch=mockFetch('Swiss Design. Build an app in app.js with Supabase.',calls);
  try{const res=await POST(req({raw:'Build an app in app.js with Supabase',target:'codex',style:'swiss'}));
    const j=await res.json();assert.equal(res.status,200);assert.equal(j.mode,'ai');assert.ok(j.prompt.startsWith('Swiss Design'));assert.equal(calls.length,3);}
  finally{globalThis.fetch=original;restore();}
});
test('a rewrite that drops a name or the chosen style falls back to the verified draft',async()=>{
  init();const original=globalThis.fetch;
  globalThis.fetch=mockFetch('Build a nice app.');
  try{const res=await POST(req({raw:'Build an app in app.js with Supabase',target:'codex',style:'swiss'}));
    const j=await res.json();assert.equal(res.status,200);assert.equal(j.mode,'draft');assert.equal(j.fallback,true);
    assert.ok(j.prompt.includes('Build an app in app.js with Supabase'));assert.ok(j.notice.includes('Supabase'));}
  finally{globalThis.fetch=original;restore();}
});
test('daily limit rejects before model request',async()=>{
  init();const original=globalThis.fetch;const calls=[];
  globalThis.fetch=async(url)=>{calls.push(String(url));if(String(url).includes('/auth/v1/user'))return new Response('{}',{status:200});return new Response('false',{status:200,headers:{'content-type':'application/json'}});};
  try{const res=await POST(req({raw:'Fix navigation'}));assert.equal(res.status,429);assert.equal(calls.length,2);}finally{globalThis.fetch=original;restore();}
});

test('Hallmark mode is passed through the authenticated API and rejects dropped review rules',async()=>{
  init();const original=globalThis.fetch;
  globalThis.fetch=mockFetch('Build a homepage in index.html.');
  try{
    const response=await POST(req({raw:'Build a homepage in index.html',target:'zai',hallmark:true}));
    const body=await response.json();
    assert.equal(response.status,200);
    assert.equal(body.mode,'draft');
    assert.equal(body.fallback,true);
    assert.ok(body.prompt.includes('DESIGN REVIEW (Hallmark-informed'));
    assert.ok(body.checks.some(c=>c.id==='hallmark' && c.pass));
  }finally{globalThis.fetch=original;restore();}
});
