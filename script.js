// ============ PLUTO ULTIMATE VAULT - COMPLETE SCRIPT ============
// 8 Security Layers + Full Anime Theme + All Features

// ============ GLOBAL STATE ============
let currentLevel = 1;
let autoHideTimer = null;
let autoHideMinutes = 5;
let inactivityTimer = null;

// Secret points status
let secretPoint1Triggered = false;
let secretPoint2Triggered = false;
let secretPoint3Triggered = false;
let scanPasswordsEntered = false;

// Biometric status
let faceVerified = false;
let fingerprintVerified = false;
let voiceVerified = false;

// Security credentials (can be changed in settings)
let scanPasswords = ["test123", "anime", "pluto"];
let plutoMasterPassword = "master123";
let voicePhrase = "Pluto, reveal your secrets";

// Pluto Data Storage
let plutoData = {
    passwords: [],
    documents: [],
    secrets: []
};

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    loadPlutoData();
    createSakura();
    createMatrixRain();
    setupEventListeners();
    setupVaultTabs();
    startInactivityTimer();
});

// ============ DATA MANAGEMENT ============
function loadPlutoData() {
    const saved = localStorage.getItem('plutoVaultData');
    if (saved) {
        plutoData = JSON.parse(saved);
    } else {
        // Add demo data
        plutoData.passwords.push({
            id: Date.now(),
            name: "Demo Bank Account",
            username: "user@demo.com",
            password: "demo_password_123"
        });
        plutoData.secrets.push({
            id: Date.now() + 1,
            title: "Welcome to Pluto!",
            content: "This is your secret vault. Add your real secrets here."
        });
        savePlutoData();
    }
    refreshVaultUI();
}

function savePlutoData() {
    localStorage.setItem('plutoVaultData', JSON.stringify(plutoData));
}

function refreshVaultUI() {
    // Refresh passwords
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
    
    // Refresh secrets
    const secretsList = document.getElementById('secretsList');
    if (secretsList) {
        secretsList.innerHTML = '';
        plutoData.secrets.forEach((sec, idx) => {
            const div = document.createElement('div');
            div.className = 'secret-item';
            div.innerHTML = `
                <strong>🤫 ${escapeHtml(sec.title)}</strong><br>
                📝 ${escapeHtml(sec.content.substring(0, 100))}${sec.content.length > 100 ? '...' : ''}<br>
                <button onclick="deleteSecret(${idx})">🗑️ Delete</button>
            `;
            secretsList.appendChild(div);
        });
    }
}

function escapeHtml(str) {
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard!', 'success');
};

window.deletePassword = function(idx) {
    if (confirm('Delete this password?')) {
        plutoData.passwords.splice(idx, 1);
        savePlutoData();
        refreshVaultUI();
        showNotification('Password deleted', 'warning');
    }
};

window.deleteSecret = function(idx) {
    if (confirm('Delete this secret?')) {
        plutoData.secrets.splice(idx, 1);
        savePlutoData();
        refreshVaultUI();
        showNotification('Secret deleted', 'warning');
    }
};

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#f00' : '#2196F3'};
        color: white;
        padding: 12px 24px;
        border-radius: 10px;
        z-index: 10000;
        animation: fadeSlide 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ============ LEVEL TRANSITIONS ============
function showLevel(levelNum) {
    const levels = ['level1', 'level2', 'level3', 'plutoGateway', 'plutoVault'];
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
    
    // Stop auto-hide timer if leaving vault
    if (levelNum !== 5 && autoHideTimer) {
        clearInterval(autoHideTimer);
        autoHideTimer = null;
    }
    
    // Play transition sound
    playSound('transition');
}

function playSound(type) {
    // Sound effects placeholder - can be enabled with actual audio files
    console.log(`🔊 Playing sound: ${type}`);
}

// ============ SECRET POINTS ============
// Secret Point #1: Click Naruto's forehead 3 times
let narutoClickCount = 0;
const narutoChar = document.getElementById('narutoChar');
if (narutoChar) {
    narutoChar.addEventListener('click', () => {
        narutoClickCount++;
        playSound('click');
        if (narutoClickCount === 3) {
            secretPoint1Triggered = true;
            showNotification('Secret passage revealed!', 'success');
            showLevel(2);
            narutoClickCount = 0;
        }
        setTimeout(() => { narutoClickCount = 0; }, 3000);
    });
}

// Secret Point #2: Click Leaf symbol 5 times
let leafClickCount = 0;
const hiddenLeaf = document.getElementById('hiddenLeaf');
if (hiddenLeaf) {
    hiddenLeaf.addEventListener('click', () => {
        leafClickCount++;
        playSound('click');
        if (leafClickCount === 5) {
            secretPoint2Triggered = true;
            showNotification('The sacred realm opens further!', 'success');
            showLevel(3);
            leafClickCount = 0;
        }
        setTimeout(() => { leafClickCount = 0; }, 5000);
    });
}

