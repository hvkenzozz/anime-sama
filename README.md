# Anime-sama Profile Saver

Extension Chrome pour **sauvegarder et restaurer automatiquement ton profil Anime-sama** (localStorage).  
Elle permet de ne jamais perdre ton avancement, même en cas de crash ou de changement de navigateur.

---

## 🚀 Fonctionnalités

- **Sauvegarde automatique** :
  - À la fermeture de la page Anime-sama.
  - À intervalle régulier (configurable : 15 min, 30 min, 1h).
- **Sauvegarde manuelle** :
  - Bouton dans le popup pour sauvegarder immédiatement.
- **Restauration** :
  - Restaurer la dernière sauvegarde en un clic.
  - Restaurer une sauvegarde spécifique depuis la liste.
- **Gestion des sauvegardes** :
  - Liste avec domaine + date.
  - Suppression individuelle ou suppression totale.
  - Export/Import des sauvegardes en JSON.
- **Interface améliorée** :
  - Recherche par domaine ou date.
  - Toasts visuels au lieu d’alertes.
  - Compteur de sauvegardes.
- **Vérification de mise à jour** :
  - Notification si une nouvelle version est disponible sur GitHub.

---

## 📁 Structure des fichiers

```text
anime-sama/
├── manifest.json       # Permissions et configuration de l’extension
├── background.js       # Gestion des sauvegardes et restauration
├── content.js          # Injection dans Anime-sama (sauvegarde/restauration)
├── popup.html          # Interface utilisateur
├── popup.js            # Logique du popup
└── icon.png            # Icône de l’extension
```
---

## 🔧 Installation

1. Télécharge ou clone ce dépôt.
2. Ouvre Chrome et va dans `chrome://extensions/`.
3. Active le **Mode développeur** (en haut à droite).
4. Clique sur **Charger l’extension non empaquetée**.
5. Sélectionne le dossier `anime-sama`.

---

## 🖥️ Utilisation

- Clique sur l’icône de l’extension pour ouvrir le popup.
- Utilise les boutons :
  - **Sauvegarder maintenant** → crée une sauvegarde immédiate.
  - **Restaurer dernière** → restaure la sauvegarde la plus récente.
- Configure la **sauvegarde automatique** via le menu déroulant.
- Consulte la liste des sauvegardes pour restaurer ou supprimer individuellement.
- Utilise **Exporter** pour télécharger un fichier JSON de tes sauvegardes.
- Utilise **Importer** pour charger un fichier JSON et fusionner avec tes sauvegardes existantes.

---

## ⚙️ Permissions

L’extension demande l’accès aux domaines suivants pour fonctionner :

- `https://anime-sama.eu/*`
- `https://*.anime-sama.eu/*`
- `https://anime-sama.fr/*`
- `https://*.anime-sama.fr/*`
- `https://anime-sama.com/*`
- `https://*.anime-sama.com/*`
- `https://anime-sama.org/*`
- `https://*.anime-sama.org/*`

---

## 🛠️ Développement

- Les sauvegardes sont stockées dans `chrome.storage.local`.
- Limite : 50 sauvegardes conservées (les plus anciennes sont supprimées).
- Export/Import permet de dépasser cette limite (fusion jusqu’à 200 sauvegardes).

---

## 📌 Auteur

Développé par **Enzo**.  
Icône et interface personnalisées pour Anime-sama.

