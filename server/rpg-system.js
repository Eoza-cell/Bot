export class RPGSystem {
  constructor() {
    this.powerLevels = ['G', 'F', 'E', 'D', 'C', 'B', 'A'];
    this.frictionLevels = {
      G: 'Aucune',
      F: 'Faible', 
      E: 'Modérée',
      D: 'Moyenne',
      C: 'Élevée',
      B: 'Très élevée',
      A: 'Extrême'
    };
  }

  generateHealthBar(current, max) {
    const percentage = Math.round((current / max) * 100);
    const filledBars = Math.floor(percentage / 20);
    const emptyBars = 5 - filledBars;
    
    return '🟥'.repeat(filledBars) + '⬜'.repeat(emptyBars);
  }

  generateEnergyBar(current, max) {
    const percentage = Math.round((current / max) * 100);
    const filledBars = Math.floor(percentage / 20);
    const emptyBars = 5 - filledBars;
    
    return '🟩'.repeat(filledBars) + '⬜'.repeat(emptyBars);
  }

  getHealthStatus(health, maxHealth) {
    const percentage = (health / maxHealth) * 100;
    
    if (percentage <= 0) return 'Inconscient 💀';
    if (percentage <= 25) return 'Gravement blessé 🩸';
    if (percentage <= 50) return 'Blessé 🤕';
    if (percentage <= 75) return 'Légèrement blessé 😬';
    return 'En parfaite santé 💪';
  }

  getEnergyStatus(energy, maxEnergy) {
    const percentage = (energy / maxEnergy) * 100;
    
    if (percentage <= 0) return 'Épuisé 😵';
    if (percentage <= 25) return 'Très fatigué 😰';
    if (percentage <= 50) return 'Fatigué 😓';
    if (percentage <= 75) return 'Un peu fatigué 😅';
    return 'Plein d\'énergie ⚡';
  }

  getExperienceNeeded(level) {
    return level * 100 + (level - 1) * 50;
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

  calculateActionConsequences(action, player) {
    let healthChange = 0;
    let energyChange = 0;
    let expGain = 0;
    let goldChange = 0;

    const actionLower = action.toLowerCase();

    // Energy consumption based on action type
    if (this.isPhysicalAction(actionLower)) {
      energyChange = -5; // Basic physical action
      expGain = 2;
    }

    if (this.isCombatAction(actionLower)) {
      energyChange = -10; // Combat actions are more tiring
      expGain = 5;
    }

    if (this.isHeavyAction(actionLower)) {
      energyChange = -15; // Heavy actions (sprint, heavy attack)
      expGain = 3;
    }

    if (this.isRestAction(actionLower)) {
      energyChange = 10; // Rest actions restore energy
      healthChange = 5;
    }

    // Risk assessment - dangerous actions can cause damage
    if (this.isDangerousAction(actionLower)) {
      const risk = Math.random();
      if (risk > 0.7) { // 30% chance of taking damage
        healthChange = -Math.floor(Math.random() * 20) - 5; // 5-25 damage
      }
    }

    // Exploration can yield rewards
    if (this.isExplorationAction(actionLower)) {
      const luck = Math.random();
      if (luck > 0.8) { // 20% chance of finding gold
        goldChange = Math.floor(Math.random() * 20) + 5; // 5-25 gold
        expGain += 3;
      }
    }

    return { healthChange, energyChange, expGain, goldChange };
  }

  isPhysicalAction(action) {
    const physicalKeywords = ['marche', 'cours', 'avance', 'recule', 'bouge', 'déplace'];
    return physicalKeywords.some(keyword => action.includes(keyword));
  }

  isCombatAction(action) {
    const combatKeywords = ['attaque', 'frappe', 'coup', 'épée', 'combat', 'tue', 'blesse', 'dague'];
    return combatKeywords.some(keyword => action.includes(keyword));
  }

  isHeavyAction(action) {
    const heavyKeywords = ['sprint', 'charge', 'saute', 'escalade', 'pousse', 'soulève'];
    return heavyKeywords.some(keyword => action.includes(keyword));
  }

  isRestAction(action) {
    const restKeywords = ['repos', 'assis', 'allonge', 'dors', 'médite', 'mange', 'bois'];
    return restKeywords.some(keyword => action.includes(keyword));
  }

  isDangerousAction(action) {
    const dangerKeywords = ['explore', 'fouille', 'ouvre', 'touche', 'grimpe', 'saute', 'traverse'];
    return dangerKeywords.some(keyword => action.includes(keyword));
  }

  isExplorationAction(action) {
    const exploreKeywords = ['explore', 'cherche', 'fouille', 'inspecte', 'examine', 'regarde'];
    return exploreKeywords.some(keyword => action.includes(keyword));
  }

  calculateCombatDamage(attackerLevel, defenderLevel, actionPrecision) {
    const baseDamage = 10 + (attackerLevel * 2);
    const levelDifference = attackerLevel - defenderLevel;
    const precisionBonus = actionPrecision ? 5 : -5; // Bonus if action is precise
    
    let damage = baseDamage + levelDifference + precisionBonus;
    damage += Math.floor(Math.random() * 10) - 5; // Random factor (-5 to +5)
    
    return Math.max(1, damage); // Minimum 1 damage
  }

  isActionPrecise(action) {
    // Check if action contains specific details (distance, angle, body part, etc.)
    const precisionKeywords = ['mètre', 'centimètre', 'angle', 'gauche', 'droite', 'poitrine', 'tête', 'bras', 'jambe'];
    const hasDistance = /\d+\s*(mètre|cm|pas)/i.test(action);
    const hasDirection = precisionKeywords.some(keyword => action.toLowerCase().includes(keyword));
    
    return hasDistance || hasDirection;
  }

  getFrictionLevel(location, playerLevel) {
    // Determine friction/difficulty based on location and player level
    const locationDifficulty = {
      'auberge': 'G',
      'village': 'F', 
      'forêt': 'E',
      'donjon': 'D',
      'château': 'C',
      'temple': 'B',
      'citadelle': 'A'
    };

    const baseDifficulty = locationDifficulty[location.toLowerCase()] || 'E';
    
    // Adjust based on player level (higher level players face more challenging scenarios)
    const playerPowerLevel = this.getPowerLevelForLevel(playerLevel);
    const playerIndex = this.powerLevels.indexOf(playerPowerLevel);
    const locationIndex = this.powerLevels.indexOf(baseDifficulty);
    
    // Ensure minimum challenge
    const adjustedIndex = Math.max(locationIndex, Math.floor(playerIndex / 2));
    
    return this.powerLevels[Math.min(adjustedIndex, this.powerLevels.length - 1)];
  }
}
