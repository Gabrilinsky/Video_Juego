/* ==========================================================================
   1. SINTETIZADOR DE AUDIO WEB AUDIO API Y ANUNCIADOR DE VOZ
   ========================================================================== */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.musicTimer = null;
    this.musicStep = 0;
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }
  playSlash() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(now); osc.stop(now + 0.16);
  }
  playHit() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.22);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(now); osc.stop(now + 0.24);
  }
  playBlock() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(now); osc.stop(now + 0.14);
  }
  playProjectile() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(1500, now + 0.18);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(now); osc.stop(now + 0.2);
  }
  playBackgroundMusic() {
    if (!this.enabled || this.musicTimer) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const bassNotes = [55, 55, 49, 55, 65, 58, 49, 55];
    const leadNotes = [110, 0, 130.81, 0, 146.83, 0, 116.54, 0];
    this.musicTimer = window.setInterval(() => {
      if (!this.enabled) return;
      const now = this.ctx.currentTime;
      const step = this.musicStep++ % bassNotes.length;
      const bass = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bass.type = 'triangle';
      bass.frequency.setValueAtTime(bassNotes[step], now);
      bassGain.gain.setValueAtTime(0.0001, now);
      bassGain.gain.exponentialRampToValueAtTime(0.035, now + 0.025);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      bass.connect(bassGain); bassGain.connect(this.ctx.destination);
      bass.start(now); bass.stop(now + 0.23);

      if (leadNotes[step]) {
        const lead = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        lead.type = 'sine';
        lead.frequency.setValueAtTime(leadNotes[step], now);
        leadGain.gain.setValueAtTime(0.0001, now);
        leadGain.gain.exponentialRampToValueAtTime(0.018, now + 0.02);
        leadGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        lead.connect(leadGain); leadGain.connect(this.ctx.destination);
        lead.start(now); lead.stop(now + 0.19);
      }

      if (step % 4 === 0) {
        const drum = this.ctx.createOscillator();
        const drumGain = this.ctx.createGain();
        drum.type = 'sine';
        drum.frequency.setValueAtTime(95, now);
        drum.frequency.exponentialRampToValueAtTime(38, now + 0.12);
        drumGain.gain.setValueAtTime(0.06, now);
        drumGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
        drum.connect(drumGain); drumGain.connect(this.ctx.destination);
        drum.start(now); drum.stop(now + 0.14);
      }
    }, 240);
  }
  stopBackgroundMusic() {
    if (this.musicTimer) window.clearInterval(this.musicTimer);
    this.musicTimer = null;
    this.musicStep = 0;
  }
  speak(text) {
    if (!this.enabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.9; utter.pitch = 0.5;
    window.speechSynthesis.speak(utter);
  }
}
const audio = new SoundEngine();

/* ==========================================================================
   2. CONSTRUCTOR DE ARMAS EN TRES DIMENSIONES (THREE.JS 3D MESHES)
   ========================================================================== */
function create3DWeapon(type, colorHex = 0xdc2626) {
  const group = new THREE.Group();
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.9 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.8 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });

  if (type === 'katana') {
    // Blade
    const bladeGeo = new THREE.BoxGeometry(0.08, 1.4, 0.03);
    const blade = new THREE.Mesh(bladeGeo, metalMat);
    blade.position.y = 0.7; blade.castShadow = true; group.add(blade);
    // Tsuba (Guard)
    const tsubaGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 8);
    const tsuba = new THREE.Mesh(tsubaGeo, goldMat);
    tsuba.position.y = 0.02; group.add(tsuba);
    // Handle
    const handleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8);
    const handle = new THREE.Mesh(handleGeo, darkMat);
    handle.position.y = -0.2; group.add(handle);
  } else if (type === 'sai') {
    // Central Spike
    const mainGeo = new THREE.CylinderGeometry(0.04, 0.01, 0.9, 8);
    const mainBlade = new THREE.Mesh(mainGeo, metalMat);
    mainBlade.position.y = 0.45; group.add(mainBlade);
    // Side Prongs
    const prongGeo = new THREE.TorusGeometry(0.12, 0.02, 6, 12, Math.PI);
    const prong = new THREE.Mesh(prongGeo, metalMat);
    prong.rotation.x = Math.PI / 2; prong.position.y = 0.1; group.add(prong);
    // Handle
    const handleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
    const handle = new THREE.Mesh(handleGeo, darkMat);
    handle.position.y = -0.15; group.add(handle);
  } else if (type === 'spear') {
    // Long Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.4, 8);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = 0.8; group.add(shaft);
    // Spearhead
    const headGeo = new THREE.ConeGeometry(0.12, 0.6, 8);
    const head = new THREE.Mesh(headGeo, metalMat);
    head.position.y = 2.1; group.add(head);
  } else if (type === 'nunchaku') {
    const stickGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
    const stick1 = new THREE.Mesh(stickGeo, darkMat); stick1.position.y = 0.25; group.add(stick1);
    const stick2 = new THREE.Mesh(stickGeo, darkMat); stick2.position.set(0.2, 0.1, 0); stick2.rotation.z = -0.5; group.add(stick2);
  } else if (type === 'nodachi') {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.8, 0.04), metalMat);
    blade.position.y = 0.9; group.add(blade);
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.06, 0.08), goldMat);
    guard.position.y = 0.05; group.add(guard);
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), darkMat);
    grip.position.y = -0.22; group.add(grip);
  } else if (type === 'hammer') {
    const haft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.4, 8), darkMat);
    haft.position.y = 0.45; group.add(haft);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.38, 0.42), goldMat);
    head.position.y = 1.05; group.add(head);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.48, 0.5), metalMat);
    cap.position.set(0.36, 1.05, 0); group.add(cap);
  } else if (type === 'claws') {
    const knuckle = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 0.18), darkMat);
    knuckle.position.y = 0.08; group.add(knuckle);
    for (let index = -1; index <= 1; index++) {
      const claw = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.62, 6), metalMat);
      claw.position.set(index * 0.11, 0.48, 0);
      claw.rotation.z = -0.12;
      group.add(claw);
    }
  } else if (type === 'staff') {
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 2.2, 10), darkMat);
    staff.position.y = 0.7; group.add(staff);
    for (const y of [-0.35, 1.7]) {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), goldMat);
      cap.position.y = y; group.add(cap);
    }
  } else if (type === 'axe') {
    const haft = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 1.5, 8), darkMat);
    haft.position.y = 0.55; group.add(haft);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.72, 0.1), metalMat);
    blade.position.set(0.24, 1.0, 0); blade.rotation.z = -0.18; group.add(blade);
  } else {
    // Twin Daggers
    const daggerGeo = new THREE.BoxGeometry(0.06, 0.7, 0.02);
    const dagger = new THREE.Mesh(daggerGeo, metalMat); dagger.position.y = 0.35; group.add(dagger);
  }
  return group;
}

function create3DProjectileMesh(type, colorHex) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.2, metalness: 0.8, emissive: colorHex, emissiveIntensity: 0.5 });
  if (type === 'shuriken') {
    for (let i = 0; i < 4; i++) {
      const bladeGeo = new THREE.ConeGeometry(0.08, 0.4, 4);
      const blade = new THREE.Mesh(bladeGeo, mat);
      blade.rotation.z = (Math.PI / 2) * i; blade.position.x = Math.cos((Math.PI / 2) * i) * 0.15; blade.position.y = Math.sin((Math.PI / 2) * i) * 0.15;
      group.add(blade);
    }
  } else if (type === 'chakram') {
    const ringGeo = new THREE.TorusGeometry(0.35, 0.04, 8, 24);
    const ring = new THREE.Mesh(ringGeo, mat); group.add(ring);
  } else if (type === 'smoke') {
    const smoke = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 1), new THREE.MeshStandardMaterial({ color: 0x64748b, transparent: true, opacity: 0.8 }));
    group.add(smoke);
  } else if (type === 'bolt') {
    const bolt = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.65, 6), mat);
    bolt.rotation.z = -Math.PI / 2; group.add(bolt);
  } else if (type === 'orb') {
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), mat);
    group.add(orb);
  } else {
    const kunaiGeo = new THREE.ConeGeometry(0.1, 0.5, 4);
    const kunai = new THREE.Mesh(kunaiGeo, mat); kunai.rotation.z = -Math.PI / 2; group.add(kunai);
  }
  return group;
}

const WEAPON_STATS = {
  katana: { damage: 20, reach: 2.35 }, sai: { damage: 17, reach: 1.85 },
  spear: { damage: 22, reach: 2.9 }, nunchaku: { damage: 18, reach: 2.05 },
  daggers: { damage: 16, reach: 1.75 }, nodachi: { damage: 25, reach: 2.55 },
  hammer: { damage: 26, reach: 2.1 }, claws: { damage: 17, reach: 1.8 },
  staff: { damage: 18, reach: 2.65 }, axe: { damage: 23, reach: 2.2 }
};

const RANGED_WEAPON_STATS = {
  shuriken: 14, chakram: 16, kunai: 13, smoke: 10, bolt: 17, orb: 15
};

