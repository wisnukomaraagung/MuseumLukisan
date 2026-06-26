/**
 * ParticleSystem.js
 * Sistem partikel untuk artefak dan elemen museum
 * Memenuhi syarat: particle system sesuai kebutuhan proyek
 */

class MuseumParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.systems = [];
    this.clock = new THREE.Clock();
  }

  // ── Partikel Aura / Glow untuk artefak ──────
  createAuraParticles(position, color = 0xFFD700, count = 80) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];
    const alphas = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const radius = 0.3 + Math.random() * 0.5;
      positions[i * 3]     = position.x + Math.cos(angle) * radius;
      positions[i * 3 + 1] = position.y + Math.random() * 2.5;
      positions[i * 3 + 2] = position.z + Math.sin(angle) * radius;
      velocities.push({
        x: (Math.random() - 0.5) * 0.01,
        y: 0.008 + Math.random() * 0.012,
        z: (Math.random() - 0.5) * 0.01,
        life: Math.random(),
        speed: 0.003 + Math.random() * 0.005,
      });
      alphas[i] = Math.random();
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color,
      size: 0.06,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geo, mat);
    this.scene.add(particles);

    const system = {
      mesh: particles,
      geo,
      velocities,
      basePosition: position.clone(),
      type: 'aura',
      time: 0,
    };
    this.systems.push(system);
    return system;
  }

  // ── Partikel Debu / Dust Ambient ────────────
  createDustParticles(roomBounds, count = 200) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = roomBounds.minX + Math.random() * (roomBounds.maxX - roomBounds.minX);
      positions[i * 3 + 1] = 0.5 + Math.random() * 4;
      positions[i * 3 + 2] = roomBounds.minZ + Math.random() * (roomBounds.maxZ - roomBounds.minZ);
      velocities.push({
        x: (Math.random() - 0.5) * 0.003,
        y: (Math.random() - 0.5) * 0.001,
        z: (Math.random() - 0.5) * 0.003,
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xFFF8E7,
      size: 0.025,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geo, mat);
    this.scene.add(particles);

    const system = { mesh: particles, geo, velocities, bounds: roomBounds, type: 'dust' };
    this.systems.push(system);
    return system;
  }

  // ── Partikel Cahaya Skylight ─────────────────
  createSkylightBeam(position, count = 120) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      const rx = (Math.random() - 0.5) * 3;
      const rz = (Math.random() - 0.5) * 3;
      positions[i * 3]     = position.x + rx;
      positions[i * 3 + 1] = 1 + Math.random() * (position.y - 1);
      positions[i * 3 + 2] = position.z + rz;
      velocities.push({
        x: rx * 0.0005,
        y: -(0.005 + Math.random() * 0.008),
        z: rz * 0.0005,
        startY: position.y,
        resetY: 0.8,
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xFFF5CC,
      size: 0.04,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geo, mat);
    this.scene.add(particles);

    const system = { mesh: particles, geo, velocities, baseX: position.x, baseZ: position.z, type: 'skylight' };
    this.systems.push(system);
    return system;
  }

  // ── Update semua sistem partikel ─────────────
  update() {
    const delta = this.clock.getDelta();

    for (const sys of this.systems) {
      const pos = sys.geo.attributes.position.array;
      const count = pos.length / 3;

      if (sys.type === 'aura') {
        sys.time += delta;
        for (let i = 0; i < count; i++) {
          const v = sys.velocities[i];
          v.life += v.speed;
          if (v.life > 1) {
            // reset partikel ke bawah
            const angle  = Math.random() * Math.PI * 2;
            const radius = 0.3 + Math.random() * 0.5;
            pos[i * 3]     = sys.basePosition.x + Math.cos(angle) * radius;
            pos[i * 3 + 1] = sys.basePosition.y;
            pos[i * 3 + 2] = sys.basePosition.z + Math.sin(angle) * radius;
            v.life = 0;
          } else {
            pos[i * 3]     += v.x + Math.sin(sys.time * 2 + i) * 0.002;
            pos[i * 3 + 1] += v.y;
            pos[i * 3 + 2] += v.z + Math.cos(sys.time * 2 + i) * 0.002;
          }
        }
        sys.mesh.material.opacity = 0.5 + Math.sin(sys.time * 1.5) * 0.25;
        sys.geo.attributes.position.needsUpdate = true;
      }

      else if (sys.type === 'dust') {
        for (let i = 0; i < count; i++) {
          const v = sys.velocities[i];
          pos[i * 3]     += v.x;
          pos[i * 3 + 1] += v.y;
          pos[i * 3 + 2] += v.z;

          // Wrap bounds
          if (pos[i * 3]     < sys.bounds.minX) pos[i * 3]     = sys.bounds.maxX;
          if (pos[i * 3]     > sys.bounds.maxX) pos[i * 3]     = sys.bounds.minX;
          if (pos[i * 3 + 1] < 0.2)             pos[i * 3 + 1] = 4;
          if (pos[i * 3 + 1] > 4.5)             pos[i * 3 + 1] = 0.5;
          if (pos[i * 3 + 2] < sys.bounds.minZ) pos[i * 3 + 2] = sys.bounds.maxZ;
          if (pos[i * 3 + 2] > sys.bounds.maxZ) pos[i * 3 + 2] = sys.bounds.minZ;
        }
        sys.geo.attributes.position.needsUpdate = true;
      }

      else if (sys.type === 'skylight') {
        for (let i = 0; i < count; i++) {
          const v = sys.velocities[i];
          pos[i * 3]     += v.x;
          pos[i * 3 + 1] += v.y;
          pos[i * 3 + 2] += v.z;
          if (pos[i * 3 + 1] < v.resetY) {
            const rx = (Math.random() - 0.5) * 3;
            const rz = (Math.random() - 0.5) * 3;
            pos[i * 3]     = sys.baseX + rx;
            pos[i * 3 + 1] = v.startY;
            pos[i * 3 + 2] = sys.baseZ + rz;
          }
        }
        sys.geo.attributes.position.needsUpdate = true;
      }
    }
  }

  // ── Burst partikel saat user mendekati artefak
  burst(position, color = 0xFFD700, count = 40) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = position.x;
      positions[i * 3 + 1] = position.y + 1;
      positions[i * 3 + 2] = position.z;
      velocities.push({
        x: (Math.random() - 0.5) * 0.08,
        y: 0.02 + Math.random() * 0.06,
        z: (Math.random() - 0.5) * 0.08,
        life: 0,
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color, size: 0.1, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const mesh = new THREE.Points(geo, mat);
    this.scene.add(mesh);

    // Auto-remove after burst
    let frame = 0;
    const animate = () => {
      frame++;
      const p = geo.attributes.position.array;
      for (let i = 0; i < count; i++) {
        velocities[i].life += 0.02;
        p[i * 3]     += velocities[i].x;
        p[i * 3 + 1] += velocities[i].y;
        p[i * 3 + 2] += velocities[i].z;
        velocities[i].y -= 0.001;
      }
      mat.opacity = Math.max(0, 0.9 - frame * 0.02);
      geo.attributes.position.needsUpdate = true;
      if (frame < 60) requestAnimationFrame(animate);
      else { this.scene.remove(mesh); geo.dispose(); mat.dispose(); }
    };
    animate();
  }

  dispose() {
    for (const sys of this.systems) {
      this.scene.remove(sys.mesh);
      sys.geo.dispose();
      sys.mesh.material.dispose();
    }
    this.systems = [];
  }
}
