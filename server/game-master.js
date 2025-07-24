import { generateNarration, generateLocationDescription } from './gemini.js';

export class GameMaster {
  constructor() {
    this.activeScenarios = new Map();
    this.locationTemplates = {
      'AEGYRIA': {
        spawn: 'Auberge du Chevalier Doré',
        description: 'Une auberge noble aux bannières dorées, fréquentée par les chevaliers et paladins'
      },
      'SOMBRENUIT': {
        spawn: 'Taverne de l\'Ombre Silencieuse',
        description: 'Une taverne sombre aux coins reculés, où les murmures remplacent les rires'
      },
      'KHELOS': {
        spawn: 'Caravanserail du Serpent de Sable',
        description: 'Un refuge pour marchands du désert, aux tapis colorés et aux parfums d\'épices'
      },
      'VARHA': {
        spawn: 'Lodge du Loup des Neiges',
        description: 'Une auberge de montagne rustique avec un grand feu et des peaux d\'ours'
      },
      'SYLVARIA': {
        spawn: 'Clairière des Anciens',
        description: 'Un refuge naturel protégé par la magie des druides et des esprits de la forêt'
      },
      'ECLYPSIA': {
        spawn: 'Tour Crépusculaire',
        description: 'Une tour mystique où la lumière et l\'ombre dansent dans un équilibre précaire'
      }
    };

    this.questTemplates = [
      {
        type: 'combat',
        difficulty: 'E',
        description: 'Un groupe de bandits menace les voyageurs sur la route principale'
      },
      {
        type: 'exploration',
        difficulty: 'D',
        description: 'Des ruines anciennes ont été découvertes, cachant peut-être des trésors'
      },
      {
        type: 'intrigue',
        difficulty: 'C',
        description: 'Un noble a disparu mystérieusement, et des rumeurs de complot circulent'
      },
      {
        type: 'mystique',
        difficulty: 'B',
        description: 'Des phénomènes étranges perturbent l\'équilibre magique de la région'
      }
    ];
  }

  async generateSpawnScenario(player) {
    const kingdom = player.kingdom;
    const locationInfo = this.locationTemplates[kingdom];
    
    const context = `Tu es le maître du jeu Friction Ultimate. Le personnage ${player.character_name} (niveau ${player.level}, royaume ${kingdom}, ordre ${player.order_name}) commence son aventure dans ${locationInfo.spawn}. 

${locationInfo.description}

Crée un scénario de départ immersif qui:
- Présente l'atmosphère du lieu
- Introduit 2-3 PNJ intéressants avec leurs motivations
- Propose une quête ou situation initiale adaptée au niveau du joueur
- Respecte le lore de Friction Ultimate (dangereux, précis, conséquences réelles)
- Suggère des actions possibles mais laisse le choix au joueur

Limite ta réponse à 150 mots maximum.`;

    try {
      const scenario = await generateNarration(context);
      this.activeScenarios.set(player.phone_number, {
        type: 'spawn',
        location: locationInfo.spawn,
        scenario: scenario,
        timestamp: Date.now()
      });
      return scenario;
    } catch (error) {
      console.error('Error generating spawn scenario:', error);
      return `${player.character_name} se réveille dans ${locationInfo.spawn}. ${locationInfo.description}. L'aventure commence maintenant...`;
    }
  }

  async processPlayerAction(player, action) {
    const activeScenario = this.activeScenarios.get(player.phone_number);
    
    const context = `FRICTION ULTIMATE - Maître du Jeu

JOUEUR: ${player.character_name}
- Niveau: ${player.level} (Puissance ${player.power_level})
- Vie: ${player.health}/${player.max_health} PV
- Énergie: ${player.energy}/${player.max_energy} PE
- Localisation: ${player.location}
- Royaume: ${player.kingdom}
- Ordre: ${player.order_name}

ACTION DU JOUEUR: "${action}"

CONTEXTE ACTUEL: ${activeScenario ? activeScenario.scenario : 'Exploration libre'}

RÈGLES IMPORTANTES:
1. Tu ne joues JAMAIS le personnage du joueur
2. Tu décris uniquement l'environnement, les PNJ, et les conséquences
3. Applique les règles de combat strictement si nécessaire
4. Le monde est dangereux - chaque action a des risques
5. Sois précis sur les dégâts et les effets
6. Propose des choix mais ne force pas de décision
7. Respecte le système de friction (difficulté adaptée au niveau)

Réponds en 100 mots maximum. Décris ce qui se passe suite à l'action du joueur.`;

    try {
      const response = await generateNarration(context);
      
      // Update scenario if needed
      if (activeScenario) {
        activeScenario.scenario = response;
        activeScenario.timestamp = Date.now();
      }
      
      return response;
    } catch (error) {
      console.error('Error processing player action:', error);
      return "L'action résonne dans le silence... Le narrateur semble perturbé par des forces mystiques. Réessayez votre action.";
    }
  }

