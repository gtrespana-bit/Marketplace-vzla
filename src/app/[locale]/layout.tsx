import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'

// NO generar metadata/hreflang aquí: este layout envuelve TODAS las rutas
// y un alternates genérico sobrescribe (merge de metadata de Next) el
// hreflang correcto que define cada page.tsx. Las páginas declaran sus
// propios alternates.languages con sus URLs reales.
//
// Load messages directly from URL locale - never use getMessages()
async function getDictionary(locale: string) {
  return (await import(`@/i18n/dictionaries/${locale}.json`)).default
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getDictionary(locale)

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
