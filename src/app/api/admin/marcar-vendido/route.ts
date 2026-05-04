import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productoId, userId, vendidoEn, compradorId } = body

    if (!productoId || !userId) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verificar que el usuario es el dueño
    const { data: producto } = await supabaseAdmin
      .from('productos')
      .select('user_id, activo')
      .eq('id', productoId)
      .single()

    if (!producto || producto.user_id !== userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    if (!producto.activo && !producto.vendido) {
      return NextResponse.json({ error: 'El producto no está activo' }, { status: 400 })
    }

    // Marcar como vendido
    const updateData: Record<string, any> = {
      activo: false,
      vendido: true,
      vendido_en: vendidoEn || 'no_especificado',
    }
    if (compradorId) {
      updateData.comprador_id = compradorId
    }

    const { error } = await supabaseAdmin
      .from('productos')
      .update(updateData)
      .eq('id', productoId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productoId = searchParams.get('productoId')
    const userId = searchParams.get('userId')

    if (!productoId || !userId) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verificar que el usuario es el dueño
    const { data: producto } = await supabaseAdmin
      .from('productos')
      .select('user_id')
      .eq('id', productoId)
      .single()

    if (!producto || producto.user_id !== userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Buscar conversaciones de este producto
    const { data: conversaciones } = await supabaseAdmin
      .from('conversaciones')
      .select('id, user1_id, user2_id')
      .eq('producto_id', productoId)

    if (!conversaciones || conversaciones.length === 0) {
      return NextResponse.json({ ok: true, interesados: [] })
    }

    // Identificar los IDs de los compradores potenciales (el que NO es el vendedor)
    const compradorIds = new Set<string>()
    for (const conv of conversaciones) {
      const otro = conv.user1_id === userId ? conv.user2_id : conv.user1_id
      if (otro && otro !== userId) compradorIds.add(otro)
    }

    if (compradorIds.size === 0) {
      return NextResponse.json({ ok: true, interesados: [] })
    }

    // Obtener información de esos usuarios
    const { data: perfiles } = await supabaseAdmin
      .from('perfiles')
      .select('id, nombre')
      .in('id', Array.from(compradorIds))

    // Obtener último mensaje de cada uno
    const idsArray = Array.from(compradorIds)
    const { data: ultimosMensajes } = await supabaseAdmin
      .from('mensajes')
      .select('remitente_id, contenido')
      .in('remitente_id', idsArray)
      .order('creado_en', { ascending: false })

    const ultimoMsgMap = new Map<string, string>()
    if (ultimosMensajes) {
      for (const m of ultimosMensajes) {
        if (!ultimoMsgMap.has(m.remitente_id)) {
          ultimoMsgMap.set(m.remitente_id, m.contenido?.substring(0, 60) || '')
        }
      }
    }

    const interesados = (perfiles || []).map(p => ({
      userId: p.id,
      nombre: p.nombre || 'Usuario',
      ultimoMensaje: ultimoMsgMap.get(p.id) || '',
    }))

    return NextResponse.json({ ok: true, interesados })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
