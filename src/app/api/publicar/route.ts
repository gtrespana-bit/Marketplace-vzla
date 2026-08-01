import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { checkRateLimit } from '@/lib/rate-limit'
import { createClient } from '@supabase/supabase-js'
import { validateProductData, sanitizeObject } from '@/lib/validation'
import { requireUser } from '@/lib/require-auth'

export async function POST(req: NextRequest) {
  try {
    // El user_id SIEMPRE sale de la sesión verificada (getUser valida el JWT).
    // Antes venía del body: cualquiera podía publicar como otro usuario y
    // evadir el rate limit cambiando el userId.
    const auth = await requireUser(req)
    if ('response' in auth) return auth.response
    const userId = auth.user.id

    const body = await req.json()
    // Descartamos userId/user_id del body: el user_id SIEMPRE sale de la
    // sesión verificada arriba. Si los dejáramos pasar, 'userId' (columna que
    // no existe en 'productos') se colaría en el INSERT y PostgREST fallaría con
    // "Could not find the 'userId' column of 'productos' in the schema cache".
    const { moderacionAlerta, userId: _bodyUserId, user_id: _bodyUserIdSnake, ...productoData } = body

    // Validar datos del producto
    const validation = validateProductData({ userId, ...productoData })
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Sanitizar strings para prevenir XSS
    const sanitizedData = sanitizeObject(productoData)

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const rl = await checkRateLimit('producto:create', userId, { ip })
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Demasiadas publicaciones. Espera ${Math.ceil(rl.resetIn / 60000)} min`, resetIn: rl.resetIn },
        { status: 429 }
      )
    }

    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data, error } = await sb.from('productos').insert({ ...sanitizedData, user_id: userId }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Revalidate ISR cache — product appears immediately on home/catalogo
    revalidatePath('/')
    revalidatePath('/catalogo')

    // Telegram alert if moderation needed
    if (moderacionAlerta && moderacionAlerta.nivel) {
      const BOT = process.env.TELEGRAM_BOT_TOKEN
      const CHAT = process.env.TELEGRAM_CHAT_ID
      if (BOT && CHAT) {
        fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: CHAT,
            text: `⚠️ <b>ALERTA MODERACIÓN — ${moderacionAlerta.nivel.toUpperCase()}</b>\n\n📝 "${moderacionAlerta.titulo}"\n👤 ${moderacionAlerta.userName}\n🚫 Palabras: ${moderacionAlerta.palabras?.join(', ') || 'N/A'}`,
            parse_mode: 'HTML',
          }),
        }).catch(() => {})
      }
    }

    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
