import {locations,information,relations,npcs,emojis,byId,relationId} from "./data.js";
import {npcReply} from "./engine.js";
import {fresh,load,persist,downloadSave,parseSave} from "./state.js";
let state=load(),draft=[],picker="info",openMemory=null,previousTab="explorer";
state.mapOpen=false;
const $=s=>document.querySelector(s);
const view=$("#view"),modal=$("#modal");
const loc=id=>locations.find(x=>x.id===id);
const npc=id=>npcs.find(x=>x.id===id);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const save=()=>persist(state);
function setTab(tab){if(tab==="memory"&&state.tab!=="memory")previousTab=state.tab;state.tab=tab;state.mapOpen=false;render();}
function showModal(html){$("#modalContent").innerHTML=html;modal.showModal();}
function memoryDetail(id){const item=byId(id)||relations.find(r=>r.id===id);if(!item)return;const level=state.knowledge[id]||state.relations[id]||0;if(!level){showModal('<h2>Belum dikenal</h2><p>Kamu belum memiliki informasi tentang hal ini.</p>');return;}const facts=item.facts.slice(0,Math.max(0,level-1));showModal('<div class="section-label">Memory · Level '+level+'</div><h2>'+esc(item.name||byId(item.a)?.name+" × "+byId(item.b)?.name)+'</h2>'+(facts.length?'<ol class="knowledge">'+facts.map(f=>'<li>'+esc(f)+'</li>').join("")+'</ol>':'<p>Kamu sadar akan keberadaannya, tetapi belum mengetahui lebih jauh.</p>'));}
function bindHold(element,id){let timer,held=false;element.addEventListener("pointerdown",()=>{held=false;timer=setTimeout(()=>{held=true;memoryDetail(id)},550)});for(const ev of ["pointerup","pointerleave","pointercancel"])element.addEventListener(ev,()=>clearTimeout(timer));element.addEventListener("contextmenu",e=>{e.preventDefault();memoryDetail(id)});element.addEventListener("click",e=>{if(held){e.preventDefault();e.stopPropagation();held=false}},true);}
function renderTree(parent){
 return locations.filter(l=>l.parent===parent&&l.access!=="secret").map(l=>{
  const open=state.expanded.includes(l.id);
  const hasChildren=locations.some(x=>x.parent===l.id&&x.access!=="secret");
  const locked=l.access==="limited";
  return '<div class="map-tree-row'+(state.location===l.id?' current':'')+(locked?' locked':'')+'">'+
   '<button class="tree-toggle" data-toggle="'+l.id+'" aria-label="'+(open?'Tutup':'Buka')+' cabang '+esc(l.name)+'" '+(!hasChildren?'disabled':'')+'>'+(hasChildren?(open?'⌄':'›'):'·')+'</button>'+
   '<button class="map-location" data-enter="'+l.id+'" '+(locked?'disabled':'')+'>'+esc(l.name)+'</button>'+
   (locked?'<span class="map-lock">Terkunci</span>':'')+'</div>'+
   (open&&hasChildren?'<div class="tree-indent">'+renderTree(l.id)+'</div>':'');
 }).join("");
}
// Temporary art references, shared by the full-sized location image and folder thumbnail.
const PHOTO_MARKET="https://images.unsplash.com/photo-1753740023014-143ab3536662?auto=format&fit=crop&w=1000&q=75";
const PHOTO_STREET="https://images.unsplash.com/photo-1558907530-83566904e778?auto=format&fit=crop&w=1000&q=75";
const locationImage=id=>["pasar","niaga","pertokoan","pasar_gelap"].includes(id)?PHOTO_MARKET:PHOTO_STREET;
const photo=(id,kind)=>'<img class="'+kind+'" loading="'+(kind==="location-hero"?"eager":"lazy")+'" alt="" src="'+locationImage(id)+'">';
function locationItem(l){
 const locked=l.access==="limited";
 return '<div class="location-list-row'+(locked?' locked':'')+'">'+
 '<button class="place-tile" data-enter="'+l.id+'" '+(locked?'disabled':'')+' aria-label="Buka '+esc(l.name)+'">'+photo(l.id,"tile-photo")+'</button>'+
 '<button class="location-entry" data-enter="'+l.id+'" '+(locked?'disabled':'')+'><strong>'+esc(l.name)+'</strong><span>'+esc(l.description)+(locked?' · Terkunci':'')+'</span></button>'+
 '<span class="entry-chevron">'+(locked?'⌑':'›')+'</span></div>';
}
function npcItem(n){
 return '<div class="location-list-row"><button class="person-tile" data-npc="'+n.id+'" aria-label="Bicara dengan '+esc(n.name)+'">'+esc(n.name.charAt(0))+'</button>'+
 '<button class="location-entry" data-npc="'+n.id+'"><strong>'+esc(n.name)+'</strong><span>'+esc(n.description)+'</span></button><span class="entry-chevron">›</span></div>';
}
function explorer(){
 const current=loc(state.location)||loc("kota");
 if(state.mapOpen)return '<div class="explorer-header"><span class="section-label">Peta / Kota</span><button class="map-close" data-close-map aria-label="Tutup peta">✕</button></div>'+
 '<h2 class="heading">Peta Kota</h2><div class="map-tree">'+renderTree(null)+'</div>';
 const parent=current.parent?loc(current.parent):null;
 const children=locations.filter(l=>l.parent===current.id&&l.access!=="secret");
 const people=npcs.filter(n=>n.location===current.id);
 return '<div class="explorer-header location-tools"><div class="location-actions"><button class="map-open" data-open-map aria-label="Buka peta">⌖ <span>Map</span></button><button class="map-open" data-tabgo="memory" aria-label="Buka memory">▤ <span>Memory</span></button></div><button class="quiet save-shortcut" id="saveMenu" aria-label="Save">⋯</button></div>'+
 (parent?'<button class="parent-back" data-enter="'+parent.id+'">‹ '+esc(parent.name)+'</button>':'')+
 '<h2 class="heading location-title">'+esc(current.name)+'</h2><p class="lede location-description">'+esc(current.description)+'</p>'+
 photo(current.id,"location-hero")+
 '<div class="location-list">'+children.map(locationItem).join("")+people.map(npcItem).join("")+
 (!children.length&&!people.length?'<div class="empty">Tidak ada yang terlihat di sini.</div>':'')+'</div>';
}
function tokenHtml(t,removable=false,i=0){return '<span class="chip '+(t.kind==="emoji"?"emoji":"")+'" '+(removable?'data-remove="'+i+'"':"")+'>'+esc(t.kind==="emoji"?t.value:(byId(t.id)?.name||t.id))+(removable?' <span class="x">×</span>':"")+'</span>';}
function chat(){const n=npc(state.activeNpc);if(!n)return '<button class="back" data-tabgo="explorer">← Kembali</button><h2 class="heading">Percakapan</h2>';const rec=state.npcStates[n.id];return '<div class="toolbar"><button class="back" data-tabgo="explorer">← Explorer</button></div><h2 class="heading" style="margin-top:19px">'+esc(n.name)+'</h2><p class="lede">'+esc(n.description)+'</p><div class="conversation">'+(rec.history.length?rec.history.map(m=>'<div class="message '+(m.from==="player"?"player":"")+'"><div class="sender">'+(m.from==="player"?"Kamu":esc(n.name))+'</div><div class="bubble">'+m.tokens.map(t=>tokenHtml(t)).join("")+'</div></div>').join(""):'<div class="empty">Percakapan dimulai. Susun pesan dari informasi dan emoji.</div>')+'</div>'+(rec.exited?'<div class="empty">'+esc(n.name)+' sudah mengakhiri percakapan. Kembali lagi lain waktu (fitur reset sesi akan dikembangkan).</div>':'<div class="composer"><div class="section-label">Susun pesan</div><div class="draft">'+(draft.length?draft.map((t,i)=>tokenHtml(t,true,i)).join(""):'<span class="hint">Ketuk token untuk menambahkan. Ketuk token tersusun untuk menghapus.</span>')+'</div><div class="actions"><button class="secondary" id="clearDraft">Hapus</button><button class="primary" id="send" '+(!draft.length?"disabled":"")+'>Kirim pesan →</button></div><hr class="divider"><div class="actions"><button class="'+(picker==="info"?"primary":"secondary")+'" data-picker="info">Information</button><button class="'+(picker==="emoji"?"primary":"secondary")+'" data-picker="emoji">Emoji</button></div><div class="picker">'+(picker==="info"?information.filter(i=>state.knowledge[i.id]>0).map(i=>'<button data-add-info="'+i.id+'">'+esc(i.name)+'</button>').join(""):emojis.map(e=>'<button class="emoji-opt" data-add-emoji="'+e+'">'+e+'</button>').join(""))+'</div></div>');}
function memory(){const known=information.filter(i=>state.knowledge[i.id]>0);const knownRel=relations.filter(r=>state.relations[r.id]>0);return '<button class="back memory-back" data-memory-back>← Kembali</button><h2 class="heading">Memory</h2><p class="section-label">Information · '+known.length+'</p>'+known.map(i=>'<button class="memory-item" data-memory="'+i.id+'"><div><strong>'+esc(i.name)+'</strong><div class="tag">'+esc(i.type)+'</div></div><span class="pill">Lv '+state.knowledge[i.id]+'</span></button>').join("")+'<hr class="divider"><p class="section-label">Relationships · '+knownRel.length+'</p>'+(knownRel.map(r=>'<button class="memory-item" data-memory="'+r.id+'"><strong>'+esc(byId(r.a)?.name)+' × '+esc(byId(r.b)?.name)+'</strong><span class="pill">Lv '+state.relations[r.id]+'</span></button>').join("")||'<p class="empty">Belum ada informasi relasi yang terbuka.</p>');}
function render(){
 view.innerHTML=state.tab==="chat"?chat():state.tab==="memory"?memory():explorer();
 view.querySelectorAll("[data-enter]").forEach(el=>{
  if(byId(el.dataset.enter))bindHold(el,el.dataset.enter);
 });
 view.querySelectorAll("[data-npc]").forEach(el=>{
  let timer,held=false;
  el.addEventListener("pointerdown",()=>{
   held=false;
   timer=setTimeout(()=>{
    held=true;
    showModal("<h2>"+esc(npc(el.dataset.npc).name)+"</h2><p>Memory NPC belum terbuka pada versi awal.</p>");
   },600);
  });
  ["pointerup","pointerleave","pointercancel"].forEach(ev=>el.addEventListener(ev,()=>clearTimeout(timer)));
  el.addEventListener("click",ev=>{
   if(held){ev.stopPropagation();ev.preventDefault();held=false;}
  },true);
 });
}
document.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const d=b.dataset;if(d.tab){setTab(d.tab);return;}if(b.hasAttribute("data-memory-back")){setTab(previousTab);return;}if(b.hasAttribute("data-open-map")){state.mapOpen=true;render();return;}if(b.hasAttribute("data-close-map")){state.mapOpen=false;render();return;}if(d.tabgo){setTab(d.tabgo);return;}if(d.toggle){state.expanded=state.expanded.includes(d.toggle)?state.expanded.filter(x=>x!==d.toggle):[...state.expanded,d.toggle];save();render();return;}if(d.enter){const l=loc(d.enter);if(l?.access==="limited")return;state.location=l.id;state.mapOpen=false;save();render();return;}if(d.npc){state.activeNpc=d.npc;draft=[];setTab("chat");return;}if(d.memoryNpc){const n=npc(d.memoryNpc);showModal('<h2>'+esc(n.name)+'</h2><p>'+esc(n.description)+'</p><p>Halaman informasi individu belum tersedia dalam sandbox.</p>');return;}if(d.memory){memoryDetail(d.memory);return;}if(d.picker){picker=d.picker;render();return;}if(d.addInfo){draft.push({kind:"info",id:d.addInfo});render();return;}if(d.addEmoji){draft.push({kind:"emoji",value:d.addEmoji});render();return;}if(d.remove!==undefined){draft.splice(Number(d.remove),1);render();return;}if(b.id==="saveMenu"){openSaveMenu();return;}if(b.id==="clearDraft"){draft=[];render();return;}if(b.id==="send"){send();return;}});
function send(){if(!draft.length||!state.activeNpc)return;const n=npc(state.activeNpc),rec=state.npcStates[n.id];if(rec.exited)return;rec.history.push({from:"player",tokens:draft.map(t=>({...t}))});const out=npcReply(n,rec,draft,state.knowledge);rec.history.push({from:"npc",tokens:out.response});rec.exited=out.exited;draft=[];save();render();view.querySelector(".conversation")?.lastElementChild?.scrollIntoView({behavior:"smooth",block:"nearest"});}
$("#closeModal").onclick=()=>modal.close();
function openSaveMenu(){showModal('<h2>Save</h2><div class="actions"><button class="primary" id="exportButton">Export JSON</button><button class="secondary" id="importButton">Import</button></div><p><button class="secondary full" id="resetButton">Reset</button></p>');}
modal.addEventListener("click",e=>{const id=e.target.id;if(id==="exportButton"){downloadSave(state);modal.close();}if(id==="importButton"){$("#importSave").click();modal.close();}if(id==="resetButton"&&confirm("Hapus semua progres lokal Rantau pada browser ini?")){state=fresh();draft=[];save();modal.close();render();}});
$("#importSave").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{state=parseSave(await file.text());draft=[];save();render();alert("Save berhasil diimpor.");}catch(err){alert(err.message);}e.target.value="";});
render();
