import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, X as XIcon } from 'lucide-react'

export const metadata: Metadata = {
  title: '¿Cómo funciona? — VendeT-Venezuela',
  description: 'Guía rápida de cómo comprar, vender y destacar productos en VendeT-Venezuela',
}

export default function ComoFuncionaPage() {
  const pasos = [
    {
      num: '1',
      titulo: 'Crea tu cuenta gratis',
      desc: 'Regístrate con tu email en segundos. Sin papeleos ni complicaciones.',
      icon: '📝',
    },
    {
      num: '2',
      titulo: 'Publica lo que quieras vender',
      desc: 'Sube fotos, ponle precio, describe tu producto. Es 100% gratis.',
      icon: '📸',
    },
    {
      num: '3',
      titulo: 'Contacta o te contactan',
      desc: 'Los mensajes llegan al chat interno. También puedes compartir tu WhatsApp o teléfono.',
      icon: '💬',
    },
    {
      num: '4',
      titulo: 'Cierra el trato directo',
      desc: 'Acuerden el precio, punto de encuentro y método de pago. Todo entre ustedes.',
      icon: '🤝',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-800 mb-4">¿Cómo funciona?</h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Compra y vende en Venezuela de forma simple, directa y sin intermediarios.
        </p>
      </div>

      <div className="space-y-6 mb-12">
        {pasos.map((p, i) => (
          <div key={i} className="flex gap-6 items-start bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-14 h-14 bg-brand-primary text-white rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
              {p.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                <span className="text-brand-primary">Paso {p.num}:</span> {p.titulo}
              </h3>
              <p className="text-gray-600">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQs rápidas */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Preguntas frecuentes</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-gray-800">¿Es gratis publicar?</h3>
            <p className="text-gray-600 mt-1">Sí, siempre. Puedes publicar todos los productos que quieras sin costo. Si quieres destacar alguna publicación, puedes comprar créditos (opcional).</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">¿VendeT-Venezuela cobra comisión?</h3>
            <p className="text-gray-600 mt-1">No. VendeT-Venezuela no cobra comisión por las transacciones. Los compradores y vendedores cierran el trato directamente entre ellos.</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">¿Cómo pago los créditos?</h3>
            <p className="text-gray-600 mt-1">Aceptamos Pago Móvil, transferencia bancaria, Zelle, Binance Pay (USDT) y PayPal. En la fase inicial, el pago se valida manualmente.</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">¿En qué moneda se publican los precios?</h3>
            <p className="text-gray-600 mt-1">Los precios se publican en USD (dólares). También mostramos el equivalente en bolívares con la tasa referencial del día.</p>
          </div>
        </div>
      </div>

      {/* ============ COMPARATIVA ============ */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">¿Por qué somos diferentes?</h2>
        <p className="text-gray-500 text-center mb-8">Aquí tienes toda la diferencia, de un vistazo</p>

        <div className="max-w-2xl mx-auto overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-3 font-semibold text-gray-500 w-[20%]">¿Qué importa?</th>
                <th className="text-center py-4 px-3 font-bold text-brand-primary bg-green-50 rounded-t-lg w-[27%]">
                  <span className="text-lg">VendeT-Venezuela</span>
                </th>
                <th className="text-center py-4 px-3 font-semibold text-gray-400 w-[27%]">Otros marketplaces</th>
                <th className="text-center py-4 px-3 font-semibold text-gray-400 w-[27%]">Redes sociales</th>
              </tr>
            </thead>
            <tbody>
              {[
                { l: 'Publicar', ta: '✅ Gratis siempre', otros: '❌ De pago', red: '✅ Gratis' },
                { l: 'Comisión por venta', ta: '✅ 0% comisión', otros: '❌ 5-15% comisión', red: '❌ 0% (pero sin filtros)' },
                { l: 'Contacto directo', ta: '✅ Sí, directo', otros: '❌ Con intermediarios', red: '⚠️ Limitado' },
                { l: 'Pago Móvil', ta: '✅ Sí', otros: '❌ No', red: '❌ No' },
                { l: 'Enfocado en Venezuela', ta: '✅ 100% Vzla', otros: '❌ Global', red: '❌ No enfocado' },
                { l: 'Vendedores verificados', ta: '✅ Sistema activo', otros: '⚠️ Ocasional', red: '❌ No existe' },
              ].map((r, i) => (
                <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                  <td className="py-3.5 px-3 font-semibold text-gray-800">{r.l}</td>
                  <td className="py-3.5 px-3 text-center font-bold text-green-700 bg-green-50/50">{r.ta}</td>
                  <td className="py-3.5 px-3 text-center text-red-500">{r.otros}</td>
                  <td className="py-3.5 px-3 text-center text-gray-400">{r.red}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Comprar, vender y contactar es <strong className="text-gray-500">totalmente gratis</strong>. Siempre será así.
        </p>
      </div>

      <div className="text-center mt-12">
        <Link href="/publicar" className="inline-block bg-brand-accent text-brand-primary px-8 py-3 rounded-xl font-bold text-lg hover:bg-accent/90 transition">
          🚀 Publica ahora — Es gratis
        </Link>
      </div>
    </div>
  )
}
