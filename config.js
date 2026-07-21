// =====================================================================
//  CONFIGURATION SUPABASE  —  À REMPLIR (une seule fois)
// =====================================================================
//  Où trouver ces valeurs :
//  Supabase Dashboard  ->  ton projet  ->  Project Settings  ->  API
//    - "Project URL"                    = SUPABASE_URL
//    - "anon public" (clé publishable)  = SUPABASE_ANON_KEY
//
//  La clé "anon" est PUBLIQUE par conception : elle peut sans risque
//  se trouver dans le code d'un site. La sécurité viendra plus tard des
//  règles d'accès (RLS) côté base de données. Ne mets JAMAIS ici la clé
//  "service_role" (secrète), elle, ne doit jamais apparaître côté site.
// =====================================================================

const SUPABASE_URL = "https://kxuorzhlejxzvlkriaoo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4dW9yemhsZWp4enZsa3JpYW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzODcwMzYsImV4cCI6MjA5OTk2MzAzNn0.ZiU0rT4XMvmbg_9-NNP9XRvrsEfoUltXVTIne9xHg9w";

// Création du client Supabase (utilisé par toutes les pages).
// persistSession + autoRefreshToken = on reste connecté après avoir fermé l'app.
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});

// Traduit les messages d'erreur techniques de Supabase en français clair.
function messageErreur(e) {
  const m = (e && e.message) || "";
  const table = {
    "Invalid login credentials": "Email ou mot de passe incorrect.",
    "Email not confirmed": "Ton email n'est pas encore confirmé. Vérifie ta boîte mail.",
    "User already registered": "Un compte existe déjà avec cet email.",
    "Password should be at least 6 characters": "Le mot de passe doit faire au moins 6 caractères.",
    "Unable to validate email address: invalid format": "Adresse email invalide.",
    "Signups not allowed for this instance": "Les inscriptions sont désactivées.",
    "Email rate limit exceeded": "Trop de tentatives, réessaie dans quelques minutes.",
    "For security purposes, you can only request this after 60 seconds.": "Patiente une minute avant de réessayer.",
    "Invalid TOTP code entered": "Code incorrect, réessaie.",
  };
  return table[m] || m || "Une erreur est survenue.";
}

// Petit garde-fou : renvoie vers la page de connexion si non connecté.
async function exigerConnexion() {
  const { data } = await sb.auth.getSession();
  if (!data.session) {
    window.location.href = "index.html";
    return null;
  }
  return data.session;
}

// ---- Thèmes de fond (partagé sur toutes les pages) ----
const THEMES_FOND = ["clair","sombre","beige","rose","noir"];
function appliquerThemeNomme(nom) {
  THEMES_FOND.forEach(t => document.documentElement.classList.remove(t));
  if (nom && nom !== "clair" && nom !== "personnalise") document.documentElement.classList.add(nom);
  if (nom === "personnalise") {
    const c = JSON.parse(localStorage.getItem("gf_theme_perso") || "null");
    if (c) {
      document.documentElement.style.setProperty("--bg", c.bg);
      document.documentElement.style.setProperty("--surface", c.surface);
      document.documentElement.style.setProperty("--text", c.text);
      document.documentElement.style.setProperty("--border", c.border);
    }
  } else {
    ["--bg","--surface","--text","--border"].forEach(v => document.documentElement.style.removeProperty(v));
  }
}
function themeActuel() {
  return localStorage.getItem("gf_theme") || "clair";
}
function choisirTheme(nom) {
  localStorage.setItem("gf_theme", nom);
  appliquerThemeNomme(nom);
}
function definirThemePerso(bgHex) {
  const r=parseInt(bgHex.slice(1,3),16), g=parseInt(bgHex.slice(3,5),16), b=parseInt(bgHex.slice(5,7),16);
  const clair = (r*299+g*587+b*114)/1000 > 150;
  const mix = v => Math.round(clair ? v*0.9 : v*1.15 + 10);
  const surface = "#"+[r,g,b].map(v=>Math.min(255,Math.max(0,mix(v))).toString(16).padStart(2,"0")).join("");
  const text = clair ? "#222222" : "#f2f2f2";
  const border = clair ? "#00000022" : "#ffffff22";
  localStorage.setItem("gf_theme_perso", JSON.stringify({bg:bgHex, surface, text, border}));
  choisirTheme("personnalise");
}
// Compat avec l'ancien système (mode sombre simple)
function themeEstSombre() { return themeActuel() === "sombre"; }
function basculerTheme(sombre) { choisirTheme(sombre ? "sombre" : "clair"); }
appliquerThemeNomme(themeActuel()); // appliqué au chargement de chaque page
