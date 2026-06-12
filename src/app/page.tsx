import { supabase } from '@/lib/supabase'
import { HomePageClient } from '@/components/HomePageClient'

async function getDestacados(limit = 8) {
  try {
    const { data, error } = await supabase.rpc('obtener_destacados_home', { p_limite: limit })
    if (!error && data) return data as any[]

    const { data: data2 } = await supabase
      .from('productos')
      .select('id, titulo, precio_usd, estado, imagen_url, ubicacion_ciudad, destacado, destacado_hasta')
      .eq('estado', 'activo')
      .eq('estado_moderacion', 'aprobado')
      .not('destacado_hasta', 'is', null)
      .gt('destacado_hasta', new Date().toISOString())
      .order('destacado_hasta', { ascending: false })
      .limit(limit)
    return (data2 || []) as any[]
  } catch {
    return []
  }
}

export default async function Home() {
  const destacados = await getDestacados(8)
  return <HomePageClient destacados={destacados} />
}

export const revalidate = 120