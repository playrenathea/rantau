import test from 'node:test';
import assert from 'node:assert/strict';
import {parseMessage} from '../js/game/conversation/parser.js';
import {extractFeatures} from '../js/game/conversation/features.js';
import {EMOJI_PROFILES,EMOJI_VALUES} from '../js/game/conversation/emoji-profiles.js';
import {compareAttitudes,compareEmojiVectors,normalizeAttitude} from '../js/game/conversation/alignment.js';
import {evaluatePage} from '../js/game/conversation/knowledge-eval.js';
import {evaluateEmojiGroups,effectiveOpenness} from '../js/game/conversation/emoji-eval.js';
import {calculateImpact,DEFAULT_IMPACT_CONFIG,saturate} from '../js/game/conversation/impact.js';
const T=id=>({kind:'info',id}),E=value=>({kind:'emoji',value});
const f=(tokens,history=[])=>extractFeatures({playerTokens:tokens,playerHistory:history,relationId:()=>null});
const run=(tokens,o={})=>calculateImpact({features:f(tokens,o.history||[]),...o});
const has=(arr,kind)=>arr.some(x=>x.kind===kind);
const directions=[
['😡',[-1,1],[-1,null]],['🤨',[null,1],null],['😎',[1,1],null],['🙁',[-1,null],[-1,null]],['😐',null,[-1,null]],
['🙂',[1,null],[1,null]],['😟',[-1,-1],[-1,1]],['😔',[null,-1],null],['🥺',[1,-1],[1,1]],['❤️',[1,-1],[1,1]],
['👍',[1,null],[1,null]],['👎',[-1,1],[-1,null]],['🙏',[1,-1],[1,1]],['🫵',null,[-1,null]],['🤣',null,null],
['❓',null,null],['❗',null,null],['💤',null,[-1,null]],['🤫',null,null],['🤔',null,null],['💡',null,null],
['📍',null,null],['⏳',null,null],['👥',null,null]];
for(const [emoji,topic,npc] of directions) test('emoji profile '+emoji,()=>{
 const p=EMOJI_PROFILES[emoji];assert.ok(p);
 assert.deepEqual(p.topic?[p.topic.v,p.topic.d]:null,topic);
 assert.deepEqual(p.npc?[p.npc.v,p.npc.d]:null,npc);
});
test('24 profiles',()=>assert.equal(EMOJI_VALUES.length,24));
test('conditional metadata and operators',()=>{
 assert.equal(EMOJI_PROFILES['🙏'].ask.when,'vHigh');
 assert.equal(EMOJI_PROFILES['🫵'].ask.when,'dHigh');
 assert.equal(EMOJI_PROFILES['📍'].ask.type,'Location');
 assert.equal(EMOJI_PROFILES['⏳'].ask.type,'Time');
 assert.equal(EMOJI_PROFILES['👥'].ask.type,'IndividualOrGroup');
});
test('unspecified V/D dimensions are masked',()=>{
 assert.deepEqual(compareAttitudes({v:1,d:null},{v:1,d:-1}).axes,['v']);
 assert.equal(compareAttitudes({v:1,d:null},{v:null,d:1}),null);
});
test('NPC attitude normalization',()=>assert.deepEqual(normalizeAttitude({v:0,d:10}),{v:-1,d:1}));
test('same V/D but different emoji counts as senada different',()=>{
 assert.ok(compareEmojiVectors(EMOJI_PROFILES['😡'].topic,EMOJI_PROFILES['👎'].topic,false).senadaDifferent);
});
test('middle emoji addresses both Topics but not NPC',()=>{
 const r=evaluateEmojiGroups(parseMessage([T('militer'),E('👎'),T('pasar')]));
 assert.deepEqual(r.effects.map(e=>e.targetId),['militer','pasar']);
});
test('emoji-only addresses NPC exactly once',()=>{
 const r=evaluateEmojiGroups(parseMessage([E('🥺')]));
 assert.equal(r.effects.filter(e=>e.targetId==='npc').length,1);
});
test('ASK request condition on V and D',()=>{
 const p=parseMessage([T('militer'),E('🙏'),E('🫵')]);
 const high=evaluateEmojiGroups(p,{npcState:{v:8,d:8}});
 const low=evaluateEmojiGroups(p,{npcState:{v:3,d:3}});
 assert.equal(high.asks.length,2);assert.equal(low.asks.length,0);
});
test('NPC unaware prompts confused but not ordinary gap excitement',()=>{
 const r=evaluatePage({pageId:'militer',playerLevel:4,npcLevel:0});
 assert.ok(has(r.signals,'confused'));assert.ok(!r.signals.some(s=>s.reason==='knowledge-gap'));
});
test('knowledge gap and contra are independent',()=>{
 const r=evaluatePage({pageId:'militer',playerLevel:4,npcLevel:2,contra:true});
 assert.ok(has(r.signals,'exciting'));assert.ok(has(r.signals,'disagree'));
});
test('NPC question interest boosts excitement, supports opportunity',()=>{
 const r=evaluatePage({pageId:'militer',playerLevel:4,npcLevel:2,interest:'❓'});
 assert.equal(r.signals.filter(s=>s.kind==='exciting').length,2);assert.equal(r.npcLearningOpportunity,true);
});
test('NPC discussion interest requires alignment',()=>{
 assert.equal(has(evaluatePage({pageId:'x',interest:'❗',alignment:{similarity:0.1}}).signals,'interest-discussion'),false);
 assert.equal(has(evaluatePage({pageId:'x',interest:'❗',alignment:{similarity:0.9}}).signals,'interest-discussion'),true);
});
test('😎 conditional topic alignment only at low D',()=>{
 const tokens=[T('militer'),E('😎')],topicAttitudes={militer:{v:10,d:10}};
 assert.equal(run(tokens,{npcState:{v:5,d:3,p:8},topicAttitudes}).emoji.alignments.length,1);
 assert.equal(run(tokens,{npcState:{v:5,d:8,p:8},topicAttitudes}).emoji.alignments.length,0);
});
test('🤣 aligns conditionally with high V',()=>{
 assert.ok(run([T('militer'),E('🤣')],{npcState:{v:8,d:5,p:8}}).delta.v>run([T('militer'),E('🤣')],{npcState:{v:2,d:5,p:8}}).delta.v);
});
test('💤 has penalty if NPC interested in topic',()=>{
 assert.ok(run([T('militer'),E('💤')],{npcInterests:{militer:'❓'}}).delta.v<run([T('militer'),E('💤')]).delta.v);
});
test('🤫 reverses relevance of openness',()=>{
 const modifiers=evaluateEmojiGroups(parseMessage([E('🤫')])).modifiers;
 assert.equal(effectiveOpenness(8,modifiers),2);
});
test('💡 creates a learning trigger, not instant knowledge',()=>{
 const r=run([T('militer'),E('💡')]);
 assert.deepEqual(r.learningTriggers.map(x=>x.topicId),['militer']);
 assert.equal(r.learningOpportunities.length,0);
});
test('soft cap is increasing and bounded',()=>{
 assert.ok(saturate(2,0.65)>saturate(1,0.65));
 assert.ok(saturate(2,0.65)<0.65);
});
test('stacking is sublinear',()=>{
 const single=run([E('❤️')]),stack=run([E('❤️'),E('🥺'),E('🙏'),E('🙂'),E('👍')]);
 assert.ok(stack.delta.v>single.delta.v&&stack.delta.v<5*single.delta.v);
});
test('optional overuse reverses excessive stacking',()=>{
 const config=structuredClone(DEFAULT_IMPACT_CONFIG);
 config.stacking.overuseCost=2;config.stacking.overusePatience=1;
 const r=run([E('❤️'),E('🥺'),E('🙏'),E('🙂'),E('👍')],{config});
 assert.ok(r.delta.v<0&&r.delta.p<0);
});
test('overuse also detects negative aligned emoji',()=>{
 const config=structuredClone(DEFAULT_IMPACT_CONFIG);
 config.stacking.overuseThreshold=1;config.stacking.overuseCost=2;
 const tokens=[T('militer'),E('👎'),E('😡')],opts={npcKnowledge:{militer:2},playerKnowledge:{militer:2}};
 assert.ok(run(tokens,{...opts,config}).delta.v<run(tokens,opts).delta.v);
});
test('topic alignment outweighs incidental interpersonal boundary',()=>{
 const options={npcKnowledge:{militer:2},playerKnowledge:{militer:2},topicAttitudes:{militer:{v:1,d:9}}};
 assert.ok(run([T('militer'),E('👎')],options).delta.v>0);
 assert.ok(run([T('militer'),E('❤️')],options).delta.v<0);
});
test('repeat emoji-only triggers Boring and worsening Patience',()=>{
 const history=[{from:'player',tokens:[E('😡')]}];
 const r=run([E('🙂')],{history});
 assert.ok(has(r.reactionSignals,'boring')&&r.delta.p<0&&r.delta.d>0);
});
test('Listen repeat triggers Boring',()=>{
 const r=run([],{history:[{from:'player',tokens:[]}]});
 assert.ok(has(r.reactionSignals,'boring'));
});
test('Mimicry different but aligned greater than exact',()=>{
 const npcState={v:5,d:5,p:8};
 const a=run([E('👎'),T('militer')],{previousNpc:{emojis:['👎'],targetType:'topic'},npcState});
 const b=run([E('😡'),T('militer')],{previousNpc:{emojis:['👎'],targetType:'topic'},npcState});
 assert.ok(b.delta.v>a.delta.v);
});
test('NPC mimicry with D low can add V and D',()=>{
 const r=run([E('🥺')],{npcState:{v:5,d:3,p:8},previousNpc:{emojis:['🥺'],targetType:'npc'}});
 assert.ok(r.delta.v>0&&r.delta.d>0);
});
test('state is immutable and clamped',()=>{
 const npcState={v:9.99,d:9.99,p:0.01},before={...npcState};
 const r=run([E('🥺')],{npcState});
 assert.deepEqual(npcState,before);assert.ok(['v','d','p'].every(k=>r.nextState[k]>=0&&r.nextState[k]<=10));
});
test('same input is deterministic',()=>{
 const args={features:f([T('militer'),E('👎')]),npcKnowledge:{militer:2}};
 assert.deepEqual(calculateImpact(args),calculateImpact(args));
});
