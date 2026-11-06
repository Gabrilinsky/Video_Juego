/* ==========================================================================
   1. CATÁLOGOS DE ARSENAL (50 MELEE, 50 PROYECTILES, 50 ELEMENTOS, 50 TRAJES)
   ========================================================================== */
const WEAPONS_50_MELEE = [
  { id: "katana", name: "Katana de Acero", type: "katana" },
  { id: "sai", name: "Sai Doble Ninja", type: "sai" },
  { id: "kama", name: "Kusarigama Hoz", type: "kama" },
  { id: "spear", name: "Lanza Naginata", type: "spear" },
  { id: "broadsword", name: "Gran Mandoble", type: "sword" },
  ...Array.from({length: 45}, (_, i) => ({ id: `m_weapon_${i+6}`, name: `Arma Melee #${i+6}`, type: i % 2 === 0 ? "katana" : "spear" }))
];

const WEAPONS_50_RANGED = [
  { id: "shuriken", name: "Shuriken Ninja", type: "shuriken" },
  { id: "kunai", name: "Kunai Táctico", type: "kunai" },
  { id: "chakram", name: "Chakram Solar", type: "chakram" },
  ...Array.from({length: 47}, (_, i) => ({ id: `r_weapon_${i+4}`, name: `Proyectil #${i+4}`, type: i % 2 === 0 ? "shuriken" : "kunai" }))
];

const ELEMENTS_50 = [
  { id: "fire", name: "Fuego del Dragón", color: "#ff4500" },
  { id: "ice", name: "Hielo Cero", color: "#00ffff" },
  { id: "lightning", name: "Rayo Divino", color: "#facc15" },
  ...Array.from({length: 47}, (_, i) => ({ id: `element_${i+4}`, name: `Elemento #${i+4}`, color: `hsl(${(i * 37) % 360}, 85%, 55%)` }))
];

const OUTFITS_50 = [
  { id: "samurai", name: "Armadura Samurái" },
  { id: "ninja", name: "Traje Ninja" },
  { id: "assassin", name: "Túnica de Asesino" },
  ...Array.from({length: 47}, (_, i) => ({ id: `outfit_${i+4}`, name: `Traje #${i+4}` }))
];

/* ==========================================================================
   2. SINTETIZADOR DE SONIDO WEB AUDIO API
   ========================================================================== */
class SoundEngine {
  constructor() { this.ctx = null; this.enabled = true; }
  init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
  playHit() {
    if (!this.enabled) return; this.init();
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.connect(gain); gain.connect(this.ctx.destination); osc.start(); osc.stop(this.ctx.currentTime + 0.15);
  }
  playSlash() {
    if (!this.enabled) return; this.init();
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(500, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.14);
    osc.connect(gain); gain.connect(this.ctx.destination); osc.start(); osc.stop(this.ctx.currentTime + 0.14);
  }
}
const audio = new SoundEngine();

/* ==========================================================================
   3. RENDERIZADOR DE ARMAS EN 2D (HOJAS Y MANGO)
   ========================================================================== */
function drawWeaponVector(ctx, type) {
  ctx.save();
  if (type === 'katana' || type === 'sword') {
    ctx.fillStyle = '#451a03'; ctx.fillRect(-3, 0, 6, 16); // Mango
    ctx.fillStyle = '#f59e0b'; ctx.fillRect(-7, -2, 14, 3); // Guarda
    ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.moveTo(-3, -2); ctx.lineTo(0, -48); ctx.lineTo(3, -2); ctx.fill(); // Hoja
  } else if (type === 'spear') {
    ctx.fillStyle = '#78350f'; ctx.fillRect(-2, -10, 4, 60); // Asta
    ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.moveTo(-5, -10); ctx.lineTo(0, -45); ctx.lineTo(5, -10); ctx.fill(); // Punta
  } else {
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-2.5, 0, 5, 14);
    ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(0, -32); ctx.lineTo(3, 0); ctx.fill();
  }
  ctx.restore();
}

/* ==========================================================================
   4. CLASE PROYECTIL 2D
   ========================================================================== */
