'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Menu, X, Search, PlusCircle, MessageCircle, Zap, ChevronLeft } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import Avatar from '@/components/Avatar'
import { supabase } from '@/lib/supabase'

// Las categorías están ordenadas. "Otros" siempre al final, "Ver Todo" siempre primero.
const categorias = [
  { id: 'ver-todo', nombre: 'Ver Todo', icon: '🔍' },
  { id: 'vehiculos', nombre: 'Vehículos', icon: '🚗' },
  { id: 'tecnologia', nombre: 'Tecnología', icon: '💻' },
  { id: 'moda', nombre: 'Moda', icon: '👗' },
  { id: 'hogar', nombre: 'Hogar', icon: '🏠' },
  { id: 'herramientas', nombre: 'Herramientas', icon: '🔧' },
  { id: 'materiales', nombre: 'Materiales', icon: '🧱' },
  { id: 'repuestos', nombre: 'Repuestos', icon: '⚙️' },
  { id: 'otros', nombre: 'Otros', icon: '📦' },
]

export function Header() {
  const { user, loading } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [creditoBalance, setCreditoBalance] = useState<number | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const creditoChecked = typeof creditoBalance === 'number'
  const [isPWA, setIsPWA] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsPWA(window.matchMedia('(display-mode: standalone)').matches)
    // iOS también puede usar standalone sin display-mode
    if ('standalone' in window.navigator && !(window.navigator as any).standalone === false) {
      setIsPWA(true)
    }
  }, [])

  // Fetch user credit balance when logged in
  useEffect(() => {
    if (!user) {
      setCreditoBalance(null)
      return
    }
    async function fetchCredito() {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('credito_balance')
        .eq('id', user!.id)
        .single()
      setCreditoBalance(perfil?.credito_balance ?? 0)
    }
    fetchCredito()
  }, [user])

  // Fetch unread message count
  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return
    }
    async function fetchUnread() {
      const { count: mensajes } = await supabase
        .from('mensajes')
        .select('id', { count: 'exact', head: true })
        .eq('destinatario_id', user!.id)
        .eq('leido', false)
      setUnreadCount(mensajes || 0)
    }
    fetchUnread()

    // Subscribe to real-time messages
    const channel = supabase
      .channel('header-unread')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensajes', filter: `destinatario_id=eq.${user!.id}` },
        () => fetchUnread()
      )
      .subscribe()

    // Same-tab signal desde ChatPage cuando marca mensajes como leidos
    const bc = new BroadcastChannel('vendete_unread_sync')
    bc.onmessage = () => fetchUnread()

    // Fallback: refrescada cada 30s por si acaso
    const interval = setInterval(fetchUnread, 30000)

    return () => {
      supabase.removeChannel(channel)
      bc.close()
      clearInterval(interval)
    }
  }, [user])

  if (loading) return (
    <header className="bg-brand-primary text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="w-9 h-9 bg-brand-accent/50 rounded-lg" />
          <div className="w-48 h-8 bg-white/10 rounded-lg hidden sm:block" />
          <div className="flex gap-2">
            <div className="w-20 h-8 bg-white/10 rounded-lg hidden md:block" />
            <div className="w-20 h-8 bg-white/10 rounded-lg hidden md:block" />
          </div>
        </div>
      </div>
    </header>
  )

  // Badge "1 gratis" solo si no está logueado
  const showCreditoBadge = !user

  return (
    <>
      {/* ============ HEADER PRINCIPAL ============ */}
      <header className="bg-gradient-to-r from-brand-dark via-brand-primary to-brand-primary text-white relative sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Botón atrás — solo PWA */}
            {isPWA && (
              <button onClick={() => window.history.back()} className="p-1 hover:bg-white/10 rounded-lg transition text-white/80">
                <ChevronLeft size={22} />
              </button>
            )}
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0">
              <Image src="/logo-vendet.webp" alt="VendeT" width={44} height={44} className="h-11 w-auto drop-shadow-[0_0_6px_rgba(255,255,255,0.5)] bg-white/10 p-0.5 rounded-lg backdrop-blur" />
              <span className="hidden sm:block">
                <span className="font-black text-xl tracking-tight">
                  <span className="text-yellow-400">Vende</span><span className="text-white">T</span><span className="text-yellow-400 font-bold text-base ml-1">-Venezuela</span>
                </span>
              </span>
            </Link>

            {/* Search (desktop) */}
            <form action="/buscar" method="GET" className="hidden md:flex flex-1 max-w-xl mx-8 relative">
              <input
                type="text"
                name="q"
                placeholder="¿Qué estás buscando?"
                className="w-full py-2 px-4 pr-12 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-accent p-1.5 rounded-full hover:bg-accent/90 transition">
                <Search size={18} className="text-brand-primary" />
              </button>
            </form>

            {/* Actions (desktop) */}
            <div className="flex items-center gap-2">
              {/* Créditos */}
              <Link href="/creditos" className="relative hidden md:flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm font-medium transition" title="Comprar créditos">
                <Zap size={16} className="text-brand-accent" />
                <span className="hidden lg:inline">Créditos</span>
                {showCreditoBadge && (
                  <span className="absolute -top-1 -right-1 bg-green-400 text-brand-primary text-[9px] font-black px-1 rounded-full">1 gratis</span>
                )}
                {creditoChecked && creditoBalance !== null && creditoBalance > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-accent text-brand-primary text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[16px] text-center">{creditoBalance}</span>
                )}
              </Link>
              <Link href="/creditos" className="md:hidden p-2 hover:bg-white/10 rounded-lg transition relative" title="Créditos">
                <Zap size={20} className="text-brand-accent" />
                {showCreditoBadge && (
                  <span className="absolute top-0 right-0 bg-green-400 text-brand-primary text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full">1</span>
                )}
              </Link>

              {!user ? (
                <>
                  <Link href="/login" className="hidden md:inline px-3 py-2 text-sm font-medium hover:text-brand-accent transition">Iniciar sesión</Link>
                  <Link href="/register" className="hidden md:inline bg-brand-accent text-brand-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-accent/90 transition">Regístrate</Link>
                  {!isPWA && (
                    <button className="md:hidden p-2 hover:bg-white/10 rounded-lg transition" onClick={() => setMobileOpen(!mobileOpen)}>
                      {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <Link href="/publicar" className="hidden md:flex items-center gap-1 bg-brand-accent text-brand-primary px-3 py-2 rounded-lg text-sm font-bold hover:bg-accent/90 transition">
                    <PlusCircle size={16} /> Publicar
                  </Link>
                  <Link href="/chat" className="relative p-2 hover:bg-white/10 rounded-lg transition" title="Mensajes">
                    <MessageCircle size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 bg-brand-dark text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    )}
                  </Link>
                  <Link href="/dashboard" className="hidden sm:block p-1 hover:bg-white/10 rounded-lg transition" title="Mi panel">
                    <Avatar nombre={user?.user_metadata?.nombre || user?.email || 'U'} fotoUrl={user?.user_metadata?.foto_perfil_url || null} size="sm" />
                  </Link>
                  {!isPWA && (
                    <button className="md:hidden p-2 hover:bg-white/10 rounded-lg transition" onClick={() => setMobileOpen(!mobileOpen)}>
                      {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Mobile menu — solo navegador móvil, NO en PWA */}
          {!isPWA && mobileOpen && (
            <div className="md:hidden pb-4 animate-fadeIn">
              <form action="/buscar" method="GET" className="mb-3">
                <input type="text" name="q" placeholder="¿Qué estás buscando?" className="w-full py-2.5 px-4 rounded-lg text-gray-800 bg-white" />
              </form>
              <nav className="flex flex-col gap-1">
                {!user ? (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/10 transition">Iniciar sesión</Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg bg-brand-accent text-brand-primary font-bold text-center transition">Regístrate gratis</Link>
                  </>
                ) : (
                  <>
                    <Link href="/publicar" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg bg-brand-accent text-brand-primary font-bold text-center transition">📢 Publicar algo</Link>
                    <Link href="/chat" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/10 transition">💬 Mensajes{unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}</Link>
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/10 transition">👤 Mi Panel</Link>
                    <Link href="/creditos" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/10 transition">⚡ Créditos{creditoChecked && creditoBalance !== null && creditoBalance > 0 ? ` — ${creditoBalance} disponibles` : ''}</Link>
                  </>
                )}
                <Link href="/catalogo" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/10 transition">📦 Ver catálogo</Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* ============ SUB-HEADER: CATEGORÍAS ============ */}
      <div className="hidden md:block bg-white border-b border-gray-200 shadow-sm sticky top-14 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 h-11 overflow-x-auto hide-scrollbar">
            {categorias.map((cat) => (
              <Link
                key={cat.id}
                href={cat.id === 'ver-todo' ? '/catalogo' : `/catalogo?categoria=${cat.id}`}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition font-medium whitespace-nowrap ${
                  cat.id === 'ver-todo'
                    ? 'text-brand-primary bg-blue-50 hover:bg-blue-100 font-bold'
                    : 'text-gray-600 hover:text-brand-primary hover:bg-blue-50'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                {cat.nombre}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
