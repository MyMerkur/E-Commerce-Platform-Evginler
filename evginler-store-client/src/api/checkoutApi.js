import { apiClient, unwrapApiResponse } from './client'

export const checkoutApi = {
  getCheckout: () => apiClient.get('/checkout').then(unwrapApiResponse),
  getInstallments: (payload) =>
    apiClient.post('/checkout/installments', payload, { silent: true }).then(unwrapApiResponse),
  processPayment: (payload) => apiClient.post('/checkout/process-payment', payload).then(unwrapApiResponse),
}
