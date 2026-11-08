/** Action / Reaction planning. Pure gameplay decisions; no psychological simulation. */
import {parseMessage} from './parser.js';
import {effectiveOpenness} from './emoji-eval.js';

export const RESPONSE_CONFIG={
  base:{answer:0.20,ask:0.17,inform:0.12,express:0.18,redirect:0.06,withdraw:0.03},
  questionUrgency:2.0,topicRelevance:0.45,continuity:0.40,interestAsk:1.10,interestDiscuss:0.55,
  openness:0.30,lowPatience:1.3,unawareAsk:0.70,knowledgeExciting:0.35,disagreeExpress:0.55,
  boredRedirect:0.75,defaultPlayerAttitude:0.16,reactionWeight:0.60,
  repetitionOfNpcAction:0.22,secondaryMinimum:0.80,secondaryMargin:0.22
};
const topic=(id)=>({kind:'info',id});
const emoji=(value)=>({kind:'emoji',value});
const clamp01=x=>Math.max(0,Math.min(1,x));
const pageType=(id,world)=>world.pages?.[id]?.type || world.types?.[id] || null;
const isPersonType=type=>type==='Individual'||type==='Group';
const matchesFilter=(type,filter)=>!filter || (filter==='IndividualOrGroup' ? isPersonType(type) : filter===type);
const known=(id,world)=>Number(world.npcKnowledge?.[id]||0)>0;
const isAccessible=(id,world)=>known(id,world) && !world.blocked?.includes(id);
function linksFor(topicId,world,filter=null){
  return (world.relationships||[]).filter(r=>r.a===topicId||r.b===topicId).map(r=>({
    relationId:r.id, answerId:r.a===topicId?r.b:r.a,sourceId:topicId
  })).filter(x=>isAccessible(x.relationId,world)&&isAccessible(x.answerId,world)&&matchesFilter(pageType(x.answerId,world),filter));
}
const contentKnown=(id,world)=>isAccessible(id,world) && (world.pages?.[id]||world.types?.[id]||world.npcKnowledge?.[id]);
const freshTarget=(world,exclude=[])=>[...new Set(world.npcPreferredTopics||Object.keys(world.npcKnowledge||{}))].find(id=>!exclude.includes(id)&&contentKnown(id,world));
const effectiveState=({impact,npcState})=>impact?.nextState||npcState||{v:5,d:5,p:8};

