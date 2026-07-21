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
    const { image, mediaType, categories, moyens } = await req.json();
    if (!image) throw new Error("Aucune image recue.");

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY manquante cote serveur.");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELE}:generateContent?key=${apiKey}`;

    const listeCat = Array.isArray(categories) && categories.length ? categories.join(", ") : "aucune";
    const listeMoy = Array.isArray(moyens) && moyens.length ? moyens.join(", ") : "aucun";

    const prompt =
      "Voici la photo d'un ticket de caisse. Reponds UNIQUEMENT avec un objet JSON valide, " +
      "sans aucun texte autour, sans backticks, avec exactement ces cles :\n" +
      "- montant (nombre, le total final paye en euros, ou null si illisible)\n" +
      "- commercant (texte court, nom du magasin, ou null si illisible)\n" +
      "- date (format JJ/MM/AAAA, ou null si illisible)\n" +
      "- categorie : choisis EXACTEMENT une valeur parmi cette liste, celle qui correspond le mieux au type d'achat, ou null si aucune ne convient : [" + listeCat + "]\n" +
      "- moyenPaiement : choisis EXACTEMENT une valeur parmi cette liste si le ticket l'indique clairement (ex. \"ESPECES\", \"CB\"), ou null sinon : [" + listeMoy + "]\n" +
      "Ne reponds rien d'autre que ce JSON.";

    const resp = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mediaType || "image/jpeg", data: image } },
            { text: prompt }
          ]
        }],
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0
        }
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
