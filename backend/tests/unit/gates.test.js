const { identificationGate } = require('../../src/services/identificationService');
const { retrievalGate } = require('../../src/services/retrievalService');

describe('Sequential Gates Unit Tests', () => {
  describe('Gate 1: Identification Gate', () => {
    it('should fail when confidence is strictly below threshold (e.g. 0.69 vs 0.70)', () => {
      const result = identificationGate(0.69, 'CARDBOARD');
      expect(result.passed).toBe(false);
      expect(result.reason).toContain('below required threshold');
    });

    it('should pass when confidence equals or exceeds threshold (e.g. 0.70)', () => {
      const result = identificationGate(0.70, 'CARDBOARD');
      expect(result.passed).toBe(true);
      expect(result.topCategory).toBe('CARDBOARD');
    });

    it('should short-circuit to fail if category is UNKNOWN, even with high confidence', () => {
      const result = identificationGate(0.99, 'UNKNOWN');
      expect(result.passed).toBe(false);
      expect(result.topCategory).toBe('UNKNOWN');
      expect(result.reason).toContain('UNKNOWN');
    });

    it('should short-circuit to fail if category is empty or undefined', () => {
      const result = identificationGate(0.85, null);
      expect(result.passed).toBe(false);
    });
  });

  describe('Gate 2: Retrieval Gate', () => {
    it('should fail when topScore is strictly below threshold (e.g. 0.64 vs 0.65)', () => {
      const fakeChunks = [{ id: 'c1', text: 'Guidance text' }];
      const result = retrievalGate(0.64, fakeChunks);
      expect(result.passed).toBe(false);
      expect(result.reason).toContain('below coverage threshold');
    });

    it('should pass when topScore meets or exceeds threshold (e.g. 0.65)', () => {
      const fakeChunks = [{ id: 'c1', text: 'Guidance text' }];
      const result = retrievalGate(0.65, fakeChunks);
      expect(result.passed).toBe(true);
      expect(result.topScore).toBe(0.65);
    });

    it('should fail immediately when chunks array is empty', () => {
      const result = retrievalGate(0.95, []);
      expect(result.passed).toBe(false);
      expect(result.reason).toContain('No matching knowledge base documents found');
    });

    it('should verify identification confidence and retrieval score are independent and never combined', () => {
      // High ID confidence (0.95) does not rescue low retrieval score (0.40)
      const idGate = identificationGate(0.95, 'BATTERY');
      const retGate = retrievalGate(0.40, [{ id: '1', text: 'sample' }]);

      expect(idGate.passed).toBe(true);
      expect(retGate.passed).toBe(false);
      // Confidences remain separate numeric values
      expect(idGate.topConfidence).toBe(0.95);
      expect(retGate.topScore).toBe(0.40);
    });
  });
});
