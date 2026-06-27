import { apiClient, unwrapApiResponse } from './client'

export const cartApi = {
  getCart: () => apiClient.get('/cart', { silent: true }).then(unwrapApiResponse),
  addItem: (payload) => apiClient.post('/cart/items', payload).then(unwrapApiResponse),
  updateItem: (productId, quantity) =>
    apiClient.patch(`/cart/items/${productId}`, { quantity }).then(unwrapApiResponse),
  removeItem: (productId) => apiClient.delete(`/cart/items/${productId}`).then(unwrapApiResponse),
}
