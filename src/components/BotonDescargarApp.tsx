'use client'

import { useState, useEffect } from 'react'
import LocalLink from '@/components/LocalLink'
import { Smartphone } from 'lucide-react'
import { useTranslations } from 'next-intl'

type BotonDescargarAppProps = {
  variant?: 'default' | 'light'
}

/**
 * Boton "Descarga Nuestra App" que solo se muestra si el usuario
 * NO esta visitando desde la PWA ya instalada.
 */
export function BotonDescargarApp({ variant = 'default' }: BotonDescargarAppProps = {}) {
  const t = useTranslations('common')
  // `null` = aún no sabemos (SSR/primer render). Antes ese null hacía que en
  // el primer paint el botón no existiera y, al aparecer tras hidratar,
  // empujara la fila de CTAs y los stats del hero (CLS en el primer viewport).
  const [showButton, setShowButton] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowButton(false)
      return
    }
    if ((window.navigator as any).standalone === true) {
      setShowButton(false)
      return
    }
    setShowButton(true)
  }, [])

  if (showButton === null) {
    // Reserva el espacio sin ser visible ni interactuable.
    return <span aria-hidden="true" className="invisible pointer-events-none inline-flex items-center gap-2 border-2 border-transparent px-6 py-3 text-base font-bold" />
  }
  if (!showButton) return null

  const className = variant === 'light'
    ? 'inline-flex items-center gap-2 bg-white/20 border-2 border-white/50 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-white/30 transition'
    : 'inline-flex items-center gap-2 bg-white/10 border-2 border-white/30 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-white/20 transition'

  return (
    <LocalLink
      href="/como-instalar-app"
      className={className}
    >
      <Smartphone size={18} />
      <span>{t('downloadApp')}</span>
    </LocalLink>
  )
}