const UPGRADE_COSTS = { damage: 75, reach: 90, rune: 180, ranged: 100, power: 120 };
const UPGRADE_LIMITS = { damage: 3, reach: 2, rune: 1, ranged: 3, power: 3 };

const WEAPON_NAMES = {
  katana: 'Katana', sai: 'Sai doble', spear: 'Naginata', nunchaku: 'Nunchaku',
  daggers: 'Dagas', nodachi: 'Nodachi', hammer: 'Martillo', claws: 'Garras',
  staff: 'Baston', axe: 'Hacha'
};

/* ==========================================================================
   3. CONSTRUCTOR DE ANATOMÍA HUMANOIDE 3D ARTICULADA (SKELETAL HIERARCHY)
   ========================================================================== */
class HumanoidFighter3D {
  constructor(id, config, isP2 = false, scene = null) {
    this.id = id; this.isP2 = isP2; this.config = config; this.scene = scene;

    this.hpMax = config.hpMax || 100; this.hp = this.hpMax; this.superMeter = 0;
    this.moveSpeed = config.style === 'speedster' ? 0.22 : 0.17;
    this.jumpPower = 0.38;
    this.atkMult = (config.style === 'heavy' ? 1.4 : 1.0) * (config.combatMultiplier || 1);
    this.weaponStats = WEAPON_STATS[config.weapon1] || WEAPON_STATS.katana;
    this.weaponUpgrades = config.weaponUpgrades || { damage: 0, reach: 0, rune: 0 };
    this.rangedUpgrades = config.rangedUpgrades || { ranged: 0 };
    this.powerUpgrades = config.powerUpgrades || { power: 0 };

    this.x = isP2 ? 4 : -4; this.y = 0; this.z = 0;
    this.vx = 0; this.vy = 0;
    this.dir = isP2 ? -1 : 1;
    this.isGrounded = true; this.isBlocking = false;
    this.state = 'idle'; this.animTimer = 0; this.walkCycle = 0;
    this.comboHits = 0; this.hiddenPowerActive = false;
    this.stunFrames = 0; this.totalDamageDealt = 0; this.ultimatesUsed = 0;
    this.aiTimer = 0;

    this.build3DModel();
  }