class Projectile {
  constructor(owner, x, y, dir, type, color) {
    this.owner = owner; this.x = x; this.y = y; this.dir = dir;
    this.type = type; this.color = color; this.speed = 16; this.active = true; this.angle = 0;
  }
  update(boundsWidth) {
    this.x += this.speed * this.dir;
    this.angle += 0.4 * this.dir;
    if (this.x < 0 || this.x > boundsWidth) this.active = false;
  }
  draw(ctx) {
    ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.angle);
    ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

/* ==========================================================================
   5. CLASE LUCHADOR CON BRAZOS ARTICULADOS 2D
   ========================================================================== */
class Fighter {
  constructor(id, config, isP2 = false) {
    this.id = id; this.isP2 = isP2; this.config = config;
    this.maxHp = 100; this.hp = 100;
    this.moveSpeed = 6; this.jumpPower = -17;
    this.x = isP2 ? 900 : 300; this.y = 520;
    this.vx = 0; this.vy = 0;
    this.dir = isP2 ? -1 : 1;
    this.isGrounded = true; this.isBlocking = false;
    this.state = 'idle'; this.animTimer = 0; this.walkCycle = 0;
  }

  takeDamage(amount) {
    if (this.isBlocking) {
      amount *= 0.2;
    } else {
      this.state = 'hit'; this.animTimer = 10;
    }
    this.hp = Math.max(0, this.hp - amount);
  }

  update(opponent, boundsWidth) {
    this.x += this.vx; this.y += this.vy;
    if (!this.isGrounded) this.vy += 0.85;

    if (this.y >= 520) {
      this.y = 520; this.vy = 0; this.isGrounded = true;
      if (this.state === 'jump') this.state = 'idle';
    }

    this.x = Math.max(50, Math.min(boundsWidth - 50, this.x));
    if (this.animTimer <= 0) this.dir = this.x < opponent.x ? 1 : -1;

    if (this.state === 'walk') this.walkCycle += 0.22; else this.walkCycle = 0;
    if (this.animTimer > 0) {
      this.animTimer--;
      if (this.animTimer <= 0) this.state = 'idle';
    }
    this.vx *= 0.8;
  }

  updateCPU(opponent, projectiles) {
    if (this.hp <= 0) return;
    const dist = Math.abs(this.x - opponent.x);
    if (dist > 140) {
      this.vx = (opponent.x > this.x ? 1 : -1) * this.moveSpeed * 0.8;
      this.state = 'walk';
    } else {
      if (Math.random() < 0.04) this.attackLight(opponent);
      else if (Math.random() < 0.03) this.attackWeapon1(opponent);
    }
  }

  attackLight(opponent) {
    if (this.animTimer > 0 || this.isBlocking) return;
    this.state = 'light'; this.animTimer = 14; audio.playHit();
    if (Math.abs(this.x + this.dir * 60 - opponent.x) < 50) opponent.takeDamage(10);
  }

  attackWeapon1(opponent) {
    if (this.animTimer > 0 || this.isBlocking) return;
    this.state = 'weapon1'; this.animTimer = 22; audio.playSlash();
    if (Math.abs(this.x + this.dir * 80 - opponent.x) < 70) opponent.takeDamage(20);
  }

  attackWeapon2(projectiles) {
    if (this.animTimer > 0 || this.isBlocking) return;
    this.state = 'weapon2'; this.animTimer = 18;
    projectiles.push(new Projectile(this, this.x + this.dir * 30, this.y - 55, this.dir, 'shuriken', '#ff4500'));
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.isBlocking) {
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, -55, 50, 0, Math.PI * 2); ctx.stroke();
    }

    ctx.scale(this.dir, 1);
    const legAngle = Math.sin(this.walkCycle) * 0.45;

