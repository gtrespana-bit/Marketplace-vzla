import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireUser } from '@/lib/require-auth'

/**
 * POST /api/chat/review-status
 *
 * Devuelve toda la info para el botón de reseña del comprador.
 * Exige sesión: el userId SIEMPRE sale de la sesión (antes venía del body
 * y permitía consultar conversaciones/productos ajenos).
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req)
    if ('response' in auth) return auth.response
    const userId = auth.user.id

    const { convId } = await req.json()
    if (!convId) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // 1. Obtener producto_id de la conversación
    const { data: conv } = await sb
      .from('conversaciones')
      .select('producto_id')
      .eq('id', convId)
      .single()
    if (!conv || !conv.producto_id) {
      return NextResponse.json({ productoOwnerId: null, puedeResenar: false, yaDejoResena: false })
    }

    // 2. Obtener datos del producto (activo = no vendido, inactivo = vendido/pausado)
    const { data: prod } = await sb
      .from('productos')
      .select('user_id, activo')
      .eq('id', conv.producto_id)
      .single()
    if (!prod) {
      return NextResponse.json({ productoOwnerId: null, puedeResenar: false, yaDejoResena: false })
    }

    const productoOwnerId = prod.user_id

    // 3. Si soy el vendedor → no aplica
    if (userId === productoOwnerId) {
      return NextResponse.json({ productoOwnerId, puedeResenar: false, yaDejoResena: false, esVendedor: true })
    }

    // 4. Solo puede reseñar si el producto NO está activo (=vendido/pausado)
    const productoVendido = !prod.activo

    // 5. Verificar si ya dejé reseña para ESTE producto
    const { count } = await sb
      .from('resenas')
      .select('id', { count: 'exact', head: true })
      .eq('comprador_id', userId)
      .eq('vendedor_id', productoOwnerId)
      .eq('producto_id', conv.producto_id)

    const yaDejoResena = (count ?? 0) > 0

    return NextResponse.json({
      productoOwnerId,
      productoId: conv.producto_id,
      productoVendido,
      puedeResenar: productoVendido && !yaDejoResena,
      yaDejoResena,
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
