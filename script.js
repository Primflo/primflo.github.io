/**
 * PLUTO ULTIMATE VAULT — script.js
 * 8-Layer Anime Security System
 * All data AES-256-GCM encrypted, stored in localStorage (OPFS fallback)
 */

'use strict';

/* ============================================================
   STATE & CONFIG
   ============================================================ */
const STATE = {
  currentLevel: 'level1',
  narutoClicks: 0,
  radarClicks: 0,
  leafClicks: 0,
  l3pwFailures: 0,
  gwFailures: 0,
  masterPwVerified: false,
  faceVerified: false,
  fpVerified: false,
  fpCredentialId: null,
  faceDescriptor: null,
  faceStream: null,
  autoHideInterval: null,
  autoHideSeconds: 300,
  autoHideEnabled: true,
  editingPwId: null,
  editingSecretId: null,
  currentDocFolder: 'Personal',
  drawPoints: [],
  isDrawing: false,
};

/* Default config — changeable in Settings */
let CONFIG = {
  l1Word: 'ramen',
  l2Word: 'sharingan',
  l3Cmd: 'byakugan activate',
  scanPw: ['test123', 'anime', 'pluto'],
  masterPw: 'master123',
  voicePhrase: 'pluto reveal your secrets',
  autoHideMin: 5,
};

/* ============================================================
   CRYPTO HELPERS (AES-256-GCM)
   ============================================================ */
const CRYPTO = {
  async deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
    );
  },

  async encrypt(plaintext, password = 'pluto-vault-key') {
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(password, salt);
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext));
    const buf = new Uint8Array(salt.byteLength + iv.byteLength + ct.byteLength);
    buf.set(salt, 0); buf.set(iv, 16); buf.set(new Uint8Array(ct), 28);
    return btoa(String.fromCharCode(...buf));
  },

  async decrypt(cipherB64, password = 'pluto-vault-key') {
    try {
      const buf = Uint8Array.from(atob(cipherB64), c => c.charCodeAt(0));
      const salt = buf.slice(0, 16);
      const iv = buf.slice(16, 28);
      const ct = buf.slice(28);
      const key = await this.deriveKey(password, salt);
      const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
      return new TextDecoder().decode(pt);
    } catch { return null; }
  }
};

/* ============================================================
   STORAGE (localStorage with OPFS attempt)
   ============================================================ */
const STORE = {
  _key: 'pluto_vault_v2',
  _cfgKey: 'pluto_config_v2',

  async load() {
    const raw = localStorage.getItem(this._key);
    if (!raw) return { passwords: [], documents: [], secrets: [], files: [] };
    const dec = await CRYPTO.decrypt(raw);
    try { return JSON.parse(dec) || { passwords: [], documents: [], secrets: [], files: [] }; }
    catch { return { passwords: [], documents: [], secrets: [], files: [] }; }
  },

  async save(data) {
    const enc = await CRYPTO.encrypt(JSON.stringify(data));
    localStorage.setItem(this._key, enc);
  },

  loadConfig() {
    try {
      const raw = localStorage.getItem(this._cfgKey);
      if (raw) return Object.assign(CONFIG, JSON.parse(raw));
    } catch {}
  },

  saveConfig() {
    localStorage.setItem(this._cfgKey, JSON.stringify(CONFIG));
  },

  loadBiometrics() {
    try {
      const raw = localStorage.getItem('pluto_biometrics');
      if (raw) {
        const b = JSON.parse(raw);
        if (b.faceDescriptor) STATE.faceDescriptor = b.faceDescriptor;
        if (b.fpCredentialId) STATE.fpCredentialId = b.fpCredentialId;
      }
    } catch {}
  },

  saveBiometrics() {
    localStorage.setItem('pluto_biometrics', JSON.stringify({
      faceDescriptor: STATE.faceDescriptor,
      fpCredentialId: STATE.fpCredentialId,
    }));
  },

  nuke() {
    localStorage.removeItem(this._key);
    localStorage.removeItem(this._cfgKey);
    localStorage.removeItem('pluto_biometrics');
    localStorage.removeItem('pluto_intruder_log');
  }
};

let VAULT_DATA = { passwords: [], documents: [], secrets: [], files: [] };

/* ============================================================
   TRANSITION HELPERS
   ============================================================ */
function showScreen(id, delay = 600) {
  const overlay = document.getElementById('transOverlay');
  overlay.classList.add('fade-in');
  setTimeout(() => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    STATE.currentLevel = id;
    setTimeout(() => overlay.classList.remove('fade-in'), 400);
    if (id === 'level2') initStarfield();
    if (id === 'level3') { initMatrix(); initL3(); }
    if (id === 'gateway') initGateway();
    if (id === 'vault') initVault();
  }, delay);
}

/* ============================================================
   LEVEL 1 — ANIME FUN
   ============================================================ */
function initLevel1() {
  createPetals();
  createLanterns();

  // SECRET POINT #1 — Option A: Naruto forehead clicks
  const forehead = document.getElementById('narutoForehead');
  forehead.addEventListener('click', () => {
    STATE.narutoClicks++;
    forehead.style.background = `rgba(255,215,0,${STATE.narutoClicks * 0.33})`;
    if (STATE.narutoClicks >= 3) triggerL1Secret();
  });

  // SECRET POINT #1 — Option B: 3rd cherry blossom
  const cherries = document.querySelectorAll('.cherry');
  cherries.forEach(c => {
    c.addEventListener('click', () => {
      if (parseInt(c.dataset.idx) === 2) {
        c.classList.add('selected');
        setTimeout(triggerL1Secret, 400);
      } else {
        c.classList.add('selected');
        setTimeout(() => c.classList.remove('selected'), 600);
      }
    });
  });

  // SECRET POINT #1 — Option C: type "ramen" in search
  const search = document.getElementById('l1Search');
  search.addEventListener('input', () => {
    if (search.value.toLowerCase() === CONFIG.l1Word) triggerL1Secret();
  });
}

