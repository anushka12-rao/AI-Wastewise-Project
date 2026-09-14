const generationService = require('../../src/services/generationService');
const retrievalService = require('../../src/services/retrievalService');
const identificationService = require('../../src/services/identificationService');
const { orchestrateAnalysis } = require('../../src/services/wastewiseOrchestrator');
require('../setup');

describe('RAG Gating Enforcement Tests (Section 4 & 15)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('MANDATORY TEST: Granite generation is NEVER invoked when the retrieval gate fails', async () => {
    // 1. Mock identification to pass Gate 1
    jest.spyOn(identificationService, 'identifyWaste').mockResolvedValue({
      candidates: [{ category: 'CARDBOARD', confidence: 0.95 }],
      topCategory: 'CARDBOARD',
      topConfidence: 0.95
    });

    // 2. Mock retrieval to fail Gate 2 (e.g. low score or empty chunks)
    jest.spyOn(retrievalService, 'retrieveGuidance').mockResolvedValue({
      chunks: [],
      scores: [],
      topScore: 0.20 // Below 0.65 threshold
    });

    // 3. Spy on Granite generation function
    const generationSpy = jest.spyOn(generationService, 'generateGroundedGuidance');

    // 4. Run orchestrator
    const result = await orchestrateAnalysis({
      textDescription: 'clean cardboard box'
    });

    // 5. Assert outcome is COVERAGE_INSUFFICIENT
    expect(result.outcome).toBe('COVERAGE_INSUFFICIENT');

    // 6. STRICT ASSERTION: Granite generation was literally NEVER called
    expect(generationSpy).not.toHaveBeenCalled();
  });

  it('MANDATORY TEST: Retrieval AND Granite generation are NEVER invoked when Gate 1 fails', async () => {
    // Mock identification to fail Gate 1 (low confidence / UNCERTAIN)
    jest.spyOn(identificationService, 'identifyWaste').mockResolvedValue({
      candidates: [{ category: 'UNKNOWN', confidence: 0.30 }],
      topCategory: 'UNKNOWN',
      topConfidence: 0.30
    });

    const retrievalSpy = jest.spyOn(retrievalService, 'retrieveGuidance');
    const generationSpy = jest.spyOn(generationService, 'generateGroundedGuidance');

    const result = await orchestrateAnalysis({
      textDescription: 'unclear random dirty object'
    });

    expect(result.outcome).toBe('UNCERTAIN');

    // Neither retrieval nor generation should be called
    expect(retrievalSpy).not.toHaveBeenCalled();
    expect(generationSpy).not.toHaveBeenCalled();
  });
});
