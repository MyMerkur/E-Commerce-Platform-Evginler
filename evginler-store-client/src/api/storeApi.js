import { apiClient, unwrapApiResponse } from './client'

export const storeApi = {
  getHome: () => apiClient.get('/store/home').then(unwrapApiResponse),
  getProducts: (params = {}) => apiClient.get('/store/products', { params }).then(unwrapApiResponse),
  getProduct: (productId) => apiClient.get(`/store/products/${productId}`).then(unwrapApiResponse),
  getCategories: () => apiClient.get('/store/categories').then(unwrapApiResponse),
  getBrands: () => apiClient.get('/store/brands').then(unwrapApiResponse),
}
