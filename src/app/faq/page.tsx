import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes — VendeT-Venezuela',
}

export default function FAQPage() {
  const faqs = [
    {
      q: '¿Es seguro usar VendeT-Venezuela?',
      a: 'VendeT-Venezuela conecta compradores y vendedores directamente. Recomendamos siempre encontrarse en lugares públicos, verificar el producto antes de pagar, y desconfiar de precios demasiado bajos. Nunca envíes dinero por adelantado.',
    },
    {
      q: '¿Puedo publicar sin registrarme?',
      a: 'No, necesitas crear una cuenta para publicar. El registro es gratuito y toma menos de un minuto.',
    },
    {
      q: '¿Cuántas publicaciones puedo tener?',
      a: 'No hay límite. Puedes publicar todos los productos que quieras, siempre gratis.',
    },
    {
      q: '¿Qué son los créditos?',
      a: 'Los créditos son una moneda interna opcional para destacar tus publicaciones. Con créditos puedes hacer que tu producto aparezca primero en las búsquedas y en la portada.',
    },
    {
      q: '¿Qué métodos de pago aceptan para créditos?',
      a: 'Pago Móvil, transferencia bancaria, Zelle, Binance Pay (USDT) y PayPal. Estamos agregando más métodos progresivamente.',
    },
    {
      q: '¿VendeT-Venezuela maneja pagos o envíos?',
      a: 'No. VendeT-Venezuela es una plataforma de conexión entre compradores y vendedores. El pago y la entrega se acuerdan directamente entre las partes.',
    },
    {
      q: '¿Cómo reporto un anuncio fraudulento?',
      a: 'En cada publicación hay un botón "Reportar". También puedes escribirnos a soporte@vendet.online con los detalles.',
    },
    {
      q: '¿En qué moneda se publica?',
      a: 'Los precios se publican en USD (dólares). También se muestra el equivalente en bolívares con tasa referencial.',
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black text-gray-800 mb-2 text-center">Preguntas Frecuentes</h1>
      <p className="text-center text-gray-500 mb-10">Resolvemos tus dudas más comunes</p>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 text-lg">❓ {faq.q}</h3>
            <p className="text-gray-600 mt-2">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="bg-brand-yellow rounded-xl p-6 mt-8 text-center">
        <h3 className="font-bold text-brand-blue text-lg">¿No encontraste tu respuesta?</h3>
        <p className="text-brand-blue/80 mt-1">Escríbenos y te ayudamos</p>
        <a href="mailto:soporte@vendet.online" className="inline-block mt-3 bg-brand-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900 transition">
          soporte@vendet.online
        </a>
      </div>
    </div>
  )
}
