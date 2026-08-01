import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireUser } from '@/lib/require-auth'
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
import { validateConversationData } from '@/lib/validation'

export async function POST(req: Request) {
  try {
    const auth = await requireUser(req as any)
    if ('response' in auth) return auth.response
    const uid = auth.user.id
    const ip = getClientIp(req)
    const limit = await checkRateLimit('conversacion:create', uid, { ip })
    if (!limit.ok) return rateLimitResponse(limit.resetIn)

    const body = await req.json()
    const { vendedorId, productoId } = body

    // Validar datos de la conversación
    const validation = validateConversationData({ vendedorId, productoId })
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // No permitir conversaciones consigo mismo
    if (vendedorId === uid) {
      return NextResponse.json({ error: 'No puedes iniciar conversación contigo mismo' }, { status: 400 })
    }

    // Create admin client inside function (avoids build-time env errors)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Check if conversation already exists
    const { data: existing } = await supabaseAdmin
      .from('conversaciones')
      .select('id')
      .or(`and(user1_id.eq.${uid},user2_id.eq.${vendedorId}),and(user1_id.eq.${vendedorId},user2_id.eq.${uid})`)
      .eq('producto_id', productoId)
      .single()

    if (existing) {
      return NextResponse.json({ id: existing.id })
    }

    // Create conversation (bypass RLS with service_role key)
    const u1 = uid < vendedorId ? uid : vendedorId
    const u2 = uid < vendedorId ? vendedorId : uid

    const { data: newConv, error } = await supabaseAdmin
      .from('conversaciones')
      .insert({ user1_id: u1, user2_id: u2, producto_id: productoId })
      .select()
      .single()

    if (error) {
      console.error('Error creando conversación:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(newConv)
  } catch (e: any) {
    console.error('Error en crear-conversacion:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
