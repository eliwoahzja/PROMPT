import test from 'node:test';
import assert from 'node:assert/strict';
import {POST} from '../api/audit.js';
const keys=['SUPABASE_URL','SUPABASE_ANON_KEY','OPENAI_API_KEY','OPENAI_MODEL'];
const original=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
const setup=()=>{process.env.SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_ANON_KEY='anon';process.env.OPENAI_API_KEY='secret';process.env.OPENAI_MODEL='test';};
const restore=()=>{for(const key of keys){if(original[key]===undefined)delete process.env[key];else process.env[key]=original[key];}};
const payload=(opts={})=>({summary:{fileName:'test.zip',entries:10,scanned:2,findings:[{title:'Generic words',area:'Writing',severity:2,evidence:[{file:'index.html',line:4,excerpt:'Lorem ipsum'}],action:'Use real copy'}]},context:'# Work\nThis is our app.',target:'Codex',...opts});
const req=(body,token='my.valid.token')=>new Request('https://site.test/api/audit',{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+token},body:JSON.stringify(body)});
function fetchMock(out){const calls=[];const mock=async(url,opts={})=>{
  calls.push({url:String(url),opts});
  if(String(url).includes('/auth/v1/user'))return Response.json({id:'u'});
  if(String(url).includes('consume_enhancement_quota'))return Response.json(true);
  return Response.json({output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(out)}]}]});
};return {mock,calls};}
test('AI audit requires configured secrets and a signed-in user',async()=>{
  for(const k of keys)delete process.env[k];
  assert.equal((await POST(req(payload()))).status,503);
  setup();assert.equal((await POST(req(payload(),''))).status,401);restore();
});
test('AI audit rejects invalid screenshots and malformed input before contacting provider',async()=>{
  setup();const r=await POST(req(payload({screenshot:'data:image/svg+xml;base64,PHN2Zz4='})));
  assert.equal(r.status,400);restore();
});
test('AI audit only sends summarized source findings and returns an unscored text critique',async()=>{
  setup();const old=globalThis.fetch;const {mock,calls}=fetchMock({review:'The phrase in index.html is filler. Replace it.',visualRisk:91});globalThis.fetch=mock;
  try{
    const result=await POST(req(payload()));const data=await result.json();
    assert.equal(result.status,200);assert.equal(data.visualRisk,null);assert.match(data.review,/index.html/);
    assert.equal(calls.length,3);
    const json=JSON.parse(calls[2].opts.body);
    assert.match(JSON.stringify(json.input),/Lorem ipsum/);
    assert.ok(!JSON.stringify(json.input).includes('data:image'));
  }finally{globalThis.fetch=old;restore();}
});
test('AI audit can provide separate screenshot-based visual opinion with explicit image input',async()=>{
  setup();const old=globalThis.fetch;const {mock,calls}=fetchMock({review:'Visible hierarchy is repetitive.',visualRisk:67});globalThis.fetch=mock;
  try{
    const screenshot='data:image/png;base64,'+Buffer.from('PNGFAKE').toString('base64');
    const result=await POST(req(payload({screenshot})));const data=await result.json();
    assert.equal(result.status,200);assert.equal(data.visualRisk,67);
    const reqBody=JSON.parse(calls[2].opts.body);
    assert.equal(reqBody.input[0].content[1].type,'input_image');
  }finally{globalThis.fetch=old;restore();}
});
