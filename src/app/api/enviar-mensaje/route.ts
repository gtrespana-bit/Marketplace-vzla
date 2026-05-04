import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { conversacion_id, remitente_id, destinatario_id, contenido } = await req.json()
    if (!remitente_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rl = checkRateLimit('mensaje:create', remitente_id)
    if (!rl.ok) {
      return NextResponse.json({
        error: `Demasiados mensajes. Espera ${Math.ceil(rl.resetIn / 60000)} min`,
        resetIn: rl.resetIn
      }, { status: 429 })
    }

    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data, error } = await sb.from('mensajes').insert({
      conversacion_id, remitente_id, destinatario_id, contenido
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
