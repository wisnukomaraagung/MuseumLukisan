/**
 * Museum.js
 * Membangun scene 3D museum sejarah Nusantara
 * Layout: ruangan panjang, dinding lukisan kiri-kanan, artefak di tengah
 * Tekstur: load dari folder textures/ (upload manual)
 */

class Museum {
  constructor(scene) {
    this.scene = scene;
    this.textureLoader = new THREE.TextureLoader();
    this.interactables = []; // semua objek yang bisa di-E
    this.meshMap = {}; // id → mesh
    this.artifactColliders = []; // posisi + radius setiap pedestal untuk collision

    // Ukuran ruangan (referensi gambar museum klasik)
    this.ROOM = {
      W: 14,   // lebar
      H: 6,    // tinggi
      D: 36,   // panjang (kedalaman)
    };
  }

  // ══════════════════════════════════════════════
  //  LOAD TEXTURE HELPER
  // ══════════════════════════════════════════════
  loadTex(path, fallbackColor) {
    return new Promise(resolve => {
      // Deteksi file:// protocol – TextureLoader tidak bisa load dari file://
      if (window.location.protocol === 'file:') {
        console.warn(`[Museum] Berjalan via file://, tekstur tidak dapat dimuat: ${path}. Gunakan HTTP server (Live Server / python -m http.server).`);
        resolve(null);
        return;
      }
      this.textureLoader.load(
        path,
        tex => {
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
          // Wajib di-set agar match dengan renderer.outputEncoding = sRGBEncoding
          tex.encoding = THREE.sRGBEncoding;
          tex.needsUpdate = true;
          resolve(tex);
        },
        undefined,
        (err) => {
          console.warn(`[Museum] Gagal load tekstur: ${path}`, err);
          resolve(null);
        }
      );
    });
  }

  matFromTex(tex, fallbackColor, repeat = [1, 1], opts = {}) {
    if (tex) {
      tex.repeat.set(...repeat);
      tex.needsUpdate = true;
      return new THREE.MeshStandardMaterial({ map: tex, ...opts });
    }
    return new THREE.MeshStandardMaterial({ color: fallbackColor, ...opts });
  }

  // ══════════════════════════════════════════════
  //  BUILD SELURUH MUSEUM
  // ══════════════════════════════════════════════
  async build(onProgress) {
    let step = 0;
    const total = 7;
    const prog = () => { step++; if (onProgress) onProgress(step / total); };

    await this._buildFloor(); prog();
    await this._buildWalls(); prog();
    await this._buildCeiling(); prog();
    await this._buildSkylight(); prog();
    await this._buildPaintings(); prog();
    await this._buildArtifacts(); prog();
    this._buildLighting(); prog();
  }


  // ══════════════════════════════════════════════
  //  LANTAI PARKET (herringbone pattern)
  // ══════════════════════════════════════════════
  async _buildFloor() {
    const tex = await this.loadTex('textures/floor_parket.jpg', '#B8860B');

    // Lantai utama — roughness tinggi agar tidak terlalu reflektif, ikuti warna asli tekstur
    const geo = new THREE.PlaneGeometry(this.ROOM.W, this.ROOM.D, 1, 1);
    const mat = this.matFromTex(tex, '#7A5C2E', [6, 14], {
      roughness: 0.88,   // matte seperti kayu parket asli
      metalness: 0.0,    // lantai kayu bukan logam
      color: 0x999999,   // kurangi kecerahan dasar material agar tidak washed-out
    });
    if (!tex) { mat.color = new THREE.Color('#7A5C2E'); }
    const floor = new THREE.Mesh(geo, mat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);


  }

