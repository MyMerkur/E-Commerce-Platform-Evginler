import {
  BarChart3,
  Boxes,
  Building2,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  ShoppingCart,
  X,
} from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { adminAuthApi } from '../api/adminAuthApi'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useAdminAuthEvents } from '../hooks/useAdminAuthEvents'
import { useAdminAuthStore } from '../store/adminAuthStore'

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Ürünler', to: '/products', icon: Boxes },
  { label: 'Kategoriler', to: '/categories', icon: FolderTree },
  { label: 'Markalar', to: '/brands', icon: Building2 },
  { label: 'Siparişler', to: '/orders', icon: ShoppingCart },
  { label: 'Gelen Siparişler', to: '/orders/incoming', icon: PackageCheck },
  { label: 'Onaylananlar', to: '/orders/confirmed', icon: BarChart3 },
  { label: 'Teslim Edilenler', to: '/orders/delivered', icon: PackageCheck },
  { label: 'İadeler', to: '/orders/returned', icon: PackageCheck },
  { label: 'İptaller', to: '/orders/canceled', icon: PackageCheck },
]

function Sidebar({ onNavigate }) {
  return (
    <aside className="flex h-full flex-col bg-[#17211d] text-white">
      <Link to="/dashboard" onClick={onNavigate} className="border-b border-white/10 px-5 py-5">
        <span className="block text-xl font-bold">Evginler Admin</span>
        <span className="text-xs text-white/60">Yönetim paneli</span>
      </Link>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${
                isActive ? 'bg-white text-[#17211d]' : 'text-white/75 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  useAdminAuthEvents()
  const { data } = useAdminAuth()
  const admin = useAdminAuthStore((state) => state.admin || data?.admin)
  const clearAuth = useAdminAuthStore((state) => state.clearAuth)
  const logout = useMutation({
    mutationFn: adminAuthApi.logout,
    onSettled: () => {
      clearAuth()
      queryClient.clear()
      toast.success('Çıkış yapıldı.')
      navigate('/login')
    },
  })

  return (
    <div className="min-h-screen bg-[#f6f7f4]">
      <div className="fixed inset-y-0 left-0 hidden w-72 lg:block">
        <Sidebar />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="h-full w-80 max-w-[86vw]" onClick={(event) => event.stopPropagation()}>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-[#dfe7e1] bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#dfe7e1] lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Menüyü aç"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div>
              <p className="text-sm font-bold text-[#17211d]">{admin?.name || 'Admin'}</p>
              <p className="text-xs text-[#66756c]">{admin?.email || 'Oturum aktif'}</p>
            </div>
            <button
              type="button"
              onClick={() => logout.mutate()}
              className="ml-auto inline-flex h-10 items-center gap-2 rounded-md border border-[#dfe7e1] px-3 text-sm font-semibold text-[#963d3d] hover:bg-[#fff5f5]"
            >
              <LogOut className="h-4 w-4" />
              Çıkış
            </button>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
