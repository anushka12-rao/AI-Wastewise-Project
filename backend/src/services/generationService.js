const env = require('../config/environment');
const { getIamToken, isWatsonxConfigured } = require('../config/watsonx');
const logger = require('../utils/logger');

/**
 * Validate citedSourceIds against server-derived retrieved chunk IDs.
 * Granite LLM output is treated as untrusted input.
 */
function validateGraniteCitations(citedSourceIds, retrievedChunks) {
  if (!Array.isArray(citedSourceIds)) {
    return retrievedChunks.map(c => c.id || c.knowledgeEntryId);
  }

  const validServerIds = new Set(retrievedChunks.map(c => String(c.id || c.knowledgeEntryId)));
  
  // Filter only those cited IDs that actually exist in the retrieved chunks
  const validated = citedSourceIds
    .map(String)
    .filter(id => validServerIds.has(id));

  // If Granite failed to cite valid IDs or hallucinated fake ones, default to all server-retrieved IDs
  if (validated.length === 0 && retrievedChunks.length > 0) {
    return retrievedChunks.map(c => c.id || c.knowledgeEntryId);
  }

  return validated;
}

/**
 * Generate grounded disposal guidance using IBM Granite text model
 */
async function generateGroundedGuidance({ category, jurisdiction, retrievedChunks, userContext }) {
  if (!retrievedChunks || retrievedChunks.length === 0) {
    throw new Error('Cannot generate grounded guidance without retrieved chunks');
  }

  const evidenceText = retrievedChunks.map((chunk, idx) => {
    const id = chunk.id || chunk.knowledgeEntryId;
    return `[Evidence Source ${idx + 1}] (ID: ${id}):\n${chunk.text}\nSource: ${chunk.sourceTitle} (${chunk.sourceUrl})`;
  }).join('\n\n');

  const systemPrompt = `You are AI WasteWise, an expert waste segregation assistant.
STRICT GROUNDING INSTRUCTION:
- You must answer ONLY from the provided evidence below.
- NEVER invent, infer, or introduce disposal methods or rules not explicitly stated in the evidence.
- If the evidence is incomplete, explicitly state what is unknown.
- Do NOT mention anything outside the retrieved evidence.
- Output MUST be a valid JSON object matching this exact schema:
{
  "guidance": "Concise, step-by-step practical disposal instructions based ONLY on evidence",
  "reasoning": "Brief explanation of why this waste stream/category was selected",
  "cautionNotes": "Specific safety/contamination precautions found in the evidence",
  "citedSourceIds": ["Exact ID strings from the Evidence Sources used"]
}`;

  const userPrompt = `Target Waste Category: ${category}
Jurisdiction: ${jurisdiction}
${userContext ? `User Query Context: ${userContext}\n` : ''}
RETRIEVED GROUNDING EVIDENCE:
${evidenceText}

Generate strict grounded JSON:`;

  if (isWatsonxConfigured()) {
    try {
      const token = await getIamToken();
      if (!token) throw new Error('Missing IAM Token');

      const payload = {
        model_id: 'ibm/granite-3-8b-instruct',
        project_id: env.WATSONX_PROJECT_ID,
        input: `${systemPrompt}\n\n${userPrompt}`,
        parameters: {
          decoding_method: 'greedy',
          max_new_tokens: 500,
          temperature: 0.1
        }
      };

      const response = await fetch(`${env.WATSONX_URL}/ml/v1/text/generation?version=2023-05-29`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const textOut = data.results?.[0]?.generated_text || '';
        const jsonMatch = textOut.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const validatedIds = validateGraniteCitations(parsed.citedSourceIds, retrievedChunks);
          return {
            guidance: parsed.guidance || retrievedChunks[0].text,
            reasoning: parsed.reasoning || `Classified as ${category} according to Indian municipal waste rules.`,
            cautionNotes: parsed.cautionNotes || 'Segregate at source; avoid mixing with unauthorized waste streams.',
            citedSourceIds: validatedIds
          };
        }
      }
    } catch (err) {
      logger.warn(`watsonx Granite generation failed, using grounded synthesis fallback: ${err.message}`);
    }
  }

  // Grounded synthesis fallback (uses verbatim text and strict evidence from retrieved chunks)
  const primaryChunk = retrievedChunks[0];
  const allIds = retrievedChunks.map(c => c.id || c.knowledgeEntryId);

  return {
    guidance: primaryChunk.text,
    reasoning: `Item classified under ${category} (${primaryChunk.wasteStream}) per ${primaryChunk.sourceAuthority || 'CPCB/SBM'} guidelines.`,
    cautionNotes: primaryChunk.wasteStream === 'SPECIAL_CARE_WASTE' || primaryChunk.wasteStream === 'SANITARY_WASTE'
      ? 'Handle with care: wrap or store securely to protect sanitation workers and prevent environmental contamination.'
      : 'Keep item clean and dry to ensure maximum recycling yield at secondary recovery facilities.',
    citedSourceIds: allIds
  };
}

module.exports = {
  generateGroundedGuidance,
  validateGraniteCitations
};
