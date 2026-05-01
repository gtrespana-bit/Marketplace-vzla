import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Footer — Todo Anuncios',
}

export function Footer() {
  return (
    <footer className="bg-brand-dark text-gray-400 mt-auto">
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-brand-yellow rounded-lg flex items-center justify-center font-black text-brand-blue text-sm">TA</div>
              <span className="text-brand-yellow font-black text-lg">Todo<span className="text-white">Anuncios</span></span>
            </Link>
            <p className="text-sm leading-relaxed">El marketplace hecho para Venezuela. Compra y vende lo que quieras, contacta directo. Sin complicaciones.</p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-3">Categorías</h3>
            <ul className="space-y-2 text-sm">
              {['Vehículos', 'Tecnología', 'Moda', 'Hogar', 'Herramientas'].map(c => (
                <li key={c}><Link href="/catalogo" className="hover:text-brand-yellow transition">{c}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-3">Información</h3>
            <ul className="space-y-2 text-sm">
              {[['Cómo funciona', '/como-funciona'], ['Créditos', '/creditos'], ['FAQ', '/faq'], ['Contacto', '/contacto']].map(([l, p]) => (
                <li key={p}><Link href={p} className="hover:text-brand-yellow transition">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terminos-y-condiciones" className="hover:text-brand-yellow transition">Términos</Link></li>
              <li><Link href="/politica-de-privacidad" className="hover:text-brand-yellow transition">Privacidad</Link></li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">Hecho con ❤️ en Venezuela 🇻🇪</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          <p>© {new Date().getFullYear()} Todo Anuncios. Todos los derechos reservados.</p>
        </div>
      </div>
      </div>
    </footer>
  )
}
