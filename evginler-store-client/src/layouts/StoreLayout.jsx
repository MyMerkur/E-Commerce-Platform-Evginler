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
import { CartDrawer } from '../features/cart/CartDrawer'

const navItems = [
  { label: 'Ana Sayfa', to: '/' },
  { label: 'Ürünler', to: '/products' },
]

function HeaderLink({ to, children, onClick, uppercase = true }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `rounded-md px-3 py-2 text-sm font-bold transition-colors ${uppercase ? 'uppercase tracking-wide text-xs' : ''} ${
          isActive ? 'text-maroon' : 'text-ink hover:text-maroon'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export function StoreLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
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
    <div className="min-h-screen bg-surface-muted text-ink">
      {/* Announcement bar */}
      <div className="bg-ink px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-white">
        <span className="inline-flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5" />
          ₺500 ve üzeri siparişlerde <strong className="text-white">ücretsiz kargo</strong>
        </span>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-white/97 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border text-ink transition hover:bg-surface-muted lg:hidden"
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
              className="h-10 w-10 rounded-md object-contain"
            />
            <span className="hidden sm:block">
              <span className="block font-display text-xl font-extrabold uppercase tracking-tight text-ink">
                Evginler
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-light">
                Ev yaşam mağazası
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <HeaderLink key={item.to} to={item.to}>
                {item.label}
              </HeaderLink>
            ))}
          </nav>

          {/* Search */}
          <form onSubmit={submitSearch} className="ml-auto hidden max-w-sm flex-1 items-center lg:flex">
            <label className="flex w-full items-center gap-2 rounded-md border border-border bg-surface-muted px-3.5 py-2.5 transition focus-within:border-ink focus-within:bg-white">
              <Search className="h-4 w-4 shrink-0 text-muted-light" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nevresim, havlu, battaniye ara…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-light"
              />
            </label>
          </form>

          {/* Auth + Cart */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="group relative hidden sm:block">
                <Link
                  to="/profile"
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition hover:border-ink"
                >
                  <UserRound className="h-4 w-4 text-olive" />
                  <span className="max-w-28 truncate">{user?.name || 'Hesabım'}</span>
                </Link>
                <div className="invisible absolute right-0 top-12 z-50 w-56 rounded-md border border-border bg-white p-2 opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:opacity-100">
                  <Link
                    className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm hover:bg-surface-muted"
                    to="/profile"
                  >
                    <UserRound className="h-4 w-4 text-olive" /> Profil
                  </Link>
                  <Link
                    className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm hover:bg-surface-muted"
                    to="/profile/orders"
                  >
                    <PackageCheck className="h-4 w-4 text-olive" /> Siparişler
                  </Link>
                  <Link
                    className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm hover:bg-surface-muted"
                    to="/profile/favorites"
                  >
                    <Heart className="h-4 w-4 text-olive" /> Favoriler
                  </Link>
                  <div className="my-1.5 border-t border-border" />
                  <button
                    type="button"
                    onClick={() => logout.mutate()}
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm text-maroon hover:bg-[#f5ecee]"
                  >
                    <LogOut className="h-4 w-4" /> Çıkış yap
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  to="/login"
                  className="h-10 rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:border-ink"
                >
                  Giriş
                </Link>
                <Link
                  to="/register"
                  className="h-10 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Kayıt ol
                </Link>
              </div>
            )}

            {/* Cart button */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-maroon text-white shadow-sm transition hover:bg-maroon-dark active:scale-95"
              aria-label={`Sepet${itemCount > 0 ? `, ${itemCount} ürün` : ''}`}
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-olive px-1 text-center text-[10px] font-bold leading-none">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="h-full w-80 max-w-[88vw] overflow-y-auto bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                <img
                  src="/img/logo.jpg"
                  alt="Evginler"
                  className="h-9 w-9 rounded-md object-contain"
                />
                <span className="font-display text-lg font-extrabold uppercase tracking-tight text-ink">
                  Evginler
                </span>
              </Link>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-ink"
                onClick={() => setMobileOpen(false)}
                aria-label="Menüyü kapat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4">
              <form onSubmit={submitSearch}>
                <label className="flex w-full items-center gap-2 rounded-md border border-border bg-surface-muted px-3 py-2.5">
                  <Search className="h-4 w-4 shrink-0 text-muted-light" />
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
                  <HeaderLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)} uppercase={false}>
                    {item.label}
                  </HeaderLink>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false)
                    setCartOpen(true)
                  }}
                  className="rounded-md px-3 py-2 text-left text-sm font-bold text-ink hover:text-maroon"
                >
                  Sepetim {itemCount > 0 ? `(${itemCount})` : ''}
                </button>
                <HeaderLink to={isAuthenticated ? '/profile' : '/login'} onClick={() => setMobileOpen(false)} uppercase={false}>
                  {isAuthenticated ? 'Hesabım' : 'Giriş Yap'}
                </HeaderLink>
                {!isAuthenticated ? (
                  <HeaderLink to="/register" onClick={() => setMobileOpen(false)} uppercase={false}>
                    Kayıt Ol
                  </HeaderLink>
                ) : (
                  <>
                    <HeaderLink to="/profile/orders" onClick={() => setMobileOpen(false)} uppercase={false}>
                      Siparişlerim
                    </HeaderLink>
                    <HeaderLink to="/profile/favorites" onClick={() => setMobileOpen(false)} uppercase={false}>
                      Favorilerim
                    </HeaderLink>
                    <button
                      type="button"
                      onClick={() => logout.mutate()}
                      className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm font-medium text-maroon hover:bg-[#f5ecee]"
                    >
                      Çıkış Yap
                    </button>
                  </>
                )}
              </nav>

              <div className="mt-6 rounded-md bg-surface-muted p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-olive">
                  <Truck className="h-4 w-4" />
                  ₺500 üzeri ücretsiz kargo
                </p>
                <p className="mt-1 text-xs text-muted">Güvenli ödeme · Kolay iade</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-border bg-white">
        {/* Trust row */}
        <div className="border-b border-border bg-ink">
          <div className="mx-auto grid max-w-7xl gap-3 px-4 py-5 sm:grid-cols-3 sm:px-6 lg:px-8">
            {[
              { icon: Truck, title: 'Hızlı Teslimat', text: '₺500 üzeri ücretsiz' },
              { icon: ShoppingBag, title: 'Güvenli Ödeme', text: '3D Secure koruması' },
              { icon: PackageCheck, title: 'Kolay İade', text: 'Teslimatta iade takibi' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10">
                  <item.icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="text-xs text-white/60">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer links */}
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/img/logo.jpg" alt="" className="h-9 w-9 rounded-md object-contain" />
              <span className="font-display text-xl font-extrabold uppercase tracking-tight text-ink">
                Evginler
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">
              Ardahan'ın köklü ev mağazası. Ev tekstili, mobilya, züccaciye, giyim ve çeyiz setlerinde geniş ürün seçkisi.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-ink">Alışveriş</h3>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-muted">
              <Link to="/products" className="hover:text-maroon transition-colors">Tüm ürünler</Link>
              <Link to="/cart" className="hover:text-maroon transition-colors">Sepetim</Link>
              <Link to="/profile/orders" className="hover:text-maroon transition-colors">Siparişlerim</Link>
              <Link to="/profile/favorites" className="hover:text-maroon transition-colors">Favorilerim</Link>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-ink">Güvence</h3>
            <div className="mt-4 flex flex-col gap-2 text-sm leading-6 text-muted">
              <p>Güvenli ödeme altyapısı</p>
              <p>Hızlı ve özenli kargolama</p>
              <p>Kolay iade ve değişim</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-border px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-muted-light">© {new Date().getFullYear()} Evginler. Tüm hakları saklıdır.</p>
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
