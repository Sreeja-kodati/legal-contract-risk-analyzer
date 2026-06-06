const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { initializeDatabase } = require('./database/database');

const envPath = path.resolve(__dirname, '../.env');
console.log('[Server] Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn('[Server] Warning: .env file not found or could not be loaded:', result.error.message);
} else {
  console.log('[Server] .env file loaded successfully');
}

console.log('[Server] GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
console.log('[Server] GEMINI_API_KEY value:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'NOT SET');

// Import after dotenv.config() so API keys are available
const { testEmbedding } = require('./services/embeddingService');
const uploadRoutes = require('./routes/uploadRoutes');
const ingestionRoutes = require('./routes/ingestionRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const compareRoutes = require('./routes/compareRoutes');
const historyRoutes = require('./routes/historyRoutes');

const fs = require('fs');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.onrender.com');
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use('/', uploadRoutes);
app.use('/', ingestionRoutes);
app.use('/', analysisRoutes);
app.use('/', compareRoutes);
app.use('/', historyRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/test-embedding', async (req, res) => {
  try {
    const success = await testEmbedding();
    if (success) {
      res.status(200).json({ status: 'success', message: 'Embedding service is working' });
    } else {
      res.status(500).json({ status: 'failed', message: 'Embedding service test failed' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.get('/env-status', (req, res) => {
  res.status(200).json({
    GEMINI_API_KEY_SET: !!process.env.GEMINI_API_KEY,
    PINECONE_API_KEY_SET: !!process.env.PINECONE_API_KEY,
    PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME || 'not set',
    PORT: process.env.PORT || 4000,
  });
});

// Serve frontend static assets in production
const frontendDist = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  console.log('[Server] Serving static frontend from:', frontendDist);
  app.use(express.static(frontendDist));
  
  // Wildcard route for React Router routing
  app.get('*', (req, res) => {
    const apiRoutes = ['/upload', '/ingest', '/ask', '/compare', '/history', '/health', '/test-embedding', '/env-status'];
    if (apiRoutes.some(route => req.path.startsWith(route))) {
      return res.status(404).json({ error: 'Not Found' });
    }
    res.sendFile(path.resolve(frontendDist, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
  });
}

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
});

const PORT = process.env.PORT || 4000;

initializeDatabase().catch((error) => {
  console.error('Database initialization failed:', error);
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
