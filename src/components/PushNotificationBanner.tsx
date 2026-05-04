'use client'

import { useState, useEffect } from 'react'
import { usePushNotification } from '@/hooks/usePushNotification'
import { Bell, X } from 'lucide-react'

export default function PushNotificationBanner() {
  const { enabled, supported, enable } = usePushNotification()
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!supported) return
    if (enabled) return

    // Don't show too soon after page load
    const timer = setTimeout(() => {
      const dismissedAt = localStorage.getItem('push_banner_dismissed')
      if (dismissedAt) {
        const hoursSince = (Date.now() - parseInt(dismissedAt)) / 3600000
        if (hoursSince < 24) return // Don't show again for 24h
      }
      setVisible(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [supported, enabled])

  if (!visible) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:w-96 z-40 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 relative">
        <button
          onClick={() => {
            setVisible(false)
            setDismissed(true)
            localStorage.setItem('push_banner_dismissed', Date.now().toString())
          }}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 text-gray-400 transition"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Bell size={20} className="text-brand-primary" />
          </div>

          <div className="flex-1">
            <p className="font-bold text-gray-900 text-sm">No te pierdas nada</p>
            <p className="text-xs text-gray-500 mt-0.5 mb-3">
              Recibe notificaciones cuando te escriban, guardes un producto o aparezca algo que buscas.
            </p>

            <button
              onClick={async () => {
                const ok = await enable()
                if (ok) {
                  setVisible(false)
                }
              }}
              className="w-full bg-brand-primary text-white py-2.5 rounded-xl font-bold text-sm hover:bg-brand-dark transition flex items-center justify-center gap-2"
            >
              <Bell size={14} />
              Activar notificaciones
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-2">
              Puedes desactivarlas cuando quieras
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
