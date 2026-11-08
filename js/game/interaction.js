// Interaction state is temporary. Outcome formulas are injected, not fixed here.
const clone=value=>JSON.parse(JSON.stringify(value));
export function beginInteraction({npcId,locationId,initialState,firstImpression=false}){
 return {npcId,locationId,firstImpression,working:clone(initialState),messages:[]};
}
// Up to +/-1 per variable, except up to +/-3 for explicitly selected NPC
// affect dimensions during first impression. The caller chooses affectKeys.
export function limitChanges(changes,{firstImpression=false,affectKeys=[]}={}){
 const capped={};
 for(const [group,values] of Object.entries(changes??{})){
  capped[group]={};
  for(const [key,delta] of Object.entries(values??{})){
   if(typeof delta!=="number"||!Number.isFinite(delta))throw Error("Invalid delta: "+group+"."+key);
   const limit=firstImpression&&group==="npc"&&affectKeys.includes(key)?3:1;
   capped[group][key]=Math.max(-limit,Math.min(limit,delta));
  }
 }
 return capped;
}
export function finishInteraction(session,{calculateChanges,affectKeys=[]}){
 if(typeof calculateChanges!=="function")throw Error("Missing outcome model");
 return {
  npcId:session.npcId,
  locationId:session.locationId,
  changes:limitChanges(calculateChanges(session),{
   firstImpression:session.firstImpression,affectKeys
  })
 };
 // The temporary transcript is intentionally not returned or saved.
}
