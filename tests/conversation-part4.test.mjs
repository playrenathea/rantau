import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateInteraction,resolveTestLearning,commitTestInteraction,POLICIES,SAMPLE_WORLD,T,E} from '../simulations/part4-harness.mjs';
import {DEFAULT_IMPACT_CONFIG} from '../js/game/conversation/impact.js';
const initial={v:5,d:5,p:8};
const variants={
 normal:SAMPLE_WORLD,
 hostile:{...SAMPLE_WORLD,openness:2,topicAttitudes:{militer:{v:1,d:9}},npcInterests:{militer:'❗'}},
 curious:{...SAMPLE_WORLD,openness:9,npcInterests:{militer:'❓'},npcKnowledge:{...SAMPLE_WORLD.npcKnowledge,militer:1}}
};
for(const [npc,world] of Object.entries(variants))test('full dialogue policy matrix: '+npc,()=>{
 for(const [name,policy] of Object.entries(POLICIES)){
  const r=simulateInteraction(policy,{turns:10,world,initial});
  assert.ok(r.turns>=1&&r.turns<=10,name);
  assert.ok(r.log.every(t=>['answer','ask','inform','express','redirect','withdraw'].includes(t.action)),name);
  assert.ok(r.log.every(t=>Number.isFinite(t.v)&&Number.isFinite(t.d)&&Number.isFinite(t.p)),name);
  assert.ok(['v','d','p'].every(k=>r.state[k]>=0&&r.state[k]<=10),name);
  assert.ok(r.log.every(t=>typeof t.output==='string'&&t.output.length),name);
  assert.ok(r.log.filter(t=>t.terminal).length<=1,name);
  assert.ok(r.log.every((t,i)=>!t.terminal||i===r.log.length-1),name);
  assert.ok(r.knowledgeGains.every(id=>r.playerKnowledge[id]-(world.playerKnowledge?.[id]||0)===1),name);
  assert.ok(Math.abs(r.commit.vDelta)<=1&&Math.abs(r.commit.dDelta)<=1,name);
 }
});
test('different emoji-only values share Repeat progression',()=>{
 const r=simulateInteraction(POLICIES.emojiVariation,{turns:3,initial});
 assert.deepEqual(r.log.map(x=>x.repeat),[false,true,true]);
});
test('Listen spam repeats and eventually exits',()=>{
 const r=simulateInteraction(POLICIES.listen,{turns:20,initial});
 assert.equal(r.log[1].repeat,true);assert.equal(r.log.at(-1).terminal,true);assert.ok(r.turns<20);
});
test('repeated question cannot farm more than one knowledge level per interaction',()=>{
 const r=simulateInteraction(POLICIES.learn,{turns:20,initial});
 assert.deepEqual(r.knowledgeGains,['militer']);
 assert.equal(r.playerKnowledge.militer,SAMPLE_WORLD.playerKnowledge.militer+1);
});
test('no knowledge without an actual matching NPC information token',()=>{
 const p={militer:1};
 const gain=resolveTestLearning({playerTokens:[T('militer'),E('❓')],previousNpcTokens:[],
   previousPlayerMessages:[],npcTokens:[E('😐')],playerLevels:p,npcLevels:{militer:5},learned:new Set()});
 assert.deepEqual(gain,[]);assert.equal(p.militer,1);
});
test('question, repetition, adjacent Listen each support learning',()=>{
 for(const [tokens,prior] of [
  [[T('militer'),E('❓')],[]],[[T('militer')],[[T('militer')]]],[[],[]]
 ]){
  const p={militer:1};
  const gain=resolveTestLearning({playerTokens:tokens,previousNpcTokens:[],
    previousPlayerMessages:prior,npcTokens:[T('militer')],playerLevels:p,
    npcLevels:{militer:5},learned:new Set()});
  assert.deepEqual(gain,['militer']);
 }
});
test('Listen immediately after information supports learning',()=>{
 const p={militer:1};
 assert.deepEqual(resolveTestLearning({playerTokens:[],previousNpcTokens:[T('militer'),E('👎')],
   previousPlayerMessages:[],npcTokens:[E('🙂')],playerLevels:p,npcLevels:{militer:5},learned:new Set()}),['militer']);
});
test('knowledge gain has +1 cap even with repeated triggers',()=>{
 const p={militer:1},learned=new Set();
 const args={playerTokens:[T('militer'),E('❓')],previousNpcTokens:[],previousPlayerMessages:[],
  npcTokens:[T('militer')],playerLevels:p,npcLevels:{militer:5},learned};
 assert.deepEqual(resolveTestLearning(args),['militer']);
 assert.deepEqual(resolveTestLearning(args),[]);
 assert.equal(p.militer,2);
});
test('permanent Affect cap ±1; first impression ±3; knowledge independent',()=>{
 const a={v:5,d:5,p:8},b={v:10,d:0,p:1};
 assert.deepEqual(commitTestInteraction(a,b,{knowledgeGains:['militer']}),{
  vDelta:1,dDelta:-1,knowledgeGains:['militer']});
 assert.deepEqual(commitTestInteraction(a,b,{firstImpression:true,knowledgeGains:['militer']}),{
  vDelta:3,dDelta:-3,knowledgeGains:['militer']});
});
test('soft cap versus optional negative overuse',()=>{
 const baseline=simulateInteraction(POLICIES.stack,{turns:1,initial});
 const cfg={...DEFAULT_IMPACT_CONFIG,stacking:{...DEFAULT_IMPACT_CONFIG.stacking,
   overuseCost:0.25,overusePatience:0.25}};
 const penalty=simulateInteraction(POLICIES.stack,{turns:1,initial,impactConfig:cfg});
 assert.ok(baseline.state.v>initial.v);
 assert.ok(penalty.state.v<initial.v);
 assert.ok(penalty.state.p<baseline.state.p);
});
test('topic hopping avoids more repeat than a static topic strategy',()=>{
 const hopping=simulateInteraction(POLICIES.topicHopping,{turns:10,initial});
 const staticTopic=simulateInteraction(POLICIES.repeatedTopic,{turns:10,initial});
 assert.ok(hopping.log.filter(t=>t.repeat).length<staticTopic.log.filter(t=>t.repeat).length);
 assert.ok(hopping.state.p>staticTopic.state.p);
});
test('same fixed strategy has different consequences across NPC conditions',()=>{
 const normal=simulateInteraction(POLICIES.stack,{turns:2,initial});
 const hostile=simulateInteraction(POLICIES.stack,{turns:2,initial:{v:2,d:8,p:6},world:variants.hostile});
 assert.notDeepEqual(normal.state,hostile.state);
});
test('deterministic replay',()=>{
 assert.deepEqual(simulateInteraction(POLICIES.adaptive,{turns:8,initial}),
   simulateInteraction(POLICIES.adaptive,{turns:8,initial}));
});
test('known but withheld information is refused, not mislabeled ignorance',()=>{
 const world={...SAMPLE_WORLD,blocked:['malam']};
 const r=simulateInteraction(()=>[T('pasar'),E('⏳')],{world,turns:1});
 assert.equal(r.log[0].action,'withdraw');
 assert.equal(r.log[0].output,'🤫');
});

test('NPC asking a question does not teach the mentioned Topic',()=>{
 const p={militer:1};
 const gains=resolveTestLearning({playerTokens:[T('militer'),E('❓')],previousNpcTokens:[],previousPlayerMessages:[],
   npcTokens:[T('militer'),E('❓')],npcAction:'ask',playerLevels:p,npcLevels:{militer:5},learned:new Set()});
 assert.deepEqual(gains,[]);
});
test('Listen after previous NPC question does not teach Knowledge',()=>{
 const p={militer:1};
 const gains=resolveTestLearning({playerTokens:[],previousNpcTokens:[T('militer'),E('❓')],previousNpcAction:'ask',
   previousPlayerMessages:[],npcTokens:[E('😐')],npcAction:'express',playerLevels:p,npcLevels:{militer:5},learned:new Set()});
 assert.deepEqual(gains,[]);
});
