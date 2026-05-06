import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { notifyUser } from '@/lib/push-notify'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, verificado, verificado_desde } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const updateData: Record<string, any> = { verificado: verificado === true }
    if (verificado === true) {
      updateData.verificado_desde = verificado_desde || new Date().toISOString()
    }

    const { error } = await supabaseAdmin
      .from('perfiles')
      .update(updateData)
      .eq('id', userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Push notification
    await notifyUser(supabaseAdmin, userId, {
      title: verificado ? '✅ Perfil verificado' : '❌ Verificación revocada',
      body: verificado
        ? 'Tu perfil ya está verificado en VendeT.'
        : 'Tu perfil ya no está verificado en VendeT.',
      tag: verificado ? 'verified' : 'verified-revoked',
      icon: '/icon-192.png',
      click_url: '/dashboard',
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
