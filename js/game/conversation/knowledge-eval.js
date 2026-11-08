/** Only reports signals grounded in Memory Page state; no automatic knowledge mutation. */
export function evaluatePage({pageId,count=1,playerLevel=0,npcLevel=0,contra=false,interest=null,alignment=null}) {
 const gap=playerLevel-npcLevel;
 const unaware=npcLevel===0;
 const signals=[];
 if(unaware) signals.push({kind:'confused',weight:count});
 if(contra && !unaware) signals.push({kind:'disagree',weight:count});
 // General knowledge contrast and absolute unawareness are distinct interpretations.
 if(!unaware && gap>=2) signals.push({kind:'exciting',weight:count,reason:'knowledge-gap'});
 if(!unaware && gap<=-2) signals.push({kind:'boring',weight:count,reason:'knowledge-gap'});
 if(interest==='❓' && gap>=2) signals.push({kind:'exciting',weight:count,reason:'npc-interest-question'});
 if(interest==='❗' && alignment?.similarity>0.5)
  signals.push({kind:'interest-discussion',weight:count*(2*alignment.similarity-1)});
 return {pageId,count,gap,unaware,contra,interest,signals,
   npcLearningOpportunity:interest==='❓' && gap>=2};
}
