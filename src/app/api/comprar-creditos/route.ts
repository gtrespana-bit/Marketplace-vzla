import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST /api/comprar-creditos
// Recibe comprobante de compra y auto-aproba si el monto coincide (±15%)
// Si no, queda pendiente y notifica a Telegram
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

  const { userId, creditos, precioUsd, metodoPago, bsPagado, tasaBcv, comprobanteUrl } = body as {
    userId: string
    creditos: number
    precioUsd: number
    metodoPago: string
    bsPagado: number
    tasaBcv: number
    comprobanteUrl: string
  }

  if (!userId || !creditos || !precioUsd || !metodoPago || !comprobanteUrl) {
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 })
  }

  // Calcular monto esperado en Bs
  const bsEsperado = precioUsd * tasaBcv
  const margen = bsEsperado > 0 ? Math.abs((bsPagado - bsEsperado) / bsEsperado) * 100 : 100

  // Auto-aprobar si el margen es ≤ 15%
  const autoAprobar = bsPagado > 0 && margen <= 15

  if (autoAprobar) {
    // Aprobar automáticamente
    const { data: perfil } = await sb.from('perfiles').select('credito_balance').eq('id', userId).single()
    const nuevoBalance = (perfil?.credito_balance || 0) + creditos

    await sb.from('perfiles').update({ credito_balance: nuevoBalance }).eq('id', userId)

    const { data: tx, error: txErr } = await sb.from('transacciones_creditos').insert({
      user_id: userId,
      tipo: 'compra',
      monto: creditos,
      metodo_pago: metodoPago,
      comprobante_url: comprobanteUrl,
      estado: 'aprobado',
      precio_bs: bsPagado,
    }).select().single()

    if (txErr) {
      console.error('[comprar-creditos] Error insertando transacción:', txErr)
      return NextResponse.json({ ok: false, error: txErr.message }, { status: 500 })
    }

    // Notificar Telegram (sin botones, ya aprobada)
    try {
      await notifyTelegram(
        `✅ *Compra aprobada automáticamente*\n\n` +
        `📦 ${creditos} créditos añadidos\n` +
        `💰 $${precioUsd} USD ≈ Bs. ${bsPagado.toLocaleString()}\n` +
        `💳 ${metodoPago}\n` +
        `👤 ${userId}\n\n` +
        `_Monto correcto (margen ${margen.toFixed(1)}%)_`
      )
    } catch {}

    return NextResponse.json({ ok: true, autoApproved: true, balance: nuevoBalance })
  } else {
    // No auto-aprobar → pendiente + Telegram con botones
    const { data: tx, error: txErr } = await sb.from('transacciones_creditos').insert({
      user_id: userId,
      tipo: 'compra',
      monto: creditos,
      metodo_pago: metodoPago,
      comprobante_url: comprobanteUrl,
      estado: 'pendiente',
      precio_bs: bsPagado,
    }).select().single()

    if (txErr) {
      console.error('[comprar-creditos] Error insertando transacción:', txErr)
      return NextResponse.json({ ok: false, error: txErr.message }, { status: 500 })
    }

    // Notificar a Telegram con botones approve/reject
    const txId = tx.id
    const telegramMsg = bsPagado > 0
      ? `🛒 *Nueva compra de créditos*\n\n` +
        `📦 ${creditos} créditos — $${precioUsd} USD\n` +
        `💰 Pagó: Bs. ${bsPagado.toLocaleString()}\n` +
        `💰 Esperado: Bs. ${Math.round(bsEsperado).toLocaleString()} (tasa ${tasaBcv})\n` +
        `📊 Margen: ${margen.toFixed(1)}% (límite 15%)\n` +
        `💳 ${metodoPago}\n` +
        `👤 ${userId}\n` +
        `📎 Comprobante disponible en admin`
      : `🛒 *Nueva compra de créditos*\n\n` +
        `📦 ${creditos} créditos — $${precioUsd} USD\n` +
        `💳 ${metodoPago}\n` +
        `👤 ${userId}\n` +
        `⚠️ No indicó monto en Bs\n` +
        `📎 Revisa comprobante en admin`

    try {
      await notifyTelegramWithButtons(telegramMsg, txId)
    } catch {}

    return NextResponse.json({ ok: true, autoApproved: false, reason: margen > 15 ? 'Monto no coincide' : 'Sin Bs indicado' })
  }
}

async function notifyTelegram(text: string) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID
  if (!BOT_TOKEN || !CHAT_ID) return

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: text,
      parse_mode: 'Markdown',
    }),
  })
}

async function notifyTelegramWithButtons(text: string, txId: string) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID
  if (!BOT_TOKEN || !CHAT_ID) return

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: text,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Aprobar', callback_data: `aprobar:${txId}` },
            { text: '❌ Rechazar', callback_data: `rechazar:${txId}` },
          ],
        ],
      },
    }),
  })
}
