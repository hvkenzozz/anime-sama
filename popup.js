// Sauvegarde directe via injection
document.getElementById("btnSave").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  // Vérifie que l'URL commence par https://anime-sama
  if (!tab.url.startsWith("https://anime-sama")) {
    alert("Cette extension ne fonctionne que sur les sites anime-sama.");
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      chrome.runtime.sendMessage({
        type: "SAVE_LOCALSTORAGE",
        domain: window.location.hostname,
        payload: data
      });
      alert("Sauvegarde effectuée !");
    }
  });
});

// Restauration via background
document.getElementById("btnRestore").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  // Vérifie que l'URL commence par https://anime-sama
  if (!tab.url.startsWith("https://anime-sama")) {
    alert("Cette extension ne fonctionne que sur les sites anime-sama.");
    return;
  }

  chrome.runtime.sendMessage({ type: "REQUEST_RESTORE_TO_ACTIVE_TAB" });
});
