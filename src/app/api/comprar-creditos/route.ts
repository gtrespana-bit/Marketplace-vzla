import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST /api/comprar-creditos
// Regla: comprobante subido correctamente ✓ → aprobar automático
// Si falla algo → pendiente + Telegram con botones approve/reject
export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ ok: false, error: 'Config missing' }, { status: 500 })
  }

  const sb = createClient(supabaseUrl, serviceKey)

  let body: any
  try { body = await req.json() } catch {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 })
  }

  const { userId, creditos, precioUsd, metodoPago, comprobanteUrl } = body as {
    userId: string
    creditos: number
    precioUsd: number
    metodoPago: string
    comprobanteUrl: string
  }

  if (!userId || !creditos || !metodoPago || !comprobanteUrl) {
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 })
  }

  // Verificar que la imagen del comprobante existe
  // (HEAD request a la URL de Supabase Storage)
  let comprobanteValido = false
  try {
    const r = await fetch(comprobanteUrl, { method: 'HEAD' })
    comprobanteValido = r.ok || r.status === 403 // 403 = private bucket, pero el archivo existe
  } catch {}

  if (comprobanteValido) {
    // ✅ Auto-aprobar — el comprobante se subió correctamente
    const { data: perfil } = await sb.from('perfiles').select('credito_balance').eq('id', userId).single()
    const nuevoBalance = (perfil?.credito_balance || 0) + creditos

    await sb.from('perfiles').update({ credito_balance: nuevoBalance }).eq('id', userId)
    await sb.from('transacciones_creditos').insert({
      user_id: userId, tipo: 'compra', monto: creditos,
      metodo_pago: metodoPago, comprobante_url: comprobanteUrl,
      estado: 'aprobado',
    })

    // Notificar a Telegram
    await notifyTelegramSimple(
      `✅ Compra aprobada automáticamente\n\n` +
      `📦 ${creditos} créditos añadidos\n` +
      `💰 $${precioUsd} USD\n` +
      `💳 ${metodoPago}\n` +
      `👤 ${userId}\n\n` +
      `_Comprobante validado correctamente_`
    )

    return NextResponse.json({ ok: true, autoApproved: true, balance: nuevoBalance })
  } else {
    // ❌ No se pudo validar → pendiente + Telegram
    const { data: tx, error: txErr } = await sb.from('transacciones_creditos').insert({
      user_id: userId, tipo: 'compra', monto: creditos,
      metodo_pago: metodoPago, comprobante_url: comprobanteUrl,
      estado: 'pendiente',
    }).select().single()

    if (txErr) {
      return NextResponse.json({ ok: false, error: txErr.message }, { status: 500 })
    }

    await notifyTelegramBotones(
      `🛒 Nueva compra — revisar manualmente\n\n📦 ${creditos} créditos — $${precioUsd}\n💳 ${metodoPago}\n👤 ${userId}\n\nRevisa comprobante en admin: /admin`,
      tx.id
    )

    return NextResponse.json({ ok: true, autoApproved: false })
  }
}

async function notifyTelegramSimple(text: string) {
  const BOT = process.env.TELEGRAM_BOT_TOKEN
  const CHAT = process.env.TELEGRAM_CHAT_ID
  if (!BOT || !CHAT) return
  await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT, text, parse_mode: 'Markdown' }),
  })
}

async function notifyTelegramBotones(text: string, txId: string) {
  const BOT = process.env.TELEGRAM_BOT_TOKEN
  const CHAT = process.env.TELEGRAM_CHAT_ID
  if (!BOT || !CHAT) return
  await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT,
      text,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Aprobar', callback_data: `aprobar:${txId}` },
          { text: '❌ Rechazar', callback_data: `rechazar:${txId}` },
        ]],
      },
    }),
  })
}
