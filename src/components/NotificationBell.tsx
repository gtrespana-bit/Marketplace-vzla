'use client'

import { Bell } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function NotificationBell() {
  const [unread, setUnread] = useState(0)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) {
      setUnread(0)
      return
    }
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('mensajes')
        .select('*', { count: 'exact', head: true })
        .eq('receptor_id', user.id)
        .eq('leido', false)
      setUnread(count ?? 0)
    }
    fetchUnread()
    const channel = supabase
      .channel('bell-unread')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mensajes', filter: `receptor_id=eq.${user.id}` }, () => fetchUnread())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user])

  if (!user) return null

  return (
    <Link href="/dashboard?tab=mensajes" className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
      <Bell size={20} className="text-brand-dark" />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </Link>
  )
}
