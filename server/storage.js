import { getDatabase } from './db.js';
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
      const [player] = await this.db
        .select()
        .from(players)
        .where(eq(players.phone_number, phoneNumber));
      return player || null;
    } catch (error) {
      console.error('Error getting player by phone:', error);
      return null;
    }
  }

  async createPlayer(playerData) {
    try {
      const [player] = await this.db
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
      const [player] = await this.db
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
      await this.db
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
      return await this.db.select().from(players);
    } catch (error) {
      console.error('Error getting all players:', error);
      return [];
    }
  }
}

// Initialize storage
const db = getDatabase();
export const storage = db ? new DatabaseStorage(db) : new MemoryStorage();

console.log(`Using ${db ? 'Database' : 'Memory'} storage`);
