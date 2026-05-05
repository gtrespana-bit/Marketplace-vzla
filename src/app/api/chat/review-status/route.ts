import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/chat/review-status
 * 
 * Devuelve toda la info necesaria para mostrar el botón de reseña del comprador.
 * Usa service_role → sin problemas de RLS.
 */
export async function POST(req: NextRequest) {
  try {
    const { convId, userId } = await req.json()
    if (!convId || !userId) {
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
      return NextResponse.json({ productoOwnerId: null, yaDejoResena: false })
    }

    // 2. Obtener owner del producto (= vendedor)
    const { data: prod } = await sb
      .from('productos')
      .select('user_id')
      .eq('id', conv.producto_id)
      .single()
    if (!prod) {
      return NextResponse.json({ productoOwnerId: null, yaDejoResena: false })
    }

    // 3. Si soy el vendedor → no aplica
    if (userId === prod.user_id) {
      return NextResponse.json({ esVendedor: true, productoOwnerId: prod.user_id, yaDejoResena: false })
    }

    // 4. Verificar si ya dejé reseña para ESTE producto
    const { count } = await sb
      .from('resenas')
      .select('id', { count: 'exact', head: true })
      .eq('comprador_id', userId)
      .eq('vendedor_id', prod.user_id)
      .eq('producto_id', conv.producto_id)

    return NextResponse.json({
      productoOwnerId: prod.user_id,
      yaDejoResena: (count ?? 0) > 0,
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