    // --- PIERNAS EN 2D ---
    ctx.strokeStyle = '#18181b'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -45); ctx.lineTo(-12 * Math.cos(legAngle), -20); ctx.lineTo(-15 * Math.cos(legAngle), 0); ctx.stroke();
    ctx.strokeStyle = this.config.colorSuit || '#dc2626';
    ctx.beginPath(); ctx.moveTo(0, -45); ctx.lineTo(12 * Math.cos(legAngle), -20); ctx.lineTo(15 * Math.cos(legAngle), 0); ctx.stroke();

    // --- TORSO Y CABEZA ---
    ctx.fillStyle = this.config.colorSuit || '#dc2626';
    ctx.beginPath(); ctx.roundRect(-14, -85, 28, 42, 6); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -98, 14, 0, Math.PI * 2); ctx.fillStyle = this.config.colorSkin || '#fca5a5'; ctx.fill(); ctx.stroke();

    // =========================================================================
    // --- BRAZO TRASERO ARTICULADO (Hombro -> Codo -> Mano) ---
    // =========================================================================
    ctx.save();
    ctx.translate(-8, -72);
    let backShoulderAngle = 0.2 + Math.sin(this.walkCycle) * 0.4;
    if (this.state === 'light') backShoulderAngle = -0.5;
    else if (this.state === 'weapon1') backShoulderAngle = -1.1;
    else if (this.isBlocking) backShoulderAngle = -0.6;

    ctx.rotate(backShoulderAngle);
    ctx.strokeStyle = this.config.colorSuit || '#dc2626'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 16); ctx.stroke(); // Antebrazo superior
    ctx.translate(0, 16); ctx.rotate(0.4);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 14); ctx.stroke(); // Codo a muñeca
    ctx.fillStyle = this.config.colorSkin || '#fca5a5';
    ctx.beginPath(); ctx.arc(0, 16, 4, 0, Math.PI * 2); ctx.fill(); // Mano
    ctx.restore();

    // =========================================================================
    // --- BRAZO DELANTERO ARTICULADO CON MOVIMIENTO DE ATAQUE (Hombro -> Codo -> Mano + Arma) ---
    // =========================================================================
    ctx.save();
    ctx.translate(10, -72);

    let shoulderAngle = 0.3;
    let elbowAngle = 0.6;

    // Cálculo dinámico según estado
    if (this.state === 'idle') {
      const breathe = Math.sin(Date.now() * 0.006) * 0.08;
      shoulderAngle = 0.3 + breathe;
      elbowAngle = 0.7 - breathe;
    } else if (this.state === 'walk') {
      shoulderAngle = -Math.sin(this.walkCycle) * 0.5;
      elbowAngle = 0.5;
    } else if (this.state === 'light') {
      // Movimiento de golpe de puño (extensión hacia adelante)
      const progress = 1 - (this.animTimer / 14);
      const punchFactor = Math.sin(progress * Math.PI);
      shoulderAngle = 0.3 - punchFactor * 1.6;
      elbowAngle = 0.7 - punchFactor * 0.6;
    } else if (this.state === 'weapon1') {
      // Movimiento de tajo amplio de espada (arco de arriba a abajo)
      const progress = 1 - (this.animTimer / 22);
      const slashFactor = Math.sin(progress * Math.PI);
      shoulderAngle = -1.6 + slashFactor * 2.5;
      elbowAngle = 0.3 + slashFactor * 0.4;
    } else if (this.state === 'weapon2') {
      // Impulso hacia atrás y lanzamiento de proyectil
      const progress = 1 - (this.animTimer / 18);
      shoulderAngle = progress < 0.4 ? 0.8 : -1.2;
      elbowAngle = progress < 0.4 ? 1.2 : 0.2;
    } else if (this.isBlocking) {
      // Guardia cruzada
      shoulderAngle = -0.8;
      elbowAngle = 1.6;
    } else if (this.state === 'hit') {
      // Impacto sufrido
      shoulderAngle = 0.9;
      elbowAngle = 0.4;
    }

    // Renderizar Hombro a Codo
    ctx.rotate(shoulderAngle);
    ctx.strokeStyle = this.config.colorSuit || '#dc2626'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 18); ctx.stroke();

    // Renderizar Codo a Mano
    ctx.translate(0, 18);
    ctx.rotate(elbowAngle);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 18); ctx.stroke();

    // Renderizar Mano
    ctx.fillStyle = this.config.colorSkin || '#fca5a5';
    ctx.beginPath(); ctx.arc(0, 20, 4.5, 0, Math.PI * 2); ctx.fill();

    // Renderizar el arma empuñada en la mano
    ctx.translate(0, 20);
    ctx.rotate(-Math.PI / 2);
    const weapObj = WEAPONS_50_MELEE.find(w => w.id === this.config.weapon1) || WEAPONS_50_MELEE[0];
    drawWeaponVector(ctx, weapObj.type);

    ctx.restore();
    ctx.restore();
  }
}

