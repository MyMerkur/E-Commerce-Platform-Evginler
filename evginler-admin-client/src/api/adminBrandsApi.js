import { apiClient, unwrapApiResponse } from './client'

export const adminBrandsApi = {
  getBrands: () => apiClient.get('/admin/brands').then(unwrapApiResponse),
  getBrand: (brandId) => apiClient.get(`/admin/brands/${brandId}`).then(unwrapApiResponse),
  createBrand: (payload) => apiClient.post('/admin/brands', payload).then(unwrapApiResponse),
  updateBrand: (brandId, payload) => apiClient.put(`/admin/brands/${brandId}`, payload).then(unwrapApiResponse),
  deleteBrand: (brandId) => apiClient.delete(`/admin/brands/${brandId}`).then(unwrapApiResponse),
}
