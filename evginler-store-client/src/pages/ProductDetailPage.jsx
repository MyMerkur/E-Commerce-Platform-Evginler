import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Heart, ImageOff, Minus, Plus, ShieldCheck, ShoppingBag, Truck, Undo2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { storeApi } from '../api/storeApi'
import { userApi } from '../api/userApi'
import { Button } from '../components/Button'
import { LoadingState } from '../components/LoadingState'
import { SectionHeading } from '../components/SectionHeading'
import { Seo } from '../components/Seo'
import { useCartActions } from '../features/cart/useCartActions'
import { RelatedProductsCarousel } from '../features/products/RelatedProductsCarousel'
import { useAuthStore } from '../store/authStore'
import { formatCurrency, getDiscountedPrice, getProductImages } from '../utils/formatters'

const trustBadges = [
  { icon: Truck, label: '₺500+ ücretsiz kargo' },
  { icon: ShieldCheck, label: '3D Secure ödeme' },
  { icon: Undo2, label: 'Kolay iade' },
]

export function ProductDetailPage() {
  const { productId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [quantity, setQuantity] = useState(1)
  const [galleryState, setGalleryState] = useState({ productId: null, selectedImageIndex: 0, isLightboxOpen: false })
  const { addItem } = useCartActions()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => storeApi.getProduct(productId),
  })
  const { data: favorites = [] } = useQuery({
    queryKey: ['user', 'favorites'],
    queryFn: userApi.getFavorites,
    enabled: isAuthenticated,
    staleTime: 60_000,
    retry: false,
  })
  const primarySubcategory = product?.subcategories?.[0]
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['products', 'related', primarySubcategory],
    queryFn: () => storeApi.getProducts({ subcategory: primarySubcategory }),
    enabled: Boolean(primarySubcategory),
  })
  const filteredRelatedProducts = useMemo(
    () => relatedProducts.filter((item) => item._id !== productId).slice(0, 10),
    [relatedProducts, productId],
  )
  const isFavorite = favorites.some((favorite) => String(favorite._id || favorite.id) === String(productId))
  const favoriteMutation = useMutation({
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
  const images = useMemo(() => getProductImages(product), [product])
  const hasImages = images.length > 0
  const selectedImageIndex = galleryState.productId === productId ? galleryState.selectedImageIndex : 0
  const isLightboxOpen = galleryState.productId === productId && galleryState.isLightboxOpen
  const selectedImage = images[selectedImageIndex] || images[0]
  const updateGalleryState = useCallback((updater) => {
    setGalleryState((current) => {
      const baseState =
        current.productId === productId
          ? current
          : { productId, selectedImageIndex: 0, isLightboxOpen: false }

      return typeof updater === 'function' ? updater(baseState) : { ...baseState, ...updater }
    })
  }, [productId])
  const goToPreviousImage = useCallback(() => {
    if (!hasImages) return
    updateGalleryState((current) => ({
      ...current,
      selectedImageIndex: current.selectedImageIndex === 0 ? images.length - 1 : current.selectedImageIndex - 1,
    }))
  }, [hasImages, images.length, updateGalleryState])
  const goToNextImage = useCallback(() => {
    if (!hasImages) return
    updateGalleryState((current) => ({
      ...current,
      selectedImageIndex: current.selectedImageIndex === images.length - 1 ? 0 : current.selectedImageIndex + 1,
    }))
  }, [hasImages, images.length, updateGalleryState])

  useEffect(() => {
    if (!isLightboxOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        updateGalleryState({ isLightboxOpen: false })
      }

      if (event.key === 'ArrowLeft') {
        goToPreviousImage()
      }

      if (event.key === 'ArrowRight') {
        goToNextImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNextImage, goToPreviousImage, isLightboxOpen, updateGalleryState])

  if (isLoading) return <LoadingState label="Ürün detayı yükleniyor" />
  if (!product) return null

  const price = getDiscountedPrice(product)
  const hasDiscount = Number(product.discount || 0) > 0
  const isOutOfStock = product.stock <= 0

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta))
  }

  const productUrl = `https://evginlerevtekstil.com/products/${product._id}`
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || undefined,
    image: images.length ? images : undefined,
    sku: product.productCode || product._id,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'TRY',
      price: String(price),
      availability: isOutOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    },
  }

  return (
    <>
      <Seo
        title={product.name}
        description={product.description || `${product.name} - Evginler Ev Tekstili'nde uygun fiyatlarla.`}
        image={selectedImage}
        url={productUrl}
        type="product"
        jsonLd={productJsonLd}
      />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-5 flex items-center gap-1.5 text-xs font-semibold text-muted">
          <Link to="/" className="hover:text-maroon">Ana Sayfa</Link>
          <ChevronRight className="h-3 w-3 text-muted-light" />
          <Link to="/products" className="hover:text-maroon">Ürünler</Link>
          {primarySubcategory ? (
            <>
              <ChevronRight className="h-3 w-3 text-muted-light" />
              <Link to={`/subcategory/${encodeURIComponent(primarySubcategory)}`} className="hover:text-maroon">
                {primarySubcategory}
              </Link>
            </>
          ) : null}
          <ChevronRight className="h-3 w-3 text-muted-light" />
          <span className="truncate text-ink">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <div className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-md border border-border bg-white">
              {hasImages ? (
                <div className="group relative bg-surface-muted">
                  <button
                    type="button"
                    onClick={() => updateGalleryState({ isLightboxOpen: true })}
                    className="block w-full outline-none"
                    aria-label="Ürün görselini büyüt"
                  >
                    <img
                      src={selectedImage}
                      alt={product.name}
                      className="aspect-square w-full object-contain p-6 transition duration-500 group-hover:scale-[1.03] sm:p-8"
                    />
                  </button>
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={goToPreviousImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label="Önceki görsel"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={goToNextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label="Sonraki görsel"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <span className="absolute bottom-3 right-3 rounded-sm bg-ink px-2.5 py-1 text-xs font-bold text-white">
                        {selectedImageIndex + 1} / {images.length}
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 bg-surface-muted text-muted-light">
                  <ImageOff className="h-12 w-12 opacity-40" />
                  <p className="text-sm font-medium">Görsel bulunamadı</p>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {hasImages && images.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto [-webkit-overflow-scrolling:touch]">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => updateGalleryState({ selectedImageIndex: index })}
                    className={`h-18 w-20 shrink-0 overflow-hidden rounded-md border-2 bg-surface-muted transition-all sm:h-20 sm:w-24 ${
                      selectedImageIndex === index
                        ? 'border-ink'
                        : 'border-transparent hover:border-border'
                    }`}
                    aria-label={`${index + 1}. görseli seç`}
                  >
                    <img src={image} alt="" className="h-full w-full object-contain p-1.5" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-5">
            <div className="rounded-md border border-border bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-maroon">Ürün detayı</p>
              <h1 className="mt-2 font-display text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-3xl">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mt-5 flex items-baseline gap-3">
                <p className="font-display text-4xl font-extrabold text-ink">{formatCurrency(price)}</p>
                {hasDiscount ? (
                  <>
                    <p className="text-base text-muted-light line-through">{formatCurrency(product.price)}</p>
                    <span className="rounded-sm bg-maroon px-2.5 py-0.5 text-sm font-bold text-white">
                      %{product.discount} indirim
                    </span>
                  </>
                ) : null}
              </div>

              {/* Description */}
              {product.description ? (
                <p className="mt-4 leading-7 text-sm text-muted">{product.description}</p>
              ) : null}

              {/* Meta */}
              <div className="mt-5 flex flex-wrap gap-2">
                <span
                  className={`inline-flex rounded-sm px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                    isOutOfStock ? 'bg-surface-muted text-muted-light' : 'bg-olive text-white'
                  }`}
                >
                  {isOutOfStock ? 'Stok yok' : `${product.stock} adet stokta`}
                </span>
                {product.size ? (
                  <span className="inline-flex rounded-sm bg-surface-muted px-3 py-1 text-xs font-bold text-ink">
                    {product.size}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Quantity + Add to cart (desktop) */}
            <div className="hidden rounded-md border border-border bg-white p-6 lg:block">
              <div className="flex flex-wrap items-center gap-4">
                {/* Qty stepper */}
                <div className="flex items-center gap-1 rounded-md border border-border p-1">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded text-muted transition hover:bg-surface-muted disabled:opacity-30"
                    aria-label="Azalt"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-ink">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    className="flex h-8 w-8 items-center justify-center rounded text-muted transition hover:bg-surface-muted"
                    aria-label="Artır"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <Button
                  onClick={() => addItem.mutate({ productId: product._id, quantity })}
                  disabled={isOutOfStock || addItem.isPending}
                  className="flex-1"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {isOutOfStock ? 'Stok yok' : 'Sepete ekle'}
                </Button>

                <button
                  type="button"
                  onClick={() => favoriteMutation.mutate()}
                  disabled={favoriteMutation.isPending}
                  className={`flex h-11 w-11 items-center justify-center rounded-md border transition ${
                    isFavorite
                      ? 'border-maroon bg-[#f5ecee] text-maroon'
                      : 'border-border text-muted-light hover:border-maroon hover:text-maroon'
                  }`}
                  aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Trust badges */}
            <div className="rounded-md border border-border bg-surface-muted p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                {trustBadges.map((badge) => (
                  <div key={badge.label} className="flex items-center gap-2.5">
                    <badge.icon className="h-4 w-4 shrink-0 text-olive" />
                    <p className="text-xs font-semibold text-muted">{badge.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {filteredRelatedProducts.length > 0 ? (
          <div className="mt-16">
            <SectionHeading eyebrow="Benzer ürünler" title="Bunları da beğenebilirsiniz" />
            <RelatedProductsCarousel
              products={filteredRelatedProducts}
              onAddToCart={(item) => addItem.mutate({ productId: item._id })}
            />
          </div>
        ) : null}
      </section>

      {/* Sticky mobile add-to-cart */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="flex items-center gap-1 rounded-md border border-border p-1">
            <button
              type="button"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="flex h-8 w-8 items-center justify-center rounded text-muted transition hover:bg-surface-muted disabled:opacity-30"
              aria-label="Azalt"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-ink">{quantity}</span>
            <button
              type="button"
              onClick={() => handleQuantityChange(1)}
              className="flex h-8 w-8 items-center justify-center rounded text-muted transition hover:bg-surface-muted"
              aria-label="Artır"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <Button
            onClick={() => addItem.mutate({ productId: product._id, quantity })}
            disabled={isOutOfStock || addItem.isPending}
            className="flex-1"
          >
            <ShoppingBag className="h-4 w-4" />
            {isOutOfStock ? 'Stok yok' : `Sepete ekle — ${formatCurrency(price * quantity)}`}
          </Button>

          <button
            type="button"
            onClick={() => favoriteMutation.mutate()}
            disabled={favoriteMutation.isPending}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md border transition ${
              isFavorite
                ? 'border-maroon bg-[#f5ecee] text-maroon'
                : 'border-border text-muted-light hover:text-maroon'
            }`}
            aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bottom padding for sticky bar on mobile */}
      <div className="h-20 lg:hidden" aria-hidden="true" />

      {/* Lightbox */}
      {isLightboxOpen && hasImages ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4 py-6"
          onClick={() => updateGalleryState({ isLightboxOpen: false })}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative flex h-full w-full max-w-5xl items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => updateGalleryState({ isLightboxOpen: false })}
              className="absolute right-0 top-0 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-ink shadow-lg transition hover:bg-white"
              aria-label="Görseli kapat"
            >
              <X className="h-5 w-5" />
            </button>
            {images.length > 1 ? (
              <button
                type="button"
                onClick={goToPreviousImage}
                className="absolute left-0 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-ink shadow-lg transition hover:bg-white sm:left-4"
                aria-label="Önceki görsel"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            ) : null}
            <img
              src={selectedImage}
              alt={product.name}
              className="max-h-[84vh] max-w-full rounded-md object-contain shadow-2xl"
            />
            {images.length > 1 ? (
              <button
                type="button"
                onClick={goToNextImage}
                className="absolute right-0 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-ink shadow-lg transition hover:bg-white sm:right-4"
                aria-label="Sonraki görsel"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            ) : null}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-ink shadow">
              {selectedImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