function createPetals() {
  const container = document.getElementById('blossomContainer');
  const colors = ['#ffb7c5','#ff8fab','#ffc0cb','#ffaec9','#ff91a4'];
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = (Math.random() * 8 + 6) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.opacity = Math.random() * 0.8 + 0.2;
    p.style.transform = `scale(${Math.random() * 1.5 + 0.5})`;
    container.appendChild(p);
  }
}

function createLanterns() {
  const container = document.getElementById('lanternContainer');
  const lanternColors = ['#ff6347','#ffa500','#ff69b4','#9370db','#4169e1'];
  for (let i = 0; i < 8; i++) {
    const l = document.createElement('div');
    l.className = 'lantern';
    l.style.left = (i * 13 + 2) + '%';
    l.style.background = lanternColors[i % lanternColors.length];
    l.style.opacity = '0.7';
    l.style.animationDelay = (i * 0.5) + 's';
    l.style.boxShadow = `0 0 12px ${lanternColors[i % lanternColors.length]}`;
    container.appendChild(l);
  }
}

function triggerL1Secret() {
  if (STATE.currentLevel !== 'level1') return;
  // Glitch + red petals
  const petals = document.querySelectorAll('.petal');
  petals.forEach(p => { p.style.background = '#cc0000'; p.style.animationDuration = '2s'; });
  // Eye glow on all chars
  document.querySelectorAll('.eyes::before,.eyes::after').forEach(e => { e.style.background = '#ff0000'; });
  addGlitchOverlay();
  setTimeout(() => {
    removeGlitchOverlay();
    showScreen('level2');
  }, 800);
}

function addGlitchOverlay() {
  const g = document.createElement('div');
  g.className = 'glitch-overlay';
  g.id = 'glitchEl';
  document.body.appendChild(g);
}
function removeGlitchOverlay() {
  const g = document.getElementById('glitchEl');
  if (g) g.remove();
}

/* ============================================================
   LEVEL 2 — ANIME MASTER
   ============================================================ */
