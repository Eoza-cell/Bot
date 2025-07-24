import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { WhatsAppBot } from './bot.js';
import { initializeDatabase } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Global bot instance
let botInstance = null;

// Initialize database
await initializeDatabase();

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/qr', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/qr-display.html'));
});

app.post('/start-bot', async (req, res) => {
  try {
    if (botInstance) {
      return res.json({ success: false, message: 'Bot already running' });
    }
    
    botInstance = new WhatsAppBot();
    await botInstance.initialize();
    
    res.json({ success: true, message: 'Bot starting...' });
  } catch (error) {
    console.error('Error starting bot:', error);
    res.status(500).json({ success: false, message: 'Failed to start bot' });
  }
});

app.post('/stop-bot', async (req, res) => {
  try {
    if (botInstance) {
      await botInstance.destroy();
      botInstance = null;
    }
    res.json({ success: true, message: 'Bot stopped' });
  } catch (error) {
    console.error('Error stopping bot:', error);
    res.status(500).json({ success: false, message: 'Failed to stop bot' });
  }
});

app.get('/bot-status', (req, res) => {
  res.json({ 
    running: botInstance !== null,
    ready: botInstance ? botInstance.isReady() : false,
    qrCode: botInstance ? botInstance.getQRCode() : null
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  if (botInstance) {
    await botInstance.destroy();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  if (botInstance) {
    await botInstance.destroy();
  }
  process.exit(0);
});
