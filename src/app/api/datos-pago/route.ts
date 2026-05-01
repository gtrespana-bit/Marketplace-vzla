import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  
  // Get the admin profile (verified profile has the payment data)
  const { data: perfil, error } = await supabase
    .from('perfiles')
    .select('pago_movil_telefono, pago_movil_cedula, pago_movil_banco')
    .eq('pago_movil_telefono', process.env.ADMIN_PAGO_MOVIL_TELEFONO || '')
    .single()

  // If no env var, just return the first verificado profile
  if (!perfil || error) {
    const { data: admin } = await supabase
      .from('perfiles')
      .select('pago_movil_telefono, pago_movil_cedula, pago_movil_banco')
      .eq('verificado', true)
      .maybeSingle()
    
    if (!admin || !admin.pago_movil_telefono) {
      // Fallback to hardcoded if admin profile doesn't have payment data
      return NextResponse.json({
        pagoMovil: {
          telefono: '04124444444',
          cedula: 'V29394292',
          banco: 'Banesco'
        }
      })
    }

    return NextResponse.json({
      pagoMovil: {
        telefono: admin.pago_movil_telefono,
        cedula: admin.pago_movil_cedula || 'V29394292',
        banco: admin.pago_movil_banco || 'Banesco'
      }
    })
  }

  return NextResponse.json({
    pagoMovil: perfil
  })
}
