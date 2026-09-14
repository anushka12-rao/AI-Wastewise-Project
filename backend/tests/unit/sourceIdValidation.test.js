const { validateClientSourceIds } = require('../../src/services/wastewiseOrchestrator');
const { validateGraniteCitations } = require('../../src/services/generationService');

describe('Source-ID Validation Security Tests (Section 6 & 7)', () => {
  const validServerRetrievedIds = ['kb_entry_cardboard_01', 'kb_entry_cardboard_02'];
  const retrievedChunks = [
    { id: 'kb_entry_cardboard_01', knowledgeEntryId: 'kb_entry_cardboard_01', text: 'Cardboard recycling guidance' },
    { id: 'kb_entry_cardboard_02', knowledgeEntryId: 'kb_entry_cardboard_02', text: 'Secondary cardboard packing guidance' }
  ];

  describe('validateClientSourceIds', () => {
    it('should discard client-supplied IDs if any fabricated ID is included', () => {
      const fabricatedClientIds = ['kb_entry_cardboard_01', 'fake_fabricated_malicious_id_999'];
      
      const result = validateClientSourceIds(fabricatedClientIds, validServerRetrievedIds);
      
      // Fabricated ID must not appear; fallback to server-derived set
      expect(result).not.toContain('fake_fabricated_malicious_id_999');
      expect(result).toEqual(validServerRetrievedIds);
    });

    it('should discard completely fabricated client-supplied IDs', () => {
      const completelyFakeIds = ['hacker_injected_id_1', 'hacker_injected_id_2'];
      
      const result = validateClientSourceIds(completelyFakeIds, validServerRetrievedIds);
      
      expect(result).not.toContain('hacker_injected_id_1');
      expect(result).not.toContain('hacker_injected_id_2');
      expect(result).toEqual(validServerRetrievedIds);
    });

    it('should accept client IDs when they are a strict valid subset of server IDs', () => {
      const validSubset = ['kb_entry_cardboard_01'];
      
      const result = validateClientSourceIds(validSubset, validServerRetrievedIds);
      
      expect(result).toEqual(['kb_entry_cardboard_01']);
    });

    it('should return server-retrieved IDs when client supplies no IDs', () => {
      const result = validateClientSourceIds([], validServerRetrievedIds);
      expect(result).toEqual(validServerRetrievedIds);
    });
  });

  describe('validateGraniteCitations', () => {
    it('should strip hallucinated or out-of-scope IDs produced by LLM output', () => {
      const hallucinatedGraniteIds = ['kb_entry_cardboard_01', 'hallucinated_granite_id_xyz'];
      
      const result = validateGraniteCitations(hallucinatedGraniteIds, retrievedChunks);
      
      expect(result).not.toContain('hallucinated_granite_id_xyz');
      expect(result).toContain('kb_entry_cardboard_01');
    });

    it('should fallback to all server retrieved IDs if Granite produces only invalid citations', () => {
      const completelyInvalidGraniteIds = ['invalid_1', 'invalid_2'];
      
      const result = validateGraniteCitations(completelyInvalidGraniteIds, retrievedChunks);
      
      expect(result).toEqual(['kb_entry_cardboard_01', 'kb_entry_cardboard_02']);
    });
  });
});
