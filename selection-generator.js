(function(root){
"use strict";
const V="0.3.0-selection", PG=root.InfactionPlaces, WG=root.InfactionWorld, SD=root.InfactionSelectionData;
if(!PG||!WG||!SD)throw Error("Place, World, and Selection Data are required");
const D=PG.data;
const FUNCTIONS=["Residence","Commerce","Production","Authority","Security","Culture"];
const DEMAND=[4,4,2,2,1,2];
const DEFAULT={weights:[.75,.35,0,.25,0],legacyBiasScale:1,neutralDemand:1.5,randomAmplitude:1};
const clip=x=>Math.max(0,Math.min(100,x));
function rngFromSeed(seed){if(seed===undefined)return Math.random;let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
const sum=a=>a.reduce((s,x)=>s+x,0);
const dist=a=>{const t=sum(a);return t?a.map(v=>v/t):a.map(()=>1/a.length)};
const compileCache=new Map();
function compile(settings={}){
 const cfg={...DEFAULT,...settings};
 const cacheKey=JSON.stringify(cfg);if(compileCache.has(cacheKey))return compileCache.get(cacheKey);
 const profiles=D.profiles.map(p=>{const row=SD.byName[p.type];if(!row)throw Error("Missing selection data for "+p.type);return {...p,rawFunction:row.A,bias:row.bias}});
 const AFunc=profiles.map(p=>p.rawFunction),supplyFunction=AFunc.map(dist);
 const transform=(a,bias)=>{const total=sum(a),p=total?a.map(v=>100*v/total):a.map(()=>0),d=bias*cfg.legacyBiasScale;return a.map((v,i)=>clip(cfg.weights[0]*v+cfg.weights[1]*v*d+cfg.weights[2]*100*d+cfg.weights[3]*p[i]+cfg.weights[4]*p[i]*d))};
 const BFunc=profiles.map(p=>transform(p.rawFunction,p.bias));
 const AType=profiles.map(p=>p.factions);
 const BType=profiles.map(p=>transform(p.factions,p.bias));
 const ABase=profiles.map(p=>p.bases);
 const BBase=profiles.map(p=>transform(p.bases,p.bias));
 const typeIx=Object.fromEntries(D.factionTypes.map((t,i)=>[t,i])),baseIx=Object.fromEntries(D.bases.map((b,i)=>[b,i]));
 const mix=(types,base,at,ab)=>{const traits=types.map(t=>at[typeIx[t]]||0);traits.push(ab[baseIx[base]]||0);return Math.pow(traits.reduce((x,v)=>x*Math.max(0,v),1),1/traits.length)};
 const compFactions=(factions,which)=>profiles.map((p,i)=>{const T=which==="A"?AType[i]:BType[i],B=which==="A"?ABase[i]:BBase[i];return [...factions.map(f=>mix(f.types,f.base,T,B)),T[D.factionTypes.indexOf("Neutral")]]});
 const compiled={version:V,profiles,functions:FUNCTIONS,demand:DEMAND,cfg,AFunc,BFunc,compFactions,supplyFunction};compileCache.set(cacheKey,compiled);return compiled;
}
function pickNeed(demand,supply,rng){const td=dist(demand),ts=dist(supply);let max=-Infinity,out=[];for(let i=0;i<demand.length;i++){let v=(td[i]-ts[i])/Math.max(.01,td[i]);if(v>max+1e-10){max=v;out=[i]}else if(Math.abs(v-max)<=1e-10)out.push(i)}return out[Math.floor(rng()*out.length)]}
function generate(seed,options={}){
 const rng=rngFromSeed(seed),cfg=options.settings||{},compiled=compile(cfg);
 const factionsData=options.factions&&options.city?{factions:options.factions,city:options.city}:WG.generateFactions(seed);
 const factions=factionsData.factions,city=factionsData.city;
 const FA=compiled.compFactions(factions,"A"),FB=compiled.compFactions(factions,"B"),supplyFaction=FA.map(dist);
 const demandFaction=[1,1,1,1,1,1,compiled.cfg.neutralDemand];
 const used=new Set(), history=[],output={zones:[],locations:[]};
 const count=(a,b)=>{const bag=[];for(let i=a;i<=b;i++)for(let j=0;j<Math.min(i-a+1,b-i+1);j++)bag.push(i);return bag[Math.floor(rng()*bag.length)]};
 const targets={zones:count(6,9),locations:count(20,30)};
 for(const [role,num] of [["zones",targets.zones],["locations",targets.locations]]){
  const chosen=output[role],sFunc=Array(6).fill(0),sFaction=Array(7).fill(0),eligible=compiled.profiles.map((p,i)=>({p,i})).filter(({p})=>role==="zones"?p.scale>=4:p.scale<=2);
  for(let round=0;round<num;round++){
   const fi=round===0?FUNCTIONS.indexOf("Authority"):pickNeed(DEMAND,sFunc,rng);
   const ai=round===0?0:pickNeed(demandFaction,sFaction,rng);
   const candidates=eligible.filter(({p})=>!used.has(p.type));
   if(!candidates.length)throw Error("Pool exhausted");
   let best=null;
   for(const {p,i} of candidates){
    const F=compiled.BFunc[i][fi]/100,A=FB[i][ai]/100,R=rng()*compiled.cfg.randomAmplitude;
    const score=(F+A+R)/3;
    if(!best||score>best.score)best={p,i,score,F,A,R};
   }
   const {p,i}=best;used.add(p.type);
   const entry={type:p.type,scale:p.scale,role:role==="zones"?"Zone":"Location",reason:round===0?"Government × Authority":"Lowest demand gap",priorityFunction:FUNCTIONS[fi],priorityFaction:ai===6?"Neutral":factions[ai].name,score:Math.round(best.score*10000)/10000,rawFunction:[...compiled.AFunc[i]],rawFaction:[...FA[i]]};
   chosen.push(entry);
   const fd=compiled.supplyFunction[i],ad=supplyFaction[i];for(let j=0;j<6;j++)sFunc[j]+=fd[j];for(let j=0;j<7;j++)sFaction[j]+=ad[j];
   history.push({role:entry.role,round:round+1,place:entry.type,priorityFunction:entry.priorityFunction,priorityFaction:entry.priorityFaction,score:entry.score});
  }
 }
 return {version:V,seed,city,factions,targets,zones:output.zones,locations:output.locations,history,config:compiled.cfg,demandFunction:DEMAND,demandFaction,functions:FUNCTIONS};
}
const api={version:V,functions:FUNCTIONS,demand:DEMAND,defaults:DEFAULT,compile,generate};
if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.InfactionSelection=api;
})(typeof globalThis!=="undefined"?globalThis:this);
