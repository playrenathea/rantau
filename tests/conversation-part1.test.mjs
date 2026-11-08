import test from 'node:test';
import assert from 'node:assert/strict';
import {parseMessage} from '../js/game/conversation/parser.js';
import {repeatKey,evaluateRepetition} from '../js/game/conversation/repetition.js';
import {extractFeatures} from '../js/game/conversation/features.js';

const T=id=>({kind:'info',id}), E=value=>({kind:'emoji',value});
const P=tokens=>({from:'player',tokens}), N=tokens=>({from:'npc',tokens});
const rel={'militer|pasar':'militer__pasar','pasar|saudagar':'pasar__saudagar','malam|pasar':'pasar__malam'};
const relationId=(a,b)=>rel[[a,b].sort().join('|')]||null;
const features=(playerTokens,previousNpcTokens=null,playerHistory=[])=>extractFeatures({playerTokens,previousNpcTokens,playerHistory,relationId});

const equalPairs=[
 ['topic order irrelevant',[T('militer'),T('pasar')],[T('pasar'),T('militer')],true],
 ['topic vs topic+emoji',[T('militer')],[T('militer'),E('🙂')],false],
 ['topic+emoji values and order irrelevant',[T('militer'),E('🙂'),T('pasar')],[E('😡'),T('pasar'),T('militer'),E('❓')],true],
 ['distinct topic sets',[T('militer'),E('🙂')],[T('pasar'),E('🙂')],false],
 ['duplicate topic ignored for repeat key',[T('militer'),T('militer')],[T('militer')],true],
 ['emoji-only universal',[E('🙂')],[E('😡'),E('🙏')],true],
 ['emoji-only not listen',[E('🙂')],[],false],
 ['listen identical',[],[],true],
 ['emoji-only vs topic+emoji',[E('🙂')],[T('militer'),E('🙂')],false],
 ['topic-only vs listen',[T('militer')],[],false]
];
for(const [name,a,b,expected] of equalPairs)test('repeat key: '+name,()=>assert.equal(repeatKey(a)===repeatKey(b),expected));

const repetitionCases=[
 ['two consecutive',[T('militer')],[P([T('militer')]),N([E('🙂')])],{consecutive:true,cumulative:false,occurrence:2}],
 ['third nonconsecutive',[T('militer')],[P([T('militer')]),P([T('pasar')]),P([T('militer')]),P([T('pasar')])],{consecutive:false,cumulative:true,occurrence:3}],
 ['second nonconsecutive',[E('🙂')],[P([E('😡')]),P([T('pasar')])],{consecutive:false,cumulative:false,occurrence:2}],
 ['NPC messages excluded',[],[N([]),N([])],{consecutive:false,cumulative:false,occurrence:1}],
 ['repeated listen',[],[P([])],{consecutive:true,cumulative:false,occurrence:2}],
 ['third listen',[],[P([]),P([])],{consecutive:true,cumulative:true,occurrence:3}],
 ['emoji-only despite changed emoji',[E('❤️')],[P([E('😡')])],{consecutive:true,cumulative:false,occurrence:2}],
 ['topic vs topic+emoji',[T('pasar'),E('🙂')],[P([T('pasar')])],{consecutive:false,cumulative:false,occurrence:1}],
 ['overlapping triggers count once',[T('pasar')],[P([T('pasar')]),P([T('pasar')])],{consecutive:true,cumulative:true,occurrence:3}]
];
for(const [name,current,history,expected] of repetitionCases)test('repetition: '+name,()=>{const r=evaluateRepetition(current,history);for(const [k,v] of Object.entries(expected))assert.equal(r[k],v);assert.equal(r.negativeRepetition,r.consecutive||r.cumulative);});

test('parser groups consecutive emoji with exact targets',()=>{
 const p=parseMessage([E('😡'),E('🤨'),T('militer'),E('❓'),E('📍'),T('pasar'),E('🙏')]);
 assert.equal(p.sequence.length,5);
 assert.deepEqual(p.emojiGroups.map(g=>[g.leftTopicId,g.rightTopicId,g.atStart,g.atEnd]),[[null,'militer',true,false],['militer','pasar',false,false],['pasar',null,false,true]]);
});
test('parser empty is listen',()=>assert.equal(parseMessage([]).kind,'LISTEN'));
test('parser emoji only one group',()=>assert.equal(parseMessage([E('🙂'),E('🙏')]).emojiGroups.length,1));
test('parser topic-only',()=>assert.equal(parseMessage([T('militer')]).kind,'TOPIC_ONLY'));
test('parser topic+emoji',()=>assert.equal(parseMessage([T('militer'),E('🙂')]).kind,'TOPIC_EMOJI'));
test('parser rejects invalid token',()=>assert.throws(()=>parseMessage([{kind:'broken'}]),TypeError));
test('parser rejects nonarray',()=>assert.throws(()=>parseMessage('militer'),TypeError));

