// Placeholder content: change worldbuilding here without editing the engine.
export const locations=[
{id:"kota",name:"Kota",parent:null,access:"start",description:"Kota besar yang belum kamu kenal."},
{id:"niaga",name:"Niaga",parent:"kota",access:"start",description:"Pusat perdagangan dan pertukaran kabar."},
{id:"pasar",name:"Pasar",parent:"niaga",access:"start",description:"Keramaian, dagangan, dan percakapan."},
{id:"warung",name:"Warung",parent:"niaga",access:"start",description:"Tempat orang duduk dan bertukar kabar."},
{id:"pertokoan",name:"Pertokoan",parent:"niaga",access:"public",description:"Deretan toko dan jasa."},
{id:"pergudangan",name:"Pergudangan",parent:"niaga",access:"limited",description:"Area distribusi dengan akses terbatas."},
{id:"pasar_gelap",name:"Pasar Gelap",parent:"niaga",access:"secret",description:"Jaringan perdagangan tersembunyi."},
{id:"permukiman",name:"Permukiman",parent:"kota",access:"start",description:"Kawasan warga dan pendatang."},
{id:"penginapan",name:"Penginapan",parent:"permukiman",access:"start",description:"Tempat singgah orang yang baru datang."},
{id:"rumah_warga",name:"Rumah Warga",parent:"permukiman",access:"public",description:"Rumah keluarga setempat."},
{id:"industri",name:"Industri",parent:"kota",access:"public",description:"Kegiatan produksi dan perbaikan."},
{id:"tempat_kerja",name:"Tempat Kerja",parent:"industri",access:"public",description:"Pekerjaan yang dahulu dijanjikan kepadamu."},
{id:"bengkel",name:"Bengkel",parent:"industri",access:"public",description:"Peralatan dan teknisi."},
{id:"pemerintahan",name:"Pemerintahan",parent:"kota",access:"public",description:"Institusi yang mengatur kehidupan kota."},
{id:"kantor_administrasi",name:"Kantor Administrasi",parent:"pemerintahan",access:"public",description:"Dokumen dan urusan warga."},
{id:"markas_militer",name:"Markas Militer",parent:"pemerintahan",access:"limited",description:"Fasilitas militer."},
{id:"pendidikan",name:"Pendidikan & Tradisi",parent:"kota",access:"public",description:"Pengetahuan, ajaran, dan arsip."},
{id:"perpustakaan",name:"Perpustakaan",parent:"pendidikan",access:"public",description:"Naskah dan sejarah."},
{id:"fasilitas",name:"Fasilitas Publik",parent:"kota",access:"public",description:"Ruang bersama warga."},
{id:"lapangan",name:"Lapangan",parent:"fasilitas",access:"public",description:"Ruang terbuka."},
{id:"pinggiran",name:"Pinggiran",parent:"kota",access:"public",description:"Daerah di sekitar pusat kota."},
{id:"kampung",name:"Kampung",parent:"pinggiran",access:"public",description:"Permukiman luar kota."}
];
export const information=[
{id:"kota",name:"Kota",type:"Location",facts:["Kamu berada di sebuah kota asing.","Kota terdiri dari beragam kawasan dan institusi."]},
{id:"pasar",name:"Pasar",type:"Location",facts:["Kamu tahu ada sebuah pasar.","Pasar menjadi tempat bertemunya pedagang dan warga.","Berita sering berpindah dari mulut ke mulut di sini."]},
{id:"warung",name:"Warung",type:"Location",facts:["Ada warung tempat warga berkumpul.","Orang datang bukan hanya untuk makan, tetapi juga berbincang."]},
{id:"penginapan",name:"Penginapan",type:"Location",facts:["Pendatang bisa mencari tempat singgah di sini."]},
{id:"pelabuhan",name:"Pelabuhan",type:"Location",facts:["Kamu pernah mendengar tentang pelabuhan."]},
{id:"kultus",name:"Kultus",type:"Faction",facts:["Ada desas-desus tentang kelompok bernama Kultus.","Kelompok ini dikabarkan menyelidiki teknologi terlarang."]},
{id:"militer",name:"Militer",type:"Faction",facts:["Militer bertugas menjaga keamanan.","Mereka juga melakukan pengawasan dan intelijen."]},
{id:"otoritas",name:"Otoritas Teknologi",type:"Faction",facts:["Penggunaan teknologi diatur oleh otoritas.","Izin mengendalikan produksi dan perpindahan teknologi."]},
{id:"saudagar",name:"Saudagar",type:"Faction",facts:["Saudagar menggerakkan perdagangan kota."]},
{id:"perantara",name:"Perantara",type:"Faction",facts:["Perantara menghubungkan perdagangan antarkota."]},
{id:"pemberontak",name:"Pemberontak",type:"Faction",facts:["Ada gerakan yang menentang tatanan saat ini."]},
{id:"kawasan_lama",name:"Kawasan Lama",type:"Location",facts:["Ada wilayah bekas peradaban terdahulu yang terlarang."]},
{id:"malam",name:"Malam",type:"Time",facts:["Malam adalah waktu ketika kegiatan kota berkurang."]},
{id:"pagi",name:"Pagi",type:"Time",facts:["Hari baru dimulai."]},
{id:"siang",name:"Siang",type:"Time",facts:["Kegiatan kota sedang berlangsung."]},
{id:"sore",name:"Senja",type:"Time",facts:["Hari mulai gelap."]}
];
export const relations=[
{id:"pasar__saudagar",a:"pasar",b:"saudagar",facts:["Saudagar memperdagangkan barang di pasar."]},
{id:"warung__pasar",a:"warung",b:"pasar",facts:["Warung menjadi tempat berbincang dekat pasar."]},
{id:"militer__kultus",a:"militer",b:"kultus",facts:["Militer memburu kelompok Kultus."]},
{id:"kultus__kawasan_lama",a:"kultus",b:"kawasan_lama",facts:["Ada rumor yang menghubungkan Kultus dengan peninggalan peradaban lama."]},
{id:"pasar__malam",a:"pasar",b:"malam",facts:["Aktivitas pasar berubah pada malam hari."]}
];
export const npcs=[
{id:"pedagang",name:"Pedagang",location:"pasar",description:"Seorang pedagang yang memperhatikan setiap pembeli.",initial:{v:6,d:5,p:8},knowledge:{pasar:4,warung:3,saudagar:4,militer:1,malam:2,pasar__saudagar:2},topics:["pasar","saudagar","warung"],openness:7},
{id:"penjaga",name:"Penjaga",location:"pasar",description:"Penjaga yang mengawasi arus orang dan barang.",initial:{v:4,d:8,p:7},knowledge:{pasar:3,militer:5,otoritas:3,kultus:2,pasar__malam:2,militer__kultus:3},topics:["militer","pasar","otoritas"],openness:3},
{id:"perantau",name:"Perantau",location:"warung",description:"Sesama pendatang yang tampak ingin berbicara.",initial:{v:6,d:3,p:9},knowledge:{kota:2,warung:3,pasar:2,penginapan:3,kawasan_lama:1,malam:1},topics:["warung","penginapan","kota"],openness:8},
{id:"pemilik",name:"Pemilik Penginapan",location:"penginapan",description:"Pemilik yang mengenal banyak pendatang.",initial:{v:5,d:6,p:8},knowledge:{penginapan:4,kota:3,warung:2,pasar:2,perantara:2},topics:["penginapan","perantara"],openness:6}
];
export const emojis=["😡","🤨","😎","🙁","😐","🙂","😟","😔","🥺","❤️","👍","👎","🙏","🫵","🤣","❓","❗","💤","🤫","🤔","💡"];
// Player-facing meanings; shared by sent, received, and selectable emoji.
export const emojiDescriptions={
  "😡": "Kemarahan, amarah, permusuhan, agresivitas.",
  "🤨": "Kecurigaan, keraguan, ketidakpercayaan.",
  "😎": "Keyakinan diri, keberanian, keteguhan, kemandirian.",
  "🙁": "Ketidaksukaan, ketidakpuasan, kekecewaan.",
  "😐": "Ketidakberpihakan, ketidakpedulian, sikap datar.",
  "🙂": "Keramahan, keakraban, kesukaan.",
  "😟": "Kekhawatiran, kecemasan, ketakutan, kegelisahan.",
  "😔": "Kesedihan, penyesalan, kehilangan, penderitaan.",
  "🥺": "Permohonan, kekaguman, belas kasihan, kerendahan diri.",
  "❤️": "Kecintaan, kesukaan mendalam, dukungan penuh.",
  "👍": "Persetujuan, dukungan, pembenaran.",
  "👎": "Penolakan, pertentangan, ketidaksetujuan.",
  "🙏": "Penghormatan, penghargaan, pengakuan superioritas.",
  "🫵": "Tekanan, intimidasi, tuntutan, dominasi.",
  "🤣": "Kelucuan, humor, ejekan, penghinaan.",
  "❓": "Pertanyaan, kebingungan, ketidaktahuan, rasa ingin tahu.",
  "❗": "Penekanan, keseriusan, ketegasan, urgensi.",
  "💤": "Kebosanan, kejenuhan, kelelahan, kehilangan minat.",
  "🤫": "Kerahasiaan, kehati-hatian, penyembunyian informasi.",
  "🤔": "Pertimbangan, kebingungan, perenungan, ketidakpastian.",
  "💡": "Pemahaman, kesadaran baru, penemuan, inspirasi."
};
export const byId=id=>information.find(x=>x.id===id);
export const relationId=(a,b)=>relations.find(x=>(x.a===a&&x.b===b)||(x.a===b&&x.b===a))?.id;
