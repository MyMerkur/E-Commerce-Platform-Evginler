import { CheckCircle2, PackageCheck, Truck } from 'lucide-react'
import { Button } from '../../components/Button'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { getAddressText, getCustomer, getOrderId, getOrderNumber, getOrderStatus, getPaymentStatus } from './orderHelpers'

const badgeStyles = {
  incoming: 'bg-[#fff7ed] text-[#7a4a16]',
  confirmed: 'bg-[#edf4ff] text-[#285587]',
  delivered: 'bg-[#e8f5ef] text-[#20493f]',
  returned: 'bg-[#fdf1f1] text-[#963d3d]',
  cancelled: 'bg-[#edf2ef] text-[#4f5d54]',
}

function Badge({ children, tone = 'incoming' }) {
  return <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${badgeStyles[tone]}`}>{children}</span>
}

export function OrderCard({ isDelivering, onConfirm, onDeliver, order, status }) {
  const customer = getCustomer(order)
  const orderStatus = getOrderStatus(order)
  const canConfirm = status === 'incoming' && !order.isConfirmed && !order.trackingNumber
  const canDeliver = status === 'confirmed' && order.isConfirmed && order.trackingNumber && !order.isDelivered

  return (
    <article className="overflow-hidden rounded-md border border-[#dfe7e1] bg-white">
      <div className="grid gap-4 border-b border-[#dfe7e1] bg-[#f9fbfa] p-4 xl:grid-cols-[1fr_auto] xl:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-[#17211d]">#{getOrderNumber(order)}</h2>
            <Badge tone={orderStatus.tone}>{orderStatus.label}</Badge>
            <Badge tone={order.paymentStatus === 'success' ? 'delivered' : 'incoming'}>{getPaymentStatus(order)}</Badge>
          </div>
          <div className="mt-3 grid gap-2 text-sm text-[#66756c] md:grid-cols-2">
            <p><strong className="text-[#17211d]">Müşteri:</strong> {customer.name}</p>
            <p><strong className="text-[#17211d]">Tarih:</strong> {order.createdAtFormatted || formatDate(order.createdAt)}</p>
            {customer.email ? <p><strong className="text-[#17211d]">E-posta:</strong> {customer.email}</p> : null}
            {customer.phone ? <p><strong className="text-[#17211d]">Telefon:</strong> {customer.phone}</p> : null}
          </div>
        </div>
        <div className="text-left xl:text-right">
          <p className="text-sm text-[#66756c]">Toplam tutar</p>
          <p className="text-2xl font-bold text-[#20493f]">{formatCurrency(order.totalPrice)}</p>
        </div>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h3 className="text-sm font-bold text-[#17211d]">Ürünler</h3>
          <div className="mt-3 divide-y divide-[#dfe7e1] rounded-md border border-[#dfe7e1]">
            {(order.products || []).map((product) => (
              <div key={`${getOrderId(order)}-${product.productId || product.name}`} className="grid gap-2 p-3 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-semibold text-[#17211d]">{product.name}</p>
                  {product.isReturned ? <p className="mt-1 text-xs font-bold text-[#963d3d]">İade edildi</p> : null}
                </div>
                <p className="text-sm text-[#66756c]">
                  {product.quantity} adet · {formatCurrency(product.price)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-md border border-[#dfe7e1] p-4">
            <h3 className="text-sm font-bold text-[#17211d]">Adres</h3>
            <p className="mt-2 text-sm leading-6 text-[#66756c]">{getAddressText(order) || 'Adres bilgisi yok'}</p>
          </div>
          <div className="rounded-md border border-[#dfe7e1] p-4">
            <h3 className="text-sm font-bold text-[#17211d]">Kargo</h3>
            <p className="mt-2 flex items-center gap-2 text-sm text-[#66756c]">
              <Truck className="h-4 w-4" />
              {order.courier || 'Kargo firması bekleniyor'}
            </p>
            <p className="mt-1 text-sm text-[#66756c]">{order.trackingNumber || 'Takip numarası bekleniyor'}</p>
          </div>
          {(canConfirm || canDeliver) ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              {canConfirm ? (
                <Button type="button" onClick={() => onConfirm(order)}>
                  <PackageCheck className="h-4 w-4" />
                  Onayla
                </Button>
              ) : null}
              {canDeliver ? (
                <Button type="button" variant="secondary" disabled={isDelivering} onClick={() => onDeliver(order)}>
                  <CheckCircle2 className="h-4 w-4" />
                  Teslim Edildi
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}
