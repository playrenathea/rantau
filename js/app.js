import {locations,information,relations,npcs,emojis,byId,relationId} from "./data.js";
import {npcReply,farewellEffect} from "./engine.js";
import {fresh,load,persist,downloadSave,parseSave} from "./state.js";
let state=load(),draft=[],picker="info",pickerOpen=false,openMemory=null,previousTab="explorer";
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
const mapIcon="<svg class=\"ui-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z\"/><path d=\"M9 3v15M15 6v15\"/></svg>";
const lockIcon="<svg class=\"ui-icon lock-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"5\" y=\"10\" width=\"14\" height=\"11\" rx=\"2\"/><path d=\"M8 10V7a4 4 0 0 1 8 0v3\"/></svg>";
function renderTree(parent){
 return locations.filter(l=>l.parent===parent&&l.access!=="secret").map(l=>{
  const open=state.expanded.includes(l.id);
  const hasChildren=locations.some(x=>x.parent===l.id&&x.access!=="secret");
  const locked=l.access==="limited";
  return '<div class="map-tree-row'+(state.location===l.id?' current':'')+(locked?' locked':'')+'">'+
   '<button class="tree-toggle" data-toggle="'+l.id+'" aria-label="'+(open?'Tutup':'Buka')+' cabang '+esc(l.name)+'" '+(!hasChildren?'disabled':'')+'>'+(hasChildren?(open?'⌄':'›'):'·')+'</button>'+
   '<button class="map-location" data-enter="'+l.id+'" '+(locked?'disabled':'')+'>'+esc(l.name)+'</button>'+
   (locked?'<span class="map-lock" title="Terkunci">'+lockIcon+'</span>':'')+'</div>'+
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
 '<button class="location-entry" data-enter="'+l.id+'" '+(locked?'disabled':'')+'><strong>'+esc(l.name)+'</strong><span>'+esc(l.description)+'</span></button>'+
 '<span class="entry-chevron">'+(locked?lockIcon:'›')+'</span></div>';
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
 return '<section class="location-banner">'+
 photo(current.id,"location-hero")+
 '<div class="location-banner-overlay"><h2 class="heading location-title">'+esc(current.name)+'</h2><p class="location-description">'+esc(current.description)+'</p></div></section>'+
 '<div class="location-content"><div class="location-actionbar">'+
 '<div class="action-group action-left"><button class="location-action map-action" data-open-map aria-label="Buka peta">'+mapIcon+' Map</button>'+
 (parent?'<button class="location-action parent-action" data-enter="'+parent.id+'" aria-label="Kembali ke '+esc(parent.name)+'"><span aria-hidden="true">‹</span> '+esc(parent.name)+'</button>':'')+'</div>'+
 '<div class="action-group action-right"><button class="location-action" data-tabgo="memory" aria-label="Buka memory">Memory</button>'+
 '<button class="quiet save-shortcut" id="saveMenu" aria-label="Save">⋯</button></div></div>'+
 '<div class="location-list">'+children.map(locationItem).join("")+people.map(npcItem).join("")+
 (!children.length&&!people.length?'<div class="empty">Tidak ada yang terlihat di sini.</div>':'')+'</div></div>';
}
function tokenHtml(t,removable=false,i=0){return '<span class="chip '+(t.kind==="emoji"?"emoji":"")+'" '+(removable?'data-remove="'+i+'"':"")+'>'+esc(t.kind==="emoji"?t.value:(byId(t.id)?.name||t.id))+(removable?' <span class="x">×</span>':"")+'</span>';}
function chat(){
 const n=npc(state.activeNpc);
 if(!n)return '<div class="chat-header"><span>Percakapan</span><button class="map-close" data-close-chat aria-label="Akhiri percakapan">✕</button></div>';
 const rec=state.npcStates[n.id];
 const messages=rec.history.map(m=>{
  const listening=m.from==="player"&&!m.tokens.length;
  return '<div class="message '+(m.from==="player"?"player":"")+'"><div class="bubble">'+
   (listening?'<span class="listen-mark" aria-label="Mendengarkan">◌</span>':m.tokens.map(t=>tokenHtml(t)).join(""))+
   '</div></div>';
 }).join("");
 const options=picker==="info"
  ?information.filter(i=>state.knowledge[i.id]>0).map(i=>'<button data-add-info="'+i.id+'">'+esc(i.name)+'</button>').join("")
  :emojis.map(e=>'<button class="emoji-opt" data-add-emoji="'+e+'">'+e+'</button>').join("");
 return '<div class="chat-layout">'+
 '<div class="chat-header"><div class="chat-person"><div class="chat-avatar">'+esc(n.name.charAt(0))+'</div><div class="chat-person-name">'+esc(n.name)+'</div></div>'+
 '<button class="map-close chat-close" data-close-chat aria-label="Akhiri percakapan">✕</button></div>'+
 '<div class="chat-messages">'+(messages||'<div class="chat-blank"></div>')+'</div>'+
 (rec.exited?'<div class="chat-ended">Percakapan telah berakhir.</div>':
 '<div class="chat-bottom">'+
 (pickerOpen?'<div class="chat-picker"><div class="chat-picker-tabs"><button class="'+(picker==="info"?"active":"")+'" data-picker="info">Topic</button><button class="'+(picker==="emoji"?"active":"")+'" data-picker="emoji">Emoji</button></div><div class="chat-picker-options">'+options+'</div></div>':'')+
 '<div class="chat-composer"><button class="chat-draft" data-toggle-picker aria-label="Pilih topic dan emoji" aria-expanded="'+pickerOpen+'">'+
 (draft.length?'<span class="chat-draft-tokens">'+draft.map((t,i)=>tokenHtml(t,true,i)).join("")+'</span>':'<span class="chat-placeholder"></span>')+
 '</button><button class="chat-send" id="send" aria-label="'+(draft.length?"Kirim pesan":"Dengarkan")+'">➤</button></div>'+
 '</div>')+
 '</div>';
}
function memory(){const known=information.filter(i=>state.knowledge[i.id]>0);const knownRel=relations.filter(r=>state.relations[r.id]>0);return '<div class="memory-header"><h2 class="heading">Memory</h2><button class="map-close" data-close-memory aria-label="Tutup memory">✕</button></div><p class="section-label">Information · '+known.length+'</p>'+known.map(i=>'<button class="memory-item" data-memory="'+i.id+'"><div><strong>'+esc(i.name)+'</strong><div class="tag">'+esc(i.type)+'</div></div><span class="pill">Lv '+state.knowledge[i.id]+'</span></button>').join("")+'<hr class="divider"><p class="section-label">Relationships · '+knownRel.length+'</p>'+(knownRel.map(r=>'<button class="memory-item" data-memory="'+r.id+'"><strong>'+esc(byId(r.a)?.name)+' × '+esc(byId(r.b)?.name)+'</strong><span class="pill">Lv '+state.relations[r.id]+'</span></button>').join("")||'<p class="empty">Belum ada informasi relasi yang terbuka.</p>');}
function render(){
 view.classList.toggle("location-screen",state.tab==="explorer"&&!state.mapOpen);
 view.classList.toggle("chat-screen",state.tab==="chat");
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
document.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const d=b.dataset;if(d.tab){setTab(d.tab);return;}if(b.hasAttribute("data-memory-back")||b.hasAttribute("data-close-memory")){setTab(previousTab);return;}if(b.hasAttribute("data-close-chat")){showFarewell();return;}if(b.hasAttribute("data-open-map")){state.mapOpen=true;render();return;}if(b.hasAttribute("data-close-map")){state.mapOpen=false;render();return;}if(d.tabgo){setTab(d.tabgo);return;}if(d.toggle){state.expanded=state.expanded.includes(d.toggle)?state.expanded.filter(x=>x!==d.toggle):[...state.expanded,d.toggle];save();render();return;}if(d.enter){const l=loc(d.enter);if(l?.access==="limited")return;state.location=l.id;state.mapOpen=false;save();render();return;}if(d.npc){pickerOpen=false;const rec=state.npcStates[d.npc];if(rec.sessionClosed){rec.history=[];rec.used=[];rec.p=npc(d.npc).initial.p;rec.exited=false;rec.sessionClosed=false;save();}state.activeNpc=d.npc;draft=[];setTab("chat");return;}if(d.memoryNpc){const n=npc(d.memoryNpc);showModal('<h2>'+esc(n.name)+'</h2><p>'+esc(n.description)+'</p><p>Halaman informasi individu belum tersedia dalam sandbox.</p>');return;}if(d.memory){memoryDetail(d.memory);return;}if(b.hasAttribute("data-toggle-picker")){pickerOpen=!pickerOpen;render();return;}if(d.picker){picker=d.picker;pickerOpen=true;render();return;}if(d.addInfo){draft.push({kind:"info",id:d.addInfo});render();return;}if(d.addEmoji){draft.push({kind:"emoji",value:d.addEmoji});render();return;}if(d.remove!==undefined){draft.splice(Number(d.remove),1);render();return;}if(b.id==="saveMenu"){openSaveMenu();return;}if(b.id==="clearDraft"){draft=[];render();return;}if(b.id==="send"){send();return;}});
function showFarewell(){
 if(!npc(state.activeNpc))return;
 showModal('<h2>Akhiri percakapan?</h2><div class="farewell-choices" role="group" aria-label="Pilih kesan terakhir">'+
 '<button data-farewell="🙏" aria-label="Hormat">🙏</button>'+
 '<button data-farewell="👎" aria-label="Buruk">👎</button>'+
 '<button data-farewell="🙂" aria-label="Ramah">🙂</button>'+
 '<button data-farewell="😎" aria-label="Confident">😎</button>'+
 '</div><button class="secondary full" data-cancel-farewell>Batal</button>');
}
function finishConversation(emoji){
 const n=npc(state.activeNpc);
 if(!n)return;
 const rec=state.npcStates[n.id];
 const reply=farewellEffect(rec,emoji);
 rec.history.push({from:"player",tokens:[{kind:"emoji",value:emoji}]});
 rec.history.push({from:"npc",tokens:[{kind:"emoji",value:reply}]});
 // Archive the completed session while preserving relationship V/D.
 rec.sessions=Array.isArray(rec.sessions)?rec.sessions:[];
 rec.sessions.push({history:rec.history.map(m=>({from:m.from,tokens:m.tokens.map(t=>({...t}))})),lastImpression:emoji});
 rec.sessionClosed=true;
 draft=[];pickerOpen=false;
 state.activeNpc=null;
 save();
 modal.close();
 setTab("explorer");
}
function send(){if(!state.activeNpc)return;const n=npc(state.activeNpc),rec=state.npcStates[n.id];if(rec.exited)return;rec.history.push({from:"player",tokens:draft.map(t=>({...t}))});const out=npcReply(n,rec,draft,state.knowledge);rec.history.push({from:"npc",tokens:out.response});rec.exited=out.exited;draft=[];pickerOpen=false;save();render();const messages=view.querySelector(".chat-messages");if(messages)messages.scrollTop=messages.scrollHeight;}
$("#closeModal").onclick=()=>modal.close();
function openSaveMenu(){showModal('<h2>Save</h2><div class="actions"><button class="primary" id="exportButton">Export JSON</button><button class="secondary" id="importButton">Import</button></div><p><button class="secondary full" id="resetButton">Reset</button></p>');}
modal.addEventListener("click",e=>{const choice=e.target.closest("[data-farewell]");if(choice){finishConversation(choice.dataset.farewell);return;}if(e.target.closest("[data-cancel-farewell]")){modal.close();return;}const id=e.target.id;if(id==="exportButton"){downloadSave(state);modal.close();}if(id==="importButton"){$("#importSave").click();modal.close();}if(id==="resetButton"&&confirm("Hapus semua progres lokal Rantau pada browser ini?")){state=fresh();draft=[];save();modal.close();render();}});
$("#importSave").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{state=parseSave(await file.text());draft=[];save();render();alert("Save berhasil diimpor.");}catch(err){alert(err.message);}e.target.value="";});
render();
