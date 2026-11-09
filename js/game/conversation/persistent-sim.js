/**
 * Persistent playtest world, kept separate from the real game's save schema/UI.
 * One world contains Player Knowledge plus per-NPC V/D and Knowledge.
 * The active conversation only changes working values until finish().
 */
import {pages,npcs,playerStart} from '../content/playtest-npcs.js';
import {createSession,resolveBeat} from './board-model.js';

const copy=x=>JSON.parse(JSON.stringify(x));
const clamp=x=>Math.max(0,Math.min(10,x));
const cap=(n,max)=>Math.max(-max,Math.min(max,n));
const knownLevel=k=>Number.isInteger(k)&&k>=0;
const own=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);

export const WORLD_VERSION=1;
export const PLAYER_START=Object.freeze({
 location:'terminal',knowledge:playerStart
});

/** General Knowledge invariant, shared by Player and NPCs. */
export function validateKnowledge(knowledge){
 const errors=[];
 for(const [id,k] of Object.entries(knowledge)){
  const page=pages[id];
  if(!page||!knownLevel(k)){errors.push('Invalid Page/level: '+id);continue;}
  if(k===0||page.type!=='Relationship')continue;
  for(const endpoint of [page.a,page.b])
   if(!(knowledge[endpoint]>=1))errors.push(id+' missing basic Page '+endpoint);
 }
 return errors;
}
function acquireAwareness(knowledge,pageId,discovered){
 const page=pages[pageId];
 if(page?.type!=='Relationship'||!(knowledge[pageId]>=1))return;
 for(const id of [page.a,page.b]){
  if(!(knowledge[id]>=1)){
   knowledge[id]=1;
   discovered.push(id);
  }
 }
}
function completeKnowledge(knowledge){
 const discovered=[];
 for(const id of Object.keys(knowledge))acquireAwareness(knowledge,id,discovered);
 return discovered;
}
export function createWorld({
 playerKnowledge=playerStart,playerLocation='terminal',npcInitial={}
}={}){
 if(pages[playerLocation]?.type!=='Location')throw Error('Unknown Player location: '+playerLocation);
 const knowledge=copy(playerKnowledge);
 if(!(knowledge[playerLocation]>=1))throw Error('Player cannot start in an unknown location: '+playerLocation);
 const errors=validateKnowledge(knowledge);
 if(errors.length)throw Error('Invalid initial Player Knowledge: '+errors.join('; '));
 const npcStates=Object.fromEntries(Object.entries(npcs).map(([id,npc])=>{
  const override=npcInitial[id]||{};
  const values={...npc.initial,...override};
  for(const axis of ['v','d'])if(!Number.isFinite(values[axis])||values[axis]<0||values[axis]>10)
   throw Error('Invalid NPC '+axis+': '+id);
  const npcKnowledge=Object.fromEntries(Object.entries(npc.memory).map(([key,p])=>[key,p.knowledge]));
  return [id,{v:values.v,d:values.d,knowledge:npcKnowledge,interactions:0}];
 }));
 return {version:WORLD_VERSION,
  player:{location:playerLocation,knowledge},
  npcs:npcStates,active:null,records:[]};
}
export function begin(world,npcId){
 if(world.active)throw Error('Finish active interaction before beginning another');
 if(!npcs[npcId])throw Error('Unknown NPC: '+npcId);
 if(world.player.location!==npcs[npcId].location)
  throw Error('NPC '+npcId+' is at '+npcs[npcId].location+', not '+world.player.location);
 const persisted=world.npcs[npcId];
 const session=createSession(npcId,world.player.knowledge);
 session.state={v:persisted.v,d:persisted.d,p:npcs[npcId].initial.p};
 for(const [id,row] of Object.entries(session.memory)){
  row.npcLevel=persisted.knowledge[id]??0;
  row.playerLevel=world.player.knowledge[id]??0;
  row.gap=row.playerLevel-row.npcLevel;
 }
 world.active={npcId,session,starting:{v:persisted.v,d:persisted.d},
  firstImpression:persisted.interactions===0};
 return world.active;
}
export function beat(world,tokens,config){
 if(!world.active)throw Error('Begin a conversation before sending Player tokens');
 if(world.active.session.state.p<=0)throw Error('Patience exhausted: finish the interaction');
 if(!Array.isArray(tokens))throw TypeError('Player message must be tokens');
 // Only allow Pages Player actually knows. This is a playtest input invariant,
 // not an additional NPC response mechanic.
 for(const token of tokens)
  if(token?.kind==='info'&&!(world.player.knowledge[token.id]>=1))
   throw Error('Player does not know Page: '+token.id);
 return resolveBeat(world.active.session,tokens,config);
}
export function finish(world,{farewellEmoji=null}={}){
 const active=world.active;
 if(!active)throw Error('No active interaction');
 const {npcId,session,starting,firstImpression}=active;
 if(farewellEmoji!==null){
  if(typeof farewellEmoji!=='string'||!farewellEmoji)throw Error('Invalid farewell Emoji');
  resolveBeat(session,[{kind:'emoji',value:farewellEmoji}],undefined,{reactionOnly:true});
 }
 const persisted=world.npcs[npcId];
 const affectCap=firstImpression?3:1;
 const delta={
  v:cap(session.state.v-starting.v,affectCap),
  d:cap(session.state.d-starting.d,affectCap)
 };
 persisted.v=clamp(starting.v+delta.v);
 persisted.d=clamp(starting.d+delta.d);
 const learnedByPlayer=[],learnedByNpc=[],discoveredByPlayer=[],discoveredByNpc=[];
 for(const [id,row] of Object.entries(session.memory)){
  if(row.pendingPlayerGain && row.npcLevel-row.playerLevel>=2){
   // We never lower any Knowledge Level, even when simultaneous discoveries overlap.
   world.player.knowledge[id]=(world.player.knowledge[id]??0)+1;
   learnedByPlayer.push(id);
   acquireAwareness(world.player.knowledge,id,discoveredByPlayer);
  }
  if(row.pendingNpcGain && row.playerLevel-row.npcLevel>=2){
   persisted.knowledge[id]=(persisted.knowledge[id]??0)+1;
   learnedByNpc.push(id);
   acquireAwareness(persisted.knowledge,id,discoveredByNpc);
  }
 }
 persisted.interactions++;
 const report={
  npcId,firstImpression,beats:session.history.filter(m=>m.from==='player').length,
  starting,ending:{v:persisted.v,d:persisted.d},delta,
  learnedByPlayer,learnedByNpc,
  discoveredByPlayer:[...new Set(discoveredByPlayer)],
  discoveredByNpc:[...new Set(discoveredByNpc)],
  transcript:copy(session.history)
 };
 world.records.push(report);
 world.active=null;
 const playerErrors=validateKnowledge(world.player.knowledge);
 const npcErrors=validateKnowledge(persisted.knowledge);
 if(playerErrors.length||npcErrors.length)throw Error('Knowledge invariant violated: '+[...playerErrors,...npcErrors].join('; '));
 return report;
}
export function setPlayerLocation(world,id){
 if(world.active)throw Error('Finish interaction before changing location');
 if(pages[id]?.type!=='Location')throw Error('Not a valid location Page: '+id);
 if(!(world.player.knowledge[id]>=1))throw Error('Location not discovered by Player: '+id);
 // This is a scenario metadata setter, NOT final travel/access gameplay.
 world.player.location=id;
 return id;
}
/** Reset restores the original fixture, independent of previous sessions. */
export function resetWorld(){return createWorld();}
export function serializeWorld(world){return JSON.stringify(world,null,2);}
export function restoreWorld(json){
 const world=typeof json==='string'?JSON.parse(json):copy(json);
 if(world?.version!==WORLD_VERSION||!world.player||!world.npcs||!Array.isArray(world.records))
  throw Error('Invalid playtest world version/shape');
 if(pages[world.player.location]?.type!=='Location'||!(world.player.knowledge[world.player.location]>=1))
  throw Error('Invalid saved Player location');
 const playerErrors=validateKnowledge(world.player.knowledge??{});
 if(playerErrors.length)throw Error('Invalid saved Player Knowledge: '+playerErrors.join('; '));
 for(const id of Object.keys(npcs)){
  const saved=world.npcs[id];
  if(!saved||![saved.v,saved.d].every(n=>Number.isFinite(n)&&n>=0&&n<=10)||
   !Number.isInteger(saved.interactions)||saved.interactions<0)
   throw Error('Invalid saved NPC state: '+id);
  const err=validateKnowledge(saved.knowledge??{});
  if(err.length)throw Error('Invalid saved NPC Knowledge '+id+': '+err.join('; '));
  for(const pageId of Object.keys(npcs[id].memory))
   if(!(saved.knowledge[pageId]>=1))throw Error('Missing NPC authored Page: '+id+'/'+pageId);
 }
 if(world.active){
  const id=world.active.npcId,session=world.active.session;
  if(!npcs[id]||session?.npcId!==id||!session.state||
   !Array.isArray(session.history)||!session.memory)throw Error('Invalid active conversation');
 }
 return world;
}
