import { ProductCard } from './ProductCard'
import { EmptyState } from '../../components/EmptyState'

export function ProductGrid({ products = [], onAddToCart }) {
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
