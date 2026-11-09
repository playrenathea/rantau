import {locations,relations,npcs,byId,emojiDescriptions} from "./playtest-data.js";
import {createViews} from "./ui/views.js?v=memory-metadata-20261109";
import {begin,beat,finish,setPlayerLocation} from "./game/conversation/persistent-sim.js";
import {fresh,load,persist,downloadSave,parseSave,project} from "./playtest-state.js";
let state=load(),draft=[],picker="info",pickerOpen=false,memoryFilter="all",previousTab="explorer";
state.mapOpen=false;
const $=s=>document.querySelector(s);
const view=$("#view"),modal=$("#modal");
const loc=id=>locations.find(x=>x.id===id);
const npc=id=>npcs.find(x=>x.id===id);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const save=()=>persist(state);
const visible=()=>project(state);
function setTab(tab){if(tab==="memory"&&state.tab!=="memory")previousTab=state.tab;state.tab=tab;state.mapOpen=false;render();}
function showModal(html){$("#modalContent").innerHTML=html;modal.showModal();}
function memoryDetail(id){
 const person=id.startsWith("npc:")?npc(id.slice(4)):null;
 if(person){showModal('<div class="section-label">Memory · Individu</div><h2>'+esc(person.name)+'</h2><p>'+esc(person.description)+'</p>');return;}
 const item=byId(id)||relations.find(r=>r.id===id),place=loc(id);
 const display=visible();
 const level=display.knowledge[id]||display.relations[id]||0;
 if(!level&&!place)return;
 const facts=item?.facts?.slice(0,Math.max(0,level-1))||[];
 const name=item?(item.name||byId(item.a)?.name+" × "+byId(item.b)?.name):place?.name||id;
 showModal('<div class="section-label">Memory'+(level?' · Level '+level:' · Lokasi')+'</div><h2>'+esc(name)+'</h2>'+
 (facts.length?'<ol class="knowledge">'+facts.map(f=>'<li>'+esc(f)+'</li>').join("")+'</ol>':'<p>'+esc(place?.description||'Kamu tahu keberadaannya, tetapi belum tahu lebih jauh.')+'</p>'));
}
function bindHold(element,id){
 let timer,held=false;
 element.addEventListener("pointerdown",()=>{held=false;clearTimeout(timer);timer=setTimeout(()=>{held=true;memoryDetail(id)},550)});
 for(const event of ["pointerup","pointerleave","pointercancel"])element.addEventListener(event,()=>clearTimeout(timer));
 element.addEventListener("contextmenu",e=>{e.preventDefault();clearTimeout(timer);held=true;memoryDetail(id)});
 element.addEventListener("click",e=>{if(held){e.preventDefault();e.stopImmediatePropagation();held=false}},true);
}
function emojiDetail(emoji){
 const description=emojiDescriptions[emoji];
 if(!description)return;
 showModal('<div class="emoji-detail-symbol">'+esc(emoji)+'</div><p class="emoji-detail-description">'+esc(description)+'</p>');
}
function bindEmojiHold(element,emoji,onHold=emojiDetail){
 let timer,held=false;
 element.addEventListener("pointerdown",e=>{
  if(e.button!==0&&e.pointerType!=="touch")return;
  held=false;
  clearTimeout(timer);
  timer=setTimeout(()=>{held=true;onHold(emoji)},550);
 });
 for(const event of ["pointerup","pointerleave","pointercancel"]){
  element.addEventListener(event,()=>clearTimeout(timer));
 }
 element.addEventListener("contextmenu",e=>{
  e.preventDefault();
  clearTimeout(timer);
  if(!held){held=true;onHold(emoji);}
 });
 element.addEventListener("click",e=>{
  if(!held)return;
  e.preventDefault();
  e.stopImmediatePropagation();
  held=false;
 },true);
}
function render(){
 view.classList.toggle("location-screen",state.tab==="explorer"&&!state.mapOpen);
 view.classList.toggle("chat-screen",state.tab==="chat");
 const views=createViews({state:visible(),draft,picker,pickerOpen,memoryFilter});
 view.innerHTML=state.tab==="chat"?views.chat():state.tab==="memory"?views.memory():views.explorer();
 view.querySelectorAll("[data-emoji-hold]").forEach(el=>bindEmojiHold(el,el.dataset.emojiHold));
 view.querySelectorAll("[data-memory-hold]").forEach(el=>{
  const id=el.dataset.memoryHold;
  const display=visible();
  if(id.startsWith("npc:")||display.knowledge[id]>0||display.relations[id]>0||loc(id))bindHold(el,id);
 });
}
function handleClick(event){
 const removed=event.target.closest("[data-remove]");
 if(removed&&removed.closest(".chat-draft")){
  draft.splice(Number(removed.dataset.remove),1);
  pickerOpen=true;
  render();
  return;
 }
 const button=event.target.closest("button");
 if(!button)return;
 const d=button.dataset;
 if(d.tab){setTab(d.tab);return;}
 if(button.hasAttribute("data-memory-back")||button.hasAttribute("data-close-memory")){setTab(previousTab);return;}
 if(button.hasAttribute("data-close-chat")){showFarewell();return;}
 if(button.hasAttribute("data-open-map")){state.mapOpen=true;if(state.location==="pasar_induk"&&!state.expanded.includes("terminal"))state.expanded=[...state.expanded,"terminal"];render();return;}
 if(button.hasAttribute("data-close-map")){state.mapOpen=false;render();return;}
 if(d.tabgo){setTab(d.tabgo);return;}
 if(d.toggle){
  state.expanded=state.expanded.includes(d.toggle)
   ?state.expanded.filter(id=>id!==d.toggle)
   :[...state.expanded,d.toggle];
  save();render();return;
 }
 if(d.enter){
  const location=loc(d.enter);
  if(!location||location.access==="limited")return;
  try{setPlayerLocation(state.world,location.id);}catch(err){alert(err.message);return;}
  state.mapOpen=false;
  save();render();return;
 }
 if(d.npc){
  if(!npc(d.npc))return;
  try{
   if(!state.world.active)begin(state.world,d.npc);
   else if(state.world.active.npcId!==d.npc)return;
  }catch(err){alert(err.message);return;}
  pickerOpen=false;draft=[];save();setTab("chat");return;
 }
 if(d.memoryNpc){
  const person=npc(d.memoryNpc);
  showModal('<h2>'+esc(person.name)+'</h2><p>'+esc(person.description)+'</p><p>Halaman informasi individu belum tersedia dalam sandbox.</p>');
  return;
 }
 if(d.pinMemory){
  const id=d.pinMemory;
  const display=visible();
  const allowed=(display.knowledge[id]||0)>0||(display.relations[id]||0)>0;
  if(!allowed)return;
  const current=Array.isArray(state.workingMemory)?state.workingMemory:[];
  if(current.includes(id))state.workingMemory=current.filter(x=>x!==id);
  else if(current.length<7)state.workingMemory=[...current,id];
  else return;
  const scroll=window.scrollY;
  save();render();
  window.scrollTo(0,scroll);
  return;
 }
 if(d.memory){memoryDetail(d.memory);return;}
 if(d.memoryFilter!==undefined){memoryFilter=d.memoryFilter;render();return;}
 if(button.hasAttribute("data-toggle-picker")){pickerOpen=!pickerOpen;render();return;}
 if(d.picker){picker=d.picker;pickerOpen=true;render();return;}
 if(d.addInfo){if(!draft.some(t=>t.kind==="info"&&t.id===d.addInfo)){draft.push({kind:"info",id:d.addInfo});render();}return;}
 if(d.addEmoji){if(!draft.some(t=>t.kind==="emoji"&&t.value===d.addEmoji)){draft.push({kind:"emoji",value:d.addEmoji});render();}return;}
 if(d.remove!==undefined){draft.splice(Number(d.remove),1);render();return;}
 if(button.id==="saveMenu"){openSaveMenu();return;}
 if(button.id==="clearDraft"){draft=[];render();return;}
 if(button.id==="send"){send();return;}
}
document.addEventListener("click",handleClick);
function showFarewellEmojiDetail(emoji){
 const description=emojiDescriptions[emoji];
 if(!description||!modal.open)return;
 modal.querySelector(".farewell-emoji-overlay")?.remove();
 const overlay=document.createElement("div");
 overlay.className="farewell-emoji-overlay";
 overlay.innerHTML='<button type="button" class="map-close farewell-emoji-back" aria-label="Kembali ke pilihan akhir percakapan">✕</button>'+
  '<div class="emoji-detail-symbol">'+esc(emoji)+'</div>'+
  '<p class="emoji-detail-description">'+esc(description)+'</p>';
 modal.appendChild(overlay);
 overlay.querySelector(".farewell-emoji-back").addEventListener("click",()=>overlay.remove());
}
function showFarewell(){
 if(!npc(state.world.active?.npcId))return;
 showModal('<h2>Akhiri percakapan?</h2><div class="farewell-choices" role="group" aria-label="Pilih kesan terakhir">'+
 '<button data-farewell="🙏" data-emoji-hold="🙏" aria-label="Hormat">🙏</button>'+
 '<button data-farewell="👎" data-emoji-hold="👎" aria-label="Buruk">👎</button>'+
 '<button data-farewell="🙂" data-emoji-hold="🙂" aria-label="Ramah">🙂</button>'+
 '<button data-farewell="😎" data-emoji-hold="😎" aria-label="Confident">😎</button>'+
 '</div><button class="secondary full" data-cancel-farewell>Batal</button>');
 modal.querySelectorAll(".farewell-choices [data-emoji-hold]").forEach(el=>
  bindEmojiHold(el,el.dataset.emojiHold,showFarewellEmojiDetail));
}
function finishConversation(endingEmoji){
 if(!state.world.active)return;
 try{
  finish(state.world,{farewellEmoji:endingEmoji});
 }catch(err){alert(err.message);return;}
 draft=[];pickerOpen=false;state.mapOpen=false;previousTab="explorer";
 save();modal.close();setTab("explorer");
}
function send(){
 if(!state.world.active||state.world.active.session.state.p<=0)return;
 try{beat(state.world,draft.map(t=>({...t})));}
 catch(err){alert(err.message);return;}
 draft=[];pickerOpen=false;save();render();
 const messages=view.querySelector(".chat-messages");
 if(messages)messages.scrollTop=messages.scrollHeight;
}
$("#closeModal").onclick=()=>modal.close();
function openSaveMenu(){
 showModal('<h2>Save · NPC Playtest</h2><p>Save point: Terminal. Harun dan Jali tersedia; Pasar Induk dan petunjuk Dimas sudah dikenal untuk menguji Ratih.</p><div class="actions"><button class="primary" id="exportButton">Export JSON</button><button class="secondary" id="importButton">Import</button></div><p><button class="secondary full" id="resetButton">Reset ke Save Point</button></p>');
}
modal.addEventListener("click",e=>{const choice=e.target.closest("[data-farewell]");if(choice){finishConversation(choice.dataset.farewell);return;}if(e.target.closest("[data-cancel-farewell]")){modal.close();return;}const id=e.target.id;if(id==="exportButton"){downloadSave(state);modal.close();}if(id==="importButton"){$("#importSave").click();modal.close();}if(id==="resetButton"&&confirm("Reset progres NPC Playtest ke Terminal? Save game lama tidak berubah.")){state=fresh();draft=[];pickerOpen=false;memoryFilter="all";previousTab="explorer";save();modal.close();render();}});
// Prevent accidental text selection/copy menus during press-and-hold gameplay.
// Not a security boundary: public HTML/JS assets remain inspectable.
function protectGameSurface(event){
 if(!event.target.closest("#view, #modal"))return;
 if(event.target.closest("input, textarea, select, [contenteditable], [data-allow-copy]"))return;
 event.preventDefault();
}
for(const type of ["contextmenu","copy","cut","dragstart","selectstart"]){
 document.addEventListener(type,protectGameSurface);
}
$("#importSave").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{state=parseSave(await file.text());draft=[];pickerOpen=false;previousTab="explorer";save();render();alert("Save NPC Playtest berhasil diimpor.");}catch(err){alert(err.message);}e.target.value="";});
render();
