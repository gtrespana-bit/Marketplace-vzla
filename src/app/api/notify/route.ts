import { NextRequest, NextResponse } from 'next/server'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''

export async function POST(req: NextRequest) {
  if (!BOT_TOKEN) {
    return NextResponse.json({ ok: false, error: 'Bot token no configurado' }, { status: 500 })
  }

  const body = await req.json()
  const { mensaje } = body

  if (!mensaje) {
    return NextResponse.json({ ok: false, error: 'Falta mensaje' }, { status: 400 })
  }

  const tgUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  const tgBody = {
    chat_id: CHAT_ID,
    text: mensaje,
    parse_mode: 'Markdown',
  }

  try {
    const res = await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tgBody),
    })
    const data = await res.json()
    if (data.ok) {
      return NextResponse.json({ ok: true })
    } else {
      console.error('Telegram error:', data)
      return NextResponse.json({ ok: false, error: data.description }, { status: 500 })
    }
  } catch (err: any) {
    console.error('Fetch error:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
