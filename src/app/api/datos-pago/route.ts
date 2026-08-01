import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )

  // No consultar perfiles con la clave pública: allí también existen datos
  // privados de verificación. Resolver primero los IDs administrativos y
  // leer los datos de pago solo en el servidor.
  const emails = (process.env.ADMIN_EMAILS || 'gtrespana@gmail.com')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)

  let adminIds: string[] = []
  try {
    const { data } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 })
    adminIds = (data?.users || [])
      .filter(user => user.email && emails.includes(user.email.toLowerCase()))
      .map(user => user.id)
  } catch {
    // Usar fallback debajo si Auth Admin no está disponible.
  }

  const { data: admin } = adminIds.length
    ? await sb
        .from('perfiles')
        .select('pago_movil_telefono, pago_movil_cedula, pago_movil_banco')
        .in('id', adminIds)
        .limit(1)
        .maybeSingle()
    : { data: null }

  if (!admin?.pago_movil_telefono) {
    return NextResponse.json({
      pagoMovil: {
        telefono: '04126443099',
        cedula: 'V20794917',
        banco: 'Banco Provincial BBVA',
      },
    })
  }

  return NextResponse.json({
    pagoMovil: {
      telefono: admin.pago_movil_telefono,
      cedula: admin.pago_movil_cedula || 'V29394292',
      banco: admin.pago_movil_banco || 'Banesco',
    },
  })
}