const featureCases=[
 ['adjacent relation',[T('militer'),T('pasar')],null,{militer:1,pasar:1,militer__pasar:1}],
 ['emoji separator',[T('militer'),E('👎'),T('pasar')],null,{militer:1,pasar:1}],
 ['emoji group separator',[T('militer'),E('👎'),E('😡'),T('pasar')],null,{militer:1,pasar:1}],
 ['nonadjacent third topic',[T('militer'),T('pasar'),E('🙂'),T('saudagar')],null,{militer:1,pasar:1,saudagar:1,militer__pasar:1}],
 ['symmetric relation',[T('saudagar'),T('pasar')],null,{saudagar:1,pasar:1,pasar__saudagar:1}],
 ['unknown relation not created',[T('militer'),T('saudagar')],null,{militer:1,saudagar:1}],
 ['NPC to player boundary',[T('pasar')],[E('😡'),T('militer')],{pasar:1,militer__pasar:1}],
 ['NPC trailing emoji blocks boundary',[T('pasar')],[T('militer'),E('👎')],{pasar:1}],
 ['player leading emoji blocks boundary',[E('🙂'),T('pasar')],[T('militer')],{pasar:1}],
 ['same-topic boundary counts twice',[T('pasar')],[T('militer'),T('pasar')],{pasar:2}],
 ['NPC emoji blocks same-topic continuation',[T('pasar')],[T('pasar'),E('🙂')],{pasar:1}],
 ['player emoji blocks same-topic continuation',[E('🙂'),T('pasar')],[T('pasar')],{pasar:1}],
 ['NPC emoji-only previous',[T('pasar')],[E('🙂')],{pasar:1}],
 ['NPC empty previous',[T('pasar')],[],{pasar:1}],
 ['listen no count',[],[T('militer')],{}],
 ['emoji-only no count',[E('🙂')],[T('militer')],{}],
 ['duplicate topic counted twice',[T('pasar'),T('pasar')],null,{pasar:2}],
 ['no previous NPC',[T('pasar')],null,{pasar:1}]
];
for(const [name,player,prev,expected] of featureCases)test('features: '+name,()=>assert.deepEqual(features(player,prev).counts,expected));

test('proportions add to one and boundary counted once extra',()=>{
 const f=features([T('militer'),T('pasar')],[T('militer')]);
 assert.deepEqual(f.counts,{militer:2,pasar:1,militer__pasar:1});
 assert.equal(f.total,4);
 assert.ok(Math.abs(Object.values(f.proportions).reduce((a,b)=>a+b,0)-1)<1e-12);
});
test('zero page count produces no NaN',()=>{
 const f=features([],[T('militer')]);assert.equal(f.total,0);assert.deepEqual(f.proportions,{});
});
test('simulation: nine player turns with NPC turns between',()=>{
 const turns=[[T('militer')],[T('militer'),E('🙂')],[T('militer'),E('😡')],[E('🙂')],[E('😡')],[],[],[T('pasar')],[T('militer'),E('🙏')]];
 const expected=[false,false,true,false,true,false,true,false,true];
 const history=[];
 turns.forEach((tokens,i)=>{assert.equal(evaluateRepetition(tokens,history).negativeRepetition,expected[i]);history.push(P(tokens),N([E('😐')]));});
});
test('simulation: three strict-boundary NPC/player exchanges',()=>{
 const turns=[
  {npc:[T('militer')],player:[T('militer'),T('pasar')],counts:{militer:2,pasar:1,militer__pasar:1}},
  {npc:[T('militer'),E('👎')],player:[T('militer'),E('🤨'),T('pasar')],counts:{militer:1,pasar:1}},
  {npc:[T('pasar')],player:[E('🙂'),T('pasar')],counts:{pasar:1}}
 ];
 const history=[];
 for(const turn of turns){assert.deepEqual(features(turn.player,turn.npc,history).counts,turn.counts);history.push(N(turn.npc),P(turn.player));}
});
