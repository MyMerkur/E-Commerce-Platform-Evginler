import { apiClient, unwrapApiResponse } from './client'

export const adminOrdersApi = {
  getOrders: (params = {}) => apiClient.get('/admin/orders', { params }).then(unwrapApiResponse),
  confirmOrder: (orderId, payload) => apiClient.patch(`/admin/orders/${orderId}/confirm`, payload).then(unwrapApiResponse),
  deliverOrder: (orderId) => apiClient.patch(`/admin/orders/${orderId}/deliver`).then(unwrapApiResponse),
}
