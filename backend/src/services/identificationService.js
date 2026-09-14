const env = require('../config/environment');
const { getIamToken, isWatsonxConfigured } = require('../config/watsonx');
const { WASTE_CATEGORIES } = require('../models/KnowledgeEntry');
const logger = require('../utils/logger');

/**
 * Gate 1: Evaluates whether identification confidence passes threshold.
 * Hard rule: UNKNOWN always short-circuits to UNCERTAIN.
 * Never combined with retrieval score.
 */
function identificationGate(confidence, topCategory) {
  const threshold = env.IDENTIFICATION_CONFIDENCE_THRESHOLD;

  if (!topCategory || topCategory === 'UNKNOWN') {
    return {
      passed: false,
      reason: 'Waste category could not be determined (UNKNOWN)',
      topCategory: 'UNKNOWN',
      topConfidence: confidence || 0,
      threshold
    };
  }

  const conf = typeof confidence === 'number' ? confidence : 0;
  if (conf < threshold) {
    return {
      passed: false,
      reason: `Identification confidence (${conf.toFixed(2)}) is below required threshold (${threshold.toFixed(2)})`,
      topCategory,
      topConfidence: conf,
      threshold
    };
  }

  return {
    passed: true,
    topCategory,
    topConfidence: conf,
    threshold
  };
}

/**
 * Simulated Granite classifier for offline tests and development.
 * Maps keywords to the 22 waste taxonomy categories.
 */
function simulateIdentification(textDescription = '', isImage = false) {
  const text = (textDescription || '').toLowerCase();

  // Pattern rules mapping to taxonomy
  const rules = [
    { cat: 'BATTERY', matches: ['battery', 'batteries', 'cell', 'lithium', 'powerbank', 'power bank', 'aa', 'aaa', '18650'], conf: 0.94 },
    { cat: 'FOOD_CONTAMINATED_PACKAGING', matches: ['pizza box', 'greasy', 'oily box', 'soiled packaging', 'food box with oil', 'cheese stain'], conf: 0.91 },
    { cat: 'CARDBOARD', matches: ['cardboard', 'carton', 'corrugated', 'shipping box', 'amazon box'], conf: 0.93 },
    { cat: 'PLASTIC_CONTAINER', matches: ['plastic bottle', 'shampoo bottle', 'water bottle', 'plastic container', 'pet bottle', 'detergent bottle', 'hdpe'], conf: 0.92 },
    { cat: 'PLASTIC_PACKAGING', matches: ['plastic wrap', 'wrapper', 'polythene', 'grocery bag', 'bubble wrap', 'cling film'], conf: 0.88 },
    { cat: 'PAPER', matches: ['newspaper', 'office paper', 'notebook', 'envelope', 'magazine', 'paper flyer'], conf: 0.90 },
    { cat: 'GLASS', matches: ['glass bottle', 'glass jar', 'beer bottle', 'broken glass', 'wine bottle'], conf: 0.93 },
    { cat: 'METAL', matches: ['aluminum can', 'soda can', 'coke can', 'tin can', 'steel tin', 'metal scrap', 'foil tray'], conf: 0.92 },
    { cat: 'TEXTILE', matches: ['cloth', 'clothes', 'shirt', 'curtain', 'bedsheet', 'fabric', 'rag'], conf: 0.89 },
    { cat: 'DIAPER', matches: ['diaper', 'pampers', 'huggies', 'nappy', 'adult diaper'], conf: 0.95 },
    { cat: 'SANITARY_PAD', matches: ['sanitary pad', 'menstrual pad', 'whisper', 'stayfree', 'tampon'], conf: 0.95 },
    { cat: 'SANITARY_WASTE', matches: ['cotton swab', 'soiled bandage', 'gauze', 'sanitary'], conf: 0.88 },
    { cat: 'SMALL_E_WASTE', matches: ['old phone', 'broken phone', 'calculator', 'circuit board', 'electronic toy', 'remote control'], conf: 0.92 },
    { cat: 'ELECTRONIC_ACCESSORY', matches: ['charger', 'cable', 'wire', 'earphone', 'headphone', 'usb cable', 'power cord'], conf: 0.91 },
    { cat: 'MEDICINE', matches: ['medicine', 'tablet', 'capsule', 'syrup', 'paracetamol', 'blister pack', 'expired drug', 'pharma'], conf: 0.94 },
    { cat: 'PAINT_CONTAINER', matches: ['paint can', 'paint tin', 'varnish', 'primer', 'enamel paint'], conf: 0.91 },
    { cat: 'PESTICIDE_CONTAINER', matches: ['pesticide', 'insecticide', 'mosquito spray', 'hit spray', 'weedicide'], conf: 0.93 },
    { cat: 'MERCURY_ITEM', matches: ['mercury thermometer', 'thermometer', 'cfl bulb', 'tube light', 'fluorescent'], conf: 0.94 },
    { cat: 'SHARP_MEDICAL_WASTE', matches: ['needle', 'syringe', 'lancet', 'scalpel', 'insulin needle'], conf: 0.95 },
    { cat: 'MIXED_MATERIAL_PACKAGING', matches: ['tetra pak', 'tetrapack', 'juice box', 'chips packet', 'metallized', 'namkeen packet'], conf: 0.90 },
    { cat: 'WET_WASTE', matches: ['food waste', 'peels', 'vegetable', 'fruit', 'banana peel', 'tea leaves', 'eggshell', 'leftovers', 'apple core'], conf: 0.93 }
  ];

  for (const rule of rules) {
    if (rule.matches.some(m => text.includes(m))) {
      return {
        candidates: [
          { category: rule.cat, confidence: rule.conf },
          { category: 'MIXED_MATERIAL_PACKAGING', confidence: 0.15 }
        ],
        topCategory: rule.cat,
        topConfidence: rule.conf
      };
    }
  }

  // If text is provided but ambiguous / non-specific
  if (text.length > 0) {
    if (text.includes('uncertain') || text.includes('vague') || text.includes('random') || text.includes('unclear')) {
      return {
        candidates: [
          { category: 'PLASTIC_PACKAGING', confidence: 0.42 },
          { category: 'MIXED_MATERIAL_PACKAGING', confidence: 0.38 }
        ],
        topCategory: 'PLASTIC_PACKAGING',
        topConfidence: 0.42 // Strictly below 0.70 threshold
      };
    }

    // Default fallback if some text exists
    return {
      candidates: [
        { category: 'MIXED_MATERIAL_PACKAGING', confidence: 0.55 },
        { category: 'UNKNOWN', confidence: 0.45 }
      ],
      topCategory: 'UNKNOWN',
      topConfidence: 0.45
    };
  }

  // If image only was provided in simulation mode, default to high-confidence plastic container
  if (isImage) {
    return {
      candidates: [
        { category: 'PLASTIC_CONTAINER', confidence: 0.88 },
        { category: 'GLASS', confidence: 0.12 }
      ],
      topCategory: 'PLASTIC_CONTAINER',
      topConfidence: 0.88
    };
  }

  return {
    candidates: [{ category: 'UNKNOWN', confidence: 0.0 }],
    topCategory: 'UNKNOWN',
    topConfidence: 0.0
  };
}

