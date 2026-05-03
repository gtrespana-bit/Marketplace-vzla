import { NextResponse } from 'next/server'
import { enviarEmail } from '@/lib/email'

export async function POST(request: Request) {
  const body = await request.json()
  const { to, subject, html } = body

  if (!to || !subject || !html) {
    return NextResponse.json({ error: 'Faltan campos: to, subject, html' }, { status: 400 })
  }

  const result = await enviarEmail({ to, subject, html })

  if (result.success) {
    return NextResponse.json({ success: true })
  } else {
    return NextResponse.json({ error: String(result.error) }, { status: 500 })
  }
}
