'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import {
  Plus, Package, MessageSquare, CreditCard, Settings,
  Eye, Heart, TrendingUp, LogOut, ChevronRight, X, Pause, Play
} from 'lucide-react'

export default function DashboardPage() {
  const { user, session } = useAuth()
  const [activeTab, setActiveTab] = useState('productos')
  const [productos, setProductos] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      supabase
        .from('productos')
        .select('*')
        .eq('user_id', user.id)
        .order('creado_en', { ascending: false })
        .then(({ data }) => {
          if (data) setProductos(data)
        })
    }
  }, [user])

  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Inicia sesión</h2>
          <p className="text-gray-500 mb-6">Necesitas una cuenta para acceder al panel</p>
          <Link
            href="/login"
            className="inline-block bg-brand-blue text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-900 transition"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header del dashboard */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mi Panel</h1>
          <p className="text-gray-500">Gestiona tus publicaciones y créditos</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/publicar"
            className="flex items-center gap-2 bg-brand-yellow text-brand-blue px-5 py-2.5 rounded-lg font-bold hover:bg-yellow-400 transition"
          >
            <Plus size={18} />
            Publicar
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Publicaciones', value: productos.length, icon: Package, color: 'bg-blue-50 text-brand-blue' },
          { label: 'Visitas totales', value: '1,240', icon: Eye, color: 'bg-green-50 text-green-700' },
          { label: 'Favoritos', value: '89', icon: Heart, color: 'bg-red-50 text-red-600' },
          { label: 'Créditos', value: '0', icon: CreditCard, color: 'bg-yellow-50 text-brand-yellow' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full lg:w-56 flex-shrink-0">
          <nav className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
            {[
              { id: 'productos', label: 'Mis publicaciones', icon: Package },
              { id: 'mensajes', label: 'Mensajes', icon: MessageSquare },
              { id: 'creditos', label: 'Comprar créditos', icon: CreditCard },
              { id: 'favoritos', label: 'Mis favoritos', icon: Heart },
              { id: 'configuracion', label: 'Configuración', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-left ${
                  activeTab === item.id
                    ? 'bg-brand-blue text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon size={18} />
                {item.label}
                {item.id === 'mensajes' && (
                  <span className="ml-auto bg-brand-red text-white text-xs px-1.5 py-0.5 rounded-full">2</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Contenido principal */}
        <div className="flex-1">
          {activeTab === 'productos' && <MisProductos productos={productos} />}
          {activeTab === 'mensajes' && <MensajesPlaceholder />}
          {activeTab === 'creditos' && <CreditosPlaceholder />}
          {activeTab === 'favoritos' && <FavoritosPlaceholder />}
          {activeTab === 'configuracion' && <ConfiguracionPlaceholder />}
        </div>
      </div>
    </div>
  )
}

function MisProductos({ productos }: { productos: any[] }) {
  if (productos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <Package size={48} className="text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Aún no tienes publicaciones</h3>
        <p className="text-gray-500 mb-6">Publica tu primer producto en segundos. ¡Es gratis!</p>
        <Link
          href="/publicar"
          className="inline-block bg-brand-yellow text-brand-blue px-8 py-3 rounded-lg font-bold hover:bg-yellow-400 transition"
        >
          Publicar ahora
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="font-bold text-lg mb-4">Mis publicaciones ({productos.length})</h3>
      <div className="space-y-3">
        {productos.map((p) => (
          <div key={p.id} className="group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition">
            {/* Clickable link to view */}
            <Link href={`/producto/${p.id}`} className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                {p.imagen_url ? (
                  <img src={p.imagen_url} alt={p.titulo} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sin foto</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-800 truncate group-hover:text-brand-blue transition">{p.titulo}</h4>
                <p className="text-sm text-brand-blue font-bold">${p.precio_usd?.toLocaleString()}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>👀 {p.visitas || 0} vistas</span>
                  <span>{p.activo ? '✅ Activo' : '⏸️ Pausado'}</span>
                </div>
              </div>
            </Link>
            {/* Action buttons */}
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={async () => {
                  const newState = !p.activo
                  await supabase.from('productos').update({ activo: newState }).eq('id', p.id)
                  window.location.reload()
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title={p.activo ? 'Pausar' : 'Activar'}
              >
                {p.activo ? <Package size={16} /> : <TrendingUp size={16} />}
              </button>
              <button
                onClick={async () => {
                  if (confirm('¿Eliminar esta publicación permanentemente?')) {
                    await supabase.from('productos').delete().eq('id', p.id)
                    window.location.reload()
                  }
                }}
                className="p-2 hover:bg-red-50 rounded-lg transition text-red-500"
                title="Eliminar"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MensajesPlaceholder() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
      <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-800 mb-2">Chat en tiempo real</h3>
      <p className="text-gray-500">Aquí aparecerán tus conversaciones con compradores y vendedores.</p>
      <p className="text-sm text-brand-blue mt-4 font-semibold">Próximamente — Fase 2</p>
    </div>
  )
}

function CreditosPlaceholder() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
      <CreditCard size={48} className="text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-800 mb-2">Sistema de créditos</h3>
      <p className="text-gray-500 mb-4">Compra créditos para destacar tus publicaciones y llegar a más personas.</p>
      <Link href="/creditos" className="text-brand-blue font-semibold hover:underline flex items-center gap-1">
        Ver paquetes de créditos <ChevronRight size={16} />
      </Link>
    </div>
  )
}

function FavoritosPlaceholder() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
      <Heart size={48} className="text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-800 mb-2">Tus favoritos</h3>
      <p className="text-gray-500">Guarda publicaciones que te interesen para verlas después.</p>
    </div>
  )
}

function ConfiguracionPlaceholder() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Configuración del perfil</h3>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">¿Cómo quieres que te contacten?</label>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked className="rounded text-brand-blue" />
              💬 Chat interno (siempre activo)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="rounded text-brand-blue" />
              📱 Mostrar teléfono en publicaciones
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="rounded text-brand-blue" />
              💚 Botón de WhatsApp directo
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="rounded text-brand-blue" />
              📧 Mostrar email
            </label>
          </div>
        </div>

        <div className="pt-4 border-t">
          <button className="bg-brand-red text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition">
            <LogOut size={16} className="inline mr-2" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
