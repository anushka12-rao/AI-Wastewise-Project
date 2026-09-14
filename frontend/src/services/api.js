function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';
  const trimmed = envUrl.trim().replace(/\/+$/, '');
  if (!trimmed || trimmed === '/api') return '/api';
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const BASE_URL = getApiBaseUrl();

export async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {})
  };

  // Add Bearer token fallback if present in localStorage
  if (typeof window !== 'undefined') {
    const savedToken = localStorage.getItem('wastewise_token');
    if (savedToken && !headers['Authorization'] && !headers['authorization']) {
      headers['Authorization'] = `Bearer ${savedToken}`;
    }
  }

  const config = {
    ...options,
    headers,
    credentials: 'include' // Important for HttpOnly session cookie
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.response = { data, status: response.status };
    throw error;
  }

  return data;
}

export default apiRequest;
