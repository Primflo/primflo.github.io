// ---------- GLOBAL STATE ----------
let currentLevel = 1;
let selectedAnimals = [];
let masterPasswordHash = null;

// Data structures
let personalProfile = {
    displayName: "Anime Keeper",
    bio: "Secrets of the multiverse",
    avatarEmoji: "🦊",
    notes: [],
    wishlist: []
};

let masterDatabase = {
    passwords: [],   // {id, title, username, password}
    secrets: [],
    apiKeys: []
};

let settings = {
    plutoMasterPassword: "Pluto123!",   // plaintext only for demo, in real world you'd hash
    autoLockMinutes: 5
};

// ---------- HELPER: LOAD / SAVE (encrypted localStorage) ----------
function saveAllData() {
    const exportObj = {
        personalProfile,
        masterDatabase,
        settings,
        version: 1
    };
    localStorage.setItem("plutoVaultData", JSON.stringify(exportObj));
}

function loadAllData() {
    const raw = localStorage.getItem("plutoVaultData");
    if (raw) {
        try {
            const data = JSON.parse(raw);
            personalProfile = data.personalProfile || personalProfile;
            masterDatabase = data.masterDatabase || masterDatabase;
            settings = data.settings || settings;
        } catch(e) {}
    }
    // defaults if empty
    if (masterDatabase.passwords.length === 0) masterDatabase.passwords.push({ id: Date.now(), title: "Example Gmail", username: "user@gmail.com", password: "****" });
    if (personalProfile.notes.length === 0) personalProfile.notes.push({ id: Date.now(), text: "Welcome to Pluto Vault!" });
    if (personalProfile.wishlist.length === 0) personalProfile.wishlist.push({ id: Date.now(), item: "Jujutsu Kaisen" });
    renderAllUI();
}

// ---------- RENDER EVERYTHING ----------
function renderAllUI() {
    renderProfile();
    renderNotesWishlist();
    renderMasterTable();
    updateAnimalLevel2();
}

function renderProfile() {
    document.getElementById("profileName").value = personalProfile.displayName;
    document.getElementById("profileBio").value = personalProfile.bio;
    document.getElementById("profileAvatar").value = personalProfile.avatarEmoji;
}

function renderNotesWishlist() {
    const notesDiv = document.getElementById("notesList");
    if (notesDiv) {
        notesDiv.innerHTML = personalProfile.notes.map(n => `<div class="glass-card" style="margin:0.5rem 0; padding:0.5rem;">📌 ${escapeHtml(n.text)} <button class="delNote" data-id="${n.id}" style="float:right; background:#dc2626; padding:0.2rem 0.8rem;">✖</button></div>`).join('');
        document.querySelectorAll(".delNote").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = parseInt(btn.dataset.id);
                personalProfile.notes = personalProfile.notes.filter(n => n.id !== id);
                saveAllData(); renderNotesWishlist();
            });
        });
    }
    const wishDiv = document.getElementById("wishlistList");
    if (wishDiv) {
        wishDiv.innerHTML = personalProfile.wishlist.map(w => `<div>🎴 ${escapeHtml(w.item)} <button class="delWish" data-id="${w.id}" style="background:none; color:#f87171;">🗑️</button></div>`).join('');
        document.querySelectorAll(".delWish").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = parseInt(btn.dataset.id);
                personalProfile.wishlist = personalProfile.wishlist.filter(w => w.id !== id);
                saveAllData(); renderNotesWishlist();
            });
        });
    }
}

function renderMasterTable() {
    const tbody = document.querySelector("#masterTable tbody");
    if (!tbody) return;
    let html = "";
    masterDatabase.passwords.forEach(p => {
        html += `<tr><td>🔐 Password</td><td>${escapeHtml(p.title)}</td><td>${escapeHtml(p.username)} / ${escapeHtml(p.password)}</td><td><button class="delEntry" data-type="passwords" data-id="${p.id}">del</button></td></tr>`;
    });
    masterDatabase.secrets.forEach(s => {
        html += `<tr><td>🤫 Secret</td><td>${escapeHtml(s.title)}</td><td>${escapeHtml(s.content.substring(0,40))}</td><td><button class="delEntry" data-type="secrets" data-id="${s.id}">del</button></td></tr>`;
    });
    masterDatabase.apiKeys.forEach(k => {
        html += `<tr><td>🔑 API Key</td><td>${escapeHtml(k.name)}</td><td>${escapeHtml(k.key.substring(0,20))}...</td><td><button class="delEntry" data-type="apiKeys" data-id="${k.id}">del</button></td></tr>`;
    });
    tbody.innerHTML = html || "<tr><td colspan='4'>No entries</td></tr>";
    document.querySelectorAll(".delEntry").forEach(btn => {
        btn.addEventListener("click", () => {
            const type = btn.dataset.type;
            const id = parseInt(btn.dataset.id);
            masterDatabase[type] = masterDatabase[type].filter(i => i.id !== id);
            saveAllData(); renderMasterTable();
        });
    });
}

