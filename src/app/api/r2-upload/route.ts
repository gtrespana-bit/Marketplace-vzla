/**
 * API Route: Genera presigned URL para subir fotos a Cloudflare R2
 * 
 * POST /api/r2-upload
 * Body: { key: string, contentType: string }
 * Returns: { url: string, publicUrl: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUploadPresignedUrl, getR2PublicUrl } from '@/lib/r2-client'
import { requireUser } from '@/lib/require-auth'

const CONTENT_TYPES_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(req: NextRequest) {
  try {
    // Solo usuarios con sesión (evita llenar el bucket R2 y sobrescribir fotos ajenas)
    const auth = await requireUser(req)
    if ('response' in auth) return auth.response
    const userId = auth.user.id

    const body = await req.json()
    const { key, contentType } = body

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: 'Missing key' }, { status: 400 })
    }

    // La key debe pertenecer a la carpeta del usuario (formato: {userId}/...)
    if (!key.startsWith(`${userId}/`)) {
      return NextResponse.json({ error: 'Key no permitida' }, { status: 403 })
    }

    // Solo tipos de imagen permitidos
    const tipo = (contentType || 'image/jpeg') as string
    if (!CONTENT_TYPES_PERMITIDOS.includes(tipo)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 })
    }

    const uploadUrl = await getUploadPresignedUrl(key, tipo)
    const publicUrl = getR2PublicUrl(key)

    return NextResponse.json({ url: uploadUrl, publicUrl })
  } catch (error) {
    console.error('R2 presigned URL error:', error)
    return NextResponse.json(
      { error: 'Error generando URL de subida' },
      { status: 500 }
    )
  }
}
