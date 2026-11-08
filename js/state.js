import {npcs,information,relations} from "./data.js";
const KEY="rantau.save.v1";
const DEFAULT_PINS=["kota","pasar","militer"];
const normalizePins=(pins,knowledge,knownRelations)=>{
 const allowed=new Set([...information.filter(i=>knowledge[i.id]>0).map(i=>i.id),...relations.filter(r=>knownRelations[r.id]>0).map(r=>r.id)]);
 return [...new Set((Array.isArray(pins)?pins:DEFAULT_PINS).filter(id=>typeof id==="string"&&allowed.has(id)))].slice(0,7);
};
export const fresh=()=>({schemaVersion:1,location:"pasar",tab:"explorer",expanded:["kota","niaga"],knowledge:{kota:2,pasar:2,warung:1,penginapan:1,militer:1,saudagar:1,malam:1},relations:{},workingMemory:["kota","pasar","militer"],npcStates:Object.fromEntries(npcs.map(n=>[n.id,{...n.initial,history:[],used:[],exited:false}])),activeNpc:null});
export function load(){try{const raw=localStorage.getItem(KEY);if(!raw)return fresh();const s=JSON.parse(raw);if(s.schemaVersion!==1)throw Error("Versi save tidak cocok");const base=fresh();const merged={...base,...s,knowledge:{...base.knowledge,...s.knowledge},relations:{...base.relations,...s.relations},npcStates:{...base.npcStates,...s.npcStates}};merged.workingMemory=normalizePins(s.workingMemory,merged.knowledge,merged.relations);return merged;}catch(e){console.warn("Save invalid, starting fresh",e);return fresh();}}
export function persist(s){try{localStorage.setItem(KEY,JSON.stringify({...s,tab:undefined}));}catch(e){console.warn("Save gagal disimpan",e);}}
export function downloadSave(s){const blob=new Blob([JSON.stringify(s,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="rantau-save-v1.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function parseSave(text){const data=JSON.parse(text);if(data?.schemaVersion!==1||!data.knowledge||!data.npcStates||typeof data.location!=="string")throw Error("File save tidak valid atau versinya tidak didukung");const merged={...fresh(),...data};merged.workingMemory=normalizePins(data.workingMemory,merged.knowledge,merged.relations);return merged;}
