const dotenv = require('dotenv');
const { generateEmbedding } = require('./embeddingService');
const { initializePinecone, queryVectors } = require('./pineconeService');

dotenv.config();

async function retrieveContext(query) {
  if (typeof query !== 'string' || !query.trim()) {
    throw new Error('Query must be a non-empty string');
  }

  try {
    const queryEmbedding = await generateEmbedding(query);
    await initializePinecone();

    const pineconeResponse = await queryVectors(queryEmbedding, 5);
    const matches = pineconeResponse?.matches || [];

    return matches.map((match) => ({
      id: match.id,
      score: match.score,
      contractName: match?.metadata?.contractName || null,
      chunkId: match?.metadata?.chunkId || null,
      clauseText: match?.metadata?.clauseText || null,
    }));
  } catch (error) {
    throw new Error(`Failed to retrieve context: ${error.message}`);
  }
}

module.exports = {
  retrieveContext,
};
