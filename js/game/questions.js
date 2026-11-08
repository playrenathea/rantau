// A question operator constrains the type of the other side of an ordinary
// information relationship. There are no dedicated question relationship types.
export const QUESTION_TARGET_TYPE=Object.freeze({
 where:"Location",
 when:"Time",
 who:"Individual"
});
export function matchingAnswers({operator,subjectId,relationships,informationById}){
 const expected=QUESTION_TARGET_TYPE[operator];
 if(!expected)return [];
 return relationships.flatMap(r=>{
  const other=r.a===subjectId?r.b:r.b===subjectId?r.a:null;
  if(!other)return [];
  const item=informationById(other);
  return item?.type===expected?[{relationId:r.id,answerId:other}]:[];
 });
}
