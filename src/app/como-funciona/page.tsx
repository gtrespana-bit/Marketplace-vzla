import type { Metadata } from 'next'
import { CheckCircle, Zap, Shield, MessageCircle, Eye, Camera, DollarSign } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '¿Cómo Funciona? — VendeT-Venezuela',
  description: 'Publica gratis en VendeT en 4 pasos simples. Compra y vende carros, tecnología, moda, hogar y más en Venezuela. Sin comisiones, sin intermediarios.',
}

export default function ComoFuncionaPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: '¿Cómo funciona VendeT-Venezuela?',
    description: 'Compra y vende en Venezuela en 4 pasos simples. Publica gratis, conecta con compradores, acuerda el precio y vende directo.',
    url: 'https://vendet.online/como-funciona',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Publica gratis',
        text: 'Crea una cuenta gratuita y publica tu anuncio en menos de 2 minutos. Sube fotos, pon tu precio y describe tu producto.',
      },
      {
        '@type': 'HowToStep',
        name: 'Miles de compradores te ven',
        text: 'Tu anuncio aparece en toda Venezuela. Compradores reales de tu ciudad buscando lo que ofreces.',
      },
      {
        '@type': 'HowToStep',
        name: 'Contacta directo',
        text: 'Los compradores te escriben por el chat interno y WhatsApp. Sin intermediarios ni comisiones.',
      },
      {
        '@type': 'HowToStep',
        name: 'Seguro y verificado',
        text: 'Perfiles verificados, moderación de anuncios y sistema de reputación para comprar y vender con confianza.',
      },
    ],
  }

  const pasos = [
    {
      icon: <Camera className="text-brand-accent" size={32} />,
      titulo: 'Publica gratis en 2 minutos',
      desc: 'Crea tu cuenta, sube fotos de tu producto, ponle un precio en USD y describe qué vendés. Sin comisiones, sin letra pequeña. Publicar es 100% gratis.',
    },
    {
      icon: <Eye className="text-brand-accent" size={32} />,
      titulo: 'Miles de compradores te ven',
      desc: 'Tu anuncio aparece en la página principal, el catálogo, y las búsquedas de toda Venezuela. Compradores reales buscando lo que ofrecés, directamente en tu ciudad.',
    },
    {
      icon: <MessageCircle className="text-brand-accent" size={32} />,
      titulo: 'Contacta directo al comprador',
      desc: 'Los compradores te escriben por el chat interno, WhatsApp o teléfono (si lo habilitaste). Sin intermediarios, sin comisiones. Vos decidís el precio y la forma de pago.',
    },
    {
      icon: <Shield className="text-brand-accent" size={32} />,
      titulo: 'Vendé seguro',
      desc: 'Perfiles verificados con cédula, moderación de anuncios, y sistema de reputación. Compra y vendé con confianza. Si algo no está bien, reportalo.',
    },
  ]

  const faqs = [
    {
      pregunta: '¿Es gratis publicar?',
      respuesta: 'Sí. Cada vendedor recibe 1 crédito gratis para publicar su primer anuncio. Si querés destacar tu publicación y que más gente la vea, podés comprar créditos adicionales.',
    },
    {
      pregunta: '¿Cuánto cuesta comprar créditos?',
      respuesta: 'Los créditos se compran desde la sección "Créditos". Aceptamos Pago Móvil, transferencia bancaria, Zelle, Binance Pay (USDT) y PayPal. Siempre es más barato por volumen.',
    },
    {
      pregunta: '¿Cómo me pagan?',
      respuesta: 'El pago lo acordás directamente con el comprador. VendeT no interviene en el pago. Aceptá transferencias, efectivo, pago móvil, o lo que más te convenga.',
    },
    {
      pregunta: '¿VendeT cobra comisión por venta?',
      respuesta: 'No. No cobramos comisión por venta. Tu anuncio es visible y el precio que ponés es el que recibís.',
    },
    {
      pregunta: '¿Cómo me registro?',
      respuesta: 'Hacé clic en "Regístrate" en la cabecera. Podés usar tu email o tu cuenta de Google. Es rápido y gratis. En menos de un minuto tenés tu cuenta activa.',
    },
    {
      pregunta: '¿Puedo vender carros, inmuebles o servicios?',
      respuesta: 'Sí. VendeT acepta todo tipo de anuncios clasificados: vehículos, inmuebles (alquiler y venta), tecnología, moda, hogar, herramientas, materiales de construcción, repuestos y más.',
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-dark text-white py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-4">¿Cómo funciona VendeT-Venezuela?</h1>
            <p className="text-xl text-white/80">Comprá y vendé en Venezuela en 4 pasos simples. Publicá gratis y empezá a recibir mensajes hoy.</p>
          </div>
        </div>

        {/* Pasos */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pasos.map((paso, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center">
                    {paso.icon}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{paso.titulo}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{paso.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparación con otros marketplaces */}
        <div className="bg-white border-t border-b border-gray-100 py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-black text-gray-900 mb-6 text-center">VendeT vs Otros Marketplaces</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-bold text-green-800 text-lg mb-3">✅ VendeT</h3>
                <ul className="space-y-2 text-sm text-green-700">
                  <li className="flex items-center gap-2"><CheckCircle size={14} /> Publicar gratis</li>
                  <li className="flex items-center gap-2"><CheckCircle size={14} /> 0% comisión por venta</li>
                  <li className="flex items-center gap-2"><CheckCircle size={14} /> Contacto directo (WhatsApp + chat)</li>
                  <li className="flex items-center gap-2"><CheckCircle size={14} /> Sin intermediarios</li>
                  <li className="flex items-center gap-2"><CheckCircle size={14} /> Perfiles verificados</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="font-bold text-red-800 text-lg mb-3">❌ Otros marketplaces</h3>
                <ul className="space-y-2 text-sm text-red-700">
                  <li className="flex items-center gap-2"><X size={14} /> Pagas por publicar</li>
                  <li className="flex items-center gap-2"><X size={14} /> Comisión del 10-15% por venta</li>
                  <li className="flex items-center gap-2"><X size={14} /> No podés contactar directo</li>
                  <li className="flex items-center gap-2"><X size={14} /> Intermediarios obligatorios</li>
                  <li className="flex items-center gap-2"><X size={14} /> Sin verificación real</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-black text-gray-900 mb-8 text-center">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-white rounded-xl border border-gray-100 group">
                <summary className="cursor-pointer p-5 font-semibold text-gray-900 flex justify-between items-center list-none">
                  {faq.pregunta}
                  <span className="text-brand-accent group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <div className="px-5 pb-5 text-gray-600 leading-relaxed">{faq.respuesta}</div>
              </details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white border-t border-b border-gray-100 py-10 px-4">
          <div className="max-w-2xl mx-auto text-center flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/publicar" className="bg-brand-accent text-brand-primary px-8 py-3 rounded-lg font-bold hover:bg-accent/90 transition inline-block">
              Publicar ahora — Es gratis
            </Link>
            <Link href="/catalogo" className="bg-white border-2 border-brand-primary text-brand-primary px-8 py-3 rounded-lg font-bold hover:bg-brand-primary hover:text-white transition inline-block">
              Ver catálogo
            </Link>
          </div>
        </div>

        <div className="h-8" />
      </div>
    </>
  )
}
