import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, destacado } = body

    if (!productId || destacado === undefined) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const update: any = { destacado }
    if (destacado) {
      update.destacado_hasta = new Date(Date.now() + 48 * 3600000).toISOString()
    } else {
      update.destacado_hasta = null
    }

    const { error } = await supabaseAdmin
      .from('productos')
      .update(update)
      .eq('id', productId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, update })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error desconocido' }, { status: 500 })
  }
}
