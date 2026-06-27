import { apiClient, unwrapApiResponse } from './client'

export const adminDashboardApi = {
  getDashboard: () => apiClient.get('/admin/dashboard').then(unwrapApiResponse),
}