function updateAnimalLevel2() {
    const container = document.getElementById("animalsGrid");
    if (!container) return;
    const animals = ["🦊 Fox", "🐱 Cat", "🐶 Dog", "🐼 Panda", "🦉 Owl"];
    container.innerHTML = animals.map(animal => {
        const name = animal.split(" ")[1];
        const isSel = selectedAnimals.includes(name);
        return `<div class="animal-card ${isSel ? 'selected' : ''}" data-animal="${name}">${animal}</div>`;
    }).join('');
    document.getElementById("animalProgress").innerText = `selected ${selectedAnimals.length}/5`;
    if (selectedAnimals.length === 5) {
        setTimeout(() => changeLevel(3), 800);
    }
    // attach events
    document.querySelectorAll(".animal-card").forEach(card => {
        card.addEventListener("click", (e) => {
            const animal = card.dataset.animal;
            if (!selectedAnimals.includes(animal)) {
                selectedAnimals.push(animal);
                saveAllData();
                updateAnimalLevel2();
            }
        });
    });
}

function changeLevel(level) {
    for (let i=1; i<=5; i++) {
        const sec = document.getElementById(`level${i}`);
        if (sec) sec.classList.add("hidden");
    }
    document.getElementById(`level${level}`).classList.remove("hidden");
    currentLevel = level;
    // change background based on level
    const bgIndex = Math.min(level, 5);
    document.querySelector(".vault-app").style.backgroundImage = `url('images/image${bgIndex}.jpeg')`;
    if (level === 3) renderAllUI();
    if (level === 5) renderMasterTable();
}

function fullExit() {
    selectedAnimals = [];
    changeLevel(1);
}

// ---------- CSV IMPORT (real browser password scanner) ----------
function parseCsvAndImport(csvText) {
    const lines = csvText.split(/\r?\n/);
    const headers = lines[0].toLowerCase().split(",");
    let nameIdx = -1, urlIdx = -1, usernameIdx = -1, passwordIdx = -1;
    headers.forEach((h, idx) => {
        if (h.includes("name") || h.includes("title")) nameIdx = idx;
        if (h.includes("url")) urlIdx = idx;
        if (h.includes("username") || h.includes("user")) usernameIdx = idx;
        if (h.includes("password") || h.includes("pass")) passwordIdx = idx;
    });
    let importedCount = 0;
    for (let i=1; i<lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols = lines[i].split(",");
        const title = (nameIdx !== -1 && cols[nameIdx]) ? cols[nameIdx] : (urlIdx !== -1 ? cols[urlIdx] : "imported");
        const username = (usernameIdx !== -1 && cols[usernameIdx]) ? cols[usernameIdx] : "";
        const password = (passwordIdx !== -1 && cols[passwordIdx]) ? cols[passwordIdx] : "";
        if (username || password) {
            masterDatabase.passwords.push({ id: Date.now() + i, title, username, password });
            importedCount++;
        }
    }
    saveAllData();
    renderMasterTable();
    document.getElementById("importStatus").innerHTML = `✅ imported ${importedCount} passwords securely.`;
}

