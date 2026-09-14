const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

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
