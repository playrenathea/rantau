import {visibleLevel,isBranched} from "./knowledge.js";

// Eligibility is identical for blue learning and orange branch discovery.
// When already branched, a page cannot advance. Discovery/contradiction
// resolution is handled separately from numerical advancement.
export function eligibleForLearning({npcPage,playerPage,hasTrigger}){
 return Boolean(hasTrigger)&&visibleLevel(npcPage)-visibleLevel(playerPage)>=2;
}
export function canGainLevel({npcPage,playerPage,hasTrigger}){
 return !isBranched(playerPage)&&eligibleForLearning({npcPage,playerPage,hasTrigger});
}
// Listen only affects an NPC message immediately before OR immediately after
// that particular Listen action. Other learning triggers are calculated upstream.
export function adjacentToListen(messages,npcMessageIndex){
 const msg=messages[npcMessageIndex];
 if(msg?.from!=="npc")return false;
 const isListen=entry=>entry?.from==="player"&&Array.isArray(entry.tokens)&&entry.tokens.length===0;
 return isListen(messages[npcMessageIndex-1])||isListen(messages[npcMessageIndex+1]);
}
export function hasLearningTrigger({asked=false,repeated=false,listened=false}){
 return Boolean(asked||repeated||listened);
}
// Permanent Knowledge increments cap at +1 *per page per interaction*.
// First impression does not modify this cap.
export function capKnowledgeGains(gains){
 return Object.fromEntries(Object.entries(gains??{}).map(([pageId,gain])=>{
  if(!Number.isFinite(gain))throw Error("Invalid Knowledge gain: "+pageId);
  return [pageId,Math.max(0,Math.min(1,gain))];
 }));
}
