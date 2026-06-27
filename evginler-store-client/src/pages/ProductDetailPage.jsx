import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Heart, ImageOff, Minus, Plus, ShieldCheck, ShoppingBag, Truck, Undo2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { storeApi } from '../api/storeApi'
import { userApi } from '../api/userApi'
import { Button } from '../components/Button'
import { LoadingState } from '../components/LoadingState'
import { useCartActions } from '../features/cart/useCartActions'
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

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <div className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-xl border border-[#ddd6c8] bg-white shadow-sm">
              {hasImages ? (
                <div className="group relative bg-[#f0ece4]">
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
                        className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#1e1a17] shadow-md transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label="Önceki görsel"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={goToNextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#1e1a17] shadow-md transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label="Sonraki görsel"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-[#1e1a17] shadow">
                        {selectedImageIndex + 1} / {images.length}
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 bg-[#f0ece4] text-[#8c7e72]">
                  <ImageOff className="h-12 w-12 opacity-40" />
                  <p className="text-sm font-medium">Görsel bulunamadı</p>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {hasImages && images.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto rounded-xl [-webkit-overflow-scrolling:touch]">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => updateGalleryState({ selectedImageIndex: index })}
                    className={`h-18 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-[#f0ece4] transition-all sm:h-20 sm:w-24 ${
                      selectedImageIndex === index
                        ? 'border-[#7c2d3f] shadow-md'
                        : 'border-transparent hover:border-[#c5bbb0]'
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
            <div className="rounded-xl border border-[#ddd6c8] bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-[#7c2d3f]">Ürün detayı</p>
              <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-[#1e1a17] sm:text-3xl">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mt-5 flex items-baseline gap-3">
                <p className="text-3xl font-bold text-[#3d5e35]">{formatCurrency(price)}</p>
                {hasDiscount ? (
                  <>
                    <p className="text-base text-[#a49588] line-through">{formatCurrency(product.price)}</p>
                    <span className="rounded-full bg-[#f5ecee] px-2.5 py-0.5 text-sm font-bold text-[#7c2d3f]">
                      %{product.discount} indirim
                    </span>
                  </>
                ) : null}
              </div>

              {/* Description */}
              {product.description ? (
                <p className="mt-4 leading-7 text-sm text-[#6b6058]">{product.description}</p>
              ) : null}

              {/* Meta */}
              <div className="mt-5 flex flex-wrap gap-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                  isOutOfStock
                    ? 'bg-[#f0ece4] text-[#8c7e72]'
                    : 'bg-[#edf2eb] text-[#3d5e35]'
                }`}>
                  {isOutOfStock ? 'Stok yok' : `${product.stock} adet stokta`}
                </span>
                {product.size ? (
                  <span className="inline-flex rounded-full bg-[#f0ece4] px-3 py-1 text-xs font-bold text-[#5f5148]">
                    {product.size}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Quantity + Add to cart (desktop) */}
            <div className="hidden rounded-xl border border-[#ddd6c8] bg-white p-6 shadow-sm lg:block">
              <div className="flex flex-wrap items-center gap-4">
                {/* Qty stepper */}
                <div className="flex items-center gap-1 rounded-xl border border-[#ddd6c8] p-1">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5f5148] transition hover:bg-[#f0ece4] disabled:opacity-30"
                    aria-label="Azalt"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-[#1e1a17]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5f5148] transition hover:bg-[#f0ece4]"
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
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                    isFavorite
                      ? 'border-[#7c2d3f] bg-[#f5ecee] text-[#7c2d3f]'
                      : 'border-[#ddd6c8] text-[#8c7e72] hover:border-[#7c2d3f] hover:text-[#7c2d3f]'
                  }`}
                  aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Trust badges */}
            <div className="rounded-xl border border-[#ddd6c8] bg-[#faf8f4] p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                {trustBadges.map((badge) => (
                  <div key={badge.label} className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                      <badge.icon className="h-4 w-4 text-[#3d5e35]" />
                    </div>
                    <p className="text-xs font-semibold text-[#5f5148]">{badge.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky mobile add-to-cart */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#ddd6c8] bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-[#ddd6c8] p-1">
            <button
              type="button"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5f5148] transition hover:bg-[#f0ece4] disabled:opacity-30"
              aria-label="Azalt"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-[#1e1a17]">{quantity}</span>
            <button
              type="button"
              onClick={() => handleQuantityChange(1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5f5148] transition hover:bg-[#f0ece4]"
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
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${
              isFavorite
                ? 'border-[#7c2d3f] bg-[#f5ecee] text-[#7c2d3f]'
                : 'border-[#ddd6c8] text-[#8c7e72] hover:text-[#7c2d3f]'
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
              className="absolute right-0 top-0 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#1e1a17] shadow-lg transition hover:bg-white"
              aria-label="Görseli kapat"
            >
              <X className="h-5 w-5" />
            </button>
            {images.length > 1 ? (
              <button
                type="button"
                onClick={goToPreviousImage}
                className="absolute left-0 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#1e1a17] shadow-lg transition hover:bg-white sm:left-4"
                aria-label="Önceki görsel"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            ) : null}
            <img
              src={selectedImage}
              alt={product.name}
              className="max-h-[84vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
            {images.length > 1 ? (
              <button
                type="button"
                onClick={goToNextImage}
                className="absolute right-0 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#1e1a17] shadow-lg transition hover:bg-white sm:right-4"
                aria-label="Sonraki görsel"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            ) : null}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-[#1e1a17] shadow">
              {selectedImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