  build3DModel() {
    this.group = new THREE.Group();
    const skinHex = parseInt(this.config.colorSkin.replace('#', '0x'));
    const suitHex = parseInt(this.config.colorSuit.replace('#', '0x'));
    const auraHex = parseInt(this.config.colorAura.replace('#', '0x'));

    const skinMat = new THREE.MeshStandardMaterial({ color: skinHex, roughness: 0.6 });
    const suitMat = new THREE.MeshStandardMaterial({ color: suitHex, roughness: 0.4, metalness: 0.3 });
    const armorMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.8 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.8 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });

    // Caderas / Pelvis (Root Joint)
    this.pelvis = new THREE.Group(); this.pelvis.position.y = 1.8; this.group.add(this.pelvis);
    const hipMesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.4), suitMat);
    hipMesh.castShadow = true; this.pelvis.add(hipMesh);

    // Torso / Pecho
    this.torso = new THREE.Group(); this.torso.position.y = 0.3; this.pelvis.add(this.torso);
    const chestMesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 16), suitMat);
    chestMesh.scale.set(0.9, 1.05, 0.58); chestMesh.position.y = 0.48; chestMesh.castShadow = true; this.torso.add(chestMesh);
    const abdomenMesh = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), suitMat);
    abdomenMesh.scale.set(0.9, 1.05, 0.72); abdomenMesh.position.y = 0.04; abdomenMesh.castShadow = true; this.torso.add(abdomenMesh);
    for (const side of [-1, 1]) {
      const shoulderMesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), suitMat);
      shoulderMesh.position.set(side * 0.48, 0.68, 0); shoulderMesh.castShadow = true; this.torso.add(shoulderMesh);
    }

    // Adornos según Traje 3D (Samurái, Cíborg, Asesino, Caballero)
    if (this.config.outfit === 'samurai') {
      const sodeLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.4), armorMat); sodeLeft.position.set(-0.55, 0.6, 0); this.torso.add(sodeLeft);
      const sodeRight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.4), armorMat); sodeRight.position.set(0.55, 0.6, 0); this.torso.add(sodeRight);
    } else if (this.config.outfit === 'cyborg') {
      const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), new THREE.MeshStandardMaterial({ color: auraHex, emissive: auraHex, emissiveIntensity: 0.8 }));
      coreMesh.position.set(0, 0.5, 0.26); this.torso.add(coreMesh);
    } else if (this.config.outfit === 'monk') {
      const sash = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.08, 8, 20), goldMat);
      sash.position.set(0, 0.12, 0); sash.rotation.x = Math.PI / 2; this.torso.add(sash);
    } else if (this.config.outfit === 'frostguard') {
      for (const side of [-1, 1]) {
        const pauldron = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.48), armorMat);
        pauldron.position.set(side * 0.55, 0.66, 0); this.torso.add(pauldron);
      }
      const chestPlate = new THREE.Mesh(new THREE.OctahedronGeometry(0.22), new THREE.MeshStandardMaterial({ color: 0x67e8f9, emissive: 0x0891b2, emissiveIntensity: 0.5 }));
      chestPlate.position.set(0, 0.48, 0.3); this.torso.add(chestPlate);
    } else if (this.config.outfit === 'dragon') {
      for (const side of [-1, 1]) {
        const scale = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.55, 5), armorMat);
        scale.position.set(side * 0.5, 0.68, 0.12); scale.rotation.z = side * -0.5; this.torso.add(scale);
      }
    } else if (this.config.outfit === 'ronin') {
      const scarf = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.16, 0.56), goldMat);
      scarf.position.set(0, 0.12, 0.08); this.torso.add(scarf);
    }

    // Cabeza & Casco
    this.headGroup = new THREE.Group(); this.headGroup.position.y = 1.05; this.torso.add(this.headGroup);
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), skinMat);
    headMesh.castShadow = true; this.headGroup.add(headMesh);
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.3 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x211810, roughness: 0.9 });
    if (['ninja', 'cyborg', 'monk'].includes(this.config.outfit)) {
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.285, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.48), hairMat);
      hair.position.y = 0.045; this.headGroup.add(hair);
    }
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), skinMat);
      ear.position.set(side * 0.27, -0.015, 0); this.headGroup.add(ear);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.043, 10, 8), eyeWhiteMat);
      eye.scale.set(1, 0.72, 0.7); eye.position.set(side * 0.095, 0.025, 0.275); this.headGroup.add(eye);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), eyeMat);
      pupil.position.set(side * 0.095, 0.025, 0.306); this.headGroup.add(pupil);
      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.025, 0.035), darkMat);
      brow.position.set(side * 0.095, 0.09, 0.27); brow.rotation.z = side * -0.1; this.headGroup.add(brow);
    }
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), skinMat);
    nose.scale.set(0.75, 1.2, 0.7); nose.position.set(0, -0.035, 0.3); this.headGroup.add(nose);
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.018, 0.025), darkMat);
    mouth.position.set(0, -0.13, 0.27); this.headGroup.add(mouth);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.22, 12), skinMat);
    neck.position.y = 0.82; this.torso.add(neck);

    if (this.config.outfit === 'samurai') {
      const helmet = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.3, 8), armorMat); helmet.position.y = 0.22; this.headGroup.add(helmet);
      const crest = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.3, 0.3), new THREE.MeshStandardMaterial({ color: 0xf59e0b })); crest.position.set(0, 0.4, 0.1); this.headGroup.add(crest);
    } else if (this.config.outfit === 'assassin') {
      const hood = new THREE.Mesh(new THREE.SphereGeometry(0.33, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.7), suitMat); hood.position.y = 0.05; this.headGroup.add(hood);
    } else if (this.config.outfit === 'ronin') {
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.06, 12), darkMat);
      brim.position.y = 0.18; this.headGroup.add(brim);
      const hat = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.2, 12), darkMat);
      hat.position.y = 0.3; this.headGroup.add(hat);
    } else if (this.config.outfit === 'monk') {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.055, 8, 16), goldMat);
      band.position.y = 0.08; band.rotation.x = Math.PI / 2; this.headGroup.add(band);
    } else if (this.config.outfit === 'frostguard') {
      const helm = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.42, 6), armorMat);
      helm.position.y = 0.22; this.headGroup.add(helm);
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.08), new THREE.MeshStandardMaterial({ color: 0x67e8f9, emissive: 0x0891b2, emissiveIntensity: 0.8 }));
      visor.position.set(0, 0.04, 0.24); this.headGroup.add(visor);
    } else if (this.config.outfit === 'dragon') {
      for (const side of [-1, 1]) {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.42, 6), goldMat);
        horn.position.set(side * 0.24, 0.3, 0); horn.rotation.z = side * 0.45; this.headGroup.add(horn);
      }
    } else if (this.config.outfit === 'knight') {
      const helm = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.5, 8), armorMat);
      helm.position.y = 0.25; this.headGroup.add(helm);
    }

    // Brazo Izquierdo (Joint Hierarchy: Shoulder -> UpperArm -> Forearm -> Hand)
    this.leftShoulder = new THREE.Group(); this.leftShoulder.position.set(-0.55, 0.75, 0); this.torso.add(this.leftShoulder);
    const lUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.5, 8), suitMat); lUpperArm.position.y = -0.25; lUpperArm.castShadow = true; this.leftShoulder.add(lUpperArm);
    this.leftForearm = new THREE.Group(); this.leftForearm.position.y = -0.5; this.leftShoulder.add(this.leftForearm);
    const lForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.5, 8), skinMat); lForearmMesh.position.y = -0.25; lForearmMesh.castShadow = true; this.leftForearm.add(lForearmMesh);
    const leftPalm = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), skinMat);
    leftPalm.scale.set(0.9, 1.1, 0.7); leftPalm.position.y = -0.5; this.leftForearm.add(leftPalm);
    for (let finger = 0; finger < 4; finger++) {
      const digit = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.032, 0.13, 6), skinMat);
      digit.position.set((finger - 1.5) * 0.045, -0.61, 0.015); this.leftForearm.add(digit);
    }

    // Brazo Derecho (Joint Hierarchy + Arma 3D)
    this.rightShoulder = new THREE.Group(); this.rightShoulder.position.set(0.55, 0.75, 0); this.torso.add(this.rightShoulder);
    const rUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.5, 8), suitMat); rUpperArm.position.y = -0.25; rUpperArm.castShadow = true; this.rightShoulder.add(rUpperArm);
    this.rightForearm = new THREE.Group(); this.rightForearm.position.y = -0.5; this.rightShoulder.add(this.rightForearm);
    const rForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.5, 8), skinMat); rForearmMesh.position.y = -0.25; rForearmMesh.castShadow = true; this.rightForearm.add(rForearmMesh);
    
    // Hand Node + Attached 3D Weapon
    this.rightHand = new THREE.Group(); this.rightHand.position.y = -0.5; this.rightForearm.add(this.rightHand);
    const rightPalm = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), skinMat);
    rightPalm.scale.set(0.9, 1.1, 0.7); this.rightHand.add(rightPalm);
    for (let finger = 0; finger < 4; finger++) {
      const digit = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.032, 0.13, 6), skinMat);
      digit.position.set((finger - 1.5) * 0.045, -0.11, 0.015); this.rightHand.add(digit);
    }
    const weapon3D = create3DWeapon(this.config.weapon1, auraHex);
    if (this.weaponUpgrades.rune) {
      weapon3D.traverse(part => {
        if (part.material && part.material.emissive) {
          part.material.emissive.setHex(auraHex);
          part.material.emissiveIntensity = 0.55;
        }
      });
    }
    weapon3D.position.set(0, 0, 0.2); this.rightHand.add(weapon3D);

    // Piernas (Joint Hierarchy: Thigh -> Calf -> Foot)
    this.leftThigh = new THREE.Group(); this.leftThigh.position.set(-0.25, -0.2, 0); this.pelvis.add(this.leftThigh);
    const lThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.65, 8), suitMat); lThighMesh.position.y = -0.32; lThighMesh.castShadow = true; this.leftThigh.add(lThighMesh);
    this.leftCalf = new THREE.Group(); this.leftCalf.position.y = -0.65; this.leftThigh.add(this.leftCalf);
    const lCalfMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.65, 8), armorMat); lCalfMesh.position.y = -0.32; lCalfMesh.castShadow = true; this.leftCalf.add(lCalfMesh);
    const leftBoot = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), darkMat);
    leftBoot.scale.set(0.8, 0.65, 1.25); leftBoot.position.set(0, -0.62, 0.08); this.leftCalf.add(leftBoot);

    this.rightThigh = new THREE.Group(); this.rightThigh.position.set(0.25, -0.2, 0); this.pelvis.add(this.rightThigh);
    const rThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.65, 8), suitMat); rThighMesh.position.y = -0.32; rThighMesh.castShadow = true; this.rightThigh.add(rThighMesh);
    this.rightCalf = new THREE.Group(); this.rightCalf.position.y = -0.65; this.rightThigh.add(this.rightCalf);
    const rCalfMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.65, 8), armorMat); rCalfMesh.position.y = -0.32; rCalfMesh.castShadow = true; this.rightCalf.add(rCalfMesh);
    const rightBoot = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), darkMat);
    rightBoot.scale.set(0.8, 0.65, 1.25); rightBoot.position.set(0, -0.62, 0.08); this.rightCalf.add(rightBoot);

    // Escudo 3D de Bloqueo
    const shieldGeo = new THREE.SphereGeometry(1.3, 16, 16);
    const shieldMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0, emissive: 0x0284c7, emissiveIntensity: 0.6 });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.y = 1.0; this.group.add(this.shieldMesh);

    // Aura de Poder Oculto 3D
    const auraGeo = new THREE.CylinderGeometry(0.9, 0.9, 2.6, 12, 1, true);
    const auraMat = new THREE.MeshStandardMaterial({ color: auraHex, transparent: true, opacity: 0, emissive: auraHex, emissiveIntensity: 0.8, side: THREE.DoubleSide });
    this.auraMesh = new THREE.Mesh(auraGeo, auraMat);
    this.auraMesh.position.y = 1.3; this.group.add(this.auraMesh);

    this.group.position.set(this.x, this.y, this.z);
    if (this.scene) this.scene.add(this.group);
  }

  takeDamage(amount) {
    amount *= 0.6;
    if (this.isBlocking) {
      amount *= 0.2; audio.playBlock();
    } else {
      this.stunFrames = 12; this.state = 'hit'; this.comboHits = 0;
    }
    this.hp = Math.max(0, this.hp - amount);
    this.superMeter = Math.min(100, this.superMeter + amount * 0.45);
  }

  update(opponent, projectiles, particles3D, scene) {
    if (this.stunFrames > 0) {
      this.stunFrames--;
      if (this.stunFrames === 0 && this.hp > 0) this.state = 'idle';
    }

    // Movimiento Físico
    this.x += this.vx; this.y += this.vy;
    if (!this.isGrounded) this.vy -= 0.022;

    if (this.y <= 0) {
      this.y = 0; this.vy = 0; this.isGrounded = true;
      if (this.state === 'jump') this.state = 'idle';
    }

    this.x = Math.max(-10, Math.min(10, this.x));
    this.group.position.set(this.x, this.y, this.z);
    if (this.isBlocking && this.animTimer <= 0) this.state = 'blocking';
    else if (!this.isBlocking && this.state === 'blocking') this.state = 'idle';

    // Orientación hacia el Oponente
    this.dir = this.x < opponent.x ? 1 : -1;
    this.group.rotation.y = this.dir === 1 ? Math.PI / 4 : -Math.PI / 4;

    // Visibilidad de Escudo y Aura
    this.shieldMesh.material.opacity = this.isBlocking ? 0.35 : 0;
    this.auraMesh.material.opacity = this.hiddenPowerActive ? 0.45 + Math.sin(Date.now() * 0.01) * 0.15 : 0;
    if (this.hiddenPowerActive) this.auraMesh.rotation.y += 0.05;

    // Animación Procedural de Articulaciones 3D
    this.animateLimbs();

    if (this.animTimer > 0) {
      this.animTimer--;
      if (this.animTimer <= 0 && this.hp > 0) this.state = 'idle';
    }

    this.vx *= 0.75;
  }

  animateLimbs() {
    const time = Date.now() * 0.008;

    if (this.isBlocking) {
      this.torso.rotation.z = 0;
      this.leftShoulder.rotation.x = -1.1;
      this.rightShoulder.rotation.x = -1.1;
      this.leftForearm.rotation.x = -0.8;
      this.rightForearm.rotation.x = -0.8;
    } else if (this.state === 'idle') {
      this.torso.position.y = 0.3 + Math.sin(time * 2) * 0.03;
      this.leftShoulder.rotation.x = Math.sin(time * 2) * 0.1;
      this.rightShoulder.rotation.x = -Math.sin(time * 2) * 0.1;
      this.leftForearm.rotation.x = 0; this.rightForearm.rotation.x = 0;
      this.leftThigh.rotation.x = 0; this.rightThigh.rotation.x = 0;
    } else if (this.state === 'walk') {
      this.walkCycle += 0.2;
      const legAngle = Math.sin(this.walkCycle) * 0.6;
      this.leftThigh.rotation.x = legAngle; this.rightThigh.rotation.x = -legAngle;
      this.leftShoulder.rotation.x = -legAngle * 0.8; this.rightShoulder.rotation.x = legAngle * 0.8;
    } else if (this.state === 'light') {
      this.rightShoulder.rotation.x = -Math.PI / 2;
      this.rightForearm.rotation.x = -0.3;
    } else if (this.state === 'heavy') {
      this.leftShoulder.rotation.x = -Math.PI / 2;
      this.leftForearm.rotation.x = -0.6;
    } else if (this.state === 'weapon1') {
      this.rightShoulder.rotation.x = -Math.PI * 0.75;
      this.rightForearm.rotation.x = -0.8;
    } else if (this.state === 'elemental' || this.state === 'ultimate') {
      this.leftShoulder.rotation.x = -0.8;
      this.rightShoulder.rotation.x = -1.3;
      this.rightForearm.rotation.x = -0.6;
    } else if (this.state === 'hit') {
      this.torso.rotation.z = -0.3 * this.dir;
    } else {
      this.torso.rotation.z = 0;
    }
  }

  updateCPU(opponent, projectiles, particles3D, scene, difficulty) {
    if (this.stunFrames > 0 || this.hp <= 0) return;
    this.aiTimer--;
    if (this.aiTimer <= 0) {
      this.isBlocking = false;
      const delay = difficulty === 'EXTREMO' ? 6 : difficulty === 'DIFICIL' ? 12 : 20;
      this.aiTimer = delay;
      const dist = Math.abs(this.x - opponent.x);

      if (dist > 2.5) {
        this.vx = (opponent.x > this.x ? 1 : -1) * this.moveSpeed * 0.95;
        this.state = 'walk';
        if (Math.random() < 0.25) this.attackWeapon2(projectiles, scene);
      } else {
        const rand = Math.random();
        if (rand < 0.35) this.attackLight(opponent, particles3D);
        else if (rand < 0.65) this.attackWeapon1(opponent, particles3D);
        else if (difficulty === 'EXTREMO' || difficulty === 'DIFICIL') this.isBlocking = Math.random() < 0.3;
      }
    }
  }

  attackLight(opponent, particles3D) {
    if (this.animTimer > 0 || this.isBlocking) return;
    this.state = 'light'; this.animTimer = 14; audio.playHit();
    if (Math.abs(this.x + this.dir * 1.8 - opponent.x) < 1.6) {
      const dmg = 8 * this.atkMult * (this.hiddenPowerActive ? 1.35 : 1.0);
      opponent.takeDamage(dmg); this.registerHit(opponent, dmg);
    }
  }

  attackHeavy(opponent) {
    if (this.animTimer > 0 || this.isBlocking) return;
    this.state = 'heavy'; this.animTimer = 20; audio.playHit();
    if (Math.abs(this.x + this.dir * 1.9 - opponent.x) < 1.7) {
      const damage = 12 * this.atkMult * (this.hiddenPowerActive ? 1.2 : 1.0);
      opponent.takeDamage(damage); this.registerHit(opponent, damage);
    }
  }

  attackWeapon1(opponent, particles3D) {
    if (this.animTimer > 0 || this.isBlocking) return;
    this.state = 'weapon1'; this.animTimer = 22; audio.playSlash();
    if (Math.abs(this.x - opponent.x) < this.weaponStats.reach + this.weaponUpgrades.reach * 0.3) {
      const weaponMultiplier = 1 + this.weaponUpgrades.damage * 0.12;
      const runeDamage = this.weaponUpgrades.rune ? 7 : 0;
      const dmg = (this.weaponStats.damage * weaponMultiplier + runeDamage) * this.atkMult * (this.hiddenPowerActive ? 1.4 : 1.0);
      opponent.takeDamage(dmg); this.registerHit(opponent, dmg);
    }
  }

  attackWeapon2(projectiles, scene) {
    if (this.animTimer > 0 || this.isBlocking) return;
    this.state = 'weapon2'; this.animTimer = 18; audio.playProjectile();
    const auraHex = parseInt(this.config.colorAura.replace('#', '0x'));
    const projMesh = create3DProjectileMesh(this.config.weapon2, auraHex);
    projMesh.position.set(this.x + this.dir * 0.8, this.y + 1.6, this.z);
    scene.add(projMesh);
    const baseDamage = RANGED_WEAPON_STATS[this.config.weapon2] || 14;
    const damage = baseDamage * (1 + this.rangedUpgrades.ranged * 0.12);
    projectiles.push({ mesh: projMesh, owner: this, dir: this.dir, speed: 0.35, active: true, damage });
  }

  attackElemental(projectiles, scene) {
    const powerLevel = this.powerUpgrades.power || 0;
    const meterCost = Math.max(10, 25 - powerLevel * 5);
    if (this.superMeter < meterCost || this.animTimer > 0 || this.isBlocking) return;
    const elementColors = {
      fire: 0xff4b1f, ice: 0x67e8f9, lightning: 0xfacc15,
      shadow: 0xa855f7, solar: 0xfbbf24, wind: 0x4ade80,
      earth: 0x9a6b3f, water: 0x0284c7, poison: 0x84cc16,
      arcane: 0x6366f1, metal: 0xcbd5e1
    };
    const elementGeometries = {
      fire: () => new THREE.SphereGeometry(0.35, 12, 12),
      ice: () => new THREE.ConeGeometry(0.32, 0.75, 6),
      lightning: () => new THREE.OctahedronGeometry(0.4),
      shadow: () => new THREE.TorusGeometry(0.3, 0.1, 8, 12),
      solar: () => new THREE.DodecahedronGeometry(0.36),
      wind: () => new THREE.TorusGeometry(0.3, 0.06, 8, 16),
      earth: () => new THREE.DodecahedronGeometry(0.4, 0),
      water: () => new THREE.SphereGeometry(0.38, 12, 8),
      poison: () => new THREE.ConeGeometry(0.35, 0.62, 5),
      arcane: () => new THREE.OctahedronGeometry(0.4),
      metal: () => new THREE.BoxGeometry(0.52, 0.52, 0.52)
    };
    this.superMeter -= meterCost;
    this.state = 'elemental'; this.animTimer = 24;
    audio.playProjectile();
    const color = elementColors[this.config.element] || 0xffffff;
    const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.2, metalness: 0.25, roughness: 0.2 });
    const geometry = (elementGeometries[this.config.element] || elementGeometries.fire)();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(this.x + this.dir * 0.9, this.y + 1.5, this.z);
    scene.add(mesh);
    projectiles.push({ mesh, owner: this, dir: this.dir, speed: 0.5, active: true, damage: 16 + powerLevel * 3 });
  }

  attackUltimate(opponent, particles3D, camera) {
    if (this.superMeter < 100 || this.animTimer > 0 || this.isBlocking) return;
    this.superMeter = 0; this.state = 'ultimate'; this.animTimer = 60; this.ultimatesUsed++;
    audio.speak("SUPER FINISHER!");
    const damage = (32 + (this.powerUpgrades.power || 0) * 4) * this.atkMult;
    audio.playSlash();
    opponent.takeDamage(damage);
    this.registerHit(opponent, damage);
  }

  registerHit(opponent, damage) {
    this.comboHits++; this.superMeter = Math.min(100, this.superMeter + 16);
    this.totalDamageDealt += damage;
    if (this.comboHits >= 3 && !this.hiddenPowerActive) {
      this.hiddenPowerActive = true; audio.speak("PODER OCULTO!");
    }
  }
}

