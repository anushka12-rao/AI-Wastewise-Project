const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');
const validate = require('../middleware/validate');
const {
  knowledgeEntrySchema,
  updateKnowledgeEntrySchema
} = require('../validators/knowledgeEntryValidator');
const {
  getKnowledgeEntries,
  createKnowledgeEntry,
  updateKnowledgeEntry,
  deleteKnowledgeEntry,
  toggleVerifyKnowledgeEntry,
  getCategories,
  getJurisdictions,
  getQueryLogs
} = require('../controllers/adminController');

// All admin routes strictly enforce authentication & owner authorization
router.use(authenticate);
router.use(authorizeAdmin);

// Knowledge Base Management
router.get('/knowledge-entries', getKnowledgeEntries);
router.post('/knowledge-entries', validate(knowledgeEntrySchema), createKnowledgeEntry);
router.patch('/knowledge-entries/:id', validate(updateKnowledgeEntrySchema), updateKnowledgeEntry);
router.delete('/knowledge-entries/:id', deleteKnowledgeEntry);
router.patch('/knowledge-entries/:id/verify', toggleVerifyKnowledgeEntry);

// Metadata Views
router.get('/categories', getCategories);
router.get('/jurisdictions', getJurisdictions);

// Audit Logs View
router.get('/query-log', getQueryLogs);

module.exports = router;