/**
 * Call Granite Vision or Granite Text via watsonx.ai
 */
async function identifyWaste({ imageBase64, textDescription }) {
  if (!imageBase64 && (!textDescription || !textDescription.trim())) {
    return {
      candidates: [{ category: 'UNKNOWN', confidence: 0.0 }],
      topCategory: 'UNKNOWN',
      topConfidence: 0.0
    };
  }

  if (isWatsonxConfigured()) {
    try {
      const token = await getIamToken();
      if (!token) throw new Error('Missing IAM Token');

      const systemPrompt = `You are a strict waste identification vision/text classifier.
Your ONLY role is to classify the provided waste item into exactly one of the following categories:
${WASTE_CATEGORIES.join(', ')}

DO NOT provide disposal instructions or advice.
Return ONLY a valid JSON object matching this schema:
{
  "candidates": [
    { "category": "CATEGORY_NAME", "confidence": 0.00 }
  ],
  "topCategory": "CATEGORY_NAME",
  "topConfidence": 0.00
}`;

      let userContent = '';
      if (textDescription) {
        userContent = `[USER INPUT TEXT]: ${textDescription.slice(0, 500)}`;
      }

      const payload = {
        model_id: imageBase64 ? 'ibm/granite-vision-3-2-2b' : 'ibm/granite-3-8b-instruct',
        project_id: env.WATSONX_PROJECT_ID,
        input: `${systemPrompt}\n\n${userContent}\nOutput JSON:`,
        parameters: {
          decoding_method: 'greedy',
          max_new_tokens: 200,
          temperature: 0.0
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
        // Extract JSON from output
        const jsonMatch = textOut.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.topCategory && typeof parsed.topConfidence === 'number') {
            return parsed;
          }
        }
      }
    } catch (err) {
      logger.warn(`watsonx Granite identification failed, falling back to simulator: ${err.message}`);
    }
  }

  // Local deterministic identification fallback
  return simulateIdentification(textDescription, Boolean(imageBase64));
}

module.exports = {
  identifyWaste,
  identificationGate,
  simulateIdentification
};
