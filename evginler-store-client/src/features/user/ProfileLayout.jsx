import { Heart, MapPin, PackageCheck, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const profileLinks = [
  { label: 'Bilgilerim', to: '/profile/info', icon: UserRound },
  { label: 'Adreslerim', to: '/profile/addresses', icon: MapPin },
  { label: 'Siparişlerim', to: '/profile/orders', icon: PackageCheck },
  { label: 'Favorilerim', to: '/profile/favorites', icon: Heart },
]

export function ProfileLayout({ title, eyebrow = 'Hesabım', children }) {
  return (
    <section className="mx-auto max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[#7c2d3f]">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1e1a17]">{title}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Sidebar nav */}
        <aside>
          <nav className="grid grid-cols-2 gap-2 rounded-xl border border-[#ddd6c8] bg-white p-3 shadow-sm sm:grid-cols-4 lg:grid-cols-1">
            {profileLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#f5ecee] text-[#7c2d3f]'
                      : 'text-[#5f5148] hover:bg-[#f0ece4] hover:text-[#1e1a17]'
                  }`
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="overflow-hidden rounded-xl border border-[#ddd6c8] bg-white p-5 shadow-sm sm:p-6">
          {children}
        </div>
      </div>
    </section>
  )
}
