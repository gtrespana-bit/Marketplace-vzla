import { NextRequest, NextResponse } from 'next/server'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''

function escapeMarkdown(text: string): string {
  // Escape special MarkdownV2 chars: _ * [ ] ( ) ~ ` > # + - = | { } . !
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1')
}

export async function POST(req: NextRequest) {
  if (!BOT_TOKEN) {
    console.error('[notify] Bot token no configurado')
    return NextResponse.json({ ok: false, error: 'Bot token no configurado' }, { status: 500 })
  }

  const body = await req.json()
  const { mensaje, parseMode = 'HTML' } = body

  if (!mensaje) {
    return NextResponse.json({ ok: false, error: 'Falta mensaje' }, { status: 400 })
  }

  // Default: HTML mode (no escaping needed, use <b> <i> etc)
  const tgBody: Record<string, string> = {
    chat_id: CHAT_ID,
    text: mensaje,
  }

  if (parseMode === 'Markdown') {
    tgBody.parse_mode = 'MarkdownV2'
    tgBody.text = escapeMarkdown(mensaje)
  } else if (parseMode === 'HTML') {
    tgBody.parse_mode = 'HTML'
  }

  const tgUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  console.log('[notify] Enviando a Telegram:', tgBody.text.substring(0, 100))

  try {
    const res = await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tgBody),
    })
    const data = await res.json()
    if (data.ok) {
      console.log('[notify] Ok')
      return NextResponse.json({ ok: true })
    } else {
      console.error('[notify] Telegram error:', JSON.stringify(data))
      return NextResponse.json({ ok: false, error: data.description }, { status: 500 })
    }
  } catch (err: any) {
    console.error('[notify] Fetch error:', err.message)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
