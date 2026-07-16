import { useQuery } from '@tanstack/react-query'
import { LayoutGrid, SlidersHorizontal, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { storeApi } from '../api/storeApi'
import { Seo } from '../components/Seo'
import { ProductGrid } from '../features/products/ProductGrid'
import { useCartActions } from '../features/cart/useCartActions'
import { getDiscountedPrice } from '../utils/formatters'

const PAGE_SIZE = 12

const sortOptions = [
  { value: 'default', label: 'Önerilen sıralama' },
  { value: 'price-asc', label: 'Fiyat: Düşükten yükseğe' },
  { value: 'price-desc', label: 'Fiyat: Yüksekten düşüğe' },
  { value: 'name-asc', label: 'İsim: A - Z' },
]

function FiltersPanel({ categories, selectedCategoryIds, onToggleCategory, minPrice, maxPrice, onPriceChange, onReset }) {
  return (
    <div className="space-y-6">
      {categories.length > 0 ? (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-ink">Kategori</h3>
          <div className="mt-3 space-y-2">
            {categories.map((category) => (
              <label key={category._id} className="flex cursor-pointer items-center gap-2.5 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(category._id)}
                  onChange={() => onToggleCategory(category._id)}
                  className="h-4 w-4 rounded-sm border-border accent-ink"
                />
                {category.name}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-ink">Fiyat aralığı</h3>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(event) => onPriceChange('min', event.target.value)}
            placeholder="Min"
            className="h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-ink"
          />
          <span className="text-muted-light">—</span>
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(event) => onPriceChange('max', event.target.value)}
            placeholder="Max"
            className="h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-ink"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="text-xs font-bold uppercase tracking-wide text-maroon hover:underline"
      >
        Filtreleri temizle
      </button>
    </div>
  )
}

export function ProductsPage({ mode }) {
  const params = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { addItem } = useCartActions()
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [page, setPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const query = {
    search: mode === 'search' ? searchParams.get('q') : undefined,
    brandId: mode === 'brand' ? params.brandId : undefined,
    subcategory: mode === 'subcategory' ? params.subcategory : undefined,
  }

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', query],
    queryFn: () => storeApi.getProducts(query),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['store', 'categories'],
    queryFn: storeApi.getCategories,
    staleTime: 5 * 60_000,
  })

  const filterSignature = JSON.stringify([
    query.search,
    query.brandId,
    query.subcategory,
    selectedCategoryIds,
    minPrice,
    maxPrice,
    sortBy,
  ])
  const [pageResetKey, setPageResetKey] = useState(filterSignature)
  if (filterSignature !== pageResetKey) {
    setPageResetKey(filterSignature)
    setPage(1)
  }

  const toggleCategory = (categoryId) => {
    setSelectedCategoryIds((current) =>
      current.includes(categoryId) ? current.filter((id) => id !== categoryId) : [...current, categoryId],
    )
  }

  const resetFilters = () => {
    setSelectedCategoryIds([])
    setMinPrice('')
    setMaxPrice('')
    setSortBy('default')
  }

  const filteredProducts = useMemo(() => {
    let result = products

    if (selectedCategoryIds.length) {
      result = result.filter((product) =>
        (product.categories || []).some((categoryId) => selectedCategoryIds.includes(String(categoryId))),
      )
    }

    const min = minPrice !== '' ? Number(minPrice) : null
    const max = maxPrice !== '' ? Number(maxPrice) : null
    if (min !== null || max !== null) {
      result = result.filter((product) => {
        const price = getDiscountedPrice(product)
        if (min !== null && price < min) return false
        if (max !== null && price > max) return false
        return true
      })
    }

    const sorted = [...result]
    if (sortBy === 'price-asc') sorted.sort((a, b) => getDiscountedPrice(a) - getDiscountedPrice(b))
    else if (sortBy === 'price-desc') sorted.sort((a, b) => getDiscountedPrice(b) - getDiscountedPrice(a))
    else if (sortBy === 'name-asc') sorted.sort((a, b) => a.name.localeCompare(b.name, 'tr'))

    return sorted
  }, [products, selectedCategoryIds, minPrice, maxPrice, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const paginatedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const title =
    mode === 'search'
      ? `"${query.search || ''}" sonuçları`
      : mode === 'brand'
        ? 'Marka ürünleri'
        : mode === 'subcategory'
          ? params.subcategory
          : 'Tüm ürünler'

  const isSearch = mode === 'search'
  const hasActiveFilters = selectedCategoryIds.length > 0 || minPrice !== '' || maxPrice !== ''

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Seo
        title={title}
        description={`Evginler Ev Tekstili'nde ${title} - ${filteredProducts.length} ürün.`}
        url={`https://evginlerevtekstil.com${location.pathname}`}
      />

      {/* Page header */}
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-ink">
          {isSearch ? <Search className="h-5 w-5 text-white" /> : <LayoutGrid className="h-5 w-5 text-white" />}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-maroon">
            {isSearch ? 'Arama sonuçları' : 'Mağaza'}
          </p>
          <h1 className="mt-0.5 font-display text-3xl font-extrabold uppercase tracking-tight text-ink">{title}</h1>
          <p className="mt-1 text-sm text-muted">
            {isLoading
              ? 'Yükleniyor…'
              : filteredProducts.length > 0
                ? `${filteredProducts.length} ürün listeleniyor`
                : 'Sonuç bulunamadı'}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-md border border-border bg-white p-5">
            <FiltersPanel
              categories={categories}
              selectedCategoryIds={selectedCategoryIds}
              onToggleCategory={toggleCategory}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={(key, value) => (key === 'min' ? setMinPrice(value) : setMaxPrice(value))}
              onReset={resetFilters}
            />
          </div>
        </aside>

        <div>
          {/* Toolbar */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-bold text-ink lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtrele {hasActiveFilters ? `(${selectedCategoryIds.length + (minPrice || maxPrice ? 1 : 0)})` : ''}
            </button>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="ml-auto h-11 rounded-md border border-border bg-white px-3 text-sm font-medium text-ink outline-none focus:border-ink"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <ProductGrid
            products={paginatedProducts}
            isLoading={isLoading}
            onAddToCart={(product) => addItem.mutate({ productId: product._id })}
          />

          {/* Pagination */}
          {!isLoading && totalPages > 1 ? (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-10 rounded-md border border-border px-4 text-sm font-bold text-ink transition hover:border-ink disabled:opacity-30"
              >
                Önceki
              </button>
              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1
                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    className={`h-10 w-10 rounded-md text-sm font-bold transition ${
                      pageNumber === page ? 'bg-ink text-white' : 'border border-border text-ink hover:border-ink'
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-10 rounded-md border border-border px-4 text-sm font-bold text-ink transition hover:border-ink disabled:opacity-30"
              >
                Sonraki
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile filters sheet */}
      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setMobileFiltersOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-md bg-white p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-extrabold uppercase tracking-tight text-ink">Filtrele</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-ink"
                aria-label="Kapat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <FiltersPanel
              categories={categories}
              selectedCategoryIds={selectedCategoryIds}
              onToggleCategory={toggleCategory}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={(key, value) => (key === 'min' ? setMinPrice(value) : setMaxPrice(value))}
              onReset={resetFilters}
            />
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-6 w-full rounded-md bg-ink py-3 text-sm font-bold uppercase tracking-wide text-white"
            >
              Sonuçları göster ({filteredProducts.length})
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
