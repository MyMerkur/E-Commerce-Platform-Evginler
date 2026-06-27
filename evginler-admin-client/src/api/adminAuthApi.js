import { apiClient, unwrapApiResponse } from './client'

export const adminAuthApi = {
  me: () => apiClient.get('/admin/auth/me', { silent: true }).then(unwrapApiResponse),
  login: (payload) => apiClient.post('/admin/auth/login', payload).then(unwrapApiResponse),
  register: (payload) => apiClient.post('/admin/auth/register', payload).then(unwrapApiResponse),
  logout: () => apiClient.post('/admin/auth/logout').then(unwrapApiResponse),
}
