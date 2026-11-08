import {locations,information,relations,npcs,emojis,byId} from "../data.js";

// Presentation only. A new view instance receives a snapshot of the current UI state.
// Gameplay, persistence, navigation and event handling remain in app.js.
export function createViews({state,draft,picker,pickerOpen}){
 const loc=id=>locations.find(x=>x.id===id);
 const npc=id=>npcs.find(x=>x.id===id);
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const mapIcon="<svg class=\"ui-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z\"/><path d=\"M9 3v15M15 6v15\"/></svg>";
const lockIcon="<svg class=\"ui-icon lock-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"5\" y=\"10\" width=\"14\" height=\"11\" rx=\"2\"/><path d=\"M8 10V7a4 4 0 0 1 8 0v3\"/></svg>";
function renderTree(parent){
 return locations.filter(l=>l.parent===parent&&l.access!=="secret").map(l=>{
  const open=state.expanded.includes(l.id);
  const hasChildren=locations.some(x=>x.parent===l.id&&x.access!=="secret");
  const locked=l.access==="limited";
  return '<div class="map-tree-row'+(state.location===l.id?' current':'')+(locked?' locked':'')+'">'+
   '<button class="tree-toggle" data-toggle="'+l.id+'" aria-label="'+(open?'Tutup':'Buka')+' cabang '+esc(l.name)+'" '+(!hasChildren?'disabled':'')+'>'+(hasChildren?(open?'⌄':'›'):'·')+'</button>'+
   '<button class="map-location" data-memory-hold="'+l.id+'" data-enter="'+l.id+'" '+(locked?'disabled':'')+'>'+esc(l.name)+'</button>'+
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
 '<button class="location-entry" data-memory-hold="'+l.id+'" data-enter="'+l.id+'" '+(locked?'disabled':'')+'><strong>'+esc(l.name)+'</strong><span>'+esc(l.description)+'</span></button>'+
 '<span class="entry-chevron">'+(locked?lockIcon:'›')+'</span></div>';
}
function npcItem(n){
 return '<div class="location-list-row"><button class="person-tile" data-npc="'+n.id+'" aria-label="Bicara dengan '+esc(n.name)+'">'+esc(n.name.charAt(0))+'</button>'+
 '<button class="location-entry" data-memory-hold="npc:'+n.id+'" data-npc="'+n.id+'"><strong>'+esc(n.name)+'</strong><span>'+esc(n.description)+'</span></button><span class="entry-chevron">›</span></div>';
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
 '<div class="location-banner-overlay"><h2 class="heading location-title" data-memory-hold="'+current.id+'">'+esc(current.name)+'</h2><p class="location-description">'+esc(current.description)+'</p></div></section>'+
 '<div class="location-content"><div class="location-actionbar">'+
 '<div class="action-group action-left"><button class="location-action map-action" data-open-map aria-label="Buka peta">'+mapIcon+' Map</button>'+
 (parent?'<button class="location-action parent-action" data-enter="'+parent.id+'" aria-label="Kembali ke '+esc(parent.name)+'"><span aria-hidden="true">‹</span> '+esc(parent.name)+'</button>':'')+'</div>'+
 '<div class="action-group action-right"><button class="location-action" data-tabgo="memory" aria-label="Buka memory">Memory</button>'+
 '<button class="quiet save-shortcut" id="saveMenu" aria-label="Save">⋯</button></div></div>'+
 '<div class="location-list">'+children.map(locationItem).join("")+people.map(npcItem).join("")+
 (!children.length&&!people.length?'<div class="empty">Tidak ada yang terlihat di sini.</div>':'')+'</div></div>';
}
function tokenHtml(t,removable=false,i=0){return '<span class="chip '+(t.kind==="emoji"?"emoji":"")+'" '+(removable?'data-remove="'+i+'"':t.kind==="info"?'data-memory-hold="'+t.id+'"':"")+'>'+esc(t.kind==="emoji"?t.value:(byId(t.id)?.name||t.id))+(removable?' <span class="x">×</span>':"")+'</span>';}
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
  ?information.filter(i=>state.knowledge[i.id]>0).map(i=>'<button data-add-info="'+i.id+'" data-memory-hold="'+i.id+'">'+esc(i.name)+'</button>').join("")
  :emojis.map(e=>'<button class="emoji-opt" data-add-emoji="'+e+'">'+e+'</button>').join("");
 return '<div class="chat-layout">'+
 '<div class="chat-header"><div class="chat-person"><div class="chat-avatar">'+esc(n.name.charAt(0))+'</div><div class="chat-person-details"><div class="chat-person-name" data-memory-hold="npc:'+n.id+'">'+esc(n.name)+'</div><div class="chat-person-description">'+esc(n.description)+'</div></div></div>'+
 '<button class="map-close chat-close" data-close-chat aria-label="Akhiri percakapan">✕</button></div>'+
 '<div class="chat-messages">'+(messages||'<div class="chat-blank"></div>')+'</div>'+
 (rec.exited?'<div class="chat-ended">Percakapan telah berakhir.</div>':
 '<div class="chat-bottom">'+
 '<div class="chat-composer"><button class="chat-draft" data-toggle-picker aria-label="Pilih topic dan emoji" aria-expanded="'+pickerOpen+'">'+
 (draft.length?'<span class="chat-draft-tokens">'+draft.map((t,i)=>tokenHtml(t,true,i)).join("")+'</span>':'<span class="chat-placeholder"></span>')+
 '</button><button class="chat-send" id="send" aria-label="'+(draft.length?"Kirim pesan":"Dengarkan")+'">➤</button></div>'+
 (pickerOpen?'<div class="chat-picker"><div class="chat-picker-tabs"><button class="'+(picker==="info"?"active":"")+'" data-picker="info">Topic</button><button class="'+(picker==="emoji"?"active":"")+'" data-picker="emoji">Emoji</button></div><div class="chat-picker-options">'+options+'</div></div>':'')+
 '</div>')+
 '</div>';
}
function memory(){const known=information.filter(i=>state.knowledge[i.id]>0);const knownRel=relations.filter(r=>state.relations[r.id]>0);return '<div class="memory-header"><h2 class="heading">Memory</h2><button class="map-close" data-close-memory aria-label="Tutup memory">✕</button></div><p class="section-label">Information · '+known.length+'</p>'+known.map(i=>'<button class="memory-item" data-memory="'+i.id+'"><div><strong>'+esc(i.name)+'</strong><div class="tag">'+esc(i.type)+'</div></div><span class="pill">Lv '+state.knowledge[i.id]+'</span></button>').join("")+'<hr class="divider"><p class="section-label">Relationships · '+knownRel.length+'</p>'+(knownRel.map(r=>'<button class="memory-item" data-memory="'+r.id+'"><strong>'+esc(byId(r.a)?.name)+' × '+esc(byId(r.b)?.name)+'</strong><span class="pill">Lv '+state.relations[r.id]+'</span></button>').join("")||'<p class="empty">Belum ada informasi relasi yang terbuka.</p>');}

 return {explorer,chat,memory};
}