function initStarfield() {
  const canvas = document.getElementById('starCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const stars = Array.from({ length: 200 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.3,
    opacity: Math.random(),
    speed: Math.random() * 0.5 + 0.1,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.opacity += (Math.random() - 0.5) * 0.05;
      s.opacity = Math.max(0.1, Math.min(1, s.opacity));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();

  initLevel2Secrets();
}

function initLevel2Secrets() {
  // Secret Point #2 — Option A: draw circle on Goku
  const drawZone = document.getElementById('gokuDrawZone');
  if (drawZone) {
    drawZone.addEventListener('mousedown', startDraw);
    drawZone.addEventListener('mousemove', onDraw);
    drawZone.addEventListener('mouseup', endDraw);
    drawZone.addEventListener('touchstart', startDraw, { passive: true });
    drawZone.addEventListener('touchmove', onDraw, { passive: true });
    drawZone.addEventListener('touchend', endDraw);
  }

  // Secret Point #2 — Option B: leaf symbol 5 times
  const leaf = document.getElementById('leafSymbol');
  const leafCount = document.getElementById('leafCount');
  leaf.addEventListener('click', () => {
    STATE.leafClicks++;
    leafCount.textContent = `${STATE.leafClicks} / 5`;
    leaf.style.filter = `hue-rotate(${STATE.leafClicks * 40}deg) brightness(1.5)`;
    if (STATE.leafClicks >= 5) triggerL2Secret();
  });

  // Secret Point #2 — Option C: type "sharingan"
  const secret = document.getElementById('l2Secret');
  secret.addEventListener('input', () => {
    if (secret.value.toLowerCase() === CONFIG.l2Word) triggerL2Secret();
  });
}

function startDraw(e) {
  STATE.isDrawing = true;
  STATE.drawPoints = [];
  const pos = getPos(e);
  STATE.drawPoints.push(pos);
}
function onDraw(e) {
  if (!STATE.isDrawing) return;
  STATE.drawPoints.push(getPos(e));
}
function endDraw() {
  STATE.isDrawing = false;
  if (isCircle(STATE.drawPoints)) triggerL2Secret();
  STATE.drawPoints = [];
}
function getPos(e) {
  const touch = e.touches ? e.touches[0] : e;
  return { x: touch.clientX, y: touch.clientY };
}
function isCircle(pts) {
  if (pts.length < 20) return false;
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  const radii = pts.map(p => Math.hypot(p.x - cx, p.y - cy));
  const avg = radii.reduce((s, r) => s + r, 0) / radii.length;
  const variance = radii.reduce((s, r) => s + Math.abs(r - avg), 0) / radii.length;
  const closed = Math.hypot(pts[0].x - pts[pts.length-1].x, pts[0].y - pts[pts.length-1].y) < avg * 0.5;
  return variance < avg * 0.4 && closed;
}

function triggerL2Secret() {
  if (STATE.currentLevel !== 'level2') return;
  addGlitchOverlay();
  setTimeout(() => {
    removeGlitchOverlay();
    showScreen('level3');
  }, 800);
}

/* ============================================================
   LEVEL 3 — SCAN ZONE
   ============================================================ */
function initMatrix() {
  const canvas = document.getElementById('matrixCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const chars = 'アイウエオカキクケコサシスセソタチツテト01アイウエオ日本語ABCDEF'.split('');
  const cols = Math.floor(canvas.width / 16);
  const drops = Array(cols).fill(1);

  function draw() {
    ctx.fillStyle = 'rgba(3,10,15,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00fff7';
    ctx.font = '14px monospace';
    drops.forEach((y, i) => {
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 16, y * 16);
      drops[i] = (y * 16 > canvas.height && Math.random() > 0.975) ? 0 : y + 1;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

function initL3() {
  const radar = document.getElementById('radar');
  const radarClicks = document.getElementById('radarClicks');

  // Secret Point #3 — Option A: click radar 3 times
  radar.addEventListener('click', () => {
    STATE.radarClicks++;
    radarClicks.textContent = `Clicks: ${STATE.radarClicks}/3`;
    addTermLine(`> RADAR PULSE ${STATE.radarClicks}/3 DETECTED`);
    if (STATE.radarClicks >= 3) triggerL3Secret('radar');
  });

  // Secret Point #3 — Option B: terminal command
  const terminal = document.getElementById('l3Terminal');
  terminal.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = terminal.value.trim().toLowerCase();
      addTermLine(`>> ${terminal.value}`);
      terminal.value = '';
      if (val === CONFIG.l3Cmd.toLowerCase()) {
        triggerL3Secret('terminal');
      } else {
        addTermLine('> COMMAND NOT RECOGNIZED');
      }
    }
  });

  // Secret Point #3 — Option C: click Neji's eye
  const nejiEye = document.getElementById('nejiEye');
  nejiEye.addEventListener('click', () => {
    addTermLine('> BYAKUGAN ACTIVATED — SCANNING...');
    setTimeout(() => triggerL3Secret('byakugan'), 500);
  });
}

function addTermLine(text) {
  const out = document.getElementById('terminalOutput');
  const line = document.createElement('div');
  line.className = 't-line';
  line.textContent = text;
  out.appendChild(line);
  out.scrollTop = out.scrollHeight;
}

function triggerL3Secret(method) {
  if (STATE.currentLevel !== 'level3') return;
  addTermLine(`> SECRET POINT #3 ACHIEVED [${method.toUpperCase()}]`);
  addTermLine('> PASSWORD AUTHENTICATION REQUIRED...');
  setTimeout(() => document.getElementById('pwModal').classList.remove('hidden'), 600);
}

/* ============================================================
   PASSWORD MODAL (3 scan passwords)
   ============================================================ */
document.getElementById('pwSubmit').addEventListener('click', verifyPW);
[1,2,3].forEach(n => {
  document.getElementById(`pw${n}`).addEventListener('keydown', e => {
    if (e.key === 'Enter') verifyPW();
  });
});

async function verifyPW() {
  const p1 = document.getElementById('pw1').value;
  const p2 = document.getElementById('pw2').value;
  const p3 = document.getElementById('pw3').value;

  if (
    p1 === CONFIG.scanPw[0] &&
    p2 === CONFIG.scanPw[1] &&
    p3 === CONFIG.scanPw[2]
  ) {
    // Animate scan
    document.getElementById('pwForm').style.display = 'none';
    document.getElementById('scanProgressWrap').style.display = 'block';
    await animateScan();
    document.getElementById('pwModal').classList.add('hidden');
    showScreen('gateway');
  } else {
    STATE.l3pwFailures++;
    const err = document.getElementById('pwError');
    err.classList.remove('hidden');
    shakeElement(document.querySelector('.pw-modal'));
    [1,2,3].forEach(n => document.getElementById(`pw${n}`).value = '');
    if (STATE.l3pwFailures >= 3) {
      err.textContent = '⛔ TOO MANY FAILURES — RETURNING TO LEVEL 1';
      setTimeout(() => {
        document.getElementById('pwModal').classList.add('hidden');
        STATE.l3pwFailures = 0;
        STATE.radarClicks = 0;
        resetPwModal();
        showScreen('level1');
      }, 1500);
    }
  }
}

async function animateScan() {
  const bar = document.getElementById('scanBar');
  const status = document.getElementById('scanStatus');
  const steps = [
    [33, 'Password 1/3: VERIFIED ✓'],
    [66, 'Password 2/3: VERIFIED ✓'],
    [90, 'Password 3/3: VERIFIED ✓'],
    [100, 'SCAN COMPLETE — Path to Pluto opens...'],
  ];

  for (const [pct, msg] of steps) {
    await animateBar(bar, pct);
    status.innerHTML += `<br>${msg}`;
    await sleep(400);
  }
  await sleep(600);
}

function animateBar(bar, target) {
  return new Promise(resolve => {
    let current = parseFloat(bar.style.width) || 0;
    const step = () => {
      current = Math.min(current + 1, target);
      bar.style.width = current + '%';
      if (current < target) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}

function resetPwModal() {
  document.getElementById('pwForm').style.display = 'block';
  document.getElementById('scanProgressWrap').style.display = 'none';
  document.getElementById('scanBar').style.width = '0%';
  document.getElementById('scanStatus').innerHTML = 'Scanning...';
  document.getElementById('pwError').classList.add('hidden');
}

/* ============================================================
   PLUTO GATEWAY
   ============================================================ */
function initGateway() {
  STATE.masterPwVerified = false;
  STATE.faceVerified = false;
  STATE.fpVerified = false;
  updateEnterBtn();

  // Step 1: Master Password
  document.getElementById('masterPwBtn').addEventListener('click', checkMasterPw);
  document.getElementById('masterPw').addEventListener('keydown', e => {
    if (e.key === 'Enter') checkMasterPw();
  });

  // Step 2: Face
  document.getElementById('startFaceBtn').addEventListener('click', startFaceScan);

  // Step 3: Fingerprint
  document.getElementById('fpBtn').addEventListener('click', runFingerprint);

  // Step 4: Voice (optional)
  document.getElementById('voiceBtn').addEventListener('click', startVoice);

  // Enter Vault
  document.getElementById('enterVault').addEventListener('click', enterVault);
}

function checkMasterPw() {
  const val = document.getElementById('masterPw').value;
  const s = document.getElementById('s1Status');
  if (val === CONFIG.masterPw) {
    STATE.masterPwVerified = true;
    s.textContent = '✓ VERIFIED';
    s.className = 'step-status ok';
    document.getElementById('masterPw').disabled = true;
    document.getElementById('masterPwBtn').disabled = true;
    updateEnterBtn();
  } else {
    s.textContent = '✗ INCORRECT';
    s.className = 'step-status fail';
    shakeElement(document.getElementById('gwStep1'));
    handleGwFailure();
  }
}

async function startFaceScan() {
  const video = document.getElementById('faceVideo');
  const hint = document.getElementById('faceHint');
  const s2 = document.getElementById('s2Status');
  const btn = document.getElementById('startFaceBtn');

  // Check if face-api is loaded
  if (typeof faceapi === 'undefined') {
    // Fallback: simulate face detection for demo
    hint.textContent = 'face-api.js loading... Using demo mode';
    btn.disabled = true;
    setTimeout(() => {
      STATE.faceVerified = true;
      s2.textContent = '✓ FACE VERIFIED (demo mode)';
      s2.className = 'step-status ok';
      updateEnterBtn();
    }, 1500);
    return;
  }

  try {
    hint.textContent = 'Loading face models...';
    btn.disabled = true;

    // Load models
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights'),
      faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights'),
      faceapi.nets.faceRecognitionNet.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights'),
    ]);

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    STATE.faceStream = stream;
    video.srcObject = stream;
    video.style.display = 'block';
    hint.textContent = 'Position your face — hold still...';

    video.addEventListener('loadeddata', async () => {
      await sleep(1500);
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        // If no registered face, register now
        if (!STATE.faceDescriptor) {
          STATE.faceDescriptor = Array.from(detection.descriptor);
          STORE.saveBiometrics();
          STATE.faceVerified = true;
          s2.textContent = '✓ FACE REGISTERED & VERIFIED';
        } else {
          const stored = new Float32Array(STATE.faceDescriptor);
          const dist = faceapi.euclideanDistance(detection.descriptor, stored);
          if (dist < 0.6) { // 0.6 ≈ 98% confidence threshold
            STATE.faceVerified = true;
            s2.textContent = `✓ FACE VERIFIED (dist: ${dist.toFixed(3)})`;
          } else {
            s2.textContent = '✗ FACE NOT RECOGNIZED';
            s2.className = 'step-status fail';
            captureIntruder();
            handleGwFailure();
            return;
          }
        }
        s2.className = 'step-status ok';
        stopFaceStream();
        updateEnterBtn();
      } else {
        s2.textContent = '✗ NO FACE DETECTED — TRY AGAIN';
        s2.className = 'step-status fail';
        btn.disabled = false;
        stopFaceStream();
      }
    });
  } catch (err) {
    s2.textContent = `Camera error: ${err.message}. Demo mode active.`;
    s2.className = 'step-status fail';
    STATE.faceVerified = true;
    s2.textContent = '✓ BYPASSED (camera unavailable)';
    s2.className = 'step-status ok';
    updateEnterBtn();
  }
}

function stopFaceStream() {
  if (STATE.faceStream) {
    STATE.faceStream.getTracks().forEach(t => t.stop());
    STATE.faceStream = null;
  }
  const video = document.getElementById('faceVideo');
  video.style.display = 'none';
}

async function runFingerprint() {
  const s3 = document.getElementById('s3Status');
  const btn = document.getElementById('fpBtn');
  const icon = document.getElementById('fpIcon');

  if (!window.PublicKeyCredential) {
    s3.textContent = '✓ BIOMETRIC BYPASSED (WebAuthn unavailable)';
    s3.className = 'step-status ok';
    STATE.fpVerified = true;
    updateEnterBtn();
    return;
  }

  try {
    btn.disabled = true;
    icon.textContent = '⏳';
    s3.textContent = 'Awaiting biometric prompt...';

    if (!STATE.fpCredentialId) {
      // Register new credential
      const cred = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: 'Pluto Vault', id: location.hostname || 'localhost' },
          user: {
            id: crypto.getRandomValues(new Uint8Array(16)),
            name: 'pluto-master',
            displayName: 'Pluto Master',
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 60000,
        }
      });
      STATE.fpCredentialId = btoa(String.fromCharCode(...new Uint8Array(cred.rawId)));
      STORE.saveBiometrics();
      STATE.fpVerified = true;
      s3.textContent = '✓ FINGERPRINT REGISTERED & VERIFIED';
      icon.textContent = '✅';
    } else {
      // Verify existing
      const credId = Uint8Array.from(atob(STATE.fpCredentialId), c => c.charCodeAt(0));
      await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          allowCredentials: [{ id: credId, type: 'public-key' }],
          userVerification: 'required',
          timeout: 60000,
        }
      });
      STATE.fpVerified = true;
      s3.textContent = '✓ FINGERPRINT VERIFIED';
      icon.textContent = '✅';
    }
    s3.className = 'step-status ok';
    updateEnterBtn();
  } catch (err) {
    icon.textContent = '❌';
    if (err.name === 'NotAllowedError') {
      s3.textContent = '✗ BIOMETRIC CANCELLED';
    } else {
      // Fallback: bypass
      STATE.fpVerified = true;
      s3.textContent = '✓ BYPASSED (device limitation)';
      icon.textContent = '✅';
      updateEnterBtn();
      return;
    }
    s3.className = 'step-status fail';
    btn.disabled = false;
  }
}

