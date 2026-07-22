// IMPORTANT : incrÃ©mente ce numÃ©ro Ã  chaque dÃ©ploiement (gf-v32 -> gf-v7...).
const CACHE = "gf-v1.16.1";
const FICHIERS = [
  "index.html", "app.html", "profil.html",
  "styles.css", "config.js", "manifest.json",
  "icon-192.png", "icon-512.png"
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
