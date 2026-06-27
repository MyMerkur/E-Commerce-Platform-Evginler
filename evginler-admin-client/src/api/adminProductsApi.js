import { apiClient, unwrapApiResponse } from './client'

export const adminProductsApi = {
  getProducts: (params = {}) => apiClient.get('/admin/products', { params }).then(unwrapApiResponse),
  getProduct: (productId) => apiClient.get(`/admin/products/${productId}`).then(unwrapApiResponse),
  createProduct: (payload) => apiClient.post('/admin/products', payload).then(unwrapApiResponse),
  updateProduct: (productId, payload) => apiClient.put(`/admin/products/${productId}`, payload).then(unwrapApiResponse),
  updateProductsStatus: (payload) => apiClient.patch('/admin/products/bulk-status', payload).then(unwrapApiResponse),
  deleteProduct: (productId) => apiClient.delete(`/admin/products/${productId}`).then(unwrapApiResponse),
}