/* ==========================================================================
   6. MOTOR DEL JUEGO BUCLE 2D
   ========================================================================== */
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.projectiles = []; this.keys = {};
    this.gameMode = 'tower'; this.isRunning = false;

    this.populateSelects();
    this.bindEvents();
    this.startPreviews();
  }

  populateSelects() {
    const fill = (id, items) => {
      const sel = document.getElementById(id); sel.innerHTML = '';
      items.forEach(it => { const opt = document.createElement('option'); opt.value = it.id; opt.innerText = it.name; sel.appendChild(opt); });
    };
    fill('p1-outfit', OUTFITS_50); fill('p2-outfit', OUTFITS_50);
    fill('p1-element', ELEMENTS_50); fill('p2-element', ELEMENTS_50);
    fill('p1-weapon1', WEAPONS_50_MELEE); fill('p2-weapon1', WEAPONS_50_MELEE);
    fill('p1-weapon2', WEAPONS_50_RANGED); fill('p2-weapon2', WEAPONS_50_RANGED);
  }

  startPreviews() {
    const p1Cvs = document.getElementById('preview-p1').getContext('2d');
    const p2Cvs = document.getElementById('preview-p2').getContext('2d');
    setInterval(() => {
      if (!this.isRunning) {
        p1Cvs.clearRect(0, 0, 160, 195);
        const p1Cfg = { weapon1: document.getElementById('p1-weapon1').value, colorSkin: document.getElementById('p1-color-skin').value, colorSuit: document.getElementById('p1-color-suit').value };
        const dummy1 = new Fighter(1, p1Cfg); dummy1.x = 80; dummy1.y = 160; dummy1.walkCycle = Date.now() / 150; dummy1.draw(p1Cvs);

        p2Cvs.clearRect(0, 0, 160, 195);
        const p2Cfg = { weapon1: document.getElementById('p2-weapon1').value, colorSkin: document.getElementById('p2-color-skin').value, colorSuit: document.getElementById('p2-color-suit').value };
        const dummy2 = new Fighter(2, p2Cfg, true); dummy2.x = 80; dummy2.y = 160; dummy2.walkCycle = Date.now() / 150; dummy2.draw(p2Cvs);
      }
    }, 50);
  }

  bindEvents() {
    window.addEventListener('keydown', e => { this.keys[e.code] = true; });
    window.addEventListener('keyup', e => { this.keys[e.code] = false; });

    document.getElementById('btn-mode-tower').addEventListener('click', () => { this.gameMode = 'tower'; });
    document.getElementById('btn-mode-versus').addEventListener('click', () => { this.gameMode = 'versus'; });

    document.getElementById('btn-start-fight').addEventListener('click', () => { this.startMatch(); });
    document.getElementById('btn-rematch').addEventListener('click', () => {
      document.getElementById('modal-victory').classList.add('hidden');
      this.startMatch();
    });
    document.getElementById('btn-re-select').addEventListener('click', () => {
      document.getElementById('modal-victory').classList.add('hidden');
      document.getElementById('game-screen').classList.add('hidden');
      document.getElementById('selection-screen').classList.remove('hidden');
    });

    document.getElementById('btn-toggle-sound').addEventListener('click', () => {
      audio.enabled = !audio.enabled;
      document.getElementById('sound-text').innerText = audio.enabled ? "AUDIO ON" : "AUDIO OFF";
    });
    document.getElementById('btn-show-controls').addEventListener('click', () => { document.getElementById('modal-controls').classList.remove('hidden'); });
    document.getElementById('btn-close-controls').addEventListener('click', () => { document.getElementById('modal-controls').classList.add('hidden'); });
  }

  startMatch() {
    document.getElementById('selection-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');

    const p1Cfg = { weapon1: document.getElementById('p1-weapon1').value, colorSkin: document.getElementById('p1-color-skin').value, colorSuit: document.getElementById('p1-color-suit').value };
    this.p1 = new Fighter(1, p1Cfg, false);

    const p2Cfg = { weapon1: document.getElementById('p2-weapon1').value, colorSkin: document.getElementById('p2-color-skin').value, colorSuit: document.getElementById('p2-color-suit').value };
    this.p2 = new Fighter(2, p2Cfg, true);

    this.isRunning = true;
    requestAnimationFrame(() => this.loop());
  }

  update() {
    if (!this.isRunning) return;

    // Teclas P1
    if (this.keys['KeyA']) { this.p1.vx = -this.p1.moveSpeed; this.p1.state = 'walk'; }
    else if (this.keys['KeyD']) { this.p1.vx = this.p1.moveSpeed; this.p1.state = 'walk'; }
    if (this.keys['KeyW'] && this.p1.isGrounded) { this.p1.vy = this.p1.jumpPower; this.p1.isGrounded = false; }
    this.p1.isBlocking = !!this.keys['KeyS'];
    if (this.keys['KeyJ']) this.p1.attackLight(this.p2);
    if (this.keys['KeyL']) this.p1.attackWeapon1(this.p2);
    if (this.keys['KeyU']) this.p1.attackWeapon2(this.projectiles);

    // Teclas P2 / CPU
    if (this.gameMode === 'versus') {
      if (this.keys['ArrowLeft']) { this.p2.vx = -this.p2.moveSpeed; this.p2.state = 'walk'; }
      else if (this.keys['ArrowRight']) { this.p2.vx = this.p2.moveSpeed; this.p2.state = 'walk'; }
      if (this.keys['ArrowUp'] && this.p2.isGrounded) { this.p2.vy = this.p2.jumpPower; this.p2.isGrounded = false; }
      this.p2.isBlocking = !!this.keys['ArrowDown'];
      if (this.keys['Numpad1'] || this.keys['KeyF']) this.p2.attackLight(this.p1);
      if (this.keys['Numpad3'] || this.keys['KeyH']) this.p2.attackWeapon1(this.p1);
      if (this.keys['Numpad7'] || this.keys['KeyV']) this.p2.attackWeapon2(this.projectiles);
    } else {
      this.p2.updateCPU(this.p1, this.projectiles);
    }

    this.p1.update(this.p2, this.canvas.width);
    this.p2.update(this.p1, this.canvas.width);

    // Proyectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i]; pr.update(this.canvas.width);
      const tgt = pr.owner === this.p1 ? this.p2 : this.p1;
      if (Math.abs(pr.x - tgt.x) < 45 && Math.abs(pr.y - (tgt.y - 50)) < 55) {
        tgt.takeDamage(12); pr.active = false;
      }
      if (!pr.active) this.projectiles.splice(i, 1);
    }

    // HUD
    document.getElementById('hud-p1-hp-fill').style.width = `${Math.max(0, this.p1.hp)}%`;
    document.getElementById('hud-p1-hp-text').innerText = `${Math.ceil(this.p1.hp)} HP`;
    document.getElementById('hud-p2-hp-fill').style.width = `${Math.max(0, this.p2.hp)}%`;
    document.getElementById('hud-p2-hp-text').innerText = `${Math.ceil(this.p2.hp)} HP`;

    if (this.p1.hp <= 0 || this.p2.hp <= 0) this.endGame();
  }

  draw() {
    this.ctx.fillStyle = '#09090b'; this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#18181b'; this.ctx.fillRect(0, 520, this.canvas.width, 155);
    this.ctx.fillStyle = '#dc2626'; this.ctx.fillRect(0, 516, this.canvas.width, 4);

    this.projectiles.forEach(p => p.draw(this.ctx));
    this.p1.draw(this.ctx); this.p2.draw(this.ctx);
  }

  loop() {
    if (!this.isRunning) return;
    this.update(); this.draw();
    requestAnimationFrame(() => this.loop());
  }

  endGame() {
    this.isRunning = false;
    document.getElementById('modal-victory').classList.remove('hidden');
  }
}

window.addEventListener('load', () => { window.game = new Game(); });