import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { createClient } from '@supabase/supabase-js'
import { validateMessageData, sanitizeString } from '@/lib/validation'
import { requireUser } from '@/lib/require-auth'

export async function POST(req: NextRequest) {
  try {
    // El remitente SIEMPRE sale de la sesión real (evita suplantación en el chat)
    const auth = await requireUser(req)
    if ('response' in auth) return auth.response
    const remitente_id = auth.user.id

    const body = await req.json()
    const { conversacion_id, destinatario_id, contenido } = body

    // Validar datos del mensaje
    const validation = validateMessageData({ conversacion_id, remitente_id, destinatario_id, contenido })
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Sanitizar contenido para prevenir XSS
    const contenidoSanitizado = sanitizeString(contenido, 5000)

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const rl = await checkRateLimit('mensaje:create', remitente_id, { ip })
    if (!rl.ok) {
      return NextResponse.json({
        error: `Demasiados mensajes. Espera ${Math.ceil(rl.resetIn / 60000)} min`,
        resetIn: rl.resetIn
      }, { status: 429 })
    }

    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Verificación adicional: si la conversación ya existe, el remitente debe ser miembro
    const { data: conv } = await sb
      .from('conversaciones')
      .select('user1_id, user2_id')
      .eq('id', conversacion_id)
      .maybeSingle()

    if (conv && conv.user1_id !== remitente_id && conv.user2_id !== remitente_id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { data, error } = await sb.from('mensajes').insert({
      conversacion_id, remitente_id, destinatario_id, contenido: contenidoSanitizado
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // ── Push notification al destinatario ───────────────
    try {
      const { data: sender } = await sb
        .from('perfiles')
        .select('nombre')
        .eq('id', remitente_id)
        .single()

      await sb.from('notificaciones_push').insert({
        target_user_id: destinatario_id,
        tipo: 'mensaje',
        titulo: `💬 ${sender?.nombre || 'Alguien'} te escribió`,
        cuerpo: contenido?.slice(0, 100) || 'Nuevo mensaje',
      })
    } catch { /* fail silently */ }

    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
