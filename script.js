// ==================== PLUTO ULTIMATE VAULT ====================
// Complete working version with no Level 2, real CSV import

// ---------- GLOBAL STATE ----------
let currentLevel = 1;
let mainAuth = false;
let plutoAuth = false;

// Data structures
let personalProfile = {
    displayName: "Anime Master",
    bio: "Keeper of secrets",
    avatarEmoji: "🦊",
    notes: [],
    wishlist: [],
    quickDocs: []
};

let masterDatabase = {
    passwords: [],
    secrets: [],
    apiKeys: []
};

let settings = {
    mainUsername: "admin",
    mainPassword: "admin123",
    plutoMasterPassword: "Pluto123!",
    autoLockMinutes: 5
};

// ---------- INITIALIZATION ----------
function loadAllData() {
    const saved = localStorage.getItem("plutoVaultData");
    if (saved) {
        try {
            const data = JSON.parse(saved);
            personalProfile = data.personalProfile || personalProfile;
            masterDatabase = data.masterDatabase || masterDatabase;
            settings = data.settings || settings;
        } catch(e) {}
    }
    
    // Default demo data if empty
    if (masterDatabase.passwords.length === 0) {
        masterDatabase.passwords.push({ id: Date.now(), title: "Google", username: "user@gmail.com", password: "demo123" });
    }
    if (personalProfile.notes.length === 0) {
        personalProfile.notes.push({ id: Date.now(), text: "Welcome to Pluto Vault!" });
    }
    if (personalProfile.wishlist.length === 0) {
        personalProfile.wishlist.push({ id: Date.now(), item: "Attack on Titan Final Season" });
    }
    if (personalProfile.quickDocs.length === 0) {
        personalProfile.quickDocs.push({ id: Date.now(), title: "Welcome Document" });
    }
    
    saveAllData();
    renderAllUI();
}

function saveAllData() {
    const exportData = { personalProfile, masterDatabase, settings };
    localStorage.setItem("plutoVaultData", JSON.stringify(exportData));
}

// ---------- RENDER FUNCTIONS ----------
function renderAllUI() {
    renderProfile();
    renderNotesWishlist();
    renderQuickDocs();
    renderMasterTable();
    updateStats();
}

function renderProfile() {
    document.getElementById("profileName").value = personalProfile.displayName;
    document.getElementById("profileBio").value = personalProfile.bio;
    document.getElementById("profileAvatar").value = personalProfile.avatarEmoji;
}

function renderNotesWishlist() {
    const notesDiv = document.getElementById("notesList");
    if (notesDiv) {
        notesDiv.innerHTML = personalProfile.notes.map(n => `
            <div>
                <span>📝 ${escapeHtml(n.text)}</span>
                <button class="deleteNoteBtn" data-id="${n.id}" style="background:#dc2626; padding:0.2rem 0.8rem;">✖</button>
            </div>
        `).join('');
        
        document.querySelectorAll(".deleteNoteBtn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = parseInt(btn.dataset.id);
                personalProfile.notes = personalProfile.notes.filter(n => n.id !== id);
                saveAllData();
                renderNotesWishlist();
            });
        });
    }
    
    const wishDiv = document.getElementById("wishlistList");
    if (wishDiv) {
        wishDiv.innerHTML = personalProfile.wishlist.map(w => `
            <div>
                <span>🎴 ${escapeHtml(w.item)}</span>
                <button class="deleteWishBtn" data-id="${w.id}" style="background:#dc2626; padding:0.2rem 0.8rem;">✖</button>
            </div>
        `).join('');
        
        document.querySelectorAll(".deleteWishBtn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = parseInt(btn.dataset.id);
                personalProfile.wishlist = personalProfile.wishlist.filter(w => w.id !== id);
                saveAllData();
                renderNotesWishlist();
            });
        });
    }
}

function renderQuickDocs() {
    const docsDiv = document.getElementById("quickDocsList");
    if (docsDiv) {
        docsDiv.innerHTML = personalProfile.quickDocs.map(d => `
            <span class="badge" style="background:rgba(255,255,255,0.15); padding:0.3rem 1rem; border-radius:2rem;">📄 ${escapeHtml(d.title)}</span>
        `).join('');
    }
}

