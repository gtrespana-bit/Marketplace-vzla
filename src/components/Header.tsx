'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Search, User, PlusCircle, MessageCircle, Shield, Star } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import Avatar from '@/components/Avatar'

export function Header() {
  const { user, loading } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (loading) return (
    <header className="bg-brand-blue text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="w-9 h-9 bg-brand-yellow/50 rounded-lg" />
          <div className="w-64 h-8 bg-white/10 rounded-lg" />
          <div className="flex gap-2">
            <div className="w-20 h-8 bg-white/10 rounded-lg" />
            <div className="w-20 h-8 bg-white/10 rounded-lg" />
          </div>
        </div>
      </div>
    </header>
  )

  return (
    <>
      {/* Top trust bar */}
      <div className="bg-brand-dark text-blue-200 text-xs py-1.5 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">🛡️ Compra y vende con confianza</span>
            <span className="flex items-center gap-1">
              <Shield size={12} />
              Plataforma 100% segura
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Star size={12} />
              Vendedores verificados
            </span>
            <span className="flex items-center gap-1">💚 Contacto directo por WhatsApp</span>
          </div>
        </div>
      </div>

      <header className="bg-brand-blue text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 bg-brand-yellow rounded-lg flex items-center justify-center font-black text-brand-blue text-lg">
                TA
              </div>
              <span className="hidden sm:block">
                <span className="text-brand-yellow font-black text-xl tracking-tight">
                  Todo<span className="text-white">Anuncios</span>
                </span>
              </span>
            </Link>

            {/* Search (desktop) */}
            <form action="/buscar" method="GET" className="hidden md:flex flex-1 max-w-xl mx-8 relative">
              <input
                type="text"
                name="q"
                placeholder="¿Qué estás buscando?"
                className="w-full py-2.5 px-4 pr-12 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-yellow p-1.5 rounded-full hover:bg-yellow-400 transition">
                <Search size={18} className="text-brand-blue" />
              </button>
            </form>

            {/* Actions (desktop) */}
            <div className="hidden md:flex items-center gap-3">
              {!user ? (
                <>
                  <Link href="/login" className="px-4 py-2 text-sm font-medium hover:text-brand-yellow transition">Iniciar sesión</Link>
                  <Link href="/register" className="bg-brand-yellow text-brand-blue px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-400 transition">Regístrate</Link>
                </>
              ) : (
                <>
                  <Link href="/publicar" className="flex items-center gap-1 bg-brand-yellow text-brand-blue px-3 py-2 rounded-lg text-sm font-bold hover:bg-yellow-400 transition">
                    <PlusCircle size={16} /> Publicar
                  </Link>
                  <Link href="/chat" className="relative p-2 hover:bg-white/10 rounded-lg transition" title="Mensajes">
                    <MessageCircle size={20} />
                    <span className="absolute top-1 right-1 bg-brand-red w-2 h-2 rounded-full"></span>
                  </Link>
                  <Link href="/dashboard" className="p-1 hover:bg-white/10 rounded-lg transition" title="Mi panel">
                    <Avatar nombre={user?.user_metadata?.nombre || user?.email || 'U'} fotoUrl={user?.user_metadata?.foto_perfil_url || null} size="sm" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 hover:bg-white/10 rounded-lg transition" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="md:hidden pb-4 animate-fadeIn">
              <form action="/buscar" method="GET" className="mb-3">
                <input type="text" name="q" placeholder="¿Qué estás buscando?" className="w-full py-2.5 px-4 rounded-lg text-gray-800 bg-white" />
              </form>
              <nav className="flex flex-col gap-1">
                {!user ? (
                  <>
                    <Link href="/login" className="px-3 py-2 rounded-lg hover:bg-white/10 transition">Iniciar sesión</Link>
                    <Link href="/register" className="px-3 py-2 rounded-lg bg-brand-yellow text-brand-blue font-bold text-center transition">Regístrate gratis</Link>
                  </>
                ) : (
                  <>
                    <Link href="/publicar" className="px-3 py-2 rounded-lg bg-brand-yellow text-brand-blue font-bold text-center transition">📢 Publicar algo</Link>
                    <Link href="/chat" className="px-3 py-2 rounded-lg hover:bg-white/10 transition">💬 Mensajes</Link>
                    <Link href="/dashboard" className="px-3 py-2 rounded-lg hover:bg-white/10 transition">👤 Mi Panel</Link>
                  </>
                )}
                <Link href="/catalogo" className="px-3 py-2 rounded-lg hover:bg-white/10 transition">📦 Ver catálogo</Link>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
