// IMPORTANT : incrÃ©mente ce numÃ©ro Ã  chaque dÃ©ploiement (gf-v32 -> gf-v7...).
const CACHE = "gf-v1.22.1";
const FICHIERS = [
  "index.html", "app.html", "profil.html",
  "styles.css", "config.js", "manifest.json",
  "icon-192.png", "icon-512.png",
  "assets/animated-icons/check-on.gif", "assets/animated-icons/check-off.gif",
  "assets/animated-icons/check-all.gif", "assets/animated-icons/home.gif",
  "assets/animated-icons/settings.gif", "assets/animated-icons/file.gif",
  "assets/animated-icons/folder.gif", "assets/animated-icons/admin.gif",
  "assets/animated-icons/edit.gif", "assets/animated-icons/menu.gif",
  "assets/animated-icons/image.gif", "assets/animated-icons/import.gif",
  "assets/animated-icons/dollar.gif", "assets/animated-icons/tools.gif",
  "assets/animated-icons/order.gif", "assets/animated-icons/save.gif",
  "assets/animated-icons/cash.gif", "assets/animated-icons/receipt.gif",
  "assets/animated-icons/card.gif", "assets/animated-icons/menu-big.gif",
  "assets/animated-icons/menu-close.gif",
  "assets/animated-icons/admin.png", "assets/animated-icons/card.png",
  "assets/animated-icons/cash.png", "assets/animated-icons/check-all.png",
  "assets/animated-icons/check-off.png", "assets/animated-icons/check-on.png",
  "assets/animated-icons/dollar.png", "assets/animated-icons/edit.png",
  "assets/animated-icons/file.png", "assets/animated-icons/folder.png",
  "assets/animated-icons/home.png", "assets/animated-icons/image.png",
  "assets/animated-icons/import.png", "assets/animated-icons/menu.png",
  "assets/animated-icons/menu-big.png", "assets/animated-icons/menu-close.png",
  "assets/animated-icons/order.png", "assets/animated-icons/receipt.png",
  "assets/animated-icons/save.png", "assets/animated-icons/settings.png",
  "assets/animated-icons/tools.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(cles =>
    Promise.all(cles.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

// Permet Ã  la page de forcer l'activation immÃ©diate d'une nouvelle version.
self.addEventListener("message", e => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

// StratÃ©gie "rÃ©seau d'abord" : quand tu es en ligne, tu as TOUJOURS la
// derniÃ¨re version ; hors-ligne, on retombe sur la copie en cache.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("supabase")) return; // jamais mettre en cache les donnÃ©es
  e.respondWith(
    fetch(e.request).then(rep => {
      const copie = rep.clone();
      caches.open(CACHE).then(c => c.put(e.request, copie)).catch(()=>{});
      return rep;
    }).catch(() => caches.match(e.request))
  );
});




