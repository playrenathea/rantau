import {recordAction} from "./recent-actions.js";
import {generateLocationInstance} from "./location.js";

// One completed action -> one log entry -> generate only active location.
// Finishing an interaction and refreshing the same location counts as one action.
export function completeAction({longTermState,recentActions=[],action,generator}){
 const nextRecentActions=recordAction(recentActions,action);
 const locationInstance=generateLocationInstance({
  locationId:action.locationId,longTermState,
  recentActions:nextRecentActions,generator
 });
 return {recentActions:nextRecentActions,locationInstance};
}
