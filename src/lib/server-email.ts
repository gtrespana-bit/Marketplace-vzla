'use server'

import nodemailer from 'nodemailer'

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com',
    port: Number(process.env.ZOHO_SMTP_PORT) || 587,
    secure: process.env.ZOHO_SMTP_PORT === '465',
    auth: {
      user: process.env.ZOHO_SMTP_USER,
      pass: process.env.ZOHO_SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  })
}

async function enviar(to: string, subject: string, html: string): Promise<boolean> {
  if (!process.env.ZOHO_SMTP_USER || !process.env.ZOHO_SMTP_PASS) {
    console.warn('⚠️ SMTP no configurado')
    return false
  }
  try {
    await getTransporter().sendMail({
      from: '"VendeT-Venezuela" <noreply@vendet.online>',
      to,
      subject,
      html,
    })
    console.log(`✅ Email a ${to}: ${subject}`)
    return true
  } catch (e) {
    console.error('❌ Error email:', e)
    return false
  }
}

const URL = process.env.NEXT_PUBLIC_URL || 'https://vendet.online'

/**
 * 1. Producto publicado — email al vendedor que publicó
 */
export async function emailProductoPublicado(
  email: string,
  nombre: string,
  titulo: string,
  precio: string,
  slug: string,
): Promise<boolean> {
  return enviar(email, '✅ Tu anuncio fue publicado', `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
      <h2 style="color:#1e3a8a">Hola ${nombre}!</h2>
      <p>Tu anuncio fue publicado exitosamente:</p>
      <div style="background:#f3f4f6;padding:16px;border-radius:10px;margin:16px 0">
        <p style="margin:0;font-size:18px;font-weight:bold">${titulo}</p>
        <p style="margin:8px 0 0;color:#1e3a8a;font-size:20px;font-weight:bold">$${precio}</p>
      </div>
      <a href="${URL}/producto/${slug}" style="display:inline-block;background:#1e3a8a;color:#fff;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:bold">Ver anuncio →</a>
      <p style="color:#6b7280;font-size:12px;margin-top:28px">VendeT-Venezuela</p>
    </div>
  `)
}

/**
 * 2. Mensaje recibido — email al vendedor que recibe un mensaje
 */
export async function emailMensajeRecibido(
  emailVendedor: string,
  nombreVendedor: string,
  nombreComprador: string,
  producto: string,
  mensajePreview: string,
): Promise<boolean> {
  return enviar(emailVendedor, `💬 ${nombreComprador} te escribió sobre "${producto}"`, `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
      <h2 style="color:#1e3a8a">Hola ${nombreVendedor}!</h2>
      <p><strong>${nombreComprador}</strong> te envió un mensaje sobre:</p>
      <p style="font-weight:bold">${producto}</p>
      <div style="background:#f3f4f6;padding:16px;border-radius:10px;margin:16px 0;font-style:italic">"${mensajePreview}"</div>
      <a href="${URL}/dashboard?tab=mensajes" style="display:inline-block;background:#1e3a8a;color:#fff;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:bold">Responder →</a>
      <p style="color:#6b7280;font-size:12px;margin-top:28px">VendeT-Venezuela</p>
    </div>
  `)
}

/**
 * 3. Créditos añadidos
 */
export async function emailCreditosAgregados(
  email: string,
  nombre: string,
  cantidad: number,
  balanceTotal: number,
): Promise<boolean> {
  return enviar(email, `✅ +${cantidad} créditos en tu cuenta`, `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
      <h2 style="color:#1e3a8a">Hola ${nombre}!</h2>
      <p>Se acreditaron <strong style="color:#1e3a8a;font-size:22px">${cantidad} créditos</strong> a tu cuenta.</p>
      <div style="background:#e8f5e9;padding:16px;border-radius:10px;margin:16px 0;text-align:center">
        <p style="margin:0;color:#6b7280;font-size:12px">Balance total</p>
        <p style="margin:4px 0 0;font-size:28px;font-weight:bold;color:#1e3a8a">${balanceTotal}</p>
      </div>
      <p style="color:#6b7280;font-size:12px;margin-top:28px">VendeT-Venezuela</p>
    </div>
  `)
}

/**
 * 4. Verificación completada
 */
export async function emailVerificacionAprobada(
  email: string,
  nombre: string,
): Promise<boolean> {
  return enviar(email, '🎉 Tu cuenta fue verificada!', `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
      <h2 style="color:#1e3a8a">Hola ${nombre}!</h2>
      <div style="text-align:center;padding:20px">
        <p style="font-size:48px;margin:0">✅</p>
        <p style="font-size:20px;font-weight:bold;margin:12px 0">Tu cuenta fue verificada</p>
        <p>Ahora tienes el sello de verificación visible en todos tus anuncios.</p>
      </div>
      <a href="${URL}/dashboard" style="display:inline-block;background:#1e3a8a;color:#fff;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:bold">Ir a tu perfil →</a>
      <p style="color:#6b7280;font-size:12px;margin-top:28px">VendeT-Venezuela</p>
    </div>
  `)
}

/**
 * 5. Subida de nivel
 */
export async function emailSubidaNivel(
  email: string,
  nombre: string,
  nivelNuevo: string,
  nivelAnterior: string,
): Promise<boolean> {
  const emojis: Record<string, string> = { Bronce: '🥉', Plata: '🥈', Oro: '🥇', Diamante: '💎' }
  const emoji = emojis[nivelNuevo] || '⭐'
  return enviar(email, `${emoji} Subiste de nivel: ${nivelNuevo}!`, `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
      <h2 style="color:#1e3a8a">Hola ${nombre}!</h2>
      <div style="text-align:center;padding:20px">
        <p style="font-size:48px;margin:0">${emoji}</p>
        <p style="font-size:20px;font-weight:bold;margin:12px 0">Ahora eres ${nivelNuevo}</p>
        <p>Subiste de <strong>${nivelAnterior}</strong> a <strong>${nivelNuevo}</strong>!</p>
      </div>
      <a href="${URL}/dashboard?tab=perfil" style="display:inline-block;background:#1e3a8a;color:#fff;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:bold">Ver perfil →</a>
      <p style="color:#6b7280;font-size:12px;margin-top:28px">VendeT-Venezuela</p>
    </div>
  `)
}
