import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AuthProvider } from '@/components/AuthProvider'
import { FloatingChat } from '@/components/FloatingChat'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Todo Anuncios — Compra y Venta en Venezuela',
  description: 'El marketplace venezolano. Compra y vende carros, tecnología, moda, hogar y más. Publica gratis, contacta directo. 🇻🇪',
  keywords: 'comprar vender venezuela, mercado venezuela, carros venezuela, tecnologia venezuela, compra venta',
  openGraph: {
    title: 'Todo Anuncios — Compra y Venta en Venezuela',
    description: 'Publica gratis. Contacta directo. El marketplace hecho para Venezuela.',
    type: 'website',
    locale: 'es_VE',
  },
  robots: 'index, follow',
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.json',
  themeColor: '#003DA5',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Todo Anuncios',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-brand-gray">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <FloatingChat />
        </AuthProvider>
      </body>
    </html>
  )
}
