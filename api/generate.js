export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { metier, realisation, profil } = req.body;

  if (!metier || !realisation) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }

  const profilInfo = profil ? `
Informations sur l'artisan :
- Ville : ${profil.ville || 'non précisée'}
- Téléphone : ${profil.telephone || 'non précisé'}
- Délai devis : ${profil.delai || 'non précisé'}` : '';

  const prompt = `Tu es un expert en marketing pour les artisans français. Génère un post Instagram professionnel et engageant pour un(e) ${metier}.
Ce que l'artisan a réalisé : "${realisation}"
${profilInfo}
Règles :
- Commence par une accroche avec émoji percutante (1 ligne)
- Décris la réalisation de façon concrète et valorisante (2-3 lignes)
- Ajoute une phrase sur la qualité/passion du métier
- Termine par un appel à l'action personnalisé avec les infos de l'artisan si disponibles
- Ton chaleureux, authentique
- Entre 80 et 120 mots
- Utilise des émojis pertinents
- NE génère PAS les hashtags
- Réponds UNIQUEMENT avec le texte du post`;

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
