import {evaluatePage} from './knowledge-eval.js';
import {evaluateEmojiGroups} from './emoji-eval.js';

/** Numeric values here are *testable baselines*, not agreed balance parameters. */
export const DEFAULT_IMPACT_CONFIG=Object.freeze({
 repeat:{v:-0.25,d:0.25,p:-0.55,acceleration:0.5},
 knowledge:{confused:{v:-0.08,d:0.08},disagree:{v:-0.2},exciting:{d:-0.15},boring:{d:0.15},interestDiscussion:{v:0.15}},
 alignment:{v:0.20,conditionalV:0.12,interestDisalignmentV:-0.15},
 mimicry:{topicExactV:0.10,topicSenadaV:0.16,topicPartialV:0.05,npcPositiveV:0.1,npcNegativeV:-0.12,npcLowDV:0.12,npcLowDD:0.15},
 emoji:{directScale:0.25,npcTargetWithTopicFactor:0.35,askCostScale:0.15,boost:1.35,mitigation:0.5},
 stacking:{cap:0.65,overuseThreshold:3,overuseCost:0,overusePatience:0},
 patience:{baseCost:0.12},thresholds:{low:4,high:6}
});

export const saturate=(x,cap)=>cap>0?Math.sign(x)*cap*Math.tanh(Math.abs(x)/cap):x;
const add=(store,axis,value,record)=>{if(value){store.push({axis,value,...record});}};
const sign=(v)=>v>0?1:v<0?-1:0;

