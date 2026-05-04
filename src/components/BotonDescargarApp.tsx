'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Smartphone } from 'lucide-react'

/**
 * Botón "Descarga Nuestra App" que solo se muestra si el usuario
 * NO está visitando desde la PWA ya instalada.
 */
export function BotonDescargarApp() {
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Si ya está en modo standalone (PWA instalada), no mostrar el botón
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowButton(false)
      return
    }
    // También checkear si se lanzó desde el home screen (iOS)
    if ((window.navigator as any).standalone === true) {
      setShowButton(false)
      return
    }
    setShowButton(true)
  }, [])

  if (!showButton) return null

  return (
    <Link
      href="/como-instalar-app"
      className="inline-flex items-center gap-2 bg-white/10 border-2 border-white/30 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-white/20 transition"
    >
      <Smartphone size={18} />
      <span>Descarga Nuestra App</span>
    </Link>
  )
}
