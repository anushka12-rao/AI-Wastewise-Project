const env = require('../config/environment');
const { searchVectorStore } = require('./vectorStoreService');
const logger = require('../utils/logger');

/**
 * Gate 2: Evaluates whether retrieved evidence provides sufficient coverage.
 * Separate function with strict threshold boundary.
 */
function retrievalGate(topScore, chunks) {
  const threshold = env.RETRIEVAL_SCORE_THRESHOLD;

  if (!chunks || chunks.length === 0) {
    return {
      passed: false,
      reason: 'No matching knowledge base documents found for this category/jurisdiction',
      topScore: 0,
      threshold
    };
  }

  const score = typeof topScore === 'number' ? topScore : 0;
  if (score < threshold) {
    return {
      passed: false,
      reason: `Top retrieval score (${score.toFixed(2)}) is below coverage threshold (${threshold.toFixed(2)})`,
      topScore: score,
      threshold
    };
  }

  return {
    passed: true,
    topScore: score,
    threshold
  };
}

/**
 * Retrieve knowledge chunks for a waste category and jurisdiction
 */
async function retrieveGuidance(category, jurisdiction = 'GENERAL_INDIA', queryContext = '') {
  if (!category || category === 'UNKNOWN') {
    return {
      chunks: [],
      scores: [],
      topScore: 0
    };
  }

  const searchText = queryContext ? `${category} ${queryContext}` : category;
  const results = await searchVectorStore(searchText, {
    category,
    jurisdiction,
    limit: 5
  });

  const chunks = results.map(r => ({
    id: r.id || r.knowledgeEntryId,
    knowledgeEntryId: r.knowledgeEntryId,
    text: r.text,
    wasteCategory: r.wasteCategory,
    wasteStream: r.wasteStream,
    jurisdiction: r.jurisdiction,
    sourceTitle: r.sourceTitle,
    sourceUrl: r.sourceUrl,
    sourceAuthority: r.sourceAuthority,
    verified: r.verified,
    score: r.score
  }));

  const scores = chunks.map(c => c.score);
  const topScore = scores.length > 0 ? Math.max(...scores) : 0;

  logger.info(`Retrieved ${chunks.length} chunks for [${category}] in [${jurisdiction}], topScore: ${topScore}`);

  return {
    chunks,
    scores,
    topScore
  };
}

module.exports = {
  retrieveGuidance,
  retrievalGate
};