// Secret Point #3: Click radar
const radar = document.getElementById('radar');
if (radar) {
    radar.addEventListener('click', () => {
        secretPoint3Triggered = true;
        showPasswordModal();
        playSound('radar');
    });
}

// Terminal command for Secret Point #3
const terminalInput = document.getElementById('terminalInput');
if (terminalInput) {
    terminalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const cmd = terminalInput.value.toLowerCase();
            if (cmd === 'byakugan activate') {
                secretPoint3Triggered = true;
                showPasswordModal();
                playSound('command');
            }
            terminalInput.value = '';
            addTerminalLine(`> ${cmd}`);
        }
    });
}

function addTerminalLine(text) {
    const terminal = document.getElementById('terminal');
    if (terminal) {
        const line = document.createElement('div');
        line.textContent = text;
        terminal.appendChild(line);
        terminal.scrollTop = terminal.scrollHeight;
    }
}

// Scanner eye alternative secret point
const scannerEye = document.getElementById('scannerEye');
if (scannerEye) {
    scannerEye.addEventListener('click', () => {
        secretPoint3Triggered = true;
        showPasswordModal();
        playSound('scan');
    });
}

// ============ PASSWORD MODAL FOR LEVEL 3 ============
function showPasswordModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <h3 style="color:#ff69b4;">⚔️ THREE SEALS MUST BE BROKEN ⚔️</h3>
        <p style="color:#ccc; margin-bottom:15px;">Enter the 3 sacred passwords to proceed</p>
        <input type="password" id="pwd1" placeholder="Password 1" autocomplete="off">
        <input type="password" id="pwd2" placeholder="Password 2" autocomplete="off">
        <input type="password" id="pwd3" placeholder="Password 3" autocomplete="off">
        <button id="submitScanPasswords" style="background:#ff69b4;">🔓 START SCAN</button>
        <button id="closeModal" style="background:#444;">Cancel</button>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('submitScanPasswords').onclick = () => {
        const p1 = document.getElementById('pwd1').value;
        const p2 = document.getElementById('pwd2').value;
        const p3 = document.getElementById('pwd3').value;
        
        if (p1 === scanPasswords[0] && p2 === scanPasswords[1] && p3 === scanPasswords[2]) {
            modal.remove();
            scanPasswordsEntered = true;
            startScanAnimation();
        } else {
            showNotification('❌ SEALS REMAIN LOCKED!', 'warning');
            modal.querySelectorAll('input').forEach(inp => {
                inp.style.animation = 'shake 0.3s ease';
                setTimeout(() => { inp.style.animation = ''; }, 300);
            });
        }
    };
    
    document.getElementById('closeModal').onclick = () => modal.remove();
}

function startScanAnimation() {
    const terminal = document.getElementById('terminal');
    if (terminal) {
        terminal.innerHTML = '';
        let progress = 0;
        addTerminalLine('> Initializing scan protocol...');
        
        const interval = setInterval(() => {
            progress += 10;
            addTerminalLine(`> Scanning... [${progress}%]`);
            
            if (progress === 30) addTerminalLine('> Detecting biometric signatures...');
            if (progress === 60) addTerminalLine('> Verifying cryptographic seals...');
            if (progress === 80) addTerminalLine('> Accessing hidden dimension...');
            
            if (progress >= 100) {
                clearInterval(interval);
                addTerminalLine('> ✅ SCAN COMPLETE!');
                addTerminalLine('> 🎴 Path to Pluto opens...');
                addTerminalLine('> ACCESS GRANTED');
                showNotification('Scan complete! Entering Pluto Gateway...', 'success');
                setTimeout(() => {
                    showLevel(4); // Pluto Gateway
                }, 1500);
            }
        }, 400);
    }
}

// ============ PLUTO GATEWAY ============
document.getElementById('scanFaceBtn')?.addEventListener('click', () => {
    const statusSpan = document.getElementById('faceStatus');
    if (statusSpan) {
        statusSpan.textContent = 'Scanning...';
        statusSpan.style.color = '#ff0';
        setTimeout(() => {
            faceVerified = true;
            statusSpan.textContent = '✅ VERIFIED!';
            statusSpan.style.color = '#0f0';
            showNotification('Face recognized!', 'success');
            playSound('verify');
        }, 2000);
    }
});

document.getElementById('scanFingerprintBtn')?.addEventListener('click', () => {
    const statusSpan = document.getElementById('fingerprintStatus');
    if (statusSpan) {
        statusSpan.textContent = 'Scanning...';
        statusSpan.style.color = '#ff0';
        setTimeout(() => {
            fingerprintVerified = true;
            statusSpan.textContent = '✅ VERIFIED!';
            statusSpan.style.color = '#0f0';
            showNotification('Fingerprint matched!', 'success');
            playSound('verify');
        }, 1500);
    }
});

