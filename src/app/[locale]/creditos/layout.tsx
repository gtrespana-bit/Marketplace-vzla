import type { Metadata } from 'next'

/**
 * `/creditos` es un Client Component (compra de créditos con estado local), así
 * que la metadata va en el layout de su segmento. Sin esto heredaba título y
 * canonical de la portada.
 */
export const metadata: Metadata = {
  title: 'Créditos para destacar tus anuncios',
  description:
    'Destaca tus anuncios en VendeT y multiplaza tus ventas en Venezuela. Compra créditos para aparecer primero en el catálogo y en la portada. Publicar sigue siendo gratis.',
  alternates: {
    canonical: 'https://vendet.online/creditos',
    languages: {
      'es-VE': 'https://vendet.online/creditos',
      'x-default': 'https://vendet.online/creditos',
    },
  },
  openGraph: {
    title: 'Créditos para destacar tus anuncios',
    description:
      'Destaca tus anuncios en VendeT y multiplica tus ventas en Venezuela. Publicar sigue siendo gratis.',
    url: 'https://vendet.online/creditos',
    siteName: 'VendeT',
    locale: 'es_VE',
    type: 'website',
  },
}

export default function CreditosLayout({ children }: { children: React.ReactNode }) {
  return children
}
