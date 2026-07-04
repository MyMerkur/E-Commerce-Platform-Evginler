import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  BedDouble,
  ChevronRight,
  Heart,
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
import { Seo } from '../components/Seo'
import { Button } from '../components/Button'
import { ProductGrid } from '../features/products/ProductGrid'
import { useCartActions } from '../features/cart/useCartActions'
import { getProductImage } from '../utils/formatters'

const trustItems = [
  { icon: Truck, title: 'Hızlı teslimat', text: '₺500 üzeri siparişlerde ücretsiz' },
  { icon: ShieldCheck, title: 'Güvenli alışveriş', text: '3D Secure ile korunan ödeme' },
  { icon: Undo2, title: 'Kolay iade', text: 'Teslim sonrası iade talebi' },
]

const categoryIconMap = [
  { keys: ['tekstil', 'nevresim', 'havlu', 'battaniye'], icon: Home, bg: 'bg-[#edf2eb]', text: 'text-[#3d5e35]' },
  { keys: ['mobilya', 'koltuk', 'sandalye', 'masa'], icon: Sofa, bg: 'bg-[#f0ece4]', text: 'text-[#7a6040]' },
  { keys: ['züccaciye', 'mutfak', 'porselen'], icon: Star, bg: 'bg-[#f7f1e3]', text: 'text-[#b8914a]' },
  { keys: ['giyim', 'kıyafet'], icon: Package, bg: 'bg-[#f5ecee]', text: 'text-[#7c2d3f]' },
  { keys: ['çeyiz', 'gelinlik', 'nikah'], icon: BedDouble, bg: 'bg-[#f5ecee]', text: 'text-[#7c2d3f]' },
  { keys: ['perde', 'tülbent', 'stor'], icon: Package, bg: 'bg-[#edf2eb]', text: 'text-[#3d5e35]' },
  { keys: ['yatak', 'yorgan', 'yastık'], icon: BedDouble, bg: 'bg-[#f0ece4]', text: 'text-[#7a6040]' },
]

function getIconConfig(name = '') {
  const lower = name.toLowerCase()
  for (const entry of categoryIconMap) {
    if (entry.keys.some((k) => lower.includes(k))) {
      return { icon: entry.icon, bg: entry.bg, text: entry.text }
    }
  }
  return { icon: Home, bg: 'bg-[#edf2eb]', text: 'text-[#3d5e35]' }
}

