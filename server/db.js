import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '../shared/schema.js';

// Configuration Neon avec retry et reconnection
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false;

let db = null;
let pool = null;
let connectionRetries = 0;
const maxRetries = 3;

export async function initializeDatabase() {
  try {
    if (!process.env.DATABASE_URL) {
      console.log('DATABASE_URL not found, using in-memory storage');
      return;
    }

    // Configuration du pool avec retry
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      max: 1, // Limite les connexions simultanées
      idleTimeoutMillis: 0, // Garde les connexions ouvertes
      connectionTimeoutMillis: 10000,
    });

    // Gestionnaire d'erreur pour le pool
    pool.on('error', (err) => {
      console.error('Pool database error:', err);
      if (connectionRetries < maxRetries) {
        setTimeout(() => reconnectDatabase(), 2000);
      }
    });

    db = drizzle({ client: pool, schema });
    
    // Test de connexion
    await testConnection();
    console.log('Database connection established');
    connectionRetries = 0;
  } catch (error) {
    console.error('Database connection failed:', error);
    connectionRetries++;
    
    if (connectionRetries < maxRetries) {
      console.log(`Retry ${connectionRetries}/${maxRetries} in 5 seconds...`);
      setTimeout(() => initializeDatabase(), 5000);
    } else {
      console.log('Max retries reached, falling back to in-memory storage');
      db = null;
    }
  }
}

async function testConnection() {
  if (!db) return false;
  
  try {
    // Test simple de requête
    await db.execute('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database test failed:', error);
    throw error;
  }
}

async function reconnectDatabase() {
  if (connectionRetries >= maxRetries) return;
  
  console.log('Attempting to reconnect to database...');
  connectionRetries++;
  
  try {
    if (pool) {
      await pool.end();
    }
    await initializeDatabase();
  } catch (error) {
    console.error('Reconnection failed:', error);
  }
}

export function getDatabase() {
  return db;
}

export async function ensureConnection() {
  if (!db) {
    console.log('Database not connected, attempting reconnection...');
    await initializeDatabase();
  }
  return db;
}

export { db };
