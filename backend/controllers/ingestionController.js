const path = require('path');
const { extractText } = require('../services/pdfService');
const { chunkDocument } = require('../services/chunkService');
const { generateEmbedding } = require('../services/embeddingService');
const { initializePinecone, upsertVectors } = require('../services/pineconeService');

async function ingestContract(req, res) {
  try {
    const { pdfPath, contractName } = req.body;
    if (!pdfPath || typeof pdfPath !== 'string') {
      return res.status(400).json({ error: 'pdfPath is required' });
    }

    const resolvedPath = path.resolve(pdfPath);
    const extractedText = await extractText(resolvedPath);
    const chunks = chunkDocument(extractedText);

    if (!chunks.length) {
      return res.status(400).json({ error: 'No text could be extracted from the PDF' });
    }

    await initializePinecone();

    const vectors = await Promise.all(
      chunks.map(async (chunk, index) => {
        const embedding = await generateEmbedding(chunk);
        return {
          id: `${contractName || path.basename(pdfPath)}-chunk-${index + 1}`,
          values: embedding,
          contractName: contractName || path.basename(pdfPath),
          chunkId: `chunk-${index + 1}`,
          clauseText: chunk,
        };
      })
    );

    await upsertVectors(vectors, contractName || 'default');

    res.status(200).json({
      status: 'success',
      contractName: contractName || path.basename(pdfPath),
      chunksStored: chunks.length,
      vectorCount: vectors.length,
    });
  } catch (error) {
    console.error('Ingestion error:', error);
    res.status(500).json({ error: error.message || 'Ingestion failed' });
  }
}

module.exports = {
  ingestContract,
};
