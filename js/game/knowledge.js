// Knowledge page contract. Branches are alternative understandings, not extra levels.
// The visible level is derived; it is never stored independently.
export const visibleLevel=page=>Math.max(0,...(page?.branches??[]).map(b=>b.level));
export const isBranched=page=>(page?.branches?.length??0)>1;
export const canAdvance=page=>(page?.branches?.length??0)===1;

export function acquireLevel(page){
 if(!canAdvance(page))return {page,changed:false};
 const [branch]=page.branches;
 return {page:{...page,branches:[{...branch,level:branch.level+1}]},changed:true};
}
export function discoverBranch(page,branch){
 if(!branch?.id||!Number.isFinite(branch.level)||branch.level<0)throw Error("Invalid branch");
 if((page.branches??[]).some(b=>b.id===branch.id)||(page.pruned??[]).includes(branch.id))
  return {page,changed:false};
 return {page:{...page,branches:[...(page.branches??[]),{...branch}],pruned:[...(page.pruned??[])]},changed:true};
}
export function selectBranch(page,branchId){
 const chosen=(page.branches??[]).find(b=>b.id===branchId);
 if(!chosen)throw Error("Unknown active branch");
 const previousLevel=visibleLevel(page);
 const removed=page.branches.filter(b=>b.id!==branchId).map(b=>b.id);
 return {
  page:{...page,branches:[{...chosen}],pruned:[...new Set([...(page.pruned??[]),...removed])]},
  regression:Math.max(0,previousLevel-chosen.level)
 };
}
// Caller decides whether a learned contradictory proposition can become a new
// branch or is merely contradiction against an already pruned understanding.
export function classifyContradiction(page,branchId){
 if((page.pruned??[]).includes(branchId))return "pruned-contradiction";
 if((page.branches??[]).some(b=>b.id===branchId))return "known";
 return "new-branch";
}
