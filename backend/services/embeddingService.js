const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

let genAI;
let initialized = false;
let useMock = false;

function validateApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return { valid: false, message: 'API key is not set or not a string' };
  }
  if (apiKey.includes('your_') || apiKey === 'your_gemini_api_key_here') {
    return { 
      valid: false, 
      message: 'API key is still a placeholder. Please set GEMINI_API_KEY in .env file with a valid API key from Google AI Studio (https://aistudio.google.com)' 
    };
  }
  if (apiKey.length < 20) {
    return { valid: false, message: 'API key appears to be invalid (too short)' };
  }
  return { valid: true, message: 'API key format is valid' };
}

function initializeGenAI() {
  if (initialized) {
    return;
  }

  const validation = validateApiKey(GEMINI_API_KEY);
  if (!validation.valid) {
    console.warn(`[EmbeddingService] Warning: ${validation.message}. Falling back to Mock Embeddings.`);
    useMock = true;
    initialized = true;
    return;
  }

  try {
    console.log('[EmbeddingService] Initializing Google Generative AI');
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    initialized = true;
    console.log('[EmbeddingService] Google Generative AI initialized successfully');
  } catch (error) {
    console.warn('[EmbeddingService] Error initializing Google Generative AI:', error.message, '. Falling back to Mock Embeddings.');
    useMock = true;
    initialized = true;
  }
}

function generateMockEmbedding(text) {
  const embedding = new Array(768).fill(0);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  for (let i = 0; i < 768; i++) {
    const val = Math.sin(hash + i) * 0.1;
    embedding[i] = Math.round(val * 1000000) / 1000000;
  }
  return embedding;
}

async function generateEmbedding(text) {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Text must be a non-empty string');
  }

  if (!initialized) {
    initializeGenAI();
  }

  if (useMock) {
    console.log('[EmbeddingService] Generating mock embedding (Mock Mode Active) for text length:', text.length);
    return generateMockEmbedding(text);
  }

  try {
    console.log('[EmbeddingService] Generating embedding for text length:', text.length);

    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    
    const result = await model.embedContent({
      content: {
        parts: [{ text }],
      },
    });

    if (!result || !result.embedding || !result.embedding.values) {
      console.error('[EmbeddingService] Invalid response structure:', JSON.stringify(result).substring(0, 200));
      throw new Error('Invalid embedding response structure from Gemini API');
    }

    const embedding = result.embedding.values;

    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new Error('Embedding is not a valid non-empty numeric array');
    }

    console.log('[EmbeddingService] Embedding generated successfully, dimension:', embedding.length);
    return embedding;
  } catch (error) {
    console.warn('[EmbeddingService] Embedding generation failed:', error.message, '. Falling back to Mock Embedding.');
    return generateMockEmbedding(text);
  }
}

// Test function for validation
async function testEmbedding() {
  try {
    console.log('[EmbeddingService] Running embedding test...');
    const testText = 'This is a test contract.';
    const embedding = await generateEmbedding(testText);
    console.log('[EmbeddingService] Test embedding successful, vector size:', embedding.length);
    console.log('[EmbeddingService] Sample values (first 5):', embedding.slice(0, 5));
    return true;
  } catch (error) {
    console.error('[EmbeddingService] Test embedding failed:', error.message);
    return false;
  }
}

module.exports = {
  generateEmbedding,
  testEmbedding,
  initializeGenAI,
  validateApiKey,
};

