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
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Petit garde-fou : renvoie vers la page de connexion si non connecté.
async function exigerConnexion() {
  const { data } = await sb.auth.getSession();
  if (!data.session) {
    window.location.href = "index.html";
    return null;
  }
  return data.session;
}
