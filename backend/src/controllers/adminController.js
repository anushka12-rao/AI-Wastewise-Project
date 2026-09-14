const { KnowledgeEntry, WASTE_CATEGORIES, PRIMARY_WASTE_STREAMS } = require('../models/KnowledgeEntry');
const { QueryLog } = require('../models/QueryLog');
const { upsertVectorEntry, deleteVectorEntry } = require('../services/vectorStoreService');
const logger = require('../utils/logger');

/**
 * GET /api/admin/knowledge-entries
 */
async function getKnowledgeEntries(req, res, next) {
  try {
    const { wasteCategory, wasteStream, jurisdiction, verified, search, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (wasteCategory) filter.wasteCategory = wasteCategory;
    if (wasteStream) filter.wasteStream = wasteStream;
    if (jurisdiction) filter.jurisdiction = jurisdiction;
    if (verified !== undefined && verified !== '') {
      filter.verified = verified === 'true';
    }
    if (search) {
      filter.$or = [
        { guidanceText: { $regex: search, $options: 'i' } },
        { sourceTitle: { $regex: search, $options: 'i' } },
        { wasteCategory: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [entries, total] = await Promise.all([
      KnowledgeEntry.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      KnowledgeEntry.countDocuments(filter)
    ]);

    return res.status(200).json({
      entries,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/admin/knowledge-entries
 */
async function createKnowledgeEntry(req, res, next) {
  try {
    const entry = await KnowledgeEntry.create(req.body);

    // Synchronize to LanceDB immediately
    try {
      await upsertVectorEntry(entry);
    } catch (vErr) {
      logger.warn('LanceDB vector upsert error on create:', { error: vErr.message });
    }

    return res.status(201).json({
      success: true,
      entry
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /api/admin/knowledge-entries/:id
 */
async function updateKnowledgeEntry(req, res, next) {
  try {
    const { id } = req.params;
    const entry = await KnowledgeEntry.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!entry) {
      return res.status(404).json({ error: 'NotFound', message: 'Knowledge entry not found' });
    }

    // Re-index in LanceDB
    try {
      await upsertVectorEntry(entry);
    } catch (vErr) {
      logger.warn('LanceDB vector update error on edit:', { error: vErr.message });
    }

    return res.status(200).json({
      success: true,
      entry
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /api/admin/knowledge-entries/:id
 */
async function deleteKnowledgeEntryHandler(req, res, next) {
  try {
    const { id } = req.params;
    const entry = await KnowledgeEntry.findByIdAndDelete(id);

    if (!entry) {
      return res.status(404).json({ error: 'NotFound', message: 'Knowledge entry not found' });
    }

    // Remove from LanceDB
    try {
      await deleteVectorEntry(id);
    } catch (vErr) {
      logger.warn('LanceDB vector deletion error:', { error: vErr.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Knowledge entry deleted and removed from vector store'
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /api/admin/knowledge-entries/:id/verify
 */
async function toggleVerifyKnowledgeEntry(req, res, next) {
  try {
    const { id } = req.params;
    const entry = await KnowledgeEntry.findById(id);

    if (!entry) {
      return res.status(404).json({ error: 'NotFound', message: 'Knowledge entry not found' });
    }

    entry.verified = !entry.verified;
    await entry.save();

    // Re-index verified flag in LanceDB
    try {
      await upsertVectorEntry(entry);
    } catch (vErr) {
      logger.warn('LanceDB vector update error on verify:', { error: vErr.message });
    }

    return res.status(200).json({
      success: true,
      entry
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/admin/categories
 */
async function getCategories(req, res) {
  return res.status(200).json({
    categories: WASTE_CATEGORIES,
    streams: PRIMARY_WASTE_STREAMS
  });
}

/**
 * GET /api/admin/jurisdictions
 */
async function getJurisdictions(req, res, next) {
  try {
    const distinct = await KnowledgeEntry.distinct('jurisdiction');
    if (!distinct.includes('GENERAL_INDIA')) {
      distinct.unshift('GENERAL_INDIA');
    }
    return res.status(200).json({ jurisdictions: distinct });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/admin/query-log
 */
async function getQueryLogHandler(req, res, next) {
  try {
    const { outcome, type, limit = 50 } = req.query;
    const filter = {};

    if (outcome) filter.outcome = outcome;
    if (type) filter.type = type;

    const logs = await QueryLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    return res.status(200).json({ logs });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getKnowledgeEntries,
  createKnowledgeEntry,
  updateKnowledgeEntry,
  deleteKnowledgeEntry: deleteKnowledgeEntryHandler,
  toggleVerifyKnowledgeEntry,
  getCategories,
  getJurisdictions,
  getQueryLogs: getQueryLogHandler
};