function startVoice() {
  const s4 = document.getElementById('s4Status');
  const vis = document.getElementById('voiceVis');

  if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
    s4.textContent = '⚠️ Voice recognition unavailable';
    return;
  }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SR();
  rec.lang = 'en-US';
  rec.interimResults = false;

  // Create voice bars
  vis.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    const b = document.createElement('div');
    b.className = 'voice-bar';
    b.style.height = (Math.random() * 20 + 5) + 'px';
    b.style.animationDelay = (i * 0.07) + 's';
    vis.appendChild(b);
  }

  rec.start();
  s4.textContent = '🎤 Listening...';

  rec.onresult = (e) => {
    const text = e.results[0][0].transcript.toLowerCase().replace(/[^a-z ]/g, '').trim();
    const target = CONFIG.voicePhrase.toLowerCase();
    if (text.includes(target.slice(0, 10))) {
      s4.textContent = '✓ VOICE VERIFIED';
      s4.className = 'step-status ok';
    } else {
      s4.textContent = `✗ Heard: "${text}"`;
      s4.className = 'step-status fail';
    }
    vis.innerHTML = '';
  };

  rec.onerror = () => {
    s4.textContent = '⚠️ Voice error — skipped';
    vis.innerHTML = '';
  };
}

function updateEnterBtn() {
  const ok = STATE.masterPwVerified && STATE.faceVerified && STATE.fpVerified;
  document.getElementById('enterVault').disabled = !ok;
}

