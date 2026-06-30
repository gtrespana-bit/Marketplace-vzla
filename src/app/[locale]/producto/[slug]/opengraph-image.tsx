import { ImageResponse } from 'next/og'
import { supabase } from '@/lib/supabase'

export const runtime = 'edge'
export const alt = 'VendeT - Producto'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string; locale: string } }) {
  try {
    const { data: product } = await supabase
      .from('productos')
      .select('titulo, precio_usd, estado, ubicacion_ciudad, imagen_url')
      .eq('id', params.slug)
      .single()

    if (!product) {
      return new ImageResponse(
        (
          <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#7B2D3B', color: 'white', fontSize: '48px' }}>
            VendeT Marketplace
          </div>
        ),
        { width: 1200, height: 630 }
      )
    }

    return new ImageResponse(
      (
        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#7B2D3B', backgroundImage: 'radial-gradient(circle at 25% 25%, #C9A84C 0%, transparent 40%), radial-gradient(circle at 75% 75%, #5C1E2B 0%, transparent 40%)', padding: '40px', color: 'white', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ display: 'flex', width: '100%', height: '60%', marginBottom: '20px', borderRadius: '16px', overflow: 'hidden', border: '4px solid white', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            {product.imagen_url ? (
              <img src={product.imagen_url} alt={product.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', backgroundColor: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>📦</div>
            )}
          </div>
          <div style={{ textAlign: 'center', width: '100%' }}>
            <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px', lineHeight: 1.2, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              {product.titulo.length > 30 ? product.titulo.substring(0, 30) + '...' : product.titulo}
            </h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px', fontSize: '24px', fontWeight: 'bold' }}>
              <span style={{ color: '#C9A84C' }}>${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(product.precio_usd || 0))}</span>
              <span>{product.estado}</span>
              <span>{product.ubicacion_ciudad || 'Venezuela'}</span>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: '20px', fontSize: '24px', fontWeight: 'bold', color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            VendeT.online
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  } catch {
    return new ImageResponse(
      (
        <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#7B2D3B', color: 'white', fontSize: '48px' }}>
          VendeT Marketplace
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }
}