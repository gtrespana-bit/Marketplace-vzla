import type { Metadata } from 'next'

/**
 * `/publicar` es una página `'use client'` (formulario multi-paso con estado
 * local). Un Client Component no puede exportar `metadata`, así que la
 * metadata vive aquí, en su segmento de layout.
 *
 * Antes heredaba SOLO la metadata del layout raíz: título de portada,
 * canonical de portada y descripción de portada. Es decir, la página que más
 * interesa posicionar ("publicar anuncios gratis Venezuela") se presentaba a
 * Google como un duplicado de la home.
 */
export const metadata: Metadata = {
  title: 'Publicar anuncio gratis — Vende en Venezuela',
  description:
    'Publica tu anuncio gratis en VendeT y vende en toda Venezuela. Fotos, precio y contacto directo por chat o WhatsApp. Sin comisiones y sin intermediarios.',
  alternates: {
    canonical: 'https://vendet.online/publicar',
    languages: {
      'es-VE': 'https://vendet.online/publicar',
      'x-default': 'https://vendet.online/publicar',
    },
  },
  openGraph: {
    title: 'Publicar anuncio gratis — Vende en Venezuela',
    description:
      'Publica gratis en VendeT y vende en toda Venezuela. Sin comisiones y sin intermediarios.',
    url: 'https://vendet.online/publicar',
    siteName: 'VendeT',
    locale: 'es_VE',
    type: 'website',
  },
}

export default function PublicarLayout({ children }: { children: React.ReactNode }) {
  return children
}
