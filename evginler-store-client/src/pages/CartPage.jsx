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
        <p className="text-xs font-bold uppercase tracking-widest text-[#7c2d3f]">Alışveriş</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1e1a17]">Sepetim</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Cart items */}
        <div className="overflow-hidden rounded-xl border border-[#ddd6c8] bg-white shadow-sm">
          {/* Free shipping banner */}
          <div className="border-b border-[#ddd6c8] bg-[#edf2eb] px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-semibold text-[#3d5e35]">
                <Truck className="h-4 w-4" />
                {freeShippingRemaining > 0
                  ? `Ücretsiz kargo için ${formatCurrency(freeShippingRemaining)} eksik`
                  : 'Ücretsiz kargoya ulaştınız!'}
              </span>
              <span className="font-bold text-[#3d5e35]">₺500</span>
            </div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[#c2d9be]">
              <div
                className="h-full rounded-full bg-[#3d5e35] transition-all duration-500"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>

          <div className="divide-y divide-[#ddd6c8]">
            {cart.map((item) => (
              <div
                key={item.productId}
                className="grid gap-4 p-4 sm:grid-cols-[88px_1fr_auto] sm:items-center sm:p-5"
              >
                <Link to={`/products/${item.productId}`} className="block shrink-0">
                  <img
                    src={getProductImage(item)}
                    alt=""
                    className="h-20 w-20 rounded-xl object-cover shadow-sm sm:h-20 sm:w-[88px]"
                  />
                </Link>
                <div>
                  <Link to={`/products/${item.productId}`}>
                    <h2 className="font-semibold leading-snug text-[#1e1a17] hover:text-[#7c2d3f] transition-colors">
                      {item.name}
                    </h2>
                  </Link>
                  <p className="mt-1 text-sm font-bold text-[#3d5e35]">{formatCurrency(item.price)}</p>
                  <p className="mt-0.5 text-xs text-[#8c7e72]">Birim fiyat</p>

                  {/* Qty stepper */}
                  <div className="mt-3 flex items-center gap-1 rounded-xl border border-[#ddd6c8] p-1 w-fit">
                    <button
                      type="button"
                      onClick={() =>
                        updateItem.mutate({ productId: item.productId, quantity: Math.max(1, item.quantity - 1) })
                      }
                      disabled={item.quantity <= 1 || updateItem.isPending}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5f5148] transition hover:bg-[#f0ece4] disabled:opacity-30"
                      aria-label="Azalt"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-[#1e1a17]">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateItem.mutate({ productId: item.productId, quantity: item.quantity + 1 })
                      }
                      disabled={updateItem.isPending}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5f5148] transition hover:bg-[#f0ece4]"
                      aria-label="Artır"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <p className="text-base font-bold text-[#1e1a17]">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem.mutate(item.productId)}
                    disabled={removeItem.isPending}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#ddd6c8] text-[#a49588] transition hover:border-[#7c2d3f] hover:bg-[#f5ecee] hover:text-[#7c2d3f]"
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
        <aside className="h-fit rounded-xl border border-[#ddd6c8] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#1e1a17]">Sipariş özeti</h2>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6b6058]">Ara toplam</span>
              <span className="font-semibold text-[#1e1a17]">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6b6058]">Kargo</span>
              {shipping ? (
                <span className="font-semibold text-[#1e1a17]">{formatCurrency(shipping)}</span>
              ) : (
                <span className="font-bold text-[#3d5e35]">Ücretsiz</span>
              )}
            </div>
            {freeShippingRemaining > 0 && (
              <p className="rounded-lg bg-[#edf2eb] px-3 py-2 text-xs font-medium text-[#3d5e35]">
                {formatCurrency(freeShippingRemaining)} daha ekleyin, kargo ücretsiz olsun!
              </p>
            )}
            <div className="flex justify-between border-t border-[#ddd6c8] pt-4 text-base">
              <span className="font-bold text-[#1e1a17]">Toplam</span>
              <span className="font-bold text-[#3d5e35] text-lg">{formatCurrency(total)}</span>
            </div>
          </div>

          <Button as={Link} to="/checkout" className="mt-6 w-full" size="lg">
            Ödemeye geç
          </Button>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-[#8c7e72]">
            <span className="flex items-center gap-1">
              <Truck className="h-3.5 w-3.5" /> Hızlı teslimat
            </span>
            <span className="h-3 w-px bg-[#ddd6c8]" />
            <span>Güvenli ödeme</span>
          </div>
        </aside>
      </div>
    </section>
  )
}
