'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react'

const navItems = [
  { href: '/', icon: Home, label: 'Inicio' },
  { href: '/buscar', icon: Search, label: 'Buscar' },
  { href: '/publicar', icon: PlusCircle, label: 'Publicar', highlight: true },
  { href: '/chat', icon: MessageCircle, label: 'Chat' },
  { href: '/mi-perfil', icon: User, label: 'Perfil' },
]

function isPWA(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  )
}

export default function BottomTabNav() {
  const pathname = usePathname()

  if (!isPWA()) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      role="navigation"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition ${
                item.highlight ? '-mt-4' : ''
              }`}
            >
              {item.highlight ? (
                <div className="w-14 h-14 bg-brand-yellow rounded-full flex items-center justify-center shadow-lg shadow-yellow-200 active:scale-95 transition-transform">
                  <Icon size={26} className="text-brand-blue" />
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Icon
                    size={22}
                    className={isActive ? 'text-brand-blue' : 'text-gray-400'}
                  />
                  <span
                    className={`text-[10px] mt-0.5 font-medium ${
                      isActive ? 'text-brand-blue' : 'text-gray-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
