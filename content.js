const currentDomain = window.location.hostname;

// À chaque chargement de page, on note le domaine
chrome.runtime.sendMessage({ type: "SET_LAST_DOMAIN", domain: currentDomain });

// Sauvegarde automatique à la fermeture de la page
window.addEventListener("beforeunload", () => {
  if (currentDomain.includes("anime-sama")) {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }
    chrome.runtime.sendMessage({
      type: "SAVE_LOCALSTORAGE",
      domain: currentDomain,
      payload: data
    });

    // Petit message visuel
    showToast("✅ Profil sauvegardé automatiquement avant fermeture !");
  }
});

// Réception des retours (utile si tu restaures manuellement)
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "RESTORE_RESULT") {
    if (msg.ok) {
      showToast(`Restauration réussie depuis ${msg.fromDomain}. Recharge la page si besoin.`);
    } else {
      showToast(`Restauration échouée: ${msg.reason || "inconnue"}`);
    }
  }

  if (msg.type === "SAVE_DONE") {
    showToast(`Sauvegarde enregistrée pour ${currentDomain}.`);
  }
});

// Petit toast en bas de page
function showToast(message) {
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
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
