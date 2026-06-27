import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { userApi } from '../../api/userApi'
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
    <article className="group flex flex-col overflow-hidden rounded-xl border border-[#ddd6c8] bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[#c5bbb0]">
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-[#f0ece4]">
          <img
            src={getProductImage(product)}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {hasDiscount ? (
              <span className="rounded-full bg-[#7c2d3f] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                %{product.discount} indirim
              </span>
            ) : null}
          </div>

          {product.isOutOfStock ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
              <span className="rounded-full bg-[#1e1a17]/80 px-4 py-1.5 text-xs font-bold text-white">
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
                ? 'bg-[#7c2d3f] text-white'
                : 'bg-white/90 text-[#8c7e72] hover:bg-[#7c2d3f] hover:text-white'
            }`}
            aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`/products/${product._id}`} className="flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[#1e1a17] transition-colors group-hover:text-[#7c2d3f]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-lg font-bold text-[#3d5e35]">{formatCurrency(discountedPrice)}</p>
            {hasDiscount ? (
              <p className="text-xs text-[#a49588] line-through">{formatCurrency(product.price)}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => onAddToCart?.(product)}
            disabled={product.isOutOfStock}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7c2d3f] text-white shadow-sm transition-all hover:bg-[#6a2535] hover:shadow-md active:scale-95 disabled:bg-[#c5bbb0] disabled:shadow-none"
            aria-label="Sepete ekle"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  )
}