  async generateCombatScenario(player, enemyType = 'bandit') {
    const enemyTemplates = {
      bandit: {
        name: 'Bandit des routes',
        level: Math.max(1, player.level - 1),
        powerLevel: this.getPowerLevelForLevel(Math.max(1, player.level - 1)),
        health: 80,
        description: 'Un brigand expérimenté armé d\'une épée rouillée'
      },
      guard: {
        name: 'Garde du royaume',
        level: player.level,
        powerLevel: player.power_level,
        health: 100,
        description: 'Un soldat entraîné en armure de cuir clouté'
      },
      monster: {
        name: 'Créature des ombres',
        level: player.level + 1,
        powerLevel: this.getPowerLevelForLevel(player.level + 1),
        health: 120,
        description: 'Une entité mystérieuse aux yeux luisants'
      }
    };

    const enemy = enemyTemplates[enemyType] || enemyTemplates.bandit;
    
    const combatContext = `COMBAT FRICTION ULTIMATE

${player.character_name} fait face à: ${enemy.name}
- Niveau: ${enemy.level} (Puissance ${enemy.powerLevel})
- Points de Vie: ${enemy.health} PV
- Description: ${enemy.description}

Le combat commence ! ${enemy.name} adopte une position défensive et observe ${player.character_name}.

L'atmosphère est tendue. Chaque mouvement peut être décisif dans ce monde impitoyable.

Décrivez votre première action de combat avec précision (mouvement, arme, angle, distance).`;

    this.activeScenarios.set(player.phone_number, {
      type: 'combat',
      enemy: enemy,
      scenario: combatContext,
      timestamp: Date.now()
    });

    return combatContext;
  }

  getPowerLevelForLevel(level) {
    if (level <= 2) return 'G';
    if (level <= 5) return 'F';
    if (level <= 10) return 'E';
    if (level <= 15) return 'D';
    if (level <= 20) return 'C';
    if (level <= 25) return 'B';
    return 'A';
  }

  getActiveScenario(phoneNumber) {
    return this.activeScenarios.get(phoneNumber);
  }

  clearOldScenarios() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const [phoneNumber, scenario] of this.activeScenarios.entries()) {
      if (scenario.timestamp < oneHourAgo) {
        this.activeScenarios.delete(phoneNumber);
      }
    }
  }

  async generateQuestHook(player) {
    const availableQuests = this.questTemplates.filter(quest => {
      const questDifficultyIndex = ['G', 'F', 'E', 'D', 'C', 'B', 'A'].indexOf(quest.difficulty);
      const playerDifficultyIndex = ['G', 'F', 'E', 'D', 'C', 'B', 'A'].indexOf(player.power_level);
      return questDifficultyIndex <= playerDifficultyIndex + 2; // Allow quests up to 2 levels above player
    });

    if (availableQuests.length === 0) return null;

    const selectedQuest = availableQuests[Math.floor(Math.random() * availableQuests.length)];
    
    const questContext = `Génère une quête courte pour ${player.character_name} basée sur: ${selectedQuest.description}. 
    Adapte-la au royaume ${player.kingdom} et à l'ordre ${player.order_name}. 
    Difficulté: ${selectedQuest.difficulty}. 
    Sois concis (50 mots max) et précis sur l'objectif.`;

    try {
      const questDescription = await generateNarration(questContext);
      return {
        ...selectedQuest,
        description: questDescription,
        reward: this.calculateQuestReward(selectedQuest.difficulty, player.level)
      };
    } catch (error) {
      console.error('Error generating quest hook:', error);
      return null;
    }
  }

  calculateQuestReward(difficulty, playerLevel) {
    const baseReward = {
      experience: 20,
      gold: 50
    };

    const difficultyMultiplier = {
      'G': 0.5, 'F': 0.7, 'E': 1.0, 'D': 1.3, 'C': 1.6, 'B': 2.0, 'A': 2.5
    };

    const multiplier = difficultyMultiplier[difficulty] || 1.0;
    const levelBonus = playerLevel * 0.1;

    return {
      experience: Math.floor(baseReward.experience * multiplier * (1 + levelBonus)),
      gold: Math.floor(baseReward.gold * multiplier * (1 + levelBonus))
    };
  }
}