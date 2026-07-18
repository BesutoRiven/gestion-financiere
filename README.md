# Gestion financière — v2 (comptes + profil)

Ajout d'une vraie connexion (email/mot de passe + Google), d'une page profil
(photo, mot de passe, 2FA), et de la déconnexion. Le tout branché sur Supabase.

---

## Vue d'ensemble des fichiers

- `index.html`  → page d'accueil + connexion / inscription
- `app.html`    → l'app des dépenses (protégée : redirige si non connecté)
- `profil.html` → photo, mot de passe, 2FA, changer de compte, déconnexion
- `config.js`   → **le seul fichier à remplir** (tes clés Supabase)
- `styles.css`  → design commun
- `sw.js`, `manifest.json`, `icon-*.png` → PWA (app installable)

---

## Étape A — Créer le projet Supabase (gratuit)

1. Va sur https://supabase.com → "Start your project" → connecte-toi avec GitHub.
2. "New project" : donne un nom, un mot de passe de base de données, une région
   (choisis **Europe**, ex. `eu-west` / Paris si dispo).
3. Attends ~2 min que le projet se crée.

## Étape B — Coller tes clés dans `config.js`

1. Dans le projet : **Project Settings → API**.
2. Copie **Project URL** → dans `config.js` à la place de `SUPABASE_URL`.
3. Copie la clé **anon public** → à la place de `SUPABASE_ANON_KEY`.

> La clé `anon` est publique par nature, aucun souci qu'elle soit dans le code.
> Ne copie JAMAIS la clé `service_role` (secrète) ici.

## Étape C — Déclarer l'adresse de ton site (redirections)

Sans ça, la connexion Google et les emails de confirmation ne reviendront pas au bon endroit.

1. **Authentication → URL Configuration**.
2. **Site URL** : `https://besutoriven.github.io/gestion-financiere/`
3. **Redirect URLs** : ajoute
   `https://besutoriven.github.io/gestion-financiere/*`
   (et pour tes tests locaux : `http://localhost:8000/*`)

## Étape D — Photo de profil (bucket de stockage)

1. **Storage → New bucket** : nomme-le exactement `avatars`, coche **Public bucket**.
2. C'est tout pour démarrer (lecture publique, écriture par les connectés).

## Étape E — Connexion Google (la partie la plus technique)

C'est l'étape la plus fastidieuse ; on peut la faire ensemble si tu veux.
Résumé :

1. Sur **Google Cloud Console**, crée un "OAuth client ID" (type "Web application").
2. Dans "Authorized redirect URIs", mets l'URL de callback fournie par Supabase
   (visible dans **Authentication → Providers → Google**).
3. Récupère le **Client ID** et le **Client Secret** Google.
4. Dans Supabase : **Authentication → Providers → Google** → colle les deux, active, sauvegarde.

> Tant que ce n'est pas configuré, le bouton "Continuer avec Google" affichera une
> erreur — mais la connexion par email/mot de passe, elle, marche tout de suite.

## Étape F (option test facile) — Désactiver la confirmation d'email

Pour tester sans attendre les emails : **Authentication → Sign In / Providers →
Email** → décoche "Confirm email". (À réactiver plus tard si tu veux.)

---

## Tester en local

    python -m http.server 8000

Puis http://localhost:8000

## Déployer

    git add .
    git commit -m "v2 : comptes, profil, 2FA"
    git push

GitHub Pages se met à jour tout seul. **Pense à vider le cache** de la PWA sur
ton téléphone si tu ne vois pas les changements (le numéro de version dans
`sw.js` a déjà été passé à v2 pour ça).

---

## Ce qui reste pour la suite

Les dépenses sont encore stockées **dans chaque appareil** (localStorage), par
compte. Prochaine étape logique : déplacer les dépenses dans la base Supabase
pour que toi et Louise partagiez réellement les mêmes données, avec des règles
d'accès (RLS) qui garantissent que chacun ne voit que ce à quoi il a droit.
