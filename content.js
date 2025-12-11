const currentDomain = window.location.hostname || location.hostname;

// Toast visuel dans la page
function showToast(message) {
  try {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.background = "#111827";
    toast.style.color = "#fff";
    toast.style.padding = "10px 14px";
    toast.style.borderRadius = "8px";
    toast.style.zIndex = "2147483647";
    toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  } catch (e) {
    // ignore si DOM inaccessible
  }
}

// Sauvegarde du localStorage
function collectLocalStorage() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    data[key] = localStorage.getItem(key);
  }
  return data;
}

function saveProfile(message) {
  const data = collectLocalStorage();
  chrome.runtime.sendMessage({
    type: "SAVE_LOCALSTORAGE",
    domain: currentDomain,
    payload: data
  }, (resp) => {
    if (resp && resp.ok) {
      showToast(message || "Profil sauvegardé.");
    } else {
      showToast("Erreur sauvegarde.");
    }
  });
}

// Sauvegarde automatique à la fermeture
window.addEventListener("beforeunload", () => {
  if (currentDomain.includes("anime-sama")) {
    saveProfile("✅ Profil sauvegardé automatiquement avant fermeture !");
  }
});

// Intervalle de sauvegarde configurable
(async () => {
  try {
    const store = await chrome.storage.local.get("autoSaveInterval");
    const minutes = store.autoSaveInterval || 30;
    setInterval(() => {
      if (currentDomain.includes("anime-sama")) {
        saveProfile(`💾 Profil sauvegardé automatiquement (${minutes} min) !`);
      }
    }, minutes * 60 * 1000);
  } catch (e) {
    console.error("Erreur autoSaveInterval:", e);
  }
})();

// Restauration depuis background
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "RESTORE_LOCALSTORAGE") {
    try {
      const payload = msg.payload || {};
      localStorage.clear();
      for (const k in payload) {
        localStorage.setItem(k, payload[k]);
      }
      showToast(`✅ Restauration effectuée depuis ${msg.fromDomain || 'backup'}.`);
      sendResponse({ ok: true });
    } catch (e) {
      console.error("Erreur restauration content:", e);
      sendResponse({ ok: false, reason: e.message });
    }
    return true;
  }
});
