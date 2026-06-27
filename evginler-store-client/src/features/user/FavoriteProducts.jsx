import { useMutation, useQueryClient } from '@tanstack/react-query'
import { HeartOff, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { userApi } from '../../api/userApi'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { useCartActions } from '../cart/useCartActions'
import { formatCurrency, getDiscountedPrice, getProductImage } from '../../utils/formatters'

function getProductId(product) {
  return product?._id || product?.id || product?.productId
}

export function FavoriteProducts({ favorites }) {
  const queryClient = useQueryClient()
  const { addItem } = useCartActions()
  const removeFavorite = useMutation({
    mutationFn: userApi.removeFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'favorites'] })
      toast.success('Ürün favorilerden çıkarıldı.')
    },
    onError: (error) => {
      if (!error.toastShown) {
        toast.error(error.message || 'Favori silinemedi.')
      }
    },
  })

  if (!favorites?.length) {
    return (
      <EmptyState
        title="Favori ürününüz yok"
        description="Beğendiğiniz ürünleri favorilere ekleyerek buradan takip edebilirsiniz."
        actionLabel="Ürünlere göz at"
        actionTo="/products"
      />
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {favorites.map((product) => {
        const productId = getProductId(product)
        const discountedPrice = getDiscountedPrice(product)
        const hasDiscount = Number(product.discount || 0) > 0

        return (
          <article key={productId} className="overflow-hidden rounded-xl border border-[#ddd6c8] bg-white">
            <Link to={`/products/${productId}`} className="block">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#f0ece4]">
                <img src={getProductImage(product)} alt={product.name} className="h-full w-full object-cover" />
                {hasDiscount ? (
                  <span className="absolute left-3 top-3 rounded-full bg-[#7c2d3f] px-3 py-1 text-xs font-semibold text-white">
                    %{product.discount}
                  </span>
                ) : null}
              </div>
            </Link>
            <div className="p-4">
              <Link to={`/products/${productId}`}>
                <h2 className="line-clamp-2 min-h-12 font-bold text-[#1e1a17]">{product.name}</h2>
              </Link>
              <div className="mt-3">
                <p className="text-lg font-bold text-[#3d5e35]">{formatCurrency(discountedPrice)}</p>
                {hasDiscount ? <p className="text-xs text-[#8c7e72] line-through">{formatCurrency(product.price)}</p> : null}
              </div>
              <div className="mt-4 grid gap-2">
                <Button as={Link} to={`/products/${productId}`} variant="outline">
                  Ürün detayına git
                </Button>
                <Button
                  type="button"
                  disabled={product.isOutOfStock || addItem.isPending}
                  onClick={() => addItem.mutate({ productId, quantity: 1 })}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Sepete ekle
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={removeFavorite.isPending}
                  onClick={() => removeFavorite.mutate(productId)}
                >
                  <HeartOff className="h-4 w-4" />
                  Favoriden çıkar
                </Button>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
