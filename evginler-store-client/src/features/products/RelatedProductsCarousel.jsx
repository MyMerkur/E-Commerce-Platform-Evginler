import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ProductCard } from './ProductCard'

export function RelatedProductsCarousel({ products, onAddToCart }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps' })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  useEffect(() => {
    if (!emblaApi) return undefined
    const updateScrollState = () => {
      setCanScrollPrev(emblaApi.canScrollPrev())
      setCanScrollNext(emblaApi.canScrollNext())
    }
    updateScrollState()
    emblaApi.on('select', updateScrollState)
    emblaApi.on('reInit', updateScrollState)
    return () => emblaApi.off('select', updateScrollState)
  }, [emblaApi])

  if (!products.length) return null

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="-ml-4 flex">
          {products.map((product) => (
            <div
              key={product._id}
              className="min-w-0 shrink-0 grow-0 basis-[75%] pl-4 sm:basis-[42%] lg:basis-[24%]"
            >
              <ProductCard product={product} onAddToCart={onAddToCart} />
            </div>
          ))}
        </div>
      </div>

      {canScrollPrev ? (
        <button
          type="button"
          onClick={() => emblaApi?.scrollPrev()}
          className="absolute -left-4 top-1/3 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-lg transition hover:bg-surface-muted sm:flex"
          aria-label="Önceki ürünler"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      ) : null}
      {canScrollNext ? (
        <button
          type="button"
          onClick={() => emblaApi?.scrollNext()}
          className="absolute -right-4 top-1/3 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-lg transition hover:bg-surface-muted sm:flex"
          aria-label="Sonraki ürünler"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  )
}
