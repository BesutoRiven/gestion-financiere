// IMPORTANT : à chaque modification du site, incrémente ce numéro (v2 -> v3...)
// pour forcer les téléphones à récupérer la nouvelle version.
const CACHE = "gf-v4";
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

self.addEventListener("fetch", e => {
  // On ne met en cache QUE nos propres fichiers.
  // Les appels vers Supabase (connexion, données) doivent toujours passer par le réseau.
  if (e.request.url.includes("supabase")) return;
  e.respondWith(caches.match(e.request).then(rep => rep || fetch(e.request)));
});
