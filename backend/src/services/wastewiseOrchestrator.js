const identificationService = require('./identificationService');
const retrievalService = require('./retrievalService');
const generationService = require('./generationService');
const { QueryLog } = require('../models/QueryLog');
const { KnowledgeEntry } = require('../models/KnowledgeEntry');
const logger = require('../utils/logger');

/**
 * Section 6 Security Rule: Validate that advisory client-supplied IDs
 * are an exact subset of the independently retrieved server IDs.
 */
function validateClientSourceIds(clientSuppliedIds, serverRetrievedIds) {
  if (!Array.isArray(clientSuppliedIds) || clientSuppliedIds.length === 0) {
    return serverRetrievedIds;
  }

  const serverSet = new Set(serverRetrievedIds.map(String));
  const isStrictSubset = clientSuppliedIds.every(id => serverSet.has(String(id)));

  if (!isStrictSubset) {
    logger.warn('Client supplied out-of-scope/fabricated source_entry_ids. Discarding client IDs and using server-derived IDs.');
    return serverRetrievedIds;
  }

  return clientSuppliedIds.map(String);
}

/**
 * Orchestrate the complete WasteWise analysis pipeline
 */
async function orchestrateAnalysis({ imageBase64, textDescription, jurisdiction = 'GENERAL_INDIA' }) {
  // Input summary for privacy-preserving query log
  const inputSummary = textDescription 
    ? textDescription.slice(0, 80) 
    : imageBase64 ? '[Image Upload]' : 'Empty input';

  // -------------------------------------------------------------
  // STEP 1: AI Identification (Granite Vision / Text)
  // -------------------------------------------------------------
  const idResult = await identificationService.identifyWaste({ imageBase64, textDescription });
  const { topCategory, topConfidence, candidates = [] } = idResult;

  // -------------------------------------------------------------
  // STEP 2: Identification Gate (Gate 1)
  // -------------------------------------------------------------
  const gate1 = identificationService.identificationGate(topConfidence, topCategory);
  if (!gate1.passed) {
    logger.info(`Gate 1 Failed: ${gate1.reason}. Short-circuiting to UNCERTAIN.`);

    // Log event without PII or raw image
    try {
      await QueryLog.create({
        type: 'analyze',
        inputSummary,
        outcome: 'UNCERTAIN',
        wasteCategory: topCategory || 'UNKNOWN',
        jurisdiction,
        citedEntryIds: []
      });
    } catch (logErr) {
      logger.debug('QueryLog error:', { err: logErr.message });
    }

    // HARD RULE: Retrieval & Granite Generation are literally NOT called
    return {
      outcome: 'UNCERTAIN',
      topCategory,
      topConfidence,
      candidates,
      message: gate1.reason
    };
  }

  const category = gate1.topCategory;

  // -------------------------------------------------------------
  // STEP 3: RAG Retrieval (LanceDB)
  // -------------------------------------------------------------
  const retrievalResult = await retrievalService.retrieveGuidance(category, jurisdiction, textDescription);
  const { chunks, topScore } = retrievalResult;

  // -------------------------------------------------------------
  // STEP 4: Retrieval Gate (Gate 2)
  // -------------------------------------------------------------
  const gate2 = retrievalService.retrievalGate(topScore, chunks);
  if (!gate2.passed) {
    logger.info(`Gate 2 Failed: ${gate2.reason}. Short-circuiting to COVERAGE_INSUFFICIENT.`);

    try {
      await QueryLog.create({
        type: 'analyze',
        inputSummary,
        outcome: 'COVERAGE_INSUFFICIENT',
        wasteCategory: category,
        jurisdiction,
        citedEntryIds: []
      });
    } catch (logErr) {
      logger.debug('QueryLog error:', { err: logErr.message });
    }

    // HARD RULE: Granite Generation is literally NOT called
    return {
      outcome: 'COVERAGE_INSUFFICIENT',
      category,
      jurisdiction,
      topScore,
      message: gate2.reason
    };
  }

  // -------------------------------------------------------------
  // STEP 5: IBM Granite Grounded Generation
  // -------------------------------------------------------------
  const generationResult = await generationService.generateGroundedGuidance({
    category,
    jurisdiction,
    retrievedChunks: chunks,
    userContext: textDescription
  });

  // -------------------------------------------------------------
  // STEP 6: Source Citations & Security Validation
  // -------------------------------------------------------------
  const serverRetrievedIds = chunks.map(c => String(c.id || c.knowledgeEntryId));
  const validatedCitedIds = generationService.validateGraniteCitations(generationResult.citedSourceIds, chunks);

  // Fetch full verified source records for UI
  const sources = chunks
    .filter(c => validatedCitedIds.includes(String(c.id || c.knowledgeEntryId)))
    .map(c => ({
      _id: c.id || c.knowledgeEntryId,
      sourceTitle: c.sourceTitle,
      sourceUrl: c.sourceUrl,
      sourceAuthority: c.sourceAuthority,
      verified: c.verified
    }));

  const primaryChunk = chunks[0] || {};
  const wasteStream = primaryChunk.wasteStream || 'DRY_WASTE';

  // Save successful query log
  try {
    const validObjectIds = validatedCitedIds.filter(id => id && id.match(/^[0-9a-fA-F]{24}$/));
    await QueryLog.create({
      type: 'analyze',
      inputSummary,
      outcome: 'CONFIDENT',
      wasteCategory: category,
      jurisdiction,
      citedEntryIds: validObjectIds
    });
  } catch (logErr) {
    logger.debug('QueryLog error:', { err: logErr.message });
  }

  // Return CONFIDENT payload
  return {
    outcome: 'CONFIDENT',
    category,
    wasteStream,
    jurisdiction,
    guidance: generationResult.guidance,
    reasoning: generationResult.reasoning,
    cautionNotes: generationResult.cautionNotes,
    sources,
    identificationConfidence: gate1.topConfidence,
    retrievalScore: gate2.topScore
  };
}

