export class CharacterSystem {
  constructor() {
    this.kingdoms = {
      'AEGYRIA': {
        name: 'Aegyria',
        description: 'Royaume de la chevalerie et de l\'honneur',
        specialties: ['Armures lourdes', 'Épées à deux mains', 'Prières de protection'],
        startingGold: 120
      },
      'SOMBRENUIT': {
        name: 'Sombrenuit', 
        description: 'Forêts mystérieuses et pactes occultes',
        specialties: ['Poisons', 'Dagues courbes', 'Magie de l\'ombre'],
        startingGold: 80
      },
      'KHELOS': {
        name: 'Khelos',
        description: 'Nomades marchands du désert',
        specialties: ['Sabres courbes', 'Arcs rapides', 'Commerce'],
        startingGold: 150
      },
      'VARHA': {
        name: 'Varha',
        description: 'Guerriers des montagnes enneigées',
        specialties: ['Haches lourdes', 'Boucliers renforcés', 'Résistance au froid'],
        startingGold: 100
      },
      'SYLVARIA': {
        name: 'Sylvaria',
        description: 'Druides et archers des forêts magiques',
        specialties: ['Arcs longs', 'Flèches enchantées', 'Potions naturelles'],
        startingGold: 90
      },
      'ECLYPSIA': {
        name: 'Eclypsia',
        description: 'Mages manipulant lumière et obscurité',
        specialties: ['Magie de l\'ombre', 'Orbes ténébreuses', 'Portails'],
        startingGold: 110
      }
    };

    this.orders = {
      'Neutre': {
        name: 'Neutre',
        description: 'Aucune affiliation particulière',
        benefits: []
      },
      'Ordre du Seigneur Démoniaque': {
        name: 'Ordre du Seigneur Démoniaque',
        description: 'Secte occulte exploitant la magie noire',
        benefits: ['Invocation démoniaque', 'Corruption des corps']
      },
      'La Forge du Progrès': {
        name: 'La Forge du Progrès',
        description: 'Ingénieurs mêlant technologie et alchimie',
        benefits: ['Exosquelettes', 'Pièges mécaniques', 'Explosifs']
      },
      'La Lame Pourpre': {
        name: 'La Lame Pourpre',
        description: 'Assassins experts en meurtre silencieux',
        benefits: ['Dagues empoisonnées', 'Techniques de disparition']
      },
      'Le Reliquaire': {
        name: 'Le Reliquaire',
        description: 'Ordre mystique protégeant les artefacts',
        benefits: ['Parchemins anciens', 'Boucliers magiques']
      },
      'Les Lames du Jugement': {
        name: 'Les Lames du Jugement',
        description: 'Ordre chevaleresque de justice divine',
        benefits: ['Lames sacrées', 'Armures lourdes']
      }
    };

    this.equipment = {
      weapons: {
        'sword': { name: 'Épée longue', damage: 15, type: 'Mêlée' },
        'bow': { name: 'Arc en bois', damage: 12, type: 'Distance' },
        'staff': { name: 'Bâton de mage', damage: 8, type: 'Magique' },
        'dagger': { name: 'Dague empoisonnée', damage: 10, type: 'Mêlée rapide' },
        'axe': { name: 'Hache de guerre', damage: 18, type: 'Mêlée lourde' },
        'crossbow': { name: 'Arbalète', damage: 16, type: 'Distance' }
      },
      armor: {
        'leather': { name: 'Armure de cuir', defense: 5, weight: 'Léger' },
        'chainmail': { name: 'Cotte de mailles', defense: 10, weight: 'Moyen' },
        'plate': { name: 'Armure de plaques', defense: 18, weight: 'Lourd' },
        'robe': { name: 'Robe de mage', defense: 3, weight: 'Très léger' }
      }
    };

    this.appearances = {
      male: {
        warrior: 'Guerrier musclé aux cicatrices de bataille',
        mage: 'Homme sage aux yeux perçants',
        rogue: 'Silhouette agile et discrète', 
        noble: 'Allure aristocratique et raffinée',
        barbarian: 'Colosse sauvage aux tatouages tribaux'
      },
      female: {
        warrior: 'Guerrière athlétique à l\'armure usée',
        mage: 'Femme mystérieuse aux gestes gracieux',
        rogue: 'Assassin élégante aux mouvements fluides',
        noble: 'Dame de haute naissance au port altier',
        barbarian: 'Amazone féroce aux cheveux tressés'
      }
    };
  }

