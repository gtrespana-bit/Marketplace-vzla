import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { sanitizeString, isValidEmail, isValidLength } from '@/lib/validation'
import { enviarEmailDetallado, emailConfigurado } from '@/lib/server-email'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID
const CONTACTO_DESTINO =
  process.env.CONTACTO_EMAIL || 'soporte@vendet.online'

/**
 * Rate limiter distribuido vía Supabase.
 *
 * Se comprueban DOS claves independientes:
 *  - por IP: frena ráfagas desde un mismo origen.
 *  - por email: frena a un bot con IPs rotativas que machaca el mismo buzón.
 *    (Sin esto, rotar IP era suficiente para llenar la bandeja.)
 * Con que una de las dos se pase, se corta.
 */
async function checkContactRateLimit(ip: string, email: string): Promise<boolean> {
  const [byIp, byEmail] = await Promise.all([
    checkRateLimit('contacto:send', ip, { ip }),
    checkRateLimit('contacto:email', email.toLowerCase(), { ip }),
  ])
  return byIp.ok && byEmail.ok
}

async function sendTelegramAlert(asunto: string, nombre: string, email: string, mensaje: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return
  const text =
    `📩 *Nuevo mensaje de contacto*\n\n` +
    `👤 *Nombre:* ${nombre}\n` +
    `📧 *Email:* ${email}\n` +
    `📋 *Asunto:* ${asunto}\n\n` +
    `📝 *Mensaje:*\n${mensaje}`
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'Markdown' }),
    })
  } catch {
    // Silent fail - Telegram is secondary
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }

  const { nombre, email, asunto, mensaje } = body as {
    nombre: string
    email: string
    asunto: string
    mensaje: string
  }

  // Validación PRIMERO: así la clave del rate limit por email usa un valor ya
  // validado y no se crean claves basura con cadenas arbitrarias del cliente.
  if (!nombre || !isValidLength(nombre, 2, 100)) {
    return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 })
  }
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }
  if (!mensaje || !isValidLength(mensaje, 10, 5000)) {
    return NextResponse.json({ error: 'Mensaje debe tener entre 10 y 5000 caracteres' }, { status: 400 })
  }

  if (!(await checkContactRateLimit(ip, email))) {
    return NextResponse.json({ error: 'Demasiados intentos. Espera un momento.' }, { status: 429 })
  }

  // Sanitización (anti-XSS)
  const nombreClean = sanitizeString(nombre, 100)
  const emailClean = sanitizeString(email, 254)
  const asuntoClean = sanitizeString(asunto || '(sin asunto)', 200)
  const mensajeClean = sanitizeString(mensaje, 5000)

  if (!(await emailConfigurado())) {
    console.warn('⚠️ Sin canal de email configurado - contacto')
    return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 })
  }

  try {
    const html = `
      <div style="font-family:sans-serif;max-width:600px;padding:24px">
        <h2 style="color:#7B2D3B">📩 Nuevo mensaje de contacto</h2>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px 0;font-weight:bold;color:#333">Nombre</td><td style="padding:8px 0">${nombreClean}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;color:#333">Email</td><td style="padding:8px 0"><a href="mailto:${emailClean}">${emailClean}</a></td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;color:#333">Asunto</td><td style="padding:8px 0">${asuntoClean}</td></tr>
        </table>
        <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin-top:8px">
          <strong>Mensaje:</strong><br>
          <div style="margin-top:8px;white-space:pre-wrap">${mensajeClean}</div>
        </div>
        <p style="margin-top:24px;color:#999;font-size:12px">VendeT-Venezuela · ${new Date().toLocaleString('es-VE')}</p>
      </div>
    `

    // Canal central: Resend API con fallback a SMTP.
    const resultado = await enviarEmailDetallado(
      CONTACTO_DESTINO,
      `📩 Contacto: ${asuntoClean}`,
      html,
      { replyTo: emailClean },
    )

    if (!resultado.ok) {
      console.error('❌ Error enviando email de contacto:', resultado.error)
      // Telegram sigue saliendo aunque falle el email.
      await sendTelegramAlert(asuntoClean, nombreClean, emailClean, mensajeClean)
      return NextResponse.json(
        { error: 'No se pudo enviar el mensaje por email. Inténtalo de nuevo o escríbenos por Telegram.' },
        { status: 502 },
      )
    }

    // Telegram notification
    await sendTelegramAlert(asuntoClean, nombreClean, emailClean, mensajeClean)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('❌ Error enviando email de contacto:', e?.message || e)
    console.error('Full error:', JSON.stringify(e, null, 2))
    return NextResponse.json({ error: e?.message || 'Error al enviar el mensaje' }, { status: 500 })
  }
}
