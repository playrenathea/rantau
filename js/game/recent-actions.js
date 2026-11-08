// Ten most recent completed actions. Never store conversation transcripts.
export const ACTION_LIMIT=10;
export function recordAction(recentActions,action){
 if(!["enter_location","interact_npc"].includes(action?.type))throw Error("Unknown action type");
 const previous=Array.isArray(recentActions)?recentActions:[];
 const summary={type:action.type,locationId:action.locationId};
 if(action.type==="interact_npc"){
  summary.npcId=action.npcId;
  summary.changes=JSON.parse(JSON.stringify(action.changes??{}));
 }
 return [...previous,summary].slice(-ACTION_LIMIT);
}
