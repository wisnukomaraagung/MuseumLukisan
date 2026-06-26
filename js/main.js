/**
 * main.js
 * Entry point – inisialisasi Three.js, loop animasi,
 * kontrol keyboard/mouse, deteksi interaksi artefak & lukisan,
 * dan manajemen GUI
 */

// ══════════════════════════════════════════════
//  SCENE SETUP
// ══════════════════════════════════════════════
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFShadowMap; // PCFSoft → PCF, lebih ringan
renderer.outputEncoding    = THREE.sRGBEncoding;
renderer.toneMapping       = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.75;
// Batasi pixel ratio — layar HiDPI bisa 2–3x beban render
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
document.body.appendChild(renderer.domElement);

const scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);
scene.fog = new THREE.Fog(0x0a0a0a, 20, 50);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 100);
camera.position.set(0, 1.7, 16); // Mulai di dekat pintu masuk

// ══════════════════════════════════════════════
//  CONTROLS
// ══════════════════════════════════════════════
const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
              || ('ontouchstart' in window);

const controls = new THREE.PointerLockControls(camera, renderer.domElement);
// Di mobile, jangan connect pointer lock sama sekali agar browser tidak memblokir
if (isMobile) controls.disconnect();
scene.add(controls.getObject());

const keys = {};
document.addEventListener('keydown', e => { keys[e.code] = true; });
document.addEventListener('keyup',   e => { keys[e.code] = false; });

// Klik canvas → lock pointer (desktop only)
if (!isMobile) {
  renderer.domElement.addEventListener('click', () => {
    if (!controls.isLocked) controls.lock();
  });
}

controls.addEventListener('unlock', () => {
  // Sembunyikan info panel saat pointer unlock (ESC)
});

// ══════════════════════════════════════════════
//  MUSEUM
// ══════════════════════════════════════════════
const museum = new Museum(scene);

// ══════════════════════════════════════════════
//  RAYCASTER untuk deteksi interaksi
// ══════════════════════════════════════════════
const raycaster  = new THREE.Raycaster();
const centerVec  = new THREE.Vector2(0, 0); // tengah layar
const INTERACT_DIST = 4.0; // jarak maksimum interaksi (meter)

// ══════════════════════════════════════════════
//  GUI ELEMENTS
// ══════════════════════════════════════════════
const loadingScreen = document.getElementById('loading-screen');
const loaderFill    = document.getElementById('loader-fill');
const infoPanel     = document.getElementById('info-panel');
const infoClose     = document.getElementById('info-close');
const infoIcon      = document.getElementById('info-icon');
const infoTitle     = document.getElementById('info-title');
const infoEra       = document.getElementById('info-era');
const infoOrigin    = document.getElementById('info-origin');
const infoDesc      = document.getElementById('info-desc');
const hintBar       = document.getElementById('hint-bar');
// ══════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════
let currentNearObj  = null;  // objek yang sedang dekat
let infoPanelOpen   = false;
let infoPanelData   = null;
let isAudioPlaying  = false;
let audioBtn        = null;
let walkSpeed       = 4;
const ROOM_BOUNDS   = { minX: -6.5, maxX: 6.5, minZ: -18, maxZ: 18 };

