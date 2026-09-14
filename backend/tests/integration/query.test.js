const request = require('supertest');
const app = require('../../src/app');
const { KnowledgeEntry } = require('../../src/models/KnowledgeEntry');
const { upsertVectorEntry } = require('../../src/services/vectorStoreService');
require('../setup');

describe('Integration: POST /api/query ("Ask WasteWise")', () => {
  beforeEach(async () => {
    const entry = await KnowledgeEntry.create({
      wasteCategory: 'BATTERY',
      wasteStream: 'SPECIAL_CARE_WASTE',
      jurisdiction: 'GENERAL_INDIA',
      guidanceText: 'Tape battery terminals with insulating tape. Never dispose of lithium batteries in regular trash. Drop off at authorized battery take-back centers.',
      sourceTitle: 'Battery Waste Management Rules 2022',
      sourceUrl: 'https://cpcb.nic.in/battery',
      sourceAuthority: 'MoEFCC / CPCB',
      verified: true
    });
    await upsertVectorEntry(entry);
  });

  it('should answer questions grounded in retrieved sources for known category', async () => {
    const res = await request(app)
      .post('/api/query')
      .send({
        question: 'How to safely store old lithium battery before disposal?',
        priorCategory: 'BATTERY'
      });

    expect(res.status).toBe(200);
    expect(res.body.outcome).toBe('CONFIDENT');
    expect(res.body.category).toBe('BATTERY');
    expect(res.body.wasteStream).toBe('SPECIAL_CARE_WASTE');
    expect(res.body.guidance).toBeDefined();
    expect(Array.isArray(res.body.sources)).toBe(true);
    expect(res.body.sources.length).toBeGreaterThan(0);
  });

  it('should reject questions that are too short (< 3 characters)', async () => {
    const res = await request(app)
      .post('/api/query')
      .send({
        question: 'hi'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });
});
