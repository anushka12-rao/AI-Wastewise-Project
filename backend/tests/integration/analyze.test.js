const request = require('supertest');
const app = require('../../src/app');
const { KnowledgeEntry } = require('../../src/models/KnowledgeEntry');
const { upsertVectorEntry } = require('../../src/services/vectorStoreService');
require('../setup');

describe('Integration: POST /api/analyze', () => {
  beforeEach(async () => {
    // Seed one verified knowledge entry in DB & LanceDB for testing
    const entry = await KnowledgeEntry.create({
      wasteCategory: 'CARDBOARD',
      wasteStream: 'DRY_WASTE',
      jurisdiction: 'GENERAL_INDIA',
      guidanceText: 'Flatten corrugated cardboard boxes and place in the Blue Dry Waste bin.',
      sourceTitle: 'Swachh Bharat Dry Waste Advisory',
      sourceUrl: 'https://cpcb.nic.in/cardboard',
      sourceAuthority: 'MoHUA',
      verified: true
    });
    await upsertVectorEntry(entry);
  });

  it('should return CONFIDENT when item is clearly identified and retrieval passes', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        textDescription: 'clean corrugated cardboard packing box',
        jurisdiction: 'GENERAL_INDIA'
      });

    expect(res.status).toBe(200);
    expect(res.body.outcome).toBe('CONFIDENT');
    expect(res.body.category).toBe('CARDBOARD');
    expect(res.body.wasteStream).toBe('DRY_WASTE');
    expect(res.body.guidance).toBeDefined();
    expect(Array.isArray(res.body.sources)).toBe(true);
    expect(res.body.sources.length).toBeGreaterThan(0);
  });

  it('should return UNCERTAIN when item description is vague and Gate 1 fails', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        textDescription: 'uncertain random unclear item'
      });

    expect(res.status).toBe(200);
    expect(res.body.outcome).toBe('UNCERTAIN');
    expect(res.body.topConfidence).toBeLessThan(0.70);
    expect(res.body.message).toContain('below required threshold');
  });

  it('should reject requests with 400 when neither image nor text is provided', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });
});
