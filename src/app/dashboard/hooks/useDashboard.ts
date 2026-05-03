import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

export interface DashboardData {
  productos: any[]
  visitasTotales: number
  favoritos: any[]
  favoritosCount: number
  creditos: number
  pubCount: number
  nombre: string
  telefono: string
  estado: string
  ciudad: string
  fotoUrl: string | null
  verificado: boolean
  nivelConfianza: number
  badgesAuto: string[]
  ultimaActividad: string | null
  creadoEn: string | null
  resenas: any[]
  promedioResenas: number
  loading: boolean
}

export function useDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [productos, setProductos] = useState<any[]>([])
  const [visitasTotales, setVisitasTotales] = useState(0)
  const [favoritos, setFavoritos] = useState<any[]>([])
  const [favoritosCount, setFavoritosCount] = useState(0)
  const [creditos, setCreditos] = useState(0)
  const [pubCount, setPubCount] = useState(0)
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [estado, setEstado] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const [verificado, setVerificado] = useState(false)
  const [nivelConfianza, setNivelConfianza] = useState(0)
  const [badgesAuto, setBadgesAuto] = useState<string[]>([])
  const [ultimaActividad, setUltimaActividad] = useState<string | null>(null)
  const [creadoEn, setCreadoEn] = useState<string | null>(null)
  const [resenas, setResenas] = useState<any[]>([])
  const [promedioResenas, setPromedioResenas] = useState(0)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  const refreshAll = useCallback(() => {
    if (!user) return

    Promise.all([
      supabase.from('productos').select('*').eq('user_id', user.id).order('creado_en', { ascending: false }).then(({ data }) => setProductos(data || [])),
      supabase.from('productos').select('visitas').eq('user_id', user.id).then(({ data }) => setVisitasTotales(data?.reduce((sum: number, p: any) => sum + (p.visitas || 0), 0) || 0)),
      supabase.from('favoritos').select('producto_id, creado_en, productos!inner(id, titulo, precio_usd, imagen_url, activo, user_id, ubicacion_ciudad)').eq('user_id', user.id).order('creado_en', { ascending: false }).then(({ data }) => {
        setFavoritos(data || [])
        setFavoritosCount(data?.length || 0)
      }),
      supabase.from('perfiles').select('credito_balance, nombre, telefono, estado, ciudad, foto_perfil_url, verificado, nivel_confianza, badges_automaticos, ultima_actividad, creado_en').eq('id', user.id).single().then(({ data }) => {
        setCreditos(data?.credito_balance ?? 0)
        if (data) {
          setNombre(data.nombre || '')
          setTelefono(data.telefono || '')
          setEstado(data.estado || '')
          setCiudad(data.ciudad || '')
          setFotoUrl(data.foto_perfil_url || null)
          setVerificado(data.verificado || false)
          setNivelConfianza(data.nivel_confianza ?? 0)
          setBadgesAuto(data.badges_automaticos || [])
          setUltimaActividad(data.ultima_actividad || null)
          setCreadoEn(data.creado_en || null)
        }
      }),
      supabase.from('productos').select('*', { count: 'exact' }).eq('user_id', user.id).eq('activo', true).then(({ count }) => setPubCount(count || 0)),
      supabase.from('resenas').select('*').eq('vendedor_id', user.id).order('creado_en', { ascending: false }).then(({ data }) => {
        setResenas(data || [])
        if (data && data.length > 0) {
          const avg = data.reduce((sum: number, r: any) => sum + r.puntuacion, 0) / data.length
          setPromedioResenas(Math.round(avg * 10) / 10)
        }
      }),
    ]).finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    if (authLoading) return
    refreshAll()
  }, [user, authLoading, refreshAll])

  // Realtime credit notification
  useEffect(() => {
    if (!user) return
    const sub = supabase
      .channel('credit-notif')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'perfiles', filter: `id=eq.${user.id}` },
        (payload) => {
          const newBalance = payload.new?.credito_balance
          const oldBalance = payload.old?.credito_balance
          if (typeof newBalance === 'number' && typeof oldBalance === 'number' && newBalance > oldBalance) {
            const diff = newBalance - oldBalance
            setCreditos(newBalance)
            setToast(`✅ +${diff} créditos añadidos a tu cuenta`)
            setTimeout(() => setToast(null), 6000)
          } else if (typeof newBalance === 'number') {
            setCreditos(newBalance)
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [user])

  return {
    productos, setProductos, visitasTotales, favoritos, favoritosCount,
    creditos, setCreditos, pubCount, nombre, setNombre, telefono, setTelefono,
    estado, setEstado, ciudad, setCiudad, fotoUrl, setFotoUrl, verificado,
    nivelConfianza, badgesAuto, ultimaActividad, creadoEn, resenas,
    promedioResenas, loading, setToast, toast, refreshAll,
  }
}
