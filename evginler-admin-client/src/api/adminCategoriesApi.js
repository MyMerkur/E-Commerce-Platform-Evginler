import { apiClient, unwrapApiResponse } from './client'

export const adminCategoriesApi = {
  getCategories: () => apiClient.get('/admin/categories').then(unwrapApiResponse),
  getCategory: (categoryId) => apiClient.get(`/admin/categories/${categoryId}`).then(unwrapApiResponse),
  createCategory: (payload) => apiClient.post('/admin/categories', payload).then(unwrapApiResponse),
  updateCategory: (categoryId, payload) => apiClient.put(`/admin/categories/${categoryId}`, payload).then(unwrapApiResponse),
  deleteCategory: (categoryId) => apiClient.delete(`/admin/categories/${categoryId}`).then(unwrapApiResponse),
}
