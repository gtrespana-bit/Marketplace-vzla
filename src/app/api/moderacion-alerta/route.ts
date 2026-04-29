import { NextRequest, NextResponse } from 'next/server'
import { verificarContenido, formatearAlertaModeracion } from '@/lib/moderacion'

/**
 * POST /api/moderacion-alerta
 * Envía notificación a Telegram cuando se detecta contenido sospechoso/prohibido
 */
export async function POST(req: NextRequest) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID

  if (!BOT_TOKEN || !CHAT_ID) {
    return NextResponse.json({ ok: false, error: 'Config missing' }, { status: 500 })
  }

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
