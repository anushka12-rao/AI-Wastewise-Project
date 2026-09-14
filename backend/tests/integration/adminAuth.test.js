const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const { AdminUser } = require('../../src/models/AdminUser');
const { KnowledgeEntry } = require('../../src/models/KnowledgeEntry');
const env = require('../../src/config/environment');
require('../setup');

describe('Integration: Admin Security & Auth Endpoints', () => {
  let validAdminCookie = '';
  let nonOwnerCookie = '';
  let sampleEntryId = '';

  beforeEach(async () => {
    // 1. Seed Admin User
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('AdminSecret#2026', salt);
    const admin = await AdminUser.create({
      email: 'admin@wastewise.org',
      passwordHash
    });

    // 2. Generate valid admin token
    const adminToken = jwt.sign(
      { userId: admin._id.toString(), email: admin.email, role: 'admin' },
      env.SESSION_SECRET,
      { expiresIn: '1h' }
    );
    validAdminCookie = `wastewise_session=${adminToken}`;

    // 3. Generate non-owner token (role: 'user')
    const nonOwnerToken = jwt.sign(
      { userId: 'fake_user_123', email: 'user@test.org', role: 'user' },
      env.SESSION_SECRET,
      { expiresIn: '1h' }
    );
    nonOwnerCookie = `wastewise_session=${nonOwnerToken}`;

    // 4. Create sample KnowledgeEntry
    const entry = await KnowledgeEntry.create({
      wasteCategory: 'GLASS',
      wasteStream: 'DRY_WASTE',
      jurisdiction: 'GENERAL_INDIA',
      guidanceText: 'Rinse glass bottles and jars clean.',
      sourceTitle: 'Glass Guideline',
      sourceUrl: 'https://cpcb.nic.in/glass',
      verified: false
    });
    sampleEntryId = entry._id.toString();
  });

  describe('Strict 401 & 403 Security Boundaries on Every Admin Endpoint', () => {
    const adminEndpoints = [
      { method: 'get', path: '/api/admin/knowledge-entries' },
      { method: 'post', path: '/api/admin/knowledge-entries', body: { wasteCategory: 'METAL' } },
      { method: 'patch', path: () => `/api/admin/knowledge-entries/${sampleEntryId}` },
      { method: 'delete', path: () => `/api/admin/knowledge-entries/${sampleEntryId}` },
      { method: 'patch', path: () => `/api/admin/knowledge-entries/${sampleEntryId}/verify` },
      { method: 'get', path: '/api/admin/categories' },
      { method: 'get', path: '/api/admin/jurisdictions' },
      { method: 'get', path: '/api/admin/query-log' }
    ];

    test.each(adminEndpoints)('$method $path should return 401 with no session', async (endpoint) => {
      const url = typeof endpoint.path === 'function' ? endpoint.path() : endpoint.path;
      const req = request(app)[endpoint.method](url);
      if (endpoint.body) req.send(endpoint.body);

      const res = await req;
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    test.each(adminEndpoints)('$method $path should return 403 with non-owner session', async (endpoint) => {
      const url = typeof endpoint.path === 'function' ? endpoint.path() : endpoint.path;
      const req = request(app)[endpoint.method](url).set('Cookie', nonOwnerCookie);
      if (endpoint.body) req.send(endpoint.body);

      const res = await req;
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
    });
  });

  describe('Admin Happy Paths (Authenticated & Authorized)', () => {
    it('should allow admin login and issue HttpOnly cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@wastewise.org',
          password: 'AdminSecret#2026'
        });

      expect(res.status).toBe(200);
      expect(res.body.authenticated).toBe(true);
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toContain('HttpOnly');
    });

    it('should reject invalid password with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@wastewise.org',
          password: 'WrongPassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should allow admin to list knowledge entries', async () => {
      const res = await request(app)
        .get('/api/admin/knowledge-entries')
        .set('Cookie', validAdminCookie);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.entries)).toBe(true);
      expect(res.body.total).toBe(1);
    });

    it('should allow admin to toggle verification status', async () => {
      const res = await request(app)
        .patch(`/api/admin/knowledge-entries/${sampleEntryId}/verify`)
        .set('Cookie', validAdminCookie);

      expect(res.status).toBe(200);
      expect(res.body.entry.verified).toBe(true);
    });

    it('should allow admin to delete knowledge entry', async () => {
      const res = await request(app)
        .delete(`/api/admin/knowledge-entries/${sampleEntryId}`)
        .set('Cookie', validAdminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await KnowledgeEntry.findById(sampleEntryId);
      expect(check).toBeNull();
    });
  });
});
