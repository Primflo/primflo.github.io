// ============ PLUTO ULTIMATE VAULT v2 - COMPLETE ============

// ============ GLOBAL STATE ============
let currentLevel = 1;
let autoHideTimer = null;
let autoHideMinutes = 5;

// Security Credentials
let scanPasswords = ["test123", "anime", "pluto"];
let portalUsername = "master";
let portalPassword = "pluto123";
let correctMorseCode = ".--. .-.. ..- - ---"; // PLUTO in morse
let currentMorseInput = "";

// Biometric status
let faceVerified = false;
let fingerprintVerified = false;
let voiceVerified = false;

// Pluto Data
let plutoData = {
    passwords: [],
    secrets: []
};

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    loadPlutoData();
    createMatrixRain();
    setupEventListeners();
    setupVaultTabs();
    setupMorseCode();
    
    // Preload anime images (they will load from CDN automatically)
    console.log('🚀 Pluto Ultimate Vault v2 Loaded');
    console.log('🔐 Free Anime Images from CDN');
});

// ============ EMERGENCY LOGOUT (VANISH BUTTON) ============
const emergencyBtn = document.getElementById('emergencyBtn');
if (emergencyBtn) {
    emergencyBtn.addEventListener('click', () => {
        // Show error text
        const errorSpan = document.getElementById('emergencyError');
        if (errorSpan) {
            errorSpan.textContent = '⚠️ EMERGENCY VANISH ACTIVATED ⚠️';
            setTimeout(() => {
                errorSpan.textContent = '';
            }, 3000);
        }
        
        // Emergency vanish - reset EVERYTHING
        currentLevel = 1;
        faceVerified = false;
        fingerprintVerified = false;
        voiceVerified = false;
        currentMorseInput = "";
        
        // Reset all level displays
        document.querySelectorAll('.level-container').forEach(level => {
            level.classList.add('hidden-level');
        });
        document.getElementById('level1')?.classList.remove('hidden-level');
        
        // Show vanish notification
        showNotification('💨 EMERGENCY VANISH! All traces removed.', 'warning');
        
        // Clear any timers
        if (autoHideTimer) clearInterval(autoHideTimer);
    });
}

// ============ SECRET POINTS & LEVEL TRANSITIONS ============

// Level 1 Secret Point: Click Naruto image 3 times
let narutoClickCount = 0;
document.querySelectorAll('[data-secret="naruto"]').forEach(el => {
    el.addEventListener('click', () => {
        narutoClickCount++;
        if (narutoClickCount === 3) {
            showNotification('Secret passage revealed! Entering Level 2...', 'success');
            showLevel(2);
            narutoClickCount = 0;
        }
        setTimeout(() => { narutoClickCount = 0; }, 3000);
    });
});

// Level 2 Secret Point: Click Hidden Leaf 5 times
let leafClickCount = 0;
const hiddenLeaf = document.getElementById('hiddenLeaf');
if (hiddenLeaf) {
    hiddenLeaf.addEventListener('click', () => {
        leafClickCount++;
        if (leafClickCount === 5) {
            showNotification('The sacred realm opens further! Entering Level 3...', 'success');
            showLevel(3);
            leafClickCount = 0;
        }
        setTimeout(() => { leafClickCount = 0; }, 5000);
    });
}

// Level 3 Secret Point: Click Radar to show password modal
const radar = document.getElementById('radar');
if (radar) {
    radar.addEventListener('click', () => {
        showPasswordModal();
    });
}