// ══════════════════════════════════════════════
//  INFO PANEL – tampilkan info + tombol audio
// ══════════════════════════════════════════════
function showInfoPanel(data) {
  NarasiAudio.stop();
  isAudioPlaying = false;

  infoIcon.textContent  = data.icon  || '🏛️';
  infoTitle.textContent = data.title || 'Artefak';
  infoEra.textContent   = `⏳ Era: ${data.era    || '–'}`;
  infoOrigin.textContent= `📍 Asal: ${data.origin || '–'}`;

  // Cek apakah ada audio btn sebelumnya
  if (audioBtn) audioBtn.remove();

  // Susun teks narasi suara lengkap dengan Metadata (Nama, Tahun, Asal, Era)
  let ttsText = "";
  const cleanNarasi = data.narasi.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  if (data.type === 'painting' || data.wall) {
    ttsText = `Lukisan ini berjudul ${data.title}. Dibuat pada tahun ${data.year || 'tidak diketahui'}. Karya atau asal: ${data.origin || 'tidak diketahui'}. Era: ${data.era || 'tidak diketahui'}. Berikut narasi lengkapnya: ${cleanNarasi}`;
  } else {
    ttsText = `Artefak ini bernama ${data.title}. Berasal dari tahun ${data.year || 'tidak diketahui'}. Asal: ${data.origin || 'tidak diketahui'}. Era: ${data.era || 'tidak diketahui'}. Berikut narasi lengkapnya: ${cleanNarasi}`;
  }

  // Tombol audio narasi
  audioBtn = document.createElement('button');
  audioBtn.id = 'audio-btn';
  audioBtn.innerHTML = '🔊 Dengarkan Narasi';
  audioBtn.style.cssText = `
    margin-top: 12px; padding: 8px 16px; border: 1px solid #c9a84c;
    background: rgba(124,79,30,0.5); color: #f0e6d0; border-radius: 6px;
    cursor: pointer; font-size: .85rem; width: 100%; transition: background .2s;
  `;
  audioBtn.onmouseover = () => audioBtn.style.background = 'rgba(124,79,30,0.85)';
  audioBtn.onmouseout  = () => {
    if (!isAudioPlaying) audioBtn.style.background = 'rgba(124,79,30,0.5)';
  };

  audioBtn.onclick = () => {
    const playing = NarasiAudio.toggle(ttsText, () => {
      isAudioPlaying = false;
      audioBtn.innerHTML = '🔊 Dengarkan Narasi';
      audioBtn.style.background = 'rgba(124,79,30,0.5)';
    });
    isAudioPlaying = playing;
    audioBtn.innerHTML = playing ? '⏹ Hentikan Narasi' : '🔊 Dengarkan Narasi';
    audioBtn.style.background = playing ? 'rgba(180,30,30,0.6)' : 'rgba(124,79,30,0.5)';
  };

  // Tampilkan teks deskripsi yang sudah rapi 4 kalimat di panel informasi UI
  infoDesc.textContent = cleanNarasi;
  infoPanel.appendChild(audioBtn);

  infoPanel.classList.remove('hidden');
  infoPanelOpen = true;
  infoPanelData = data;

  // Unlock pointer agar bisa klik tombol (desktop only)
  if (!isMobile) controls.unlock();
}

function hideInfoPanel() {
  NarasiAudio.stop();
  isAudioPlaying = false;
  infoPanel.classList.add('hidden');
  infoPanelOpen = false;
  infoPanelData = null;
}

infoClose.onclick = () => hideInfoPanel();

// ══════════════════════════════════════════════
//  KEYBOARD – Tekan E untuk interaksi
// ══════════════════════════════════════════════
document.addEventListener('keydown', e => {
  if (e.code === 'KeyE' && currentNearObj && (controls.isLocked || isMobile)) {
    const data = currentNearObj.userData.data;
    if (data) showInfoPanel(data);
  }
  if (e.code === 'Escape' && infoPanelOpen) hideInfoPanel();
});

// ════════════════════════════════════════════
//  COLLISION / BOUNDARY + ARTIFACT COLLISION
// ════════════════════════════════════════════
function clampPosition() {
  // Clamp ke batas dinding ruangan
  camera.position.x = Math.max(ROOM_BOUNDS.minX + 0.3, Math.min(ROOM_BOUNDS.maxX - 0.3, camera.position.x));
  camera.position.z = Math.max(ROOM_BOUNDS.minZ + 0.3, Math.min(ROOM_BOUNDS.maxZ - 0.3, camera.position.z));
  camera.position.y = 1.7; // tinggi tetap (no gravity untuk simplisitas)

  // Collision dengan pedestal artefak (circle vs point)
  const colliders = museum.getArtifactColliders();
  for (const col of colliders) {
    const dx = camera.position.x - col.x;
    const dz = camera.position.z - col.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const minDist = col.r + 0.35; // radius pedestal + radius pemain
    if (dist < minDist && dist > 0.001) {
      // Dorong pemain keluar dari radius collider
      const ratio = minDist / dist;
      camera.position.x = col.x + dx * ratio;
      camera.position.z = col.z + dz * ratio;
    }
  }

  // Collision rantai pembatas lingkaran artefak — dorong pemain keluar jika masuk area
  const barrier = museum.getBarrierCircle();
  const bdx  = camera.position.x - barrier.x;
  const bdz  = camera.position.z - barrier.z;
  const bdist = Math.sqrt(bdx * bdx + bdz * bdz);
  const bMin  = barrier.r - 0.35; // sisi dalam: tolak pemain yang masuk dari luar
  if (bdist < bMin && bdist > 0.001) {
    // Pemain masuk ke dalam lingkaran — dorong kembali ke tepi luar
    const ratio = bMin / bdist;
    camera.position.x = barrier.x + bdx * ratio;
    camera.position.z = barrier.z + bdz * ratio;
  }
}

