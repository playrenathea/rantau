/** Standalone gameplay test harness. No live save writes or world regeneration. */
import {extractFeatures} from '../js/game/conversation/features.js';
import {calculateImpact,DEFAULT_IMPACT_CONFIG} from '../js/game/conversation/impact.js';
import {planNpcResponse,RESPONSE_CONFIG} from '../js/game/conversation/response.js';
export const T=id=>({kind:'info',id});
export const E=value=>({kind:'emoji',value});
export const SAMPLE_WORLD={
 npcKnowledge:{militer:4,pasar:3,malam:2,pasar__malam:2,saudagar:3,pasar__saudagar:2,warung:2},
 playerKnowledge:{militer:2,pasar:2,malam:1,saudagar:2},
 pages:{militer:{type:'Faction'},pasar:{type:'Location'},malam:{type:'Time'},saudagar:{type:'Group'},warung:{type:'Location'}},
 relationships:[{id:'pasar__malam',a:'pasar',b:'malam'},{id:'pasar__saudagar',a:'pasar',b:'saudagar'}],
 npcInterests:{militer:'❗'},
 topicAttitudes:{militer:{v:2,d:8},pasar:{v:8,d:3}},
 npcPreferredTopics:['militer','pasar','saudagar','warung'],openness:7
};
export const POLICIES={
 listen:()=>[],emojiOnly:()=>[E('🙂')],
 emojiVariation:i=>[E(['🙂','❤️','🙏','🥺','👍'][i%5])],
 stack:()=>[E('🙂'),E('❤️'),E('🙏'),E('🥺'),E('👍')],
 repeatedTopic:()=>[T('militer'),E('🙂')],
 repeatedQuestion:()=>[T('pasar'),E('⏳')],
 topicHopping:i=>[T(['militer','pasar','saudagar','warung'][i%4])],
 respect:()=>[E('🙏')],challenge:()=>[E('👎')],
 align:()=>[T('militer'),E('👎')],oppose:()=>[T('militer'),E('❤️')],
 learn:()=>[T('militer'),E('❓')],
 recovery:i=>i<3?[E('👎')]:[E('🙏')],
 adaptive:i=>i===0?[T('militer'),E('❓')]:i%3===0?[T('pasar'),E('⏳')]:i%3===1?[T('militer'),E('👎')]:[E('🙂')]
};
function qualifiedLearning(id,playerLevels,npcLevels,learned){
 return (npcLevels[id]||0)-(playerLevels[id]||0)>=2&&!learned.has(id);
}
function qualifyingQuestion(tokens,id){
 return tokens.some(t=>t.kind==='emoji'&&['❓','📍','⏳','👥'].includes(t.value)) &&
   tokens.some(t=>t.kind==='info'&&t.id===id);
}
/** Test-only simplified learning gate; contradiction branches are out of scope. */
export function resolveTestLearning({playerTokens,previousNpcTokens,previousPlayerMessages,npcTokens,playerLevels,npcLevels,learned,npcAction='inform',previousNpcAction='inform'}){
 const gain=[];
 const emitted=new Set(['answer','inform'].includes(npcAction)?npcTokens.filter(t=>t.kind==='info').map(t=>t.id):[]);
 const previousNpc=new Set(['answer','inform'].includes(previousNpcAction)?(previousNpcTokens||[]).filter(t=>t.kind==='info').map(t=>t.id):[]);
 const candidates=new Set([...emitted,...(playerTokens.length===0?[...previousNpc]:[])]);
 for(const id of candidates){
  if(!qualifiedLearning(id,playerLevels,npcLevels,learned))continue;
  const asked=qualifyingQuestion(playerTokens,id);
  const repeated=playerTokens.some(t=>t.kind==='info'&&t.id===id)&&
    previousPlayerMessages.some(tokens=>tokens.some(t=>t.kind==='info'&&t.id===id));
  const listenAdjacent=playerTokens.length===0&&(emitted.has(id)||previousNpc.has(id));
  if(asked||repeated||listenAdjacent){learned.add(id);gain.push(id);playerLevels[id]=(playerLevels[id]||0)+1;}
 }
 return gain;
}
const limit=(n,l)=>Math.min(l,Math.max(-l,n));
export function commitTestInteraction(initial,final,{firstImpression=false,knowledgeGains=[]}={}){
 const affectLimit=firstImpression?3:1;
 return {vDelta:limit(final.v-initial.v,affectLimit),
   dDelta:limit(final.d-initial.d,affectLimit),knowledgeGains:[...new Set(knowledgeGains)]};
}
export function simulateInteraction(policy,{turns=10,world=SAMPLE_WORLD,initial={v:5,d:5,p:8},
 impactConfig=DEFAULT_IMPACT_CONFIG,responseConfig=RESPONSE_CONFIG,firstImpression=false}={}){
 const starting={...initial};let state={...initial},lastNpc=null,lastNpcMetadata=null;
 const history=[],log=[],learned=new Set(),playerLevels={...world.playerKnowledge};
 for(let i=0;i<turns;i++){
  const tokens=policy(i,lastNpc,state,history);
  const features=extractFeatures({playerTokens:tokens,previousNpcTokens:lastNpc,playerHistory:history,
    relationId:(a,b)=>world.relationships.find(r=>(r.a===a&&r.b===b)||(r.a===b&&r.b===a))?.id||null});
  const previousNpc=lastNpcMetadata?.reaction?{
    emojis:lastNpc.filter(t=>t.kind==='emoji').map(t=>t.value),
    targetType:lastNpcMetadata.reactionTarget==='player'?'npc':'topic'}:null;
  const impact=calculateImpact({features,npcState:state,playerKnowledge:playerLevels,
    npcKnowledge:world.npcKnowledge,npcInterests:world.npcInterests,
    topicAttitudes:world.topicAttitudes,previousNpc,config:impactConfig});
  const out=planNpcResponse({features,impact,world:{...world,playerKnowledge:playerLevels},npcState:state,history,config:responseConfig});
  const previousPlayerMessages=history.filter(x=>x.from==='player').map(x=>x.tokens);
  const gains=resolveTestLearning({playerTokens:tokens,previousNpcTokens:lastNpc,
    previousPlayerMessages,npcTokens:out.tokens,playerLevels,npcLevels:world.npcKnowledge,learned,
    npcAction:out.metadata.action,previousNpcAction:lastNpcMetadata?.action||'inform'});
  state=impact.nextState;
  log.push({turn:i+1,input:tokens.map(t=>t.id||t.value).join(' ')||'(Listen)',
    output:out.tokens.map(t=>t.id||t.value).join(' '),
    repeat:features.repetition.negativeRepetition,action:out.metadata.action,
    reaction:out.metadata.reaction,reason:out.metadata.reason,
    delta:impact.delta,v:state.v,d:state.d,p:state.p,learned:gains,
    terminal:Boolean(out.selection.action.terminal)});
  history.push({from:'player',tokens},{from:'npc',tokens:out.tokens,action:out.metadata.action,metadata:out.metadata});
  lastNpc=out.tokens;lastNpcMetadata=out.metadata;
  if(out.selection.action.terminal)break;
 }
 const actions={};
 for(const turn of log)actions[turn.action]=(actions[turn.action]||0)+1;
 return {initial:starting,state,turns:log.length,actions,log,knowledgeGains:[...learned],
   playerKnowledge:playerLevels,
   commit:commitTestInteraction(starting,state,{firstImpression,knowledgeGains:[...learned]})};
}