  getKingdomInfo(kingdomCode) {
    return this.kingdoms[kingdomCode] || this.kingdoms['AEGYRIA'];
  }

  getOrderInfo(orderName) {
    return this.orders[orderName] || this.orders['Neutre'];
  }

  getWeaponInfo(weaponCode) {
    return this.equipment.weapons[weaponCode] || this.equipment.weapons['sword'];
  }

  getArmorInfo(armorCode) {
    return this.equipment.armor[armorCode] || this.equipment.armor['leather'];
  }

  generateCharacterDescription(characterData) {
    const gender = characterData.gender || 'male';
    const style = characterData.appearance || 'warrior';
    const equipment = characterData.equipment || {};

    let description = this.appearances[gender][style] || 'Apparence mystérieuse';

    if (equipment.weapon) {
      const weapon = this.getWeaponInfo(equipment.weapon);
      description += ` armé d'${weapon.name.toLowerCase()}`;
    }

    if (equipment.armor) {
      const armor = this.getArmorInfo(equipment.armor);
      description += ` vêtu d'${armor.name.toLowerCase()}`;
    }

    return description;
  }

  calculateCharacterStats(level, kingdom, order) {
    const baseHealth = 100;
    const baseEnergy = 100;
    
    // Kingdom bonuses
    const kingdomBonuses = {
      'AEGYRIA': { health: 10, energy: 5 },
      'SOMBRENUIT': { health: 0, energy: 15 },
      'KHELOS': { health: 5, energy: 10 },
      'VARHA': { health: 15, energy: 0 },
      'SYLVARIA': { health: 5, energy: 10 },
      'ECLYPSIA': { health: 0, energy: 20 }
    };

    const bonus = kingdomBonuses[kingdom] || { health: 0, energy: 0 };
    
    return {
      maxHealth: baseHealth + bonus.health + (level * 10),
      maxEnergy: baseEnergy + bonus.energy + (level * 5),
      damage: 5 + level * 2,
      defense: level
    };
  }

  validateCharacterCustomization(type, value) {
    switch (type) {
      case 'gender':
        return ['male', 'female'].includes(value.toLowerCase());
      
      case 'style':
        return ['warrior', 'mage', 'rogue', 'noble', 'barbarian'].includes(value.toLowerCase());
      
      case 'weapon':
        return Object.keys(this.equipment.weapons).includes(value.toLowerCase());
      
      case 'armor':
        return Object.keys(this.equipment.armor).includes(value.toLowerCase());
      
      case 'kingdom':
        return Object.keys(this.kingdoms).includes(value.toUpperCase());
      
      case 'order':
        return Object.keys(this.orders).includes(value);
      
      default:
        return false;
    }
  }

  getStartingEquipment(kingdom, style) {
    const kingdomEquipment = {
      'AEGYRIA': { weapon: 'sword', armor: 'chainmail' },
      'SOMBRENUIT': { weapon: 'dagger', armor: 'leather' },
      'KHELOS': { weapon: 'bow', armor: 'leather' },
      'VARHA': { weapon: 'axe', armor: 'plate' },
      'SYLVARIA': { weapon: 'bow', armor: 'leather' },
      'ECLYPSIA': { weapon: 'staff', armor: 'robe' }
    };

    const styleEquipment = {
      'warrior': { weapon: 'sword', armor: 'chainmail' },
      'mage': { weapon: 'staff', armor: 'robe' },
      'rogue': { weapon: 'dagger', armor: 'leather' },
      'noble': { weapon: 'sword', armor: 'chainmail' },
      'barbarian': { weapon: 'axe', armor: 'leather' }
    };

    // Combine kingdom and style preferences
    const kingdomEquip = kingdomEquipment[kingdom] || kingdomEquipment['AEGYRIA'];
    const styleEquip = styleEquipment[style] || styleEquipment['warrior'];

    return {
      weapon: styleEquip.weapon,
      armor: kingdomEquip.armor
    };
  }
}