  // ══════════════════════════════════════════════
  //  DINDING
  // ══════════════════════════════════════════════
  async _buildWalls() {
    const tex = await this.loadTex('textures/wall_wood.jpg', '#8B7355');

    const W = this.ROOM.W, H = this.ROOM.H, D = this.ROOM.D;

    // Satu material untuk dinding kiri & kanan (panjang = D)
    const matSide = tex
      ? new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, metalness: 0.0 })
      : new THREE.MeshStandardMaterial({ color: '#8B7355', roughness: 0.85, metalness: 0.0 });
    if (tex) { tex.repeat.set(D / H, 1); tex.needsUpdate = true; }

    // Dinding kiri
    const left = new THREE.Mesh(new THREE.PlaneGeometry(D, H), matSide);
    left.rotation.y = Math.PI / 2;
    left.position.set(-W / 2, H / 2, 0);
    left.receiveShadow = true;
    this.scene.add(left);

    // Dinding kanan — share material karena repeat sama
    const right = new THREE.Mesh(new THREE.PlaneGeometry(D, H), matSide);
    right.rotation.y = -Math.PI / 2;
    right.position.set(W / 2, H / 2, 0);
    right.receiveShadow = true;
    this.scene.add(right);

    // Load tekstur terpisah untuk dinding depan & belakang (lebar = W)
    const texFB = await this.loadTex('textures/wall_wood.jpg', '#8B7355');
    const matFB = texFB
      ? new THREE.MeshStandardMaterial({ map: texFB, roughness: 0.85, metalness: 0.0 })
      : new THREE.MeshStandardMaterial({ color: '#8B7355', roughness: 0.85, metalness: 0.0 });
    if (texFB) { texFB.repeat.set(W / H, 1); texFB.needsUpdate = true; }

    // Dinding belakang (penuh, tanpa jendela)
    const wallBackMat = matFB;
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallBackMat);
    backWall.position.set(0, H / 2, -D / 2);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    // Wainscoting dinding belakang
    const wainTexBack = await this.loadTex('textures/wall_wood_dark_.jpg', '#5C4A28');
    const matWainBack = wainTexBack
      ? new THREE.MeshStandardMaterial({ map: wainTexBack, roughness: 0.9, metalness: 0.0 })
      : new THREE.MeshStandardMaterial({ color: '#5C4A28', roughness: 0.9, metalness: 0.0 });
    if (wainTexBack) { wainTexBack.repeat.set(W / 1.5, 1); wainTexBack.needsUpdate = true; }

    const WAIN_H_BACK = 1.5;
    const wainBack = new THREE.Mesh(new THREE.PlaneGeometry(W, WAIN_H_BACK), matWainBack);
    wainBack.position.set(0, WAIN_H_BACK / 2, -D / 2 + 0.005);
    wainBack.receiveShadow = true;
    this.scene.add(wainBack);

    // Molding strip atas wainscoting belakang
    const moldBackMat = new THREE.MeshStandardMaterial({ color: '#C8A96E', roughness: 0.5 });
    const moldBack = new THREE.Mesh(new THREE.BoxGeometry(W, 0.08, 0.06), moldBackMat);
    moldBack.position.set(0, WAIN_H_BACK + 0.04, -D / 2 + 0.005);
    this.scene.add(moldBack);

    // Baseboard bawah dinding belakang
    const baseBack = new THREE.Mesh(
      new THREE.BoxGeometry(W, 0.15, 0.08),
      new THREE.MeshStandardMaterial({ color: '#C8A96E', roughness: 0.6 })
    );
    baseBack.position.set(0, 0.075, -D / 2 + 0.005);
    this.scene.add(baseBack);

    // ── Lukisan Panoramik Tembok Belakang ──────
    // Ukuran: ~48% lebar dinding, lebih kecil dan proporsional
    const PANO_W    = W * 0.48;         // ~6.7m
    const PANO_YBOT = 1.5 + 0.18;       // tepat di atas molding strip wainscoting
    const PANO_YTOP = H - 0.9;          // lebih pendek dari sebelumnya
    const PANO_H    = PANO_YTOP - PANO_YBOT;
    const PANO_CY   = PANO_YBOT + PANO_H / 2;
    const PANO_Z    = -D / 2 + 0.04;    // menjorok sedikit dari tembok

    const panoTex = await this.loadTex('textures/painting_peta.jpg', '#2F4F6F');
    const panoCanvasMat = panoTex
      ? new THREE.MeshStandardMaterial({ map: panoTex, roughness: 0.6, metalness: 0.0 })
      : new THREE.MeshStandardMaterial({ color: '#2F4F6F', roughness: 0.6 });

    // Kanvas lukisan — daftarkan sebagai interactable agar bisa ditekan E
    const panoData = MUSEUM_DATA.paintings.find(p => p.id === 'painting_peta');
    const panoCanvas = new THREE.Mesh(new THREE.PlaneGeometry(PANO_W, PANO_H), panoCanvasMat);
    panoCanvas.position.set(0, PANO_CY, PANO_Z);
    if (panoData) {
      panoCanvas.userData = { type: 'painting', id: 'painting_peta', data: panoData };
      this.interactables.push(panoCanvas);
      this.meshMap['painting_peta'] = panoCanvas;
    }
    this.scene.add(panoCanvas);

    // Kaca pelindung lukisan (tipis transparan di depan kanvas)
    const panoGlassMat = new THREE.MeshStandardMaterial({
      color: 0xCCEEFF,
      transparent: true,
      opacity: 0.12,
      roughness: 0.0,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const panoGlass = new THREE.Mesh(new THREE.PlaneGeometry(PANO_W, PANO_H), panoGlassMat);
    panoGlass.position.set(0, PANO_CY, PANO_Z + 0.025); // 2.5cm di depan kanvas
    this.scene.add(panoGlass);

    // Bingkai kuningan mengelilingi lukisan
    const panoFrameMat = new THREE.MeshStandardMaterial({ color: '#C8A96E', roughness: 0.3, metalness: 0.7 });
    const pFT = 0.055; // ketebalan bingkai
    const pFD = 0.04;  // kedalaman bingkai
    // Atas & bawah
    [PANO_YTOP + pFT / 2, PANO_YBOT - pFT / 2].forEach(fy => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(PANO_W + pFT * 2, pFT, pFD), panoFrameMat);
      bar.position.set(0, fy, PANO_Z + 0.02);
      this.scene.add(bar);
    });
    // Kiri & kanan
    [-(PANO_W / 2 + pFT / 2), (PANO_W / 2 + pFT / 2)].forEach(fx => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(pFT, PANO_H + pFT * 2, pFD), panoFrameMat);
      bar.position.set(fx, PANO_CY, PANO_Z + 0.02);
      this.scene.add(bar);
    });

    // Label nama lukisan di bawah bingkai (sama persis style lukisan dinding kiri/kanan)
    // Ukuran plane disesuaikan dengan aspek ratio canvas 512x128 (4:1) agar teks tidak meregang
    const panoLabelTex = this.createLabelTexture('Peta Nusantara Kuno');
    const panoLabel = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 0.45),  // aspek ratio 4:1 sesuai canvas 512x128
      new THREE.MeshStandardMaterial({ map: panoLabelTex, roughness: 0.8 })
    );
    panoLabel.position.set(0, PANO_YBOT - pFT - 0.26, PANO_Z + 0.025);
    this.scene.add(panoLabel);

    // Lampu sorot lukisan panoramik (dua titik agar merata)
    [-PANO_W / 4, PANO_W / 4].forEach(ox => {
      const panoSpot = new THREE.SpotLight(0xFFF5CC, 1.5, 7, Math.PI / 6, 0.45);
      panoSpot.castShadow = false;
      panoSpot.position.set(ox, H - 0.4, -D / 2 + 2.0);
      panoSpot.target.position.set(ox, PANO_CY, PANO_Z);
      this.scene.add(panoSpot);
      this.scene.add(panoSpot.target);
    });

    // Dinding depan (dengan pintu masuk di tengah)
    const texFront = await this.loadTex('textures/wall_wood.jpg', '#8B7355');
    const matFront = texFront
      ? new THREE.MeshStandardMaterial({ map: texFront, roughness: 0.85, metalness: 0.0 })
      : new THREE.MeshStandardMaterial({ color: '#8B7355', roughness: 0.85, metalness: 0.0 });
    if (texFront) { texFront.repeat.set(W / H, 1); texFront.needsUpdate = true; }

    // Tembok kiri depan
    const frontLeft = new THREE.Mesh(new THREE.PlaneGeometry((W - 2.4) / 2, H), matFront);
    frontLeft.rotation.y = Math.PI;
    frontLeft.position.set(-(W - 2.4) / 4 - 1.2, H / 2, D / 2);
    frontLeft.receiveShadow = true;
    this.scene.add(frontLeft);

    // Tembok kanan depan
    const frontRight = new THREE.Mesh(new THREE.PlaneGeometry((W - 2.4) / 2, H), matFront);
    frontRight.rotation.y = Math.PI;
    frontRight.position.set((W - 2.4) / 4 + 1.2, H / 2, D / 2);
    frontRight.receiveShadow = true;
    this.scene.add(frontRight);

    // Tembok atas pintu
    const frontTop = new THREE.Mesh(new THREE.PlaneGeometry(2.4, H - 2.8), matFront);
    frontTop.rotation.y = Math.PI;
    frontTop.position.set(0, H - (H - 2.8) / 2, D / 2);
    frontTop.receiveShadow = true;
    this.scene.add(frontTop);

    // Pintu ganda kayu besar
    const doorMat = new THREE.MeshStandardMaterial({
      color: '#422815', // Cokelat kayu pintu
      roughness: 0.6,
      metalness: 0.1
    });
    const handleMat = new THREE.MeshStandardMaterial({
      color: '#D4AF37', // Emas kuning untuk gagang
      roughness: 0.2,
      metalness: 0.9
    });

    // Pintu kiri (lebar 1.18m, tinggi 2.8m)
    const doorL = new THREE.Mesh(new THREE.BoxGeometry(1.18, 2.8, 0.06), doorMat);
    doorL.position.set(-0.6, 1.4, D / 2 - 0.03);
    this.scene.add(doorL);

    // Pintu kanan (lebar 1.18m, tinggi 2.8m)
    const doorR = new THREE.Mesh(new THREE.BoxGeometry(1.18, 2.8, 0.06), doorMat);
    doorR.position.set(0.6, 1.4, D / 2 - 0.03);
    this.scene.add(doorR);

    // Kusen pintu (bingkai kayu pintu)
    const doorFrameMat = new THREE.MeshStandardMaterial({ color: '#2A1A0D', roughness: 0.7 });
    const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.84, 0.12), doorFrameMat);
    frameL.position.set(-1.22, 1.42, D / 2);
    this.scene.add(frameL);

    const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.84, 0.12), doorFrameMat);
    frameR.position.set(1.22, 1.42, D / 2);
    this.scene.add(frameR);

    const frameT = new THREE.Mesh(new THREE.BoxGeometry(2.52, 0.08, 0.12), doorFrameMat);
    frameT.position.set(0, 2.84, D / 2);
    this.scene.add(frameT);

    // Gagang pintu kuningan emas (silinder)
    const handleL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8), handleMat);
    handleL.rotation.x = Math.PI / 2;
    handleL.position.set(-0.1, 1.3, D / 2 - 0.08);
    this.scene.add(handleL);

    const handleR = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8), handleMat);
    handleR.rotation.x = Math.PI / 2;
    handleR.position.set(0.1, 1.3, D / 2 - 0.08);
    this.scene.add(handleR);

    // ── Wainscoting dinding depan (kiri & kanan pintu) ──────
    const WAIN_H_FRONT = 1.5;
    const FRONT_SEG_W = (W - 2.4) / 2; // lebar tiap segmen = 5.8
    const FRONT_OFFSET = 0.005;

    const wainTexFront = await this.loadTex('textures/wall_wood_dark_.jpg', '#5C4A28');
    const matWainFront = wainTexFront
      ? new THREE.MeshStandardMaterial({ map: wainTexFront, roughness: 0.9, metalness: 0.0 })
      : new THREE.MeshStandardMaterial({ color: '#5C4A28', roughness: 0.9, metalness: 0.0 });
    if (wainTexFront) { wainTexFront.repeat.set(FRONT_SEG_W / WAIN_H_FRONT, 1); wainTexFront.needsUpdate = true; }

    const moldFrontMat = new THREE.MeshStandardMaterial({ color: '#C8A96E', roughness: 0.5 });
    const baseFrontMat = new THREE.MeshStandardMaterial({ color: '#C8A96E', roughness: 0.6 });

    // Sisi kiri pintu: center X = -(1.2 + FRONT_SEG_W/2)
    // Sisi kanan pintu: center X = +(1.2 + FRONT_SEG_W/2)
    [-(1.2 + FRONT_SEG_W / 2), (1.2 + FRONT_SEG_W / 2)].forEach(cx => {
      // Panel wainscoting
      const wainF = new THREE.Mesh(new THREE.PlaneGeometry(FRONT_SEG_W, WAIN_H_FRONT), matWainFront);
      wainF.rotation.y = Math.PI;
      wainF.position.set(cx, WAIN_H_FRONT / 2, D / 2 - FRONT_OFFSET);
      this.scene.add(wainF);

      // Molding strip atas
      const moldF = new THREE.Mesh(new THREE.BoxGeometry(FRONT_SEG_W, 0.08, 0.06), moldFrontMat);
      moldF.position.set(cx, WAIN_H_FRONT + 0.04, D / 2 - FRONT_OFFSET);
      this.scene.add(moldF);

      // Baseboard bawah
      const baseF = new THREE.Mesh(new THREE.BoxGeometry(FRONT_SEG_W, 0.15, 0.08), baseFrontMat);
      baseF.position.set(cx, 0.075, D / 2 - FRONT_OFFSET);
      this.scene.add(baseF);
    });

    // ── Wainscoting (panel bawah dinding) ──────
    const WAIN_H = 1.5;
    const WALL_OFFSET = 0.005;

    const wainTex = await this.loadTex('textures/wall_wood_dark_.jpg', '#5C4A28');
    const matWain = wainTex
      ? new THREE.MeshStandardMaterial({ map: wainTex, roughness: 0.9, metalness: 0.0 })
      : new THREE.MeshStandardMaterial({ color: '#5C4A28', roughness: 0.9, metalness: 0.0 });
    if (wainTex) { wainTex.repeat.set(D / WAIN_H, 1); wainTex.needsUpdate = true; }

    const makeWainMat = () => matWain; // share OK karena kedua panel sama ukurannya

    [-W / 2, W / 2].forEach((x, idx) => {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(D, WAIN_H), makeWainMat());
      panel.rotation.y = idx === 0 ? Math.PI / 2 : -Math.PI / 2;
      panel.position.set(
        idx === 0 ? x + WALL_OFFSET : x - WALL_OFFSET,
        WAIN_H / 2,
        0
      );
      this.scene.add(panel);

      // Molding strip di atas wainscoting
      const moldGeo = new THREE.BoxGeometry(D, 0.08, 0.06);
      const moldMat = new THREE.MeshStandardMaterial({ color: '#C8A96E', roughness: 0.5 });
      const mold = new THREE.Mesh(moldGeo, moldMat);
      mold.rotation.y = idx === 0 ? Math.PI / 2 : -Math.PI / 2;
      mold.position.set(
        idx === 0 ? x + WALL_OFFSET : x - WALL_OFFSET,
        WAIN_H + 0.04,
        0
      );
      this.scene.add(mold);
    });

    // Baseboard bawah
    [-W / 2, W / 2].forEach((x, idx) => {
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(D, 0.15, 0.08),
        new THREE.MeshStandardMaterial({ color: '#C8A96E', roughness: 0.6 })
      );
      base.rotation.y = idx === 0 ? Math.PI / 2 : -Math.PI / 2;
      base.position.set(
        idx === 0 ? x + WALL_OFFSET : x - WALL_OFFSET,
        0.075,
        0
      );
      this.scene.add(base);
    });
  }

  // ══════════════════════════════════════════════
  //  LANGIT-LANGIT dengan ornamen
  // ══════════════════════════════════════════════
  async _buildCeiling() {
    const tex = await this.loadTex('textures/ceiling_ornament.jpg', '#2E5A1C');
    const mat = this.matFromTex(tex, '#2E5A1C', [3, 8], { roughness: 0.9 });

    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(this.ROOM.W, this.ROOM.D), mat
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = this.ROOM.H;
    this.scene.add(ceiling);

    // Crown molding (tepi langit-langit)
    const crownMat = new THREE.MeshStandardMaterial({ color: '#C8A96E', roughness: 0.4, metalness: 0.1 });
    const crownGeo = new THREE.BoxGeometry(this.ROOM.D, 0.15, 0.2);
    [-this.ROOM.W / 2 + 0.1, this.ROOM.W / 2 - 0.1].forEach((x, i) => {
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.rotation.y = i === 0 ? Math.PI / 2 : -Math.PI / 2;
      crown.position.set(x, this.ROOM.H - 0.075, 0);
      this.scene.add(crown);
    });

    // Crown molding tembok depan & belakang
    const crownGeoFB = new THREE.BoxGeometry(this.ROOM.W, 0.15, 0.2);
    [-this.ROOM.D / 2 + 0.1, this.ROOM.D / 2 - 0.1].forEach(z => {
      const crown = new THREE.Mesh(crownGeoFB, crownMat);
      crown.position.set(0, this.ROOM.H - 0.075, z);
      this.scene.add(crown);
    });
  }

  // ══════════════════════════════════════════════
  //  SKYLIGHT (atap kaca di tengah)
  // ══════════════════════════════════════════════
  async _buildSkylight() {
    const H = this.ROOM.H;
    // Frame skylight
    const frameMat = new THREE.MeshStandardMaterial({ color: '#888888', roughness: 0.3, metalness: 0.6 });
    const frameW = 3, frameD = 6;
    const frameGeo = new THREE.BoxGeometry(frameW + 0.2, 0.1, frameD + 0.2);
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, H - 0.05, -2);
    this.scene.add(frame);

    // Kaca skylight
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xCCEEFF, transparent: true, opacity: 0.25,
      roughness: 0, metalness: 0.1, side: THREE.DoubleSide,
    });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(frameW, frameD), glassMat);
    glass.rotation.x = Math.PI / 2;
    glass.position.set(0, H - 0.06, -2);
    this.scene.add(glass);

    // Grid skylight
    const gridMat = new THREE.MeshStandardMaterial({ color: '#666666', metalness: 0.7 });
    for (let i = -1; i <= 1; i++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, frameD), gridMat);
      bar.position.set(i * 1, H - 0.04, -2);
      this.scene.add(bar);
    }
    for (let j = -2; j <= 2; j++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(frameW, 0.08, 0.05), gridMat);
      bar.position.set(0, H - 0.04, -2 + j * 1.2);
      this.scene.add(bar);
    }
  }

  // Pembuat tekstur canvas untuk label nama lukisan
  createLabelTexture(title) {
    const canvas = document.createElement('canvas');
    canvas.width  = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Background panel krem antik
    ctx.fillStyle = '#F5F0E0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border bingkai label
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#4A4D50';
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

    // Pengaturan teks
    ctx.fillStyle = '#1A1A1A';
    ctx.font = 'bold 46px "Georgia", "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Pemisahan baris teks jika terlalu panjang (wrapping)
    const words = title.split(' ');
    let line = '';
    const lines = [];
    const maxWidth = canvas.width - 80;

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    // Menggambar teks di tengah vertikal
    const lineHeight = 58;
    const startY = (canvas.height - (lines.length - 1) * lineHeight) / 2;
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i].trim(), canvas.width / 2, startY + i * lineHeight);
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // ══════════════════════════════════════════════
  //  LUKISAN di dinding kiri & kanan
  // ══════════════════════════════════════════════
  async _buildPaintings() {
    const W = this.ROOM.W;
    const paintings = MUSEUM_DATA.paintings;

    // Distribusi posisi Z di sepanjang ruangan
    const leftPaints = paintings.filter(p => p.wall === 'left');
    const rightPaints = paintings.filter(p => p.wall === 'right');

    const spacing = this.ROOM.D / (leftPaints.length + 1);

    const addPainting = async (data, wallX, zPos) => {
      const tex = await this.loadTex(data.texture, data.fallbackColor);

      // Ukuran lukisan bervariasi untuk natural
      const pW = 1.6 + Math.random() * 0.8;
      const pH = 1.1 + Math.random() * 0.6;

      // === FRAME ===
      const frameThick = 0.06;
      const frameDepth = 0.04; // tipis agar tidak overlap ke kanvas
      const frameMat = new THREE.MeshStandardMaterial({ color: '#4A4D50', roughness: 0.5, metalness: 0.15 });

      // Bingkai luar
      const frameGrp = new THREE.Group();

      // Top / Bottom bar
      [pH / 2 + frameThick / 2, -(pH / 2 + frameThick / 2)].forEach(y => {
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(pW + frameThick * 2, frameThick, frameDepth), frameMat
        );
        bar.position.set(0, y, 0);
        frameGrp.add(bar);
      });
      // Left / Right bar
      [-(pW / 2 + frameThick / 2), pW / 2 + frameThick / 2].forEach(x => {
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(frameThick, pH + frameThick * 2, frameDepth), frameMat
        );
        bar.position.set(x, 0, 0);
        frameGrp.add(bar);
      });

      // === KANVAS ===
      // Pastikan kanvas duduk di depan frame, tidak bercampur
      const canvasMat = tex
        ? new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, metalness: 0.0 })
        : new THREE.MeshStandardMaterial({ color: data.fallbackColor, roughness: 0.6 });

      const canvas = new THREE.Mesh(new THREE.PlaneGeometry(pW, pH), canvasMat);
      // Maju ke depan frame agar tidak z-fighting
      canvas.position.z = frameDepth / 2 + 0.002;
      frameGrp.add(canvas);

      // === LABEL di bawah ===
      const labelTex = this.createLabelTexture(data.title);
      const labelMat = new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.8 });
      // Kunci aspek ratio 4:1 sesuai canvas 512x128 agar teks tidak meregang
      const labelW = Math.min(pW * 0.7, 1.6); // tidak lebih lebar dari lukisan, max 1.6m
      const labelH = labelW / 4;               // ratio 4:1
      const label = new THREE.Mesh(new THREE.PlaneGeometry(labelW, labelH), labelMat);
      label.position.set(0, -(pH / 2 + frameThick + labelH / 2 + 0.04), frameDepth / 2 + 0.002);
      frameGrp.add(label);

      // Posisi & rotasi group di dinding
      // PlaneGeometry normal default menghadap +Z (lokal).
      // Setelah rotation.y, arah +Z lokal berputar:
      //   rotation.y = +Math.PI/2  → +Z lokal menjadi +X world (menghadap ke kanan/dalam, untuk dinding KIRI)
      //   rotation.y = -Math.PI/2  → +Z lokal menjadi -X world (menghadap ke kiri/dalam, untuk dinding KANAN)
      const wallOffset = 0.06;
      frameGrp.position.set(
        wallX > 0 ? wallX - wallOffset : wallX + wallOffset,
        2.4,  // tinggi dari lantai
        zPos
      );
      frameGrp.rotation.y = wallX < 0 ? Math.PI / 2 : -Math.PI / 2;
      frameGrp.castShadow = true;

      this.scene.add(frameGrp);

      // === LAMPU SOROT (picture light) ===
      // SpotLight tanpa shadow — cukup untuk efek visual, shadow dari directional light
      const spotLight = new THREE.SpotLight(0xFFF5CC, 1.2, 4, Math.PI / 6, 0.5);
      spotLight.castShadow = false;
      spotLight.position.set(
        wallX > 0 ? wallX - 0.5 : wallX + 0.5,
        3.5,
        zPos
      );
      spotLight.target.position.copy(frameGrp.position);
      this.scene.add(spotLight);
      this.scene.add(spotLight.target);

      // === INTERACTABLE ===
      canvas.userData = {
        type: 'painting',
        id: data.id,
        data: data,
      };
      this.interactables.push(canvas);
      this.meshMap[data.id] = canvas;


    };

    // Lukisan kiri
    for (let i = 0; i < leftPaints.length; i++) {
      const z = -this.ROOM.D / 2 + spacing * (i + 1);
      await addPainting(leftPaints[i], -W / 2, z);
    }
    // Lukisan kanan
    const spacingR = this.ROOM.D / (rightPaints.length + 1);
    for (let i = 0; i < rightPaints.length; i++) {
      const z = -this.ROOM.D / 2 + spacingR * (i + 1);
      await addPainting(rightPaints[i], W / 2, z);
    }
  }

  // ══════════════════════════════════════════════
  //  ARTEFAK – load dari file .glb
  // ══════════════════════════════════════════════
  async _buildArtifacts() {
    // Setup DRACOLoader untuk dekompresi model yang sudah dicompress dengan DRACO
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/draco/');

    const loader = new THREE.GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    // Setup MeshoptDecoder untuk model yang dikompresi dengan meshopt (misal: kadita.glb)
    // MeshoptDecoder dimuat via <script> di index.html (meshoptimizer/meshopt_decoder.js)
    if (window.MeshoptDecoder) {
      // MeshoptDecoder perlu di-ready() sebelum dipakai
      await window.MeshoptDecoder.ready;
      loader.setMeshoptDecoder(window.MeshoptDecoder);
    } else {
      console.warn('[Museum] MeshoptDecoder tidak ditemukan – model meshopt tidak akan bisa di-load.');
    }

    // Helper: load satu GLB sebagai Promise
    const loadGLB = (path) => new Promise((resolve) => {
      loader.load(path, gltf => resolve(gltf.scene), undefined, err => {
        console.warn(`[Museum] Gagal load model: ${path}`, err);
        resolve(null);
      });
    });

    // Tinggi puncak pedestal (base 0.04 + pole 0.9 + top 0.08 = 1.02, top center di 0.98, top surface = 1.02)
    const PEDESTAL_TOP_Y = 1.02;

    for (const data of MUSEUM_DATA.artifacts) {
      const pos = new THREE.Vector3(data.position.x, data.position.y, data.position.z);

      // Load model GLB
      const model = await loadGLB(data.model);

      // Buat group dengan pedestal
      const grp = new THREE.Group();
      this._addPedestal(grp, 0, 0, 0);

      let interactableMesh = null;

      if (model) {
        // Tahap 1: Hitung bounding box sebelum scale untuk menentukan faktor scale
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetHeight = data.modelScale || 0.8;
        const scale = targetHeight / maxDim;
        model.scale.setScalar(scale);

        // Tahap 2: Reset posisi model, tambahkan ke group, lalu update matrix
        // agar bounding box world-space bisa dihitung dengan akurat.
        model.position.set(0, 0, 0);
        model.rotation.set(0, 0, 0);
        grp.add(model);
        grp.updateMatrixWorld(true);

        // Tahap 3: Hitung bounding box dunia setelah model masuk ke group
        const worldBox = new THREE.Box3().setFromObject(model);
        const worldCenter = new THREE.Vector3();
        worldBox.getCenter(worldCenter);

        // Tahap 4: Geser model.position sehingga:
        //   - Titik terbawah model (worldBox.min.y) tepat di PEDESTAL_TOP_Y
        //   - Center X dan Z model sejajar dengan pusat pedestal (x=0, z=0 dalam local group)
        const offsetY = PEDESTAL_TOP_Y - worldBox.min.y;
        const offsetX = -worldCenter.x; // koreksi agar center X di atas pedestal
        const offsetZ = -worldCenter.z; // koreksi agar center Z di atas pedestal
        model.position.set(offsetX, model.position.y + offsetY, offsetZ);

        // Aktifkan shadow + daftarkan SEMUA mesh sebagai interactable
        // agar raycaster bisa deteksi dari bagian model manapun (bukan cuma mesh pertama)
        model.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            // Set userData di setiap mesh sehingga traversal ke atas parent chain selalu ketemu
            child.userData = { type: 'artifact', id: data.id, data: data };
            this.interactables.push(child);
            if (!interactableMesh) interactableMesh = child; // simpan referensi mesh pertama
          }
        });
      } else {
        // Fallback: box sederhana jika model gagal load
        const fallbackMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.5, 0.3),
          new THREE.MeshStandardMaterial({ color: data.fallbackColor })
        );
        fallbackMesh.position.y = PEDESTAL_TOP_Y + 0.25;
        grp.add(fallbackMesh);
        interactableMesh = fallbackMesh;
      }

      grp.position.set(pos.x, 0, pos.z);

      // ── Kotak Kaca Pelindung Artefak ──────────
      // Kotak kaca duduk di atas pedestal (PEDESTAL_TOP_Y = 1.02)
      const CASE_W = 0.7, CASE_H = 1.1, CASE_D = 0.7;
      const CASE_Y = PEDESTAL_TOP_Y + CASE_H / 2; // center Y kotak kaca

      const caseMat = new THREE.MeshStandardMaterial({
        color: 0xCCEEFF,
        transparent: true,
        opacity: 0.13,
        roughness: 0.0,
        metalness: 0.05,
        side: THREE.DoubleSide,
        depthWrite: false, // agar artefak di dalam tetap terlihat
      });
      const caseFrameMat = new THREE.MeshStandardMaterial({
        color: '#C8A96E',
        roughness: 0.3,
        metalness: 0.8,
      });

      // 6 sisi kaca
      const sides = [
        // [lebar, tinggi, posX, posY, posZ, rotY]
        [CASE_W, CASE_H,  0,      CASE_Y,  CASE_D/2,  0          ], // depan
        [CASE_W, CASE_H,  0,      CASE_Y, -CASE_D/2,  Math.PI    ], // belakang
        [CASE_D, CASE_H, -CASE_W/2, CASE_Y, 0,        Math.PI/2  ], // kiri
        [CASE_D, CASE_H,  CASE_W/2, CASE_Y, 0,       -Math.PI/2  ], // kanan
        [CASE_W, CASE_D,  0,      PEDESTAL_TOP_Y + CASE_H, 0, 0, -Math.PI/2], // atas (tutup)
      ];
      sides.forEach(([w, h, px, py, pz, ry, rx]) => {
        const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h), caseMat);
        panel.position.set(px, py, pz);
        panel.rotation.y = ry || 0;
        if (rx) panel.rotation.x = rx;
        grp.add(panel);
      });

      // Bingkai sudut kotak kaca — 4 tiang vertikal kuningan
      const edgeMat = caseFrameMat;
      const edgeH   = CASE_H;
      [[-CASE_W/2, -CASE_D/2], [CASE_W/2, -CASE_D/2],
       [-CASE_W/2,  CASE_D/2], [CASE_W/2,  CASE_D/2]].forEach(([ex, ez]) => {
        const edge = new THREE.Mesh(new THREE.BoxGeometry(0.025, edgeH, 0.025), edgeMat);
        edge.position.set(ex, CASE_Y, ez);
        grp.add(edge);
      });
      // Bingkai atas horizontal — 4 rusuk
      const topY = PEDESTAL_TOP_Y + CASE_H;
      [
        [0, -CASE_D/2, CASE_W, 0.025, 0.025, 0],
        [0,  CASE_D/2, CASE_W, 0.025, 0.025, 0],
        [-CASE_W/2, 0, 0.025, 0.025, CASE_D, 0],
        [ CASE_W/2, 0, 0.025, 0.025, CASE_D, 0],
      ].forEach(([ex, ez, bw, bh, bd]) => {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), edgeMat);
        bar.position.set(ex, topY, ez);
        grp.add(bar);
      });
      // Bingkai bawah horizontal — 4 rusuk (di atas pedestal)
      const botY = PEDESTAL_TOP_Y;
      [
        [0, -CASE_D/2, CASE_W, 0.025, 0.025],
        [0,  CASE_D/2, CASE_W, 0.025, 0.025],
        [-CASE_W/2, 0, 0.025, 0.025, CASE_D],
        [ CASE_W/2, 0, 0.025, 0.025, CASE_D],
      ].forEach(([ex, ez, bw, bh, bd]) => {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), edgeMat);
        bar.position.set(ex, botY, ez);
        grp.add(bar);
      });

      // ── Label nama artefak di sisi depan kaca bagian atas ──
      // Dideklarasikan SETELAH CASE_H & CASE_D tersedia
      const pedLabelW = 0.6;
      const pedLabelH = pedLabelW / 4; // ratio 4:1 sesuai canvas 1024x256
      const pedLabel  = new THREE.Mesh(
        new THREE.PlaneGeometry(pedLabelW, pedLabelH),
        new THREE.MeshStandardMaterial({ map: this.createLabelTexture(data.title), roughness: 0.8 })
      );
      // Tempel di sisi depan kaca (z = CASE_D/2 + sedikit offset), di area atas kotak
      pedLabel.position.set(0, PEDESTAL_TOP_Y + CASE_H - pedLabelH / 2 - 0.06, CASE_D / 2 + 0.003);
      grp.add(pedLabel);

      // Rotasi artefak agar menghadap keluar dari pusat lingkaran (0, 2)
      const CIRCLE_CX = 0, CIRCLE_CZ = 2;
      const outAngle = Math.atan2(pos.x - CIRCLE_CX, pos.z - CIRCLE_CZ);
      grp.rotation.y = outAngle;

      this.scene.add(grp);

      // Spotlight
      this._addArtifactSpot(pos);

      // Daftarkan posisi pedestal untuk collision (radius 0.55 = setengah lebar pedestal + margin)
      this.artifactColliders.push({ x: pos.x, z: pos.z, r: 0.7 });

      // Untuk fallback mesh (model gagal load), daftarkan di sini
      // Model yang berhasil load sudah didaftarkan di dalam traverse di atas
      if (interactableMesh && !model) {
        interactableMesh.userData = { type: 'artifact', id: data.id, data: data };
        this.interactables.push(interactableMesh);
      }
      // Simpan referensi mesh pertama ke meshMap
      if (interactableMesh) {
        this.meshMap[data.id] = interactableMesh;
      }
    }

    // ── Tiang & Rantai Pembatas Melingkar ──────
    // Lingkaran pembatas di antara artefak dan pemain
    // Radius tiang sedikit lebih besar dari radius artefak (3.5) agar ada jarak
    const BARRIER_R  = 4.5;   // radius lingkaran tiang pembatas
    const CENTER_X   = 0;
    const CENTER_Z   = 2;
    const N_POSTS    = 10;    // jumlah tiang merata di lingkaran
    const POST_H     = 1.0;   // tinggi tiang
    const CHAIN_H    = 0.75;  // ketinggian rantai dari lantai

    const postMat  = new THREE.MeshStandardMaterial({ color: '#C8A96E', roughness: 0.3, metalness: 0.8 });
    const chainMat = new THREE.MeshStandardMaterial({ color: '#A08840', roughness: 0.4, metalness: 0.7 });

    const postPositions = [];
    for (let i = 0; i < N_POSTS; i++) {
      const angle = (i / N_POSTS) * Math.PI * 2;
      const px = CENTER_X + BARRIER_R * Math.cos(angle);
      const pz = CENTER_Z + BARRIER_R * Math.sin(angle);
      postPositions.push({ x: px, z: pz });

      // Tiang silinder kuningan
      const postGeo  = new THREE.CylinderGeometry(0.03, 0.035, POST_H, 10);
      const post     = new THREE.Mesh(postGeo, postMat);
      post.position.set(px, POST_H / 2, pz);
      post.castShadow = true;
      this.scene.add(post);

      // Tutup tiang (bola kecil di atas)
      const capGeo = new THREE.SphereGeometry(0.045, 8, 6);
      const cap    = new THREE.Mesh(capGeo, postMat);
      cap.position.set(px, POST_H + 0.045, pz);
      this.scene.add(cap);
    }

    // Rantai antar tiang — silinder tipis menghubungkan setiap pasangan tiang
    for (let i = 0; i < N_POSTS; i++) {
      const a = postPositions[i];
      const b = postPositions[(i + 1) % N_POSTS];

      const ax = a.x, az = a.z;
      const bx = b.x, bz = b.z;
      const dx  = bx - ax;
      const dz  = bz - az;
      const len = Math.sqrt(dx * dx + dz * dz);
      const mx  = (ax + bx) / 2;
      const mz  = (az + bz) / 2;

      const chainGeo = new THREE.CylinderGeometry(0.012, 0.012, len, 6);
      const chain    = new THREE.Mesh(chainGeo, chainMat);

      // CylinderGeometry default sumbu Y — rotasikan agar sejajar sumbu XZ
      // Gunakan quaternion dari vektor arah (dx, 0, dz) → arah world
      const dir = new THREE.Vector3(dx, 0, dz).normalize();
      const up  = new THREE.Vector3(0, 1, 0);
      const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
      chain.setRotationFromQuaternion(quat);
      chain.position.set(mx, CHAIN_H, mz);
      this.scene.add(chain);
    }
  }

  // ── Pedestal helper ──────────────────────────
  _addPedestal(group, x, y, z) {
    const pedMat = new THREE.MeshStandardMaterial({ color: '#2C1A0E', roughness: 0.5, metalness: 0.1 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.6), pedMat);
    base.position.set(x, y + 0.04, z);
    group.add(base);
    const pole = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.9, 0.38), pedMat);
    pole.position.set(x, y + 0.49, z);
    group.add(pole);
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.55), pedMat);
    top.position.set(x, y + 0.98, z);
    group.add(top);
    [base, pole, top].forEach(m => m.castShadow = m.receiveShadow = true);
  }

  // ── Spotlight artefak ────────────────────────
  _addArtifactSpot(pos) {
    // Tanpa shadow — hemat GPU
    const spot = new THREE.SpotLight(0xFFF8E1, 2.0, 6, Math.PI / 8, 0.4);
    spot.castShadow = false;
    spot.position.set(pos.x, this.ROOM.H - 0.5, pos.z);
    spot.target.position.set(pos.x, pos.y + 1, pos.z);
    this.scene.add(spot);
    this.scene.add(spot.target);
  }


  // ══════════════════════════════════════════════
  //  PENCAHAYAAN
  // ══════════════════════════════════════════════
  _buildLighting() {
    // Ambient — cukup untuk tampilkan tekstur dinding, tidak overexpose lantai
    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(ambient);

    // Skylight — fill cahaya dari atas, tidak terlalu keras
    const skyLight = new THREE.DirectionalLight(0xffffff, 0.25);
    skyLight.position.set(0, this.ROOM.H, -2);
    skyLight.castShadow = true;
    skyLight.shadow.mapSize.width = 1024;
    skyLight.shadow.mapSize.height = 1024;
    skyLight.shadow.bias = -0.001;
    // Batasi area shadow agar tidak spill ke luar ruangan
    skyLight.shadow.camera.near = 0.5;
    skyLight.shadow.camera.far = 30;
    skyLight.shadow.camera.left = skyLight.shadow.camera.bottom = -10;
    skyLight.shadow.camera.right = skyLight.shadow.camera.top = 10;
    this.scene.add(skyLight);

    // Lampu gantung — warm & terfokus ke bawah, bukan flood
    // Kurangi intensity dan distance agar cahaya tidak merata ke seluruh lantai
    const chandPositions = [-8, -2, 4, 10];
    chandPositions.forEach(z => {
      const pl = new THREE.PointLight(0xffffff, 0.3, 7);
      pl.position.set(0, this.ROOM.H - 0.8, z);
      pl.castShadow = false; // shadow dari PointLight mahal, cukup dari skyLight
      this.scene.add(pl);

      // Mesh lampu gantung
      const chandMat = new THREE.MeshStandardMaterial({
        color: '#C8A830', emissive: '#E8A020',
        emissiveIntensity: 0.5, metalness: 0.8, roughness: 0.3,
      });
      const chand = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), chandMat);
      chand.position.copy(pl.position);
      this.scene.add(chand);

      // Tali
      const rope = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.6, 4),
        new THREE.MeshStandardMaterial({ color: '#444' })
      );
      rope.position.set(0, this.ROOM.H - 0.5, z);
      this.scene.add(rope);
    });
  }

  // ── Getter interactables ─────────────────────
  getInteractables() { return this.interactables; }

  // ── Getter colliders artefak ──────────────────────────────
  getArtifactColliders() { return this.artifactColliders; }

  // ── Getter meshMap (id → mesh) ────────────────────────────
  getMeshMap() { return this.meshMap; }

  // ── Getter barrier lingkaran artefak ─────────────────────
  getBarrierCircle() { return { x: 0, z: 2, r: 4.5 }; }
}