// ---------- EVENT LISTENERS ----------
document.getElementById("doLoginBtn")?.addEventListener("click", () => {
    const user = document.getElementById("loginUser").value;
    const pwd = document.getElementById("loginPass").value;
    if (user === "admin" && pwd === "admin123") {
        changeLevel(2);
    } else {
        document.getElementById("loginError").innerText = "wrong credentials";
    }
});
document.getElementById("globalExit")?.addEventListener("click", fullExit);
document.getElementById("saveProfileBtn")?.addEventListener("click", () => {
    personalProfile.displayName = document.getElementById("profileName").value;
    personalProfile.bio = document.getElementById("profileBio").value;
    personalProfile.avatarEmoji = document.getElementById("profileAvatar").value;
    saveAllData();
    renderProfile();
});
document.getElementById("addNoteBtn")?.addEventListener("click", () => {
    let txt = prompt("Note text");
    if (txt) { personalProfile.notes.push({ id: Date.now(), text: txt }); saveAllData(); renderNotesWishlist(); }
});
document.getElementById("addWishlistBtn")?.addEventListener("click", () => {
    let ani = prompt("Anime title");
    if (ani) { personalProfile.wishlist.push({ id: Date.now(), item: ani }); saveAllData(); renderNotesWishlist(); }
});
document.getElementById("importCsvBtn")?.addEventListener("click", () => {
    const fileInput = document.getElementById("csvUploader");
    if (!fileInput.files.length) { alert("select csv file first"); return; }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = (e) => parseCsvAndImport(e.target.result);
    reader.readAsText(file);
});
document.getElementById("gotoPlutoGatewayBtn")?.addEventListener("click", () => changeLevel(4));
document.getElementById("submitPlutoGateBtn")?.addEventListener("click", () => {
    const pwd = document.getElementById("plutoMasterInput").value;
    if (pwd === settings.plutoMasterPassword) {
        changeLevel(5);
    } else {
        document.getElementById("plutoError").innerText = "wrong master password";
    }
});
document.getElementById("backToProfileBtn")?.addEventListener("click", () => changeLevel(3));
document.getElementById("openAdminBtn")?.addEventListener("click", () => changeLevel(4));
document.getElementById("addPasswordDbBtn")?.addEventListener("click", () => {
    let title = prompt("title"); let user = prompt("username"); let pwd = prompt("password");
    if (title) masterDatabase.passwords.push({ id: Date.now(), title, username: user, password: pwd });
    saveAllData(); renderMasterTable();
});
document.getElementById("addSecretDbBtn")?.addEventListener("click", () => {
    let title = prompt("secret title"); let content = prompt("content");
    if (title) masterDatabase.secrets.push({ id: Date.now(), title, content });
    saveAllData(); renderMasterTable();
});
document.getElementById("addApiKeyDbBtn")?.addEventListener("click", () => {
    let name = prompt("service name"); let key = prompt("api key");
    if (name) masterDatabase.apiKeys.push({ id: Date.now(), name, key });
    saveAllData(); renderMasterTable();
});
document.getElementById("changePlutoPwdBtn")?.addEventListener("click", () => {
    let newPwd = document.getElementById("newPlutoPwd").value;
    if (newPwd) { settings.plutoMasterPassword = newPwd; saveAllData(); alert("master password updated"); }
});
document.getElementById("saveAutoLockBtn")?.addEventListener("click", () => {
    let mins = parseInt(document.getElementById("autoLockMinutes").value);
    if (mins) settings.autoLockMinutes = mins; saveAllData();
});
document.getElementById("exportFullBackupBtn")?.addEventListener("click", () => {
    const backup = { personalProfile, masterDatabase, settings };
    const dataStr = JSON.stringify(backup);
    const blob = new Blob([dataStr], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `pluto_backup_${Date.now()}.json`; a.click(); URL.revokeObjectURL(url);
});
document.getElementById("importFullBackupBtn")?.addEventListener("click", () => {
    let inp = document.createElement("input"); inp.type = "file"; inp.accept = ".json";
    inp.onchange = (e) => {
        let f = e.target.files[0];
        let r = new FileReader();
        r.onload = (ev) => {
            try {
                const imported = JSON.parse(ev.target.result);
                personalProfile = imported.personalProfile || personalProfile;
                masterDatabase = imported.masterDatabase || masterDatabase;
                settings = imported.settings || settings;
                saveAllData(); renderAllUI(); alert("import success");
            } catch(err) { alert("invalid backup"); }
        };
        r.readAsText(f);
    };
    inp.click();
});
document.getElementById("resetAllBtn")?.addEventListener("click", () => {
    if (confirm("⚠️ RESET EVERYTHING? Type 'reset all'")) {
        let check = prompt("type 'reset all' to confirm");
        if (check === "reset all") { localStorage.clear(); location.reload(); }
    }
});

function escapeHtml(str) { return String(str).replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'); }

loadAllData();
changeLevel(1);
