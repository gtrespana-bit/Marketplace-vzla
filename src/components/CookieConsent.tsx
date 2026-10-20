'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import LocalLink from '@/components/LocalLink'
import { getStoredConsent, setStoredConsent, type ConsentChoice } from '@/lib/analytics'

/**
 * Banner de consentimiento de cookies.
 *
 * Estaba en el repositorio pero no se montaba en ningún sitio, así que el
 * usuario no tenía forma de aceptar ni rechazar la analítica. Ahora se monta
 * desde <LocaleClientEffects> y su decisión se comunica a GA4 con
 * `setStoredConsent` (Consent Mode v2).
 */
export default function CookieConsent() {
  const t = useTranslations('cookies')
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    if (getStoredConsent()) return
    // Pequeño retraso: el banner es `fixed`, no genera CLS y así no compite
    // con la hidratación ni con la primera interacción.
    const timer = setTimeout(() => setShowBanner(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  const choose = (choice: ConsentChoice) => {
    setStoredConsent(choice)
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div
      role="dialog"
      aria-label={t('title')}
      className="fixed bottom-16 md:bottom-0 left-0 right-0 z-[60] bg-gray-900 text-white p-4 shadow-lg"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-sm">
          <p className="mb-2 font-semibold">{t('title')}</p>
          <p className="text-gray-300">
            {t('message')}{' '}
            <span className="text-gray-400">{t('moreInfo')}</span>{' '}
            <LocalLink href="/politica-de-privacidad" className="text-brand-accent hover:underline">
              {t('privacy')}
            </LocalLink>
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => choose('rejected')}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:border-gray-400 transition"
          >
            {t('reject')}
          </button>
          <button
            onClick={() => choose('accepted')}
            className="px-4 py-2 text-sm font-bold text-gray-900 bg-brand-accent rounded-lg hover:bg-accent/90 transition"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  )
}