// Password Modal for Level 3 (asks 3 passwords first)
function showPasswordModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #000;
        padding: 30px;
        border-radius: 20px;
        border: 2px solid #0f0;
        z-index: 10000;
        text-align: center;
        min-width: 300px;
    `;
    modal.innerHTML = `
        <h3 style="color:#0f0;">⚔️ THREE PASSWORDS REQUIRED ⚔️</h3>
        <input type="password" id="pwd1" placeholder="Password 1" style="width:100%; margin:10px 0; padding:10px;">
        <input type="password" id="pwd2" placeholder="Password 2" style="width:100%; margin:10px 0; padding:10px;">
        <input type="password" id="pwd3" placeholder="Password 3" style="width:100%; margin:10px 0; padding:10px;">
        <button id="submitPasswords" style="background:#0f0; padding:10px 20px;">VERIFY & SCAN</button>
        <button id="closeModal" style="background:#333; margin-left:10px;">Cancel</button>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('submitPasswords').onclick = () => {
        const p1 = document.getElementById('pwd1').value;
        const p2 = document.getElementById('pwd2').value;
        const p3 = document.getElementById('pwd3').value;
        
        if (p1 === scanPasswords[0] && p2 === scanPasswords[1] && p3 === scanPasswords[2]) {
            modal.remove();
            showNotification('Passwords verified! Entering Level 4...', 'success');
            showLevel(4);
        } else {
            showNotification('❌ Wrong passwords! Access denied.', 'error');
            modal.querySelectorAll('input').forEach(inp => {
                inp.style.animation = 'shake 0.3s ease';
                setTimeout(() => inp.style.animation = '', 300);
            });
        }
    };
    
    document.getElementById('closeModal').onclick = () => modal.remove();
}

// ============ MORSE CODE SETUP (Level 4) ============
function setupMorseCode() {
    const morseBtns = document.querySelectorAll('.morse-btn[data-morse]');
    const morseDisplay = document.getElementById('morseDisplay');
    const morseTranslation = document.getElementById('morseTranslation');
    const morseClear = document.getElementById('morseClear');
    const morseSpace = document.getElementById('morseSpace');
    
    const morseMap = {
        '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
        '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
        '-.-': 'K', '.-..': 'L', '--': 'N', '-.': 'N', '---': 'O',
        '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
        '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
        '--..': 'Z', '-----': '0', '.----': '1', '..---': '2', '...--': '3',
        '....-': '4', '.....': '5', '-....': '6', '--...': '7', '---..': '8',
        '----.': '9'
    };
    
    let currentCode = [];
    
    function updateDisplay() {
        if (morseDisplay) {
            morseDisplay.textContent = currentCode.join(' ');
        }
        // Try to translate
        const fullCode = currentCode.join(' ');
        let translation = '';
        const codes = fullCode.split(' ');
        for (let code of codes) {
            if (morseMap[code]) translation += morseMap[code];
            else if (code === '') translation += ' ';
        }
        if (morseTranslation) {
            morseTranslation.textContent = translation ? `Translation: ${translation}` : '';
        }
        
        // Check if correct code entered (PLUTO)
        if (fullCode === correctMorseCode) {
            document.getElementById('morseCodeValue').value = fullCode;
            if (morseTranslation) morseTranslation.innerHTML += ' ✅ CORRECT!';
        }
    }
    
    morseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const symbol = btn.getAttribute('data-morse');
            currentCode.push(symbol);
            updateDisplay();
        });
    });
    
    if (morseSpace) {
        morseSpace.addEventListener('click', () => {
            currentCode.push('');
            updateDisplay();
        });
    }
    
    if (morseClear) {
        morseClear.addEventListener('click', () => {
            currentCode = [];
            updateDisplay();
            document.getElementById('morseCodeValue').value = '';
        });
    }
}

// Level 4 Login
document.getElementById('portalLoginBtn')?.addEventListener('click', () => {
    const username = document.getElementById('portalUsername')?.value || '';
    const password = document.getElementById('portalPassword')?.value || '';
    const morseValue = document.getElementById('morseCodeValue')?.value || '';
    
    if (username === portalUsername && password === portalPassword && morseValue === correctMorseCode) {
        showNotification('Login successful! Entering Biometric Gateway...', 'success');
        showLevel(5);
    } else {
        const errorDiv = document.getElementById('portalError');
        if (errorDiv) {
            errorDiv.textContent = '❌ Invalid credentials or Morse code! Access denied.';
            errorDiv.style.animation = 'shake 0.3s ease';
            setTimeout(() => errorDiv.style.animation = '', 300);
        }
    }
});

// ============ LEVEL 5 - BIOMETRIC GATEWAY ============
document.getElementById('scanFaceBtn')?.addEventListener('click', () => {
    const status = document.getElementById('faceStatus');
    if (status) {
        status.textContent = 'Scanning...';
        setTimeout(() => {
            faceVerified = true;
            status.textContent = '✅ VERIFIED!';
            status.style.color = '#0f0';
            showNotification('Face recognized!', 'success');
        }, 2000);
    }
});

