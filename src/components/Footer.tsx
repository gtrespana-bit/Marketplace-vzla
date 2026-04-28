import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-brand-dark text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div>
            <span className="text-brand-yellow font-black text-xl">
              Tu<span className="text-white">Cambalo</span>
            </span>
            <p className="mt-3 text-sm leading-relaxed">
              El marketplace hecho para Venezuela. Compra y vende lo que quieras, contacta directo. Sin complicaciones.
            </p>
          </div>

          {/* Categorías */}
          <div>
            <h3 className="text-white font-bold mb-3">Categorías</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/catalogo?categoria=vehiculos" className="hover:text-brand-yellow transition">🚗 Vehículos</Link></li>
              <li><Link href="/catalogo?categoria=tecnologia" className="hover:text-brand-yellow transition">💻 Tecnología</Link></li>
              <li><Link href="/catalogo?categoria=moda" className="hover:text-brand-yellow transition">👗 Moda</Link></li>
              <li><Link href="/catalogo?categoria=hogar" className="hover:text-brand-yellow transition">🏠 Hogar</Link></li>
              <li><Link href="/catalogo?categoria=herramientas" className="hover:text-brand-yellow transition">🔧 Herramientas</Link></li>
            </ul>
          </div>

          {/* Información */}
          <div>
            <h3 className="text-white font-bold mb-3">Información</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/como-funciona" className="hover:text-brand-yellow transition">¿Cómo funciona?</Link></li>
              <li><Link href="/creditos" className="hover:text-brand-yellow transition">Sistema de créditos</Link></li>
              <li><Link href="/faq" className="hover:text-brand-yellow transition">Preguntas frecuentes</Link></li>
              <li><Link href="/contacto" className="hover:text-brand-yellow transition">Contacto</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terminos-y-condiciones" className="hover:text-brand-yellow transition">Términos y condiciones</Link></li>
              <li><Link href="/politica-de-privacidad" className="hover:text-brand-yellow transition">Política de privacidad</Link></li>
            </ul>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                Hecho con ❤️ en Venezuela 🇻🇪
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} TuCambalo. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
