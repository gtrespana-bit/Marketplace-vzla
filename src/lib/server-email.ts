'use server'

import nodemailer from 'nodemailer'
import { emailLayout, card, priceLine, COLORS } from '@/lib/email-layout'

const FROM = '"VendeT-Venezuela" <noreply@vendet.online>'
const URL = process.env.NEXT_PUBLIC_URL || 'https://vendet.online'

// ─── Transporter ───────────────────────────────────────────
//
// El envío transaccional soporta dos espacios de variables para el SMTP:
//  1. SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS  (preferido, proveedor neutral)
//  2. ZOHO_SMTP_HOST / ZOHO_SMTP_PORT / ZOHO_SMTP_USER / ZOHO_SMTP_PASS (legado)
// Si la cuenta SMTP de Zoho es gratuita, Zoho bloquea SMTP/IMAP/POP:
// usa un proveedor con SMTP en plan gratis (Resend, Brevo, SendGrid…) y solo
// cambia las variables, sin tocar código.

const SMTP_HOST = process.env.SMTP_HOST || process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com'
const SMTP_PORT = Number(process.env.SMTP_PORT || process.env.ZOHO_SMTP_PORT) || 587
const SMTP_USER = process.env.SMTP_USER || process.env.ZOHO_SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS || process.env.ZOHO_SMTP_PASS

function getTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    tls: { rejectUnauthorized: false },
  })
}

/**
 * Envío SMTP genérico de la app. Devuelve true solo si el correo quedó
 * entregado al servidor SMTP (es el mismo canal que usan el resto de
 * notificaciones transaccionales de VendeT).
 */
export async function enviarEmailSMTP(to: string, subject: string, html: string): Promise<boolean> {
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn('⚠️ SMTP no configurado (faltan SMTP_USER/SMTP_PASS o ZOHO_SMTP_USER/ZOHO_SMTP_PASS)')
    return false
  }
  try {
    await getTransporter().sendMail({ from: FROM, to, subject, html })
//
    return true
  } catch (e) {
    console.error('❌ Error email:', e)
    return false
  }
}

async function enviar(to: string, subject: string, html: string): Promise<boolean> {
  return enviarEmailSMTP(to, subject, html)
}

// ─── 1. Producto Publicado ─────────────────────────────────

export async function emailProductoPublicado(
  email: string,
  nombre: string,
  titulo: string,
  precio: string,
  slug: string,
): Promise<boolean> {
  return enviar(email, '✅ Tu anuncio fue publicado', emailLayout(
    'Anuncio publicado',
    `<p style="margin:0 0 16px">Hola <strong>${nombre}</strong>,</p>
     <p style="margin:0 0 20px">Tu anuncio ya está visible en VendeT-Venezuela para que miles de compradores lo vean.</p>
     ${card(`
       <p style="margin:0 0 8px;font-weight:600;font-size:16px;color:${COLORS.dark}">${titulo}</p>
       <p style="margin:0;font-size:22px;font-weight:700;color:${COLORS.primary}">$${precio} USD</p>
     `)}
     <p style="margin:24px 0 0;color:${COLORS.gray};font-size:14px">Consejo: revisa tu anuncio desde tu perfil para asegurarte de que la foto principal sea la mejor.</p>`,
    'Ver mi anuncio',
    `${URL}/producto/${slug}`,
  ))
}

// ─── 2. Mensaje Recibido ───────────────────────────────────

export async function emailMensajeRecibido(
  emailVendedor: string,
  nombreVendedor: string,
  nombreComprador: string,
  producto: string,
  mensajePreview: string,
): Promise<boolean> {
  return enviar(emailVendedor, `💬 Nuevo mensaje sobre "${producto}"`, emailLayout(
    'Nuevo mensaje',
    `<p style="margin:0 0 16px">Hola <strong>${nombreVendedor}</strong>,</p>
     <p style="margin:0 0 20px">Un comprador te escribió sobre tu anuncio:</p>
     ${card(`
       <p style="margin:0 0 12px;font-weight:600;color:${COLORS.dark}">${producto}</p>
       <p style="margin:0 0 8px"><strong>De:</strong> ${nombreComprador}</p>
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.white};border-radius:8px;padding:16px;margin-top:8px;border-left:3px solid ${COLORS.primary}">
         <tr><td style="font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:14px;color:${COLORS.dark};font-style:italic;line-height:1.6">"${mensajePreview}"</td></tr>
       </table>
     `)}
     <p style="margin:24px 0 0;color:${COLORS.gray};font-size:14px">Responder pronto aumenta tus posibilidades de venta.</p>`,
    'Responder mensaje',
    `${URL}/dashboard?tab=mensajes`,
  ))
}

