const path = require('path');
const fs = require('fs');
const lancedb = require('@lancedb/lancedb');
const env = require('../config/environment');
const { generateEmbedding, EMBEDDING_DIM } = require('./embeddingService');
const logger = require('../utils/logger');

const TABLE_NAME = 'waste_guidance';
let dbInstance = null;
let tableInstance = null;

async function getDatabase() {
  if (dbInstance) return dbInstance;

  const dbPath = path.resolve(env.LANCEDB_PATH);
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }

  dbInstance = await lancedb.connect(dbPath);
  return dbInstance;
}

async function getTable() {
  if (tableInstance) return tableInstance;

  const db = await getDatabase();
  const tableNames = await db.tableNames();

  if (tableNames.includes(TABLE_NAME)) {
    tableInstance = await db.openTable(TABLE_NAME);
  } else {
    // Initialize with a seed schema row
    const dummyVector = new Array(EMBEDDING_DIM).fill(0.01);
    const initialRow = {
      id: 'init_schema_marker',
      knowledgeEntryId: '000000000000000000000000',
      text: 'Initial LanceDB schema initialization marker',
      wasteCategory: 'UNKNOWN',
      wasteStream: 'DRY_WASTE',
      jurisdiction: 'GENERAL_INDIA',
      sourceTitle: 'Init Marker',
      sourceUrl: 'https://cpcb.nic.in',
      sourceAuthority: 'Init',
      verified: false,
      vector: dummyVector
    };

    tableInstance = await db.createTable(TABLE_NAME, [initialRow], { mode: 'overwrite' });
    logger.info(`Initialized new LanceDB table: ${TABLE_NAME}`);
  }

  return tableInstance;
}

/**
 * Upsert a knowledge entry into LanceDB
 */
async function upsertVectorEntry(knowledgeEntry) {
  try {
    const table = await getTable();
    const entryId = knowledgeEntry._id ? knowledgeEntry._id.toString() : knowledgeEntry.id;
    
    // Generate embedding from category + jurisdiction + guidance text
    const textToEmbed = `${knowledgeEntry.wasteCategory} (${knowledgeEntry.wasteStream}) in ${knowledgeEntry.jurisdiction}: ${knowledgeEntry.guidanceText}`;
    const vector = await generateEmbedding(textToEmbed);

    const record = {
      id: entryId,
      knowledgeEntryId: entryId,
      text: knowledgeEntry.guidanceText,
      wasteCategory: knowledgeEntry.wasteCategory,
      wasteStream: knowledgeEntry.wasteStream,
      jurisdiction: knowledgeEntry.jurisdiction || 'GENERAL_INDIA',
      sourceTitle: knowledgeEntry.sourceTitle,
      sourceUrl: knowledgeEntry.sourceUrl,
      sourceAuthority: knowledgeEntry.sourceAuthority || 'Official ULB Authority',
      verified: Boolean(knowledgeEntry.verified),
      vector: vector
    };

    // Delete existing if present, then add new
    try {
      await table.delete(`"knowledgeEntryId" = '${entryId}'`);
    } catch {
      // Ignore if table doesn't support delete yet or row doesn't exist
    }

    await table.add([record]);
    logger.info(`Indexed knowledge entry [${entryId}] in LanceDB`);
    return record;
  } catch (err) {
    logger.error('Failed to upsert knowledge entry to LanceDB:', { error: err.message });
    throw err;
  }
}

/**
 * Delete a knowledge entry from LanceDB
 */
async function deleteVectorEntry(knowledgeEntryId) {
  try {
    const table = await getTable();
    const entryId = knowledgeEntryId.toString();
    await table.delete(`\`knowledgeEntryId\` = '${entryId}'`);
    logger.info(`Deleted entry [${entryId}] from LanceDB`);
  } catch (err) {
    logger.error('Failed to delete entry from LanceDB:', { error: err.message });
  }
}

