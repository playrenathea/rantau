import {locations,information,relations,npcs,emojis,byId} from "../playtest-data.js";

// Presentation only. A new view instance receives a snapshot of the current UI state.
// Gameplay, persistence, navigation and event handling remain in app.js.
export function createViews({state,draft,picker,pickerOpen,memoryFilter="all"}){
 const loc=id=>locations.find(x=>x.id===id);
 const npc=id=>npcs.find(x=>x.id===id);
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const mapIcon="<svg class=\"ui-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z\"/><path d=\"M9 3v15M15 6v15\"/></svg>";
const lockIcon="<svg class=\"ui-icon lock-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"5\" y=\"10\" width=\"14\" height=\"11\" rx=\"2\"/><path d=\"M8 10V7a4 4 0 0 1 8 0v3\"/></svg>";
function renderTree(parent){
 return locations.filter(l=>l.parent===parent&&l.access!=="secret"&&state.knowledge[l.id]>0).map(l=>{
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
function locationItem(l){
 const locked=l.access==="limited";
 return '<div class="location-list-row'+(locked?' locked':'')+'">'+
 '<button class="location-entry" data-memory-hold="'+l.id+'" data-enter="'+l.id+'" '+(locked?'disabled':'')+'><strong>'+esc(l.name)+'</strong><span>'+esc(l.description)+'</span></button>'+
 '<span class="entry-chevron">'+(locked?lockIcon:'›')+'</span></div>';
}
function npcItem(n){
 return '<div class="location-list-row"><button class="location-entry" data-memory-hold="npc:'+n.id+'" data-npc="'+n.id+'"><strong>'+esc(n.name)+'</strong><span>'+esc(n.description)+'</span></button><span class="entry-chevron">›</span></div>';
}
function explorer(){
 const current=loc(state.location)||loc("terminal");
 if(state.mapOpen)return '<div class="explorer-header"><span class="section-label">Peta / Kota</span><button class="map-close" data-close-map aria-label="Tutup peta">✕</button></div>'+
 '<h2 class="heading">Peta Kota</h2><div class="map-tree">'+renderTree(null)+'</div>';
 const parent=current.parent?loc(current.parent):null;
 // Known parent and the already-established Terminal ↔ Pasar Induk route are navigable in both directions.
 const children=locations.filter(l=>
  (l.parent===current.id||l.id===current.parent||
   (current.id==="terminal"&&l.id==="pasar_induk")||
   (current.id==="pasar_induk"&&l.id==="terminal"))&&
  l.id!==current.id&&l.access!=="secret"&&state.knowledge[l.id]>0
 ).sort((a,b)=>Number(b.id===current.parent||current.id==="pasar_induk"&&b.id==="terminal")-Number(a.id===current.parent||current.id==="pasar_induk"&&a.id==="terminal"));
 const people=npcs.filter(n=>n.location===current.id);
 const levels=[...information.map(i=>state.knowledge[i.id]||0),...relations.map(r=>state.relations[r.id]||0)];
 const unlocked=levels.filter(level=>level>0).length;
 const totalLevels=levels.reduce((sum,level)=>sum+level,0);
 return '<section class="location-banner"><div class="location-banner-overlay"><h2 class="heading location-title" data-memory-hold="'+current.id+'">'+esc(current.name)+'</h2><p class="location-description">'+esc(current.description)+'</p></div></section>'+
 '<div class="location-content"><div class="location-actionbar">'+
 '<div class="action-group action-left"><button class="location-action map-action" data-open-map aria-label="Buka peta">'+mapIcon+' Map</button>'+
 (parent?'<button class="location-action parent-action" data-enter="'+parent.id+'" aria-label="Kembali ke '+esc(parent.name)+'"><span aria-hidden="true">‹</span> '+esc(parent.name)+'</button>':'')+'</div>'+
 '<div class="action-group action-right"><button class="location-action" data-tabgo="memory" aria-label="Buka memory, '+unlocked+' halaman terbuka, total '+totalLevels+' level">Memory <span class="memory-progress">'+unlocked+' <span aria-hidden="true">|</span> '+totalLevels+'</span></button>'+
 '<button class="quiet save-shortcut" id="saveMenu" aria-label="Save">⋯</button></div></div>'+
 '<div class="explore-groups">'+
 (children.length?'<section class="explore-group" aria-label="Lokasi"><h3 class="explore-group-label">Lokasi</h3><div class="location-list">'+children.map(locationItem).join("")+'</div></section>':'')+
 (people.length?'<section class="explore-group" aria-label="Orang"><h3 class="explore-group-label">Orang</h3><div class="location-list">'+people.map(npcItem).join("")+'</div></section>':'')+
 (!children.length&&!people.length?'<div class="empty">Tidak ada yang terlihat di sini.</div>':'')+'</div></div>';
}
const pageName=id=>{
 const rel=relations.find(r=>r.id===id);
 return byId(id)?.name||(rel?(byId(rel.a)?.name||rel.a)+' × '+(byId(rel.b)?.name||rel.b):id);
};
function tokenHtml(t,removable=false,i=0){return '<span class="chip '+(t.kind==="emoji"?"emoji":"")+'" '+(removable?'data-remove="'+i+'" '+(t.kind==="emoji"?'data-emoji-hold="'+esc(t.value)+'"':'') :t.kind==="info"?'data-memory-hold="'+t.id+'"':'data-emoji-hold="'+esc(t.value)+'"')+'>'+esc(t.kind==="emoji"?t.value:pageName(t.id))+(removable?' <span class="x">×</span>':"")+'</span>';}
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
 const usedTopics=new Set(draft.filter(t=>t.kind==="info").map(t=>t.id));
 const usedEmojis=new Set(draft.filter(t=>t.kind==="emoji").map(t=>t.value));
 const options=picker==="info"
  ?[...information.filter(i=>state.knowledge[i.id]>0),...relations.filter(r=>state.relations[r.id]>0).map(r=>({id:r.id,name:(byId(r.a)?.name||r.a)+" × "+(byId(r.b)?.name||r.b)}))].map(i=>'<button data-add-info="'+i.id+'" data-memory-hold="'+i.id+'"'+(usedTopics.has(i.id)?' disabled aria-label="'+esc(i.name)+' sudah dipilih"':'')+'>'+esc(i.name)+'</button>').join("")
  :emojis.map(e=>'<button class="emoji-opt" data-add-emoji="'+e+'" data-emoji-hold="'+e+'"'+(usedEmojis.has(e)?' disabled aria-label="'+e+' sudah dipilih"':'')+'>'+e+'</button>').join("");
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
function memory(){
 const known=information.filter(i=>state.knowledge[i.id]>0);
 const knownRel=relations.filter(r=>state.relations[r.id]>0);
 const types=[...new Set(information.map(i=>i.type))];
 const filters=[["all","All"],...types.map(t=>[t,t]),["Relationships","Relationships"]];
 const pinnedIds=Array.isArray(state.workingMemory)?state.workingMemory:[];
 const pinIcon='<svg class="pin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16 3 5 5-4 1-3 3v5l-2 2-4-4-5 5 5-5-4-4 2-2h5l3-3z"/></svg>';
 const page=id=>{
  const info=information.find(i=>i.id===id);
  if(info)return {id,name:info.name,type:info.type,level:state.knowledge[id]||0};
  const rel=relations.find(r=>r.id===id);
  return rel?{id,name:(byId(rel.a)?.name||rel.a)+' × '+(byId(rel.b)?.name||rel.b),type:"Relationships",level:state.relations[id]||0}:null;
 };
 const pinButton=id=>'<button class="memory-pin'+(pinnedIds.includes(id)?' is-pinned':'')+'" data-pin-memory="'+esc(id)+'" aria-label="'+(pinnedIds.includes(id)?'Lepas pin ':'Pin ')+esc(page(id)?.name||id)+'" aria-pressed="'+pinnedIds.includes(id)+'" title="'+(pinnedIds.includes(id)?'Unpin':'Pin')+'">'+pinIcon+'</button>';
 const pinned=pinnedIds.map(page).filter(p=>p&&p.level>0);
 const workingSection='<section class="working-memory" aria-label="Working Memory"><div class="working-memory-head"><h3>Working Memory</h3><span class="working-memory-count">'+pinned.length+' / 7</span></div>'+ (pinned.length?'<div class="working-memory-list">'+pinned.map(p=>'<div class="working-memory-row"><button class="working-memory-name" data-memory="'+esc(p.id)+'">'+esc(p.name)+'</button><span class="working-memory-type">'+esc(p.type)+'</span>'+pinButton(p.id)+'</div>').join("")+'</div>':'<p class="working-memory-empty">Pin informasi dari daftar Memory di bawah.</p>')+'</section>';
 const filterBar='<div class="memory-filters" role="group" aria-label="Filter memory">'+
  filters.map(([key,label])=>'<button class="memory-filter'+(memoryFilter===key?' active':'')+
   '" data-memory-filter="'+esc(key)+'" aria-pressed="'+(memoryFilter===key)+'">'+esc(label)+'</button>').join("")+'</div>';
 const shown=memoryFilter==="all"?known:known.filter(i=>i.type===memoryFilter);
 const showRel=memoryFilter==="all"||memoryFilter==="Relationships";
 const stats=(info,rels=[])=>{
  const levels=[...info.map(i=>state.knowledge[i.id]||0),...rels.map(r=>state.relations[r.id]||0)];
  return levels.filter(level=>level>0).length+' | '+levels.reduce((total,level)=>total+level,0);
 };
 const filterLabel=filters.find(([key])=>key===memoryFilter)?.[1]||"All";
 const sectionLabel=(label,info,rels=[])=>'<p class="section-label">'+esc(label)+' · '+stats(info,rels)+'</p>';
 const items=memoryFilter==="Relationships"?[]:shown.map(i=>'<div class="memory-entry"><button class="memory-item" data-memory="'+i.id+
  '"><div><strong>'+esc(i.name)+'</strong><div class="tag">'+esc(i.type)+'</div></div><span class="pill">Lv '+state.knowledge[i.id]+'</span></button>'+pinButton(i.id)+'</div>');
 const relItems=showRel?knownRel.map(r=>'<div class="memory-entry"><button class="memory-item" data-memory="'+r.id+'"><strong>'+
  esc(byId(r.a)?.name)+' × '+esc(byId(r.b)?.name)+'</strong><span class="pill">Lv '+state.relations[r.id]+'</span></button>'+pinButton(r.id)+'</div>'):[];
 return '<div class="memory-header"><h2 class="heading">Memory</h2><button class="map-close" data-close-memory aria-label="Tutup memory">✕</button></div>'+
  workingSection+filterBar+
  (memoryFilter==="all"?sectionLabel("Information",known):sectionLabel(filterLabel,shown,showRel?knownRel:[]))+
  items.join("")+
  (memoryFilter==="all"?'<hr class="divider">'+sectionLabel("Relationships",[],knownRel):'')+
  relItems.join("")+
  (!items.length&&!relItems.length?'<p class="empty">Belum ada informasi untuk kategori ini.</p>':'');
}

 return {explorer,chat,memory};
}