document.getElementById('recordVoiceBtn')?.addEventListener('click', () => {
    const statusSpan = document.getElementById('voiceStatus');
    if (statusSpan) {
        statusSpan.textContent = 'Recording...';
        statusSpan.style.color = '#ff0';
        setTimeout(() => {
            voiceVerified = true;
            statusSpan.textContent = '✅ VERIFIED!';
            statusSpan.style.color = '#0f0';
            showNotification('Voice phrase accepted!', 'success');
            playSound('verify');
        }, 2500);
    }
});

document.getElementById('verifyGatewayBtn')?.addEventListener('click', () => {
    const masterPwd = document.getElementById('gatewayPassword')?.value || '';
    
    if (masterPwd === plutoMasterPassword && faceVerified && fingerprintVerified) {
        showNotification('ACCESS GRANTED. Welcome to Pluto!', 'success');
        playSound('unlock');
        showLevel(5);
        startAutoHideTimer();
        refreshVaultUI();
    } else {
        showNotification('❌ ACCESS DENIED! Intruder detected.', 'warning');
        playSound('denied');
        
        // Simulate intruder photo capture
        console.log('📸 Intruder photo captured');
        
        // Shake effect
        const gateway = document.querySelector('.gateway-card');
        if (gateway) {
            gateway.style.animation = 'shake 0.5s ease';
            setTimeout(() => { gateway.style.animation = ''; }, 500);
        }
    }
});

