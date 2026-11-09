/**
 * Experimental board-game response model. Isolated from js/engine.js and the UI.
 * Numbers are calibration hypotheses, not finalized Rantau rules.
 * Reuses the existing Player grammar and emoji effect table.
 */
import {extractFeatures} from './features.js';
import {repeatKey} from './repetition.js';
import {evaluateEmojiGroups,effectiveOpenness} from './emoji-eval.js';
import {pages,npcs,playerStart,createInteractionMemory} from '../content/playtest-npcs.js';

export const MODEL_CONFIG={
 decay:0.62,repeatCost:0.42,beatCost:0.95,engagementScale:0.65,
 socialCost:3.2,socialResponse:7.5,
 emojiScale:0.27,emojiCap:0.85,stackBackfire:0.27,alignmentScale:0.28,
 mimicryScale:0.16,gapDominance:0.06,contraValence:0.2,
 warmUp:0.78,coolDown:1.8,opennessWeight:1.0,
 knowledgeWeight:0.07,interestWeight:0.32,askWeight:1.8,
 attitudeWeight:0.45,confusionWeight:1.0
};
const clamp=x=>Math.max(0,Math.min(10,x));
const topic=id=>({kind:'info',id});
const emoji=value=>({kind:'emoji',value});
const marker=(tokens)=>tokens.length?repeatKey(tokens):'listen';
const countEmoji=tokens=>tokens.filter(t=>t.kind==='emoji').length;
const sum=(list)=>list.reduce((a,b)=>a+b,0);
const sat=(x,c)=>c*Math.tanh(x/c);
/** Exact candidate shape: topic SET and exact emoji values; order-independent. */
export function responseKey(tokens){
 const ids=[...new Set(tokens.filter(x=>x.kind==='info').map(x=>x.id))].sort();
 const es=[...new Set(tokens.filter(x=>x.kind==='emoji').map(x=>x.value))].sort();
 return ids.length?(es.length?'topic-emoji:':'topic:')+ids.join('|')+(es.length?'#'+es.join('|'):''):
  es.length?'emoji:'+es.join('|'):'listen';
}
export function recencyPressure(key,history,selector,decay){
 const matches=history.filter(h=>h.from===selector && Array.isArray(h.tokens));
 return sum(matches.map((h,i)=>selector==='player'?marker(h.tokens):responseKey(h.tokens)).map((k,i)=>
  k===key?decay**(matches.length-i-1):0));
}
function pageTokens(id){
 const p=pages[id];
 return p?.type==='Relationship'?[topic(p.a),topic(p.b)]:[topic(id)];
}
function attitudeEmoji(a){
 if(!a)return null;
 if(a.v<0&&a.d>0)return '😡';
 if(a.v>0&&a.d<0)return '❤️';
 if(a.v<0)return '🙁';
 if(a.v>0)return '🙂';
 if(a.d>0)return '😎';
 if(a.d<0)return '😔';
 return null;
}
const filterType={'📍':'Location','⏳':'Time','👥':'IndividualOrGroup'};
const matchesType=(type,filter)=>!filter||
 (filter==='IndividualOrGroup'?['Individual','Group'].includes(type):type===filter);
const interestQuestion=e=>e&&['❓','📍','⏳','👥'].includes(e.emoji);
function askedPages(parsed,emojiInfo,previousNpcTokens){
 const asks=emojiInfo.asks.map(a=>({id:a.topicId,filter:a.type||null}));
 if(parsed.kind==='EMOJI_ONLY'&&previousNpcTokens){
  const prev=[...previousNpcTokens].reverse().find(t=>t.kind==='info')?.id;
  for(const t of parsed.emojiGroups.flatMap(g=>g.emojis)){
   if(prev&&['❓','📍','⏳','👥'].includes(t))asks.push({id:prev,filter:filterType[t]||null});
  }
 }
 return asks;
}
const linked=(id,query,filter)=>{
 const def=pages[id],q=pages[query];
 if(!def||!q||!query)return false;
 if(id===query)return !filter||matchesType(def.type,filter);
 if(def.type!=='Relationship')return false;
 const other=def.a===query?def.b:def.b===query?def.a:null;
 return other!==null&&matchesType(pages[other]?.type,filter);
};
function pushCandidate(target,candidates,tokens,base,extra={}){
 const key=responseKey(tokens);
 if(!candidates.has(key)||candidates.get(key).base<base)
  candidates.set(key,{tokens,pageId:target,base,key,...extra});
}

