import test from 'node:test';
import assert from 'node:assert/strict';
import {createSession,resolveBeat,MODEL_CONFIG} from '../js/game/conversation/board-model.js';
import {testCheckpointKnowledge} from '../js/game/content/playtest-npcs.js';
const T=id=>({kind:'info',id}),E=value=>({kind:'emoji',value});
const names=t=>t.map(x=>x.id??x.value);
const run=(npc,move,limit=24)=>{
 const s=createSession(npc,testCheckpointKnowledge),log=[];
 while(s.state.p>0&&log.length<limit){
  const result=resolveBeat(s,typeof move==='function'?move(log.length):move);
  log.push(result);
 }
 return log;
};
test('insults prompt interpersonal response instead of unrelated NPC Interest',()=>{
 for(const [npc,first] of [['harun','😡'],['jali','😡'],['ratih','😟']]){
  const log=run(npc,[E('😡'),E('👎')]);
  assert.deepEqual(names(log[0].tokens),[first]);
  assert.ok(log.length<=3);
  assert.deepEqual(names(log.at(-1).tokens),['💤']);
  assert.ok(log.slice(1,-1).every(x=>x.tokens.length===0||x.tokens.every(t=>t.kind==='emoji')));
 }
});
test('repeated agreement is annoying even when initial Alignment is positive',()=>{
 const log=run('harun',[T('perantau'),E('👍')]);
 assert.ok(log[0].reaction.deltaV>0);
 assert.ok(log.some(x=>x.reaction.deltaV<0));
 assert.ok(log.some(x=>names(x.tokens).includes('😡')));
 assert.ok(log.length<10,'repeated aligned praise must not be infinite');
});
test('stacking four and six emojis incurs faster exit than one positive emoji',()=>{
 const single=resolveBeat(createSession('jali'),[E('🙂')]);
 const four=resolveBeat(createSession('jali'),[E('🙂'),E('👍'),E('❤️'),E('🙏')]);
 const six=resolveBeat(createSession('jali'),[E('🙂'),E('👍'),E('❤️'),E('🙏'),E('❗'),E('😎')]);
 assert.ok(four.reaction.patienceCost>single.reaction.patienceCost);
 assert.ok(six.reaction.patienceCost>four.reaction.patienceCost);
 assert.deepEqual(names(six.tokens),['💤']);
});
test('natural conversation and relevant tactics remain viable without hard beat limit',()=>{
 const cycles={
  harun:[T('perantau'),T('saman'),T('kampung_halaman')],
  ratih:[T('dimas'),T('pasar_induk'),T('kawasan_industri')]
 };
 const normalH=run('harun',t=>[cycles.harun[t%3]]);
 const normalR=run('ratih',t=>[cycles.ratih[t%3]]);
 assert.ok(normalH.length>=5&&normalH.length<=10);
 assert.ok(normalR.length>=5&&normalR.length<=10);
 const effective=run('harun',t=>[
  [T('perantau'),E('👍')],[T('kampung_halaman'),E('🙂')],[T('saman'),E('❓')]
 ][t%3]);
 assert.ok(effective.length>normalH.length);
});
test('an ASK can still elicit substantive information',()=>{
 const response=resolveBeat(createSession('jali',testCheckpointKnowledge),[T('kawasan_industri'),E('❓')]);
 assert.deepEqual(names(response.tokens),['kawasan_industri']);
 assert.equal(response.pending.kawasan_industri.player,1);
});
test('no new persistent NPC emotional state is introduced',()=>{
 const session=createSession('ratih',testCheckpointKnowledge);
 assert.deepEqual(Object.keys(session.state).sort(),['d','p','v']);
 assert.ok(MODEL_CONFIG.socialCost>0);
});
