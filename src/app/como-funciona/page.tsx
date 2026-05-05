import { CheckCircle, Zap, Shield, MessageCircle, Eye } from 'lucide-react'
import Link from 'next/link'

export default function ComoFuncionaPage() {
  const pasos = [
    {
      icon: <Zap className="text-brand-accent" size={32} />,
      titulo: 'Publica gratis',
      desc: 'Crea un anuncio en menos de 2 minutos. Sube fotos, ponle precio y describe lo que vendes. Sin comisiones, sin letra pequeña.',
    },
    {
      icon: <Eye className="text-brand-accent" size={32} />,
      titulo: 'Miles de compradores te ven',
      desc: 'Tu anuncio aparece en toda Venezuela. Compradores reales buscando lo que ofreces, directamente en tu ciudad.',
    },
    {
      icon: <MessageCircle className="text-brand-accent" size={32} />,
      titulo: 'Contacta directo',
      desc: 'Los compradores te escriben por el chat interno. Sin intermediarios, sin comisiones. Tú decides el precio y la forma de pago.',
    },
    {
      icon: <Shield className="text-brand-accent" size={32} />,
      titulo: 'Seguro y verificado',
      desc: 'Perfiles verificados, moderación de anuncios, y sistema de reputación. Compra y vende con confianza.',
    },
  ]

  const faqs = [
    {
      pregunta: '¿Es gratis publicar?',
      respuesta: 'Sí. Cada vendedor recibe 1 crédito gratis para publicar su primer anuncio. Si quieres publicar más, puedes comprar créditos adicionales.',
    },
    {
      pregunta: '¿Cuánto cuesta comprar créditos?',
      respuesta: 'Los créditos se compran desde la sección "Créditos". El precio varía según el paquete que elijas. Siempre es más barato por volumen.',
    },
    {
      pregunta: '¿Cómo me pagan?',
      respuesta: 'El pago lo acuerdas directamente con el comprador. VendeT no interviene en el pago. Acepta transferencias, efectivo, pago móvil, lo que te funcione.',
    },
    {
      pregunta: '¿VendeT cobra comisión?',
      respuesta: 'No. No cobramos comisión por venta. Tu anuncio es visible y el precio que pones es el que recibes.',
    },
    {
      pregunta: '¿Cómo me registré?',
      respuesta: 'Haz clic en "Regístrate" en la cabecera. Puedes usar tu email o tu cuenta de Google. Es rápido y gratis.',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-dark text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">¿Cómo funciona VendeT?</h1>
          <p className="text-xl text-white/80">Compra y vende en Venezuela en 4 pasos simples.</p>
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

      {/* CTA */}
      <div className="bg-white border-t border-b border-gray-100 py-10 px-4">
        <div className="max-w-2xl mx-auto text-center flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/publicar" className="bg-brand-accent text-brand-primary px-8 py-3 rounded-lg font-bold hover:bg-accent/90 transition inline-block">
            Publicar ahora
          </Link>
          <Link href="/catalogo" className="bg-white border-2 border-brand-primary text-brand-primary px-8 py-3 rounded-lg font-bold hover:bg-brand-primary hover:text-white transition inline-block">
            Ver catálogo
          </Link>
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

      <div className="h-8" />
    </div>
  )
}
