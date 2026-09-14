const { z } = require('zod');
const { PRIMARY_WASTE_STREAMS, WASTE_CATEGORIES } = require('../models/KnowledgeEntry');

const knowledgeEntrySchema = z.object({
  wasteCategory: z.enum(WASTE_CATEGORIES, {
    errorMap: () => ({ message: 'Invalid wasteCategory enum value' })
  }),
  wasteStream: z.enum(PRIMARY_WASTE_STREAMS, {
    errorMap: () => ({ message: 'Invalid wasteStream enum value' })
  }),
  jurisdiction: z.string().min(1, 'Jurisdiction is required'),
  guidanceText: z.string().min(5, 'Guidance text must be at least 5 characters'),
  sourceTitle: z.string().min(2, 'Source title is required'),
  sourceUrl: z.string().url('Source URL must be a valid URL'),
  sourceAuthority: z.string().optional(),
  verified: z.boolean().optional().default(false)
});

const updateKnowledgeEntrySchema = knowledgeEntrySchema.partial();

module.exports = {
  knowledgeEntrySchema,
  updateKnowledgeEntrySchema
};
