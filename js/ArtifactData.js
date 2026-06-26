const MUSEUM_DATA = {
  
  // LUKISAN DINDING (kiri & kanan)

  paintings: [

    // ── DINDING KIRI ──────────────────────────
    {
      id: 'painting_01',
      title: 'Penangkapan Pangeran Diponegoro',
      year: '1857',
      origin: 'Raden Saleh – Pelukis Indonesia',
      era: 'Era Kolonial Belanda (1825–1830)',
      icon: '🎨',
      texture: 'textures/painting_diponegoro.jpg',
      fallbackColor: '#8B4513',
      wall: 'left',
      position: { x: -1, z: 0 },   // relatif, Museum.js akan atur
      narasi: `Lukisan karya Raden Saleh (1857) ini menggambarkan momen penangkapan Pangeran Diponegoro oleh Jenderal De Kock di Magelang secara licik. Raden Saleh melukiskan ekspresi keberanian sang pangeran sebagai bentuk perlawanan simbolis terhadap penjajah. Perang Diponegoro (1825–1830) merupakan salah satu perlawanan terbesar melawan kolonial Belanda. Lukisan bersejarah ini kini tersimpan di Istana Merdeka, Jakarta.`,
    },

    {
      id: 'painting_02',
      title: 'Kapal VOC di Pelabuhan Batavia',
      year: '1652',
      origin: 'Andries Beeckman – Pelukis Kolonial',
      era: 'Era VOC (1602–1799)',
      icon: '⛵',
      texture: 'textures/painting_voc.jpg',
      fallbackColor: '#4A6741',
      wall: 'left',
      position: { x: -1, z: 1 },
      narasi: `Lukisan ini menggambarkan Pelabuhan Batavia abad ke-17, pusat kekuasaan VOC di Asia yang didirikan Jan Pieterszoon Coen pada 1619. Pelabuhan ini menjadi jalur transit utama perdagangan rempah-rempah Nusantara menuju Eropa. VOC menguasai jalur niaga dengan monopoli ketat dan kekuatan militer. Kejayaan ini akhirnya runtuh pada akhir abad ke-18 akibat korupsi internal dan perlawanan rakyat.`,
    },

    {
      id: 'painting_03',
      title: 'Pertempuran Surabaya 10 November 1945',
      year: '1945',
      origin: 'Diorama Nasional – Koleksi Museum Pusat',
      era: 'Era Revolusi Kemerdekaan (1945–1949)',
      icon: '🔥',
      texture: 'textures/painting_surabaya.jpg',
      fallbackColor: '#8B0000',
      wall: 'left',
      position: { x: -1, z: 2 },
      narasi: `Pada 10 November 1945, pecah pertempuran dahsyat di Surabaya antara pejuang Indonesia melawan tentara Sekutu. Pertempuran dipicu tewasnya Brigadir Jenderal Mallaby dan penolakan ultimatum Sekutu oleh arek-arek Suroboyo. Bung Tomo membakar semangat juang melalui siaran radio hingga titik darah penghabisan. Peristiwa heroik ini diperingati setiap tahun sebagai Hari Pahlawan Nasional.`,
    },

    {
      id: 'painting_04',
      title: 'Kerajaan Majapahit – Kejayaan Nusantara',
      year: '1350',
      origin: 'Rekonstruksi Historis – Koleksi Museum',
      era: 'Era Kerajaan Hindu-Buddha (1293–1527)',
      icon: '👑',
      texture: 'textures/painting_majapahit.jpg',
      fallbackColor: '#DAA520',
      wall: 'left',
      position: { x: -1, z: 3 },
      narasi: `Majapahit mencapai puncak kejayaan abad ke-14 di bawah Raja Hayam Wuruk dan Mahapatih Gajah Mada. Gajah Mada bersumpah menyatukan seluruh Nusantara melalui Sumpah Palapa yang legendaris. Wilayah kekuasaannya membentang dari Sumatera, Jawa, Kalimantan, hingga Semenanjung Malaya. Kejayaan maritim dan budaya kerajaan ini menjadi inspirasi persatuan bangsa Indonesia hingga kini.`,
    },

    // ── DINDING BELAKANG (PANORAMIK) ──────────
    {
      id: 'painting_peta',
      title: 'Peta Nusantara Kuno',
      year: 'Abad ke-17 M',
      origin: 'Kartografi Eropa – Koleksi Arsip Nasional',
      era: 'Era VOC & Eksplorasi Maritim (1600–1700)',
      icon: '🗺️',
      texture: 'textures/painting_peta.jpg',
      fallbackColor: '#2F4F6F',
      wall: 'back',
      narasi: `Peta ini menggambarkan kepulauan Nusantara pada abad ke-17, dibuat oleh kartografer Eropa yang berlayar bersama armada VOC. Detail geografisnya mencakup Jawa, Sumatera, Kalimantan, Sulawesi, hingga Maluku penghasil rempah-rempah. Peta ini menjadi bukti betapa kayanya Nusantara sehingga menarik perhatian bangsa-bangsa Eropa. Kini ia menjadi dokumen sejarah tak ternilai tentang cara dunia memandang Nusantara di era kejayaan maritim.`,
    },

    // ── DINDING KANAN ─────────────────────────
    {
      id: 'painting_05',
      title: 'Proklamasi Kemerdekaan 17 Agustus 1945',
      year: '1945',
      origin: 'S. Sudjojono – Pelukis Realisme Indonesia',
      era: 'Proklamasi Kemerdekaan',
      icon: '🇮🇩',
      texture: 'textures/painting_proklamasi.jpg',
      fallbackColor: '#CC0000',
      wall: 'right',
      position: { x: 1, z: 0 },
      narasi: `Pada 17 Agustus 1945, Ir. Soekarno didampingi Drs. Mohammad Hatta memproklamasikan kemerdekaan Indonesia di Jakarta. Pembacaan teks proklamasi ini secara resmi mengakhiri masa penjajahan asing di Nusantara. Naskah proklamasi diketik Sayuti Melik setelah disepakati para tokoh bangsa. Momen ini menjadi tonggak berdirinya Negara Kesatuan Republik Indonesia yang merdeka dan berdaulat.`,
    },

    {
      id: 'painting_06',
      title: 'Borobudur – Warisan Dunia Dinasti Syailendra',
      year: '800 M',
      origin: 'Rekonstruksi Historis – UNESCO Heritage',
      era: 'Era Dinasti Syailendra (750–850 M)',
      icon: '🛕',
      texture: 'textures/painting_borobudur.jpg',
      fallbackColor: '#696969',
      wall: 'right',
      position: { x: 1, z: 1 },
      narasi: `Candi Borobudur dibangun abad ke-9 oleh Dinasti Syailendra sebagai monumen Buddha terbesar di dunia. Disusun dari ribuan batu andesit tanpa semen, candi ini menampilkan ribuan relief dan arca Buddha. Sempat terkubur abu vulkanik berabad-abad, candi ini ditemukan kembali oleh Raffles pada 1814. UNESCO menetapkannya sebagai Situs Warisan Dunia pada 1991.`,
    },

    {
      id: 'painting_07',
      title: 'Perang Padri – Tuanku Imam Bonjol',
      year: '1821',
      origin: 'Koleksi Museum Nasional Indonesia',
      era: 'Era Perang Padri (1803–1838)',
      icon: '⚔️',
      texture: 'textures/painting_padri.jpg',
      fallbackColor: '#2F4F4F',
      wall: 'right',
      position: { x: 1, z: 2 },
      narasi: `Perang Padri (1803–1838) berlangsung di Sumatera Barat antara kaum Padri, kaum Adat, dan pasukan Belanda. Tuanku Imam Bonjol memimpin perlawanan gerilya gigih dari benteng-benteng di Bukit Barisan. Belanda akhirnya menggunakan taktik tipu daya perundingan untuk menangkap sang pemimpin. Imam Bonjol diasingkan dan kini dihormati sebagai Pahlawan Nasional Indonesia.`,
    },

    {
      id: 'painting_08',
      title: 'Sultan Agung – Penyerangan Batavia 1628',
      year: '1628',
      origin: 'Rekonstruksi Historis – Koleksi Keraton Yogyakarta',
      era: 'Era Kesultanan Mataram (1613–1645)',
      icon: '🏰',
      texture: 'textures/painting_sultan_agung.jpg',
      fallbackColor: '#4B0082',
      wall: 'right',
      position: { x: 1, z: 3 },
      narasi: `Sultan Agung melancarkan serangan besar ke Batavia pada 1628 dan 1629 untuk mengusir VOC dari Nusantara. Pasukan Mataram mengepung kota namun terpaksa mundur karena logistik makanan dibakar musuh. Meski gagal merebut Batavia, serangan ini membuktikan ketangguhan militer kerajaan Nusantara. Sultan Agung juga mewariskan kalender Jawa dan karya sastra Serat Sastra Gending.`,
    },
  ],

  // ═══════════════════════════════════════════
  // ARTEFAK 3D DI TENGAH RUANGAN
  // ═══════════════════════════════════════════
  artifacts: [

    {
      id: 'artifact_gatotkaca',
      title: 'Gatotkaca – Ksatria Pringgondani',
      year: 'Abad ke-4 M',
      origin: 'Wayang Jawa – Mahabharata Nusantara',
      era: 'Era Kerajaan Hindu-Jawa',
      icon: '⚔️',
      fallbackColor: '#1A237E',
      model: 'models/gatotkaca.glb',
      modelScale: 0.8,
      position: { x: 0, y: 0, z: 5.5 },
      hasParticles: true,
      particleColor: 0x3F51B5,
      narasi: `Gatotkaca adalah tokoh pewayangan Jawa yang terkenal sebagai ksatria dari Pringgondani, putra Bima dan Dewi Arimbi. Ia dikenal memiliki kekuatan luar biasa dan kemampuan terbang tanpa sayap. Dalam epik Mahabharata versi Nusantara, Gatotkaca gugur heroik dalam Perang Kurukshetra melawan Karna. Sosok Gatotkaca menjadi simbol keberanian, pengorbanan, dan kesetiaan dalam budaya Jawa hingga hari ini.`,
    },

    {
      id: 'artifact_hanoman',
      title: 'Hanoman – Duta Sang Rama',
      year: 'Abad ke-3 M',
      origin: 'Wayang Jawa – Ramayana Nusantara',
      era: 'Era Kerajaan Hindu-Jawa',
      icon: '🐒',
      fallbackColor: '#FFFFFF',
      model: 'models/hanoman.glb',
      modelScale: 0.8,
      position: { x: -3.33, y: 0, z: 3.07 },
      hasParticles: true,
      particleColor: 0xFFFFFF,
      narasi: `Hanoman atau Anoman adalah tokoh kera putih suci dalam epik Ramayana yang diabadikan dalam tradisi wayang Nusantara. Sebagai panglima pasukan kera dan duta setia Rama, Hanoman memiliki kekuatan luar biasa, dapat terbang, dan mengubah ukuran tubuhnya. Ia berhasil menyusup ke kerajaan Alengka untuk menemukan Sinta yang diculik Rahwana. Hanoman melambangkan kesetiaan, ketangkasan, dan pengabdian tanpa pamrih dalam filosofi wayang Jawa.`,
    },

    {
      id: 'artifact_ganesha',
      title: 'Ganesha – Dewa Kebijaksanaan',
      year: 'Abad ke-9 M',
      origin: 'Jawa Tengah – Peninggalan Hindu',
      era: 'Era Kerajaan Mataram Kuno (732–1006 M)',
      icon: '🐘',
      fallbackColor: '#FF8F00',
      model: 'models/ganesha.glb',
      modelScale: 0.8,
      position: { x: 2.06, y: 0, z: -0.83 },
      hasParticles: true,
      particleColor: 0xFFD700,
      narasi: `Ganesha adalah dewa berkepala gajah dalam tradisi Hindu yang sangat populer di Nusantara, terutama pada masa kerajaan Hindu-Buddha. Dipuja sebagai dewa kebijaksanaan, ilmu pengetahuan, dan pelepas rintangan, arca Ganesha banyak ditemukan di situs-situs candi Jawa. Salah satu arca Ganesha paling terkenal adalah Ganesha dari Candi Prambanan dan Candi Singhasari. Kehadirannya menandai titik pertemuan budaya India dan lokal yang membentuk peradaban Nusantara yang kaya.`,
    },

    {
      id: 'artifact_kadita',
      title: 'Kadita – Putri Samudra Nusantara',
      year: 'Legenda Abad ke-7 M',
      origin: 'Legenda Sunda – Kerajaan Pesisir Selatan',
      era: 'Era Kerajaan Sunda Kuno',
      icon: '🌊',
      fallbackColor: '#006994',
      model: 'models/kadita.glb',
      modelScale: 0.8,
      position: { x: -2.06, y: 0, z: -0.83 },
      hasParticles: true,
      particleColor: 0x00BFFF,
      narasi: `Kadita atau Dewi Kadita adalah tokoh dalam legenda Sunda yang dikisahkan sebagai putri cantik dari seorang raja. Ia dikutuk oleh seorang penyihir menjadi perempuan berpenyakit kulit yang menjijikkan dan diusir dari istana. Dalam pengembaraannya, Kadita terjun ke Laut Selatan dan berubah menjadi Nyi Roro Kidul, Ratu Penguasa Laut Selatan. Legenda ini melambangkan penderitaan, transformasi jiwa, dan kekuatan mistis yang dalam budaya Nusantara.`,
    },

    {
      id: 'artifact_keris',
      title: 'Keris Tangguh – Pusaka Nusantara',
      year: 'Abad ke-14 M',
      origin: 'Jawa Tengah – Kerajinan Empu Tradisional',
      era: 'Era Kerajaan Majapahit (1293–1527 M)',
      icon: '🗡️',
      fallbackColor: '#808080',
      model: 'models/keris.glb',
      modelScale: 0.6,
      position: { x: 3.33, y: 0, z: 3.07 },
      hasParticles: true,
      particleColor: 0xC0C0C0,
      narasi: `Keris adalah senjata tikam khas Nusantara yang memiliki nilai budaya, spiritual, dan artistik yang sangat tinggi. Setiap keris dibuat oleh seorang empu dengan proses tempa yang penuh ritual dan meditasi spiritual. Bilah kerisnya yang berkelok disebut luk, dan setiap jumlah luk memiliki makna dan tuah yang berbeda-beda. UNESCO telah mengakui keris sebagai Warisan Budaya Takbenda Kemanusiaan dari Indonesia pada tahun 2005.`,
    },

  ],
};

// ── Web Speech API – Narasi Audio ─────────────
const NarasiAudio = {
  synth: window.speechSynthesis,
  currentUtterance: null,
  isPlaying: false,

  speak(text, onEnd) {
    this.stop();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang  = 'id-ID';
    utter.rate  = 0.92;
    utter.pitch = 1.0;
    utter.volume = 1.0;

    // Pilih suara Bahasa Indonesia jika tersedia
    const voices = this.synth.getVoices();
    const idVoice = voices.find(v => v.lang === 'id-ID') ||
                    voices.find(v => v.lang.startsWith('id')) ||
                    voices.find(v => v.name.toLowerCase().includes('indonesia'));
    if (idVoice) utter.voice = idVoice;

    utter.onend = () => {
      this.isPlaying = false;
      if (onEnd) onEnd();
    };
    utter.onerror = () => { this.isPlaying = false; };

    this.currentUtterance = utter;
    this.isPlaying = true;
    this.synth.speak(utter);
  },

  stop() {
    this.synth.cancel();
    this.isPlaying = false;
    this.currentUtterance = null;
  },

  toggle(text, onEnd) {
    if (this.isPlaying) { this.stop(); return false; }
    this.speak(text, onEnd);
    return true;
  }
};
