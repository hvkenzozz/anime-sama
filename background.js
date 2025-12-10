const BACKUPS_KEY = "backups";
const LAST_DOMAIN_KEY = "lastDomain";

chrome.runtime.onMessage.addListener(async (msg, sender) => {
  // Sauvegarde
  if (msg.type === "SAVE_LOCALSTORAGE") {
    const domain = msg.domain;
    const payload = msg.payload;

    const store = await chrome.storage.local.get([BACKUPS_KEY]);
    const backups = store[BACKUPS_KEY] || {};

    const arr = backups[domain] || [];
    arr.push({ data: payload, date: new Date().toISOString() });
    backups[domain] = arr;

    await chrome.storage.local.set({ [BACKUPS_KEY]: backups });
    return;
  }

  // Domaine courant
  if (msg.type === "SET_LAST_DOMAIN") {
    await chrome.storage.local.set({ [LAST_DOMAIN_KEY]: msg.domain });
    return;
  }

  // Restauration
  if (msg.type === "REQUEST_RESTORE_TO_ACTIVE_TAB") {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (!tab || !tab.id || !tab.url) return;

    const store = await chrome.storage.local.get([BACKUPS_KEY]);
    const backups = store[BACKUPS_KEY] || {};

    const flat = [];
    for (const [domain, arr] of Object.entries(backups)) {
      for (const snap of arr) {
        flat.push({ domain, date: snap.date, data: snap.data });
      }
    }
    flat.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (flat.length === 0) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => alert("Aucune sauvegarde trouvée.")
      });
      return;
    }

    const chosen = flat[0];
    const fromDomain = chosen.domain;

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (data) => {
          for (const key in data) {
            localStorage.setItem(key, data[key]);
          }
          alert("Restauration réussie depuis " + data.__domain);
        },
        args: [{ ...chosen.data, __domain: fromDomain }]
      });
    } catch (e) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (err) => alert("Restauration échouée: " + err),
        args: [String(e)]
      });
    }
  }
});
