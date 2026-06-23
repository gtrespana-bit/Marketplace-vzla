import { cookies, headers } from 'next/headers'
import { IntlBridgeSetter } from './IntlBridge'
import { routing } from '@/i18n/routing'

async function getMessages(locale: string) {
  const messages = (await import(`@/i18n/dictionaries/${locale}.json`)).default
  return messages
}

export default async function IntlBridgeInit({
  children,
}: {
  children: React.ReactNode
}) {
  // Priority: middleware header > cookie > default
  const headersList = headers()
  const detectedLocale = headersList.get('x-detected-locale')
  
  let locale: string
  if (detectedLocale && routing.locales.includes(detectedLocale as any)) {
    locale = detectedLocale
  } else {
    const cookieStore = cookies()
    const localeCookie = cookieStore.get('NEXT_LOCALE')
    locale = localeCookie?.value && routing.locales.includes(localeCookie.value as any)
      ? localeCookie.value
      : routing.defaultLocale
  }
  
  const messages = await getMessages(locale)

  return (
    <IntlBridgeSetter locale={locale} messages={messages}>
      {children}
    </IntlBridgeSetter>
  )
}