document.getElementById('scanFingerprintBtn')?.addEventListener('click', () => {
    const status = document.getElementById('fingerprintStatus');
    if (status) {
        status.textContent = 'Scanning...';
        setTimeout(() => {
            fingerprintVerified = true;
            status.textContent = '✅ VERIFIED!';
            status.style.color = '#0f0';
            showNotification('Fingerprint matched!', 'success');
        }, 1500);
    }
});

document.getElementById('recordVoiceBtn')?.addEventListener('click', () => {
    const status = document.getElementById('voiceStatus');
    if (status) {
        status.textContent = 'Recording...';
        setTimeout(() => {
            voiceVerified = true;
            status.textContent = '✅ VERIFIED!';
            status.style.color = '#0f0';
            showNotification('Voice phrase accepted!', 'success');
        }, 2000);
    }
});

document.getElementById('verifyBiometricBtn')?.addEventListener('click', () => {
    if (faceVerified && fingerprintVerified && voiceVerified) {
        showNotification('BIOMETRIC VERIFICATION COMPLETE! Entering Pluto Vault...', 'success');
        showLevel(6);
        startAutoHideTimer();
        refreshVaultUI();
    } else {
        showNotification('❌ Biometric verification failed! All three required.', 'error');
    }
});

// ============ SHOW LEVEL FUNCTION ============
function showLevel(levelNum) {
    const levels = ['level1', 'level2', 'level3', 'level4', 'level5', 'plutoVault'];
    levels.forEach((level, idx) => {
        const element = document.getElementById(level);
        if (element) {
            if (idx + 1 === levelNum) {
                element.classList.remove('hidden-level');
            } else {
                element.classList.add('hidden-level');
            }
        }
    });
    currentLevel = levelNum;
    
    if (levelNum !== 6 && autoHideTimer) {
        clearInterval(autoHideTimer);
        autoHideTimer = null;
    }
}

// ============ PLUTO VAULT FUNCTIONS ============
function loadPlutoData() {
    const saved = localStorage.getItem('plutoVaultData');
    if (saved) {
        plutoData = JSON.parse(saved);
    } else {
        plutoData.passwords.push({ id: Date.now(), name: "Bank Account", username: "user@bank.com", password: "secure_pass_123" });
        plutoData.secrets.push({ id: Date.now(), title: "Welcome Secret", content: "This is your private vault!" });
        savePlutoData();
    }
    refreshVaultUI();
}

function savePlutoData() {
    localStorage.setItem('plutoVaultData', JSON.stringify(plutoData));
}

function refreshVaultUI() {
    const passwordsList = document.getElementById('passwordsList');
    if (passwordsList) {
        passwordsList.innerHTML = '';
        plutoData.passwords.forEach((pwd, idx) => {
            const div = document.createElement('div');
            div.className = 'password-item';
            div.innerHTML = `
                <strong>🔐 ${escapeHtml(pwd.name)}</strong><br>
                📧 ${escapeHtml(pwd.username)}<br>
                🔑 ••••••••<br>
                <button onclick="copyToClipboard('${pwd.password}')">📋 Copy</button>
                <button class="danger" onclick="deletePassword(${idx})">🗑️ Delete</button>
            `;
            passwordsList.appendChild(div);
        });
    }
    
    const secretsList = document.getElementById('secretsList');
    if (secretsList) {
        secretsList.innerHTML = '';
        plutoData.secrets.forEach((sec, idx) => {
            const div = document.createElement('div');
            div.className = 'secret-item';
            div.innerHTML = `
                <strong>🤫 ${escapeHtml(sec.title)}</strong><br>
                📝 ${escapeHtml(sec.content.substring(0, 100))}<br>
                <button onclick="deleteSecret(${idx})">🗑️ Delete</button>
            `;
            secretsList.appendChild(div);
        });
    }
}

