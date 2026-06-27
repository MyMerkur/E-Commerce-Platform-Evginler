import { Heart, MapPin, PackageCheck, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { formatCurrency } from '../../utils/formatters'

const cards = [
  {
    title: 'Bilgilerim',
    description: 'Ad, soyad, e-posta ve telefon bilgilerinizi güncelleyin.',
    to: '/profile/info',
    icon: UserRound,
    color: 'bg-[#edf2eb] text-[#3d5e35]',
  },
  {
    title: 'Adreslerim',
    description: 'Teslimat ve fatura adreslerinizi ekleyip seçili adresinizi belirleyin.',
    to: '/profile/addresses',
    icon: MapPin,
    color: 'bg-[#edf2eb] text-[#3d5e35]',
  },
  {
    title: 'Siparişlerim',
    description: 'Devam eden ve tamamlanan siparişlerinizi takip edin.',
    to: '/profile/orders',
    icon: PackageCheck,
    color: 'bg-[#edf2eb] text-[#3d5e35]',
  },
  {
    title: 'Favorilerim',
    description: 'Daha sonra değerlendirmek istediğiniz ürünlere hızlıca ulaşın.',
    to: '/profile/favorites',
    icon: Heart,
    color: 'bg-[#f5ecee] text-[#7c2d3f]',
  },
]

export function ProfileOverview({ profile }) {
  const displayName =
    [profile?.name, profile?.surname].filter(Boolean).join(' ') || profile?.email || 'Evginler müşterisi'

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-xl bg-gradient-to-r from-[#edf2eb] to-[#f0ece4] p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-[#6b6058]">Hoş geldiniz</p>
        <p className="mt-1 text-xl font-bold text-[#1e1a17]">{displayName}</p>
        {profile?.email && (
          <p className="mt-1 text-sm text-[#6b6058]">{profile.email}</p>
        )}
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="group flex items-start gap-4 rounded-xl border border-[#ddd6c8] bg-white p-5 transition-all hover:border-[#7c2d3f] hover:shadow-md"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-[#1e1a17] transition-colors group-hover:text-[#7c2d3f]">
                {card.title}
              </h2>
              <p className="mt-1 text-sm leading-5 text-[#6b6058]">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function OrdersPreview({ orders }) {
  if (!orders?.length) {
    return (
      <EmptyState
        title="Henüz siparişiniz yok"
        description="Sipariş verdiğinizde durum, kargo ve ürün detayları burada görünecek."
        actionLabel="Alışverişe başla"
        actionTo="/products"
      />
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <article
          key={order._id || order.id}
          className="overflow-hidden rounded-xl border border-[#ddd6c8] bg-white shadow-sm"
        >
          <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-[#1e1a17]">Sipariş #{order.orderNumber || order._id || order.id}</p>
              <p className="mt-1 text-sm text-[#6b6058]">{order.status || 'Sipariş durumu hazırlanıyor'}</p>
            </div>
            <p className="font-bold text-[#3d5e35]">{formatCurrency(order.totalPrice || order.totalAmount)}</p>
          </div>
        </article>
      ))}
    </div>
  )
}

export function FavoritesPreview({ favorites }) {
  if (!favorites?.length) {
    return (
      <EmptyState
        title="Favori ürününüz yok"
        description="Beğendiğiniz ürünleri favorilere ekleyerek buradan takip edebilirsiniz."
        actionLabel="Ürünlere göz at"
        actionTo="/products"
      />
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {favorites.map((item) => {
        const product = item.product || item
        return (
          <article
            key={product._id || product.id}
            className="overflow-hidden rounded-xl border border-[#ddd6c8] bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <h2 className="font-bold text-[#1e1a17] line-clamp-2">{product.name || product.title}</h2>
            <p className="mt-2 text-sm font-bold text-[#3d5e35]">{formatCurrency(product.price)}</p>
            <Button as={Link} to={`/products/${product._id || product.id}`} variant="outline" size="sm" className="mt-4">
              Ürüne git
            </Button>
          </article>
        )
      })}
    </div>
  )
}