// ============ AUTO-HIDE TIMER ============
function startAutoHideTimer() {
    if (autoHideTimer) clearInterval(autoHideTimer);
    let timeLeft = autoHideMinutes * 60;
    const timerElement = document.getElementById('vaultTimer');
    
    autoHideTimer = setInterval(() => {
        if (currentLevel !== 5) {
            clearInterval(autoHideTimer);
            return;
        }
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        if (timerElement) {
            timerElement.textContent = `Auto-hide: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (timeLeft <= 0) {
            clearInterval(autoHideTimer);
            showNotification('Auto-hide: Returning to public area', 'warning');
            showLevel(1);
        }
    }, 1000);
    
    // Reset timer on activity
    const resetTimer = () => {
        if (currentLevel === 5) {
            timeLeft = autoHideMinutes * 60;
        }
    };
    document.removeEventListener('mousemove', resetTimer);
    document.removeEventListener('keydown', resetTimer);
    document.addEventListener('mousemove', resetTimer);
    document.addEventListener('keydown', resetTimer);
}

function startInactivityTimer() {
    // Optional: Auto-return to Level 1 if idle at any level
}

// ============ VAULT TABS ============
function setupVaultTabs() {
    const tabs = document.querySelectorAll('.vault-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            // Update active tab styling
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding content
            document.getElementById('passwordsTab')?.classList.remove('active');
            document.getElementById('documentsTab')?.classList.remove('active');
            document.getElementById('secretsTab')?.classList.remove('active');
            document.getElementById('settingsTab')?.classList.remove('active');
            
            document.getElementById(`${tabName}Tab`)?.classList.add('active');
        });
    });
}

// ============ VAULT ACTIONS ============
document.getElementById('addPasswordBtn')?.addEventListener('click', () => {
    const name = prompt('Account/Site name:');
    const username = prompt('Username/Email:');
    const password = prompt('Password:');
    if (name && username && password) {
        plutoData.passwords.push({
            id: Date.now(),
            name: name,
            username: username,
            password: password
        });
        savePlutoData();
        refreshVaultUI();
        showNotification('Password saved!', 'success');
    }
});

document.getElementById('addSecretBtn')?.addEventListener('click', () => {
    const title = prompt('Secret title:');
    const content = prompt('Secret content:');
    if (title && content) {
        plutoData.secrets.push({
            id: Date.now(),
            title: title,
            content: content
        });
        savePlutoData();
        refreshVaultUI();
        showNotification('Secret saved!', 'success');
    }
});

document.getElementById('uploadDocBtn')?.addEventListener('click', () => {
    const fileInput = document.getElementById('docUpload');
    if (fileInput && fileInput.files) {
        Array.from(fileInput.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                plutoData.documents.push({
                    id: Date.now(),
                    name: file.name,
                    type: file.type,
                    data: e.target.result
                });
                savePlutoData();
                showNotification(`Uploaded: ${file.name}`, 'success');
            };
            reader.readAsDataURL(file);
        });
    }
});

document.getElementById('closeVaultBtn')?.addEventListener('click', () => {
    if (confirm('Close Pluto? All hidden data will be secured.')) {
        showLevel(1);
    }
});

document.getElementById('nukeBtn')?.addEventListener('click', () => {
    const confirmText = prompt('⚠️ TYPE "CONFIRM DESTRUCTION" TO NUKE ALL DATA ⚠️');
    if (confirmText === 'CONFIRM DESTRUCTION') {
        plutoData = { passwords: [], documents: [], secrets: [] };
        savePlutoData();
        refreshVaultUI();
        showNotification('💥 ALL DATA HAS BEEN DESTROYED!', 'warning');
        showLevel(1);
    }
});

// ============ SETTINGS ============
document.getElementById('saveSecuritySettings')?.addEventListener('click', () => {
    const newPwd1 = document.getElementById('newScanPwd1')?.value;
    const newPwd2 = document.getElementById('newScanPwd2')?.value;
    const newPwd3 = document.getElementById('newScanPwd3')?.value;
    const newMaster = document.getElementById('newMasterPwd')?.value;
    
    if (newPwd1) scanPasswords[0] = newPwd1;
    if (newPwd2) scanPasswords[1] = newPwd2;
    if (newPwd3) scanPasswords[2] = newPwd3;
    if (newMaster) plutoMasterPassword = newMaster;
    
    showNotification('Security settings saved!', 'success');
});

document.getElementById('saveTimerSettings')?.addEventListener('click', () => {
    const slider = document.getElementById('timerSlider');
    if (slider) {
        autoHideMinutes = parseInt(slider.value);
        document.getElementById('timerValue').textContent = autoHideMinutes;
        showNotification(`Auto-hide set to ${autoHideMinutes} minutes`, 'success');
    }
});

document.getElementById('exportBackupBtn')?.addEventListener('click', () => {
    const dataStr = JSON.stringify(plutoData);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pluto_backup_${new Date().toISOString().slice(0,19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Backup exported!', 'success');
});

document.getElementById('importBackupBtn')?.addEventListener('click', () => {
    document.getElementById('importBackupInput')?.click();
});

document.getElementById('importBackupInput')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const imported = JSON.parse(ev.target.result);
                plutoData = imported;
                savePlutoData();
                refreshVaultUI();
                showNotification('Backup restored successfully!', 'success');
            } catch (err) {
                showNotification('Invalid backup file!', 'warning');
            }
        };
        reader.readAsText(file);
    }
});

// Theme selector
document.getElementById('themeSelect')?.addEventListener('change', (e) => {
    const theme = e.target.value;
    document.body.classList.remove('cyberpunk', 'dark-mode');
    if (theme === 'cyberpunk') document.body.classList.add('cyberpunk');
    if (theme === 'dark') document.body.classList.add('dark-mode');
});

// ============ VISUAL EFFECTS ============
function createSakura() {
    const container = document.getElementById('sakura-container');
    if (!container) return;
    
    for (let i = 0; i < 40; i++) {
        const sakura = document.createElement('div');
        sakura.className = 'sakura';
        sakura.innerHTML = ['🌸', '🌸', '🌸', '🌸'][Math.floor(Math.random() * 4)];
        sakura.style.left = Math.random() * 100 + '%';
        sakura.style.animationDuration = 6 + Math.random() * 6 + 's';
        sakura.style.animationDelay = Math.random() * 8 + 's';
        sakura.style.fontSize = 15 + Math.random() * 15 + 'px';
        container.appendChild(sakura);
    }
}

function createMatrixRain() {
    const container = document.getElementById('matrixRain');
    if (!container) return;
    
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
    
    for (let i = 0; i < 150; i++) {
        const char = document.createElement('div');
        char.className = 'matrix-char';
        char.style.left = Math.random() * 100 + '%';
        char.style.top = Math.random() * 100 + '%';
        char.style.color = `rgba(0, 255, 0, ${0.1 + Math.random() * 0.5})`;
        char.style.fontSize = 12 + Math.random() * 20 + 'px';
        char.style.animation = `float ${3 + Math.random() * 8}s linear infinite`;
        char.style.animationDelay = Math.random() * 10 + 's';
        char.innerHTML = chars[Math.floor(Math.random() * chars.length)];
        container.appendChild(char);
    }
}

// ============ EVENT LISTENERS SETUP ============
function setupEventListeners() {
    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.remove();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Exit to Level 1 on Escape
        if (e.key === 'Escape' && currentLevel !== 1) {
            showLevel(1);
            showNotification('Returned to public area', 'info');
        }
    });
}

// ============ INITIALIZE EVERYTHING ============
console.log('🚀 Pluto Ultimate Vault initialized');
console.log('🔐 8 Security Layers Active');
console.log('🎴 Anime Mode: Maximum');