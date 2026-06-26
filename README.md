# 🏛️ Museum Sejarah Nusantara – Virtual 3D
### Proyek Akhir Grafika Komputer | Three.js

---

## 📁 Struktur Folder

```
museum-sejarah/
├── index.html                  ← Entry point utama
├── css/
│   └── style.css               ← Styling HUD & GUI
├── js/
│   ├── PointerLockControls.js  ← Kontrol kamera first-person
│   ├── ParticleSystem.js       ← Sistem partikel (aura, debu, skylight)
│   ├── ArtifactData.js         ← Data lukisan & artefak + Web Speech API
│   ├── Museum.js               ← Builder scene 3D museum
│   └── main.js                 ← Game loop, input, interaksi, GUI
└── textures/                   ← ⬅️ UPLOAD TEKSTUR DI SINI
    ├── floor_parket.jpg        ← Lantai parket kayu
    ├── wall_wood.jpg           ← Dinding panel kayu atas
    ├── wall_wood_dark.jpg      ← Wainscoting (panel kayu bawah)
    ├── ceiling_ornament.jpg    ← Langit-langit ornamen hijau
    │
    ├── painting_diponegoro.jpg ← Lukisan Penangkapan Diponegoro
    ├── painting_voc.jpg        ← Kapal VOC Batavia
    ├── painting_surabaya.jpg   ← Pertempuran Surabaya 10 Nov
    ├── painting_majapahit.jpg  ← Kerajaan Majapahit
    ├── painting_proklamasi.jpg ← Proklamasi 17 Agustus
    ├── painting_borobudur.jpg  ← Borobudur
    ├── painting_padri.jpg      ← Perang Padri – Imam Bonjol
    ├── painting_sultan_agung.jpg← Sultan Agung Batavia
    │
    ├── artifact_keris.jpg      ← Tekstur keris pusaka
    ├── artifact_gerabah.jpg    ← Tekstur gerabah Majapahit
    └── artifact_topeng.jpg     ← Tekstur topeng Barong Bali
```

---

## 🎮 Cara Bermain

| Tombol | Fungsi |
|--------|--------|
| **Klik** canvas | Kunci kursor (masuk mode jalan) |
| **W/A/S/D** atau **Arrow** | Jalan maju/mundur/kiri/kanan |
| **Mouse** | Lihat ke sekitar |
| **E** | Buka info artefak/lukisan (saat dekat) |
| **Shift + W/S** | Sprint |
| **ESC** | Buka kursor / tutup panel |

---

## ✅ Fitur Sesuai Spesifikasi Soal

| Syarat | Implementasi |
|--------|-------------|
| Objek 3D | Keris, Gerabah, Topeng Barong (LatheGeometry, CylinderGeometry, SphereGeometry) |
| Texture Mapping | Load dari folder `textures/` dengan THREE.TextureLoader |
| Pencahayaan (Lighting) | AmbientLight + DirectionalLight (skylight) + SpotLight (picture light per lukisan) + PointLight (lampu gantung) |
| Kontrol Keyboard & Mouse | WASD + PointerLockControls (mouse look) |
| GUI | HUD dengan panel info, minimap, control panel, hint bar |
| Particle System | 3 jenis: Aura artefak, Debu ambient, Beam skylight + Burst saat interaksi |
| Physics Engine | Collision boundary (clamp posisi) + kecepatan gerak |
| Pathfinding | Navigasi bebas dalam batas ruangan museum |

---

## 🔊 Sistem Audio Narasi

Menggunakan **Web Speech API** (bawaan browser) dengan suara Bahasa Indonesia:
- Pilih suara `id-ID` jika tersedia di sistem
- Fallback ke suara default browser
- Tekan tombol **"Dengarkan Narasi"** di info panel
- Tombol berubah jadi **"Hentikan Narasi"** saat audio berjalan

> **Tips:** Browser Chrome/Edge memiliki suara Indonesia terbaik.
> Pastikan volume tidak di-mute.

---

## 🖼️ Upload Tekstur

1. Siapkan gambar format **JPG atau PNG**
2. Rename sesuai nama file di tabel atas
3. Taruh di folder **`textures/`**
4. Refresh browser

> Jika tekstur tidak tersedia → otomatis fallback ke **warna solid** agar tetap bisa dilihat.

### Rekomendasi Tekstur:
- **Lantai parket**: cari "wood parquet floor texture"
- **Dinding kayu**: cari "wood panel wall texture"
- **Langit-langit**: cari "ornate ceiling texture green"
- **Lukisan**: download dari Wikipedia Commons (bebas hak cipta)

---

## 🚀 Cara Menjalankan

### Option 1 – VS Code Live Server (Direkomendasikan)
1. Install ekstensi **Live Server** di VS Code
2. Klik kanan `index.html` → **Open with Live Server**
3. Browser otomatis terbuka

### Option 2 – Python HTTP Server
```bash
cd museum-sejarah
python -m http.server 8080
# Buka browser: http://localhost:8080
```

### Option 3 – Node.js
```bash
npx serve museum-sejarah
```

> ⚠️ **Tidak bisa dibuka langsung** dengan `file://` karena Three.js butuh HTTP server untuk load tekstur.

---

## 📚 Teknologi yang Digunakan

- **Three.js r128** – Rendering 3D WebGL
- **Web Speech API** – Text-to-Speech narasi Bahasa Indonesia
- **PointerLockControls** – Kontrol kamera first-person
- **HTML5 Canvas** – Minimap
- **CSS3** – HUD overlay & animasi

---

*Museum Sejarah Nusantara – Mengenal Sejarah Bangsa Melalui Teknologi*