// ══════════════════════════════════════════════
//  DETEKSI OBJEK TERDEKAT (raycaster + proximity fallback)
// ══════════════════════════════════════════════
function detectNearby() {
  raycaster.setFromCamera(centerVec, camera);
  const interactables = museum.getInteractables();
  if (!interactables.length) return;

  // --- Raycaster: arahkan ke tengah layar ---
  const hits = raycaster.intersectObjects(interactables, true);
  if (hits.length > 0 && hits[0].distance < INTERACT_DIST) {
    // Cari userData ke atas tree (termasuk parent Group)
    let obj = hits[0].object;
    while (obj && !obj.userData.data) obj = obj.parent;
    if (obj && obj.userData.data) {
      if (currentNearObj !== obj) {
        currentNearObj = obj;
        hintBar.classList.remove('hidden');
      }
      return;
    }
  }

  // --- Proximity fallback: cek jarak 3D ke semua artefak ---
  // Berguna untuk model dengan bounding box kecil (keris, kadita)
  // yang mudah terlewat raycaster
  const PROX_DIST = 2.5;
  const artifacts = MUSEUM_DATA.artifacts;
  for (const data of artifacts) {
    const dx = camera.position.x - data.position.x;
    const dz = camera.position.z - data.position.z;
    const dist2D = Math.sqrt(dx * dx + dz * dz);
    if (dist2D < PROX_DIST) {
      // Gunakan meshMap untuk mendapatkan mesh yang sudah terdaftar
      const mesh = museum.getMeshMap()[data.id];
      if (mesh && mesh.userData.data) {
        if (currentNearObj !== mesh) {
          currentNearObj = mesh;
          hintBar.classList.remove('hidden');
        }
        return;
      }
    }
  }

  currentNearObj = null;
  hintBar.classList.add('hidden');
}

// ══════════════════════════════════════════════
//  WINDOW RESIZE
// ══════════════════════════════════════════════
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ══════════════════════════════════════════════
//  MOVEMENT
// ══════════════════════════════════════════════
const velocity = new THREE.Vector3();
const clock    = new THREE.Clock();

function handleMovement(delta) {
  if (isMobile) {
    if (window._mobileMove) window._mobileMove(delta);
    else clampPosition();
    return;
  }
  if (!controls.isLocked) return;

  const speed  = walkSpeed * delta;
  const sprint = keys['ShiftLeft'] ? 1.8 : 1;

  if (keys['KeyW'] || keys['ArrowUp'])    controls.moveForward( speed * sprint);
  if (keys['KeyS'] || keys['ArrowDown'])  controls.moveForward(-speed * sprint);
  if (keys['KeyA'] || keys['ArrowLeft'])  controls.moveRight(  -speed * sprint);
  if (keys['KeyD'] || keys['ArrowRight']) controls.moveRight(   speed * sprint);

  clampPosition();
}

// ══════════════════════════════════════════════
//  BUILD MUSEUM + LOADING
// ══════════════════════════════════════════════
async function init() {
  await museum.build(progress => {
    loaderFill.style.width = (progress * 100) + '%';
  });

  // Fade out loading screen
  loadingScreen.classList.add('fade-out');
  setTimeout(() => { loadingScreen.style.display = 'none'; }, 700);

  // Mulai render loop
  animate();
}

// ══════════════════════════════════════════════
//  RENDER LOOP
// ══════════════════════════════════════════════
let _nearbyTick = 0;
function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);

  handleMovement(delta);

  // detectNearby cukup setiap 4 frame — tidak perlu tiap frame
  _nearbyTick++;
  if (_nearbyTick >= 4) { detectNearby(); _nearbyTick = 0; }

  renderer.render(scene, camera);
}

