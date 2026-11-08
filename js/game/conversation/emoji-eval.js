import {EMOJI_PROFILES} from './emoji-profiles.js';
import {compareAttitudes,combineDirections,normalizeAttitude,compareEmojiVectors} from './alignment.js';

export const conditionMet=(condition,state,thresholds={low:4,high:6})=>
 condition==='dLow' ? state.d < thresholds.low :
 condition==='dHigh' ? state.d > thresholds.high :
 condition==='vHigh' ? state.v > thresholds.high : false;

/** Builds effects independently for every valid target, not one exclusive interpretation. */
export function evaluateEmojiGroups(parsed,{npcState={v:5,d:5},topicAttitudes={},previousNpc=null,thresholds}={}) {
 const effects=[],asks=[],modifiers=[],alignments=[],mimicry=[],specialSignals=[],learningTriggers=[];
 for(const [index,group] of parsed.emojiGroups.entries()) {
  const groupId='g'+index;
  const topics=[...new Set([group.leftTopicId,group.rightTopicId].filter(Boolean))];
  const sourceValues=group.emojis;
  const profilePairs=sourceValues.map(value=>({value,profile:EMOJI_PROFILES[value]}));
  if(profilePairs.some(pair=>!pair.profile)) throw new Error('Unknown emoji profile');
  for(const {value,profile} of profilePairs) {
   if(profile.modifier) modifiers.push({groupId,value,kind:profile.modifier});
   if(profile.modifier==='learningLikeListen') for(const topicId of topics) learningTriggers.push({groupId,topicId,kind:'learningLikeListen'});
   if(profile.ask) for(const topicId of topics) {
    if(profile.ask.kind==='conditional' && !conditionMet(profile.ask.when,npcState,thresholds)) continue;
    asks.push({groupId,value,topicId,...profile.ask});
    if(profile.ask.conditionCost) effects.push({groupId,value,targetType:'npc',targetId:'npc',source:'ask-cost',effect:profile.ask.conditionCost});
   }
   if(profile.topic) for(const topicId of topics) {
    effects.push({groupId,value,targetType:'topic',targetId:topicId,source:'attitude',effect:profile.topic});
    const attitude=topicAttitudes[topicId];
    if(attitude && (!profile.topicAlignmentCondition || conditionMet(profile.topicAlignmentCondition,npcState,thresholds))) {
     const comparison=compareAttitudes(profile.topic,normalizeAttitude(attitude));
     if(comparison) alignments.push({groupId,value,topicId,...comparison});
    }
   }
   if(profile.topicAlignmentCondition && conditionMet(profile.topicAlignmentCondition,npcState,thresholds) && !profile.topic)
    for(const topicId of topics) specialSignals.push({groupId,value,topicId,kind:'conditionalAlignment'});
   if(profile.topicDisalignmentWithInterest)
    for(const topicId of topics) specialSignals.push({groupId,value,topicId,kind:'disalignmentIfInterested'});
   if(profile.npc && group.targetsNpc)
    effects.push({groupId,value,targetType:'npc',targetId:'npc',source:'direct',effect:profile.npc});
   if(group.targetsNpc) for(const item of profile.npcConditional||[])
    if(conditionMet(item.when,npcState,thresholds))
     effects.push({groupId,value,targetType:'npc',targetId:'npc',source:'conditional',condition:item.when,effect:item.effect});
  }
  if(group.referencesPreviousNpc && previousNpc?.emojis?.length) {
   const playerDirs=sourceValues.map(value=>EMOJI_PROFILES[value]?.topic).filter(Boolean);
   const previousDirs=previousNpc.emojis.map(value=>EMOJI_PROFILES[value]?.topic).filter(Boolean);
   // Only topic-directed mimicry has a complete signed V/D rule in the spec.
   const cmp=compareEmojiVectors(combineDirections(playerDirs),combineDirections(previousDirs),
     sourceValues.length===previousNpc.emojis.length && sourceValues.every((v,i)=>v===previousNpc.emojis[i]));
   if(cmp && previousNpc.targetType==='topic') mimicry.push({groupId,targetType:'topic',...cmp});
   if(cmp && previousNpc.targetType==='npc') mimicry.push({groupId,targetType:'npc',...cmp,contextDependent:true});
  }
 }
 return {effects,asks,modifiers,alignments,mimicry,specialSignals,learningTriggers};
}

/** Changes how much high/low Openness matters; it does not mutate NPC openness. */
export function effectiveOpenness(openness,modifiers=[]) {
 return modifiers.some(m=>m.kind==='invertOpennessRelevance') ? 10-openness : openness;
}