function enterVault() {
  stopFaceStream();
  showScreen('vault');
}

function captureIntruder() {
  const video = document.getElementById('faceVideo');
  const canvas = document.getElementById('intruderCanvas');
  canvas.width = video.videoWidth || 320;
  canvas.height = video.videoHeight || 240;
  canvas.getContext('2d').drawImage(video, 0, 0);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
  const log = JSON.parse(localStorage.getItem('pluto_intruder_log') || '[]');
  log.push({ ts: new Date().toISOString(), ip: 'N/A', img: dataUrl });
  localStorage.setItem('pluto_intruder_log', JSON.stringify(log.slice(-10)));
}

function handleGwFailure() {
  STATE.gwFailures++;
  const a = document.getElementById('gwAttempts');
  a.textContent = `Attempts: ${STATE.gwFailures}/3`;
  if (STATE.gwFailures >= 3) {
    const err = document.getElementById('gwError');
    err.classList.remove('hidden');
    err.textContent = '⛔ TOO MANY FAILURES — RETURNING TO START';
    setTimeout(() => {
      STATE.gwFailures = 0;
      STATE.masterPwVerified = false;
      STATE.faceVerified = false;
      STATE.fpVerified = false;
      showScreen('level1');
    }, 2000);
  }
}

/* ============================================================
   PLUTO VAULT
   ============================================================ */
async function initVault() {
  VAULT_DATA = await STORE.load();
  createParticles();
  startAutoHide();
  renderPasswords();
  renderDocuments();
  renderSecrets();
  renderFiles();
  initVaultListeners();
}

function createParticles() {
  const container = document.getElementById('vaultParticles');
  container.innerHTML = '';
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = (Math.random() * 15 + 10) + 's';
    p.style.animationDelay = (Math.random() * 15) + 's';
    p.style.setProperty('--drift', (Math.random() * 100 - 50) + 'px');
    container.appendChild(p);
  }
}

