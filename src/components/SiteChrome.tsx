'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { isAdminPath } from '@/lib/admin-path'

/**
 * Envoltorio del "chrome" del sitio público (header, main y footer).
 *
 * El panel de administración se muestra como una app independiente: no monta
 * el Header ni el Footer (ni, por tanto, sus efectos de sesión/notificaciones),
 * de modo que gana todo el alto de pantalla y no parece parte de la web.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const admin = isAdminPath(pathname)

  if (admin) {
    return (
      <main id="main-content" className="min-h-screen bg-white">
        {children}
      </main>
    )
  }

  // `flex min-h-screen flex-col`: el Footer lleva `mt-auto`, que sólo funciona
  // dentro de un contenedor flex. Antes el <footer> no era hijo directo de
  // ningún flex y `mt-auto` no hacía nada → en páginas cortas (404, legales)
  // el footer quedaba pegado al contenido con el resto de la ventana en blanco.
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1 bg-white">
        {children}
      </main>
      <Footer />
    </div>
  )
}
