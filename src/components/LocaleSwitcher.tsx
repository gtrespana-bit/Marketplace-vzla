'use client'

import { useLanguage } from '@/context/LanguageContext'
import { Globe } from 'lucide-react'

export function LocaleSwitcher() {
  const { locale, setLocale } = useLanguage()

  const toggleLocale = () => {
    setLocale(locale === 'es' ? 'en' : 'es')
  }

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Cambiar idioma"
    >
      <Globe className="w-4 h-4" />
      <span className="uppercase">{locale}</span>
    </button>
  )
}