import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg;
import QRCode from 'qrcode';
import { storage } from './storage.js';
import { generateNarration, generateCombatResponse } from './gemini.js';
import { RPGSystem } from './rpg-system.js';
import { CharacterSystem } from './character-system.js';
import { ImageManager } from './image-manager.js';
import { GameMaster } from './game-master.js';

export class WhatsAppBot {
  constructor() {
    this.client = null;
    this.qrCode = null;
    this.ready = false;
    this.rpgSystem = new RPGSystem();
    this.characterSystem = new CharacterSystem();
    this.imageManager = new ImageManager();
    this.gameMaster = new GameMaster();
  }

  async initialize() {
    const puppeteerOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-extensions',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection'
      ]
    };

    // Try to find chromium executable
    try {
      const fs = await import('fs');
      const chromiumPath = '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium';
      if (fs.existsSync(chromiumPath)) {
        puppeteerOptions.executablePath = chromiumPath;
      }
    } catch (error) {
      console.log('Using default chromium path');
    }

    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: './whatsapp_auth'
      }),
      puppeteer: puppeteerOptions
    });

    this.setupEventHandlers();
    await this.client.initialize();
  }

  setupEventHandlers() {
    this.client.on('qr', async (qr) => {
      console.log('QR Code received');
      try {
        this.qrCode = await QRCode.toDataURL(qr);
        console.log('QR Code generated successfully');
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    });

    this.client.on('ready', () => {
      console.log('WhatsApp bot is ready!');
      this.ready = true;
    });

    this.client.on('authenticated', () => {
      console.log('WhatsApp bot authenticated');
    });

    this.client.on('message', async (message) => {
      await this.handleMessage(message);
    });

    this.client.on('disconnected', (reason) => {
      console.log('WhatsApp bot disconnected:', reason);
      this.ready = false;
    });
  }

  async handleMessage(message) {
    try {
      const contact = await message.getContact();
      const phoneNumber = contact.number;
      const text = message.body.trim();
      const chat = await message.getChat();
      const isGroup = chat.isGroup;

      // Ignore messages from bot itself
      if (contact.isMe) return;

      console.log(`Message from ${phoneNumber}: ${text}`);

      // Get or create player
      let player = await storage.getPlayerByPhone(phoneNumber);
      
      // Handle commands
      if (text.startsWith('/')) {
        await this.handleCommand(message, text, player, phoneNumber);
        return;
      }

      // If player doesn't exist and not a command, prompt registration
      if (!player) {
        const welcomeText = `🌟 *FRICTION : ULTIMATE* 🌟\n\n` +
          `Bienvenue dans le monde de Friction Ultimate !\n\n` +
          `Pour commencer votre aventure, utilisez la commande :\n` +
          `*/register [nom_du_personnage]*\n\n` +
          `Exemple: /register Aragorn\n\n` +
          `📜 Autres commandes disponibles :\n` +
          `• /menu - Afficher le menu principal\n` +
          `• /help - Aide et règles du jeu`;
        
        await message.reply(welcomeText);
        return;
      }

      // Handle RPG gameplay
      await this.handleRPGAction(message, text, player);

    } catch (error) {
      console.error('Error handling message:', error);
      await message.reply('❌ Une erreur est survenue. Veuillez réessayer.');
    }
  }

  async handleCommand(message, text, player, phoneNumber) {
    const [command, ...args] = text.slice(1).split(' ');
    
    switch (command.toLowerCase()) {
      case 'register':
        await this.handleRegister(message, args, phoneNumber);
        break;
      
      case 'menu':
        await this.handleMenu(message, player);
        break;
      
      case 'fiche':
      case 'character':
        await this.handleCharacterSheet(message, player);
        break;
      
      case 'create':
      case 'creation':
        await this.handleCharacterCreation(message, player);
        break;
      
      case 'customize':
        await this.handleCharacterCustomization(message, player, args);
        break;
      
      case 'inventory':
      case 'inv':
        await this.handleInventory(message, player);
        break;
      
      case 'help':
        await this.handleHelp(message);
        break;
      
      case 'stats':
        await this.handleStats(message, player);
        break;
      
      case 'spawn':
        await this.handleSpawn(message, player, args);
        break;
      
      default:
        await message.reply('❌ Commande inconnue. Utilisez /help pour voir les commandes disponibles.');
    }
  }

  async handleRegister(message, args, phoneNumber) {
    if (args.length === 0) {
      await message.reply('❌ Veuillez spécifier un nom de personnage.\nExemple: /register Aragorn');
      return;
    }

    const characterName = args.join(' ').trim();
    
    if (characterName.length < 2 || characterName.length > 20) {
      await message.reply('❌ Le nom du personnage doit contenir entre 2 et 20 caractères.');
      return;
    }

    try {
      // Check if player already exists
      const existingPlayer = await storage.getPlayerByPhone(phoneNumber);
      if (existingPlayer) {
        await message.reply(`🎭 Vous avez déjà un personnage : **${existingPlayer.character_name}**\nUtilisez /fiche pour voir vos informations.`);
        return;
      }

      // Create new player
      const player = await storage.createPlayer({
        phone_number: phoneNumber,
        character_name: characterName,
        level: 1,
        health: 100,
        energy: 100,
        max_health: 100,
        max_energy: 100,
        power_level: 'G',
        kingdom: 'AEGYRIA',
        order_name: 'Neutre',
        gold: 100,
        experience: 0,
        location: 'Auberge de départ',
        character_data: JSON.stringify({
          gender: 'male',
          appearance: 'default',
          equipment: {}
        })
      });

      const successText = `✅ **Personnage créé avec succès !**\n\n` +
        `🎭 **Nom :** ${characterName}\n` +
        `👑 **Royaume :** Aegyria\n` +
        `⚖️ **Ordre :** Neutre\n` +
        `💰 **Or :** 100 pièces\n` +
        `📍 **Lieu :** Auberge de départ\n\n` +
        `🎮 **Prochaines étapes :**\n` +
        `• /create - Personnaliser votre apparence\n` +
        `• /menu - Accéder au menu principal\n` +
        `• /spawn - Commencer votre aventure`;

      await message.reply(successText);

      // Send character creation menu
      setTimeout(async () => {
        await this.handleCharacterCreation(message, player);
      }, 2000);

    } catch (error) {
      console.error('Error creating player:', error);
      await message.reply('❌ Erreur lors de la création du personnage. Veuillez réessayer.');
    }
  }

  async handleMenu(message, player) {
    if (!player) {
      await message.reply('❌ Vous devez d\'abord vous enregistrer avec /register [nom]');
      return;
    }

    try {
      // Get fantasy menu image
      const menuImage = await this.imageManager.getFantasyMenuImage();
      
      const menuText = `🌟 **FRICTION : ULTIMATE** 🌟\n\n` +
        `🎭 **${player.character_name}** - Niveau ${player.level}\n` +
        `👑 **Royaume :** ${player.kingdom}\n` +
        `⚖️ **Ordre :** ${player.order_name}\n` +
        `❤️ **Vie :** ${player.health}/${player.max_health}\n` +
        `⚡ **Énergie :** ${player.energy}/${player.max_energy}\n` +
        `💰 **Or :** ${player.gold}\n\n` +
        `📜 **Menu Principal :**\n` +
        `• /fiche - Fiche personnage\n` +
        `• /create - Personnalisation\n` +
        `• /inventory - Inventaire\n` +
        `• /spawn - Commencer/continuer l'aventure\n` +
        `• /stats - Statistiques détaillées\n` +
        `• /help - Aide et règles`;

      if (menuImage) {
        await message.reply(menuImage, undefined, { caption: menuText });
      } else {
        await message.reply(menuText);
      }
    } catch (error) {
      console.error('Error showing menu:', error);
      await message.reply('❌ Erreur lors de l\'affichage du menu.');
    }
  }

  async handleCharacterSheet(message, player) {
    if (!player) {
      await message.reply('❌ Vous devez d\'abord vous enregistrer avec /register [nom]');
      return;
    }

    try {
      const characterData = JSON.parse(player.character_data || '{}');
      
      const healthBar = this.rpgSystem.generateHealthBar(player.health, player.max_health);
      const energyBar = this.rpgSystem.generateEnergyBar(player.energy, player.max_energy);
      
      const sheetText = `📋 **FICHE PERSONNAGE** 📋\n\n` +
        `🎭 **Nom :** ${player.character_name}\n` +
        `📱 **Identifiant :** ${player.phone_number}\n` +
        `🌟 **Niveau :** ${player.level}\n` +
        `⚡ **Niveau de puissance :** ${player.power_level}\n\n` +
        `❤️ **Vie :** ${healthBar} (${player.health}/${player.max_health})\n` +
        `⚡ **Énergie :** ${energyBar} (${player.energy}/${player.max_energy})\n\n` +
        `👑 **Royaume d'origine :** ${player.kingdom}\n` +
        `⚖️ **Ordre :** ${player.order_name}\n` +
        `📍 **Localisation :** ${player.location}\n` +
        `💰 **Or :** ${player.gold} pièces\n` +
        `🎯 **Expérience :** ${player.experience} XP\n\n` +
        `👤 **Apparence :**\n` +
        `• Genre : ${characterData.gender === 'female' ? 'Féminin' : 'Masculin'}\n` +
        `• Style : ${characterData.appearance || 'Défaut'}\n\n` +
        `⚔️ **Statut :** ${player.health > 50 ? 'En bonne santé' : player.health > 0 ? 'Blessé' : 'Inconscient'}`;

      // Try to get character image
      const characterImage = await this.imageManager.getCharacterImage(player);
      
      if (characterImage) {
        await message.reply(characterImage, undefined, { caption: sheetText });
      } else {
        await message.reply(sheetText);
      }
    } catch (error) {
      console.error('Error showing character sheet:', error);
      await message.reply('❌ Erreur lors de l\'affichage de la fiche personnage.');
    }
  }

  async handleCharacterCreation(message, player) {
    if (!player) {
      await message.reply('❌ Vous devez d\'abord vous enregistrer avec /register [nom]');
      return;
    }

    try {
      const creationText = `🎨 **CRÉATION DE PERSONNAGE** 🎨\n\n` +
        `👤 **Personnalisez votre apparence :**\n\n` +
        `🚹 **Genre :**\n` +
        `• /customize gender male - Masculin\n` +
        `• /customize gender female - Féminin\n\n` +
        `🎭 **Style d'apparence :**\n` +
        `• /customize style warrior - Guerrier\n` +
        `• /customize style mage - Mage\n` +
        `• /customize style rogue - Voleur\n` +
        `• /customize style noble - Noble\n` +
        `• /customize style barbarian - Barbare\n\n` +
        `⚔️ **Équipement de départ :**\n` +
        `• /customize weapon sword - Épée\n` +
        `• /customize weapon bow - Arc\n` +
        `• /customize weapon staff - Bâton\n` +
        `• /customize weapon dagger - Dague\n\n` +
        `👑 **Royaume d'origine :**\n` +
        `• /customize kingdom AEGYRIA - Chevalerie\n` +
        `• /customize kingdom SOMBRENUIT - Ombres\n` +
        `• /customize kingdom KHELOS - Désert\n` +
        `• /customize kingdom VARHA - Montagnes\n\n` +
        `✅ Une fois terminé, utilisez /spawn pour commencer !`;

      // Get character creation image
      const creationImage = await this.imageManager.getCharacterCreationImage();
      
      if (creationImage) {
        await message.reply(creationImage, undefined, { caption: creationText });
      } else {
        await message.reply(creationText);
      }
    } catch (error) {
      console.error('Error showing character creation:', error);
      await message.reply('❌ Erreur lors de l\'affichage de la création de personnage.');
    }
  }

  async handleCharacterCustomization(message, player, args) {
    if (!player) {
      await message.reply('❌ Vous devez d\'abord vous enregistrer avec /register [nom]');
      return;
    }

    if (args.length < 2) {
      await message.reply('❌ Usage: /customize [type] [valeur]\nExemple: /customize gender male');
      return;
    }

    const [type, value] = args;
    
    try {
      let characterData = JSON.parse(player.character_data || '{}');
      let updateData = {};
      let successMessage = '';

      switch (type.toLowerCase()) {
        case 'gender':
          if (!['male', 'female'].includes(value.toLowerCase())) {
            await message.reply('❌ Genre invalide. Utilisez "male" ou "female".');
            return;
          }
          characterData.gender = value.toLowerCase();
          successMessage = `✅ Genre modifié : ${value.toLowerCase() === 'female' ? 'Féminin' : 'Masculin'}`;
          break;

        case 'style':
          const validStyles = ['warrior', 'mage', 'rogue', 'noble', 'barbarian'];
          if (!validStyles.includes(value.toLowerCase())) {
            await message.reply(`❌ Style invalide. Styles disponibles: ${validStyles.join(', ')}`);
            return;
          }
          characterData.appearance = value.toLowerCase();
          successMessage = `✅ Style modifié : ${value.charAt(0).toUpperCase() + value.slice(1)}`;
          break;

        case 'weapon':
          const validWeapons = ['sword', 'bow', 'staff', 'dagger'];
          if (!validWeapons.includes(value.toLowerCase())) {
            await message.reply(`❌ Arme invalide. Armes disponibles: ${validWeapons.join(', ')}`);
            return;
          }
          if (!characterData.equipment) characterData.equipment = {};
          characterData.equipment.weapon = value.toLowerCase();
          successMessage = `✅ Arme équipée : ${this.getWeaponName(value.toLowerCase())}`;
          break;

        case 'kingdom':
          const validKingdoms = ['AEGYRIA', 'SOMBRENUIT', 'KHELOS', 'VARHA', 'SYLVARIA', 'ECLYPSIA'];
          if (!validKingdoms.includes(value.toUpperCase())) {
            await message.reply(`❌ Royaume invalide. Royaumes disponibles: ${validKingdoms.join(', ')}`);
            return;
          }
          updateData.kingdom = value.toUpperCase();
          successMessage = `✅ Royaume d'origine : ${value.toUpperCase()}`;
          break;

        default:
          await message.reply('❌ Type de personnalisation invalide. Types: gender, style, weapon, kingdom');
          return;
      }

      // Update player data
      updateData.character_data = JSON.stringify(characterData);
      await storage.updatePlayer(player.phone_number, updateData);

      await message.reply(successMessage + '\n\nUtilisez /fiche pour voir vos modifications !');

    } catch (error) {
      console.error('Error customizing character:', error);
      await message.reply('❌ Erreur lors de la personnalisation du personnage.');
    }
  }

  async handleInventory(message, player) {
    if (!player) {
      await message.reply('❌ Vous devez d\'abord vous enregistrer avec /register [nom]');
      return;
    }

    try {
      const characterData = JSON.parse(player.character_data || '{}');
      const equipment = characterData.equipment || {};
      
      let inventoryText = `🎒 **INVENTAIRE** 🎒\n\n` +
        `👤 **${player.character_name}**\n` +
        `💰 **Or :** ${player.gold} pièces\n\n` +
        `⚔️ **Équipement équipé :**\n`;

      if (equipment.weapon) {
        inventoryText += `• Arme : ${this.getWeaponName(equipment.weapon)}\n`;
      } else {
        inventoryText += `• Arme : Mains nues\n`;
      }

      if (equipment.armor) {
        inventoryText += `• Armure : ${equipment.armor}\n`;
      } else {
        inventoryText += `• Armure : Vêtements simples\n`;
      }

      inventoryText += `\n📦 **Objets :**\n`;
      inventoryText += `• Potion de soin (x1)\n`;
      inventoryText += `• Pain dur (x2)\n`;
      inventoryText += `• Gourde d'eau (x1)\n\n`;
      inventoryText += `🔧 **Actions :**\n`;
      inventoryText += `• /customize weapon [type] - Changer d'arme\n`;
      inventoryText += `• /use [objet] - Utiliser un objet`;

      await message.reply(inventoryText);
    } catch (error) {
      console.error('Error showing inventory:', error);
      await message.reply('❌ Erreur lors de l\'affichage de l\'inventaire.');
    }
  }

  async handleStats(message, player) {
    if (!player) {
      await message.reply('❌ Vous devez d\'abord vous enregistrer avec /register [nom]');
      return;
    }

    try {
      const healthBar = this.rpgSystem.generateHealthBar(player.health, player.max_health);
      const energyBar = this.rpgSystem.generateEnergyBar(player.energy, player.max_energy);
      const expNeeded = this.rpgSystem.getExperienceNeeded(player.level);
      
      const statsText = `📊 **STATISTIQUES DÉTAILLÉES** 📊\n\n` +
        `🎭 **${player.character_name}** (Niveau ${player.level})\n` +
        `⚡ **Niveau de puissance :** ${player.power_level}\n\n` +
        `💗 **Points de Vie :**\n` +
        `${healthBar}\n` +
        `${player.health}/${player.max_health} PV\n\n` +
        `⚡ **Énergie :**\n` +
        `${energyBar}\n` +
        `${player.energy}/${player.max_energy} PE\n\n` +
        `🎯 **Progression :**\n` +
        `• Expérience : ${player.experience}/${expNeeded} XP\n` +
        `• Prochain niveau : ${expNeeded - player.experience} XP restants\n\n` +
        `🏰 **Informations :**\n` +
        `• Royaume : ${player.kingdom}\n` +
        `• Ordre : ${player.order_name}\n` +
        `• Position : ${player.location}\n` +
        `• Richesse : ${player.gold} pièces d'or\n\n` +
        `⚔️ **Statut de combat :**\n` +
        `• ${this.rpgSystem.getHealthStatus(player.health, player.max_health)}\n` +
        `• ${this.rpgSystem.getEnergyStatus(player.energy, player.max_energy)}`;

      await message.reply(statsText);
    } catch (error) {
      console.error('Error showing stats:', error);
      await message.reply('❌ Erreur lors de l\'affichage des statistiques.');
    }
  }

  async handleSpawn(message, player, args) {
    if (!player) {
      await message.reply('❌ Vous devez d\'abord vous enregistrer avec /register [nom]');
      return;
    }

    try {
      // Generate spawn scenario using Game Master
      const spawnScenario = await this.gameMaster.generateSpawnScenario(player);

      // Get location image
      const locationImage = await this.imageManager.getLocationImage('inn');
      
      const spawnText = `🌟 **DÉBUT DE L'AVENTURE** 🌟\n\n` +
        `🎭 **${player.character_name}** se réveille...\n\n` +
        `${spawnScenario}\n\n` +
        `❤️ **Vie :** ${this.rpgSystem.generateHealthBar(player.health, player.max_health)}\n` +
        `⚡ **Énergie :** ${this.rpgSystem.generateEnergyBar(player.energy, player.max_energy)}\n\n` +
        `🎮 **Décrivez votre action en détail pour continuer l'aventure...**`;

      if (locationImage) {
        await message.reply(locationImage, undefined, { caption: spawnText });
      } else {
        await message.reply(spawnText);
      }

      // Update player location
      await storage.updatePlayer(player.phone_number, { 
        location: 'Auberge - Salle commune' 
      });

    } catch (error) {
      console.error('Error spawning player:', error);
      await message.reply('❌ Erreur lors du spawn. Réessayez dans quelques instants.');
    }
  }

  async handleHelp(message) {
    const helpText = `📖 **AIDE - FRICTION ULTIMATE** 📖\n\n` +
      `🎮 **Commandes principales :**\n` +
      `• /register [nom] - Créer un personnage\n` +
      `• /menu - Menu principal\n` +
      `• /fiche - Fiche personnage\n` +
      `• /create - Personnalisation\n` +
      `• /spawn - Commencer l'aventure\n` +
      `• /stats - Statistiques détaillées\n` +
      `• /inventory - Inventaire\n\n` +
      `⚔️ **Système de combat :**\n` +
      `• Décrivez vos actions en détail\n` +
      `• Précisez : mouvement, arme, direction, distance\n` +
      `• Exemple : "Avance de 2 mètres, épée haute, frappe vers la poitrine"\n\n` +
      `🌟 **Niveaux de puissance :**\n` +
      `G (Très faible) → F → E → D → C → B → A (Très fort)\n\n` +
      `💡 **Conseils :**\n` +
      `• Soyez précis dans vos actions\n` +
      `• Gérez votre énergie et votre vie\n` +
      `• Explorez prudemment\n` +
      `• Chaque choix a des conséquences\n\n` +
      `🏰 **Le jeu continue à travers tous les groupes WhatsApp !**`;

    await message.reply(helpText);
  }

  async handleRPGAction(message, text, player) {
    try {
      // Check if player is alive
      if (player.health <= 0) {
        await message.reply(`💀 **${player.character_name}** est inconscient !\n\nVous vous réveillez dans une auberge avec 100% de vie et d'énergie, mais vous avez perdu de l'or et des objets...\n\nUtilisez /spawn pour continuer.`);
        
        // Respawn player
        await storage.updatePlayer(player.phone_number, {
          health: player.max_health,
          energy: player.max_energy,
          gold: Math.max(0, player.gold - Math.floor(player.gold * 0.1)),
          location: 'Auberge de résurrection'
        });
        return;
      }

      // Generate AI response using Game Master
      const narratorResponse = await this.gameMaster.processPlayerAction(player, text);

      // Calculate action consequences
      const { healthChange, energyChange, expGain, goldChange } = this.rpgSystem.calculateActionConsequences(text, player);

      // Update player stats
      const newHealth = Math.max(0, Math.min(player.max_health, player.health + healthChange));
      const newEnergy = Math.max(0, Math.min(player.max_energy, player.energy + energyChange));
      const newGold = Math.max(0, player.gold + goldChange);
      const newExp = player.experience + expGain;

      await storage.updatePlayer(player.phone_number, {
        health: newHealth,
        energy: newEnergy,
        gold: newGold,
        experience: newExp
      });

      // Check for level up
      const expNeeded = this.rpgSystem.getExperienceNeeded(player.level);
      let levelUpText = '';
      if (newExp >= expNeeded) {
        const newLevel = player.level + 1;
        const newPowerLevel = this.rpgSystem.getPowerLevelForLevel(newLevel);
        await storage.updatePlayer(player.phone_number, {
          level: newLevel,
          power_level: newPowerLevel,
          max_health: player.max_health + 10,
          max_energy: player.max_energy + 5
        });
        levelUpText = `\n\n🌟 **NIVEAU SUPÉRIEUR !** 🌟\nNiveau ${newLevel} atteint ! Puissance ${newPowerLevel}`;
      }

      // Format response
      let responseText = `🎭 **${player.character_name}**\n\n${narratorResponse}`;
      
      // Add stat changes if significant
      if (healthChange !== 0 || energyChange !== 0) {
        responseText += `\n\n📊 **Conséquences :**`;
        if (healthChange !== 0) {
          responseText += `\n❤️ Vie : ${healthChange > 0 ? '+' : ''}${healthChange} PV`;
        }
        if (energyChange !== 0) {
          responseText += `\n⚡ Énergie : ${energyChange > 0 ? '+' : ''}${energyChange} PE`;
        }
        if (goldChange !== 0) {
          responseText += `\n💰 Or : ${goldChange > 0 ? '+' : ''}${goldChange} pièces`;
        }
        if (expGain > 0) {
          responseText += `\n🎯 Expérience : +${expGain} XP`;
        }
      }

      responseText += `\n\n❤️ **Vie :** ${this.rpgSystem.generateHealthBar(newHealth, player.max_health)}`;
      responseText += `\n⚡ **Énergie :** ${this.rpgSystem.generateEnergyBar(newEnergy, player.max_energy)}`;
      responseText += levelUpText;

      // Try to get contextual image
      const contextImage = await this.imageManager.getContextualImage(text, player.location);
      
      if (contextImage) {
        await message.reply(contextImage, undefined, { caption: responseText });
      } else {
        await message.reply(responseText);
      }

    } catch (error) {
      console.error('Error handling RPG action:', error);
      await message.reply('❌ Erreur lors du traitement de l\'action. Réessayez.');
    }
  }

  getWeaponName(weapon) {
    const weapons = {
      sword: 'Épée longue',
      bow: 'Arc en bois',
      staff: 'Bâton de mage',
      dagger: 'Dague empoisonnée'
    };
    return weapons[weapon] || weapon;
  }

  isReady() {
    return this.ready;
  }

  getQRCode() {
    return this.qrCode;
  }

  async destroy() {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
      this.ready = false;
    }
  }
}
