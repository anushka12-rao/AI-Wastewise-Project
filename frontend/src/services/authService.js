import { apiRequest } from './api';

export async function login(email, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password }
  });
}

export async function logout() {
  return apiRequest('/auth/logout', {
    method: 'POST'
  });
}

export async function getMe() {
  return apiRequest('/auth/me', {
    method: 'GET'
  });
}
