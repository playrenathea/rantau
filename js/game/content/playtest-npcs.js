/**
 * Rantau narrative playtest content. Intentionally NOT imported by the live UI.
 * All numeric values are draft balancing fixtures, not finalized mechanics.
 */
export const pages={
 terminal:{name:'Terminal',type:'Location'},perantau:{name:'Perantau',type:'Group'},
 kampung_halaman:{name:'Kampung Halaman',type:'Location'},
 saman:{name:'Pak Saman',type:'Individual'},wira:{name:'Wira',type:'Individual'},
 narto:{name:'Narto',type:'Individual'},pulang_kampung:{name:'Pulang Kampung',type:'Concept'},
 pasar_induk:{name:'Pasar Induk',type:'Location'},kampung_kota:{name:'Kampung Kota',type:'Location'},
 kawasan_industri:{name:'Kawasan Industri',type:'Location'},pelabuhan:{name:'Pelabuhan',type:'Location'},
 ratih:{name:'Bu Ratih',type:'Individual'},dimas:{name:'Dimas',type:'Individual'},
 bang_jali:{name:'Bang Jali',type:'Individual'},pesan_jali:{name:'Pesan Jali',type:'Concept'},
 saman__perantau:{name:'Saman–Perantau',type:'Relationship',a:'saman',b:'perantau'},
 saman__wira:{name:'Saman–Wira',type:'Relationship',a:'saman',b:'wira'},
 saman__narto:{name:'Saman–Narto',type:'Relationship',a:'saman',b:'narto'},
 wira__pulang_kampung:{name:'Wira–Pulang Kampung',type:'Relationship',a:'wira',b:'pulang_kampung'},
 narto__pasar_induk:{name:'Narto–Pasar Induk',type:'Relationship',a:'narto',b:'pasar_induk'},
 ratih__pasar_induk:{name:'Ratih–Pasar Induk',type:'Relationship',a:'ratih',b:'pasar_induk'},
 dimas__kawasan_industri:{name:'Dimas–Kawasan Industri',type:'Relationship',a:'dimas',b:'kawasan_industri'},
 ratih__dimas:{name:'Ratih–Dimas',type:'Relationship',a:'ratih',b:'dimas'},
 ratih__pesan_jali:{name:'Ratih–Pesan Jali',type:'Relationship',a:'ratih',b:'pesan_jali'}
};
const m=(knowledge,openness,extra={})=>({knowledge,openness,...extra});
const i=(emoji,priority)=>({emoji,priority});
export const npcs={
 harun:{name:'Pak Harun',role:'Pemilik warung terminal',location:'terminal',initial:{v:3,d:6,p:8},memory:{
  terminal:m(5,9),perantau:m(5,9,{interest:i('❗',5),attitude:{v:1,d:-1}}),
  kampung_halaman:m(4,8,{attitude:{v:1}}),saman:m(5,2,{attitude:{v:-1,d:1}}),
  wira:m(4,8),narto:m(4,7),pulang_kampung:m(4,8),pasar_induk:m(2,7),
  saman__perantau:m(5,3,{attitude:{v:-1}}),saman__wira:m(4,4),saman__narto:m(4,5),
  wira__pulang_kampung:m(4,8,{interest:i('❗',2)}),
  narto__pasar_induk:m(4,6,{attitude:{v:1}})
 }},
 jali:{name:'Bang Jali',role:'Calo angkutan dan pengantar titipan',location:'terminal',initial:{v:6,d:8,p:4},memory:{
  terminal:m(5,10,{attitude:{v:1,d:1}}),pasar_induk:m(5,9),kampung_kota:m(4,9),
  kawasan_industri:m(5,8),pelabuhan:m(5,9,{interest:i('❗',4)}),
  narto:m(3,8),ratih:m(4,9),dimas:m(2,8),pesan_jali:m(4,8),
  narto__pasar_induk:m(4,8),ratih__pasar_induk:m(4,9),
  dimas__kawasan_industri:m(4,8),
  ratih__pesan_jali:m(4,7,{interest:i('❗',5)})
 }},
 ratih:{name:'Bu Ratih',role:'Pedagang Pasar Induk',location:'pasar_induk',initial:{v:4,d:3,p:7},memory:{
  pasar_induk:m(5,9,{attitude:{v:1,d:-1}}),ratih:m(5,10),
  dimas:m(5,10,{attitude:{v:1,d:-1}}),kawasan_industri:m(1,9),
  pelabuhan:m(1,7),bang_jali:m(3,8),narto:m(3,8),pesan_jali:m(1,10),
  ratih__dimas:m(5,10,{attitude:{v:1,d:-1}}),
  dimas__kawasan_industri:m(1,10,{interest:i('📍',5)}),
  ratih__pesan_jali:m(1,10,{interest:i('❓',3)}),narto__pasar_induk:m(3,8)
 }}
};
/** Missing player knowledge defaults to level zero. */
export const playerStart={terminal:1,perantau:1,kampung_halaman:3,saman:1};
/** Playtest-only checkpoint, intentionally later than the story's true beginning. */
export const testCheckpointKnowledge=Object.freeze({
 ...playerStart,pasar_induk:1,kawasan_industri:3,dimas:3,dimas__kawasan_industri:3
});
/**
 * Make one snapshot of the knowledge comparison at interaction start.
 * Null branch/contra status means UNASSESSED, not false.
 * No knowledge levels change mid-interaction: pending marks commit afterwards.
 */
