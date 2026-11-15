import type { Metadata } from 'next'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contacto',
  description: '¿Tienes dudas o sugerencias sobre VendeT, el marketplace de Venezuela? Escríbenos y te respondemos.',
  alternates: {
    canonical: 'https://vendet.online/contacto',
    languages: {
      'es-VE': 'https://vendet.online/contacto',
      'x-default': 'https://vendet.online/contacto',
    },
  },
  openGraph: {
    title: 'Contacto',
    description: '¿Tienes dudas o sugerencias sobre VendeT, el marketplace de Venezuela? Escríbenos.',
    url: 'https://vendet.online/contacto',
    siteName: 'VendeT',
    locale: 'es_VE',
    type: 'website',
  },
}

export default function ContactPage() {
  return <ContactForm />
}
