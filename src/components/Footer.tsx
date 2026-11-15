'use client'

import LocalLink from '@/components/LocalLink'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Facebook, Instagram, Youtube, Music2 } from 'lucide-react'
import { PERFILES_SOCIALES } from '@/lib/social'

// Icono por red. Se centraliza aquí para que añadir un perfil en `lib/social`
// no obligue a tocar el JSX del footer: si la red no tiene icono, el enlace
// se renderiza igual, solo con su nombre.
const ICONOS_SOCIALES: Record<string, typeof Facebook | undefined> = {
  Facebook,
  Instagram,
  YouTube: Youtube,
  TikTok: Music2,
}

// Categorías del footer → landing pages SEO con URL canónica propia.
const CATEGORIAS_FOOTER = [
  { key: 'header.categories.vehiculos', slug: 'vehiculos' },
  { key: 'header.categories.tecnologia', slug: 'tecnologia' },
  { key: 'header.categories.moda', slug: 'moda' },
  { key: 'header.categories.hogar', slug: 'hogar' },
  { key: 'header.categories.herramientas', slug: 'herramientas' },
]

// Ciudades principales → landing pages SEO locales (/[ciudad])
const CIUDADES_FOOTER = [
  { nombre: 'Caracas', slug: 'caracas' },
  { nombre: 'Maracaibo', slug: 'maracaibo' },
  { nombre: 'Valencia', slug: 'valencia' },
  { nombre: 'Barquisimeto', slug: 'barquisimeto' },
  { nombre: 'Maracay', slug: 'maracay' },
  { nombre: 'Ciudad Guayana', slug: 'ciudad-guayana' },
]