/** Every candidate has a real topic or reason. Never fabricate an answer. */
export function generateActionCandidates({features,impact,world={},npcState,history=[],config=RESPONSE_CONFIG}){
  const state=effectiveState({impact,npcState});
  const asks=[...(impact?.emoji?.asks||[])];
  // Emoji-only questions refer to the last Topic mentioned by the preceding NPC.
  // This does not alter Part 1 cross-message Relationship rules.
  if(features.parsed.kind==='EMOJI_ONLY' && features.previousNpc?.topics?.length){
    const previousTopic=features.previousNpc.topics.at(-1).id;
    const filters={'❓':null,'📍':'Location','⏳':'Time','👥':'IndividualOrGroup'};
    for(const group of features.parsed.emojiGroups)for(const value of group.emojis){
      if(!Object.hasOwn(filters,value))continue;
      asks.push({topicId:previousTopic,kind:filters[value]?'filter':'basic',type:filters[value]});
    }
  }
  const requested=[...new Map(asks.map(a=>[a.topicId+'|'+(a.type||'basic'),a])).values()];
  const pages=Object.entries(features.counts).sort((a,b)=>b[1]-a[1]).map(([id])=>id);
  const topicIds=features.parsed.topics.map(x=>x.id);
  const current=topicIds[0]||pages[0]||null;
  const pending=requested.length>0;
  const recentActions=history.filter(h=>h.from==='npc'&&h.action).slice(-3).map(x=>x.action);
  const novelty=action=>recentActions.filter(x=>x===action).length*config.repetitionOfNpcAction;
  const op=effectiveOpenness(world.openness??5,impact?.emoji?.modifiers||[])/10;
  const patience=clamp01(1-state.p/10);
  const reactions=impact?.reactionSignals||[];
  const bored=reactions.filter(r=>r.kind==='boring').reduce((s,r)=>s+r.weight,0);
  const excited=reactions.filter(r=>r.kind==='exciting').reduce((s,r)=>s+r.weight,0);
  const disagree=reactions.filter(r=>r.kind==='disagree').reduce((s,r)=>s+r.weight,0);
  const out=[];
  const add=(action,target,score,reason,extra={})=>out.push({action,target,score:score-novelty(action),reason,...extra});
  for(const req of requested){
    const target=req.topicId;
    if(!target)continue;
    const answers=req.kind==='filter'?linksFor(target,world,req.type):
      contentKnown(target,world)?[{answerId:target,sourceId:target,relationId:null}]:[];
    const chosen=answers[0];
    if(chosen){
      add('answer',target,config.base.answer+config.questionUrgency+config.topicRelevance+config.openness*op,
        'requested-information',{answer:chosen,questionType:req.kind});
    } else {
      // A failed question is still recognized, but cannot magically yield information.
      add('express',target,config.base.express+config.questionUrgency+0.18,'cannot-answer',{forcedReaction:'confused'});
      add('ask',target,config.base.ask+config.questionUrgency*0.65,'clarify-unanswerable',{questionType:'basic'});
    }
  }
  for(const id of pages){
    const interest=world.npcInterests?.[id];
    const playerLead=(world.playerKnowledge?.[id]||0)-(world.npcKnowledge?.[id]||0);
    const weight=Math.min(features.counts[id],3);
    if(interest==='❓' && playerLead>=2)add('ask',id,config.base.ask+config.interestAsk+config.topicRelevance*weight+config.knowledgeExciting*excited,'npc-question-interest',{questionType:'basic'});
    if(interest==='❗'&&contentKnown(id,world))add('express',id,config.base.express+config.interestDiscuss+config.topicRelevance*weight,'npc-discussion-interest');
    if(world.topicAttitudes?.[id])add('express',id,config.base.express+config.topicRelevance*weight+config.disagreeExpress*disagree,'topic-attitude');
    if(contentKnown(id,world) && !pending)add('inform',id,config.base.inform+config.topicRelevance*weight+config.openness*op,'relevant-information');
  }
  // Player attitude is a default candidate, particularly relevant for emoji-only input.
  add('express','player',config.base.express+config.defaultPlayerAttitude+(features.parsed.kind==='EMOJI_ONLY'?0.65:0),'player-attitude');
  const alternative=freshTarget(world,topicIds);
  if(alternative){
    add('redirect',alternative,config.base.redirect+config.boredRedirect*bored+config.lowPatience*patience*0.25-(pending?config.questionUrgency*0.8:0),'new-topic');
    if(!pending)add('inform',alternative,config.base.inform+config.openness*op+0.12,'npc-initiative');
  }
  if(state.p<=0){
    // Exhausted patience terminates interaction; it is not a normal candidate competition.
    return [{action:'withdraw',target:'player',score:100,priority:3,reason:'patience-exhausted',terminal:true}];
  }
  if(state.p<3 || op<0.3 || bored>0){
    add('withdraw',current||'player',config.base.withdraw+config.lowPatience*patience+bored*0.45+(1-op)*0.25,'low-willingness');
  }
  // No response candidates should be selected by simply requiring an NPC to know the topic.
  return out.map(c=>({...c,priority:c.priority??(c.reason==='requested-information'||c.reason==='cannot-answer'?2:c.reason==='clarify-unanswerable'?1:0)}));
}

export function generateReactionCandidates({features,impact,world={},npcState,config=RESPONSE_CONFIG}){
 const state=effectiveState({impact,npcState});
 const out=[];
 const add=(kind,target,score,reason,extra={})=>out.push({kind,target,score,reason,...extra});
 for(const signal of impact?.reactionSignals||[]){
   const kind=signal.kind==='interest-discussion'?'topic-attitude':signal.kind;
   if(['boring','confused','disagree','exciting','topic-attitude'].includes(kind))
     add(kind,signal.pageId||'player',config.reactionWeight*(signal.weight||1),signal.reason||signal.kind);
 }
 for(const [pageId,count] of Object.entries(features.counts)){
   const attitude=world.topicAttitudes?.[pageId];
   if(attitude)add('topic-attitude',pageId,0.3+0.1*Math.min(count,3),'existing-attitude',{attitude});
 }
 // Default response remains viable even if no other reaction is strong.
 add('player-attitude','player',config.defaultPlayerAttitude+(features.parsed.kind==='EMOJI_ONLY'?0.15:0),'relationship',{attitude:{v:state.v,d:state.d}});
 return out;
}

