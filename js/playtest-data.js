/**
 * Adapter only: reuse the existing Explorer/Chat/Memory presentation for
 * the Rantau three-NPC playtest. The old placeholder data remains untouched.
 */
import {pages,npcs as npcTable} from './game/content/playtest-npcs.js';
import {EMOJI_VALUES} from './game/conversation/emoji-profiles.js';
import {emojiDescriptions as legacyDescriptions} from './data.js';

export const locations=Object.entries(pages).filter(([,p])=>p.type==='Location')
 .map(([id,p])=>({id,name:p.name,parent:null,access:'public',
  description:({
   terminal:'Terminal tempat para pendatang tiba dan mencari kabar.',
   pasar_induk:'Pusat perdagangan dan tempat orang saling bertukar informasi.',
   kawasan_industri:'Tempat orang mencari pekerjaan dan penghidupan.',
   pelabuhan:'Jalur kedatangan, keberangkatan, dan pengiriman barang.',
   kampung_kota:'Permukiman para pendatang di tengah kota.',
   kampung_halaman:'Tempat asal Player, jauh dari kota rantau.'
  })[id]||'Bagian kota yang belum banyak kamu ketahui.'}));
export const information=Object.entries(pages).filter(([,p])=>p.type!=='Relationship')
 .map(([id,p])=>({id,name:p.name,type:p.type,facts:[]}));
export const relations=Object.entries(pages).filter(([,p])=>p.type==='Relationship')
 .map(([id,p])=>({id,a:p.a,b:p.b,facts:[]}));
export const npcs=Object.entries(npcTable).map(([id,npc])=>({
 id,name:npc.name,location:npc.location,description:npc.role,
 initial:npc.initial
}));
export const emojis=[...EMOJI_VALUES];
export const emojiDescriptions={...legacyDescriptions,
 '📍':'Pertanyaan tentang lokasi atau keberadaan.',
 '⏳':'Pertanyaan tentang waktu atau kapan sesuatu terjadi.',
 '👥':'Pertanyaan tentang siapa atau kelompok yang terkait.'};
export const byId=id=>information.find(p=>p.id===id);
