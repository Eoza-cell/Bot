import axios from 'axios';

export class ImageManager {
  constructor() {
    this.imageCache = new Map();
    this.stockImageUrls = {
      fantasy_menu: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&auto=format',
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&auto=format',
        'https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?w=800&auto=format',
        'https://images.unsplash.com/photo-1590736969955-11f7f6032dde?w=800&auto=format',
        'https://images.unsplash.com/photo-1540206395-68808572332f?w=800&auto=format'
      ],
      character_creation: [
        'https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?w=800&auto=format',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&auto=format',
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&auto=format',
        'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format'
      ],
      locations: {
        inn: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format',
          'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=800&auto=format',
          'https://images.unsplash.com/photo-1590736969955-11f7f6032dde?w=800&auto=format',
          'https://images.unsplash.com/photo-1544511916-0148ccdeb877?w=800&auto=format'
        ],
        forest: [
          'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format',
          'https://images.unsplash.com/photo-1440066097-104952b0f8ef?w=800&auto=format',
          'https://images.unsplash.com/photo-1544511916-0148ccdeb877?w=800&auto=format'
        ],
        castle: [
          'https://images.unsplash.com/photo-1520637836862-4d197d17c50a?w=800&auto=format',
          'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&auto=format',
          'https://images.unsplash.com/photo-1571018351210-9e8a2e9b5e5c?w=800&auto=format',
          'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format'
        ],
        dungeon: [
          'https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?w=800&auto=format',
          'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&auto=format',
          'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&auto=format',
          'https://images.unsplash.com/photo-1540206395-68808572332f?w=800&auto=format'
        ],
        marketplace: [
          'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format',
          'https://images.unsplash.com/photo-1571018351210-9e8a2e9b5e5c?w=800&auto=format'
        ],
        battlefield: [
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&auto=format',
          'https://images.unsplash.com/photo-1590736969955-11f7f6032dde?w=800&auto=format'
        ]
      },
      combat: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&auto=format',
        'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=800&auto=format',
        'https://images.unsplash.com/photo-1590736969955-11f7f6032dde?w=800&auto=format',
        'https://images.unsplash.com/photo-1540206395-68808572332f?w=800&auto=format'
      ],
      characters: {
        male: [
          'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=400&auto=format',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&auto=format',
          'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&auto=format',
          'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=400&auto=format'
        ],
        female: [
          'https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?w=400&auto=format',
          'https://images.unsplash.com/photo-1520637836862-4d197d17c50a?w=400&auto=format',
          'https://images.unsplash.com/photo-1571018351210-9e8a2e9b5e5c?w=400&auto=format',
          'https://images.unsplash.com/photo-1540206395-68808572332f?w=400&auto=format'
        ]
      },
      weapons: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&auto=format',
        'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=400&auto=format'
      ],
      magic: [
        'https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?w=800&auto=format',
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&auto=format'
      ]
    };
  }

  async getFantasyMenuImage() {
    try {
      const urls = this.stockImageUrls.fantasy_menu;
      const randomUrl = urls[Math.floor(Math.random() * urls.length)];
      
      return await this.downloadImage(randomUrl);
    } catch (error) {
      console.error('Error getting fantasy menu image:', error);
      return null;
    }
  }

  async getCharacterCreationImage() {
    try {
      const urls = this.stockImageUrls.character_creation;
      const randomUrl = urls[Math.floor(Math.random() * urls.length)];
      
      return await this.downloadImage(randomUrl);
    } catch (error) {
      console.error('Error getting character creation image:', error);
      return null;
    }
  }

  async getCharacterImage(player) {
    try {
      const characterData = JSON.parse(player.character_data || '{}');
      const gender = characterData.gender || 'male';
      
      const urls = this.stockImageUrls.characters[gender];
      const randomUrl = urls[Math.floor(Math.random() * urls.length)];
      
      return await this.downloadImage(randomUrl);
    } catch (error) {
      console.error('Error getting character image:', error);
      return null;
    }
  }

  async getLocationImage(locationType) {
    try {
      // Determine location type from description
      let imageType = 'inn';
      
      const locationLower = locationType.toLowerCase();
      if (locationLower.includes('forêt') || locationLower.includes('forest')) {
        imageType = 'forest';
      } else if (locationLower.includes('château') || locationLower.includes('castle')) {
        imageType = 'castle';
      } else if (locationLower.includes('donjon') || locationLower.includes('dungeon')) {
        imageType = 'dungeon';
      }

      const urls = this.stockImageUrls.locations[imageType] || this.stockImageUrls.locations.inn;
      const randomUrl = urls[Math.floor(Math.random() * urls.length)];
      
      return await this.downloadImage(randomUrl);
    } catch (error) {
      console.error('Error getting location image:', error);
      return null;
    }
  }

  async getContextualImage(action, location) {
    try {
      const actionLower = action.toLowerCase();
      
      // Check if it's a combat action
      if (this.isCombatAction(actionLower)) {
        const urls = this.stockImageUrls.combat;
        const randomUrl = urls[Math.floor(Math.random() * urls.length)];
        return await this.downloadImage(randomUrl);
      }
      
      // Default to location image
      return await this.getLocationImage(location);
    } catch (error) {
      console.error('Error getting contextual image:', error);
      return null;
    }
  }

  async downloadImage(url) {
    try {
      // Check cache first
      if (this.imageCache.has(url)) {
        return this.imageCache.get(url);
      }

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const buffer = Buffer.from(response.data);
      
      // Cache the image for reuse
      this.imageCache.set(url, buffer);
      
      return buffer;
    } catch (error) {
      console.error('Error downloading image:', error);
      return null;
    }
  }

  isCombatAction(action) {
    const combatKeywords = ['attaque', 'frappe', 'coup', 'épée', 'combat', 'tue', 'blesse', 'dague', 'arc', 'flèche'];
    return combatKeywords.some(keyword => action.includes(keyword));
  }

  // Method to generate 3D character visualization URLs
  generateCharacter3DUrl(characterData) {
    // This would integrate with a 3D character generation service
    // For now, return a placeholder
    const baseUrl = 'https://api.readyplayer.me/v1/avatars/';
    const gender = characterData.gender || 'male';
    const style = characterData.appearance || 'warrior';
    
    // This would be replaced with actual 3D avatar generation
    return `${baseUrl}${gender}-${style}.png`;
  }

  // Method to get equipment visualization
  async getEquipmentImage(equipmentType, equipmentName) {
    try {
      // This would fetch equipment images from a database or API
      // For now, return a generic equipment image
      const equipmentUrl = `https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&text=${equipmentName}`;
      return await this.downloadImage(equipmentUrl);
    } catch (error) {
      console.error('Error getting equipment image:', error);
      return null;
    }
  }

  // Clear image cache periodically to prevent memory issues
  clearCache() {
    this.imageCache.clear();
    console.log('Image cache cleared');
  }
}
