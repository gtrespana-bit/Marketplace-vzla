'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Menu, X, Bell, MessageCircle, User, LogOut, LayoutDashboard, Package, Plus, CreditCard, ChevronDown, Zap, Settings } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/context/LanguageContext'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { NotificationBell } from '@/components/NotificationBell'

const categorias = [
  { nombre: 'Vehículos', slug: 'vehiculos', icon: '🚗' },
  { nombre: 'Tecnología', slug: 'tecnologia', icon: '📱' },
  { nombre: 'Moda', slug: 'moda', icon: '👕' },
  { nombre: 'Hogar', slug: 'hogar', icon: '🏠' },
  { nombre: 'Herramientas', slug: 'herramientas', icon: '🔧' },
  { nombre: 'Deportes', slug: 'deportes', icon: '⚽' },
  { nombre: 'Inmuebles', slug: 'inmuebles', icon: '🏢' },
  { nombre: 'Servicios', slug: 'servicios', icon: '🛠️' },
  { nombre: 'Otros', slug: 'otros', icon: '📦' },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [perfil, setPerfil] = useState<any>(null)
  const [creditoBalance, setCreditoBalance] = useState<number | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isPWA, setIsPWA] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLanguage()

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
        .select('creditos')
        .eq('id', user.id)
        .single()
      setCreditoBalance(perfil?.creditos ?? 0)
    }
    fetchCredito()
  }, [user])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('es_admin, avatar_url, verificado')
          .eq('id', user.id)
          .single()
        setPerfil(perfil)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setPerfil(null)
      } else {
        supabase.from('perfiles').select('es_admin, avatar_url, verificado').eq('id', session.user.id).single().then(({ data }) => setPerfil(data))
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return
    }
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('mensajes')
        .select('*', { count: 'exact', head: true })
        .eq('receptor_id', user.id)
        .eq('leido', false)
      setUnreadCount(count ?? 0)
    }
    fetchUnread()
    const channel = supabase
      .channel('unread-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mensajes', filter: `receptor_id=eq.${user.id}` }, () => fetchUnread())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      <header className="bg-brand-primary text-brand-dark shadow-lg sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
              <Image src="/logo-vendet.webp" alt="VendeT" width={32} height={32} className="h-8 w-8 object-contain rounded-lg drop-shadow-[0_0_6px_rgba(255,255,255,0.5)] bg-white/80 p-0.5" priority />
              <span className="text-brand-dark font-black text-xl">Vende<span className="text-white">T</span></span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <Link href="/" className="hover:text-white transition-colors">{t('header.home', 'Inicio')}</Link>
              <Link href="/catalogo" className="hover:text-white transition-colors">{t('header.catalog', 'Catálogo')}</Link>
              <Link href="/como-funciona" className="hover:text-white transition-colors">{t('header.howItWorks', 'Cómo Funciona')}</Link>
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              {/* Language Switcher */}
              <LocaleSwitcher />

              {user ? (
                <>
                  <Link href="/publicar" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-bold transition-colors inline-flex items-center gap-2">
                    <Plus size={16} />
                    {t('header.publish', 'Publicar')}
                  </Link>
                  <NotificationBell />
                  {perfil?.verificado === false && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{t('header.unverified', 'No Verificado')}</span>
                  )}
                  <div className="relative" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
                    <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-full text-sm font-bold transition-colors">
                      {perfil?.avatar_url ? (
                        <Image src={perfil.avatar_url} alt="Avatar" width={24} height={24} className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <User size={16} />
                      )}
                      <span>{t('header.account', 'Cuenta')}</span>
                      <ChevronDown size={14} />
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 text-gray-800" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-xs text-gray-500">{t('header.signedInAs', 'Conectado como')}</p>
                          <p className="font-semibold truncate text-sm">{user.email}</p>
                          {creditoBalance !== null && (
                            <Link href="/creditos" className="flex items-center gap-1 mt-1 text-xs text-amber-600 hover:text-amber-700 font-bold">
                              <CreditCard size={12} /> {creditoBalance} {t('header.credits', 'créditos')}
                            </Link>
                          )}
                        </div>
                        <Link href="/dashboard" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors">
                          <LayoutDashboard size={16} className="text-gray-500" />
                          {t('header.myDashboard', 'Mi Panel')}
                        </Link>
                        <Link href="/dashboard?tab=productos" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors">
                          <Package size={16} className="text-gray-500" />
                          {t('header.myProducts', 'Mis Productos')}
                        </Link>
                        <Link href="/dashboard?tab=mensajes" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors relative">
                          <MessageCircle size={16} className="text-gray-500" />
                          {t('header.messages', 'Mensajes')}
                          {unreadCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{unreadCount}</span>
                          )}
                        </Link>
                        {perfil?.es_admin && (
                          <Link href="/admin" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors text-purple-700 font-semibold">
                            <Settings size={16} />
                            {t('header.admin', 'Administración')}
                          </Link>
                        )}
                        <Link href="/creditos" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors text-amber-700 font-semibold">
                          <Zap size={16} />
                          {t('header.credits', 'Créditos')}
                        </Link>
                        <Link href="/mi-perfil" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors">
                          <User size={16} className="text-gray-500" />
                          {t('header.profile', 'Mi Perfil')}
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 transition-colors border-t border-gray-100 mt-1">
                          <LogOut size={16} />
                          {t('header.logout', 'Cerrar Sesión')}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-bold transition-colors">{t('header.login', 'Entrar')}</Link>
                  <Link href="/register" className="bg-brand-dark text-white hover:bg-gray-800 px-4 py-2 rounded-full text-sm font-bold transition-colors">{t('header.register', 'Registrarse')}</Link>
                </>
              )}
            </div>

            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-md text-brand-dark hover:bg-brand-accent hover:text-white transition-colors" aria-label={t('header.toggleMenu', 'Menú')}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Menú móvil */}
      <div className={`md:hidden fixed inset-x-0 top-16 z-40 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="bg-white border-t border-gray-200 shadow-xl h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col h-full">

            {/* Navegación principal */}
            <div className="space-y-1">
              <Link href="/" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${pathname === '/' ? 'bg-brand-primary text-brand-dark' : 'text-gray-700 hover:bg-gray-100'}`}>
                {t('header.home', 'Inicio')}
              </Link>
              <Link href="/catalogo" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${pathname?.startsWith('/catalogo') ? 'bg-brand-primary text-brand-dark' : 'text-gray-700 hover:bg-gray-100'}`}>
                {t('header.catalog', 'Catálogo')}
              </Link>
              <Link href="/como-funciona" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${pathname?.startsWith('/como-funciona') ? 'bg-brand-primary text-brand-dark' : 'text-gray-700 hover:bg-gray-100'}`}>
                {t('header.howItWorks', 'Cómo Funciona')}
              </Link>
              <Link href="/blog" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${pathname?.startsWith('/blog') ? 'bg-brand-primary text-brand-dark' : 'text-gray-700 hover:bg-gray-100'}`}>
                Blog
              </Link>
            </div>

            {/* Language Switcher móvil */}
            <div className="mt-4 px-4 py-3 border-t border-gray-200">
              <LocaleSwitcher />
            </div>

            {/* Autenticación */}
            {user ? (
              <>
                <div className="mt-4 space-y-1 border-t border-gray-200 pt-4">
                  <div className="px-4 py-2">
                    <p className="text-xs text-gray-500">{t('header.signedInAs', 'Conectado como')}</p>
                    <p className="font-semibold text-sm text-gray-900 truncate">{user.email}</p>
                    {creditoBalance !== null && (
                      <Link href="/creditos" onClick={() => setIsOpen(false)} className="flex items-center gap-1 mt-1 text-xs text-amber-600 hover:text-amber-700 font-bold">
                        <CreditCard size={12} /> {creditoBalance} {t('header.credits', 'créditos')}
                      </Link>
                    )}
                  </div>
                  <Link href="/publicar" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 mx-4 my-2 py-3 rounded-xl text-base font-bold bg-brand-accent hover:bg-orange-600 text-white transition-colors">
                    <Plus size={20} />
                    {t('header.publish', 'Publicar')}
                  </Link>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${pathname === '/dashboard' ? 'bg-brand-primary text-brand-dark' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <LayoutDashboard size={20} />
                    {t('header.myDashboard', 'Mi Panel')}
                  </Link>
                  <Link href="/dashboard?tab=productos" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                    <Package size={20} />
                    {t('header.myProducts', 'Mis Productos')}
                  </Link>
                  <Link href="/dashboard?tab=mensajes" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors relative">
                    <MessageCircle size={20} />
                    {t('header.messages', 'Mensajes')}
                    {unreadCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">{unreadCount}</span>
                    )}
                  </Link>
                  {perfil?.es_admin && (
                    <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-purple-700 hover:bg-purple-50 transition-colors">
                      <Settings size={20} />
                      {t('header.admin', 'Administración')}
                    </Link>
                  )}
                  <Link href="/creditos" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-amber-700 hover:bg-amber-50 transition-colors">
                    <Zap size={20} />
                    {t('header.credits', 'Créditos')}
                  </Link>
                  <Link href="/mi-perfil" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${pathname === '/mi-perfil' ? 'bg-brand-primary text-brand-dark' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <User size={20} />
                    {t('header.profile', 'Mi Perfil')}
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-gray-200 mt-2">
                    <LogOut size={20} />
                    {t('header.logout', 'Cerrar Sesión')}
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-base font-bold bg-white border-2 border-gray-200 text-gray-900 hover:border-brand-primary transition-colors">
                  {t('header.login', 'Entrar')}
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-base font-bold bg-brand-accent hover:bg-orange-600 text-white transition-colors">
                  {t('header.register', 'Registrarse')}
                </Link>
              </div>
            )}

            {/* Categorías al final del menú */}
            <div className="mt-auto pt-6 border-t border-gray-200">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('header.categories', 'Categorías')}</p>
              <div className="grid grid-cols-2 gap-1">
                {categorias.map((cat) => (
                  <Link key={cat.slug} href={`/catalogo?categoria=${cat.slug}`} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <span className="text-base">{cat.icon}</span>
                    {cat.nombre}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}