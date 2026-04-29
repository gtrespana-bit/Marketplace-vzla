import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('[notify] Missing env vars')
    return NextResponse.json({ ok: false, error: 'Config missing' }, { status: 500 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 })
  }

  const mensaje = body?.mensaje
  if (!mensaje) {
    return NextResponse.json({ ok: false, error: 'No message' }, { status: 400 })
  }

  // Strip all HTML-like tags — send as plain text
  const text = String(mensaje).replace(/<[^>]*>/g, '')

  console.log('[notify] Sending:', JSON.stringify(text).substring(0, 200))

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  const payload = {
    chat_id: CHAT_ID,
    text: text,
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    console.log('[notify] Telegram response:', JSON.stringify(data))
    return NextResponse.json({ ok: data.ok === true, telegram: data })
  } catch (err: any) {
    console.error('[notify] Error:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
