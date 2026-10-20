/**
 * Tests de la capa de analítica: consentimiento y envío de eventos.
 * Se ejecutan en jsdom (jest.unit.config.js).
 */

import {
  GA_MEASUREMENT_ID,
  CONSENT_STORAGE_KEY,
  getStoredConsent,
  setStoredConsent,
  trackEvent,
  trackPageView,
} from '@/lib/analytics'

describe('analytics', () => {
  beforeEach(() => {
    window.localStorage.clear()
    delete window.gtag
    delete window.dataLayer
  })

  it('usa el ID real de VendeT por defecto', () => {
    expect(GA_MEASUREMENT_ID).toBe('G-RMMQFHP6EC')
  })

  it('devuelve null si el usuario aún no ha elegido', () => {
    expect(getStoredConsent()).toBeNull()
  })

  it('lee una decisión guardada válida e ignora valores desconocidos', () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted')
    expect(getStoredConsent()).toBe('accepted')

    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'otra-cosa')
    expect(getStoredConsent()).toBeNull()
  })

  it('guarda la decisión y actualiza Consent Mode v2', () => {
    const gtag = jest.fn()
    window.gtag = gtag

    setStoredConsent('rejected')

    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('rejected')
    expect(gtag).toHaveBeenCalledWith(
      'consent',
      'update',
      expect.objectContaining({
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      })
    )
  })

  it('concede analytics_storage al aceptar', () => {
    const gtag = jest.fn()
    window.gtag = gtag

    setStoredConsent('accepted')

    expect(gtag).toHaveBeenCalledWith(
      'consent',
      'update',
      expect.objectContaining({ analytics_storage: 'granted' })
    )
  })

  it('no lanza si gtag todavía no está disponible', () => {
    expect(() => trackEvent('test_event', { a: 1 })).not.toThrow()
    expect(() => trackPageView()).not.toThrow()
  })

  it('envía eventos y pageviews a gtag cuando está cargado', () => {
    const gtag = jest.fn()
    window.gtag = gtag

    trackEvent('publicar_anuncio', { categoria: 'tecnologia' })
    trackPageView()

    expect(gtag).toHaveBeenCalledWith('event', 'publicar_anuncio', {
      categoria: 'tecnologia',
    })
    expect(gtag).toHaveBeenCalledWith(
      'event',
      'page_view',
      expect.objectContaining({
        page_path: window.location.pathname + window.location.search,
      })
    )
  })
})
