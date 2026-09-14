/**
 * Sanitization utility for user input to defend against prompt injection
 * and illegal control characters.
 */
function sanitizeUserInput(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    // Replace dangerous prompt injection override sequences
    .replace(/ignore\s+(previous|all)\s+instructions/gi, '[filtered-directive]')
    .replace(/system\s*prompt/gi, '[filtered-directive]')
    .replace(/you\s+are\s+now/gi, '[filtered-directive]')
    // Remove control characters except normal whitespace
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

module.exports = { sanitizeUserInput };
