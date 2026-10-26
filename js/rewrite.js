/** Deterministic request rewriter. It fixes spelling, grammar and phrasing, turns "can you / I want you to" into
 *  direct instructions, and splits run-ons into separate sentences. Exact strings (links, files, code, quotes,
 *  colours, sizes) are locked first and restored byte for byte. If anything important would be lost it returns the
 *  lightly tidied original instead and says so. It does not add requirements you did not write. */
const TYPOS={teh:'the',adn:'and',dont:"don't",cant:"can't",wont:"won't",doesnt:"doesn't",didnt:"didn't",isnt:"isn't",arent:"aren't",wasnt:"wasn't",shouldnt:"shouldn't",couldnt:"couldn't",wouldnt:"wouldn't",havent:"haven't",thats:"that's",whats:"what's",im:"I'm",ive:"I've",id:"I'd",ill:"I'll",ur:'your',u:'you',pls:'please',plz:'please',wanna:'want to',gonna:'going to',gotta:'have to',alot:'a lot',wich:'which',recieve:'receive',definately:'definitely',seperate:'separate',occured:'occurred',beleive:'believe',accomodate:'accommodate',responsiv:'responsive',responsve:'responsive',paralax:'parallax',colour:'colour',websit:'website',wesite:'website',animaton:'animation',anitmation:'animation',authentification:'authentication',databse:'database',fucntion:'function',funtion:'function',becuase:'because',becasue:'because',theres:"there's",tho:'though',abt:'about',w:'with',bc:'because',rn:'right now',idk:'I am not sure',kinda:'somewhat',sorta:'somewhat'};
const CANON={react:'React',vue:'Vue',svelte:'Svelte',tailwind:'Tailwind',supabase:'Supabase',vercel:'Vercel',javascript:'JavaScript',typescript:'TypeScript',python:'Python',github:'GitHub',chatgpt:'ChatGPT',android:'Android',ios:'iOS',php:'PHP',kotlin:'Kotlin',flutter:'Flutter',docker:'Docker',wordpress:'WordPress',deepseek:'DeepSeek',codex:'Codex',firebase:'Firebase',laravel:'Laravel',django:'Django'};
const FILLER=/\b(?:lol|lmao|haha+|hehe+|xd|uh+|um+|basically|literally|honestly|you know|like i said)\b[,]?\s*/gi;
const LEAD=/^(?:(?:hey|hi|hello|yo)[ ,]+(?:claude|chatgpt|gpt|ai|there)?[ ,]*)?(?:(?:so|ok(?:ay)?|well|also|and|then|now)[ ,]+)*(?:(?:i|we) (?:really )?(?:want|need|would like|'d like|wish) (?:you )?to |(?:can|could|would|will) you (?:please )?|please |i(?:'d| would) like (?:you )?to |let'?s |help me (?:to )?)/i;
const lock=(text,store)=>text
  .replace(/https?:\/\/[^\s)>"'\]]+/g,m=>hold(m,store))
  .replace(/`[^`\n]+`/g,m=>hold(m,store))
  .replace(/"[^"\n]{2,120}"/g,m=>hold(m,store))
  .replace(/\b[\w@.\/-]+\.(?:js|jsx|ts|tsx|py|html|css|json|md|yml|yaml|sql|kt|java|swift|go|rs|php|rb|cpp|c|h|sh|xml|gradle|toml|env)\b/gi,m=>hold(m,store))
  .replace(/#[0-9a-fA-F]{3,8}\b/g,m=>hold(m,store))
  .replace(/\b\d+(?:[.,]\d+)*\s?(?:px|rem|em|ms|kb|mb|gb|dp|sp|pt|%|fps|x)?\b/gi,m=>hold(m,store))
  .replace(/\b(?:Next\.js|Node\.js|Vue\.js|React|Vue|Svelte|Angular|Tailwind|shadcn\/ui|Supabase|Vercel|Firebase|TypeScript|JavaScript|Python|Django|Flask|Flutter|SwiftUI|Kotlin|PostgreSQL|MongoDB|Stripe|GitHub|CodeIgniter|Laravel|PHP|ImGui|Android|iOS|WordPress|Docker|ChatGPT|Claude|DeepSeek|Codex)\b/g,m=>hold(m,store));
function hold(m,store){store.push(m);return String.fromCharCode(0xE000+store.length-1);}
const unlock=(t,store)=>t.replace(/[\uE000-\uF8FF]/g,c=>store[c.charCodeAt(0)-0xE000]);
const cap=s=>s.replace(/^([\uE000-\uF8FF]|\W*)([a-z])/,(m,a,b)=>a+b.toUpperCase());

export function rewriteRequest(raw){
  const original=String(raw||'').trim(), changes=[];
  const note=(kind,from,to)=>{if(from!==to&&changes.length<12)changes.push({kind,from:from.trim().slice(0,70),to:to.trim().slice(0,70)});};
  const store=[];
  let t=lock(original.replace(/\r/g,'').replace(/[ \t]+/g,' '),store);

  t=t.replace(/\b(it|he|she|this|that|which)\s+(?:dont|don't)\b/gi,(m,a)=>{note('grammar',m,a+" doesn't");return a+" doesn't";});
  // spelling and contractions (word by word; locked strings are untouched)
  t=t.replace(/[A-Za-z']+/g,(w,off,str)=>{
    const k=w.toLowerCase();
    if(Object.hasOwn(CANON,k)&&w!==CANON[k]&&!/^\s+(?:to|when|on|if|in response)\b/i.test(str.slice(off+w.length))){note('grammar',w,CANON[k]);return CANON[k];}
    if(w==='i'){note('grammar','i','I');return 'I';}
    if(Object.hasOwn(TYPOS,k)&&!(k==='id'||k==='ill'||k==='w')){const r=TYPOS[k];note('spelling',w,r);return r;}
    return w;
  });
  t=t.replace(/\bi(?='[a-z])/g,'I');
  t=t.replace(/[ ,]*\bplease\b,?/gi,()=>{note('filler','please','');return '';}).replace(/^[ ,]+/,'');
  const before=t;
  t=t.replace(FILLER,m=>m.includes(',')?',':' ').replace(/\s+,/g,',').replace(/,\s*,/g,',').replace(/^[ ,]+/,'');if(t!==before)note('filler','filler words','');
  t=t.replace(/\b(\w+)(\s+\1\b)+/gi,(m,w)=>{note('repeat',m,w);return w;});
  t=t.replace(/\s+([,.;:!?])/g,'$1').replace(/([,.;:!?])(?=[A-Za-z\uE000-\uF8FF])/g,'$1 ').replace(/([!?.])\1{1,}(?!\.)/g,'$1').replace(/\.{4,}/g,'...').replace(/ {2,}/g,' ');

  // sentences: split on end punctuation, line breaks, and "and also / also / then" run-ons
  const parts=t.split(/(?<=[.!?])\s+|\n+|\s+(?:and )?also,?\s+|;\s+/i).map(s=>s.trim()).filter(Boolean);
  const out=[];
  for(const part of parts){
    let s=part.replace(/^[-*\u2022]\s*/,'');
    const stripped=s.replace(LEAD,'');
    if(stripped!==s&&stripped.length>3){note('phrasing',s.slice(0,40),cap(stripped).slice(0,40));s=stripped.replace(/[?!]+$/,'.');}
    s=s.replace(/\b(?:and|but|so)\s*$/i,'').trim();
    s=cap(s);
    const lastLocked=/[\uE000-\uF8FF]$/.test(s)?store[s.charCodeAt(s.length-1)-0xE000]:'';
    if(!/[.!?:]$|[.!?]["')\]]$/.test(s)&&!/^https?:/.test(lastLocked))s+='.';
    out.push(s);
  }
  let text=unlock(out.join(out.length>=3?'\n':' '),store).replace(/\n/g,out.length>=3?'\n':' ');
  if(out.length>=3)text=text.split('\n').map(l=>'- '+l).join('\n');

  // safety: nothing exact may be lost, and the rewrite may not shrink the meaning away
  const nums=(original.match(/\d+(?:[.,]\d+)*/g)||[]), exact=store.filter(x=>x.length>1);
  const lost=[...nums.filter(n=>!text.includes(n)),...exact.filter(x=>!text.includes(x))];
  const wc=s=>s.split(/\s+/).filter(Boolean).length;
  if(!text.trim()||lost.length||wc(text)<wc(original)*0.45){
    const plain=original.replace(/\s+/g,' ');
    return {text:cap(plain)+(/[.!?]$/.test(plain)?'':'.'),changes:[],fallback:true,lost};
  }
  return {text,changes:changes.map(c=>({...c,from:unlock(c.from,store),to:unlock(c.to,store)})),fallback:false,lost:[]};
}
