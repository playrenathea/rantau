'use strict';
/** Browser UI contract, executed in Node without fake server data being used in production.
 * Run: node tests/test_infaction_mvp.cjs
 */
const assert=require('assert'), fs=require('fs'), vm=require('vm');
const frontend=fs.readFileSync('infaction-mvp.js','utf8');
const workerSource=fs.readFileSync('infaction-python-worker.js','utf8');

class Node {
 constructor(tag='div'){this.tagName=tag;this.children=[];this.listeners={};this.attrs={};this.style={setProperty(){}};this.textContent='';this.open=false;}
 append(...ns){this.children.push(...ns)}
 replaceChildren(...ns){this.children=[...ns]}
 setAttribute(k,v){this.attrs[k]=v}
 addEventListener(k,fn){this.listeners[k]=fn}
 querySelectorAll(tag){const out=[];const visit=n=>{for(const c of n.children){if(c.tagName===tag)out.push(c);visit(c)}};visit(this);return out}
 querySelector(tag){return this.querySelectorAll(tag)[0]||null}
 fire(type,e={}){return this.listeners[type]?.(e)}
}
const allText=n=>[n.textContent,...n.children.flatMap(allText)].filter(Boolean);
function createWorld(){
 const factions=['Wolf','Eagle','Bear','Fox','Shark','Owl'].map((a,i)=>({
  id:'F'+(i+1),animal:a,name:a+' Faction',
  types:[['Government'],['Revolutionary'],['Elite'],['Poor'],['Military'],['Religious']][i]}));
 const nodes={};
 function add(id,name,role,parent,owner,access){
  nodes[id]={id,name,display_name:name,generation_role:role,parent_id:parent,children_ids:[],
   attributes:{political_ownership:owner||{kind:'none',factions:[]},
   hidden_restricted:access||{hidden:false,restricted:false}}};
  if(parent)nodes[parent].children_ids.push(id);
 }
 add('land','The Land','root',null);
 add('city',"The Wolf's City",'city','land');
 add('zone:North',"The Wolf's North",'zone','land',{kind:'single',factions:['F1']});
 add('site:Den','The Den','site','zone:North',
     {kind:'dual',factions:['F1','F2']},{hidden:true,restricted:true});
 add('location:Camp',"The Eagle's Camp",'location','site:Den',
     {kind:'single',factions:['F2']});
 return {generator_version:'0.4.8',factions,
  places:{root_id:'land',counts:{all_places:Object.keys(nodes).length},nodes},
  access_nodes:[{id:'access:city',name:'City Gatehouse',type:'Gatehouse',
                 from_parent_id:'land',to_place_id:'city',permanent:true,locked:false},
                {id:'access:site:Den',name:'Den Gate',type:'Gate',
                 from_parent_id:'zone:North',to_place_id:'site:Den'}]};
}
function mount(entered){
 const app=new Node('div'),session={};
 if(entered)session['infaction-mvp-entered-v1']='1';
 const document={getElementById:()=>app,createElement:tag=>new Node(tag),
                 createDocumentFragment:()=>new Node('fragment')};
 const workers=[];
 class Worker {
  constructor(path){this.path=path;this.messages=[];workers.push(this)}
  postMessage(msg){this.messages.push(msg);queueMicrotask(()=>this.onmessage?.({data:{
   type:'world',world:createWorld()}}))}
 }
 const ctx={document,sessionStorage:{getItem:k=>session[k]||null,
  setItem:(k,v)=>session[k]=v},localStorage:{getItem:()=>null,setItem(){}},
  Worker,setTimeout,clearTimeout,console};
 vm.runInNewContext(frontend,ctx,{filename:'infaction-mvp.js'});
 return {app,session,workers};
}
async function testUI(){
 const intro=mount(false);
 assert.strictEqual(intro.app.children[0].id,'intro');
 intro.app.children[0].fire('contextmenu',{preventDefault(){}});
 await Promise.resolve();await Promise.resolve();
 assert.strictEqual(intro.session['infaction-mvp-entered-v1'],'1');
 assert.strictEqual(intro.workers.length,1);
 assert.strictEqual(intro.workers[0].messages[0].type,'generate');

 const active=mount(true);
 await Promise.resolve();await Promise.resolve();
 let texts=allText(active.app);
 assert(texts.includes('Wolf Faction'));
 assert(texts.includes('Eagle Faction'));
 assert(texts.some(x=>x.includes('Shared with Eagle Faction')));
 assert.strictEqual(active.app.querySelectorAll('details').length,6);
 assert(!texts.some(x=>['zone','site','location'].includes(x.toLowerCase())), 'Faction role labels must be hidden');
 let nav=active.app.children.find(x=>x.tagName==='nav');assert(nav);
 nav.children.find(x=>x.textContent==='Explore').fire('click');
 texts=allText(active.app);
 assert(texts.includes("The Wolf's City"));
 assert(texts.includes('The Den'));
 assert(texts.includes('Den Gate'));
 assert(texts.includes('City Gatehouse'));
 assert(!texts.some(x=>['zone','site','location'].includes(x.toLowerCase())), 'Explore role labels must be hidden');
 const statusIcons=active.app.querySelectorAll('svg');
 assert(statusIcons.length>=3);
 const top=active.app.children.find(x=>x.tagName==='header');
 const reroll=top.children.find(x=>x.tagName==='div').children.find(x=>x.tagName==='button');
 assert(reroll.textContent.includes('Reroll'));
 reroll.fire('click');
 assert.strictEqual(active.workers[0].messages.length,2,
  'Reroll must send second generation request to Python worker');
 await Promise.resolve();await Promise.resolve();
 assert(!frontend.includes('infaction_current_world.json'));
 assert(!frontend.includes("file.accept="),'Upload fallback must be removed');
 console.log('PASS UI: hold/right-click, Faction + Dual, Explore + City Gatehouse, Gate/flags, native worker reroll');
}
async function testWorker(){
 const emitted=[],fetched=[],assets={};
 const oldNb={cells:[{}, {source:['from IPython.display import display, Markdown\n']}]};
 const sample=createWorld();
 const fakePy={
  FS:{writeFile(path,value){assert.strictEqual(path,'/infaction_browser_assets.json');assets.bytes=value}},
  async runPythonAsync(script){
   assert(script.includes("infaction_v048_browser_cell_"));
   assert(script.includes("exec(compile(src"));
   assert(script.includes("result_json=json.dumps(full_world"));
   assets.bootstrap=script;
  },
  globals:{get(name){assert.strictEqual(name,'result_json');return JSON.stringify(sample)}}
 };
 const self={postMessage:msg=>emitted.push(msg)};
 const fetch=async url=>{
  fetched.push(url);
  const content=url.includes('0.4.3_City_Experiment_Revised.ipynb')?
    JSON.stringify(oldNb):url.includes('infaction_master_v0.4.json')?'{"book1":"present"}':'{"placeholder":true}';
  return {ok:true,text:async()=>content};
 };
 const ctx={self,fetch,TextEncoder,console,importScripts(url){
  assert(url.includes('/pyodide/v0.27.7/'))},
  loadPyodide:async()=>fakePy};
 vm.runInNewContext(workerSource,ctx,{filename:'infaction-python-worker.js'});
 await ctx.self.onmessage({data:{type:'generate'}});
 assert.strictEqual(fetched.length,20,'All native source files must be prefetched');
 assert(emitted.some(x=>x.type==='world'&&x.world.generator_version==='0.4.8'));
 assert(assets.bytes.length>0);
 assert(assets.bootstrap.includes('urllib.request.urlopen=_asset_urlopen'));
 assert(!emitted.some(x=>x.type==='error'));
 console.log('PASS worker bridge: all Python assets prefetched, original notebook execution wired, valid world returned');
}
(async()=>{new Function(frontend);new Function(workerSource);await testUI();await testWorker()})
 .catch(e=>{console.error(e);process.exitCode=1});
