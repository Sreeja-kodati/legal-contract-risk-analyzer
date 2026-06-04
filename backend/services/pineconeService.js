const { Pinecone } = require('@pinecone-database/pinecone');

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'contracts';

let pinecone;
let index;
let useMock = false;
const localVectorStore = [];

function validateApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') return false;
  if (apiKey.includes('your_') || apiKey === 'your_pinecone_api_key_here') return false;
  if (apiKey.length < 15) return false;
  return true;
}

async function initializePinecone() {
  if (index || useMock) {
    return index;
  }

  if (!validateApiKey(PINECONE_API_KEY)) {
    console.warn('[PineconeService] Warning: PINECONE_API_KEY is missing or invalid. Falling back to in-memory mockup.');
    useMock = true;
    return null;
  }

  try {
    console.log('[PineconeService] Initializing Pinecone Client...');
    pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
    index = pinecone.Index(PINECONE_INDEX_NAME);
    console.log('[PineconeService] Pinecone Client initialized successfully');
    return index;
  } catch (error) {
    console.warn('[PineconeService] Error initializing Pinecone:', error.message, '. Falling back to in-memory mockup.');
    useMock = true;
    return null;
  }
}

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function upsertVectors(vectors, namespace = 'default') {
  if (!Array.isArray(vectors) || vectors.length === 0) {
    throw new Error('vectors must be a non-empty array');
  }

  await initializePinecone();

  const formattedVectors = vectors.map((item) => {
    const { id, values, contractName, chunkId, clauseText } = item;
    if (!id || !Array.isArray(values) || values.length === 0) {
      throw new Error('Each vector must include id and non-empty values array');
    }
    return {
      id,
      values,
      metadata: {
        contractName: contractName || '',
        chunkId: chunkId || '',
        clauseText: clauseText || '',
      },
    };
  });

  if (useMock) {
    console.log('[PineconeService] In-memory Mock Store: Upserting', formattedVectors.length, 'vectors');
    // Store locally in memory
    for (const vector of formattedVectors) {
      const existingIndex = localVectorStore.findIndex(v => v.id === vector.id);
      if (existingIndex !== -1) {
        localVectorStore[existingIndex] = vector;
      } else {
        localVectorStore.push(vector);
      }
    }
    return { upsertedCount: formattedVectors.length };
  }

  try {
    const response = await index.upsert(formattedVectors);
    return response;
  } catch (error) {
    console.warn('[PineconeService] Pinecone upsert failed:', error.message, '. Falling back to in-memory mockup.');
    // Store locally on failure
    for (const vector of formattedVectors) {
      const existingIndex = localVectorStore.findIndex(v => v.id === vector.id);
      if (existingIndex !== -1) {
        localVectorStore[existingIndex] = vector;
      } else {
        localVectorStore.push(vector);
      }
    }
    return { upsertedCount: formattedVectors.length };
  }
}

async function queryVectors(queryVector, topK = 5, namespace = 'default') {
  if (!Array.isArray(queryVector) || queryVector.length === 0) {
    throw new Error('queryVector must be a non-empty array');
  }

  await initializePinecone();

  if (useMock || localVectorStore.length > 0) {
    console.log('[PineconeService] Querying in-memory Mock Store containing', localVectorStore.length, 'vectors');
    const matches = localVectorStore
      .map((item) => ({
        id: item.id,
        score: cosineSimilarity(queryVector, item.values),
        metadata: item.metadata,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
    return { matches };
  }

  try {
    const response = await index.query({
      vector: queryVector,
      topK,
      includeMetadata: true,
    });
    return response;
  } catch (error) {
    console.warn('[PineconeService] Pinecone query failed:', error.message);
    throw new Error(`Pinecone query failed: ${error.message}`);
  }
}

module.exports = {
  initializePinecone,
  upsertVectors,
  queryVectors,
};

