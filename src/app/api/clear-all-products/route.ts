import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// DELETE TODOS LOS PRODUCTOS — eliminar después de usar
export async function POST() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // 1) Contar primero
  const { count, error: countError } = await sb
    .from('productos')
    .select('id', { count: 'exact', head: true })

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 })
  }

  if (!count || count === 0) {
    return NextResponse.json({ message: 'No hay productos para eliminar' })
  }

  // 2) Eliminar todos
  const { error } = await sb
    .from('productos')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // neq siempre true (workaround para delete all)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 3) Borrar también las tablas asociadas (mensajes de productos, etc.)
  await sb.from('busquedas').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await sb.from('favoritos').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  return NextResponse.json({ message: `Eliminados ${count} productos`, deleted: count })
}
