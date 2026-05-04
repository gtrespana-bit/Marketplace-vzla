'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Bell, X } from 'lucide-react'

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

/**
 * Hook para push notifications en la PWA.
 * Solo debe usarse dentro de AuthProvider.
 */
function usePushNotification() {
  const { user } = useAuth()
  const [enabled, setEnabled] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const swReady = 'serviceWorker' in navigator && 'PushManager' in window
    setSupported(swReady && 'Notification' in window)
    if (swReady) {
      setEnabled(Notification.permission === 'granted')
    }
  }, [])

  async function enable() {
    if (!supported || !user) return false
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return false

      const reg = await navigator.serviceWorker.ready
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      })

      const { data } = await supabase.auth.getSession()
      if (!data.session) return false

      const res = await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify({ subscription }),
      })

      if (!res.ok) return false
      setEnabled(true)
      return true
    } catch (e) {
      console.error('Push enable error:', e)
      return false
    }
  }

  return { enabled, supported, enable }
}

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const base64Str = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64Str)
  return new Uint8Array([...rawData].map(c => c.charCodeAt(0)))
}

export default function PushNotificationBanner() {
  const { user } = useAuth()
  const { supported, enabled, enable } = usePushNotification()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!user) return
    if (!supported) return
    if (enabled) return

    const dismissedAt = localStorage.getItem('push_banner_dismissed')
    if (dismissedAt) {
      const hoursSince = (Date.now() - parseInt(dismissedAt)) / 3600000
      if (hoursSince < 24) return
    }

    const timer = setTimeout(() => setVisible(true), 5000)
    return () => clearTimeout(timer)
  }, [user, supported, enabled])

  if (!visible || !user) return null

  function handleDismiss() {
    setVisible(false)
    localStorage.setItem('push_banner_dismissed', Date.now().toString())
  }

  async function handleEnable() {
    const ok = await enable()
    if (ok) handleDismiss()
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:w-96 z-40">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 relative">
        <button
          onClick={handleDismiss}
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
              onClick={handleEnable}
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