// ══════════════════════════════════════════════
//  DETEKSI MOBILE & KONTROL SENTUH
// ══════════════════════════════════════════════
if (isMobile) {
  // Tampilkan kontrol mobile, sembunyikan crosshair & hint keyboard
  document.getElementById('mobile-controls').classList.remove('hidden');
  document.getElementById('crosshair').style.display = 'none';

  // ── Joystick Virtual ──────────────────────
  const joystickZone  = document.getElementById('joystick-zone');
  const joystickThumb = document.getElementById('joystick-thumb');
  const joyBase       = document.getElementById('joystick-base');

  const joy = { active: false, id: null, startX: 0, startY: 0, dx: 0, dy: 0 };
  const JOY_RADIUS = 39; // px — radius maks thumb dari tengah

  joystickZone.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.changedTouches[0];
    joy.active = true;
    joy.id     = t.identifier;
    const rect = joyBase.getBoundingClientRect();
    joy.startX = rect.left + rect.width  / 2;
    joy.startY = rect.top  + rect.height / 2;
  }, { passive: false });

  document.addEventListener('touchmove', e => {
    if (!joy.active) return;
    for (const t of e.changedTouches) {
      if (t.identifier !== joy.id) continue;
      let dx = t.clientX - joy.startX;
      let dy = t.clientY - joy.startY;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > JOY_RADIUS) { dx = dx / len * JOY_RADIUS; dy = dy / len * JOY_RADIUS; }
      joy.dx = dx; joy.dy = dy;
      joystickThumb.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    }
  }, { passive: true });

  const resetJoy = () => {
    joy.active = false; joy.dx = 0; joy.dy = 0;
    joystickThumb.style.transform = 'translate(-50%, -50%)';
  };
  document.addEventListener('touchend',    e => { for (const t of e.changedTouches) if (t.identifier === joy.id) resetJoy(); });
  document.addEventListener('touchcancel', e => { for (const t of e.changedTouches) if (t.identifier === joy.id) resetJoy(); });

  // ── Look (Swipe sisi kanan layar) ─────────
  const look = { active: false, id: null, lastX: 0, lastY: 0 };
  const LOOK_SENS = 0.004;

  renderer.domElement.addEventListener('touchstart', e => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      // Hanya tangani sentuhan di sisi kanan (bukan area joystick)
      if (t.clientX > window.innerWidth * 0.35 && !look.active) {
        look.active = true;
        look.id     = t.identifier;
        look.lastX  = t.clientX;
        look.lastY  = t.clientY;
      }
    }
  }, { passive: false });

  renderer.domElement.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!look.active) return;
    for (const t of e.changedTouches) {
      if (t.identifier !== look.id) continue;
      const dx = t.clientX - look.lastX;
      const dy = t.clientY - look.lastY;
      look.lastX = t.clientX;
      look.lastY = t.clientY;

      // Putar kamera langsung lewat euler
      const euler = new THREE.Euler(0, 0, 0, 'YXZ');
      euler.setFromQuaternion(camera.quaternion);
      euler.y -= dx * LOOK_SENS;
      euler.x -= dy * LOOK_SENS;
      euler.x  = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, euler.x));
      camera.quaternion.setFromEuler(euler);
    }
  }, { passive: false });

  const resetLook = e => { for (const t of e.changedTouches) if (t.identifier === look.id) look.active = false; };
  renderer.domElement.addEventListener('touchend',    resetLook, { passive: true });
  renderer.domElement.addEventListener('touchcancel', resetLook, { passive: true });

  // ── Tombol Interaksi ──────────────────────
  document.getElementById('btn-interact').addEventListener('touchstart', e => {
    e.preventDefault();
    if (currentNearObj && currentNearObj.userData.data) {
      showInfoPanel(currentNearObj.userData.data);
    }
  }, { passive: false });

  // ── Override handleMovement untuk joystick ─
  // Simpan referensi fungsi gerak mobile, dipanggil dari animate()
  window._mobileMove = function(delta) {
    if (!joy.active || (joy.dx === 0 && joy.dy === 0)) {
      clampPosition(); return;
    }
    const JOY_MAX = JOY_RADIUS;
    const speed   = walkSpeed * delta;
    controls.moveForward(-(joy.dy / JOY_MAX) * speed);
    controls.moveRight(   (joy.dx / JOY_MAX) * speed);
    clampPosition();
  };

  // ── Hint bar → ganti teks untuk HP ────────
  document.getElementById('hint-text').innerHTML = '👁️ Tap tombol kanan untuk info';

  // ── detectNearby di mobile tetap berjalan ─
  // (tidak butuh isLocked karena HP tidak pakai pointer lock)
}

// ── Start ─────────────────────────────────────
init();