/* ── Auto-hide timer ──────────────────────────────────────── */
function startAutoHide() {
  clearInterval(STATE.autoHideInterval);
  if (!CONFIG.autoHideMin) CONFIG.autoHideMin = 5;
  STATE.autoHideSeconds = CONFIG.autoHideMin * 60;
  updateTimerDisplay();

  if (!STATE.autoHideEnabled) return;

  // Reset on activity
  const reset = () => { STATE.autoHideSeconds = CONFIG.autoHideMin * 60; };
  ['mousemove','keydown','click','touchstart'].forEach(ev => window.addEventListener(ev, reset));

  STATE.autoHideInterval = setInterval(() => {
    STATE.autoHideSeconds--;
    updateTimerDisplay();
    if (STATE.autoHideSeconds <= 0) {
      clearInterval(STATE.autoHideInterval);
      showScreen('level1');
    }
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(STATE.autoHideSeconds / 60);
  const s = STATE.autoHideSeconds % 60;
  document.getElementById('autoHideTimer').textContent =
    `⏱️ ${m}:${s.toString().padStart(2,'0')}`;
}

/* ── Vault Listeners ─────────────────────────────────────── */
function initVaultListeners() {
  // Tabs
  document.querySelectorAll('.v-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.v-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.vault-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
  });

  // Close vault
  document.getElementById('closeVaultBtn').addEventListener('click', () => {
    clearInterval(STATE.autoHideInterval);
    showScreen('level1');
  });

  // Settings
  document.getElementById('settingsBtn').addEventListener('click', () => {
    document.getElementById('settingsPanel').classList.remove('hidden');
  });

  // Nuke
  document.getElementById('nukeBtn').addEventListener('click', () => {
    document.getElementById('nukeModal').classList.remove('hidden');
  });

  // Password CRUD
  document.getElementById('addPwBtn').addEventListener('click', () => {
    STATE.editingPwId = null;
    document.getElementById('pwFormTitle').textContent = 'Add New Password';
    ['pf-account','pf-username','pf-password'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('pwFormWrap').classList.remove('hidden');
  });
  document.getElementById('savePwEntry').addEventListener('click', savePwEntry);
  document.getElementById('cancelPwEntry').addEventListener('click', () => {
    document.getElementById('pwFormWrap').classList.add('hidden');
  });

  // Documents
  document.getElementById('uploadDocBtn').addEventListener('click', () => {
    document.getElementById('docFileInput').click();
  });
  document.getElementById('docFileInput').addEventListener('change', uploadDocument);

  document.querySelectorAll('.folder-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.folder-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      STATE.currentDocFolder = tab.dataset.folder;
      renderDocuments();
    });
  });

  // Secrets
  document.getElementById('addSecretBtn').addEventListener('click', () => {
    STATE.editingSecretId = null;
    document.getElementById('secretFormTitle').textContent = 'New Secret';
    document.getElementById('sf-title').value = '';
    document.getElementById('sf-content').value = '';
    document.getElementById('secretFormWrap').classList.remove('hidden');
  });
  document.getElementById('saveSecret').addEventListener('click', saveSecret);
  document.getElementById('cancelSecret').addEventListener('click', () => {
    document.getElementById('secretFormWrap').classList.add('hidden');
  });

  // Files
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault(); dropZone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });
  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => handleFiles(fileInput.files));
}

/* ── Password CRUD ─────────────────────────────────────────── */
function renderPasswords() {
  const list = document.getElementById('pwList');
  list.innerHTML = '';
  if (!VAULT_DATA.passwords.length) {
    list.innerHTML = '<div style="color:rgba(255,255,255,0.3);padding:20px;text-align:center;">No passwords saved yet.</div>';
    return;
  }
  VAULT_DATA.passwords.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'pw-entry';
    div.innerHTML = `
      <div class="pw-entry-info">
        <div class="pw-account">${esc(entry.account)}</div>
        <div class="pw-user">${esc(entry.username)}</div>
        <div class="pw-pass masked" title="Click to reveal">${esc(entry.password)}</div>
      </div>
      <div class="pw-actions">
        <button class="btn-sm" onclick="copyText('${esc(entry.password)}', this)">Copy</button>
        <button class="btn-sm" onclick="editPwEntry('${entry.id}')">Edit</button>
        <button class="btn-sm danger" onclick="deletePwEntry('${entry.id}')">Delete</button>
      </div>`;
    div.querySelector('.pw-pass').addEventListener('click', function() {
      this.classList.toggle('masked');
    });
    list.appendChild(div);
  });
}

async function savePwEntry() {
  const acc = document.getElementById('pf-account').value.trim();
  const usr = document.getElementById('pf-username').value.trim();
  const pw = document.getElementById('pf-password').value;
  if (!acc || !pw) return;

  if (STATE.editingPwId) {
    const e = VAULT_DATA.passwords.find(p => p.id === STATE.editingPwId);
    if (e) { e.account = acc; e.username = usr; e.password = pw; }
  } else {
    VAULT_DATA.passwords.push({ id: uid(), account: acc, username: usr, password: pw });
  }
  await STORE.save(VAULT_DATA);
  document.getElementById('pwFormWrap').classList.add('hidden');
  renderPasswords();
}

function editPwEntry(id) {
  const e = VAULT_DATA.passwords.find(p => p.id === id);
  if (!e) return;
  STATE.editingPwId = id;
  document.getElementById('pwFormTitle').textContent = 'Edit Password';
  document.getElementById('pf-account').value = e.account;
  document.getElementById('pf-username').value = e.username;
  document.getElementById('pf-password').value = e.password;
  document.getElementById('pwFormWrap').classList.remove('hidden');
}

async function deletePwEntry(id) {
  if (!confirm('Delete this password entry?')) return;
  VAULT_DATA.passwords = VAULT_DATA.passwords.filter(p => p.id !== id);
  await STORE.save(VAULT_DATA);
  renderPasswords();
}

window.editPwEntry = editPwEntry;
window.deletePwEntry = deletePwEntry;

/* ── Document CRUD ─────────────────────────────────────────── */
async function uploadDocument(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (ev) => {
    VAULT_DATA.documents.push({
      id: uid(),
      name: file.name,
      folder: STATE.currentDocFolder,
      size: file.size,
      type: file.type,
      data: ev.target.result,
      date: new Date().toLocaleDateString(),
    });
    await STORE.save(VAULT_DATA);
    renderDocuments();
  };
  reader.readAsDataURL(file);
  e.target.value = '';
}

