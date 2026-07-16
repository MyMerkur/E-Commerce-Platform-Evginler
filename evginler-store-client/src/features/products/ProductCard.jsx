import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { userApi } from '../../api/userApi'
import { Badge } from '../../components/Badge'
import { useAuthStore } from '../../store/authStore'
import { formatCurrency, getDiscountedPrice, getProductImage } from '../../utils/formatters'

export function ProductCard({ product, onAddToCart }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const discountedPrice = getDiscountedPrice(product)
  const hasDiscount = Number(product.discount || 0) > 0
  const productId = product._id || product.id
  const { data: favorites = [] } = useQuery({
    queryKey: ['user', 'favorites'],
    queryFn: userApi.getFavorites,
    enabled: isAuthenticated,
    staleTime: 60_000,
    retry: false,
  })
  const isFavorite = favorites.some((favorite) => String(favorite._id || favorite.id) === String(productId))
  const toggleFavorite = useMutation({
    mutationFn: () => {
      if (!isAuthenticated) {
        toast.error('Favorilere eklemek için giriş yapmalısınız.')
        navigate('/login', { state: { from: location } })
        return Promise.reject(new Error('AUTH_REQUIRED'))
      }

      return isFavorite ? userApi.removeFavorite(productId) : userApi.addFavorite(productId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'favorites'] })
      toast.success(isFavorite ? 'Ürün favorilerden çıkarıldı.' : 'Ürün favorilere eklendi.')
    },
    onError: (error) => {
      if (error.message !== 'AUTH_REQUIRED' && !error.toastShown) {
        toast.error(error.message || 'Favori işlemi yapılamadı.')
      }
    },
  })

  return (
    <article className="group flex flex-col overflow-hidden rounded-md border border-border bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-lg">
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-surface-muted">
          <img
            src={getProductImage(product)}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {hasDiscount ? <Badge variant="discount">%{product.discount} indirim</Badge> : null}
          </div>

          {product.isOutOfStock ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
              <span className="rounded-sm bg-ink px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                Stok yok
              </span>
            </div>
          ) : null}

          {/* Favorite button on hover */}
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault()
              toggleFavorite.mutate()
            }}
            disabled={toggleFavorite.isPending}
            className={`absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/80 shadow-md backdrop-blur-sm transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100 ${
              isFavorite
                ? 'bg-maroon text-white'
                : 'bg-white/90 text-muted-light hover:bg-maroon hover:text-white'
            }`}
            aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`/products/${product._id}`} className="flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-maroon">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="font-display text-xl font-extrabold text-ink">{formatCurrency(discountedPrice)}</p>
            {hasDiscount ? (
              <p className="text-xs text-muted-light line-through">{formatCurrency(product.price)}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => onAddToCart?.(product)}
            disabled={product.isOutOfStock}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-maroon text-white shadow-sm transition-all hover:bg-maroon-dark hover:shadow-md active:scale-95 disabled:bg-muted-light disabled:shadow-none"
            aria-label="Sepete ekle"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  )
}
