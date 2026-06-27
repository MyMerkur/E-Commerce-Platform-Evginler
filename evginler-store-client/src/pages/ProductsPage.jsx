import { useQuery } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'react-router-dom'
import { LayoutGrid, Search } from 'lucide-react'
import { storeApi } from '../api/storeApi'
import { LoadingState } from '../components/LoadingState'
import { ProductGrid } from '../features/products/ProductGrid'
import { useCartActions } from '../features/cart/useCartActions'

export function ProductsPage({ mode }) {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const { addItem } = useCartActions()
  const query = {
    search: mode === 'search' ? searchParams.get('q') : undefined,
    brandId: mode === 'brand' ? params.brandId : undefined,
    subcategory: mode === 'subcategory' ? params.subcategory : undefined,
  }

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', query],
    queryFn: () => storeApi.getProducts(query),
  })

  const title =
    mode === 'search'
      ? `"${query.search || ''}" sonuçları`
      : mode === 'brand'
        ? 'Marka ürünleri'
        : mode === 'subcategory'
          ? params.subcategory
          : 'Tüm ürünler'

  const isSearch = mode === 'search'

  if (isLoading) return <LoadingState label="Ürünler yükleniyor" />

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8 overflow-hidden rounded-xl border border-[#ddd6c8] bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf2eb]">
              {isSearch ? (
                <Search className="h-5 w-5 text-[#3d5e35]" />
              ) : (
                <LayoutGrid className="h-5 w-5 text-[#3d5e35]" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#7c2d3f]">
                {isSearch ? 'Arama sonuçları' : 'Mağaza'}
              </p>
              <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-[#1e1a17]">{title}</h1>
              <p className="mt-1 text-sm text-[#6b6058]">
                {products.length > 0
                  ? `${products.length} ürün listeleniyor`
                  : 'Sonuç bulunamadı'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ProductGrid products={products} onAddToCart={(product) => addItem.mutate({ productId: product._id })} />
    </section>
  )
}
