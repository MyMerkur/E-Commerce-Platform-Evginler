export function getOrderId(order) {
  return order?._id || order?.id
}

export function getOrderNumber(order) {
  return order?.orderId || order?.orderNumber || getOrderId(order)
}

export function getCustomer(order) {
  const user = order?.userId || order?.user || {}
  return {
    name: [user.name, user.surname].filter(Boolean).join(' ') || user.email || 'Müşteri',
    email: user.email || '',
    phone: user.phone || '',
  }
}

export function getAddressText(order) {
  const address = order?.address || order?.selectedAddress || {}
  if (typeof address === 'string') return address

  return [
    address.title,
    address.fullAddress,
    [address.district, address.city].filter(Boolean).join(' / '),
    address.zipCode,
    address.country,
  ]
    .filter(Boolean)
    .join(' · ')
}

export function getOrderStatus(order) {
  if (order?.isCancelled) return { label: 'İptal edilen', tone: 'cancelled' }
  if (order?.isReturned || order?.products?.some((product) => product.isReturned)) {
    return { label: 'İade edilen', tone: 'returned' }
  }
  if (order?.isDelivered) return { label: 'Teslim edilen', tone: 'delivered' }
  if (order?.isConfirmed || order?.trackingNumber) return { label: 'Onaylanan', tone: 'confirmed' }
  return { label: 'Gelen', tone: 'incoming' }
}

export function getPaymentStatus(order) {
  const status = order?.paymentStatus || 'pending'
  const labels = {
    success: 'Ödendi',
    pending: 'Beklemede',
    failed: 'Başarısız',
  }

  return labels[status] || status
}
