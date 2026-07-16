import { ProductCard } from './ProductCard'
import { EmptyState } from '../../components/EmptyState'
import { ProductCardSkeleton } from '../../components/Skeleton'

export function ProductGrid({ products = [], onAddToCart, isLoading = false, skeletonCount = 8 }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (!products.length) {
    return (
      <EmptyState
        title="Ürün bulunamadı"
        description="Aradığınız filtreye uygun ürün henüz listelenmiyor."
        actionLabel="Tüm ürünlere dön"
        actionTo="/products"
      />
    )
  }

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  )
}
