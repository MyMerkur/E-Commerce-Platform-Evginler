import { Heart, LogOut, Menu, PackageCheck, Search, ShoppingBag, Truck, UserRound, X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '../api/authApi'
import { useAuthEvents } from '../hooks/useAuthEvents'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'

const navItems = [
  { label: 'Ana Sayfa', to: '/' },
  { label: 'Ürünler', to: '/products' },
]

function HeaderLink({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-[#f5ecee] text-[#7c2d3f] font-semibold'
            : 'text-[#5f5148] hover:bg-[#f0ece4] hover:text-[#1e1a17]'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export function StoreLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  useAuthEvents()
  const { data } = useAuth()
  useCart()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated || data?.isAuthenticated)
  const user = useAuthStore((state) => state.user || data?.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const clearCart = useCartStore((state) => state.clearCart)
  const itemCount = useCartStore((state) => state.getItemCount())
  const logout = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearAuth()
      clearCart()
      queryClient.removeQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      toast.success('Çıkış yapıldı.')
      navigate('/')
      setMobileOpen(false)
    },
  })

  const submitSearch = (event) => {
    event.preventDefault()
    const query = search.trim()
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
      setMobileOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f4] text-[#1e1a17]">
      {/* Announcement bar */}
      <div className="bg-[#3d5e35] px-4 py-2 text-center text-xs font-medium text-white/90">
        <span className="inline-flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5" />
          ₺500 ve üzeri siparişlerde <strong className="text-white">ücretsiz kargo</strong>
        </span>
      </div>

      <header className="sticky top-0 z-40 border-b border-[#ddd6c8] bg-white/96 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#ddd6c8] text-[#5f5148] transition hover:bg-[#f0ece4] lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Menüyü aç"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <img
              src="/img/logo.jpg"
              alt="Evginler Ev Tekstili"
              className="h-10 w-10 rounded-xl object-contain shadow-sm"
            />
            <span className="hidden sm:block">
              <span className="block text-lg font-bold tracking-tight text-[#1e1a17]">Evginler</span>
              <span className="block text-[10px] font-medium uppercase tracking-widest text-[#8c7e72]">
                Ev yaşam mağazası
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {navItems.map((item) => (
              <HeaderLink key={item.to} to={item.to}>
                {item.label}
              </HeaderLink>
            ))}
          </nav>

          {/* Search */}
          <form onSubmit={submitSearch} className="ml-auto hidden max-w-sm flex-1 items-center lg:flex">
            <label className="flex w-full items-center gap-2 rounded-xl border border-[#ddd6c8] bg-[#faf8f4] px-3.5 py-2.5 transition focus-within:border-[#3d5e35] focus-within:bg-white focus-within:shadow-sm">
              <Search className="h-4 w-4 shrink-0 text-[#8c7e72]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nevresim, havlu, battaniye ara…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#a49588]"
              />
            </label>
          </form>

          {/* Auth + Cart */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="group relative hidden sm:block">
                <Link
                  to="/profile"
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#ddd6c8] px-3 text-sm font-medium transition hover:bg-[#f0ece4] hover:border-[#c5bbb0]"
                >
                  <UserRound className="h-4 w-4 text-[#3d5e35]" />
                  <span className="max-w-28 truncate">{user?.name || 'Hesabım'}</span>
                </Link>
                <div className="invisible absolute right-0 top-12 z-50 w-56 rounded-xl border border-[#ddd6c8] bg-white p-2 opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:opacity-100">
                  <Link
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm hover:bg-[#f0ece4]"
                    to="/profile"
                  >
                    <UserRound className="h-4 w-4 text-[#3d5e35]" /> Profil
                  </Link>
                  <Link
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm hover:bg-[#f0ece4]"
                    to="/profile/orders"
                  >
                    <PackageCheck className="h-4 w-4 text-[#3d5e35]" /> Siparişler
                  </Link>
                  <Link
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm hover:bg-[#f0ece4]"
                    to="/profile/favorites"
                  >
                    <Heart className="h-4 w-4 text-[#3d5e35]" /> Favoriler
                  </Link>
                  <div className="my-1.5 border-t border-[#ddd6c8]" />
                  <button
                    type="button"
                    onClick={() => logout.mutate()}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-[#7c2d3f] hover:bg-[#f5ecee]"
                  >
                    <LogOut className="h-4 w-4" /> Çıkış yap
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  to="/login"
                  className="h-10 rounded-lg border border-[#ddd6c8] px-4 py-2 text-sm font-medium transition hover:bg-[#f0ece4] hover:border-[#c5bbb0]"
                >
                  Giriş
                </Link>
                <Link
                  to="/register"
                  className="h-10 rounded-lg bg-[#7c2d3f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6a2535] hover:shadow-md"
                >
                  Kayıt ol
                </Link>
              </div>
            )}

            {/* Cart button */}
            <Link
              to="/cart"
              className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#7c2d3f] text-white shadow-sm transition hover:bg-[#6a2535] hover:shadow-md active:scale-95"
              aria-label={`Sepet${itemCount > 0 ? `, ${itemCount} ürün` : ''}`}
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#3d5e35] px-1 text-center text-[10px] font-bold leading-none">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="h-full w-80 max-w-[88vw] overflow-y-auto bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#ddd6c8] p-4">
              <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                <img
                  src="/img/logo.jpg"
                  alt="Evginler"
                  className="h-9 w-9 rounded-xl object-contain"
                />
                <span className="text-lg font-bold text-[#1e1a17]">Evginler</span>
              </Link>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#ddd6c8] text-[#5f5148]"
                onClick={() => setMobileOpen(false)}
                aria-label="Menüyü kapat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4">
              <form onSubmit={submitSearch}>
                <label className="flex w-full items-center gap-2 rounded-xl border border-[#ddd6c8] bg-[#faf8f4] px-3 py-2.5">
                  <Search className="h-4 w-4 shrink-0 text-[#8c7e72]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Ürün ara…"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </label>
              </form>

              <nav className="mt-5 flex flex-col gap-1">
                {navItems.map((item) => (
                  <HeaderLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)}>
                    {item.label}
                  </HeaderLink>
                ))}
                <HeaderLink to="/cart" onClick={() => setMobileOpen(false)}>
                  Sepetim {itemCount > 0 ? `(${itemCount})` : ''}
                </HeaderLink>
                <HeaderLink to={isAuthenticated ? '/profile' : '/login'} onClick={() => setMobileOpen(false)}>
                  {isAuthenticated ? 'Hesabım' : 'Giriş Yap'}
                </HeaderLink>
                {!isAuthenticated ? (
                  <HeaderLink to="/register" onClick={() => setMobileOpen(false)}>
                    Kayıt Ol
                  </HeaderLink>
                ) : (
                  <>
                    <HeaderLink to="/profile/orders" onClick={() => setMobileOpen(false)}>
                      Siparişlerim
                    </HeaderLink>
                    <HeaderLink to="/profile/favorites" onClick={() => setMobileOpen(false)}>
                      Favorilerim
                    </HeaderLink>
                    <button
                      type="button"
                      onClick={() => logout.mutate()}
                      className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[#7c2d3f] hover:bg-[#f5ecee]"
                    >
                      Çıkış Yap
                    </button>
                  </>
                )}
              </nav>

              <div className="mt-6 rounded-xl bg-[#edf2eb] p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-[#3d5e35]">
                  <Truck className="h-4 w-4" />
                  ₺500 üzeri ücretsiz kargo
                </p>
                <p className="mt-1 text-xs text-[#6b6058]">Güvenli ödeme · Kolay iade</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-[#ddd6c8] bg-white">
        {/* Trust row */}
        <div className="border-b border-[#e8e0d2] bg-[#faf8f4]">
          <div className="mx-auto grid max-w-7xl gap-3 px-4 py-5 sm:grid-cols-3 sm:px-6 lg:px-8">
            {[
              { icon: Truck, title: 'Hızlı Teslimat', text: '₺500 üzeri ücretsiz' },
              { icon: ShoppingBag, title: 'Güvenli Ödeme', text: '3D Secure koruması' },
              { icon: PackageCheck, title: 'Kolay İade', text: 'Teslimatta iade takibi' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf2eb]">
                  <item.icon className="h-4 w-4 text-[#3d5e35]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1e1a17]">{item.title}</p>
                  <p className="text-xs text-[#8c7e72]">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer links */}
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/img/logo.jpg" alt="" className="h-9 w-9 rounded-xl object-contain" />
              <span className="text-lg font-bold text-[#1e1a17]">Evginler</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#6b6058]">
              Ardahan'ın köklü ev mağazası. Ev tekstili, mobilya, züccaciye, giyim ve çeyiz setlerinde geniş ürün seçkisi.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#8c7e72]">Alışveriş</h3>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-[#5f5148]">
              <Link to="/products" className="hover:text-[#7c2d3f] transition-colors">Tüm ürünler</Link>
              <Link to="/cart" className="hover:text-[#7c2d3f] transition-colors">Sepetim</Link>
              <Link to="/profile/orders" className="hover:text-[#7c2d3f] transition-colors">Siparişlerim</Link>
              <Link to="/profile/favorites" className="hover:text-[#7c2d3f] transition-colors">Favorilerim</Link>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#8c7e72]">Güvence</h3>
            <div className="mt-4 flex flex-col gap-2 text-sm leading-6 text-[#6b6058]">
              <p>Güvenli ödeme altyapısı</p>
              <p>Hızlı ve özenli kargolama</p>
              <p>Kolay iade ve değişim</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-[#e8e0d2] px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-[#8c7e72]">© {new Date().getFullYear()} Evginler. Tüm hakları saklıdır.</p>
          <img
            src="/img/payment-icon/logo_band_colored.svg"
            alt="Ödeme yöntemleri"
            className="h-6 max-w-full object-contain opacity-80"
          />
        </div>
      </footer>
    </div>
  )
}