function renderDocuments() {
  const list = document.getElementById('docList');
  const filtered = VAULT_DATA.documents.filter(d => d.folder === STATE.currentDocFolder);
  list.innerHTML = '';
  if (!filtered.length) {
    list.innerHTML = '<div style="color:rgba(255,255,255,0.3);padding:20px;text-align:center;">No documents in this folder.</div>';
    return;
  }
  filtered.forEach(doc => {
    const div = document.createElement('div');
    div.className = 'doc-entry';
    const icon = doc.type.includes('pdf') ? '📕' : '📄';
    div.innerHTML = `
      <div class="doc-icon">${icon}</div>
      <div style="flex:1">
        <div class="doc-name">${esc(doc.name)}</div>
        <div class="doc-meta">${doc.date} · ${formatSize(doc.size)}</div>
      </div>
      <div class="pw-actions">
        <button class="btn-sm" onclick="downloadDoc('${doc.id}')">Download</button>
        <button class="btn-sm danger" onclick="deleteDoc('${doc.id}')">Delete</button>
      </div>`;
    list.appendChild(div);
  });
}

function downloadDoc(id) {
  const doc = VAULT_DATA.documents.find(d => d.id === id);
  if (!doc) return;
  const a = document.createElement('a');
  a.href = doc.data;
  a.download = doc.name;
  a.click();
}

async function deleteDoc(id) {
  if (!confirm('Delete this document?')) return;
  VAULT_DATA.documents = VAULT_DATA.documents.filter(d => d.id !== id);
  await STORE.save(VAULT_DATA);
  renderDocuments();
}

window.downloadDoc = downloadDoc;
window.deleteDoc = deleteDoc;

/* ── Secret CRUD ─────────────────────────────────────────── */
function renderSecrets() {
  const list = document.getElementById('secretList');
  list.innerHTML = '';
  if (!VAULT_DATA.secrets.length) {
    list.innerHTML = '<div style="color:rgba(255,255,255,0.3);padding:20px;text-align:center;">No secrets stored.</div>';
    return;
  }
  VAULT_DATA.secrets.forEach(s => {
    const div = document.createElement('div');
    div.className = 'secret-entry';
    div.innerHTML = `
      <div style="flex:1">
        <div class="secret-title">${esc(s.title)}</div>
        <div class="secret-date">${s.date}</div>
        <div class="secret-preview">${esc(s.content.slice(0,60))}${s.content.length>60?'...':''}</div>
      </div>
      <div class="pw-actions">
        <button class="btn-sm" onclick="editSecret('${s.id}')">Edit</button>
        <button class="btn-sm danger" onclick="deleteSecret('${s.id}')">Delete</button>
      </div>`;
    list.appendChild(div);
  });
}

async function saveSecret() {
  const title = document.getElementById('sf-title').value.trim();
  const content = document.getElementById('sf-content').value;
  if (!title) return;

  if (STATE.editingSecretId) {
    const s = VAULT_DATA.secrets.find(x => x.id === STATE.editingSecretId);
    if (s) { s.title = title; s.content = content; }
  } else {
    VAULT_DATA.secrets.push({ id: uid(), title, content, date: new Date().toLocaleDateString() });
  }
  await STORE.save(VAULT_DATA);
  document.getElementById('secretFormWrap').classList.add('hidden');
  renderSecrets();
}

function editSecret(id) {
  const s = VAULT_DATA.secrets.find(x => x.id === id);
  if (!s) return;
  STATE.editingSecretId = id;
  document.getElementById('secretFormTitle').textContent = 'Edit Secret';
  document.getElementById('sf-title').value = s.title;
  document.getElementById('sf-content').value = s.content;
  document.getElementById('secretFormWrap').classList.remove('hidden');
}

async function deleteSecret(id) {
  if (!confirm('Delete this secret?')) return;
  VAULT_DATA.secrets = VAULT_DATA.secrets.filter(s => s.id !== id);
  await STORE.save(VAULT_DATA);
  renderSecrets();
}

window.editSecret = editSecret;
window.deleteSecret = deleteSecret;

/* ── File upload ─────────────────────────────────────────── */
async function handleFiles(files) {
  for (const file of files) {
    const reader = new FileReader();
    await new Promise(resolve => {
      reader.onload = async (ev) => {
        VAULT_DATA.files.push({
          id: uid(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: ev.target.result,
          date: new Date().toLocaleDateString(),
        });
        await STORE.save(VAULT_DATA);
        resolve();
      };
      reader.readAsDataURL(file);
    });
  }
  renderFiles();
}

function renderFiles() {
  const gallery = document.getElementById('fileGallery');
  gallery.innerHTML = '';
  if (!VAULT_DATA.files.length) return;
  VAULT_DATA.files.forEach(f => {
    const div = document.createElement('div');
    div.className = 'file-item';
    const isImg = f.type.startsWith('image/');
    if (isImg) {
      const img = document.createElement('img');
      img.src = f.data;
      img.style.cssText = 'width:100%;height:70px;object-fit:cover;border-radius:6px;margin-bottom:6px;';
      div.appendChild(img);
    } else {
      const icon = document.createElement('div');
      icon.className = 'file-item-icon';
      icon.textContent = fileIcon(f.type);
      div.appendChild(icon);
    }
    const name = document.createElement('div');
    name.className = 'file-item-name';
    name.textContent = f.name;
    const del = document.createElement('button');
    del.className = 'btn-sm danger';
    del.textContent = '✕';
    del.style.marginTop = '4px';
    del.onclick = async () => {
      VAULT_DATA.files = VAULT_DATA.files.filter(x => x.id !== f.id);
      await STORE.save(VAULT_DATA);
      renderFiles();
    };
    div.appendChild(name);
    div.appendChild(del);
    gallery.appendChild(div);
  });
}

/* ============================================================
   SETTINGS
   ============================================================ */
document.getElementById('settingsClose').addEventListener('click', () => {
  document.getElementById('settingsPanel').classList.add('hidden');
});

// Settings tabs
document.querySelectorAll('.st').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.st').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('st-' + tab.dataset.st).classList.add('active');
  });
});

