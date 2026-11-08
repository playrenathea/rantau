/** A null/undefined axis is unspecified, not neutral. Values are -1..1. */
export function normalizeAttitude(attitude) {
 if(!attitude) return null;
 return {v:attitude.v == null ? null : (attitude.v-5)/5,
         d:attitude.d == null ? null : (attitude.d-5)/5};
}
export function compareAttitudes(a,b,weights={v:1,d:1}) {
 if(!a||!b) return null;
 const active=['v','d'].filter(axis=>a[axis]!=null && b[axis]!=null && weights[axis]>0);
 if(!active.length) return null;
 const denominator=active.reduce((total,axis)=>total+weights[axis],0);
 const distance=active.reduce((sum,axis)=>sum+weights[axis]*Math.abs(a[axis]-b[axis]),0)/denominator;
 return {distance,similarity:Math.max(0,Math.min(1,1-distance/2)),axes:active};
}
export function combineDirections(directions) {
 const out={v:null,d:null};
 for(const axis of ['v','d']) {
  const relevant=directions.filter(dir=>dir?.[axis]!=null);
  if(relevant.length) out[axis]=relevant.reduce((s,dir)=>s+dir[axis],0)/relevant.length;
 }
 return out;
}
export function compareEmojiVectors(a,b,identical=false,weights) {
 const result=compareAttitudes(a,b,weights);
 return result ? {...result,identical,senadaDifferent:!identical && result.similarity===1} : null;
}
