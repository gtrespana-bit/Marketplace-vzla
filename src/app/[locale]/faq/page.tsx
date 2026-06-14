import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes — VendeT-Venezuela',
  description: 'Resuelve tus dudas sobre VendeT: cómo publicar, seguridad, créditos, métodos de pago y más. Marketplace gratuito para comprar y vender en Venezuela.',
}

const faqData = [
  {
    question: '¿Es seguro usar VendeT-Venezuela?',
    answer: 'VendeT-Venezuela conecta compradores y vendedores directamente. Recomendamos siempre encontrarse en lugares públicos, verificar el producto antes de pagar, y desconfiar de precios demasiado bajos. Nunca envíes dinero por adelantado.',
  },
  {
    question: '¿Puedo publicar sin registrarme?',
    answer: 'No, necesitas crear una cuenta para publicar. El registro es gratuito y toma menos de un minuto.',
  },
  {
    question: '¿Cuántas publicaciones puedo tener?',
    answer: 'No hay límite. Puedes publicar todos los productos que quieras, siempre gratis.',
  },
  {
    question: '¿Qué son los créditos?',
    answer: 'Los créditos son una moneda interna opcional para destacar tus publicaciones. Con créditos puedes hacer que tu producto aparezca primero en las búsquedas y en la portada.',
  },
  {
    question: '¿Qué métodos de pago aceptan para créditos?',
    answer: 'Pago Móvil, transferencia bancaria, Zelle, Binance Pay (USDT) y PayPal. Estamos agregando más métodos progresivamente.',
  },
  {
    question: '¿VendeT-Venezuela maneja pagos o envíos?',
    answer: 'No. VendeT-Venezuela es una plataforma de conexión entre compradores y vendedores. El pago y la entrega se acuerdan directamente entre las partes.',
  },
  {
    question: '¿Cómo reporto un anuncio fraudulento?',
    answer: 'En cada publicación hay un botón "Reportar". También puedes escribirnos a soporte@vendet.online con los detalles.',
  },
  {
    question: '¿En qué moneda se publica?',
    answer: 'Los precios se publican en USD (dólares). También se muestra el equivalente en bolívares con tasa referencial.',
  },
  {
    question: '¿Cómo contacto a un vendedor?',
    answer: 'Cada publicación tiene un botón de mensaje directo, WhatsApp y teléfono (si el vendedor lo habilitó). También puedes usar el chat integrado de VendeT.',
  },
  {
    question: '¿Puedo vender carros o inmuebles en VendeT?',
    answer: 'Sí. VendeT acepta todo tipo de anuncios clasificados: vehículos, inmuebles (alquiler y venta), tecnología, moda, hogar, herramientas, materiales, repuestos y más.',
  },
  {
    question: '¿Es gratis publicar en VendeT-Venezuela?',
    answer: 'Sí, publicar es 100% gratuito. Los créditos son opcionales y solo sirven para destacar tu anuncio y llegar a más compradores.',
  },
]

export default function FAQPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black text-gray-800 mb-2 text-center">
          Preguntas Frecuentes
        </h1>
        <p className="text-center text-gray-500 mb-10">
          Resolvemos tus dudas sobre cómo comprar, vender y destacar tus anuncios en VendeT-Venezuela
        </p>

        <div className="space-y-4">
          {faqData.map((faq, i) => (
            <details key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 group">
              <summary className="font-bold text-gray-800 text-lg px-6 pt-5 pb-2 cursor-pointer list-none hover:text-brand-primary transition-colors marker:content-['▶']">
                {faq.question}
              </summary>
              <p className="text-gray-600 px-6 pb-5 leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>

        <div className="bg-brand-accent rounded-xl p-6 mt-8 text-center">
          <h3 className="font-bold text-brand-primary text-lg">¿No encontraste tu respuesta?</h3>
          <p className="text-brand-primary/80 mt-1">Escríbenos y te ayudamos</p>
          <a href="mailto:soporte@vendet.online" className="inline-block mt-3 bg-brand-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-dark transition">
            soporte@vendet.online
          </a>
        </div>
      </div>
    </>
  )
}