/**
 * One beat: no behavior categories, only fixed token candidates and scoring.
 * session is mutable per-interaction state; content tables are read-only inputs.
 */
export function createSession(npcId,playerKnowledge=playerStart){
 if(!npcs[npcId])throw Error('Unknown NPC: '+npcId);
 return {npcId,state:{...npcs[npcId].initial},
   memory:createInteractionMemory(npcId,playerKnowledge),history:[]};
}
export function resolveBeat(session,playerTokens,config=MODEL_CONFIG,{reactionOnly=false}={}){
 const npc=npcs[session.npcId];
 if(!npc)throw Error('Unknown session NPC');
 const oldState={...session.state};
 const previousNpcTokens=[...session.history].reverse().find(h=>h.from==='npc')?.tokens??null;
 const playerHistory=session.history.filter(h=>h.from==='player');
 const features=extractFeatures({playerTokens,previousNpcTokens,playerHistory,
  relationId:(a,b)=>Object.entries(pages).find(([,p])=>p.type==='Relationship'&&
   ((p.a===a&&p.b===b)||(p.b===a&&p.a===b)))?.[0]??null});
 // The authored NPC table uses signed Topic Attitude (-1..1);
 // the shared Emoji evaluator expects the corresponding 0..10 scale.
 const attitudeTable=Object.fromEntries(Object.entries(session.memory)
  .filter(([,p])=>p.attitude).map(([id,p])=>[id,Object.fromEntries(
   Object.entries(p.attitude).map(([axis,value])=>[axis,5+5*value]))]));
 const previousEmojis=previousNpcTokens?.filter(t=>t.kind==='emoji').map(t=>t.value)||[];
 const prevTopic=previousNpcTokens?.filter(t=>t.kind==='info').at(-1)?.id;
 const emojiInfo=evaluateEmojiGroups(features.parsed,{npcState:oldState,
  topicAttitudes:attitudeTable,
  previousNpc:previousEmojis.length?{emojis:previousEmojis,targetType:prevTopic?'topic':'npc'}:null});
 const asks=askedPages(features.parsed,emojiInfo,previousNpcTokens);
 const pressure=recencyPressure(marker(playerTokens),session.history,'player',config.decay);
 const n=countEmoji(playerTokens);
 const penalty=Math.max(0,n-2);
 // Saturate positive and negative emoji effects independently, across the WHOLE line.
 const raw={v:[],d:[]};
 for(const e of emojiInfo.effects.filter(x=>x.targetType==='npc')){
  const boost=emojiInfo.modifiers.some(m=>m.groupId===e.groupId&&m.kind==='boost')?1.25:1;
  for(const axis of ['v','d'])if(e.effect[axis]!=null)
   raw[axis].push(e.effect[axis]*config.emojiScale*boost);
 }
 const soft=axis=>sat(sum(raw[axis].filter(x=>x>0)),config.emojiCap)+
  sat(sum(raw[axis].filter(x=>x<0)),config.emojiCap);
 // Use the existing Memory Page Count as a normalized weight (not a second bonus).
 const alignmentMass=sum(emojiInfo.alignments.map(x=>features.counts[x.topicId]??1));
 const alignment=alignmentMass?
  sum(emojiInfo.alignments.map(x=>(2*x.similarity-1)*(features.counts[x.topicId]??1)))/alignmentMass:0;
 const mimicry=emojiInfo.mimicry.length?
  sum(emojiInfo.mimicry.map(x=>2*x.similarity-1))/emojiInfo.mimicry.length:0;
 const active=Object.entries(features.counts).filter(([id])=>session.memory[id]);
 const totalCount=Math.max(1,sum(active.map(([,count])=>count)));
 let engagement=0,deltaD=0,deltaV=0;
 for(const [id,count] of active){
  const p=session.memory[id],weight=count/totalCount;
  if(p.gap>=2)deltaD-=config.gapDominance*weight;
  // Being less knowledgeable is not automatically boring: ASK, Interest and
  // positive Topic Alignment can make it a productive conversation.
  const askingThisPage=asks.some(a=>linked(id,a.id,a.filter));
  const positiveAlignment=emojiInfo.alignments.some(a=>a.topicId===id&&a.similarity>0.5);
  if(p.gap<=-2&&!askingThisPage&&!p.interest&&!positiveAlignment)
   deltaD+=config.gapDominance*weight;
  if(p.contra===true)deltaV-=config.contraValence*weight*
    (emojiInfo.modifiers.some(m=>m.kind==='mitigateDisagreement')?0.5:1);
  if(p.interest)engagement+=config.engagementScale*weight*p.interest.priority/5;
  if(asks.some(a=>linked(id,a.id,a.filter)))engagement+=0.32*weight;
 }
 engagement+=Math.max(0,alignment)*0.25+Math.max(0,mimicry)*0.12;
 deltaV+=soft('v')+alignment*config.alignmentScale+mimicry*config.mimicryScale;
 deltaD+=soft('d');
 // Repetition must affect the same valence used by state, patience and
 // expression selection, even when the repeated message is flattering.
 deltaV-=(0.17+config.repeatCost)*pressure+config.stackBackfire*penalty**2;
 deltaD+=0.11*pressure;
 // Repeat and stacking are already folded into deltaV. Do not
 // charge them again separately in the Patience calculation.
 // One final valence reaction drives BOTH Patience and response relevance.
 const negativeReaction=Math.max(0,-deltaV);
 const patienceCost=Math.max(0,config.beatCost-engagement)+
  config.socialCost*negativeReaction;
 session.state={
  v:clamp(oldState.v+deltaV),d:clamp(oldState.d+deltaD),
  p:clamp(oldState.p-patienceCost)
 };
 // Farewell applies the identical reaction formula but has no unseen NPC reply.
 // In particular it cannot create hidden Knowledge gains or NPC Cool Down entries.
 if(reactionOnly){
  session.history.push({from:'player',tokens:playerTokens.map(t=>({...t}))});
  return {tokens:[],ranked:[],state:{...session.state},
   reaction:{deltaV,deltaD,patienceCost,pressure,engagement,stacking:n},pending:{}};
 }
 const candidates=new Map();
 if(session.state.p>0){
  for(const [id,p] of Object.entries(session.memory)){
   const represented=pageTokens(id);
   const knowledge=Math.min(5,p.npcLevel)*config.knowledgeWeight;
   // Existing relationship V/D modulates Page-specific disclosure, not a new state.
   const disclosure=clamp(effectiveOpenness(p.openness,emojiInfo.modifiers)+
    0.6*(session.state.v-5)-0.45*(session.state.d-5))/10;
   const openness=disclosure*config.opennessWeight;
   const start=0.18+knowledge+openness;
   const interest=p.interest;
   // Interest belongs to its expressed Emoji candidate, not both versions
   // of exactly the same Page (otherwise Cool Down alternates fake variety).
   pushCandidate(id,candidates,represented,start,{mode:'inform'});
   const expression=attitudeEmoji(p.attitude);
   if(expression)pushCandidate(id,candidates,[...represented,emoji(expression)],
    start+config.attitudeWeight,{mode:'express'});
   if(interest){
    pushCandidate(id,candidates,[...represented,emoji(interest.emoji)],
     start+interest.priority*config.interestWeight,{mode:interestQuestion(interest)?'ask':'inform'});
   }
   // Question about a base Page can be answered by a known linked Relationship.
   // A filtered question boosts only eligible relationship answers.
   const asking=asks.filter(a=>linked(id,a.id,a.filter));
   if(asking.length)pushCandidate(id,candidates,represented,
    start+config.askWeight*(0.25+0.75*disclosure),{mode:'inform'});
   const count=features.counts[id]||0;
   if(count&&p.contra===true)pushCandidate(id,candidates,[...represented,emoji('👎')],
    start+0.65,{mode:'express'});
   // Knowledge Gap belongs to information eligibility and learning.
   // Do not invent a boredom or "I learned" expression from gap alone.
  }
  const unknown=Object.entries(features.counts).filter(([id])=>!session.memory[id]).length;
  if(unknown)pushCandidate(null,candidates,[emoji('❓')],
   config.confusionWeight+Math.min(1,unknown*0.25),{mode:'react'});
  // Interpersonal expression competes on the SAME score as Topics.
  // No mood state or special reaction action: the existing deltaV is enough.
  // Dominance only selects an existing negative expression.
  // Silence is already a legal output; social pressure can make it preferable
  // to continuing an unrelated Topic when the same negative Emoji cools down.
  pushCandidate(null,candidates,[],0.03+config.socialResponse*Math.max(0,-deltaV)*1.1,{mode:'silence'});
  if(deltaV<0)
   pushCandidate(null,candidates,[emoji(session.state.d>=5?'😡':'😟')],
    0.42+config.socialResponse*(-deltaV),{mode:'react'});
  else if(deltaV>0)
   pushCandidate(null,candidates,[emoji('🙂')],
    0.42+config.socialResponse*deltaV*0.65,{mode:'react'});
  else if(features.parsed.kind==='EMOJI_ONLY')
   pushCandidate(null,candidates,[emoji('😐')],0.42,{mode:'react'});
 }
 // If every explicit Player Topic is unknown to this NPC, do not redirect
 // into a confident unrelated Topic. Emoji-only confusion is sufficient.
 if(features.parsed.topics.length && !Object.keys(features.counts).some(id=>session.memory[id]) && session.state.p>0){
  candidates.clear();
  pushCandidate(null,candidates,[emoji('❓')],config.confusionWeight+1,{mode:'react'});
  pushCandidate(null,candidates,[],0.03,{mode:'silence'});
 }
 const ranked=[...candidates.values()].map(c=>{
  // A relationship receives a warm-up from either endpoint and from its own Count.
  const ids=c.pageId?(pages[c.pageId].type==='Relationship'?[pages[c.pageId].a,pages[c.pageId].b]:[c.pageId]):[];
  const overlaps=ids.filter(id=>features.parsed.topics.some(t=>t.id===id)).length;
  const warm=config.warmUp*(overlaps+(features.counts[c.pageId]||0)*0.5);
  const cool=config.coolDown*recencyPressure(c.key,session.history,'npc',config.decay);
  return {...c,warm,cool,score:c.base+warm-cool};
 }).sort((a,b)=>b.score-a.score||a.key.localeCompare(b.key));
 const choice=ranked[0]??{tokens:[emoji('💤')],mode:'terminal',pageId:null,score:0};
 const output=session.state.p<=0?[emoji('💤')]:choice.tokens;
 // Mark knowledge only for an actual information-bearing output, never an NPC question.
 if(session.state.p>0&&choice.pageId&&choice.mode==='inform'){
  const p=session.memory[choice.pageId];
  const repeated=playerHistory.some(h=>h.tokens.some(t=>t.kind==='info'&&t.id===choice.pageId));
  if(p.npcLevel-p.playerLevel>=2&&(asks.some(a=>linked(choice.pageId,a.id,a.filter))||
   features.parsed.kind==='LISTEN'||repeated))p.pendingPlayerGain=1;
 }
 // NPC learns from a player who knows more, only when its question interest is active
 // and the specific Page was actually discussed. This is a preliminary trigger.
 for(const [id,count] of Object.entries(features.counts)){
  const p=session.memory[id];
  if(count&&p&&p.playerLevel-p.npcLevel>=2&&interestQuestion(p.interest))
   p.pendingNpcGain=1;
 }
 session.history.push({from:'player',tokens:playerTokens.map(t=>({...t}))});
 session.history.push({from:'npc',tokens:output.map(t=>({...t}))});
 return {tokens:output,choice:{...choice,tokens:output},ranked,state:{...session.state},
  reaction:{deltaV,deltaD,patienceCost,pressure,engagement,stacking:n},
  pending:Object.fromEntries(Object.entries(session.memory).filter(([,p])=>p.pendingPlayerGain||p.pendingNpcGain)
  .map(([id,p])=>[id,{player:p.pendingPlayerGain,npc:p.pendingNpcGain}]))};
}