/* ==========================================================================
   4. MOTOR PRINCIPAL TRES DIMENSIONES Y GESTIÓN DE ESCENA THREE.JS
   ========================================================================== */
class Game3D {
  constructor() {
    this.container = document.getElementById('canvas-wrapper');
    this.canvas = document.getElementById('threeCanvas');
    this.timer = 99; this.gameMode = 'infinite'; this.infiniteRound = 1; this.isRunning = false;
    this.matchWinner = null;
    this.projectiles = []; this.particles3D = []; this.keys = {};
    this.remoteKeys = {};
    this.onlinePlayer = null;
    this.onlineSocket = null;
    this.onlineReconnectTimer = null;
    this.onlineReconnectAttempt = 0;
    this.onlineMatchRequested = false;
    this.onlineRoomCode = null;
    this.lastSentOnlineInput = null;
    this.shopPlayerId = 1;
    this.playerProgress = {
      1: { coins: this.loadCoins(1), upgrades: this.loadWeaponUpgrades(1) },
      2: { coins: this.loadCoins(2), upgrades: this.loadWeaponUpgrades(2) }
    };

    this.initThree();
    this.updateCoinDisplays();
    this.populateSelects();
    this.bindEvents();
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x05050a);
    this.scene.fog = new THREE.FogExp2(0x05050a, 0.035);

