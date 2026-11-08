import test from 'node:test';
import assert from 'node:assert/strict';
import {extractFeatures} from '../js/game/conversation/features.js';
import {calculateImpact} from '../js/game/conversation/impact.js';
import {planNpcResponse,rankResponse,composeNpcMessage} from '../js/game/conversation/response.js';
const T=id=>({kind:'info',id}), E=value=>({kind:'emoji',value});
const world={npcKnowledge:{militer:4,pasar:3,malam:2,pasar__malam:2,saudagar:3,pasar__saudagar:2},
 pages:{militer:{type:'Faction'},pasar:{type:'Location'},malam:{type:'Time'},saudagar:{type:'Group'}},
 relationships:[{id:'pasar__malam',a:'pasar',b:'malam'},{id:'pasar__saudagar',a:'pasar',b:'saudagar'}],
 topicAttitudes:{militer:{v:2,d:8}},npcInterests:{},npcPreferredTopics:['militer','pasar','saudagar'],openness:8};
function run(tokens,{data=world,state={v:5,d:5,p:8},history=[],npcTokens=null}={}){
 const features=extractFeatures({playerTokens:tokens,previousNpcTokens:npcTokens,playerHistory:history,
  relationId:(a,b)=>data.relationships.find(r=>(r.a===a&&r.b===b)||(r.a===b&&r.b===a))?.id||null});
 const impact=calculateImpact({features,npcState:state,playerKnowledge:data.playerKnowledge||{},npcKnowledge:data.npcKnowledge,npcInterests:data.npcInterests,topicAttitudes:data.topicAttitudes});
 return planNpcResponse({features,impact,world:data,npcState:state});
}
const cases=[
 ['known question', [T('militer'),E('❓')],'answer'],
 ['unknown question', [T('missing'),E('❓')],'express'],
 ['location without relation', [T('militer'),E('📍')],'express'],
 ['when with relation', [T('pasar'),E('⏳')],'answer'],
 ['who with relation', [T('pasar'),E('👥')],'answer'],
 ['emoji-only attitude', [E('🙂')],'express'],
 ['listen initiative', [],'inform']
];
for(const [name,tokens,expected] of cases)test(name,()=>assert.equal(run(tokens).selection.action.action,expected));
test('interest ? asks knowledgeable player, not uninformed player',()=>{
 const informed={...world,npcInterests:{militer:'❓'},playerKnowledge:{militer:7}};
 const uninformed={...world,npcInterests:{militer:'❓'},playerKnowledge:{militer:1}};
 assert.equal(run([T('militer')],{data:informed}).selection.action.action,'ask');
 assert.notEqual(run([T('militer')],{data:uninformed}).selection.action.action,'ask');
});
test('interest ! favors expression of topic attitude',()=>{
 const data={...world,npcInterests:{militer:'❗'}};
 assert.equal(run([T('militer')],{data}).selection.action.action,'express');
});
test('emoji-only question refers to previous NPC Topic',()=>{
 const p=run([E('❓')],{npcTokens:[T('militer'),E('👎')]});
 assert.equal(p.selection.action.action,'answer');assert.equal(p.selection.action.target,'militer');
});
test('known relation uses exact endpoint without fabricating response',()=>{
 for(const [query,expected] of [['⏳','malam'],['👥','saudagar']]){
  const p=run([T('pasar'),E(query)]);
  assert.deepEqual(p.tokens.filter(t=>t.kind==='info').map(t=>t.id),['pasar',expected]);
 }
});
test('cannot answer unknown relation or blocked endpoint',()=>{
 const data={...world,blocked:['malam']};assert.notEqual(run([T('pasar'),E('⏳')],{data}).selection.action.action,'answer');
});
test('exhausted patience always withdraws',()=>{
 assert.equal(run([T('militer'),E('❓')],{state:{v:2,d:8,p:0}}).selection.action.action,'withdraw');
});
test('repetition yields boredom signal but does not override answering new question',()=>{
 const history=[{from:'player',tokens:[T('militer'),E('🙂')]}];
 const p=run([T('militer'),E('❓')],{history});
 assert.equal(p.selection.action.action,'answer');assert.ok(p.reactions.some(r=>r.kind==='boring'));
});
test('action priority outranks raw score',()=>{
 const r=rankResponse({actions:[{action:'redirect',target:'militer',priority:0,score:100},{action:'answer',target:'militer',priority:2,score:1}],reactions:[]});assert.equal(r.action.action,'answer');
});
test('composer disallows ungrounded fact creation',()=>{
 assert.throws(()=>composeNpcMessage({action:{action:'answer',target:'fake',answer:{answerId:'fake'}},reaction:null},{world}),/knowledge/);
});
test('one actual action, not phantom secondary',()=>{
 const p=run([T('militer'),E('❓')]);assert.equal(p.selection.secondary,null);assert.equal(p.metadata.secondary,null);
});
test('243-state matrix remains valid and grounded',()=>{
 const inputs=[[],[E('🙂')],[E('😡')],[T('militer')],[T('militer'),E('❓')],[T('pasar'),E('📍')],[T('pasar'),E('⏳')],[T('pasar'),E('👥')],[T('missing'),E('❓')]];
 let count=0;
 for(const v of [2,5,8])for(const d of [2,5,8])for(const p of [0,2,8])for(const tokens of inputs){
  const out=run(tokens,{state:{v,d,p}});count++;
  assert.ok(out.tokens.length>0);assert.ok(out.parsed.sequence.length>0);
  if(out.metadata.action==='answer')for(const t of out.tokens.filter(x=>x.kind==='info'))assert.ok(world.npcKnowledge[t.id]>0);
 }
 assert.equal(count,243);
});
