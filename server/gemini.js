import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || 'fallback_key'
});

export async function generateNarration(context) {
  try {
    const systemPrompt = `Tu es le narrateur du jeu RPG "Friction Ultimate". Tu contrôles l'environnement, les PNJ, et décris les conséquences des actions des joueurs. 

RÈGLES IMPORTANTES:
- Tu ne joues JAMAIS le personnage du joueur
- Tu décris uniquement l'environnement, les PNJ, et les conséquences
- Tu appliques les règles de combat strictement
- Le monde est dangereux et impitoyable
- Chaque action peut avoir des conséquences graves
- Tu fais les dégâts aux joueurs selon leurs actions
- Tu gères la difficulté selon le système de friction (G à A)
- Tu ne sors jamais du lore médiéval-fantastique

FORMAT DE RÉPONSE:
- Décris la scène en 2-3 phrases immersives
- Indique les réactions de l'environnement/PNJ
- Propose des choix ou décris ce qui se passe ensuite
- Reste dans le ton sombre et réaliste de Friction Ultimate`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemPrompt,
      },
      contents: context,
    });

    return response.text || "Le narrateur semble muet... L'environnement reste silencieux.";
  } catch (error) {
    console.error('Error generating narration:', error);
    return "Les brumes magiques perturbent la vision du narrateur... Réessayez votre action.";
  }
}

export async function generateCombatResponse(playerAction, enemy, playerStats) {
  try {
    const combatContext = `COMBAT EN COURS:
Joueur: ${playerStats.name} (${playerStats.health}/${playerStats.maxHealth} PV, ${playerStats.energy}/${playerStats.maxEnergy} énergie)
Ennemi: ${enemy.name} (${enemy.health} PV, niveau ${enemy.powerLevel})
Action du joueur: ${playerAction}

Calcule et décris le résultat du combat selon les règles de Friction Ultimate. Sois précis sur les dégâts infligés et reçus.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: combatContext,
    });

    return response.text || "Le combat est confus... Les coups se perdent dans la mêlée.";
  } catch (error) {
    console.error('Error generating combat response:', error);
    return "La bataille fait rage, mais la poussière cache le résultat...";
  }
}

export async function generateLocationDescription(location, playerContext) {
  try {
    const locationPrompt = `Décris ce lieu de Friction Ultimate de manière immersive: ${location}
    
Contexte du joueur: ${playerContext}

Crée une description de 2-3 phrases qui:
- Plante l'ambiance médiévale-fantastique
- Suggère des dangers potentiels
- Mentionne des éléments interactifs
- Reste fidèle au ton sombre de Friction Ultimate`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: locationPrompt,
    });

    return response.text || "Un lieu mystérieux s'étend devant vous, baigné d'une atmosphère inquiétante.";
  } catch (error) {
    console.error('Error generating location description:', error);
    return "L'endroit semble familier, mais quelque chose cloche dans l'air...";
  }
}