/** Deterministic ranking first, so failures have reproducible explanations. */
export function rankResponse({actions,reactions,config=RESPONSE_CONFIG}){
 if(!actions.length)throw new Error('No eligible NPC actions');
 const ordered=[...actions].sort((a,b)=>(b.priority||0)-(a.priority||0)||b.score-a.score||a.action.localeCompare(b.action)||String(a.target).localeCompare(String(b.target)));
 const action=ordered[0];
 const allowed={answer:['topic-attitude','disagree','exciting','boring','player-attitude'],ask:['exciting','confused','topic-attitude','player-attitude'],inform:['topic-attitude','exciting','player-attitude'],express:['topic-attitude','disagree','confused','exciting','boring','player-attitude'],redirect:['boring','topic-attitude','player-attitude'],withdraw:['boring','disagree','player-attitude']};
 const compatible=reactions.filter(r=>allowed[action.action]?.includes(r.kind) && (r.target===action.target || r.target==='player') &&
  !(action.action==='answer' && r.kind==='boring' && r.reason!=='repetition'));
 const contextBonus=r=>action.reason==='npc-discussion-interest' && r.kind==='topic-attitude'?0.9:
   action.reason==='npc-question-interest' && r.kind==='exciting'?0.75:
   action.reason==='requested-information' && r.kind==='topic-attitude'?0.30:
   action.reason==='player-attitude' && r.kind==='player-attitude'?0.5:0;
 const forced=action.forcedReaction?{kind:action.forcedReaction,target:action.target,score:4,reason:'action-constraint'}:null;
 const reaction=forced||[...compatible].sort((a,b)=>(b.score+contextBonus(b))-(a.score+contextBonus(a)) || a.kind.localeCompare(b.kind))[0]||null;
 // One Action + one compatible Reaction for v1: no uncomposed 'secondary' action.
 return {action,reaction,secondary:null,ranked:ordered};
}

const reactionEmojis={confused:'❓',disagree:'👎',exciting:'💡',boring:'💤'};
/** Deterministic expression mapping; preserves known V/D and target. */
export function expressAttitude(attitude){
 if(!attitude)return '😐';
 const v=attitude.v??5,d=attitude.d??5;
 if(v>=7&&d<=4)return '❤️';
 if(v<=3&&d>=7)return '😡';
 if(v<5)return '🙁';
 if(d>=7)return '😎';
 if(d<=3)return '🥺';
 if(v>5)return '🙂';
 return '😐';
}

export function composeNpcMessage(selection,{world={},impact=null}={}){
 const {action,reaction}=selection;
 const output=[];
 const id=action.target;
 const reactEmoji=reaction ? reactionEmojis[reaction.kind]||
   (reaction.kind==='topic-attitude'?expressAttitude(world.topicAttitudes?.[reaction.target]):
    reaction.kind==='player-attitude'?expressAttitude(reaction.attitude||impact?.nextState):null):null;
 const addTopic=(name)=>{if(name&&!output.some(t=>t.kind==='info'&&t.id===name))output.push(topic(name));};
 if(action.action==='answer'){
   const ans=action.answer;
   if(!ans || !contentKnown(ans.answerId,world))throw new Error('Answer lacks actual NPC knowledge');
   if(ans.relationId && !isAccessible(ans.relationId,world))throw new Error('Unknown answer relation');
   if(ans.sourceId && ans.answerId!==ans.sourceId)addTopic(ans.sourceId);
   addTopic(ans.answerId);
 }else if(action.action==='inform'||action.action==='redirect'){
   if(!contentKnown(id,world))throw new Error('NPC cannot disclose an unknown topic');
   addTopic(id);
 }else if(action.action==='ask'){
   if(id!=='player')addTopic(id);
   output.push(emoji(action.questionType==='filter'?({Location:'📍',Time:'⏳',IndividualOrGroup:'👥'}[action.filter]||'❓'):'❓'));
 }else if(action.action==='express' && id!=='player')addTopic(id);
 else if(action.action==='withdraw') {output.push(emoji(action.terminal?'💤':'🤫'));}
 if(reactEmoji && action.action!=='withdraw' && !(action.action==='ask' && reactEmoji==='❓')){
   // Topic reactions must sit immediately next to their topic; player-directed reactions use emoji only.
   if(reaction.target==='player' && output.length===0)output.push(emoji(reactEmoji));
   else if(reaction.target===id && id!=='player'){
     if(action.action==='ask')output.splice(Math.max(0,output.length-1),0,emoji(reactEmoji));
     else if(action.action==='answer' && action.answer?.sourceId && action.answer?.answerId!==action.answer.sourceId)output.unshift(emoji(reactEmoji));
     else output.push(emoji(reactEmoji));
   }
   else if(action.action==='express' && id==='player')output.push(emoji(reactEmoji));
 }
 if(!output.length)output.push(emoji(expressAttitude(impact?.nextState)));
 const parsed=parseMessage(output);
 if(action.action==='answer'||action.action==='inform'||action.action==='redirect'){
   if(!parsed.topics.length)throw new Error('Knowledge action without topic');
 }
 return {tokens:output,parsed,metadata:{action:action.action,reason:action.reason,target:id,
   reaction:reaction?.kind||null,reactionTarget:reaction?.target||null,secondary:selection.secondary?.action||null}};
}

export function planNpcResponse({features,impact,world={},npcState,history=[],config=RESPONSE_CONFIG}){
 const actions=generateActionCandidates({features,impact,world,npcState,history,config});
 const reactions=generateReactionCandidates({features,impact,world,npcState,config});
 const selection=rankResponse({actions,reactions,config});
 const composed=composeNpcMessage(selection,{world,impact});
 return {actions,reactions,selection,...composed};
}
