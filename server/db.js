import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '../shared/schema.js';

neonConfig.webSocketConstructor = ws;

let db = null;

export async function initializeDatabase() {
  try {
    if (!process.env.DATABASE_URL) {
      console.log('DATABASE_URL not found, using in-memory storage');
      return;
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
    
    console.log('Database connection established');
  } catch (error) {
    console.error('Database connection failed:', error);
    console.log('Falling back to in-memory storage');
  }
}

export function getDatabase() {
  return db;
}

export { db };
