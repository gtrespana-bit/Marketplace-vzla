import { NextRequest, NextResponse } from 'next/server'
import { emailCreditosAgregados } from '@/lib/server-email'
import { createClient } from '@supabase/supabase-js'

// POST /api/email-creditos — send credit added notification
export async function POST(req: NextRequest) {
  try {
    const { userId, cantidad, balanceTotal } = await req.json()
    if (!userId || !cantidad) return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 })

    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: authUsers } = await sb.auth.admin.listUsers()
    const user = authUsers.users.find((u: any) => u.id === userId)
    if (!user?.email) return NextResponse.json({ ok: false, error: 'Email not found' }, { status: 404 })

    const nombre = user.email.split('@')[0]
    await emailCreditosAgregados(user.email, nombre, cantidad, balanceTotal ?? cantidad)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