    this.camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 100);
    this.camera.position.set(0, 3.5, 11);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(1200, 675);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    window.addEventListener('resize', () => this.resizeRenderer());

    // Iluminación 3D del Arena
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 12, 8); dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048; dirLight.shadow.mapSize.height = 2048;
    this.scene.add(dirLight);

    // Suelo / Arena Tile Floor
    const floorGeo = new THREE.PlaneGeometry(30, 20);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.5, metalness: 0.4 });
    this.arenaFloor = new THREE.Mesh(floorGeo, floorMat);
    this.arenaFloor.rotation.x = -Math.PI / 2; this.arenaFloor.receiveShadow = true;
    this.scene.add(this.arenaFloor);
    this.arenaDecor = new THREE.Group();
    this.scene.add(this.arenaDecor);
    this.applyArena();
  }

  resizeRenderer() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (!width || !height || !this.renderer) return;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  populateSelects() {}

  loadWeaponUpgrades(playerId) {
    try {
      const key = playerId === 1 ? 'shadowKombatWeaponUpgrades' : 'shadowKombatWeaponUpgradesP2';
      return JSON.parse(localStorage.getItem(key) || '{}');
    } catch (error) {
      return {};
    }
  }

  getUpgradeSet(item, playerId, category) {
    const saved = this.playerProgress[playerId].upgrades;
    return saved[`${category}:${item}`] || (category === 'melee' && saved[item]) || {};
  }

  getUpgradeTarget(type, fighter) {
    if (type === 'ranged') return { category: 'ranged', item: fighter.config.weapon2 };
    if (type === 'power') return { category: 'power', item: fighter.config.element };
    return { category: 'melee', item: fighter.config.weapon1 };
  }

  getFighterUpgradeLevel(fighter, playerId) {
    const sets = [
      this.getUpgradeSet(fighter.config.weapon1, playerId, 'melee'),
      this.getUpgradeSet(fighter.config.weapon2, playerId, 'ranged'),
      this.getUpgradeSet(fighter.config.element, playerId, 'power')
    ];
    return 1 + sets.reduce((total, upgrades) => total + Object.values(upgrades).reduce((sum, level) => sum + level, 0), 0);
  }

  loadCoins(playerId) {
    try {
      const key = playerId === 1 ? 'shadowKombatCoins' : 'shadowKombatCoinsP2';
      const savedCoins = Number(localStorage.getItem(key) || 0);
      return Number.isFinite(savedCoins) ? Math.max(0, savedCoins) : 0;
    } catch (error) {
      return 0;
    }
  }

  saveCoins(playerId) {
    try {
      const key = playerId === 1 ? 'shadowKombatCoins' : 'shadowKombatCoinsP2';
      localStorage.setItem(key, String(this.playerProgress[playerId].coins));
    } catch (error) {
      // Las monedas siguen disponibles durante esta sesion si el almacenamiento no esta disponible.
    }
  }

  updateCoinDisplays() {
    document.querySelectorAll('[data-coin-balance]').forEach(display => {
      const playerId = display.dataset.coinBalance === 'active' ? this.shopPlayerId : Number(display.dataset.coinBalance);
      display.innerText = this.playerProgress[playerId].coins;
    });
  }

  saveWeaponUpgrades(playerId) {
    try {
      const key = playerId === 1 ? 'shadowKombatWeaponUpgrades' : 'shadowKombatWeaponUpgradesP2';
      localStorage.setItem(key, JSON.stringify(this.playerProgress[playerId].upgrades));
    } catch (error) {
      // La progresion sigue activa durante esta sesion si el almacenamiento no esta disponible.
    }
  }

  resetWeaponUpgrades(playerId) {
    this.playerProgress[playerId].upgrades = {};
    this.saveWeaponUpgrades(playerId);
  }

  showWeaponUpgrades(playerId) {
    this.shopPlayerId = playerId;
    const panel = document.getElementById('weapon-upgrade-panel');
    const fighter = playerId === 1 ? this.p1 : this.p2;
    const weapons = this.getUpgradeSet(fighter.config.weapon1, playerId, 'melee');
    const ranged = this.getUpgradeSet(fighter.config.weapon2, playerId, 'ranged');
    const powers = this.getUpgradeSet(fighter.config.element, playerId, 'power');
    const totalLevel = 1 + Object.values(weapons).reduce((sum, level) => sum + level, 0)
      + Object.values(ranged).reduce((sum, level) => sum + level, 0)
      + Object.values(powers).reduce((sum, level) => sum + level, 0);
    document.getElementById('weapon-upgrade-player').innerText = `TIENDA JUGADOR ${playerId}`;
    document.getElementById('weapon-upgrade-name').innerText = `${WEAPON_NAMES[fighter.config.weapon1] || 'Arma'} + ${fighter.config.weapon2}`;
    document.getElementById('weapon-upgrade-rank').innerText = `NIVEL ${totalLevel}`;
    document.getElementById('weapon-upgrade-status').innerText = `Monedas disponibles: ${this.playerProgress[playerId].coins}`;
    this.updateCoinDisplays();
    panel.classList.remove('hidden');
    panel.querySelectorAll('[data-upgrade]').forEach(button => {
      const type = button.dataset.upgrade;
      const target = this.getUpgradeTarget(type, fighter);
      const upgrades = this.getUpgradeSet(target.item, playerId, target.category);
      const limit = UPGRADE_LIMITS[type];
      const level = upgrades[type] || 0;
      const cost = UPGRADE_COSTS[type];
      button.disabled = level >= limit || this.playerProgress[playerId].coins < cost;
      button.querySelector('[data-upgrade-level]').innerText = level >= limit ? 'MAX' : `Nivel ${level} -> ${level + 1}`;
      button.querySelector('[data-upgrade-cost]').innerText = level >= limit ? 'COMPLETO' : `${cost} monedas`;
    });
  }

  applyWeaponUpgrade(type) {
    const playerId = this.shopPlayerId;
    const fighter = playerId === 1 ? this.p1 : this.p2;
    if (!fighter || !UPGRADE_COSTS[type]) return;
    const target = this.getUpgradeTarget(type, fighter);
    const upgrades = this.getUpgradeSet(target.item, playerId, target.category);
    const limit = UPGRADE_LIMITS[type];
    const cost = UPGRADE_COSTS[type];
    if ((upgrades[type] || 0) >= limit || this.playerProgress[playerId].coins < cost) return;
    this.playerProgress[playerId].coins -= cost;
    upgrades[type] = (upgrades[type] || 0) + 1;
    this.playerProgress[playerId].upgrades[`${target.category}:${target.item}`] = upgrades;
    this.saveWeaponUpgrades(playerId);
    this.saveCoins(playerId);
    this.updateCoinDisplays();
    this.showWeaponUpgrades(playerId);
  }

  applyArena() {
    const arenas = {
      colosseum: { background: 0x080611, floor: 0x282044, accent: 0xdc2626, decor: 'pillars' },
      volcano: { background: 0x1c0805, floor: 0x482017, accent: 0xff5a1f, decor: 'volcano' },
      cyber: { background: 0x04111d, floor: 0x10283b, accent: 0x22d3ee, decor: 'cyber' },
      forest: { background: 0x07160f, floor: 0x183522, accent: 0x65a30d, decor: 'forest' },
      ice: { background: 0x081722, floor: 0x315064, accent: 0x67e8f9, decor: 'ice' },
      temple: { background: 0x1a1008, floor: 0x49351c, accent: 0xfbbf24, decor: 'temple' }
    };
    const arena = arenas[document.getElementById('select-arena').value] || arenas.colosseum;
    this.scene.background.setHex(arena.background);
    this.scene.fog.color.setHex(arena.background);
    this.arenaFloor.material.color.setHex(arena.floor);

    this.arenaDecor.traverse(object => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(material => material.dispose());
      }
    });
    this.arenaDecor.clear();

    const makeMaterial = (color, emissive = 0x000000) => new THREE.MeshStandardMaterial({
      color, roughness: 0.55, metalness: 0.25, emissive, emissiveIntensity: 0.35
    });
    const addMesh = (geometry, material, x, y, z) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      this.arenaDecor.add(mesh);
    };

    for (const x of [-12, -9, 9, 12]) {
      if (arena.decor === 'forest') {
        addMesh(new THREE.CylinderGeometry(0.18, 0.3, 5, 8), makeMaterial(0x614329), x, 2.5, -5);
        addMesh(new THREE.ConeGeometry(1.5, 4, 8), makeMaterial(0x28734a, arena.accent), x, 6.5, -5);
      } else if (arena.decor === 'ice') {
        const crystal = new THREE.Mesh(new THREE.ConeGeometry(1.2, 6, 6), makeMaterial(0x9be8f5, arena.accent));
        crystal.position.set(x, 3, -5);
        crystal.rotation.z = x < 0 ? 0.12 : -0.12;
        crystal.castShadow = true;
        this.arenaDecor.add(crystal);
      } else if (arena.decor === 'cyber') {
        addMesh(new THREE.BoxGeometry(1.2, 7, 1.2), makeMaterial(0x12334a, arena.accent), x, 3.5, -5);
        addMesh(new THREE.BoxGeometry(1.35, 0.12, 1.35), makeMaterial(arena.accent, arena.accent), x, 5.2, -4.3);
      } else if (arena.decor === 'volcano') {
        addMesh(new THREE.ConeGeometry(1.8, 5, 7), makeMaterial(0x39211d, arena.accent), x, 2.5, -5);
      } else {
        const pillarColor = arena.decor === 'temple' ? 0x8c6729 : 0x312e40;
        addMesh(new THREE.CylinderGeometry(0.55, 0.7, 8, 12), makeMaterial(pillarColor, arena.accent), x, 4, -5);
      }
      const light = new THREE.PointLight(arena.accent, 1.8, 14);
      light.position.set(x, 5, -3);
      this.arenaDecor.add(light);
    }
  }

  bindEvents() {
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      this.broadcastOnlineInput();
    });
    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
      this.broadcastOnlineInput();
    });
    document.querySelectorAll('[data-touch-key]').forEach(button => {
      const key = button.dataset.touchKey;
      const release = event => {
        event.preventDefault();
        this.keys[key] = false;
        this.broadcastOnlineInput();
        button.classList.remove('is-pressed');
      };
      button.addEventListener('pointerdown', event => {
        if (!this.isRunning) return;
        event.preventDefault();
        this.keys[key] = true;
        this.broadcastOnlineInput();
        button.classList.add('is-pressed');
        button.setPointerCapture(event.pointerId);
      });
      button.addEventListener('pointerup', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('lostpointercapture', release);
    });

    document.getElementById('btn-mode-infinite').addEventListener('click', () => {
      this.gameMode = 'infinite';
      document.getElementById('btn-mode-infinite').className = "px-6 py-2 bg-gradient-to-r from-amber-700 to-red-800 text-white font-mk text-xs md:text-sm rounded-xl border-2 border-amber-400 font-bold box-glow-gold";
      document.getElementById('btn-mode-versus').className = "px-6 py-2 bg-stone-900 text-stone-400 font-mk text-xs md:text-sm rounded-xl border border-stone-700 font-bold";
      document.getElementById('p2-header-badge').innerText = "RIVAL INFINITO (CPU AI)";
      document.querySelector('[data-player-two-wallet]').classList.add('hidden');
      document.getElementById('touch-controls-p2').classList.add('hidden');
    });

    document.getElementById('btn-mode-versus').addEventListener('click', () => {
      this.gameMode = 'versus';
      document.getElementById('btn-mode-versus').className = "px-6 py-2 bg-gradient-to-r from-blue-700 to-cyan-800 text-white font-mk text-xs md:text-sm rounded-xl border-2 border-cyan-400 font-bold box-glow-blue";
      document.getElementById('btn-mode-infinite').className = "px-6 py-2 bg-stone-900 text-stone-400 font-mk text-xs md:text-sm rounded-xl border border-stone-700 font-bold";
      document.getElementById('p2-header-badge').innerText = "JUGADOR 2 (FLECHAS / TECLAS)";
      document.querySelector('[data-player-two-wallet]').classList.remove('hidden');
      document.getElementById('touch-controls-p2').classList.remove('hidden');
    });

    document.getElementById('btn-mode-online').addEventListener('click', () => this.findOnlineMatch());
    document.getElementById('btn-create-room').addEventListener('click', () => this.createOnlineRoom());
    document.getElementById('btn-join-room').addEventListener('click', () => this.joinOnlineRoom());
    document.getElementById('online-room-code').addEventListener('keydown', event => {
      if (event.key === 'Enter') this.joinOnlineRoom();
    });
    document.getElementById('btn-cancel-online').addEventListener('click', () => this.cancelOnlineMatch());

    document.getElementById('btn-start-fight').addEventListener('click', () => {
      this.infiniteRound = 1;
      this.resetWeaponUpgrades(1);
      this.resetWeaponUpgrades(2);
      this.matchWinner = null;
      this.startMatch();
    });

    document.getElementById('btn-rematch').addEventListener('click', () => {
      document.getElementById('modal-victory').classList.add('hidden');
      if (this.gameMode === 'infinite') {
        if (this.matchWinner === 1) this.infiniteRound++;
        else {
          this.infiniteRound = 1;
          this.resetWeaponUpgrades(1);
        }
      }
      this.matchWinner = null;
      this.startMatch();
    });

    document.getElementById('btn-re-select').addEventListener('click', () => {
      document.getElementById('modal-victory').classList.add('hidden');
      this.disconnectOnline();
      document.getElementById('game-screen').classList.add('hidden');
      document.getElementById('selection-screen').classList.remove('hidden');
    });

    document.getElementById('btn-toggle-sound').addEventListener('click', () => {
      audio.enabled = !audio.enabled;
      document.getElementById('sound-text').innerText = audio.enabled ? "AUDIO ON" : "AUDIO OFF";
      document.getElementById('sound-icon').classList.toggle('fa-volume-high', audio.enabled);
      document.getElementById('sound-icon').classList.toggle('fa-volume-xmark', !audio.enabled);
      if (audio.enabled && this.isRunning) audio.playBackgroundMusic();
      else audio.stopBackgroundMusic();
      if (!audio.enabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    });

    document.getElementById('btn-device-mode').addEventListener('click', event => {
      const phoneMode = document.body.classList.toggle('phone-mode');
      const button = event.currentTarget;
      button.setAttribute('aria-pressed', String(phoneMode));
      document.getElementById('device-mode-text').innerText = phoneMode ? 'MODO COMPUTADOR' : 'MODO TELÉFONO';
      document.getElementById('device-mode-icon').classList.toggle('fa-mobile-screen-button', !phoneMode);
      document.getElementById('device-mode-icon').classList.toggle('fa-desktop', phoneMode);
      requestAnimationFrame(() => this.resizeRenderer());
    });

    document.getElementById('btn-show-controls').addEventListener('click', () => { document.getElementById('modal-controls').classList.remove('hidden'); });
    document.getElementById('btn-close-controls').addEventListener('click', () => { document.getElementById('modal-controls').classList.add('hidden'); });
    document.querySelectorAll('[data-upgrade]').forEach(button => {
      button.addEventListener('click', () => this.applyWeaponUpgrade(button.dataset.upgrade));
    });
  }

  getFighterConfig(playerId) {
    const prefix = `p${playerId}`;
    const weapon1 = document.getElementById(`${prefix}-weapon1`).value;
    const weapon2 = document.getElementById(`${prefix}-weapon2`).value;
    const element = document.getElementById(`${prefix}-element`).value;
    return {
      outfit: document.getElementById(`${prefix}-outfit`).value,
      element,
      weapon1,
      weapon2,
      weaponUpgrades: this.getUpgradeSet(weapon1, playerId, 'melee'),
      rangedUpgrades: this.getUpgradeSet(weapon2, playerId, 'ranged'),
      powerUpgrades: this.getUpgradeSet(element, playerId, 'power'),
      style: document.getElementById(`${prefix}-style`).value,
      colorSkin: document.getElementById(`${prefix}-color-skin`).value,
      colorSuit: document.getElementById(`${prefix}-color-suit`).value,
      colorAura: document.getElementById(`${prefix}-color-aura`).value
    };
  }

  showOnlineStatus(message, visible = true) {
    const panel = document.getElementById('online-match-status');
    document.getElementById('online-match-message').innerText = message;
    panel.classList.toggle('hidden', !visible);
  }

  findOnlineMatch() {
    this.startOnlineSearch(null);
  }

  createOnlineRoom() {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const randomValues = new Uint32Array(6);
    window.crypto.getRandomValues(randomValues);
    const roomCode = Array.from(randomValues, value => characters[value % characters.length]).join('');
    document.getElementById('online-room-code').value = roomCode;
    this.startOnlineSearch(roomCode);
  }

  joinOnlineRoom() {
    const roomCode = document.getElementById('online-room-code').value.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(roomCode)) {
      this.showOnlineStatus('Ingresa un código de sala válido de 6 letras o números.');
      return;
    }
    document.getElementById('online-room-code').value = roomCode;
    this.startOnlineSearch(roomCode);
  }

  startOnlineSearch(roomCode) {
    if (!window.WebSocket || !['http:', 'https:'].includes(window.location.protocol)) {
      this.showOnlineStatus('Para jugar en línea, abre el juego desde el servidor con npm start (no como archivo local).');
      return;
    }
    this.disconnectOnline();
    this.onlineMatchRequested = true;
    this.onlineReconnectAttempt = 0;
    this.onlineRoomCode = roomCode;
    document.getElementById('online-room-code').value = roomCode || '';
    this.connectOnline();
  }

  connectOnline() {
    if (!this.onlineMatchRequested) return;
    this.gameMode = 'online';
    this.onlinePlayer = null;
    this.remoteKeys = {};
    this.setOnlineControlsDisabled(true);
    this.showOnlineStatus('Conectando al servidor de partidas...');
    const scheme = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let socket;
    try {
      socket = new WebSocket(`${scheme}//${window.location.host}/multiplayer`);
    } catch (error) {
      this.scheduleOnlineReconnect();
      return;
    }
    this.onlineSocket = socket;

    socket.addEventListener('open', () => {
      if (this.onlineSocket !== socket || !this.onlineMatchRequested) return;
      try {
        const queueMessage = {
          type: 'queue',
          fighter: this.getFighterConfig(1),
          arena: document.getElementById('select-arena').value
        };
        if (this.onlineRoomCode) queueMessage.roomCode = this.onlineRoomCode;
        socket.send(JSON.stringify(queueMessage));
      } catch (error) {
        this.scheduleOnlineReconnect();
        return;
      }
      this.showOnlineStatus(this.onlineRoomCode
        ? `Esperando a un rival en la sala ${this.onlineRoomCode}... Comparte el código para que se una.`
        : 'Buscando un rival en línea... La partida comenzará al encontrar a otra persona.');
    });
    socket.addEventListener('message', event => {
      if (this.onlineSocket !== socket) return;
      let message;
      try {
        message = JSON.parse(event.data);
      } catch (error) {
        this.showOnlineStatus('El servidor envió una respuesta no válida. Inténtalo de nuevo.');
        return;
      }
      if (message.type === 'waiting') {
        this.onlineReconnectAttempt = 0;
        this.showOnlineStatus(this.onlineRoomCode
          ? `Esperando a un rival en la sala ${this.onlineRoomCode}... Comparte el código para que se una.`
          : 'Buscando un rival en línea... La partida comenzará al encontrar a otra persona.');
      } else if (message.type === 'match') {
        this.onlineReconnectAttempt = 0;
        this.onlinePlayer = message.playerNumber;
        this.remoteKeys = {};
        this.lastSentOnlineInput = null;
        this.showOnlineStatus('', false);
        document.getElementById('p2-header-badge').innerText = `RIVAL EN LÍNEA · TÚ JUGADOR ${this.onlinePlayer}`;
        document.getElementById('touch-controls-p2').classList.add('hidden');
        this.matchWinner = null;
        this.startMatch(message);
        this.broadcastOnlineInput();
      } else if (message.type === 'input') {
        this.remoteKeys = message.keys;
      } else if (message.type === 'finished') {
        if (this.isRunning) this.endGame(message.winner);
      } else if (message.type === 'opponent-left') {
        this.isRunning = false;
        audio.stopBackgroundMusic();
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('selection-screen').classList.remove('hidden');
        this.scheduleOnlineReconnect('Tu rival se desconectó. Buscando otra partida...');
      } else if (message.type === 'error') {
        this.showOnlineStatus(message.message || 'No se pudo encontrar una partida.');
        this.disconnectOnline();
      }
    });
    socket.addEventListener('error', () => {
      if (this.onlineSocket !== socket) return;
      this.scheduleOnlineReconnect();
    });
    socket.addEventListener('close', () => {
      if (this.onlineSocket !== socket) return;
      this.scheduleOnlineReconnect();
    });
  }

  scheduleOnlineReconnect(message = null) {
    if (!this.onlineMatchRequested || this.onlineReconnectTimer !== null) return;
    const socket = this.onlineSocket;
    this.onlineSocket = null;
    this.onlinePlayer = null;
    this.remoteKeys = {};
    this.lastSentOnlineInput = null;
    if (socket && socket.readyState < WebSocket.CLOSING) socket.close();

    if (this.gameMode === 'online'
      && !document.getElementById('game-screen').classList.contains('hidden')) {
      this.isRunning = false;
      audio.stopBackgroundMusic();
      document.getElementById('game-screen').classList.add('hidden');
      document.getElementById('selection-screen').classList.remove('hidden');
      document.getElementById('modal-victory').classList.add('hidden');
    }

    this.setOnlineControlsDisabled(true);
    const delay = Math.min(1000 * (2 ** this.onlineReconnectAttempt), 30_000);
    this.onlineReconnectAttempt += 1;
    const seconds = Math.ceil(delay / 1000);
    const failedAttempts = this.onlineReconnectAttempt;
    this.showOnlineStatus(message || (failedAttempts >= 3
      ? `No se pudo conectar con el servidor de partidas (intento ${failedAttempts}). Revisa que el servidor esté activo y que permita WebSocket. Reintentando en ${seconds} s...`
      : `Se perdió la conexión. Reintentando en ${seconds} s...`));
    this.onlineReconnectTimer = window.setTimeout(() => {
      this.onlineReconnectTimer = null;
      this.connectOnline();
    }, delay);
  }

  setOnlineControlsDisabled(disabled) {
    ['btn-mode-infinite', 'btn-mode-versus', 'btn-mode-online', 'btn-start-fight'].forEach(id => {
      document.getElementById(id).disabled = disabled;
    });
  }

  broadcastOnlineInput() {
    if (!this.onlineSocket || this.onlineSocket.readyState !== WebSocket.OPEN || this.gameMode !== 'online') return;
    const codes = ['KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyJ', 'KeyK', 'KeyL', 'KeyU', 'KeyI', 'KeyO'];
    const keys = {};
    codes.forEach(code => { keys[code] = !!this.keys[code]; });
    const serializedKeys = JSON.stringify(keys);
    if (serializedKeys === this.lastSentOnlineInput) return;
    this.lastSentOnlineInput = serializedKeys;
    this.onlineSocket.send(JSON.stringify({ type: 'input', keys }));
  }

  cancelOnlineMatch() {
    this.disconnectOnline();
    this.gameMode = 'infinite';
    this.showOnlineStatus('', false);
  }

  disconnectOnline() {
    this.onlineMatchRequested = false;
    this.onlineRoomCode = null;
    if (this.onlineReconnectTimer !== null) {
      window.clearTimeout(this.onlineReconnectTimer);
      this.onlineReconnectTimer = null;
    }
    const socket = this.onlineSocket;
    this.onlineSocket = null;
    this.onlinePlayer = null;
    this.remoteKeys = {};
    this.lastSentOnlineInput = null;
    this.setOnlineControlsDisabled(false);
    this.gameMode = 'infinite';
    document.getElementById('p2-header-badge').innerText = 'RIVAL INFINITO (CPU AI)';
    document.getElementById('touch-controls-p2').classList.add('hidden');
    document.querySelector('[data-player-two-wallet]').classList.add('hidden');
    if (socket && socket.readyState < WebSocket.CLOSING) {
      socket.close(1000, 'Leaving match');
    }
  }

  startMatch(onlineMatch = null) {
    document.getElementById('selection-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('btn-rematch').classList.remove('hidden');
    document.getElementById('btn-re-select').innerText = 'VOLVER AL MENÚ';
    this.resizeRenderer();
    this.applyArena();
    this.projectiles.forEach(projectile => this.scene.remove(projectile.mesh));
    this.projectiles = [];

    // Limpiar modelos 3D anteriores si existen
    if (this.p1) this.scene.remove(this.p1.group);
    if (this.p2) this.scene.remove(this.p2.group);

    if (onlineMatch) document.getElementById('select-arena').value = onlineMatch.arena;
    const p1Cfg = onlineMatch ? onlineMatch.fighters[0] : this.getFighterConfig(1);
    const p1Weapon = p1Cfg.weapon1;
    this.p1 = new HumanoidFighter3D(1, p1Cfg, false, this.scene);

    const p2Cfg = onlineMatch ? onlineMatch.fighters[1] : this.getFighterConfig(2);
    const p2Weapon = p2Cfg.weapon1;
    if (this.gameMode === 'infinite') {
      const scaling = Math.min(this.infiniteRound - 1, 40);
      p2Cfg.hpMax = 100 + scaling * 2;
      p2Cfg.combatMultiplier = 1 + scaling * 0.02;
      this.p2 = new HumanoidFighter3D(2, p2Cfg, true, this.scene);
      document.getElementById('hud-p2-name').innerText = `RIVAL RONDA ${this.infiniteRound}`;
    } else {
      this.p2 = new HumanoidFighter3D(2, p2Cfg, true, this.scene);
      document.getElementById('hud-p1-name').innerText = this.gameMode === 'online'
        ? (this.onlinePlayer === 1 ? 'TÚ' : 'RIVAL')
        : 'JUGADOR 1';
      document.getElementById('hud-p2-name').innerText = this.gameMode === 'online'
        ? (this.onlinePlayer === 2 ? 'TÚ' : 'RIVAL')
        : 'JUGADOR 2';
    }

    document.getElementById('hud-p1-weapon').innerText = `${WEAPON_NAMES[p1Weapon] || 'Arma'} · NIV ${this.getFighterUpgradeLevel(this.p1, 1)}`;
    document.getElementById('hud-p2-weapon').innerText = `${WEAPON_NAMES[p2Weapon] || 'Arma'} · NIV ${this.getFighterUpgradeLevel(this.p2, 2)}`;

    this.timer = 99; this.isRunning = true;
    this.lastTimerTick = performance.now();
    document.getElementById('game-timer').innerText = this.timer;
    document.getElementById('round-stage-badge').innerText = this.gameMode === 'infinite'
      ? `RONDA ${this.infiniteRound} · MODO INFINITO`
      : this.gameMode === 'online' ? 'COMBATE EN LÍNEA' : 'COMBATE VERSUS';
    audio.speak("FIGHT!");
    audio.playBackgroundMusic();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    if (!this.isRunning) return;

    const now = performance.now();
    const elapsedSeconds = Math.floor((now - this.lastTimerTick) / 1000);
    if (elapsedSeconds > 0) {
      this.timer = Math.max(0, this.timer - elapsedSeconds);
      this.lastTimerTick += elapsedSeconds * 1000;
      document.getElementById('game-timer').innerText = this.timer;
      if (this.timer === 0) {
        if (this.gameMode !== 'online' || this.onlinePlayer === 1) this.endGame();
        if (!this.isRunning) return;
      }
    }

    // P1 Controls
    const p1Controls = this.gameMode === 'online' && this.onlinePlayer !== 1 ? this.remoteKeys : this.keys;
    if (p1Controls['KeyA']) { this.p1.vx = -this.p1.moveSpeed; this.p1.state = 'walk'; }
    else if (p1Controls['KeyD']) { this.p1.vx = this.p1.moveSpeed; this.p1.state = 'walk'; }
    if (p1Controls['KeyW'] && this.p1.isGrounded) { this.p1.vy = this.p1.jumpPower; this.p1.isGrounded = false; }
    this.p1.isBlocking = !!p1Controls['KeyS'];
    if (p1Controls['KeyJ']) this.p1.attackLight(this.p2, this.particles3D);
    if (p1Controls['KeyK']) this.p1.attackHeavy(this.p2);
    if (p1Controls['KeyL']) this.p1.attackWeapon1(this.p2, this.particles3D);
    if (p1Controls['KeyU']) this.p1.attackWeapon2(this.projectiles, this.scene);
    if (p1Controls['KeyI']) this.p1.attackElemental(this.projectiles, this.scene);
    if (p1Controls['KeyO']) this.p1.attackUltimate(this.p2, this.particles3D, this.camera);

    // P2 Controls (Versus vs CPU)
    if (this.gameMode === 'versus' || this.gameMode === 'online') {
      const p2Controls = this.gameMode === 'online' && this.onlinePlayer !== 2 ? this.remoteKeys : this.keys;
      const moveLeft = this.gameMode === 'online' ? p2Controls['KeyA'] : p2Controls['ArrowLeft'];
      const moveRight = this.gameMode === 'online' ? p2Controls['KeyD'] : p2Controls['ArrowRight'];
      const jump = this.gameMode === 'online' ? p2Controls['KeyW'] : p2Controls['ArrowUp'];
      const block = this.gameMode === 'online' ? p2Controls['KeyS'] : p2Controls['ArrowDown'];
      if (moveLeft) { this.p2.vx = -this.p2.moveSpeed; this.p2.state = 'walk'; }
      else if (moveRight) { this.p2.vx = this.p2.moveSpeed; this.p2.state = 'walk'; }
      if (jump && this.p2.isGrounded) { this.p2.vy = this.p2.jumpPower; this.p2.isGrounded = false; }
      this.p2.isBlocking = !!block;
      if (this.gameMode === 'online') {
        if (p2Controls['KeyJ']) this.p2.attackLight(this.p1, this.particles3D);
        if (p2Controls['KeyK']) this.p2.attackHeavy(this.p1);
        if (p2Controls['KeyL']) this.p2.attackWeapon1(this.p1, this.particles3D);
        if (p2Controls['KeyU']) this.p2.attackWeapon2(this.projectiles, this.scene);
        if (p2Controls['KeyI']) this.p2.attackElemental(this.projectiles, this.scene);
        if (p2Controls['KeyO']) this.p2.attackUltimate(this.p1, this.particles3D, this.camera);
      } else {
        if (p2Controls['Numpad1'] || p2Controls['KeyF']) this.p2.attackLight(this.p1, this.particles3D);
        if (p2Controls['Numpad2'] || p2Controls['KeyG']) this.p2.attackHeavy(this.p1);
        if (p2Controls['Numpad3'] || p2Controls['KeyH']) this.p2.attackWeapon1(this.p1, this.particles3D);
        if (p2Controls['Numpad7'] || p2Controls['KeyV']) this.p2.attackWeapon2(this.projectiles, this.scene);
        if (p2Controls['KeyB']) this.p2.attackElemental(this.p1, this.projectiles, this.scene);
        if (p2Controls['Numpad9'] || p2Controls['KeyN']) this.p2.attackUltimate(this.p1, this.particles3D, this.camera);
      }
    } else {
      this.p2.updateCPU(this.p1, this.projectiles, this.particles3D, this.scene, document.getElementById('select-difficulty').value);
    }

    this.p1.update(this.p2, this.projectiles, this.particles3D, this.scene);
    this.p2.update(this.p1, this.projectiles, this.particles3D, this.scene);

    // Projectile Movement & 3D Collisions
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.mesh.position.x += pr.speed * pr.dir; pr.mesh.rotation.z += 0.2;
      const tgt = pr.owner === this.p1 ? this.p2 : this.p1;
      if (Math.abs(pr.mesh.position.x - tgt.x) < 0.8) {
        const damage = pr.damage || 14;
        tgt.takeDamage(damage);
        pr.owner.registerHit(tgt, damage);
        pr.active = false; this.scene.remove(pr.mesh);
      }
      if (Math.abs(pr.mesh.position.x) > 12) { pr.active = false; this.scene.remove(pr.mesh); }
      if (!pr.active) this.projectiles.splice(i, 1);
    }

    // Dynamic 3D Camera Tracking
    const midX = (this.p1.x + this.p2.x) / 2;
    const dist = Math.abs(this.p1.x - this.p2.x);
    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, midX, 0.1);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, Math.max(9, dist * 0.95 + 4), 0.1);
    this.camera.lookAt(midX, 1.8, 0);

    // HUD Progress
    const p1Health = Math.ceil(Math.max(0, this.p1.hp) / this.p1.hpMax * 100);
    const p2Health = Math.ceil(Math.max(0, this.p2.hp) / this.p2.hpMax * 100);
    document.getElementById('hud-p1-hp-fill').style.width = `${p1Health}%`;
    document.getElementById('hud-p2-hp-fill').style.width = `${p2Health}%`;
    document.getElementById('hud-p1-hp-text').innerText = `${p1Health}%`;
    document.getElementById('hud-p2-hp-text').innerText = `${p2Health}%`;
    document.getElementById('hud-p1-super-fill').style.width = `${this.p1.superMeter}%`;
    document.getElementById('hud-p2-super-fill').style.width = `${this.p2.superMeter}%`;
    document.getElementById('hud-p1-super-text').innerText = `${Math.floor(this.p1.superMeter)}%`;
    document.getElementById('hud-p2-super-text').innerText = `${Math.floor(this.p2.superMeter)}%`;

    if ((this.p1.hp <= 0 || this.p2.hp <= 0) && (this.gameMode !== 'online' || this.onlinePlayer === 1)) this.endGame();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  loop() {
    if (!this.isRunning) return;
    this.update(); this.render();
    requestAnimationFrame(() => this.loop());
  }

  endGame(winnerOverride = undefined) {
    if (!this.isRunning) return;
    if (this.gameMode === 'online' && this.onlinePlayer === 2 && winnerOverride === undefined) return;
    this.isRunning = false;
    audio.stopBackgroundMusic();
    const hasWinnerOverride = winnerOverride !== undefined;
    const p1Wins = hasWinnerOverride
      ? winnerOverride === 1
      : (this.timer === 0 ? this.p1.hp >= this.p2.hp : this.p1.hp > 0);
    const winnerPlayer = hasWinnerOverride ? winnerOverride : (p1Wins ? 1 : (this.gameMode === 'versus' ? 2 : null));
    this.matchWinner = winnerPlayer;
    if (winnerPlayer && this.gameMode !== 'online') {
      this.playerProgress[winnerPlayer].coins += 100;
      this.saveCoins(winnerPlayer);
      this.updateCoinDisplays();
    }

    if (this.gameMode === 'online' && this.onlinePlayer === 1 && this.onlineSocket && this.onlineSocket.readyState === WebSocket.OPEN) {
      this.onlineSocket.send(JSON.stringify({ type: 'finished', winner: winnerPlayer }));
    }

    const victoryTitle = this.gameMode === 'online'
      ? (winnerPlayer === null ? '¡EMPATE!' : winnerPlayer === this.onlinePlayer ? '¡GANASTE!' : '¡PERDISTE!')
      : this.gameMode === 'versus'
        ? (p1Wins ? '¡JUGADOR 1 GANA!' : '¡JUGADOR 2 GANA!')
        : (p1Wins ? `¡RONDA ${this.infiniteRound} SUPERADA!` : `EL RIVAL GANA LA RONDA ${this.infiniteRound}`);
    audio.speak(victoryTitle);
    document.getElementById('victory-title').innerText = victoryTitle;
    document.getElementById('victory-subtitle').innerText = this.gameMode === 'online'
      ? 'La partida en línea terminó.'
      : winnerPlayer ? `+100 MONEDAS PARA JUGADOR ${winnerPlayer}` : 'REINTENTA PARA LLEGAR A LA SIGUIENTE RONDA';
    const upgradePanel = document.getElementById('weapon-upgrade-panel');
    upgradePanel.classList.add('hidden');
    if (winnerPlayer && this.gameMode !== 'online') this.showWeaponUpgrades(winnerPlayer);
    document.getElementById('btn-rematch').classList.toggle('hidden', this.gameMode === 'online');
    document.getElementById('btn-rematch').innerText = this.gameMode === 'infinite'
      ? (p1Wins ? 'SIGUIENTE RONDA' : 'EMPEZAR DE NUEVO')
      : 'REVANCHA';
    document.getElementById('btn-re-select').innerText = this.gameMode === 'online' ? 'SALIR DE LA PARTIDA' : 'VOLVER AL MENÚ';
    document.getElementById('modal-victory').classList.remove('hidden');
  }
}

window.addEventListener('load', () => { window.game3D = new Game3D(); });