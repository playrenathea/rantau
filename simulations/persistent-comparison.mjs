/**
 * Reproducible multi-session balance comparisons.
 * Policies are TEST INPUTS, never new NPC behavior or game rules.
 * No mutation of the static NPC fixture or of the live game.
 */
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {npcs,playerStart} from '../js/game/content/playtest-npcs.js';
import {createWorld,begin,beat,finish} from '../js/game/conversation/persistent-sim.js';
import {MODEL_CONFIG} from '../js/game/conversation/board-model.js';
const T=id=>({kind:'info',id});
const E=value=>({kind:'emoji',value});
export const informedStart={
 ...playerStart,pasar_induk:1,kawasan_industri:3,pelabuhan:1,
 dimas:3,dimas__kawasan_industri:3,
 ratih:1,pesan_jali:1,ratih__pesan_jali:1
};
const scenarios={
 harun:{
  spam:()=>[T('saman'),E('❓')],
  listen:()=>[],
  adaptive:i=>[ [T('perantau'),E('👍')],[T('saman'),E('❓')],[T('kampung_halaman'),E('🙂')]][i%3]
 },
 jali:{
  spam:()=>[T('terminal'),E('❓')],
  listen:()=>[],
  adaptive:i=>[ [T('pelabuhan'),E('❓')],[T('kawasan_industri'),E('❓')],
   [T('ratih'),E('👥')],[T('terminal'),E('❓')] ][i%4]
 },
 ratih:{
  spam:()=>[T('dimas'),T('kawasan_industri')],
  listen:()=>[],
  adaptive:i=>[ [T('dimas'),T('kawasan_industri')],[T('dimas'),E('❓')],
   [T('ratih'),E('🙂')] ][i%3]
 }
};
export function runComparison({
 sessions=4,beatsPerSession=6,config=MODEL_CONFIG
}={}){
 const results=[];
 for(const npcId of Object.keys(npcs)){
  for(const policy of Object.keys(scenarios[npcId])){
   const world=createWorld({playerKnowledge:informedStart,playerLocation:npcs[npcId].location});
   const initial={...world.player.knowledge};
   let turns=0,exhausted=0;
   const transcripts=[];
   for(let k=0;k<sessions;k++){
    begin(world,npcId);
    for(let j=0;j<beatsPerSession;j++){
     if(world.active.session.state.p<=0)break;
     const msg=scenarios[npcId][policy](k*beatsPerSession+j);
     const r=beat(world,msg,config);
     turns++;
     if(k===0)transcripts.push({player:msg,npc:r.tokens,patience:+r.state.p.toFixed(3)});
    }
    if(world.active.session.state.p<=0)exhausted++;
    finish(world);
   }
   const gained=Object.entries(world.player.knowledge).filter(([id,k])=>k>(initial[id]??0))
    .map(([id,k])=>({pageId:id,from:initial[id]??0,to:k}));
   const npcLearned=Object.entries(world.npcs[npcId].knowledge)
    .filter(([id,k])=>k>npcs[npcId].memory[id].knowledge)
    .map(([id,k])=>({pageId:id,from:npcs[npcId].memory[id].knowledge,to:k}));
   results.push({npcId,policy,sessions,turns,exhausted,
    finalV:+world.npcs[npcId].v.toFixed(3),
    finalD:+world.npcs[npcId].d.toFixed(3),
    playerLearned:gained,npcLearned,
    firstSession:transcripts});
  }
 }
 return results;
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const results=runComparison();
 console.log(JSON.stringify(results,null,2));
}
