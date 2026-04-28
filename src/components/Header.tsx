'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Menu, X, Search, User, PlusCircle, MessageCircle, Shield, Star } from 'lucide-react'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<unknown>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

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

            {/* Search bar (desktop) */}
            <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl mx-8 relative">
              <form action="/buscar" method="GET" className="w-full">
                <input
                  type="text"
                  name="q"
                  placeholder="¿Qué estás buscando?"
                  className="w-full py-2.5 px-4 pr-12 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-yellow p-1.5 rounded-full hover:bg-yellow-400 transition"
                >
                  <Search size={18} className="text-brand-blue" />
                </button>
              </form>
            </div>

            {/* Mobile search */}
            <button
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search size={20} />
            </button>

            {/* Actions (desktop) */}
            <div className="hidden md:flex items-center gap-3">
              {!user ? (
                <>
                  <Link href="/auth/login" className="px-4 py-2 text-sm font-medium hover:text-brand-yellow transition">
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-brand-yellow text-brand-blue px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-400 transition"
                  >
                    Regístrate
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/publicar" className="flex items-center gap-1 bg-brand-yellow text-brand-blue px-3 py-2 rounded-lg text-sm font-bold hover:bg-yellow-400 transition">
                    <PlusCircle size={16} />
                    Publicar
                  </Link>
                  <Link href="/chat" className="relative p-2 hover:bg-white/10 rounded-lg transition" title="Mensajes">
                    <MessageCircle size={20} />
                    <span className="absolute top-1 right-1 bg-brand-red w-2 h-2 rounded-full"></span>
                  </Link>
                  <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-lg transition" title="Mi panel">
                    <User size={20} />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile search expanded */}
          {searchOpen && (
            <div className="md:hidden pb-3 animate-fadeIn">
              <form action="/buscar" method="GET" className="relative">
                <input
                  type="text"
                  name="q"
                  placeholder="¿Qué estás buscando?"
                  className="w-full py-2.5 px-4 pr-12 rounded-lg text-gray-800 bg-white"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-yellow p-1.5 rounded-full">
                  <Search size={18} className="text-brand-blue" />
                </button>
              </form>
            </div>
          )}

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="md:hidden pb-4 animate-fadeIn">
              <nav className="flex flex-col gap-1">
                {!user ? (
                  <>
                    <Link href="/auth/login" className="px-3 py-2 rounded-lg hover:bg-white/10 transition">Iniciar sesión</Link>
                    <Link href="/auth/register" className="px-3 py-2 rounded-lg bg-brand-yellow text-brand-blue font-bold text-center transition">Regístrate gratis</Link>
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