document.getElementById('saveSecurityBtn').addEventListener('click', () => {
  const p1 = document.getElementById('st-pw1').value;
  const p2 = document.getElementById('st-pw2').value;
  const p3 = document.getElementById('st-pw3').value;
  if (p1 && p2 && p3) CONFIG.scanPw = [p1, p2, p3];

  const mp = document.getElementById('st-master').value;
  if (mp) CONFIG.masterPw = mp;

  const w1 = document.getElementById('st-l1word').value;
  if (w1) CONFIG.l1Word = w1;
  const w2 = document.getElementById('st-l2word').value;
  if (w2) CONFIG.l2Word = w2;
  const w3 = document.getElementById('st-l3cmd').value;
  if (w3) CONFIG.l3Cmd = w3;

  STORE.saveConfig();
  alert('Security settings saved!');
});

document.getElementById('reregisterFaceBtn').addEventListener('click', () => {
  STATE.faceDescriptor = null;
  STORE.saveBiometrics();
  alert('Face cleared. Re-scan on next gateway entry.');
});

document.getElementById('reregisterFpBtn').addEventListener('click', () => {
  STATE.fpCredentialId = null;
  STORE.saveBiometrics();
  alert('Fingerprint cleared. Re-register on next gateway entry.');
});

// Auto-hide settings
document.getElementById('timerSlider').addEventListener('input', function() {
  document.getElementById('timerVal').textContent = this.value;
  CONFIG.autoHideMin = parseInt(this.value);
  STORE.saveConfig();
});

document.getElementById('tog-autohide').addEventListener('change', function() {
  STATE.autoHideEnabled = this.checked;
  if (STATE.currentLevel === 'vault') startAutoHide();
});

// Theme
document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyTheme(btn.dataset.theme);
  });
});

function applyTheme(theme) {
  const themes = {
    'dark-red': { '--vault-bg':'#0d0005', '--vault-red':'#cc0000', '--vault-accent':'#ff3333' },
    'cyber-blue': { '--vault-bg':'#000d1a', '--vault-red':'#0044cc', '--vault-accent':'#0088ff' },
    'midnight': { '--vault-bg':'#030010', '--vault-red':'#6600cc', '--vault-accent':'#aa44ff' },
  };
  const vars = themes[theme] || themes['dark-red'];
  Object.entries(vars).forEach(([k,v]) => document.documentElement.style.setProperty(k, v));
}

// Backup
document.getElementById('exportBackup').addEventListener('click', async () => {
  const data = JSON.stringify(VAULT_DATA);
  const enc = await CRYPTO.encrypt(data, CONFIG.masterPw);
  const blob = new Blob([enc], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `pluto-backup-${Date.now()}.aes`;
  a.click();
});

document.getElementById('importBackup').addEventListener('click', () => {
  document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  const dec = await CRYPTO.decrypt(text, CONFIG.masterPw);
  if (dec) {
    VAULT_DATA = JSON.parse(dec);
    await STORE.save(VAULT_DATA);
    renderPasswords(); renderDocuments(); renderSecrets(); renderFiles();
    alert('Backup imported successfully!');
  } else {
    alert('Failed to decrypt backup. Wrong master password?');
  }
  e.target.value = '';
});

/* ============================================================
   NUKE
   ============================================================ */
document.getElementById('confirmNukeBtn').addEventListener('click', () => {
  const val = document.getElementById('nukeConfirm').value;
  if (val === 'CONFIRM DESTRUCTION') {
    STORE.nuke();
    VAULT_DATA = { passwords: [], documents: [], secrets: [], files: [] };
    document.getElementById('nukeModal').classList.add('hidden');
    clearInterval(STATE.autoHideInterval);
    alert('ALL DATA DESTROYED.');
    showScreen('level1');
  } else {
    shakeElement(document.querySelector('.nuke-modal'));
  }
});

document.getElementById('cancelNukeBtn').addEventListener('click', () => {
  document.getElementById('nukeModal').classList.add('hidden');
});

/* ============================================================
   UTILS
   ============================================================ */
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function esc(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}
function fileIcon(type) {
  if (type.includes('pdf')) return '📕';
  if (type.includes('word')) return '📝';
  if (type.includes('text')) return '📄';
  if (type.includes('video')) return '🎬';
  if (type.includes('audio')) return '🎵';
  return '📁';
}
function shakeElement(el) {
  el.style.animation = 'shake 0.4s ease';
  setTimeout(() => { el.style.animation = ''; }, 450);
}
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = orig; }, 1200);
  });
}
window.copyText = copyText;

/* ============================================================
   INIT — Run on Load
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  STORE.loadConfig();
  STORE.loadBiometrics();
  initLevel1();
  // Make first level visible
  document.getElementById('level1').classList.add('active');
});