function renderMasterTable() {
    const tbody = document.getElementById("masterTableBody");
    if (!tbody) return;
    
    let html = "";
    masterDatabase.passwords.forEach(p => {
        html += `<tr><td>🔐 Password</td><td>${escapeHtml(p.title)}</td><td>${escapeHtml(p.username)} / ${escapeHtml(p.password)}</td><td><button class="delDbEntry" data-type="passwords" data-id="${p.id}">del</button></td></tr>`;
    });
    masterDatabase.secrets.forEach(s => {
        html += `<tr><td>🤫 Secret</td><td>${escapeHtml(s.title)}</td><td>${escapeHtml(s.content.substring(0, 40))}</td><td><button class="delDbEntry" data-type="secrets" data-id="${s.id}">del</button></td></tr>`;
    });
    masterDatabase.apiKeys.forEach(k => {
        html += `<tr><td>🔑 API Key</td><td>${escapeHtml(k.name)}</td><td>${escapeHtml(k.key.substring(0, 20))}...</td><td><button class="delDbEntry" data-type="apiKeys" data-id="${k.id}">del</button></td></tr>`;
    });
    
    tbody.innerHTML = html || "<tr><td colspan='4'>No entries yet</td></tr>";
    
    document.querySelectorAll(".delDbEntry").forEach(btn => {
        btn.addEventListener("click", () => {
            const type = btn.dataset.type;
            const id = parseInt(btn.dataset.id);
            masterDatabase[type] = masterDatabase[type].filter(i => i.id !== id);
            saveAllData();
            renderMasterTable();
            updateStats();
        });
    });
}

function updateStats() {
    document.getElementById("statPasswords") && (document.getElementById("statPasswords").innerText = masterDatabase.passwords.length);
    document.getElementById("statSecrets") && (document.getElementById("statSecrets").innerText = masterDatabase.secrets.length);
    document.getElementById("statApiKeys") && (document.getElementById("statApiKeys").innerText = masterDatabase.apiKeys.length);
    document.getElementById("statNotes") && (document.getElementById("statNotes").innerText = personalProfile.notes.length);
    document.getElementById("statWishlist") && (document.getElementById("statWishlist").innerText = personalProfile.wishlist.length);
}

// ---------- LEVEL NAVIGATION ----------
function changeLevel(level) {
    for (let i = 1; i <= 5; i++) {
        const el = document.getElementById(`level${i}`);
        if (el) el.classList.add("hidden");
    }
    document.getElementById(`level${level}`).classList.remove("hidden");
    currentLevel = level;
    
    // Change background image
    const bgIndex = Math.min(level, 5);
    document.querySelector(".vault-app").style.backgroundImage = `url('images/image${bgIndex}.jpeg')`;
    
    // Reset auto-lock timer
    if (window.autoLockTimer) clearTimeout(window.autoLockTimer);
    if (level !== 1 && settings.autoLockMinutes > 0) {
        window.autoLockTimer = setTimeout(() => {
            if (currentLevel !== 1) {
                fullExit();
            }
        }, settings.autoLockMinutes * 60 * 1000);
    }
}

function fullExit() {
    mainAuth = false;
    plutoAuth = false;
    changeLevel(1);
}

// ---------- CSV IMPORT (REAL PASSWORD SCANNER) ----------
function importCSVPasswords(csvText) {
    const lines = csvText.split(/\r?\n/);
    if (lines.length < 2) return;
    
    const headers = lines[0].toLowerCase().split(",");
    let nameIdx = -1, usernameIdx = -1, passwordIdx = -1;
    
    headers.forEach((h, idx) => {
        if (h.includes("name") || h.includes("title")) nameIdx = idx;
        if (h.includes("username") || h.includes("user")) usernameIdx = idx;
        if (h.includes("password") || h.includes("pass")) passwordIdx = idx;
    });
    
    let imported = 0;
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols = lines[i].split(",");
        const title = (nameIdx !== -1 && cols[nameIdx]) ? cols[nameIdx] : `Imported ${i}`;
        const username = (usernameIdx !== -1 && cols[usernameIdx]) ? cols[usernameIdx] : "";
        const password = (passwordIdx !== -1 && cols[passwordIdx]) ? cols[passwordIdx] : "";
        
        if (username || password) {
            masterDatabase.passwords.push({
                id: Date.now() + i,
                title: title.substring(0, 50),
                username: username.substring(0, 100),
                password: password.substring(0, 200)
            });
            imported++;
        }
    }
    
    saveAllData();
    renderMasterTable();
    updateStats();
    return imported;
}

// ---------- EVENT LISTENERS ----------
document.getElementById("doLoginBtn")?.addEventListener("click", () => {
    const user = document.getElementById("loginUser").value;
    const pwd = document.getElementById("loginPass").value;
    if (user === settings.mainUsername && pwd === settings.mainPassword) {
        mainAuth = true;
        changeLevel(3);
        renderAllUI();
    } else {
        document.getElementById("loginError").innerText = "Invalid username or password";
    }
});

document.getElementById("globalExitBtn")?.addEventListener("click", fullExit);

document.getElementById("saveProfileBtn")?.addEventListener("click", () => {
    personalProfile.displayName = document.getElementById("profileName").value;
    personalProfile.bio = document.getElementById("profileBio").value;
    personalProfile.avatarEmoji = document.getElementById("profileAvatar").value;
    saveAllData();
    renderProfile();
});

