import useEmblaCarousel from 'embla-carousel-react'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export function HeroCarousel({ slides }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (!emblaApi) return undefined
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    onSelect()
    return () => emblaApi.off('select', onSelect)
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi || slides.length < 2) return undefined
    const interval = setInterval(() => emblaApi.scrollNext(), 6000)
    return () => clearInterval(interval)
  }, [emblaApi, slides.length])

  if (!slides.length) return null

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide) => (
            <div key={slide.key} className={`relative min-w-0 flex-[0_0_100%] ${slide.bg}`}>
              <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:min-h-[480px] lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-0">
                <div className="relative z-10">
                  <span className="inline-flex items-center rounded-sm bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
                    {slide.eyebrow}
                  </span>
                  <h1 className="mt-5 font-display text-4xl font-black uppercase leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl">
                    {slide.title}
                  </h1>
                  {slide.text ? (
                    <p className="mt-5 max-w-md text-sm leading-7 text-white/75 sm:text-base">{slide.text}</p>
                  ) : null}
                  <Link
                    to={slide.cta.to}
                    className="mt-8 inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-ink transition hover:bg-white/90"
                  >
                    {slide.cta.label} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {slide.image ? (
                  <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-md shadow-2xl lg:max-w-none">
                    <img src={slide.image} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.06]"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
                      backgroundSize: '24px 24px',
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 ? (
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.key}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`${index + 1}. slayta git`}
              className={`h-1.5 rounded-full transition-all ${
                index === selectedIndex ? 'w-7 bg-white' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
