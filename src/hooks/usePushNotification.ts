'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function getVapidPublicKey(): string | null {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null
}

export function usePushNotification() {
  const [enabled, setEnabled] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setSupported('serviceWorker' in navigator && 'PushManager' in window)
    setEnabled(Notification.permission === 'granted')
  }, [])

  /** Call this from a user gesture (button click) */
  async function enable() {
    if (!supported) return false

    try {
      // 1. Request permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return false

      // 2. Get service worker registration
      const reg = await navigator.serviceWorker.ready

      // 3. Subscribe to push
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: getVapidPublicKey(),
      })

      // 4. Send to backend
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return false

      const res = await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
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

  async function disable() {
    if (!supported) return
    try {
      const reg = await navigator.serviceWorker.ready
      const subscription = await reg.pushManager.getSubscription()
      if (subscription) await subscription.unsubscribe()
      setEnabled(false)
    } catch (e) {
      console.error('Push disable error:', e)
    }
  }

  return { enabled, supported, enable, disable }
}