export function HomePage() {
  const { data, isLoading } = useQuery({ queryKey: ['store', 'home'], queryFn: storeApi.getHome })
  const { addItem } = useCartActions()

  if (isLoading) return <LoadingState label="Mağaza hazırlanıyor" />

  const categories = data?.categories || []
  const products = data?.products || []
  const brands = data?.brands || []

  return (
    <div>
      <Seo />
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:gap-12 lg:px-8 lg:py-20">
          {/* Text */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#b8d4b4] bg-[#edf2eb] px-3.5 py-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#3d5e35]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#3d5e35]">Ardahan Merkez</span>
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-[1.18] tracking-tight text-[#1e1a17] sm:text-4xl lg:text-5xl">
              Ardahan'ın{' '}
              ev yaşam{' '}
              <span className="text-[#7c2d3f]">mağazası</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#6b6058]">
              Ev tekstilinden mobilyaya, çeyiz setlerinden züccaciyeye — Evginler'de eviniz için ihtiyacınız olan her
              şey, güvenilir ve kaliteli.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} to="/products" size="lg">
                Ürünleri İncele <ArrowRight className="h-4 w-4" />
              </Button>
              <Button as={Link} to="/products" variant="outline" size="lg">
                Çeyiz &amp; Ev Tekstili
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-5 text-xs font-medium text-[#8c7e72]">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3d5e35]" />
                Ardahan Merkez
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3d5e35]" />
                Geniş ürün yelpazesi
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7c2d3f]" />
                Güvenilir yerel mağaza
              </span>
            </div>
          </div>

          {/* Visual composition */}
          <div className="relative min-h-64 overflow-hidden rounded-2xl bg-[#e8e2d8] shadow-xl sm:min-h-80 lg:min-h-[480px]">
            {/* Subtle dot texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #1e1a17 1px, transparent 0)',
                backgroundSize: '20px 20px',
              }}
            />

            {/* Main image card */}
            <div className="absolute inset-4 overflow-hidden rounded-xl shadow-lg sm:right-[120px]">
              {products[0] ? (
                <img
                  src={getProductImage(products[0])}
                  alt={products[0].name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-[#d4c8bc]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e1a17]/40 via-transparent to-transparent" />
              {products[0] && (
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="line-clamp-1 text-[11px] font-bold text-white/90 drop-shadow">{products[0].name}</p>
                </div>
              )}
            </div>

            {/* Floating card — Çeyiz Setleri */}
            <div
              className="absolute right-2.5 top-4 z-10 hidden w-[108px] sm:block"
              style={{ animation: 'float 4s ease-in-out infinite' }}
            >
              <div className="rounded-xl border border-white/60 bg-white/95 p-2.5 shadow-lg backdrop-blur-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5ecee]">
                  <Heart className="h-3.5 w-3.5 text-[#7c2d3f]" />
                </div>
                <p className="mt-2 text-[11px] font-bold leading-tight text-[#1e1a17]">Çeyiz Setleri</p>
                <p className="mt-0.5 text-[9px] text-[#8c7e72]">Geniş koleksiyon</p>
              </div>
            </div>

            {/* Floating card — Taç Perdeler */}
            <div
              className="absolute right-2.5 z-10 hidden w-[108px] sm:block"
              style={{ top: 'calc(34% - 36px)', animation: 'float 5s ease-in-out infinite 1.2s' }}
            >
              <div className="rounded-xl border border-white/60 bg-white/95 p-2.5 shadow-lg backdrop-blur-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf2eb]">
                  <Star className="h-3.5 w-3.5 text-[#3d5e35]" />
                </div>
                <p className="mt-2 text-[11px] font-bold leading-tight text-[#1e1a17]">Taç Perdeler</p>
                <p className="mt-0.5 text-[9px] text-[#8c7e72]">Yetkili satıcı</p>
              </div>
            </div>

            {/* Floating card — Mutfak & Züccaciye */}
            <div
              className="absolute bottom-4 right-2.5 z-10 hidden w-[108px] sm:block"
              style={{ animation: 'float 3.8s ease-in-out infinite 0.7s' }}
            >
              <div className="rounded-xl border border-white/60 bg-white/95 p-2.5 shadow-lg backdrop-blur-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f7f1e3]">
                  <Package className="h-3.5 w-3.5 text-[#b8914a]" />
                </div>
                <p className="mt-2 text-[11px] font-bold leading-tight text-[#1e1a17]">Mutfak &amp; Züccaciye</p>
                <p className="mt-0.5 text-[9px] text-[#8c7e72]">Kaliteli ürünler</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-[#ddd6c8] bg-[#faf8f4]">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-5 sm:grid-cols-3 sm:px-6 lg:px-8">
          {trustItems.map((item) => (
            <div key={item.title} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm border border-[#e8e0d2]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf2eb]">
                <item.icon className="h-5 w-5 text-[#3d5e35]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1e1a17]">{item.title}</p>
                <p className="text-xs text-[#6b6058]">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand story */}
      <section className="bg-[#2a2420]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr]">
            <div className="lg:pt-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b8914a]">Evginler Hakkında</p>
              <h2 className="mt-3 text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl">
                Ardahan'da eviniz için aradığınız her şey
              </h2>
              <p className="mt-4 text-base leading-8 text-[#bfb4aa]">
                Evginler; ev tekstili, mobilya, züccaciye ve giyim ürünlerinde geniş seçenek sunan köklü bir yerel
                mağazadır. Yıllardır Ardahan halkına hizmet vermenin gururuyla kaliteli ürünleri uygun fiyatlarla
                sunuyoruz.
              </p>
              <Button as={Link} to="/products" variant="secondary" size="lg" className="mt-8">
                Tüm ürünleri gör <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: MapPin, title: 'Ardahan Merkez', text: 'Şehrin kalbinde, yıllardır hizmetinizde' },
                { icon: Award, title: 'Köklü Mağaza', text: 'Uzun yıllardır güvenilir hizmet ve kalite' },
                { icon: Package, title: 'Geniş Ürün Yelpazesi', text: 'Ev tekstilinden mobilyaya, züccaciyeye' },
                { icon: ShieldCheck, title: 'Güvenli Alışveriş', text: 'Kaliteli ürün, güvenli online ödeme' },
              ].map((item) => (
                <div key={item.title} className="rounded-xl bg-white/[0.07] p-4 transition-colors hover:bg-white/[0.12]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-white">{item.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-[#bfb4aa]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#7c2d3f]">Kategoriler</p>
              <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-[#1e1a17]">Evinizin ihtiyacına göre</h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#7c2d3f] hover:underline"
            >
              Tümünü gör <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.slice(0, 8).map((category) => {
              const config = getIconConfig(category.name)
              const IconComp = config.icon
              return (
                <Link
                  key={category._id}
                  to={`/subcategory/${encodeURIComponent(category.subcategories?.[0] || category.name)}`}
                  className="group relative overflow-hidden rounded-xl border border-[#ddd6c8] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#7c2d3f] hover:shadow-md"
                >
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${config.bg}`}>
                    <IconComp className={`h-5 w-5 ${config.text}`} />
                  </div>
                  <h3 className="pr-5 font-bold text-[#1e1a17] transition-colors group-hover:text-[#7c2d3f]">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[#6b6058] line-clamp-2">
                    {category.subcategories?.slice(0, 3).join(' · ') || 'Seçki'}
                  </p>
                  <ChevronRight className="absolute right-4 top-5 h-4 w-4 text-[#c5bbb0] transition-all group-hover:translate-x-0.5 group-hover:text-[#7c2d3f]" />
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#7c2d3f]">Öne çıkanlar</p>
            <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-[#1e1a17]">Ev için seçtiklerimiz</h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#7c2d3f] hover:underline"
          >
            Tüm ürünler <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <ProductGrid products={products} onAddToCart={(product) => addItem.mutate({ productId: product._id })} />
        {products.length > 0 && (
          <div className="mt-10 text-center">
            <Button as={Link} to="/products" variant="outline" size="lg">
              Tüm ürünleri gör <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </section>

      {/* Brands */}
      {brands.length ? (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-xl border border-[#ddd6c8] bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-[#8c7e72]">Markalar</p>
            <h2 className="mt-1.5 text-xl font-bold text-[#1e1a17]">Seçkin koleksiyonlar</h2>
            <div className="mt-5 flex gap-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
              {brands.map((brand) => (
                <Link
                  key={brand._id}
                  to={`/brand/${brand._id}`}
                  className="flex min-w-40 shrink-0 items-center gap-3 rounded-xl border border-[#ddd6c8] px-4 py-3 transition hover:border-[#7c2d3f] hover:bg-[#f5ecee]"
                >
                  {brand.imageUrl ? (
                    <img src={brand.imageUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
                  ) : null}
                  <span className="text-sm font-bold text-[#1e1a17]">{brand.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