document.getElementById("addNoteBtn")?.addEventListener("click", () => {
    const text = prompt("Enter your note:");
    if (text) {
        personalProfile.notes.push({ id: Date.now(), text });
        saveAllData();
        renderNotesWishlist();
        updateStats();
    }
});

document.getElementById("addWishlistBtn")?.addEventListener("click", () => {
    const item = prompt("Enter anime/movie title:");
    if (item) {
        personalProfile.wishlist.push({ id: Date.now(), item });
        saveAllData();
        renderNotesWishlist();
        updateStats();
    }
});

document.getElementById("addQuickDocBtn")?.addEventListener("click", () => {
    const title = prompt("Document title:");
    if (title) {
        personalProfile.quickDocs.push({ id: Date.now(), title });
        saveAllData();
        renderQuickDocs();
    }
});

document.getElementById("openAdminGatewayBtn")?.addEventListener("click", () => changeLevel(4));

document.getElementById("submitPlutoGateBtn")?.addEventListener("click", () => {
    const pwd = document.getElementById("plutoMasterInput").value;
    if (pwd === settings.plutoMasterPassword) {
        plutoAuth = true;
        changeLevel(5);
        renderMasterTable();
    } else {
        document.getElementById("plutoError").innerText = "Incorrect master password";
    }
});
document.getElementById("plutoMasterInput")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") document.getElementById("submitPlutoGateBtn").click();
});

document.getElementById("backToProfileBtn")?.addEventListener("click", () => changeLevel(3));

// CSV Import
document.getElementById("importCsvBtn")?.addEventListener("click", () => {
    const fileInput = document.getElementById("csvUploader");
    if (!fileInput.files.length) {
        document.getElementById("importStatus").innerHTML = "❌ Please select a CSV file first";
        return;
    }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const count = importCSVPasswords(e.target.result);
        document.getElementById("importStatus").innerHTML = `✅ Successfully imported ${count} passwords!`;
        fileInput.value = "";
    };
    reader.onerror = () => {
        document.getElementById("importStatus").innerHTML = "❌ Error reading file";
    };
    reader.readAsText(file);
});

// Admin Database CRUD
document.getElementById("addPasswordDbBtn")?.addEventListener("click", () => {
    const title = prompt("Account/Site name:");
    const username = prompt("Username:");
    const password = prompt("Password:");
    if (title) {
        masterDatabase.passwords.push({ id: Date.now(), title, username, password });
        saveAllData();
        renderMasterTable();
        updateStats();
    }
});

document.getElementById("addSecretDbBtn")?.addEventListener("click", () => {
    const title = prompt("Secret title:");
    const content = prompt("Secret content:");
    if (title) {
        masterDatabase.secrets.push({ id: Date.now(), title, content });
        saveAllData();
        renderMasterTable();
        updateStats();
    }
});

document.getElementById("addApiKeyDbBtn")?.addEventListener("click", () => {
    const name = prompt("Service name:");
    const key = prompt("API Key:");
    if (name) {
        masterDatabase.apiKeys.push({ id: Date.now(), name, key });
        saveAllData();
        renderMasterTable();
        updateStats();
    }
});

document.getElementById("changePlutoPwdBtn")?.addEventListener("click", () => {
    const newPwd = document.getElementById("newPlutoPwd").value;
    if (newPwd) {
        settings.plutoMasterPassword = newPwd;
        saveAllData();
        alert("Pluto master password changed successfully!");
        document.getElementById("newPlutoPwd").value = "";
    }
});

document.getElementById("saveAutoLockBtn")?.addEventListener("click", () => {
    const mins = parseInt(document.getElementById("autoLockMinutes").value);
    if (mins > 0) {
        settings.autoLockMinutes = mins;
        saveAllData();
        alert(`Auto-lock set to ${mins} minutes`);
    }
});

document.getElementById("exportFullBackupBtn")?.addEventListener("click", () => {
    const backup = { personalProfile, masterDatabase, settings };
    const dataStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pluto_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
});

document.getElementById("importFullBackupBtn")?.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const imported = JSON.parse(ev.target.result);
                personalProfile = imported.personalProfile || personalProfile;
                masterDatabase = imported.masterDatabase || masterDatabase;
                settings = imported.settings || settings;
                saveAllData();
                renderAllUI();
                alert("Backup restored successfully!");
            } catch(err) {
                alert("Invalid backup file");
            }
        };
        reader.readAsText(file);
    };
    input.click();
});

document.getElementById("resetAllBtn")?.addEventListener("click", () => {
    if (confirm("⚠️ THIS WILL DELETE EVERYTHING. Type 'RESET ALL' to confirm")) {
        const confirmText = prompt('Type "RESET ALL" to permanently delete all data:');
        if (confirmText === "RESET ALL") {
            localStorage.clear();
            location.reload();
        }
    }
});

function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Start the app
loadAllData();
changeLevel(1);
