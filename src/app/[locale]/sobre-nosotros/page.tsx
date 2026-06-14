import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sobre Nosotros — VendeT-Venezuela',
  description: 'Conoce VendeT: el marketplace gratuito para comprar y vender en Venezuela. Sin comisiones, sin intermediarios, contacto directo entre compradores y vendedores.',
}

export default function SobreNosotrosPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Sobre VendeT-Venezuela',
    description: 'Marketplace gratuito para comprar y vender en Venezuela sin comisiones ni intermediarios.',
    url: 'https://vendet.online/sobre-nosotros',
    mainEntity: {
      '@type': 'Organization',
      name: 'VendeT-Venezuela',
      url: 'https://vendet.online',
      description: 'Marketplace venezolano. Compra y vende carros, tecnología, moda, hogar y más. Publica gratis, contacta directo.',
      foundingDate: '2024',
      areaServed: {
        '@type': 'Country',
        name: 'Venezuela',
      },
      serviceType: 'Marketplace de clasificados online',
      knowsAbout: ['comercio electrónico', 'clasificados online', 'venta directa', 'marketplace'],
    },
  }

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
            <h1 className="text-4xl md:text-5xl font-black mb-4">Sobre VendeT</h1>
            <p className="text-xl text-white/80">El marketplace hecho para Venezuela.</p>
          </div>
        </div>

        {/* Contenido */}
        <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
          {/* Quiénes somos */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4">Quiénes somos</h2>
            <p className="text-gray-600 leading-relaxed">
              VendeT es un marketplace diseñado específicamente para el venezolano. Nació de la necesidad de una plataforma
              donde comprar y vender sea fácil, directo y sin complicaciones. Creemos que el comercio local merece herramientas
              modernas que no dependan de intermediarios que cobren comisiones abusivas.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              Nuestro equipo entiende el comercio en Venezuela de primera mano. Sabemos lo que significa vender algo que ya no usás,
              encontrar el producto que necesitás a buen precio, y evitar las comisiones del 10-15% que otras plataformas te cobran.
              <strong> Por eso creamos VendeT</strong>: para que el precio que pones sea el precio que recibís.
            </p>
          </section>

          {/* Nuestra misión */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4">Nuestra misión</h2>
            <p className="text-gray-600 leading-relaxed">
              Facilitar el comercio entre venezolanos. Queremos que cualquier persona pueda publicar lo que vende y encontrar
              compradores en su ciudad de forma rápida, segura y sin costos escondidos. <strong>Sin intermediarios, sin comisiones
              por venta, sin letra pequeña.</strong>
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              Cada venezolano debería poder vender lo que tiene o encontrar lo que necesita, sin barreras. Ya sea un carro en Maracaibo,
              un teléfono en Caracas, o materiales de construcción en Valencia — VendeT conecta a quien vende con quien compra.
            </p>
          </section>

          {/* Por qué VendeT */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4">¿Por qué VendeT?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { titulo: 'Sin comisiones', desc: 'El precio que pones es el que recibís. No tocamos tu dinero.', icon: '💰' },
                { titulo: 'Contacto directo', desc: 'Chat interno + WhatsApp para que acordés todo sin salir de la plataforma.', icon: '💬' },
                { titulo: 'Todo Venezuela', desc: 'Desde Maracaibo hasta Caracas, tu anuncio llega a toda Venezuela.', icon: '🌎' },
                { titulo: 'Publica gratis', desc: 'Publicar no cuesta ni un centavo. Créditos opcionales para destacar.', icon: '🆓' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.titulo}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-white rounded-xl p-8 border border-gray-100 text-center shadow-sm">
            <h2 className="text-2xl font-black text-gray-900 mb-3">¿Listo para empezar?</h2>
            <p className="text-gray-600 mb-6">Únete a miles de venezolanos que ya compran y venden en VendeT.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register" className="bg-brand-accent text-brand-primary px-8 py-3 rounded-lg font-bold hover:bg-accent/90 transition inline-block">
                Crear mi cuenta gratis
              </Link>
              <Link href="/catalogo" className="bg-white border-2 border-brand-primary text-brand-primary px-8 py-3 rounded-lg font-bold hover:bg-brand-primary hover:text-white transition inline-block">
                Ver anuncios
              </Link>
            </div>
          </section>

          <div className="h-8" />
        </div>
      </div>
    </>
  )
}
