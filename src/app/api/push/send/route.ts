import { createClient } from '@supabase/supabase-js'
import { sendPush, isPushConfigured } from '@/lib/push'
import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

export async function POST(req: NextRequest) {
  if (!isPushConfigured()) {
    return NextResponse.json({ success: false, reason: 'push not configured' })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { targetUserId, title, body, tag, click_url } = await req.json()

  if (!targetUserId) {
    return NextResponse.json({ error: 'targetUserId required' }, { status: 400 })
  }

  // Get all push subscriptions for this user
  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth_key')
    .eq('user_id', targetUserId)

  if (error || !subs?.length) {
    return NextResponse.json({ success: false, reason: 'no subscriptions' })
  }

  const payload = {
    title,
    body,
    tag: tag || 'default',
    icon: '/icon-192.png',
    click_url: click_url || '/',
  }

  // Clean up dead subscriptions as we go
  const deadEndpoints: string[] = []

  await Promise.all(
    subs.map(async (sub: any) => {
      try {
        await sendPush(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
          payload,
        )
      } catch (e: any) {
        if (e.statusCode === 410) {
          deadEndpoints.push(sub.endpoint)
        }
      }
    }),
  )

  // Clean dead subscriptions
  if (deadEndpoints.length) {
    await supabase.from('push_subscriptions').delete().in('endpoint', deadEndpoints)
  }

  return NextResponse.json({ success: true, sent: subs.length - deadEndpoints.length })
}
