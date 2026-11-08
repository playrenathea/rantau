import {locations,npcs} from "../data.js";

// Location definition: persistent data. Location instance: content of this visit.
// The default generator reproduces today's static location/NPC contents.
export function defaultGenerateLocation({locationId}){
 return {
  locationId,
  locationIds:locations.filter(l=>l.parent===locationId&&l.access!=="secret").map(l=>l.id),
  npcIds:npcs.filter(n=>n.location===locationId).map(n=>n.id),
  eventIds:[]
 };
}
export function generateLocationInstance({locationId,longTermState,recentActions=[],generator=defaultGenerateLocation}){
 if(!locations.some(l=>l.id===locationId))throw Error("Unknown location: "+locationId);
 const instance=generator({locationId,longTermState,recentActions});
 if(!instance||instance.locationId!==locationId||!Array.isArray(instance.locationIds)||!Array.isArray(instance.npcIds))
  throw Error("Invalid location instance");
 return {...instance,eventIds:instance.eventIds??[]};
}
