import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Award,
  BedDouble,
  ChevronRight,
  Home,
  MapPin,
  Package,
  ShieldCheck,
  Sofa,
  Star,
  Truck,
  Undo2,
} from 'lucide-react'
import { storeApi } from '../api/storeApi'
import { LoadingState } from '../components/LoadingState'
import { SectionHeading } from '../components/SectionHeading'
import { Seo } from '../components/Seo'
import { HeroCarousel } from '../features/home/HeroCarousel'
import { NewsletterBlock } from '../features/home/NewsletterBlock'
import { ProductGrid } from '../features/products/ProductGrid'
import { useCartActions } from '../features/cart/useCartActions'
import { getProductImage } from '../utils/formatters'

const trustItems = [
  { icon: Truck, title: 'Hızlı teslimat', text: '₺500 üzeri siparişlerde ücretsiz' },
  { icon: ShieldCheck, title: 'Güvenli alışveriş', text: '3D Secure ile korunan ödeme' },
  { icon: Undo2, title: 'Kolay iade', text: 'Teslim sonrası iade talebi' },
]

const categoryIconMap = [
  { keys: ['tekstil', 'nevresim', 'havlu', 'battaniye'], icon: Home },
  { keys: ['mobilya', 'koltuk', 'sandalye', 'masa'], icon: Sofa },
  { keys: ['züccaciye', 'mutfak', 'porselen'], icon: Star },
  { keys: ['giyim', 'kıyafet'], icon: Package },
  { keys: ['çeyiz', 'gelinlik', 'nikah'], icon: BedDouble },
  { keys: ['perde', 'tülbent', 'stor'], icon: Package },
  { keys: ['yatak', 'yorgan', 'yastık'], icon: BedDouble },
]

const categoryBlockStyles = ['bg-ink', 'bg-maroon', 'bg-olive', 'bg-[#5c4a34]']

function getCategoryIcon(name = '') {
  const lower = name.toLowerCase()
  for (const entry of categoryIconMap) {
    if (entry.keys.some((k) => lower.includes(k))) return entry.icon
  }
  return Home
}

function buildHeroSlides({ products = [], categories = [] }) {
  const heroProduct = products[0]
  const heroCategory = categories[0]

  return [
    {
      key: 'brand',
      bg: 'bg-ink',
      eyebrow: 'Ardahan Merkez',
      title: "Ardahan'ın ev yaşam mağazası",
      text: "Ev tekstilinden mobilyaya, çeyiz setlerinden züccaciyeye — eviniz için ihtiyacınız olan her şey tek adreste.",
      cta: { label: 'Ürünleri incele', to: '/products' },
      image: heroProduct ? getProductImage(heroProduct) : null,
    },
    {
      key: 'shipping',
      bg: 'bg-maroon',
      eyebrow: 'Kampanya',
      title: '₺500 üzeri kargo bizden',
      text: 'Siparişini tamamla, kapına kadar ücretsiz ve hızlı teslimat ile gelsin.',
      cta: { label: 'Alışverişe başla', to: '/products' },
      image: null,
    },
    heroCategory
      ? {
          key: 'category',
          bg: 'bg-olive',
          eyebrow: 'Kategori',
          title: heroCategory.name,
          text: (heroCategory.subcategories || []).slice(0, 3).join(' · ') || 'Geniş seçki',
          cta: {
            label: 'Kategoriye git',
            to: `/subcategory/${encodeURIComponent(heroCategory.subcategories?.[0] || heroCategory.name)}`,
          },
          image: null,
        }
      : null,
  ].filter(Boolean)
}

