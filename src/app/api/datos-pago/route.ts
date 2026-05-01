import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  // Get the verified admin profile which has the payment data
  const { data: admin } = await supabase
    .from('perfiles')
    .select('pago_movil_telefono, pago_movil_cedula, pago_movil_banco')
    .eq('verificado', true)
    .maybeSingle()

  if (!admin || !admin.pago_movil_telefono) {
    // Fallback if admin profile doesn't have payment data
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
