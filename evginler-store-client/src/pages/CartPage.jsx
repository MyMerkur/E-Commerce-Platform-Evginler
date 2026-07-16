import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2, Truck } from 'lucide-react'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { useCart } from '../hooks/useCart'
import { useCartActions } from '../features/cart/useCartActions'
import { useCartStore } from '../store/cartStore'
import { formatCurrency, getProductImage } from '../utils/formatters'

const FREE_SHIPPING_THRESHOLD = 500
const SHIPPING_FEE = 250

export function CartPage() {
  useCart()
  const cart = useCartStore((state) => state.cart)
  const subtotal = useCartStore((state) => state.getSubtotal())
  const { updateItem, removeItem } = useCartActions()
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE
  const total = subtotal + shipping
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)

  if (!cart.length) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={ShoppingBag}
          title="Sepetiniz boş"
          description="Eviniz için seçtiğiniz ürünler burada görünecek. Koleksiyonumuza göz atın!"
          actionLabel="Ürünlere göz at"
          actionTo="/products"
        />
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-maroon">Alışveriş</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold uppercase tracking-tight text-ink">Sepetim</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Cart items */}
        <div className="overflow-hidden rounded-md border border-border bg-white">
          {/* Free shipping banner */}
          <div className="border-b border-border bg-surface-muted px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-semibold text-olive">
                <Truck className="h-4 w-4" />
                {freeShippingRemaining > 0
                  ? `Ücretsiz kargo için ${formatCurrency(freeShippingRemaining)} eksik`
                  : 'Ücretsiz kargoya ulaştınız!'}
              </span>
              <span className="font-bold text-olive">₺500</span>
            </div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-olive transition-all duration-500"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>

          <div className="divide-y divide-border">
            {cart.map((item) => (
              <div
                key={item.productId}
                className="grid gap-4 p-4 sm:grid-cols-[88px_1fr_auto] sm:items-center sm:p-5"
              >
                <Link to={`/products/${item.productId}`} className="block shrink-0">
                  <img
                    src={getProductImage(item)}
                    alt=""
                    className="h-20 w-20 rounded-md border border-border object-cover sm:h-20 sm:w-[88px]"
                  />
                </Link>
                <div>
                  <Link to={`/products/${item.productId}`}>
                    <h2 className="font-semibold leading-snug text-ink hover:text-maroon transition-colors">
                      {item.name}
                    </h2>
                  </Link>
                  <p className="mt-1 text-sm font-bold text-olive">{formatCurrency(item.price)}</p>
                  <p className="mt-0.5 text-xs text-muted-light">Birim fiyat</p>

                  {/* Qty stepper */}
                  <div className="mt-3 flex items-center gap-1 rounded-md border border-border p-1 w-fit">
                    <button
                      type="button"
                      onClick={() =>
                        updateItem.mutate({ productId: item.productId, quantity: Math.max(1, item.quantity - 1) })
                      }
                      disabled={item.quantity <= 1 || updateItem.isPending}
                      className="flex h-8 w-8 items-center justify-center rounded text-muted transition hover:bg-surface-muted disabled:opacity-30"
                      aria-label="Azalt"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-ink">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateItem.mutate({ productId: item.productId, quantity: item.quantity + 1 })
                      }
                      disabled={updateItem.isPending}
                      className="flex h-8 w-8 items-center justify-center rounded text-muted transition hover:bg-surface-muted"
                      aria-label="Artır"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <p className="font-display text-lg font-extrabold text-ink">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem.mutate(item.productId)}
                    disabled={removeItem.isPending}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-light transition hover:border-maroon hover:bg-[#f5ecee] hover:text-maroon"
                    aria-label="Ürünü sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <aside className="h-fit rounded-md border border-border bg-white p-6">
          <h2 className="font-display text-lg font-extrabold uppercase tracking-tight text-ink">Sipariş özeti</h2>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Ara toplam</span>
              <span className="font-semibold text-ink">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Kargo</span>
              {shipping ? (
                <span className="font-semibold text-ink">{formatCurrency(shipping)}</span>
              ) : (
                <span className="font-bold text-olive">Ücretsiz</span>
              )}
            </div>
            {freeShippingRemaining > 0 && (
              <p className="rounded-md bg-surface-muted px-3 py-2 text-xs font-medium text-olive">
                {formatCurrency(freeShippingRemaining)} daha ekleyin, kargo ücretsiz olsun!
              </p>
            )}
            <div className="flex justify-between border-t border-border pt-4 text-base">
              <span className="font-bold text-ink">Toplam</span>
              <span className="font-display text-xl font-extrabold text-ink">{formatCurrency(total)}</span>
            </div>
          </div>

          <Button as={Link} to="/checkout" className="mt-6 w-full" size="lg">
            Ödemeye geç
          </Button>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-light">
            <span className="flex items-center gap-1">
              <Truck className="h-3.5 w-3.5" /> Hızlı teslimat
            </span>
            <span className="h-3 w-px bg-border" />
            <span>Güvenli ödeme</span>
          </div>
        </aside>
      </div>
    </section>
  )
}