function FadeInSection({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

export function HomePage() {
  const { data, isLoading } = useQuery({ queryKey: ['store', 'home'], queryFn: storeApi.getHome })
  const { addItem } = useCartActions()

  if (isLoading) return <LoadingState label="Mağaza hazırlanıyor" />

  const categories = data?.categories || []
  const products = data?.products || []
  const brands = data?.brands || []
  const heroSlides = buildHeroSlides({ products, categories })

  return (
    <div>
      <Seo />

      <HeroCarousel slides={heroSlides} />

      {/* Trust strip */}
      <section className="border-y border-border bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-5 sm:grid-cols-3 sm:px-6 lg:px-8">
          {trustItems.map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <item.icon className="h-5 w-5 shrink-0 text-olive" />
              <div>
                <p className="text-sm font-bold text-ink">{item.title}</p>
                <p className="text-xs text-muted">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand story */}
      <FadeInSection>
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr]">
              <div className="lg:pt-2">
                <p className="text-xs font-bold uppercase tracking-widest text-maroon">Evginler Hakkında</p>
                <h2 className="mt-3 font-display text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-4xl">
                  Ardahan'da eviniz için aradığınız her şey
                </h2>
                <p className="mt-5 text-base leading-8 text-muted">
                  Evginler; ev tekstili, mobilya, züccaciye ve giyim ürünlerinde geniş seçenek sunan köklü bir yerel
                  mağazadır. Yıllardır Ardahan halkına hizmet vermenin gururuyla kaliteli ürünleri uygun fiyatlarla
                  sunuyoruz.
                </p>
                <Link
                  to="/products"
                  className="mt-8 inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-black"
                >
                  Tüm ürünleri gör <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: MapPin, title: 'Ardahan Merkez', text: 'Şehrin kalbinde, yıllardır hizmetinizde' },
                  { icon: Award, title: 'Köklü Mağaza', text: 'Uzun yıllardır güvenilir hizmet ve kalite' },
                  { icon: Package, title: 'Geniş Ürün Yelpazesi', text: 'Ev tekstilinden mobilyaya, züccaciyeye' },
                  { icon: ShieldCheck, title: 'Güvenli Alışveriş', text: 'Kaliteli ürün, güvenli online ödeme' },
                ].map((item) => (
                  <div key={item.title} className="rounded-md border border-border bg-surface-muted p-4 transition-colors hover:border-ink">
                    <item.icon className="h-5 w-5 text-maroon" />
                    <h3 className="mt-3 text-sm font-bold text-ink">{item.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-muted">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Categories */}
      {categories.length > 0 && (
        <FadeInSection>
          <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Kategoriler" title="Evinizin ihtiyacına göre" linkTo="/products" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {categories.slice(0, 8).map((category, index) => {
                const IconComp = getCategoryIcon(category.name)
                const blockStyle = categoryBlockStyles[index % categoryBlockStyles.length]
                return (
                  <motion.div key={category._id} whileHover={{ y: -4 }} transition={{ duration: 0.15 }}>
                    <Link
                      to={`/subcategory/${encodeURIComponent(category.subcategories?.[0] || category.name)}`}
                      className={`group relative flex min-h-40 flex-col justify-between overflow-hidden rounded-md p-5 shadow-sm ${blockStyle}`}
                    >
                      <IconComp className="h-6 w-6 text-white/70" />
                      <div>
                        <h3 className="font-display text-lg font-extrabold uppercase leading-tight tracking-tight text-white">
                          {category.name}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-white/60 line-clamp-2">
                          {category.subcategories?.slice(0, 3).join(' · ') || 'Seçki'}
                        </p>
                      </div>
                      <ChevronRight className="absolute right-4 top-5 h-4 w-4 text-white/50 transition-all group-hover:translate-x-0.5 group-hover:text-white" />
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </section>
        </FadeInSection>
      )}

      {/* Featured products */}
      <FadeInSection>
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Öne çıkanlar" title="Ev için seçtiklerimiz" linkTo="/products" linkLabel="Tüm ürünler" />
          <ProductGrid products={products} onAddToCart={(product) => addItem.mutate({ productId: product._id })} />
        </section>
      </FadeInSection>

      <NewsletterBlock />

      {/* Brands */}
      {brands.length ? (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-light">Markalar</p>
          <h2 className="mt-1.5 font-display text-xl font-extrabold uppercase tracking-tight text-ink">
            Seçkin koleksiyonlar
          </h2>
          <div className="mt-5 flex gap-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
            {brands.map((brand) => (
              <Link
                key={brand._id}
                to={`/brand/${brand._id}`}
                className="flex min-w-40 shrink-0 items-center gap-3 rounded-md border border-border px-4 py-3 transition hover:border-ink hover:bg-white"
              >
                {brand.imageUrl ? (
                  <img src={brand.imageUrl} alt="" className="h-8 w-8 rounded-sm object-cover" />
                ) : null}
                <span className="text-sm font-bold text-ink">{brand.name}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
