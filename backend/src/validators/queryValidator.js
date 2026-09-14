const { z } = require('zod');

const querySchema = z.object({
  question: z.string().min(3, 'Question must be at least 3 characters').max(500, 'Question must be under 500 characters'),
  priorCategory: z.string().optional(),
  priorSourceIds: z.array(z.string()).optional(),
  jurisdiction: z.string().max(100).optional()
});

module.exports = { querySchema };
