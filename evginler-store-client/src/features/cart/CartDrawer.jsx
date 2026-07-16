import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/Button'
import { useCartStore } from '../../store/cartStore'
import { formatCurrency, getProductImage } from '../../utils/formatters'
import { useCartActions } from './useCartActions'

export function CartDrawer({ open, onClose }) {
  const cart = useCartStore((state) => state.cart)
  const subtotal = useCartStore((state) => state.getSubtotal())
  const { updateItem, removeItem } = useCartActions()

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.aside
            className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-lg font-extrabold tracking-tight text-ink">
                Sepetim {cart.length > 0 ? `(${cart.length})` : ''}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition hover:bg-surface-muted"
                aria-label="Sepeti kapat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
                  <ShoppingBag className="h-7 w-7 text-muted-light" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-ink">Sepetiniz boş</p>
                  <p className="mt-1 text-sm text-muted">Beğendiğiniz ürünleri sepete ekleyin.</p>
                </div>
                <Button as={Link} to="/products" variant="outline" onClick={onClose}>
                  Ürünlere göz at
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 divide-y divide-border overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex gap-3 px-5 py-4">
                      <Link to={`/products/${item.productId}`} onClick={onClose} className="block shrink-0">
                        <img
                          src={getProductImage(item)}
                          alt=""
                          className="h-16 w-16 rounded-md border border-border object-cover"
                        />
                      </Link>
                      <div className="flex-1">
                        <Link to={`/products/${item.productId}`} onClick={onClose}>
                          <h3 className="line-clamp-2 text-sm font-semibold text-ink hover:text-maroon">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="mt-1 text-sm font-bold text-olive">{formatCurrency(item.price)}</p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
                            <button
                              type="button"
                              onClick={() =>
                                updateItem.mutate({
                                  productId: item.productId,
                                  quantity: Math.max(1, item.quantity - 1),
                                })
                              }
                              disabled={item.quantity <= 1 || updateItem.isPending}
                              className="flex h-6 w-6 items-center justify-center rounded text-muted transition hover:bg-surface-muted disabled:opacity-30"
                              aria-label="Azalt"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-ink">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() =>
                                updateItem.mutate({ productId: item.productId, quantity: item.quantity + 1 })
                              }
                              disabled={updateItem.isPending}
                              className="flex h-6 w-6 items-center justify-center rounded text-muted transition hover:bg-surface-muted"
                              aria-label="Artır"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem.mutate(item.productId)}
                            disabled={removeItem.isPending}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-light transition hover:bg-[#f5ecee] hover:text-maroon"
                            aria-label="Ürünü sil"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border px-5 py-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Ara toplam</span>
                    <span className="font-display text-lg font-extrabold text-ink">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="mt-4 grid gap-2">
                    <Button as={Link} to="/checkout" onClick={onClose} size="lg">
                      Ödemeye geç
                    </Button>
                    <Button as={Link} to="/cart" onClick={onClose} variant="outline">
                      Sepete git
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
