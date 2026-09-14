import { apiRequest } from './api';

export async function getKnowledgeEntries(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/admin/knowledge-entries${query ? `?${query}` : ''}`, {
    method: 'GET'
  });
}

export async function createKnowledgeEntry(data) {
  return apiRequest('/admin/knowledge-entries', {
    method: 'POST',
    body: data
  });
}

export async function updateKnowledgeEntry(id, data) {
  return apiRequest(`/admin/knowledge-entries/${id}`, {
    method: 'PATCH',
    body: data
  });
}

export async function deleteKnowledgeEntry(id) {
  return apiRequest(`/admin/knowledge-entries/${id}`, {
    method: 'DELETE'
  });
}

export async function toggleVerifyKnowledgeEntry(id) {
  return apiRequest(`/admin/knowledge-entries/${id}/verify`, {
    method: 'PATCH'
  });
}

export async function getAdminCategories() {
  return apiRequest('/admin/categories', {
    method: 'GET'
  });
}

export async function getAdminJurisdictions() {
  return apiRequest('/admin/jurisdictions', {
    method: 'GET'
  });
}

export async function getQueryLogs(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/admin/query-log${query ? `?${query}` : ''}`, {
    method: 'GET'
  });
}
