/**
 * API Route: Eliminar producto definitivamente (owner y admin)
 * 
 * POST /api/admin/eliminar-producto
 * Body: { productId: string, userId?: string }
 * 
 * - Si userId coincide con el owner → borrado por propietario
 * - Si viene de un admin (verificado) → borrado por admin
 * - Borra también las imágenes de R2
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// R2 client for deleting images
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const R2_BUCKET = process.env.R2_BUCKET || 'vendet-fotos'
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || ''

const ADMIN_EMAILS = ['gtrespana@gmail.com']

async function isAdmin(userId: string): Promise<boolean> {
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('email')
    .eq('id', userId)
    .single()
  return ADMIN_EMAILS.includes(perfil?.email || '')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, userId } = body

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 })
    }

    // Get the product
    const { data: producto, error: prodError } = await supabase
      .from('productos')
      .select('*')
      .eq('id', productId)
      .single()

    if (prodError || !producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Only owner or admin can delete
    if (userId && producto.user_id !== userId && !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'No tienes permisos' }, { status: 403 })
    }

    // Also delete images from R2
    const imagenesUrl = producto.imagenes as string[] || []
    const imagenUrl = producto.imagen_url
    const allUrls = [imagenUrl, ...imagenesUrl].filter(Boolean) as string[]

    const deletePromises = allUrls.map(async (url) => {
      if (!url.includes(R2_PUBLIC_URL)) return
      // Extract key from public URL
      const key = url.replace(R2_PUBLIC_URL + '/', '')
      if (!key) return
      try {
        await r2Client.send(new DeleteObjectCommand({
          Bucket: R2_BUCKET,
          Key: key,
        }))
      } catch (e) {
        console.error('Error deleting R2 image:', key, e)
      }
    })

    await Promise.all(deletePromises)

    // Delete from database
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', productId)

    if (error) {
      console.error('Database delete error:', error)
      return NextResponse.json({ error: 'Error al eliminar: ' + error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
