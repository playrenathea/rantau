/** Data translation of the Player Emoji table. Empty channel means no established effect. */
const VD=(v=null,d=null)=>({v,d});
const entry=(topic=null,npc=null,extra={})=>({topic,npc,...extra});
export const EMOJI_PROFILES=Object.freeze({
 '😡':entry(VD(-1,1),VD(-1,null),{npcConditional:[{when:'dLow',effect:VD(null,-1)}]}),
 '🤨':entry(VD(null,1),null,{npcConditional:[{when:'dLow',effect:VD(null,-1)}]}),
 '😎':entry(VD(1,1),null,{topicAlignmentCondition:'dLow',npcConditional:[{when:'dLow',effect:VD(null,-1)}]}),
 '🙁':entry(VD(-1,null),VD(-1,null)),
 '😐':entry(null,VD(-1,null)),
 '🙂':entry(VD(1,null),VD(1,null)),
 '😟':entry(VD(-1,-1),VD(-1,1)),
 '😔':entry(VD(null,-1)),
 '🥺':entry(VD(1,-1),VD(1,1)),
 '❤️':entry(VD(1,-1),VD(1,1)),
 '👍':entry(VD(1,null),VD(1,null)),
 '👎':entry(VD(-1,1),VD(-1,null),{npcConditional:[{when:'dLow',effect:VD(null,-1)}]}),
 '🙏':entry(VD(1,-1),VD(1,1),{ask:{kind:'conditional',when:'vHigh',conditionCost:VD(null,-1)}}),
 '🫵':entry(null,VD(-1,null),{ask:{kind:'conditional',when:'dHigh',conditionCost:VD(-1,null)}}),
 '🤣':entry(null,null,{topicAlignmentCondition:'vHigh'}),
 '❓':entry(null,null,{ask:{kind:'basic'}}),
 '❗':entry(null,null,{modifier:'boost'}),
 '💤':entry(null,VD(-1,null),{ask:{kind:'suppress'},topicDisalignmentWithInterest:true}),
 '🤫':entry(null,null,{modifier:'invertOpennessRelevance'}),
 '🤔':entry(null,null,{modifier:'mitigateDisagreement'}),
 '💡':entry(null,null,{modifier:'learningLikeListen'}),
 '📍':entry(null,null,{ask:{kind:'filter',type:'Location'}}),
 '⏳':entry(null,null,{ask:{kind:'filter',type:'Time'}}),
 '👥':entry(null,null,{ask:{kind:'filter',type:'IndividualOrGroup'}})
});
export const EMOJI_VALUES=Object.freeze(Object.keys(EMOJI_PROFILES));
