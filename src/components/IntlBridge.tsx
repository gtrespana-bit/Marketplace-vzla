'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { routing } from '@/i18n/routing'

type Messages = Record<string, any>

interface IntlBridgeValue {
  locale: string
  messages: Messages
  t: (key: string) => string
}

const IntlBridgeContext = createContext<IntlBridgeValue | null>(null)

function getLocaleFromPathname(pathname: string): string {
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return locale
    }
  }
  return routing.defaultLocale
}

function createTranslator(messages: Messages) {
  return (key: string): string => {
    const parts = key.split('.')
    let result: any = messages
    for (const part of parts) {
      if (result == null) return key
      result = result[part]
    }
    return typeof result === 'string' ? result : key
  }
}

// Message cache to avoid re-importing
const messageCache: Record<string, Messages> = {}

async function loadMessages(locale: string): Promise<Messages> {
  if (messageCache[locale]) return messageCache[locale]
  const messages = (await import(`@/i18n/dictionaries/${locale}.json`)).default
  messageCache[locale] = messages
  return messages
}

export function IntlBridgeSetter({
  locale: serverLocale,
  messages: serverMessages,
  children,
}: {
  locale: string
  messages: Messages
  children: ReactNode
}) {
  const pathname = usePathname()
  const clientLocale = getLocaleFromPathname(pathname)

  // Always use serverLocale for initial render to prevent hydration mismatch
  // Client-side locale changes are handled via useEffect after hydration
  const [locale, setLocale] = useState(serverLocale)
  const [messages, setMessages] = useState(serverMessages)

  // Update context when client-side navigation changes locale
  useEffect(() => {
    if (clientLocale !== locale) {
      setLocale(clientLocale)
      loadMessages(clientLocale).then(setMessages)
    }
  }, [clientLocale, locale])

  const t = createTranslator(messages)

  return (
    <IntlBridgeContext.Provider value={{ locale, messages, t }}>
      {children}
    </IntlBridgeContext.Provider>
  )
}

export function useBridge() {
  const ctx = useContext(IntlBridgeContext)
  if (!ctx) {
    return { locale: 'es', messages: {} as Messages, t: (key: string) => key }
  }
  return ctx
}