/**
 * Orchestrate follow-up query for "Ask WasteWise"
 */
async function orchestrateQuery({ question, priorCategory, priorSourceIds = [], jurisdiction = 'GENERAL_INDIA' }) {
  const inputSummary = question ? question.slice(0, 80) : 'Empty question';

  // Backend independently derives or re-verifies category (never trust client blindly)
  let category = priorCategory;
  if (!category || category === 'UNKNOWN') {
    const idResult = await identificationService.identifyWaste({ textDescription: question });
    category = idResult.topCategory;
  }

  // Gate 1 check
  const gate1 = identificationService.identificationGate(0.85, category);
  if (!gate1.passed) {
    return {
      outcome: 'UNCERTAIN',
      topCategory: 'UNKNOWN',
      topConfidence: 0.4,
      message: 'Question could not be resolved to a known waste material'
    };
  }

  // Retrieve evidence independently server-side
  const retrievalResult = await retrievalService.retrieveGuidance(category, jurisdiction, question);
  const { chunks, topScore } = retrievalResult;

  // Gate 2 check
  const gate2 = retrievalService.retrievalGate(topScore, chunks);
  if (!gate2.passed) {
    return {
      outcome: 'COVERAGE_INSUFFICIENT',
      category,
      jurisdiction,
      message: 'No specific municipal guidelines found to answer this inquiry'
    };
  }

  // Validate client-supplied advisory IDs (Section 6)
  const serverRetrievedIds = chunks.map(c => String(c.id || c.knowledgeEntryId));
  const effectiveSourceIds = validateClientSourceIds(priorSourceIds, serverRetrievedIds);

  // Generate grounded answer
  const generationResult = await generationService.generateGroundedGuidance({
    category,
    jurisdiction,
    retrievedChunks: chunks,
    userContext: question
  });

  const validatedCitedIds = generationService.validateGraniteCitations(generationResult.citedSourceIds, chunks);
  const sources = chunks
    .filter(c => validatedCitedIds.includes(String(c.id || c.knowledgeEntryId)))
    .map(c => ({
      _id: c.id || c.knowledgeEntryId,
      sourceTitle: c.sourceTitle,
      sourceUrl: c.sourceUrl,
      sourceAuthority: c.sourceAuthority,
      verified: c.verified
    }));

  const primaryChunk = chunks[0] || {};
  const wasteStream = primaryChunk.wasteStream || 'DRY_WASTE';

  // Log query
  try {
    const validObjectIds = validatedCitedIds.filter(id => id && id.match(/^[0-9a-fA-F]{24}$/));
    await QueryLog.create({
      type: 'query',
      inputSummary,
      outcome: 'CONFIDENT',
      wasteCategory: category,
      jurisdiction,
      citedEntryIds: validObjectIds
    });
  } catch (logErr) {
    logger.debug('QueryLog error:', { err: logErr.message });
  }

  return {
    outcome: 'CONFIDENT',
    category,
    wasteStream,
    jurisdiction,
    guidance: generationResult.guidance,
    reasoning: generationResult.reasoning,
    cautionNotes: generationResult.cautionNotes,
    sources,
    retrievalScore: gate2.topScore
  };
}

module.exports = {
  orchestrateAnalysis,
  orchestrateQuery,
  validateClientSourceIds
};
