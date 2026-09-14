const { z } = require('zod');

const analyzeSchema = z.object({
  imageBase64: z.string().optional(),
  textDescription: z.string().max(500, 'Text description must be under 500 characters').optional(),
  jurisdiction: z.string().max(100).optional()
}).refine(data => data.imageBase64 || (data.textDescription && data.textDescription.trim().length > 0), {
  message: 'Either imageBase64 or textDescription must be provided'
});

module.exports = { analyzeSchema };
