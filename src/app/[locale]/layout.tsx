import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import PWAInstallBanner from '@/components/PWAInstallBanner'
import PushNotificationBanner from '@/components/PushNotificationBanner'
import BottomTabNav from '@/components/BottomTabNav'
import HtmlLangSetter from '@/components/HtmlLangSetter'

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

  // Header/Footer/banners se renderizan AQUÍ, dentro del
  // NextIntlClientProvider, para que usen `useTranslations` (contexto de
  // next-intl) en vez del hook `useLocalizedMessages`, que importaba estática
  // y SIEMPRE los dos diccionarios (es.json + en.json, ~90KB) en el bundle
  // JS de TODAS las páginas. Solo se sirve el diccionario del locale activo.
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <HtmlLangSetter lang={locale} />
      <Header />
      <main id="main-content" className="min-h-screen bg-white">{children}</main>
      <Footer />
      <PWAInstallBanner />
      <PushNotificationBanner />
      <BottomTabNav />
    </NextIntlClientProvider>
  )
}
