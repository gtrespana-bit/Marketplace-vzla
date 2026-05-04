import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const { email, password, data } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // Rate limit by email (not user id since they may not exist yet)
    const rl = checkRateLimit('auth:login', email)
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Demasiados intentos. Espera ${Math.ceil(rl.resetIn / 60000)} min`, resetIn: rl.resetIn },
        { status: 429 }
      )
    }

    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
    const { data: result, error } = await sb.auth.signInWithPassword({ email, password })
    if (error) return NextResponse.json({ error: error.message }, { status: 401 })
    return NextResponse.json({ ok: true, user: result.user, session: result.session })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
