'use strict';
/* Minimal DOM-backed contract test for the static Infaction MVP.
 * Run: node tests/test_infaction_mvp.cjs
 */
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('infaction-mvp.js','utf8');
class Node {
 constructor(tag='div'){this.tagName=tag;this.children=[];this.listeners={};this.attrs={};this.style={setProperty(){}};this.textContent='';this.open=false}
 append(...nodes){this.children.push(...nodes)}
 replaceChildren(...nodes){this.children=[...nodes]}
 setAttribute(name,value){this.attrs[name]=value}
 addEventListener(name,fn){this.listeners[name]=fn}
 querySelectorAll(tag){let result=[];const walk=node=>{for(const child of node.children){if(child.tagName===tag)result.push(child);walk(child)}};walk(this);return result}
 fire(name,e={}){return this.listeners[name]?.(e)}
}
function setup(entered,fixture){
 const app=new Node('div'),session={},storage={};
 if(entered)session['infaction-mvp-entered-v1']='1';
 const document={getElementById:()=>app,createElement:tag=>new Node(tag),createDocumentFragment:()=>new Node('fragment')};
 const ctx={document,sessionStorage:{getItem:k=>session[k]||null,setItem:(k,v)=>session[k]=v},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},fetch:async()=>fixture?{ok:true,json:async()=>fixture}:{ok:false,status:404},setTimeout,clearTimeout};
 vm.runInNewContext(source,ctx);
 return {app,session,storage};
}
const text=node=>[node.textContent,...node.children.flatMap(text)].filter(Boolean);
function createWorld(){
 const actors=['Wolf','Eagle','Bear','Fox','Shark','Owl'].map((animal,i)=>({id:'F'+(i+1),name:animal+' Faction',types:[['Government'],['Revolutionary'],['Elite'],['Poor'],['Military'],['Religious']][i]}));
 const nodes={};
 function add(id,name,role,parent,owner=null,flags=null){
  nodes[id]={id,name,display_name:name,generation_role:role,parent_id:parent,children_ids:[],attributes:{political_ownership:owner||{kind:'none',factions:[]},hidden_restricted:flags||{hidden:false,restricted:false}}};
  if(parent)nodes[parent].children_ids.push(id);
 }
 add('land','The Land','root',null);
 add('city',"Wolf's City",'city','land');
 add('zone:North',"Wolf's Fang North",'zone','land',{kind:'single',factions:['F1']});
 add('site:Den','Claw Den','site','zone:North',{kind:'dual',factions:['F1','F2']},{hidden:true,restricted:true});
 add('location:Camp',"Eagle's Wing Camp",'location','site:Den',{kind:'single',factions:['F2']});
 return {factions:actors,places:{root_id:'land',counts:{all_places:5},nodes},access_nodes:[{id:'access:site:Den',name:'Den Gate',type:'Gate',to_place_id:'site:Den',from_parent_id:'zone:North'}]};
}
(async()=>{
 const first=setup(false);
 assert.strictEqual(first.app.children[0].id,'intro');
 first.app.children[0].fire('contextmenu',{preventDefault(){}});
 await Promise.resolve();await Promise.resolve();await Promise.resolve();
 assert.strictEqual(first.session['infaction-mvp-entered-v1'],'1');
 assert(first.app.children.some(n=>n.tagName==='nav'),'no direct navigation after intro');
 const active=setup(true,createWorld());
 for(let i=0;i<12;i++)await Promise.resolve();
 let nav=active.app.children.find(x=>x.tagName==='nav');assert(nav);
 nav.children.find(x=>x.textContent==='Explore').fire('click');
 const explored=text(active.app);
 assert(explored.includes('The Land'));
 assert(explored.includes('Claw Den'));
 assert(explored.includes('Den Gate'));
 nav=active.app.children.find(x=>x.tagName==='nav');
 nav.children.find(x=>x.textContent==='Factions').fire('click');
 const factions=text(active.app);
 assert(factions.includes('Wolf Faction'));
 assert(factions.includes('Eagle Faction'));
 assert(factions.some(x=>x.includes('Shared with Eagle Faction')));
 assert.strictEqual(active.app.querySelectorAll('details').length,6);
 console.log('PASS: intro/context-menu, Explore tree + Gate, six Factions and Shared Dual ownership');
})().catch(e=>{console.error(e);process.exitCode=1});
