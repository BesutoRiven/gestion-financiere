// IMPORTANT : incrémente ce numéro à chaque déploiement (gf-v21 -> gf-v7...).
const CACHE = "gf-v21";
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

// Permet à la page de forcer l'activation immédiate d'une nouvelle version.
self.addEventListener("message", e => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

// Stratégie "réseau d'abord" : quand tu es en ligne, tu as TOUJOURS la
// dernière version ; hors-ligne, on retombe sur la copie en cache.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("supabase")) return; // jamais mettre en cache les données
  e.respondWith(
    fetch(e.request).then(rep => {
      const copie = rep.clone();
      caches.open(CACHE).then(c => c.put(e.request, copie)).catch(()=>{});
      return rep;
    }).catch(() => caches.match(e.request))
  );
});
