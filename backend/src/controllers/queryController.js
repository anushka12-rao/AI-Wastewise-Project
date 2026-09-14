const { orchestrateQuery } = require('../services/wastewiseOrchestrator');
const logger = require('../utils/logger');

async function handleQuery(req, res, next) {
  try {
    const { question, priorCategory, priorSourceIds, jurisdiction } = req.body;

    logger.info('Received Ask WasteWise query', {
      questionSnippet: question ? question.slice(0, 40) : '',
      priorCategory,
      priorSourceCount: priorSourceIds ? priorSourceIds.length : 0
    });

    const result = await orchestrateQuery({
      question,
      priorCategory,
      priorSourceIds,
      jurisdiction: jurisdiction || 'GENERAL_INDIA'
    });

    return res.status(200).json(result);
  } catch (error) {
    logger.error('Query controller failure:', { error: error.message });
    return next(error);
  }
}

module.exports = { handleQuery };
