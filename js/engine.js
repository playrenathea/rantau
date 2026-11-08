import {byId,relationId} from "./data.js";
export const clamp=n=>Math.max(0,Math.min(10,n));
export function evaluate(tokens,lastId,playerKnowledge,npcKnowledge){
 const ids=tokens.filter(t=>t.kind==="info").map(t=>t.id);
 const topics=[];
 if(lastId&&ids.length&&lastId!==ids[0])topics.push(relationId(lastId,ids[0]));
 ids.forEach((id,i)=>{topics.push(id);if(i<ids.length-1&&id!==ids[i+1])topics.push(relationId(id,ids[i+1]));});
 const unique=[...new Set(topics.filter(Boolean))];
 const unknown=unique.filter(id=>!(npcKnowledge[id]>0)).length;
 const higher=unique.filter(id=>playerKnowledge[id]>0&&npcKnowledge[id]>0&&playerKnowledge[id]-npcKnowledge[id]>1).length;
 const lower=unique.filter(id=>npcKnowledge[id]>0&&npcKnowledge[id]-(playerKnowledge[id]||0)>1).length;
 return {topics:unique,unknown,higher,lower,total:unique.length};
}
export function npcReply(npc,record,tokens,playerKnowledge){
 const infoIds=tokens.filter(t=>t.kind==="info").map(t=>t.id);
 const lastNpcInfo=[...record.history].reverse().find(m=>m.from==="npc"&&m.tokens.some(t=>t.kind==="info"))?.tokens.filter(t=>t.kind==="info").at(-1)?.id;
 const result=evaluate(tokens,lastNpcInfo,playerKnowledge,npc.knowledge);
 const signature=[...new Set(infoIds)].sort().join("|")+"#"+(tokens.some(t=>t.kind==="emoji")?"emoji":"plain");
 const repeat=record.used.includes(signature);
 const mood=tokens.filter(t=>t.kind==="emoji").map(t=>t.value);
 let reaction="😐";
 if(repeat||result.total&&result.lower/result.total>.7)reaction="💤";
 else if(result.total&&result.unknown/result.total>.7)reaction="🤔";
 else if(result.total&&result.unknown/result.total>.3)reaction="❓";
 else if(result.total&&result.higher/result.total>.3)reaction="💡";
 else if(mood.includes("❤️")||mood.includes("👍")||mood.includes("🙂"))reaction="🙂";
 else if(mood.includes("👎")||mood.includes("😡")||mood.includes("🫵"))reaction="🤨";
 else if(mood.includes("❓")||mood.includes("🤔"))reaction="🤔";
 let vDelta=0,dDelta=0;
 if(mood.includes("🙏")){vDelta=1;dDelta=1;}
 else if(mood.includes("🫵")){vDelta=-1;dDelta=-1;}
 else if(mood.includes("❤️")||mood.includes("👍"))vDelta=.4;
 if(repeat)vDelta-=.3;
 record.v=clamp(record.v+vDelta);record.d=clamp(record.d+dDelta);
 record.p=clamp(record.p-(repeat?3:reaction==="🤨"?1.5:.5));
 record.used.push(signature);
 // MVP topic selector: prefer recent player topic when known, otherwise NPC's preferred subject.
 let topic=infoIds.find(id=>npc.knowledge[id]>0)||npc.topics.find(id=>npc.knowledge[id]>0);
 if(!topic)topic=Object.keys(npc.knowledge)[0];
 const response=[{kind:"emoji",value:reaction}];
 if(record.p>0&&topic)response.push({kind:"info",id:topic});
 if(record.p<=0)response.push({kind:"emoji",value:"💤"});
 return {response,exited:record.p<=0,debug:{...result,repeat,vDelta,dDelta,remaining:record.p}};
}

/** Prototype final impression: persistent relationship changes after a farewell. */
export function farewellEffect(record,emoji){
 const outcomes={
  "🙂":{v:0.6,d:0,reply:"🙂"},
  "😐":{v:0,d:0,reply:"😐"},
  "🙏":{v:0.7,d:0.7,reply:"🙂"},
  "👎":{v:-1,d:0.3,reply:"🤨"}
 };
 const choice=outcomes[emoji]||outcomes["😐"];
 record.v=clamp(record.v+choice.v);
 record.d=clamp(record.d+choice.d);
 return choice.reply;
}
