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

// Synchronous message cache for initial render
const syncMessageCache: Record<string, Messages> = {}

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
  
  // Detect locale from pathname (works for both server and client)
  const detectedLocale = getLocaleFromPathname(pathname)
  
  // On client, also check <html lang> attribute (set by server)
  // This is the most reliable source of truth after full page reload
  const getInitialLocale = (): string => {
    if (typeof document !== 'undefined') {
      const htmlLang = document.documentElement.lang
      if (htmlLang && routing.locales.includes(htmlLang as any)) {
        return htmlLang
      }
    }
    return detectedLocale
  }
  
  const [locale, setLocale] = useState(getInitialLocale)
  const [messages, setMessages] = useState(serverMessages)

  useEffect(() => {
    // Sync with pathname changes during client-side navigation
    setLocale(detectedLocale)
    if (!syncMessageCache[detectedLocale]) {
      loadMessages(detectedLocale).then(msgs => {
        setMessages(msgs)
        syncMessageCache[detectedLocale] = msgs
      })
    } else {
      setMessages(syncMessageCache[detectedLocale])
    }
  }, [detectedLocale])

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
