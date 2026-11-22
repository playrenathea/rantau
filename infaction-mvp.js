(()=>{"use strict";
const $=id=>document.getElementById(id),STATE_KEY='infaction-mvp-entered-v1';
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n};
const ICON={
lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
hidden:'<path d="M3 3l18 18M10.6 5.2A10.8 10.8 0 0 1 12 5c4.4 0 8.3 2.7 10 7-.6 1.5-1.6 2.9-2.8 4M6.5 6.5A11.6 11.6 0 0 0 2 12c1.7 4.3 5.6 7 10 7 1.2 0 2.4-.2 3.5-.6"/><path d="M10 10a3 3 0 0 0 4 4"/>',
gate:'<path d="M5 21V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v17M5 21h14M8 21V8h8v13M13 14h.01"/>'
};
function icon(name,label){const span=el('span','');span.title=label;span.setAttribute('aria-label',label);span.innerHTML='<svg class="signal" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+ICON[name]+'</svg>';return span}
let world=null,tab='factions',loadError=null,worker=null,generating=false,progress='';
function validateWorld(data){
 if(!data||!Array.isArray(data.factions)||data.factions.length!==6)throw Error('Expected six Factions');
 if(!data.places||!data.places.nodes||!data.places.root_id)throw Error('Place tree missing');
 const nodes=data.places.nodes;
 if(!nodes[data.places.root_id])throw Error('Root Place missing');
 for(const [id,n] of Object.entries(nodes)){
  if(n.id!==id)throw Error('Place id mismatch: '+id);
  if(!Array.isArray(n.children_ids))throw Error('Children missing: '+id);
  for(const ch of n.children_ids)if(!nodes[ch]||nodes[ch].parent_id!==id)throw Error('Broken Place hierarchy: '+ch);
 }
 if(!Array.isArray(data.access_nodes))throw Error('Gate / Access nodes missing');
 for(const g of data.access_nodes)if(!nodes[g.to_place_id])throw Error('Unknown Gate target');
 return data;
}
function renderIntro(){
 const app=$('app');app.replaceChildren();
 const shell=el('section');shell.id='intro';shell.tabIndex=0;shell.setAttribute('aria-label','Hold to enter or right click');
 const center=el('div'),h=el('h1','intro-title','Infaction'),p=el('p','intro-sub','Infaction is not as it seems.'),trigger=el('div','intro-trigger'),tip=el('div','intro-tip','Hold / long press / right-click to enter');
 const triggerText=el('span',null,'Hold to enter');trigger.append(triggerText);
 center.append(h,p,trigger,tip);shell.append(center);app.append(shell);
 let timer=null,started=0;
 const enter=()=>{if(timer!==null){clearTimeout(timer);timer=null}try{sessionStorage.setItem(STATE_KEY,'1')}catch(e){}renderApp();generateWorld()};
 const down=e=>{if(e.button!==undefined&&e.button!==0)return;started=Date.now();timer=setTimeout(enter,650)};
 const clear=()=>{if(timer!==null){clearTimeout(timer);timer=null}trigger.style.setProperty('--hold','0')};
 shell.addEventListener('pointerdown',down);shell.addEventListener('pointerup',clear);shell.addEventListener('pointercancel',clear);shell.addEventListener('pointerleave',clear);
 shell.addEventListener('contextmenu',e=>{e.preventDefault();enter()});
 shell.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();enter()}});
}
function flags(node){const h=node.attributes?.hidden_restricted||{};const frag=document.createDocumentFragment();if(h.hidden)frag.append(icon('hidden','Hidden'));if(h.restricted)frag.append(icon('lock','Restricted'));return frag}
function label(node){return node.display_name||node.name}
function gatesByTarget(){const m=new Map();for(const g of world.access_nodes||[]){const arr=m.get(g.to_place_id)||[];arr.push(g);m.set(g.to_place_id,arr)}return m}
function gateRow(g){const row=el('div','gate');row.append(icon('gate','Gate / Checkpoint'));row.append(el('span',null,g.name));return row}
function ownership(node){return node.attributes?.political_ownership||{kind:'none',factions:[]}}
function renderExplore(content){
 const toolbar=el('div','toolbar');const reset=el('button','light-btn','Collapse all');reset.type='button';reset.addEventListener('click',()=>{for(const d of content.querySelectorAll('details'))d.open=false});toolbar.append(reset);content.append(toolbar);
 const tree=el('section','explore-tree');content.append(tree);
 const nodes=world.places.nodes,access=gatesByTarget();let seen=new Set();
 function addNode(id,parent,depth){
  if(depth>50||seen.has(id))return;seen.add(id);
  const n=nodes[id];if(!n)return;
  for(const g of access.get(id)||[])parent.append(gateRow(g));
  const isParent=n.children_ids.length>0;
  const line=isParent?el('details','tree-group'):el('div','leaf');const summary=isParent?el('summary'):line;
  summary.append(el('span','tree-title',label(n)));
  summary.append(flags(n));
  if(isParent){line.append(summary);const kids=el('div','tree-children');line.append(kids);if(depth<2)line.open=true;for(const child of n.children_ids)addNode(child,kids,depth+1)}
  else if(!isParent){}parent.append(line);
 }
 addNode(world.places.root_id,tree,0);
}
function renderFactions(content){
 const geo=Object.values(world.places.nodes);const actors=world.factions;
 const cards=el('div','factions');content.append(cards);
 const byId=new Map(actors.map(f=>[f.id,f]));
 for(const f of actors){
  const owning=geo.filter(n=>['zone','site','location'].includes(n.generation_role)&&ownership(n).factions.includes(f.id));
  const card=el('details','faction');cards.append(card);
  const header=el('summary');header.append(el('span','faction-name',f.name||f.id));
  header.append(el('span','faction-meta',owning.length+' Places'));card.append(header);
  const types=el('div','types');for(const t of f.types||[])types.append(el('span','chip',t));card.append(types);
  if(!owning.length){card.append(el('div','empty','No owned Places'));continue}
  const body=el('div','holdings');const order={zone:0,site:1,location:2};
  owning.sort((a,b)=>(order[a.generation_role]-order[b.generation_role])||label(a).localeCompare(label(b)));
  for(const n of owning){
   const o=ownership(n),row=el('div','holding');
   const info=el('div','holding-info');info.append(el('span','holding-name',label(n)));
   if(o.kind==='dual'){
    const other=o.factions.filter(id=>id!==f.id).map(id=>byId.get(id)?.name||id);
    info.append(el('span','shared','· Shared with '+other.join(', ')));
   }
   row.append(info);row.append(flags(n));body.append(row);
  }
  card.append(body);
 }
}
function loading(content){
 const box=el('section');box.id='missing';
 const title=el('h2',null,generating?'Generating world':'World generation unavailable');box.append(title);
 box.append(el('p',null,generating?(progress||'Starting the original v0.4.8 Python generator…'):(loadError||'Generation did not complete.')));
 if(!generating){
  const retry=el('button','light-btn','Retry generation');retry.type='button';
  retry.addEventListener('click',generateWorld);box.append(retry);
 }
 content.append(box);
}
function generateWorld(){
 if(generating)return;
 if(typeof Worker==='undefined'){loadError='This browser does not support Web Workers.';renderApp();return}
 generating=true;progress='Loading original Python generator';loadError=null;world=null;renderApp();
 if(!worker){
  try{worker=new Worker('./infaction-python-worker.js?v=0.5.4')}catch(e){generating=false;loadError=e.message;renderApp();return}
  worker.onmessage=e=>{
   const m=e.data||{};
   if(m.type==='status'){
    progress=m.message;
    const box=$('missing');
    if(box){const p=box.querySelector('p');if(p)p.textContent=progress}
   }else if(m.type==='world'){
    try{world=validateWorld(m.world);generating=false;loadError=null;renderApp()}
    catch(err){generating=false;loadError=err.message;renderApp()}
   }else if(m.type==='error'){
    generating=false;loadError=m.message||'Generation failed';
    console.error('Native Infaction generator:',m.traceback||m.message);renderApp();
   }
  };
  worker.onerror=e=>{generating=false;loadError=e.message||'Python worker failed to start';worker.terminate();worker=null;renderApp()};
 }
 worker.postMessage({type:'generate'});
}
function renderApp(){
 const app=$('app');app.replaceChildren();
 const top=el('header','top');top.append(el('h1','brand','Infaction'));const actions=el('div','header-actions');
 const reroll=el('button','light-btn',generating?'Generating…':'↻ Reroll');
 reroll.type='button';reroll.disabled=generating;reroll.addEventListener('click',generateWorld);
 actions.append(reroll);
 actions.append(el('span','status',world?'6 Factions · v0.4.8':(generating?'Generating':'World')));
 top.append(actions);app.append(top);
 const nav=el('nav','nav');nav.setAttribute('aria-label','Main tabs');
 for(const [key,title] of [['factions','Factions'],['explore','Explore']]){const btn=el('button','tab',title);btn.setAttribute('role','tab');btn.setAttribute('aria-selected',String(tab===key));btn.addEventListener('click',()=>{tab=key;renderApp()});nav.append(btn)}
 app.append(nav);
 const content=el('main');content.id='content';app.append(content);
 if(!world){loading(content);return}
 const count=world.places.counts?.all_places||Object.keys(world.places.nodes).length;
 content.append(el('div','summary',tab==='explore'?count+' Places · expand to explore':world.factions.length+' Factions · Single & Dual ownership'));
 if(tab==='explore')renderExplore(content);else renderFactions(content);
}
let entered=false;try{entered=sessionStorage.getItem(STATE_KEY)==='1'}catch(e){}
if(entered){renderApp();generateWorld()}else renderIntro();
})();