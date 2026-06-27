import { apiClient, unwrapApiResponse } from './client'

export const authApi = {
  me: () => apiClient.get('/auth/me', { silent: true }).then(unwrapApiResponse),
  login: (payload) => apiClient.post('/auth/login', payload).then(unwrapApiResponse),
  register: (payload) => apiClient.post('/auth/register', payload).then(unwrapApiResponse),
  logout: () => apiClient.post('/auth/logout').then(unwrapApiResponse),
}
