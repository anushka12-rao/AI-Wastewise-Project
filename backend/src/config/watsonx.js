const env = require('./environment');
const logger = require('../utils/logger');

let iamToken = null;
let tokenExpiresAt = 0;

/**
 * Obtain or refresh IBM IAM OAuth token for watsonx.ai
 */
async function getIamToken() {
  if (!env.WATSONX_API_KEY) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (iamToken && now < tokenExpiresAt - 300) {
    return iamToken;
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'urn:ibm:params:oauth:grant-type:apikey');
    params.append('apikey', env.WATSONX_API_KEY);

    const res = await fetch('https://iam.cloud.ibm.com/identity/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (!res.ok) {
      throw new Error(`IAM token request failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    iamToken = data.access_token;
    tokenExpiresAt = data.expiration;
    logger.info('Refreshed IBM IAM Access Token');
    return iamToken;
  } catch (err) {
    logger.error('Failed to obtain IBM IAM token:', { error: err.message });
    return null;
  }
}

/**
 * Check if watsonx is running in live cloud mode vs local simulation mode
 */
function isWatsonxConfigured() {
  return Boolean(env.WATSONX_API_KEY && env.WATSONX_PROJECT_ID && !env.WATSONX_SIMULATION_MODE);
}

module.exports = {
  getIamToken,
  isWatsonxConfigured,
  models: {
    textGeneration: 'ibm/granite-3-8b-instruct',
    vision: 'ibm/granite-vision-3-2-2b',
    embeddings: 'ibm/slate-125m-english-rtrvr'
  }
};
