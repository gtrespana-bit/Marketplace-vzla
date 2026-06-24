import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const locale = params.locale

  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  return <>{children}</>
}
