export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { metier, realisation, profil } = req.body;
  if (!metier || !realisation) return res.status(400).json({ error: 'Paramètres manquants' });
  
  const profilInfo = profil ? `\nInformations sur l'artisan :\n- Ville : ${profil.ville || 'non précisée'}\n- Téléphone : ${profil.telephone || 'non précisé'}\n- Délai pour recevoir un devis : ${profil.delai || 'non précisé'}` : '';
  
  const prompt = `Tu es un expert en marketing pour les artisans français. Génère un post Instagram professionnel et engageant pour un(e) ${metier}.\nCe que l'artisan a réalisé : "${realisation}"\n${profilInfo}\nRègles :\n- Commence par une accroche avec émoji percutante\n- Décris la réalisation de façon concrète (2-3 lignes)\n- Ajoute une phrase sur la qualité/passion du métier\n- Termine par un appel à l'action avec le délai de devis (ex: "Devis gratuit sous 48h")\n- Ton chaleureux, authentique\n- Entre 80 et 120 mots\n- NE génère PAS les hashtags\n- Réponds UNIQUEMENT avec le texte du post`;
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    res.status(200).json({ post: data.content[0].text.trim() });
  } catch (error) {
    res.status(500).json({ error: 'Erreur génération' });
  }
}
