import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, PackageCheck, RotateCcw, Truck } from 'lucide-react'
import toast from 'react-hot-toast'
import { userApi } from '../../api/userApi'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { formatCurrency, getProductImage } from '../../utils/formatters'

const statusStyles = {
  delivered: 'bg-[#edf2eb] text-[#3d5e35]',
  returned: 'bg-[#f5ecee] text-[#7c2d3f]',
  cancelled: 'bg-[#f0ece4] text-[#5f5148]',
  confirmed: 'bg-[#edf4ff] text-[#285587]',
  pending: 'bg-[#fff7ed] text-[#7a4a16]',
}

function getOrderId(order) {
  return order?._id || order?.id
}

function getOrderNumber(order) {
  return order?.orderId || order?.orderNumber || getOrderId(order)
}

function getOrderDate(order) {
  if (order?.createdAtFormatted) return order.createdAtFormatted
  if (!order?.createdAt) return 'Tarih bilgisi yok'

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(order.createdAt))
}

function getStatus(order) {
  if (order?.isCancelled) return { label: 'İptal edildi', tone: 'cancelled' }
  if (order?.isReturned || order?.products?.some((product) => product.isReturned)) {
    return { label: 'İade edildi', tone: 'returned' }
  }
  if (order?.isDelivered) return { label: 'Teslim edildi', tone: 'delivered' }
  if (order?.isConfirmed) return { label: 'Onaylandı', tone: 'confirmed' }
  return { label: 'Hazırlanıyor', tone: 'pending' }
}

function canReturnProduct(order, product) {
  return Boolean(order?.isDelivered && !order?.isCancelled && !order?.isReturned && !product?.isReturned)
}

function StatusBadge({ order }) {
  const status = getStatus(order)

  return (
    <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${statusStyles[status.tone]}`}>
      {status.label}
    </span>
  )
}

export function OrderHistory({ orders }) {
  const queryClient = useQueryClient()
  const returnProduct = useMutation({
    mutationFn: ({ orderId, productId, returnReason }) =>
      userApi.returnOrderProduct(orderId, { productId, returnReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'orders'] })
      toast.success('İade talebiniz alındı.')
    },
    onError: (error) => {
      if (!error.toastShown) {
        toast.error(error.message || 'İade talebi gönderilemedi.')
      }
    },
  })

  const handleReturn = (order, product) => {
    const returnReason = window.prompt('İade nedeninizi yazın:')
    if (!returnReason?.trim()) return

    const confirmed = window.confirm('Bu ürün için iade talebi oluşturmak istediğinize emin misiniz?')
    if (!confirmed) return

    returnProduct.mutate({
      orderId: getOrderId(order),
      productId: product.productId || product._id || product.id,
      returnReason: returnReason.trim(),
    })
  }

  if (!orders?.length) {
    return (
      <EmptyState
        title="Henüz siparişiniz yok"
        description="Sipariş verdiğinizde durum, kargo ve ürün detayları burada görünecek."
        actionLabel="Alışverişe başla"
        actionTo="/products"
      />
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <article key={getOrderId(order)} className="overflow-hidden rounded-xl border border-[#ddd6c8] bg-white">
          <div className="grid gap-4 border-b border-[#ddd6c8] bg-[#faf8f4] p-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-[#1e1a17]">Sipariş #{getOrderNumber(order)}</h2>
                <StatusBadge order={order} />
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#6b6058]">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {getOrderDate(order)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <PackageCheck className="h-4 w-4" />
                  {order.products?.length || 0} ürün
                </span>
                <span className="inline-flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  {order.courier || 'Kargo bilgisi bekleniyor'}
                  {order.trackingNumber ? ` · ${order.trackingNumber}` : ''}
                </span>
              </div>
            </div>
            <div className="text-left lg:text-right">
              <p className="text-sm text-[#6b6058]">Toplam</p>
              <p className="text-xl font-bold text-[#3d5e35]">{formatCurrency(order.totalPrice)}</p>
            </div>
          </div>

          <div className="divide-y divide-[#ddd6c8]">
            {(order.products || []).map((product) => (
              <div
                key={`${getOrderId(order)}-${product.productId || product.name}`}
                className="grid gap-4 p-4 sm:grid-cols-[72px_1fr_auto] sm:items-center"
              >
                <img src={getProductImage(product)} alt="" className="h-20 w-20 rounded-xl object-cover sm:h-16 sm:w-16" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[#1e1a17]">{product.name}</p>
                    {product.isReturned ? (
                      <span className="rounded-md bg-[#f5ecee] px-2 py-1 text-xs font-bold text-[#7c2d3f]">
                        İade edildi
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-[#6b6058]">
                    {product.quantity} adet · {formatCurrency(product.price)}
                  </p>
                  {product.returnReason ? (
                    <p className="mt-1 text-xs text-[#7c2d3f]">İade nedeni: {product.returnReason}</p>
                  ) : null}
                </div>
                {canReturnProduct(order, product) ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={returnProduct.isPending}
                    onClick={() => handleReturn(order, product)}
                  >
                    <RotateCcw className="h-4 w-4" />
                    İade Talep Et
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}
