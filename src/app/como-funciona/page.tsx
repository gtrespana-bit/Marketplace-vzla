import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '¿Cómo funciona? — Todo Anuncios',
  description: 'Guía rápida de cómo comprar, vender y destacar productos en Todo Anuncios',
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
            <div className="w-14 h-14 bg-brand-blue text-white rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
              {p.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                <span className="text-brand-blue">Paso {p.num}:</span> {p.titulo}
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
            <h3 className="font-bold text-gray-800">¿Todo Anuncios cobra comisión?</h3>
            <p className="text-gray-600 mt-1">No. Todo Anuncios no cobra comisión por las transacciones. Los compradores y vendedores cierran el trato directamente entre ellos.</p>
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

      <div className="text-center mt-12">
        <Link href="/publicar" className="inline-block bg-brand-yellow text-brand-blue px-8 py-3 rounded-xl font-bold text-lg hover:bg-yellow-400 transition">
          🚀 Publica ahora — Es gratis
        </Link>
      </div>
    </div>
  )
}