function escapeHtml(str) { return String(str).replace(/[&<>]/g, function(m) { return m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'; }); }
window.copyToClipboard = function(text) { navigator.clipboard.writeText(text); showNotification('Copied!', 'success'); };
window.deletePassword = function(idx) { plutoData.passwords.splice(idx, 1); savePlutoData(); refreshVaultUI(); };
window.deleteSecret = function(idx) { plutoData.secrets.splice(idx, 1); savePlutoData(); refreshVaultUI(); };

function startAutoHideTimer() {
    if (autoHideTimer) clearInterval(autoHideTimer);
    let timeLeft = autoHideMinutes * 60;
    const timerElement = document.getElementById('vaultTimer');
    autoHideTimer = setInterval(() => {
        if (currentLevel !== 6) { clearInterval(autoHideTimer); return; }
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        if (timerElement) timerElement.textContent = `Auto-hide: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        if (timeLeft <= 0) { clearInterval(autoHideTimer); showNotification('Auto-hide: Returning to public area', 'warning'); showLevel(1); }
    }, 1000);
}

// ============ VAULT ACTIONS ============
document.getElementById('addPasswordBtn')?.addEventListener('click', () => {
    const name = prompt('Account name:'); const username = prompt('Username:'); const password = prompt('Password:');
    if (name && username && password) { plutoData.passwords.push({ id: Date.now(), name, username, password }); savePlutoData(); refreshVaultUI(); showNotification('Password saved!', 'success'); }
});

document.getElementById('addSecretBtn')?.addEventListener('click', () => {
    const title = prompt('Secret title:'); const content = prompt('Secret content:');
    if (title && content) { plutoData.secrets.push({ id: Date.now(), title, content }); savePlutoData(); refreshVaultUI(); showNotification('Secret saved!', 'success'); }
});

document.getElementById('closeVaultBtn')?.addEventListener('click', () => { if (confirm('Close Pluto?')) showLevel(1); });
document.getElementById('exportBackupBtn')?.addEventListener('click', () => {
    const dataStr = JSON.stringify(plutoData); const blob = new Blob([dataStr], {type: 'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `pluto_backup_${Date.now()}.json`; a.click(); URL.revokeObjectURL(url);
});
document.getElementById('importBackupBtn')?.addEventListener('click', () => { document.getElementById('importBackupInput')?.click(); });
document.getElementById('saveSecuritySettings')?.addEventListener('click', () => {
    const p1 = document.getElementById('newScanPwd1')?.value; const p2 = document.getElementById('newScanPwd2')?.value; const p3 = document.getElementById('newScanPwd3')?.value; const pPortal = document.getElementById('newPortalPwd')?.value;
    if (p1) scanPasswords[0] = p1; if (p2) scanPasswords[1] = p2; if (p3) scanPasswords[2] = p3; if (pPortal) portalPassword = pPortal;
    showNotification('Security settings saved!', 'success');
});

// ============ UTILITIES ============
function showNotification(message, type) {
    const notif = document.createElement('div');
    notif.style.cssText = `position:fixed; bottom:20px; right:20px; background:${type === 'success' ? '#4CAF50' : type === 'error' ? '#f00' : '#ff9800'}; color:white; padding:12px 24px; border-radius:10px; z-index:10000; animation:fadeSlide 0.3s;`;
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

function setupVaultTabs() {
    const tabs = document.querySelectorAll('.vault-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('passwordsTab')?.classList.remove('active');
            document.getElementById('secretsTab')?.classList.remove('active');
            document.getElementById('settingsTab')?.classList.remove('active');
            document.getElementById(`${tabName}Tab`)?.classList.add('active');
        });
    });
}

function setupEventListeners() {
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && currentLevel !== 1) { showLevel(1); showNotification('Emergency return to public area', 'warning'); } });
}

function createMatrixRain() {
    const container = document.getElementById('matrixRain');
    if (!container) return;
    const chars = '01アイウエオカキクケコサシスセソタチツテト';
    for (let i = 0; i < 100; i++) {
        const char = document.createElement('div');
        char.style.cssText = `position:absolute; left:${Math.random() * 100}%; top:${Math.random() * 100}%; color:rgba(0,255,0,${0.1 + Math.random() * 0.4}); font-size:${10 + Math.random() * 20}px; animation:float ${3 + Math.random() * 8}s linear infinite;`;
        char.innerHTML = chars[Math.floor(Math.random() * chars.length)];
        container.appendChild(char);
    }
}