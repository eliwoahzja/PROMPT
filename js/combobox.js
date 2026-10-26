/** Searchable combobox that replaces a native <select>. The select stays in the DOM as the source of truth,
 *  so existing code that reads select.value or listens for "change" keeps working. */
export function rankOptions(items,query){
  const q=String(query||'').trim().toLowerCase();
  if(!q)return items.map(i=>({...i,score:0}));
  const terms=q.split(/\s+/);
  return items.map(i=>{
    const label=i.label.toLowerCase();
    if(!terms.every(t=>(label+' '+(i.group||'')+' '+(i.keywords||'')).toLowerCase().includes(t)))return null;
    const score=label===q?0:label.startsWith(q)?1:label.split(/[^a-z0-9.]+/).some(w=>w.startsWith(terms[0]))?2:3;
    return {...i,score};
  }).filter(Boolean).sort((a,b)=>a.score-b.score);
}
function readItems(select){
  const items=[];
  for(const node of select.children){
    if(node.tagName==='OPTGROUP')for(const o of node.children)items.push({value:o.value,label:o.textContent,group:node.label,keywords:o.dataset.keywords||''});
    else if(node.tagName==='OPTION')items.push({value:node.value,label:node.textContent,group:'',keywords:node.dataset.keywords||''});
  }
  return items;
}
export function enhanceSelect(select){
  const id=select.id, wrap=select.parentElement; wrap.classList.add('combo');
  const input=document.createElement('input'), list=document.createElement('ul');
  Object.assign(input,{type:'text',id:id+'-combo',className:'combo-input',autocomplete:'off',spellcheck:false,placeholder:select.dataset.placeholder||'Search'});
  input.setAttribute('role','combobox');input.setAttribute('aria-expanded','false');input.setAttribute('aria-controls',id+'-list');input.setAttribute('aria-autocomplete','list');
  const described=select.getAttribute('aria-describedby');if(described)input.setAttribute('aria-describedby',described);
  Object.assign(list,{id:id+'-list',className:'combo-list',hidden:true});list.setAttribute('role','listbox');
  const label=document.querySelector('label[for="'+id+'"]');if(label)label.htmlFor=input.id;
  select.style.display='none';select.tabIndex=-1;select.setAttribute('aria-hidden','true');
  wrap.append(input,list);
  let shown=[],active=-1,open=false;
  const native=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value');
  const selectedLabel=()=>select.selectedOptions[0]?.textContent||'';
  const sync=()=>{if(!open)input.value=selectedLabel();};
  Object.defineProperty(select,'value',{configurable:true,get(){return native.get.call(select);},set(v){native.set.call(select,v);sync();}});
  function render(query){
    shown=rankOptions(readItems(select),query);list.replaceChildren();active=-1;
    if(!shown.length){const li=document.createElement('li');li.className='combo-empty';li.textContent='Nothing matches \u201c'+query.trim()+'\u201d. Clear the search to see all.';li.setAttribute('role','presentation');list.append(li);return;}
    let group=null;
    shown.forEach((item,i)=>{
      if(!query.trim()&&item.group&&item.group!==group){group=item.group;const h=document.createElement('li');h.className='combo-group';h.textContent=group;h.setAttribute('role','presentation');list.append(h);}
      const li=document.createElement('li');li.id=id+'-opt-'+i;li.className='combo-option';li.textContent=item.label;li.setAttribute('role','option');
      if(query.trim()&&item.group){const g=document.createElement('span');g.className='combo-tag';g.textContent=item.group;li.append(g);}
      const on=item.value===select.value;li.setAttribute('aria-selected',String(on));if(on&&active<0)active=i;
      li.addEventListener('mousedown',e=>{e.preventDefault();choose(i);});list.append(li);
    });
    setActive(active<0?0:active,false);
  }
  function setActive(i,scroll=true){
    const opts=list.querySelectorAll('[role=option]');if(!opts.length)return;
    active=(i+opts.length)%opts.length;
    opts.forEach((o,n)=>o.classList.toggle('is-active',n===active));
    input.setAttribute('aria-activedescendant',opts[active].id);if(scroll)opts[active].scrollIntoView({block:'nearest'});
  }
  function show(){if(open)return;open=true;input.setAttribute('aria-expanded','true');list.hidden=false;render('');input.select();list.querySelector('.is-active')?.scrollIntoView({block:'nearest'});}
  function hide(){open=false;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');list.hidden=true;input.value=selectedLabel();}
  function choose(i){const item=shown[i];if(!item)return;const changed=select.value!==item.value;select.value=item.value;hide();if(changed)select.dispatchEvent(new Event('change',{bubbles:true}));}
  input.addEventListener('focus',show);input.addEventListener('click',show);
  input.addEventListener('input',()=>{if(!open)show();render(input.value);});
  input.addEventListener('blur',hide);
  input.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){e.preventDefault();open?setActive(active+1):show();}
    else if(e.key==='ArrowUp'){e.preventDefault();open?setActive(active-1):show();}
    else if(e.key==='Home'&&open){e.preventDefault();setActive(0);}
    else if(e.key==='End'&&open){e.preventDefault();setActive(-1);}
    else if(e.key==='Enter'&&open){e.preventDefault();choose(active);}
    else if(e.key==='Escape'&&open){e.preventDefault();hide();}
  });
  sync();
  return {refresh:sync};
}
