// Helper toast (popup)
function showPopupToast(text, ms = 2500) {
  const el = document.getElementById("popupToast");
  el.textContent = text;
  el.style.display = "block";
  clearTimeout(el._t);
  el._t = setTimeout(() => el.style.display = "none", ms);
}

// Load backups and render (with optional filter)
function renderBackups(filter = "") {
  chrome.runtime.sendMessage({ type: "REQUEST_BACKUPS" }, (resp) => {
    const container = document.getElementById("backupsList");
    const countEl = document.getElementById("backupCount");
    container.innerHTML = "";
    if (!resp || !resp.ok) {
      container.textContent = "Impossible de charger les sauvegardes.";
      countEl.textContent = "Erreur";
      return;
    }
    const backups = resp.backups || [];
    countEl.textContent = `${backups.length} sauvegarde(s)`;
    const filtered = backups.filter(b => {
      if (!filter) return true;
      const f = filter.toLowerCase();
      return (b.domain && b.domain.toLowerCase().includes(f)) || (b.date && new Date(b.date).toLocaleString().toLowerCase().includes(f));
    });
    if (!filtered.length) {
      container.textContent = "Aucune sauvegarde correspondante.";
      return;
    }
    filtered.forEach(b => {
      const el = document.createElement("div");
      el.className = "backup";
      const left = document.createElement("div");
      left.className = "backup-left";
      const domain = document.createElement("div");
      domain.className = "domain";
      domain.textContent = b.domain || "inconnu";
      const date = document.createElement("div");
      date.className = "date";
      date.textContent = new Date(b.date).toLocaleString();
      left.appendChild(domain);
      left.appendChild(date);

      const actions = document.createElement("div");
      actions.className = "actions";

      const restoreBtn = document.createElement("button");
      restoreBtn.textContent = "Restaurer";
      restoreBtn.addEventListener("click", () => {
        restoreBackup(b.id);
      });

      const delBtn = document.createElement("button");
      delBtn.textContent = "Supprimer";
      delBtn.className = "danger";
      delBtn.addEventListener("click", () => {
        if (!confirm("Supprimer cette sauvegarde ?")) return;
        chrome.runtime.sendMessage({ type: "DELETE_BACKUP", backupId: b.id }, (r) => {
          if (r && r.ok) {
            showPopupToast("Sauvegarde supprimée");
            renderBackups(document.getElementById("search").value.trim());
          } else {
            showPopupToast("Erreur suppression");
          }
        });
      });

      actions.appendChild(restoreBtn);
      actions.appendChild(delBtn);

      el.appendChild(left);
      el.appendChild(actions);
      container.appendChild(el);
    });
  });
}

// Restore helper (asks background to find Anime-sama tab)
function restoreBackup(backupId) {
  chrome.runtime.sendMessage({ type: "REQUEST_RESTORE_TO_TAB", backupId }, (resp) => {
    if (resp && resp.ok) {
      showPopupToast("Restauration demandée");
    } else {
      showPopupToast("Impossible de restaurer: " + (resp && resp.reason ? resp.reason : "erreur"));
    }
  });
}

// Manual save: find anime tab and inject script to collect localStorage
function manualSave() {
  chrome.tabs.query({}, (tabs) => {
    const animeTab = tabs.find(t => t.url && t.url.includes("anime-sama"));
    if (!animeTab) {
      showPopupToast("Aucun onglet Anime-sama ouvert");
      return;
    }
    chrome.scripting.executeScript({
      target: { tabId: animeTab.id },
      func: () => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          data[key] = localStorage.getItem(key);
        }
        chrome.runtime.sendMessage({ type: "SAVE_LOCALSTORAGE", domain: window.location.hostname, payload: data });
      }
    }, () => {
      if (chrome.runtime.lastError) {
        showPopupToast("Erreur injection: " + chrome.runtime.lastError.message);
      } else {
        showPopupToast("Sauvegarde demandée");
        setTimeout(() => renderBackups(document.getElementById("search").value.trim()), 600);
      }
    });
  });
}

// Restore last backup
function manualRestoreLast() {
  chrome.runtime.sendMessage({ type: "REQUEST_BACKUPS" }, (resp) => {
    if (resp && resp.ok && resp.backups.length > 0) {
      restoreBackup(resp.backups[0].id);
    } else {
      showPopupToast("Aucune sauvegarde disponible");
    }
  });
}

// Export backups as JSON file
function exportBackups() {
  chrome.runtime.sendMessage({ type: "REQUEST_BACKUPS" }, (resp) => {
    if (!resp || !resp.ok) { showPopupToast("Erreur export"); return; }
    const data = resp.backups || [];
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "anime-sama-backups.json";
    a.click();
    URL.revokeObjectURL(url);
    showPopupToast("Export démarré");
  });
}

// Import backups from file (merges)
function importBackupsFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) { showPopupToast("Fichier invalide"); return; }
      // Merge: fetch existing, concat, dedupe by id
      chrome.runtime.sendMessage({ type: "REQUEST_BACKUPS" }, (resp) => {
        const existing = (resp && resp.ok && Array.isArray(resp.backups)) ? resp.backups : [];
        const merged = [...imported, ...existing];
        const map = new Map();
        merged.forEach(b => map.set(b.id, b));
        const final = Array.from(map.values()).slice(0, 200);
        chrome.storage.local.set({ backups: final }, () => {
          showPopupToast("Import terminé");
          renderBackups(document.getElementById("search").value.trim());
        });
      });
    } catch (err) {
      showPopupToast("Erreur lecture fichier");
    }
  };
  reader.readAsText(file);
}

// Clear all backups
function clearAllBackups() {
  if (!confirm("Supprimer toutes les sauvegardes ?")) return;
  chrome.storage.local.set({ backups: [] }, () => {
    showPopupToast("Toutes les sauvegardes supprimées");
    renderBackups();
  });
}

// Open GitHub repo
function openRepo() {
  const url = "https://github.com/hvkenzozz/anime-sama";
  chrome.tabs.create({ url });
}

// Event bindings
document.addEventListener("DOMContentLoaded", () => {
  renderBackups();

  document.getElementById("manualSave").addEventListener("click", manualSave);
  document.getElementById("manualRestore").addEventListener("click", manualRestoreLast);
  document.getElementById("saveInterval").addEventListener("click", async () => {
    const value = parseInt(document.getElementById("interval").value, 10);
    await chrome.storage.local.set({ autoSaveInterval: value });
    showPopupToast("Intervalle enregistré");
  });

  // Load saved interval
  chrome.storage.local.get("autoSaveInterval", (s) => {
    if (s && s.autoSaveInterval) document.getElementById("interval").value = s.autoSaveInterval;
  });

  document.getElementById("exportBtn").addEventListener("click", exportBackups);
  document.getElementById("importFile").addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) importBackupsFile(f);
    e.target.value = "";
  });

  document.getElementById("clearAll").addEventListener("click", clearAllBackups);
  document.getElementById("openRepo").addEventListener("click", openRepo);

  // Search
  const search = document.getElementById("search");
  let searchTimer = null;
  search.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => renderBackups(search.value.trim()), 220);
  });
  document.getElementById("clearSearch").addEventListener("click", () => {
    search.value = "";
    renderBackups();
  });
});
