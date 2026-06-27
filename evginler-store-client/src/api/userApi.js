import { apiClient, unwrapApiResponse } from './client'

export const userApi = {
  getProfile: () => apiClient.get('/user/profile').then(unwrapApiResponse),
  updateProfile: (payload) => apiClient.put('/user/profile', payload).then(unwrapApiResponse),
  getAddresses: () => apiClient.get('/user/addresses').then(unwrapApiResponse),
  createAddress: (payload) => apiClient.post('/user/addresses', payload).then(unwrapApiResponse),
  updateAddress: (addressId, payload) =>
    apiClient.put(`/user/addresses/${addressId}`, payload).then(unwrapApiResponse),
  selectAddress: (selectedAddress) =>
    apiClient.post('/user/selected-address', { selectedAddress }).then(unwrapApiResponse),
  getOrders: (params = {}) => apiClient.get('/user/orders', { params }).then(unwrapApiResponse),
  returnOrderProduct: (orderId, payload) =>
    apiClient.post(`/user/orders/${orderId}/return`, payload).then(unwrapApiResponse),
  getReturns: () => apiClient.get('/user/returns').then(unwrapApiResponse),
  getFavorites: () => apiClient.get('/user/favorites').then(unwrapApiResponse),
  addFavorite: (productId) => apiClient.post(`/user/favorites/${productId}`).then(unwrapApiResponse),
  removeFavorite: (productId) => apiClient.delete(`/user/favorites/${productId}`).then(unwrapApiResponse),
}
