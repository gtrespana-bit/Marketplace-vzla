'use client'

import { useState, useEffect, useRef } from 'react'
import { Download, X, Share, Smartphone } from 'lucide-react'

export default function PWAInstallBanner() {
  const [mounted, setMounted] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [showIOS, setShowIOS] = useState(false)
  const deferredPrompt = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Ya instalada
    if (window.matchMedia('(display-mode: standalone)').matches) return

    // iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    if (isIOS) {
      const dismissed = localStorage.getItem('pwa_ios_dismissed')
      if (!dismissed) {
        // Mostrar después de 3 segundos
        const timer = setTimeout(() => setShowIOS(true), 3000)
        return () => clearTimeout(timer)
      }
      return
    }

    // Android/Desktop: capturar evento beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e
      // Mostrar banner automáticamente cuando el browser lo permite
      const dismissed = localStorage.getItem('pwa_install_dismissed')
      if (!dismissed) {
        setShowBanner(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)
    setMounted(true)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Re-show banner every 6 hours if dismissed
  useEffect(() => {
    const handleDismissed = () => {
      const d = localStorage.getItem('pwa_install_dismissed')
      if (d && deferredPrompt.current) {
        const elapsed = Date.now() - parseInt(d)
        if (elapsed > 6 * 60 * 60 * 1000) {
          localStorage.removeItem('pwa_install_dismissed')
          setShowBanner(true)
        }
      }
    }
    // Check every minute
    const interval = setInterval(handleDismissed, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt.current) return
    deferredPrompt.current.prompt()
    const { outcome } = await deferredPrompt.current.userChoice
    if (outcome === 'accepted') {
      setShowBanner(false)
      deferredPrompt.current = null
    }
    localStorage.setItem('pwa_install_dismissed', '1')
  }

  const handleDismiss = () => {
    setShowBanner(false)
    setShowIOS(false)
    // Reaparece en 6 horas
    localStorage.setItem('pwa_install_dismissed', Date.now().toString())
    localStorage.setItem('pwa_ios_dismissed', Date.now().toString())
    setTimeout(() => {
      localStorage.removeItem('pwa_install_dismissed')
      localStorage.removeItem('pwa_ios_dismissed')
    }, 6 * 60 * 60 * 1000)
  }

  return (
    <>
      {/* Banner para Android / Desktop (cuando el browser lo soporta) */}
      {mounted && showBanner && (
        <div className="fixed bottom-4 inset-x-4 z-[60] md:inset-x-auto md:left-4 md:bottom-4 md:max-w-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
            <button onClick={handleDismiss} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-brand-blue rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-brand-yellow font-black text-lg">TA</span>
              </div>
              <div className="flex-1 pr-6">
                <p className="font-bold text-gray-900 text-sm">Instala VendeT-Venezuela</p>
                <p className="text-xs text-gray-500 mt-0.5">Acceso directo desde tu pantalla de inicio. Más rápido, sin abrir el navegador.</p>
              </div>
            </div>
            <button
              onClick={handleInstall}
              className="w-full mt-3 bg-brand-blue text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-900 transition"
            >
              <Download size={16} /> Instalar ahora
            </button>
          </div>
        </div>
      )}

      {/* Banner para iOS (instrucciones manuales) */}
      {showIOS && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 animate-slideUp">
            <button onClick={handleDismiss} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-brand-blue rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-brand-yellow font-black text-xl">TA</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900">Instala VendeT-Venezuela en tu iPhone</h3>
            </div>
            <div className="space-y-3 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 text-sm">
                <Smartphone size={18} className="text-brand-blue flex-shrink-0" />
                <p>Toca el botón <strong>Compartir</strong> <Share size={14} className="inline" /> en la barra de Safari</p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-brand-blue flex-shrink-0">
                  <path d="M12 5v14M19 12l-7 7-7-7"/>
                </svg>
                <p>Desliza hacia abajo y toca <strong>"Añadir a pantalla de inicio"</strong></p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="w-full mt-4 bg-brand-blue text-white py-2.5 rounded-xl font-bold text-sm hover:bg-blue-900 transition"
            >
              Entendido ✓
            </button>
          </div>
        </div>
      )}
    </>
  )
}
