import { apiRequest } from './api';

export async function queryWasteWise(payload) {
  return apiRequest('/query', {
    method: 'POST',
    body: payload
  });
}
