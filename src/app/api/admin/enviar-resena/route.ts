import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Enviar reseña desde el vendedor al comprador.
 * Server-side para bypass RLS.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { producto_id, evaluador_id, evaluado_id, puntuacion, comentario } = body

    if (!producto_id || !evaluador_id || !evaluado_id) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabaseAdmin.from('resenas').insert({
      producto_id,
      vendedor_id: evaluado_id,
      comprador_id: evaluador_id,
      puntuacion,
      comentario: comentario || null,
    })

    if (error) {
      // Si la columna no existe (42703) o la tabla no existe (42P01), avisar
      if (error.code === '42P01' || error.code === '42703') {
        return NextResponse.json({ error: 'La tabla o columna no existe. Necesitas ejecutar la migración.', details: error.message }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