/**
 * Search LanceDB with metadata filtering first, then vector similarity
 */
async function searchVectorStore(queryText, options = {}) {
  const { category, jurisdiction, limit = 5 } = options;
  const table = await getTable();

  const queryVector = await generateEmbedding(queryText || category || '');

  // Perform vector search
  let queryBuilder = table.vectorSearch(queryVector).limit(limit * 5);

  // Metadata filtering by category if provided
  if (category && category !== 'UNKNOWN') {
    try {
      queryBuilder = queryBuilder.where(`\`wasteCategory\` = '${category}'`);
    } catch {
      // If where clause builder fails, we will filter in memory
    }
  }

  let results = [];
  try {
    results = await queryBuilder.toArray();
  } catch {
    // If LanceDB where clause parser errors, fall back to pure vector search then in-memory filter
    results = await table.vectorSearch(queryVector).limit(limit * 5).toArray();
  }

  // In-memory filter and score normalization
  // Exclude schema initialization row
  let filtered = results.filter(r => r.id !== 'init_schema_marker');

  if (category && category !== 'UNKNOWN') {
    filtered = filtered.filter(r => r.wasteCategory === category);
  }

  if (jurisdiction) {
    // If specific jurisdiction is requested, prioritize it, otherwise allow GENERAL_INDIA fallback
    const jurisdictionMatches = filtered.filter(r => r.jurisdiction === jurisdiction);
    if (jurisdictionMatches.length > 0) {
      filtered = jurisdictionMatches;
    }
  }

  // LanceDB returns _distance (L2 distance) between normalized unit vectors
  // Cosine similarity = 1 - (dist^2)/2 in range [-1, 1]
  const scored = filtered.map(row => {
    const dist = typeof row._distance === 'number' ? row._distance : 1.0;
    const cosineSim = Math.max(-1, Math.min(1, 1 - (dist * dist) / 2));
    
    // When metadata filter matches the verified wasteCategory, ground baseline at 0.72
    let score;
    if (category && row.wasteCategory === category) {
      score = Math.min(1.0, 0.72 + 0.25 * Math.max(0, cosineSim));
    } else {
      score = Math.max(0, (cosineSim + 1) / 2);
    }
    
    return {
      ...row,
      score: Number(score.toFixed(4))
    };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

/**
 * Sync all documents from MongoDB to LanceDB
 */
async function syncAllToVectorStore() {
  const { KnowledgeEntry } = require('../models/KnowledgeEntry');
  const entries = await KnowledgeEntry.find({});
  logger.info(`Syncing ${entries.length} MongoDB KnowledgeEntry docs to LanceDB...`);

  const records = [];
  for (const entry of entries) {
    const textToEmbed = `${entry.wasteCategory} (${entry.wasteStream}) in ${entry.jurisdiction}: ${entry.guidanceText}`;
    const vector = await generateEmbedding(textToEmbed);

    records.push({
      id: entry._id.toString(),
      knowledgeEntryId: entry._id.toString(),
      text: entry.guidanceText,
      wasteCategory: entry.wasteCategory,
      wasteStream: entry.wasteStream,
      jurisdiction: entry.jurisdiction || 'GENERAL_INDIA',
      sourceTitle: entry.sourceTitle,
      sourceUrl: entry.sourceUrl,
      sourceAuthority: entry.sourceAuthority || 'Official ULB Authority',
      verified: Boolean(entry.verified),
      vector: vector
    });
  }

  if (records.length > 0) {
    const db = await getDatabase();
    tableInstance = await db.createTable(TABLE_NAME, records, { mode: 'overwrite' });
    logger.info(`Successfully synced ${records.length} records to LanceDB table [${TABLE_NAME}]`);
  }

  return records.length;
}

module.exports = {
  getDatabase,
  getTable,
  upsertVectorEntry,
  deleteVectorEntry,
  searchVectorStore,
  syncAllToVectorStore
};
