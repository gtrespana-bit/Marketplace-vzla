import { NextRequest, NextResponse } from 'next/server'
import { verificarContenido, formatearAlertaModeracion } from '@/lib/moderacion'
import { createClient } from '@supabase/supabase-js'
import { notifyUser } from '@/lib/push-notify'
import { requireUser } from '@/lib/require-auth'
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

/**
 * POST /api/moderacion-alerta
 * Envía notificación a Telegram cuando se detecta contenido sospechoso/prohibido.
 * Exige sesión y rate limit: antes cualquiera podía spamear el Telegram del admin.
 */
export async function POST(req: NextRequest) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID

  if (!BOT_TOKEN || !CHAT_ID) {
    return NextResponse.json({ ok: false, error: 'Config missing' }, { status: 500 })
  }

  const auth = await requireUser(req)
  if ('response' in auth) return auth.response

  const ip = getClientIp(req)
  const limit = await checkRateLimit('notificacion:send', auth.user.id, { ip })
  if (!limit.ok) return rateLimitResponse(limit.resetIn)

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 })
  }

  const { nivel, titulo, palabras, userId, userName } = body

  if (!nivel || !titulo || !palabras || !userId) {
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 })
  }

  const texto = formatearAlertaModeracion(nivel, titulo, palabras, userId, userName)

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  const payload = {
    chat_id: CHAT_ID,
    text: texto,
    parse_mode: 'HTML',
  }

  // Push notification to admin user
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: adminProfile } = await sb
    .from('perfiles')
    .select('id')
    .eq('rol', 'admin')
    .single()

  if (adminProfile) {
    try {
      await notifyUser(sb, adminProfile.id, {
        title: '🚨 Alerta de moderación',
        body: `${nivel.toUpperCase()}: ${titulo} — ${userName || 'Anónimo'}`,
        tag: `mod-${nivel}`,
        icon: '/icon-192.png',
        click_url: '/admin',
      })
    } catch {}
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    return NextResponse.json({ ok: data.ok === true, telegram: data })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
