'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-brand-dark text-gray-400 mt-auto">
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <Image src="/logo-vendet.webp" alt="VendeT" width={28} height={28} className="h-7 w-7 object-contain rounded-lg drop-shadow-[0_0_4px_rgba(255,255,255,0.4)] bg-white/80 p-0.5" />
              <span className="text-brand-accent font-black text-lg">Vende<span className="text-white">T</span></span>
            </Link>
            <p className="text-sm leading-relaxed">{t('footer.description', 'El marketplace hecho para Venezuela. Compra y vende lo que quieras, contacta directo. Sin complicaciones.')}</p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-3">{t('footer.categories', 'Categorías')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/catalogo?categoria=vehiculos" className="hover:text-brand-accent transition-colors">{t('cat.vehiculos', 'Vehículos')}</Link></li>
              <li><Link href="/catalogo?categoria=tecnologia" className="hover:text-brand-accent transition-colors">{t('cat.tecnologia', 'Tecnología')}</Link></li>
              <li><Link href="/catalogo?categoria=moda" className="hover:text-brand-accent transition-colors">{t('cat.moda', 'Moda')}</Link></li>
              <li><Link href="/catalogo?categoria=hogar" className="hover:text-brand-accent transition-colors">{t('cat.hogar', 'Hogar')}</Link></li>
              <li><Link href="/catalogo?categoria=herramientas" className="hover:text-brand-accent transition-colors">{t('cat.herramientas', 'Herramientas')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-3">{t('footer.links', 'Enlaces')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/sobre-nosotros" className="hover:text-brand-accent transition-colors">{t('footer.about', 'Sobre Nosotros')}</Link></li>
              <li><Link href="/contacto" className="hover:text-brand-accent transition-colors">{t('footer.contact', 'Contacto')}</Link></li>
              <li><Link href="/faq" className="hover:text-brand-accent transition-colors">{t('footer.faq', 'Preguntas Frecuentes')}</Link></li>
              <li><Link href="/blog" className="hover:text-brand-accent transition-colors">{t('footer.blog', 'Blog')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-3">{t('footer.support', 'Soporte')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terminos-y-condiciones" className="hover:text-brand-accent transition-colors">{t('footer.terms', 'Términos y Condiciones')}</Link></li>
              <li><Link href="/politica-de-privacidad" className="hover:text-brand-accent transition-colors">{t('footer.privacy', 'Política de Privacidad')}</Link></li>
              <li><Link href="/como-instalar-app" className="hover:text-brand-accent transition-colors">{t('footer.installApp', 'Instalar App')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          <p>© {new Date().getFullYear()} VendeT-Venezuela. {t('footer.rights', 'Todos los derechos reservados.')}</p>
        </div>
      </div>
      </div>

      {/* Mobile Footer */}
      <div className="md:hidden">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image src="/logo-vendet.webp" alt="VendeT" width={24} height={24} className="h-6 w-6 object-contain rounded-lg drop-shadow-[0_0_4px_rgba(255,255,255,0.4)] bg-white/80 p-0.5" />
              <span className="text-brand-accent font-black text-base">Vende<span className="text-white">T</span></span>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-white font-bold mb-2 text-sm">{t('footer.categories', 'Categorías')}</h3>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/catalogo?categoria=vehiculos" className="hover:text-brand-accent">Vehículos</Link></li>
                <li><Link href="/catalogo?categoria=tecnologia" className="hover:text-brand-accent">Tecnología</Link></li>
                <li><Link href="/catalogo?categoria=moda" className="hover:text-brand-accent">Moda</Link></li>
                <li><Link href="/catalogo?categoria=hogar" className="hover:text-brand-accent">Hogar</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-2 text-sm">{t('footer.links', 'Enlaces')}</h3>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/sobre-nosotros" className="hover:text-brand-accent">{t('footer.about', 'Sobre Nosotros')}</Link></li>
                <li><Link href="/contacto" className="hover:text-brand-accent">{t('footer.contact', 'Contacto')}</Link></li>
                <li><Link href="/faq" className="hover:text-brand-accent">{t('footer.faq', 'FAQ')}</Link></li>
                <li><Link href="/terminos-y-condiciones" className="hover:text-brand-accent">{t('footer.terms', 'Términos')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-4 text-center text-xs">
            <p>© {new Date().getFullYear()} VendeT-Venezuela. {t('footer.rights', 'Todos los derechos reservados.')}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
