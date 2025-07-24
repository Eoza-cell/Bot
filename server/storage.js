import { getDatabase, ensureConnection } from './db.js';
import { players } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

class MemoryStorage {
  constructor() {
    this.players = new Map();
  }

  async getPlayerByPhone(phoneNumber) {
    return this.players.get(phoneNumber) || null;
  }

  async createPlayer(playerData) {
    const player = {
      id: Date.now(),
      created_at: new Date(),
      updated_at: new Date(),
      ...playerData
    };
    this.players.set(playerData.phone_number, player);
    return player;
  }

  async updatePlayer(phoneNumber, updateData) {
    const player = this.players.get(phoneNumber);
    if (player) {
      const updatedPlayer = {
        ...player,
        ...updateData,
        updated_at: new Date()
      };
      this.players.set(phoneNumber, updatedPlayer);
      return updatedPlayer;
    }
    return null;
  }

  async deletePlayer(phoneNumber) {
    return this.players.delete(phoneNumber);
  }

  async getAllPlayers() {
    return Array.from(this.players.values());
  }
}

class DatabaseStorage {
  constructor(db) {
    this.db = db;
  }

  async getPlayerByPhone(phoneNumber) {
    try {
      // Assurer la connexion avant la requête
      const db = await ensureConnection();
      if (!db) return null;
      
      const [player] = await db
        .select()
        .from(players)
        .where(eq(players.phone_number, phoneNumber));
      return player || null;
    } catch (error) {
      console.error('Error getting player by phone:', error);
      // En cas d'erreur DB, retourner null pour fallback vers memory
      return null;
    }
  }

  async createPlayer(playerData) {
    try {
      const db = await ensureConnection();
      if (!db) throw new Error('Database not available');
      
      const [player] = await db
        .insert(players)
        .values(playerData)
        .returning();
      return player;
    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    }
  }

  async updatePlayer(phoneNumber, updateData) {
    try {
      const db = await ensureConnection();
      if (!db) throw new Error('Database not available');
      
      const [player] = await db
        .update(players)
        .set({ ...updateData, updated_at: new Date() })
        .where(eq(players.phone_number, phoneNumber))
        .returning();
      return player || null;
    } catch (error) {
      console.error('Error updating player:', error);
      return null;
    }
  }

  async deletePlayer(phoneNumber) {
    try {
      const db = await ensureConnection();
      if (!db) return false;
      
      await db
        .delete(players)
        .where(eq(players.phone_number, phoneNumber));
      return true;
    } catch (error) {
      console.error('Error deleting player:', error);
      return false;
    }
  }

  async getAllPlayers() {
    try {
      const db = await ensureConnection();
      if (!db) return [];
      
      return await db.select().from(players);
    } catch (error) {
      console.error('Error getting all players:', error);
      return [];
    }
  }
}

// Système de storage hybride avec fallback automatique
class HybridStorage {
  constructor() {
    this.memoryStorage = new MemoryStorage();
    this.databaseStorage = null;
    this.initializeStorage();
  }

  async initializeStorage() {
    const db = getDatabase();
    if (db) {
      this.databaseStorage = new DatabaseStorage(db);
      console.log('Using Database storage with Memory fallback');
    } else {
      console.log('Using Memory storage only');
    }
  }

  async getPlayerByPhone(phoneNumber) {
    if (this.databaseStorage) {
      try {
        const result = await this.databaseStorage.getPlayerByPhone(phoneNumber);
        if (result !== null) return result;
      } catch (error) {
        console.warn('Database failed, falling back to memory:', error.message);
      }
    }
    return await this.memoryStorage.getPlayerByPhone(phoneNumber);
  }

  async createPlayer(playerData) {
    // Toujours créer en mémoire pour la fiabilité
    const memoryPlayer = await this.memoryStorage.createPlayer(playerData);
    
    // Essayer aussi en base de données
    if (this.databaseStorage) {
      try {
        await this.databaseStorage.createPlayer(playerData);
      } catch (error) {
        console.warn('Database write failed, data exists in memory:', error.message);
      }
    }
    
    return memoryPlayer;
  }

  async updatePlayer(phoneNumber, updateData) {
    // Mettre à jour en mémoire d'abord
    const memoryResult = await this.memoryStorage.updatePlayer(phoneNumber, updateData);
    
    // Essayer aussi en base de données
    if (this.databaseStorage) {
      try {
        await this.databaseStorage.updatePlayer(phoneNumber, updateData);
      } catch (error) {
        console.warn('Database update failed, data updated in memory:', error.message);
      }
    }
    
    return memoryResult;
  }

  async deletePlayer(phoneNumber) {
    const memoryResult = await this.memoryStorage.deletePlayer(phoneNumber);
    
    if (this.databaseStorage) {
      try {
        await this.databaseStorage.deletePlayer(phoneNumber);
      } catch (error) {
        console.warn('Database delete failed, data removed from memory:', error.message);
      }
    }
    
    return memoryResult;
  }

  async getAllPlayers() {
    if (this.databaseStorage) {
      try {
        const dbPlayers = await this.databaseStorage.getAllPlayers();
        if (dbPlayers.length > 0) return dbPlayers;
      } catch (error) {
        console.warn('Database query failed, using memory data:', error.message);
      }
    }
    return await this.memoryStorage.getAllPlayers();
  }
}

export const storage = new HybridStorage();
