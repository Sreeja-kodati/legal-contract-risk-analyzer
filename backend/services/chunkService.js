function chunkDocument(text) {
  if (typeof text !== 'string') {
    throw new Error('Text must be a string');
  }

  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return [];
  }

  const chunkSize = 1000;
  const overlap = 200;
  const chunks = [];
  let start = 0;

  while (start < normalized.length) {
    let end = start + chunkSize;
    if (end >= normalized.length) {
      end = normalized.length;
    } else {
      const boundary = normalized.lastIndexOf(' ', end);
      if (boundary > start + chunkSize / 2) {
        end = boundary;
      }
    }

    const chunk = normalized.slice(start, end).trim();
    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= normalized.length) {
      break;
    }

    start = Math.max(end - overlap, end - chunkSize + overlap);
  }

  return chunks;
}

module.exports = {
  chunkDocument,
};
