const env = require('../config/environment');
const { getIamToken, isWatsonxConfigured } = require('../config/watsonx');
const logger = require('../utils/logger');

const EMBEDDING_DIM = 384;

/**
 * Deterministic local embedding for simulation and offline tests.
 * Produces an L2-normalized vector in 384-D space using n-gram hashing.
 */
function createDeterministicEmbedding(text) {
  const vec = new Float32Array(EMBEDDING_DIM);
  const normalized = (text || '').toLowerCase().trim();

  if (!normalized) {
    vec[0] = 1.0;
    return Array.from(vec);
  }

  // Token & bigram hashing
  const words = normalized.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 5381;
    for (let c = 0; c < word.length; c++) {
      hash = ((hash << 5) + hash) + word.charCodeAt(c);
    }
    const idx = (hash >>> 0) % EMBEDDING_DIM;
    vec[idx] += 1.0;

    // Bigram
    if (i < words.length - 1) {
      const bigram = `${word}_${words[i + 1]}`;
      let bHash = 5381;
      for (let c = 0; c < bigram.length; c++) {
        bHash = ((bHash << 5) + bHash) + bigram.charCodeAt(c);
      }
      const bIdx = (bHash >>> 0) % EMBEDDING_DIM;
      vec[bIdx] += 1.5;
    }
  }

  // L2 normalize
  let sumSq = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    sumSq += vec[i] * vec[i];
  }
  const norm = Math.sqrt(sumSq) || 1.0;
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    vec[i] = vec[i] / norm;
  }

  return Array.from(vec);
}

/**
 * Generate embedding for a single text string
 */
async function generateEmbedding(text) {
  if (!text || typeof text !== 'string') {
    return createDeterministicEmbedding('');
  }

  if (isWatsonxConfigured()) {
    try {
      const token = await getIamToken();
      if (!token) throw new Error('Missing IAM Token');

      const response = await fetch(`${env.WATSONX_URL}/ml/v1/text/embeddings?version=2023-05-29`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model_id: 'ibm/slate-125m-english-rtrvr',
          project_id: env.WATSONX_PROJECT_ID,
          inputs: [text]
        })
      });

      if (!response.ok) {
        throw new Error(`Slate API returned status ${response.status}`);
      }

      const data = await response.json();
      if (data.results && data.results[0] && data.results[0].embedding) {
        return data.results[0].embedding;
      }
    } catch (err) {
      logger.warn(`watsonx Slate embedding failed, falling back to local provider: ${err.message}`);
    }
  }

  return createDeterministicEmbedding(text);
}

module.exports = {
  generateEmbedding,
  createDeterministicEmbedding,
  EMBEDDING_DIM
};
