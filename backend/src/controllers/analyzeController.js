const { orchestrateAnalysis } = require('../services/wastewiseOrchestrator');
const logger = require('../utils/logger');

async function handleAnalyze(req, res, next) {
  try {
    const { imageBase64, textDescription, jurisdiction } = req.body;

    logger.info('Received analyze request', {
      hasImage: Boolean(imageBase64),
      hasText: Boolean(textDescription)
    });

    const result = await orchestrateAnalysis({
      imageBase64,
      textDescription,
      jurisdiction: jurisdiction || 'GENERAL_INDIA'
    });

    return res.status(200).json(result);
  } catch (error) {
    logger.error('Analyze controller failure:', { error: error.message });
    return next(error);
  }
}

module.exports = { handleAnalyze };