export function createInteractionMemory(npcId,playerLevels=playerStart){
 const npc=npcs[npcId];if(!npc)throw Error('Unknown NPC: '+npcId);
 return Object.fromEntries(Object.entries(npc.memory).map(([id,page])=>{
  const playerLevel=playerLevels[id]??0;
  return [id,{pageId:id,npcLevel:page.knowledge,playerLevel,
   gap:playerLevel-page.knowledge,openness:page.openness,
   interest:page.interest??null,attitude:page.attitude??null,
   contra:null,unexploredBranch:null,pendingPlayerGain:0,pendingNpcGain:0}];
 }));
}
/**
 * Data contract only: no new conversation formula, UI integration, or save migration.
 * Relationship K>0 requires both endpoint pages known with K>=1.
 */
export function validate({catalog=pages,characters=npcs,startingKnowledge=playerStart}={}){
 const errors=[],error=s=>errors.push(s),level=n=>Number.isInteger(n)&&n>=0;
 const range=n=>Number.isFinite(n)&&n>=0&&n<=10;
 for(const [id,p] of Object.entries(catalog)){
  if(!p.name||!p.type)error('Bad catalog page: '+id);
  if(p.type==='Relationship'){
   if(!p.a||!p.b||p.a===p.b||!catalog[p.a]||!catalog[p.b]||
    catalog[p.a]?.type==='Relationship'||catalog[p.b]?.type==='Relationship')
    error('Bad relationship endpoints: '+id);
  }else if(p.a||p.b)error('Base page has relationship endpoints: '+id);
 }
 for(const [id,k] of Object.entries(startingKnowledge))
  if(!catalog[id]||!level(k))error('Bad player starting page: '+id);
 for(const [name,npc] of Object.entries(characters)){
  if(!npc.name||catalog[npc.location]?.type!=='Location')error('Bad NPC identity/location: '+name);
  for(const axis of ['v','d','p'])if(!range(npc.initial?.[axis]))error('Bad '+axis+': '+name);
  for(const [id,p] of Object.entries(npc.memory??{})){
   const def=catalog[id];
   if(!def){error('Unknown memory page: '+name+'/'+id);continue;}
   if(!level(p.knowledge)||p.knowledge<1||!range(p.openness))
    error('Bad K/O: '+name+'/'+id);
   if(p.interest && (!['❓','❗','📍','⏳','👥'].includes(p.interest.emoji)||
     !Number.isInteger(p.interest.priority)||p.interest.priority<1||p.interest.priority>5))
    error('Bad interest: '+name+'/'+id);
   if(p.attitude && (!Object.keys(p.attitude).length||
     Object.entries(p.attitude).some(([axis,x])=>!['v','d'].includes(axis)||!Number.isFinite(x)||x< -1||x>1)))
    error('Bad attitude: '+name+'/'+id);
   if(def.type==='Relationship'&&p.knowledge>0)
    for(const endpoint of [def.a,def.b])
     if(!(npc.memory[endpoint]?.knowledge>=1))error('Missing relationship base: '+name+'/'+id+' -> '+endpoint);
  }
 }
 return errors;
}
