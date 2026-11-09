#!/usr/bin/env node
/**
 * Rantau sandbox persistence CLI. Separate file from the production browser save.
 * Commands:
 *   node simulations/persistent-board.mjs reset [--preset newcomer|informed]
 *   node simulations/persistent-board.mjs status
 *   node simulations/persistent-board.mjs begin harun|jali|ratih
 *   node simulations/persistent-board.mjs beat info:saman emoji:❓
 *   node simulations/persistent-board.mjs beat          (Listen)
 *   node simulations/persistent-board.mjs end
 *   node simulations/persistent-board.mjs move pasar_induk
 *   node simulations/persistent-board.mjs demo
 *   [--file /path/to/save.json] on any command
 */
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {pages,npcs,testCheckpointKnowledge} from '../js/game/content/playtest-npcs.js';
import {
 createWorld,resetWorld,begin,beat,finish,setPlayerLocation,serializeWorld,restoreWorld
} from '../js/game/conversation/persistent-sim.js';

const argv=process.argv.slice(2);
const fileAt=argv.indexOf('--file');
const savePath=fileAt>=0?resolve(argv[fileAt+1]):resolve(dirname(fileURLToPath(import.meta.url)),'.persistent-world.json');
if(fileAt>=0){
 if(!argv[fileAt+1])throw Error('Missing --file path');
 argv.splice(fileAt,2);
}
const presetAt=argv.indexOf('--preset');
const preset=presetAt>=0?argv[presetAt+1]:'newcomer';
if(presetAt>=0)argv.splice(presetAt,2);
const [command='status',...args]=argv;
const token=t=>{
 if(t.startsWith('info:'))return {kind:'info',id:t.slice(5)};
 if(t.startsWith('emoji:'))return {kind:'emoji',value:t.slice(6)};
 throw Error('Token must be info:<Page ID> or emoji:<symbol>: '+t);
};
const read=()=>existsSync(savePath)?restoreWorld(readFileSync(savePath,'utf8')):resetWorld();
const write=world=>writeFileSync(savePath,serializeWorld(world)+'\n','utf8');
const summary=world=>({
 savePath,player:world.player,
 npcStates:Object.fromEntries(Object.entries(world.npcs).map(([id,s])=>
  [id,{v:+s.v.toFixed(3),d:+s.d.toFixed(3),sessions:s.interactions,
    knowledgeChanges:Object.fromEntries(Object.entries(s.knowledge).filter(([page,k])=>
     k!==npcs[id].memory[page]?.knowledge))}])),
 active:world.active?{npc:world.active.npcId,
  beatCount:world.active.session.history.filter(m=>m.from==='player').length,
  working:world.active.session.state,
  pending:Object.fromEntries(Object.entries(world.active.session.memory).filter(([,p])=>
   p.pendingPlayerGain||p.pendingNpcGain).map(([id,p])=>[id,{player:p.pendingPlayerGain,npc:p.pendingNpcGain}]))}:null,
 completed:world.records.length
});
let world;
switch(command){
 case 'reset':
  if(preset==='newcomer')world=resetWorld();
  else if(preset==='informed')world=createWorld({
   playerKnowledge:{...testCheckpointKnowledge}
  });
  else throw Error('Unknown preset: '+preset);
  write(world);console.log(JSON.stringify({reset:true,preset,...summary(world)},null,2));break;
 case 'status':
  world=read();console.log(JSON.stringify(summary(world),null,2));break;
 case 'begin':
  world=read();begin(world,args[0]);write(world);
  console.log(JSON.stringify({began:args[0],...summary(world)},null,2));break;
 case 'beat':
  world=read();
  const played=args.map(token);
  const result=beat(world,played);
  write(world);
  console.log(JSON.stringify({player:played,npc:result.tokens,reaction:result.reaction,
   scores:result.ranked.slice(0,4).map(x=>({key:x.key,score:+x.score.toFixed(3)})),
   pending:result.pending,...summary(world)},null,2));break;
 case 'end':
  world=read();
  const report=finish(world);write(world);
  console.log(JSON.stringify({committed:report,...summary(world)},null,2));break;
 case 'move':
  world=read();setPlayerLocation(world,args[0]);write(world);
  console.log(JSON.stringify(summary(world),null,2));break;
 case 'demo':{
  world=read();
  if(world.active)throw Error('End the active conversation before demo');
  const script=[['harun',[[token('info:saman'),token('emoji:❓')],
    [token('info:perantau'),token('emoji:👍')],[token('info:saman'),token('emoji:❓')]]],
   ['jali',[[],[token('info:terminal'),token('emoji:❓')]]]];
  const runs=[];
  for(const [id,moves] of script){
   if(world.player.location!==npcs[id].location)continue;
   begin(world,id);
   const lines=[];
   for(const msg of moves){if(world.active.session.state.p<=0)break;
    const r=beat(world,msg);lines.push({player:msg,npc:r.tokens,p:r.state.p});}
   runs.push({id,lines,report:finish(world)});
  }
  // Optional Ratih encounter when prior play has discovered Pasar Induk.
  if(world.player.knowledge.pasar_induk>=1){
   setPlayerLocation(world,'pasar_induk');
   begin(world,'ratih');
   const lines=[];
   for(const msg of [[],[{kind:'info',id:'dimas'},{kind:'info',id:'kawasan_industri'}]]){
    if(msg.some(t=>t.kind==='info'&&!(world.player.knowledge[t.id]>=1)))continue;
    const r=beat(world,msg);lines.push({player:msg,npc:r.tokens,p:r.state.p});
   }
   runs.push({id:'ratih',lines,report:finish(world)});
  }
  write(world);console.log(JSON.stringify({runs,...summary(world)},null,2));break;
 }
 default:throw Error('Unknown command '+command);
}
