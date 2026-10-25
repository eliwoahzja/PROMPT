import test from 'node:test';
import assert from 'node:assert/strict';
import {POST} from '../api/enhance.js';
import {GET} from '../api/config.js';
const keys=['SUPABASE_URL','SUPABASE_ANON_KEY','OPENAI_API_KEY','OPENAI_MODEL'];
const oldEnv=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
function init(){process.env.SUPABASE_URL='https://db.example.test';process.env.SUPABASE_ANON_KEY='anon-key';process.env.OPENAI_API_KEY='openai-key';process.env.OPENAI_MODEL='test-model';}
function restore(){for(const key of keys){if(oldEnv[key]===undefined)delete process.env[key];else process.env[key]=oldEnv[key];}}
function req(body,token='some.valid.token'){return new Request('https://example.test/api/enhance',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${token}`},body:JSON.stringify(body)});}
test('public config never exposes provider secret',()=>{init();const res=GET();restore();return res.json().then(j=>{assert.equal(j.aiConfigured,true);assert.ok(!('OPENAI_API_KEY' in j));assert.equal(j.supabaseAnonKey,'anon-key');});});
test('requires provider and Supabase before rewrite',async()=>{restore();for(const key of keys)delete process.env[key];const res=await POST(req({raw:'test'}));assert.equal(res.status,503);restore();});
test('rejects unauthenticated requests',async()=>{init();const res=await POST(req({raw:'Fix my bug'},''));assert.equal(res.status,401);restore();});
test('rejects invalid target before network calls',async()=>{init();const res=await POST(req({raw:'hello',target:'not-valid'}));assert.equal(res.status,400);restore();});
test('authenticated request enforces quota and parses provider reply',async()=>{
 init();const originalFetch=globalThis.fetch;const calls=[];
 globalThis.fetch=async(url,opts)=>{
  calls.push(String(url));
  if(String(url).includes('/auth/v1/user'))return new Response('{}',{status:200});
  if(String(url).includes('/rpc/consume_enhancement_quota'))return new Response('true',{status:200,headers:{'content-type':'application/json'}});
  return new Response(JSON.stringify({output:[{type:'message',content:[{type:'output_text',text:'Rewritten result'}]}]}),{status:200,headers:{'content-type':'application/json'}});
 };
 try{const res=await POST(req({raw:'Build an app',target:'codex',style:'swiss'}));assert.equal(res.status,200);assert.equal((await res.json()).prompt,'Rewritten result');assert.equal(calls.length,3);}finally{globalThis.fetch=originalFetch;restore();}
});
test('daily limit rejects before model request',async()=>{
 init();const originalFetch=globalThis.fetch;const calls=[];
 globalThis.fetch=async(url)=>{calls.push(String(url));if(String(url).includes('/auth/v1/user'))return new Response('{}',{status:200});return new Response('false',{status:200,headers:{'content-type':'application/json'}});};
 try{const res=await POST(req({raw:'Fix navigation'}));assert.equal(res.status,429);assert.equal(calls.length,2);}finally{globalThis.fetch=originalFetch;restore();}
});