// ─── 3. Créditos Añadidos ──────────────────────────────────

export async function emailCreditosAgregados(
  email: string,
  nombre: string,
  cantidad: number,
  balanceTotal: number,
): Promise<boolean> {
  return enviar(email, `✅ +${cantidad} créditos en tu cuenta`, emailLayout(
    'Créditos añadidos',
    `<p style="margin:0 0 16px">Hola <strong>${nombre}</strong>,</p>
     <p style="margin:0 0 20px">Se acreditaron créditos a tu cuenta:</p>
     ${card(`
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
         <tr>${priceLine('Créditos añadidos', `+${cantidad}`)}</tr>
         <tr style="border-top:1px solid ${COLORS.lightGray}"><td style="padding-top:8px;font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:14px;color:${COLORS.gray}">Balance total</td><td align="right" style="padding-top:8px;font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:20px;font-weight:700;color:${COLORS.success}">${balanceTotal}</td></tr>
       </table>
     `)}`,
    'Ir a mi perfil',
    `${URL}/dashboard?tab=perfil`,
  ))
}

// ─── 4. Verificación Aprobada ──────────────────────────────

export async function emailVerificacionAprobada(email: string, nombre: string): Promise<boolean> {
  return enviar(email, '🎉 Tu cuenta fue verificada', emailLayout(
    'Cuenta verificada',
    `<p style="margin:0 0 16px">Hola <strong>${nombre}</strong>,</p>
     <div style="text-align:center;padding:24px 0">
       <p style="font-size:52px;margin:0">✅</p>
       <p style="font-size:18px;font-weight:700;color:${COLORS.primary};margin:12px 0">Verificación completada</p>
     </div>
     <p style="margin:0 0 16px;text-align:center">Tu cuenta ahora tiene el sello de verificación visible en todos tus anuncios.</p>
     <p style="margin:0;text-align:center;color:${COLORS.gray};font-size:14px">Esto aumenta la confianza de los compradores y mejora tus ventas.</p>`,
    'Ver mi perfil',
    `${URL}/dashboard`,
  ))
}

// ─── 5. Subida de Nivel ────────────────────────────────────

export async function emailSubidaNivel(
  email: string,
  nombre: string,
  nivelNuevo: string,
  nivelAnterior: string,
): Promise<boolean> {
  const emojis: Record<string, string> = { Bronce: '🥉', Plata: '🥈', Oro: '🥇', Diamante: '💎' }
  const emoji = emojis[nivelNuevo] || '⭐'
  return enviar(email, `${emoji} Subiste de nivel: ${nivelNuevo}`, emailLayout(
    `¡Ahora eres ${nivelNuevo}!`,
    `<p style="margin:0 0 16px">Hola <strong>${nombre}</strong>,</p>
     <div style="text-align:center;padding:24px 0">
       <p style="font-size:52px;margin:0">${emoji}</p>
       <p style="font-size:18px;font-weight:700;color:${COLORS.primary};margin:12px 0">Subiste de nivel</p>
     </div>
     ${card(`
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
         ${priceLine('Nivel anterior', nivelAnterior)}
         <tr style="border-top:1px solid ${COLORS.lightGray}"><td style="padding-top:8px;font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:14px;color:${COLORS.gray}">Nuevo nivel</td><td align="right" style="padding-top:8px;font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:18px;font-weight:700;color:${COLORS.accent}">${nivelNuevo}</td></tr>
       </table>
     `)}`,
    'Ver mi perfil',
    `${URL}/dashboard?tab=perfil`,
  ))
}