export function Footer() {
  const t = useTranslations()

  return (
    // En móvil el Footer era `hidden md:block` + `pb-20`: una banda oscura
    // VACÍA de 80px al final de cada página (el padding del bottom nav sin
    // contenido). Ahora hay footer real en móvil: marca + legales + copyright.
    <footer className="bg-brand-dark text-gray-300 mt-auto">
      <div className="hidden md:block pb-0">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div>
              <LocalLink href="/" className="inline-flex items-center gap-2 mb-3">
                <Image src="/logo-vendet.webp" alt="VendeT" width={28} height={28} className="h-7 w-7 object-contain rounded-lg drop-shadow-[0_0_4px_rgba(255,255,255,0.4)] bg-white/80 p-0.5" />
                <span className="font-black text-lg"><span className="text-yellow-400">Vende</span><span className="text-white">T</span></span>
              </LocalLink>
              <p className="text-sm leading-relaxed">{t('footer.description')}</p>
            </div>
            <nav aria-label={t('footer.categories')}>
              <h3 className="text-white font-bold mb-3">{t('footer.categories')}</h3>
              <ul className="space-y-2 text-sm">
                {CATEGORIAS_FOOTER.map(c => (
                  <li key={c.slug}>
                    <LocalLink href={`/categoria/${c.slug}`} className="hover:text-brand-accent transition">
                      {t(c.key)}
                    </LocalLink>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label={t('footer.cities')}>
              <h3 className="text-white font-bold mb-3">{t('footer.cities')}</h3>
              <ul className="space-y-2 text-sm">
                {CIUDADES_FOOTER.map(c => (
                  <li key={c.slug}>
                    <LocalLink href={`/${c.slug}`} className="hover:text-brand-accent transition">
                      {t('footer.classifiedsIn', { city: c.nombre })}
                    </LocalLink>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label={t('footer.information')}>
              <h3 className="text-white font-bold mb-3">{t('footer.information')}</h3>
              <ul className="space-y-2 text-sm">
                {[
                  ['Blog', '/blog'],
                  [t('footer.howItWorks'), '/como-funciona'],
                  [t('footer.aboutUs'), '/sobre-nosotros'],
                  [t('header.credits'), '/creditos'],
                  ['FAQ', '/faq'],
                  [t('nav.contact'), '/contacto'],
                ].map(([l, p]) => (
                  <li key={p}><LocalLink href={p} className="hover:text-brand-accent transition">{l}</LocalLink></li>
                ))}
              </ul>
            </nav>
            <div>
              <h3 className="text-white font-bold mb-3">{t('footer.legal')}</h3>
              <ul className="space-y-2 text-sm">
                <li><LocalLink href="/terminos-y-condiciones" className="hover:text-brand-accent transition">{t('footer.terms')}</LocalLink></li>
                <li><LocalLink href="/politica-de-privacidad" className="hover:text-brand-accent transition">{t('footer.privacy')}</LocalLink></li>
              </ul>

              {/*
                Perfiles sociales oficiales.

                Van aquí (y no solo en el JSON-LD) a propósito: un `sameAs`
                que no tiene un enlace visible es una afirmación que el sitio
                no respalda con su propio contenido. Este enlace es la prueba
                rastreable de que la cuenta es de VendeT, y refuerza la
                consolidación de entidad que Google usa para las búsquedas de
                marca. Datos en `@/lib/social` (única fuente de verdad).
              */}
              {PERFILES_SOCIALES.filter((p) => !p.pendiente).length > 0 && (
                <div className="mt-5">
                  <h3 className="text-white font-bold mb-2 text-sm">Síguenos</h3>
                  <ul className="flex flex-wrap gap-2">
                    {PERFILES_SOCIALES.filter((p) => !p.pendiente).map((perfil) => {
                      const Icono = ICONOS_SOCIALES[perfil.nombre]
                      return (
                        <li key={perfil.url}>
                          <a
                            href={perfil.url}
                            target="_blank"
                            rel="me noopener noreferrer"
                            aria-label={`VendeT en ${perfil.nombre}`}
                            title={`VendeT en ${perfil.nombre}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium text-gray-200 transition hover:bg-white/20 hover:text-white"
                          >
                            {Icono && <Icono size={14} aria-hidden="true" />}
                            {perfil.nombre}
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              <p className="text-xs text-gray-300 mt-4">{t('footer.madeWithLove')}</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
            <p>© {new Date().getFullYear()} VendeT-Venezuela. {t('footer.allRightsReserved')}</p>
          </div>
        </div>
      </div>

      {/* ============ FOOTER MÓVIL ============ */}
      <div className="md:hidden px-4 py-8 pb-24">
        <div className="flex flex-col items-center gap-4 text-center">
          <LocalLink href="/" className="inline-flex items-center gap-2">
            <Image
              src="/logo-vendet.webp"
              alt="VendeT"
              width={28}
              height={28}
              className="h-7 w-7 object-contain rounded-lg drop-shadow-[0_0_4px_rgba(255,255,255,0.4)] bg-white/80 p-0.5"
            />
            <span className="font-black text-lg">
              <span className="text-yellow-400">Vende</span>
              <span className="text-white">T</span>
            </span>
          </LocalLink>

          <p className="text-xs text-gray-300 max-w-xs">{t('footer.description')}</p>

          <nav aria-label={t('footer.legal')} className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
            <LocalLink href="/como-funciona" className="hover:text-brand-accent transition">{t('footer.howItWorks')}</LocalLink>
            <LocalLink href="/sobre-nosotros" className="hover:text-brand-accent transition">{t('footer.aboutUs')}</LocalLink>
            <LocalLink href="/faq" className="hover:text-brand-accent transition">FAQ</LocalLink>
            <LocalLink href="/terminos-y-condiciones" className="hover:text-brand-accent transition">{t('footer.terms')}</LocalLink>
            <LocalLink href="/politica-de-privacidad" className="hover:text-brand-accent transition">{t('footer.privacy')}</LocalLink>
          </nav>

          {/* Perfiles sociales también en móvil: en Venezuela la mayoría del
              tráfico es móvil, y un enlace que solo existe en el footer de
              escritorio no lo rastrea ni lo ve nadie. */}
          {PERFILES_SOCIALES.filter((p) => !p.pendiente).length > 0 && (
            <ul className="flex items-center justify-center gap-3">
              {PERFILES_SOCIALES.filter((p) => !p.pendiente).map((perfil) => {
                const Icono = ICONOS_SOCIALES[perfil.nombre]
                return (
                  <li key={perfil.url}>
                    <a
                      href={perfil.url}
                      target="_blank"
                      rel="me noopener noreferrer"
                      aria-label={`VendeT en ${perfil.nombre}`}
                      title={`VendeT en ${perfil.nombre}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-gray-200 transition hover:bg-white/20 hover:text-white"
                    >
                      {Icono && <Icono size={16} aria-hidden="true" />}
                      {perfil.nombre}
                    </a>
                  </li>
                )
              })}
            </ul>
          )}

          <p className="text-[11px] text-gray-400 mt-1">
            © {new Date().getFullYear()} VendeT-Venezuela. {t('footer.allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  )
}
