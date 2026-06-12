'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import esMessages from '../../messages/es.json'
import enMessages from '../../messages/en.json'

type Locale = 'es' | 'en'
type Messages = Record<string, any>

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, fallback?: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const messages: Record<Locale, Messages> = {
  es: esMessages as Messages,
  en: enMessages as Messages,
}

function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((acc, part) => acc?.[part], obj)
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('es')

  useEffect(() => {
    const saved = localStorage.getItem('vendet-locale') as Locale | null
    if (saved && (saved === 'es' || saved === 'en')) {
      setLocale(saved)
    } else {
      const browserLang = navigator.language.slice(0, 2)
      setLocale(browserLang === 'en' ? 'en' : 'es')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('vendet-locale', locale)
    document.documentElement.lang = locale
  }, [locale])

  const t = (key: string, fallback?: string): string => {
    const value = getNestedValue(messages[locale], key)
    if (value !== undefined) return value
    // Fallback to Spanish if current locale missing key
    const esValue = getNestedValue(messages.es, key)
    if (esValue !== undefined) return esValue
    // Use provided fallback or key itself
    return fallback || key
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
