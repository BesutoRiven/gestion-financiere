// Fonction Supabase Edge : analyse une photo de ticket de caisse et en extrait
// montant / commercant / date, via l'API Google Gemini (gratuite pour un usage
// personnel a faible volume - jusqu'a environ 1500 requetes/jour, sans carte bancaire).
// La cle API reste cote serveur : jamais exposee au navigateur.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODELE = "gemini-3.5-flash";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { image, mediaType } = await req.json();
    if (!image) throw new Error("Aucune image recue.");

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY manquante cote serveur.");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELE}:generateContent?key=${apiKey}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mediaType || "image/jpeg", data: image } },
            {
              text: "Voici la photo d'un ticket de caisse. Reponds UNIQUEMENT avec un objet JSON valide, " +
                    "sans aucun texte autour, avec exactement ces cles : " +
                    "montant (nombre, le total final paye en euros, ou null si illisible), " +
                    "commercant (texte court, nom du magasin, ou null si illisible), " +
                    "date (format JJ/MM/AAAA, ou null si illisible)."
            }
          ]
        }]
      })
    });

    if (!resp.ok) {
      const errTxt = await resp.text();
      throw new Error("Erreur API Gemini: " + errTxt);
    }

    const data = await resp.json();
    const texte = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const nettoye = texte.replace(/```json|```/g, "").trim();
    const json = JSON.parse(nettoye);

    return new Response(JSON.stringify(json), {
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