/** Pure impact evaluator: returns state delta, signals, and trace, but does not mutate state. */
export function calculateImpact({features,playerKnowledge={},npcKnowledge={},npcInterests={},topicAttitudes={},contra={},npcState={v:5,d:5,p:8},previousNpc=null,config=DEFAULT_IMPACT_CONFIG}) {
 const evidence=[],reactionSignals=[],learningOpportunities=[];
 const emoji=evaluateEmojiGroups(features.parsed,{npcState,topicAttitudes,previousNpc,thresholds:config.thresholds});
 const rep=features.repetition;
 if(rep.negativeRepetition){
  const escalation=1+config.repeat.acceleration*Math.max(0,rep.streak-2,rep.occurrence-3);
  for(const axis of ['v','d','p']) add(evidence,axis,config.repeat[axis]*escalation,{family:'repeat',reason:rep.key});
  reactionSignals.push({kind:'boring',reason:'repetition',weight:escalation});
 }
 for(const [pageId,count] of Object.entries(features.counts)){
  const aligned=emoji.alignments.filter(e=>e.topicId===pageId);
  const alignment=aligned.length?{similarity:aligned.reduce((s,e)=>s+e.similarity,0)/aligned.length}:null;
  const page=evaluatePage({pageId,count,playerLevel:playerKnowledge[pageId]||0,npcLevel:npcKnowledge[pageId]||0,
    contra:Boolean(contra[pageId]),interest:npcInterests[pageId]||null,alignment});
  for(const signal of page.signals){
   reactionSignals.push({...signal,pageId});
   const effect=signal.kind==='interest-discussion'?config.knowledge.interestDiscussion:config.knowledge[signal.kind];
   if(effect) for(const axis of ['v','d','p']) add(evidence,axis,(effect[axis]||0)*signal.weight,{family:'topic',pageId,reason:signal.kind});
  }
  if(page.npcLearningOpportunity) learningOpportunities.push({pageId,reason:'interest-question',count});
  if(alignment) {
   const match=2*alignment.similarity-1; // disagreement is negative, alignment is positive
   add(evidence,'v',config.alignment.v*match*count,{family:'topic',pageId,reason:'alignment'});
  }
 }
 for(const signal of emoji.specialSignals){
  if(signal.kind==='conditionalAlignment')
   add(evidence,'v',config.alignment.conditionalV,{family:'topic',pageId:signal.topicId,reason:signal.kind});
  if(signal.kind==='disalignmentIfInterested' && ['❓','❗'].includes(npcInterests[signal.topicId]))
   add(evidence,'v',config.alignment.interestDisalignmentV,{family:'topic',pageId:signal.topicId,reason:signal.kind});
 }
 for(const item of emoji.effects){
  if(item.targetType!=='npc') continue; // topic attitudes are interpreted through alignment, not direct NPC state deltas
  const scale=item.source==='ask-cost' ? config.emoji.askCostScale :
    config.emoji.directScale*(features.parsed.topics.length ? config.emoji.npcTargetWithTopicFactor : 1);
  for(const axis of ['v','d']) add(evidence,axis,(item.effect[axis]||0)*scale,{family:'emoji',groupId:item.groupId,reason:item.source,emoji:item.value});
 }
 for(const match of emoji.mimicry){
  const m=config.mimicry;
  if(match.targetType==='topic') {
   const value=match.identical?m.topicExactV:match.senadaDifferent?m.topicSenadaV:m.topicPartialV*(2*match.similarity-1);
   add(evidence,'v',value,{family:'emoji',groupId:match.groupId,reason:'topic-mimicry'});
  } else if(match.targetType==='npc') {
   const base=(npcState.v>5?m.npcPositiveV:npcState.v<5?m.npcNegativeV:0)*match.similarity;
   add(evidence,'v',base,{family:'emoji',groupId:match.groupId,reason:'npc-mimicry'});
   if(npcState.d<5){
    add(evidence,'v',m.npcLowDV*match.similarity,{family:'emoji',groupId:match.groupId,reason:'npc-low-d-mimicry'});
    add(evidence,'d',m.npcLowDD*match.similarity,{family:'emoji',groupId:match.groupId,reason:'npc-low-d-mimicry'});
   }
  }
 }
 // Modifiers are scoped to their own emoji group: no global boosting of unrelated events.
 const modified=evidence.map(item=>{
  let value=item.value;
  if(item.family==='emoji' && item.groupId){
   const local=emoji.modifiers.filter(m=>m.groupId===item.groupId).map(m=>m.kind);
   if(local.includes('boost')) value*=config.emoji.boost;
  }
  if(item.reason==='disagree' && emoji.modifiers.some(m=>m.kind==='mitigateDisagreement')) value*=config.emoji.mitigation;
  return {...item,value};
 });
 add(modified,'p',-config.patience.baseCost,{family:'base',reason:'turn'});
 const grouped=new Map();
 for(const effect of modified){
  const key=effect.family==='emoji'?`emoji:${effect.groupId}:${effect.axis}`:`${effect.family}:${effect.axis}`;
  if(!grouped.has(key)) grouped.set(key,[]);
  grouped.get(key).push(effect);
 }
 const resolved=[], total={v:0,d:0,p:0};
 for(const [key,items] of grouped){
  if(key.startsWith('emoji:')){
   // Saturate positive and negative magnitudes separately, avoiding cancellation hiding overuse.
   for(const polarity of [1,-1]){
    const magnitude=items.reduce((s,e)=>s+(sign(e.value)===polarity?Math.abs(e.value):0),0);
    if(magnitude){const value=polarity*saturate(magnitude,config.stacking.cap);total[items[0].axis]+=value;resolved.push({key,polarity,value});}
   }
  } else {
   const value=items.reduce((s,e)=>s+e.value,0);
   total[items[0].axis]+=value;resolved.push({key,value});
  }
 }
 // Repeated same-direction emoji in a single group can incur explicit negative cost.
 // The optional penalty is intentionally separate from ordinary diminishing returns.
 for(const [groupIndex] of features.parsed.emojiGroups.entries()){
  const groupId='g'+groupIndex;
  const candidates=emoji.effects.filter(e=>e.groupId===groupId && ['direct','attitude'].includes(e.source));
  const buckets=new Map();
  // Same axis/direction on the same target is the general definition of redundant stacking.
  for(const effect of candidates) for(const axis of ['v','d']) {
   const polarity=sign(effect.effect[axis]||0);
   if(!polarity) continue;
   const key=effect.targetType+':'+effect.targetId+':'+axis+':'+polarity;
   if(!buckets.has(key)) buckets.set(key,new Set());
   buckets.get(key).add(effect.value);
  }
  const excessive=Math.max(0,...[...buckets.values()].map(values=>values.size-config.stacking.overuseThreshold));
  if(excessive>0){total.v-=config.stacking.overuseCost*excessive**2;total.p-=config.stacking.overusePatience*excessive**2;}
 }
 const next={...npcState};
 for(const axis of ['v','d','p'])next[axis]=Math.max(0,Math.min(10,npcState[axis]+total[axis]));
 return {delta:total,nextState:next,evidence:modified,resolved,reactionSignals,emoji,learningOpportunities,learningTriggers:emoji.learningTriggers};
}
