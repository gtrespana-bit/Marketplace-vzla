import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com',
    port: Number(process.env.ZOHO_SMTP_PORT) || 587,
    secure: process.env.ZOHO_SMTP_PORT === '465',
    auth: { user: process.env.ZOHO_SMTP_USER, pass: process.env.ZOHO_SMTP_PASS },
    tls: { rejectUnauthorized: false },
  })
}

/** Rate limiter simple en memoria */
const rateLimit = new Map<string, number>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const last = rateLimit.get(ip) || 0
  if (now - last < 60_000) return false // 1 min entre envios
  rateLimit.set(ip, now)
  return true
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
  const ip = req.headers.get('x-forwarded-for') || 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Demasiados intentos. Espera un minuto.' }, { status: 429 })
  }

  const body = await req.json()
  const { nombre, email, asunto, mensaje } = body as {
    nombre: string
    email: string
    asunto: string
    mensaje: string
  }

  if (!nombre || !email || !mensaje) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  if (!process.env.ZOHO_SMTP_USER || !process.env.ZOHO_SMTP_PASS) {
    console.warn('⚠️ SMTP no configurado - contacto')
    return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 })
  }

  try {
    const html = `
      <div style="font-family:sans-serif;max-width:600px;padding:24px">
        <h2 style="color:#7B2D3B">📩 Nuevo mensaje de contacto</h2>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px 0;font-weight:bold;color:#333">Nombre</td><td style="padding:8px 0">${nombre}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;color:#333">Email</td><td style="padding:8px 0"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;color:#333">Asunto</td><td style="padding:8px 0">${asunto}</td></tr>
        </table>
        <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin-top:8px">
          <strong>Mensaje:</strong><br>
          <div style="margin-top:8px;white-space:pre-wrap">${mensaje}</div>
        </div>
        <p style="margin-top:24px;color:#999;font-size:12px">VendeT-Venezuela · ${new Date().toLocaleString('es-VE')}</p>
      </div>
    `

    console.log('📧 Enviando email a soporte@vendet.online:', { nombre, email, asunto })
    console.log('SMTP config:', {
      host: process.env.ZOHO_SMTP_HOST,
      port: process.env.ZOHO_SMTP_PORT,
      user: process.env.ZOHO_SMTP_USER,
      hasPass: !!process.env.ZOHO_SMTP_PASS,
    })

    const transporter = getTransporter()
    // Verify connection before sending
    await transporter.verify()
    console.log('✅ SMTP conexión verificada')

    await transporter.sendMail({
      from: '"VendeT-Venezuela" <soporte@vendet.online>',
      to: 'soporte@vendet.online',
      replyTo: email,
      subject: `📩 Contacto: ${asunto || '(sin asunto)'}`,
      html,
    })

    console.log('✅ Email enviado correctamente')

    // Telegram notification
    await sendTelegramAlert(asunto, nombre, email, mensaje)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('❌ Error enviando email de contacto:', e?.message || e)
    console.error('Full error:', JSON.stringify(e, null, 2))
    return NextResponse.json({ error: e?.message || 'Error al enviar el mensaje' }, { status: 500 })
  }
}
