/**
 * Browser-only MVP playtest checkpoint, independent of legacy rantau.save.v1.
 * The world JSON remains authoritative; Explorer/Chat/Memory read a projection.
 */
import {pages,npcs,playerStart} from './game/content/playtest-npcs.js';
import {createWorld,restoreWorld,resetWorld,serializeWorld} from './game/conversation/persistent-sim.js';
const KEY='rantau.playtest.v1';
export const TEST_CHECKPOINT={
 ...playerStart,pasar_induk:1,kawasan_industri:3,dimas:3,dimas__kawasan_industri:3
};
const clone=x=>JSON.parse(JSON.stringify(x));
const pins=(ids,world)=>[...new Set((Array.isArray(ids)?ids:[])
 .filter(id=>typeof id==='string'&&world.player.knowledge[id]>0&&pages[id]))].slice(0,7);
export function fresh(){
 return {schemaVersion:2,mode:'npc-playtest',world:createWorld({playerKnowledge:clone(TEST_CHECKPOINT)}),
  tab:'explorer',mapOpen:false,expanded:[],workingMemory:['saman','perantau','dimas']};
}
export function project(s){
 const w=s.world,rel={};
 for(const [id,page] of Object.entries(pages))
  if(page.type==='Relationship')rel[id]=w.player.knowledge[id]??0;
 const states=Object.fromEntries(Object.entries(npcs).map(([id,npc])=>{
  const live=w.active?.npcId===id?w.active.session:null;
  return [id,{
   v:live?.state.v??w.npcs[id].v,d:live?.state.d??w.npcs[id].d,
   p:live?.state.p??npc.initial.p,
   history:live?.history??[],exited:!!live&&live.state.p<=0
  }];
 }));
 return {...s,location:w.player.location,knowledge:w.player.knowledge,
  relations:rel,activeNpc:w.active?.npcId??null,npcStates:states};
}
export function pack(s){
 return {schemaVersion:2,mode:'npc-playtest',world:s.world,
  expanded:s.expanded,workingMemory:pins(s.workingMemory,s.world)};
}
export function parseSave(text){
 const file=JSON.parse(text);
 if(file?.schemaVersion!==2||file?.mode!=='npc-playtest')
  throw Error('Ini bukan save Rantau NPC Playtest v2.');
 const world=restoreWorld(file.world);
 return {schemaVersion:2,mode:'npc-playtest',world,tab:world.active?'chat':'explorer',
  mapOpen:false,expanded:Array.isArray(file.expanded)?file.expanded:[],
  workingMemory:pins(file.workingMemory,world)};
}
export function load(){
 try{
  const raw=localStorage.getItem(KEY);
  if(!raw)return fresh();
  return parseSave(raw);
 }catch(err){console.warn('Playtest save invalid; original checkpoint restored',err);return fresh();}
}
export function persist(s){
 try{localStorage.setItem(KEY,JSON.stringify(pack(s)));}
 catch(err){console.warn('Playtest save failed',err);}
}
export function downloadSave(s){
 const blob=new Blob([JSON.stringify(pack(s),null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='rantau-npc-playtest-v2.json';a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
