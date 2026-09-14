import { apiRequest } from './api';

export async function analyzeWaste(payload) {
  return apiRequest('/analyze', {
    method: 'POST',
    body: payload
  });
}
