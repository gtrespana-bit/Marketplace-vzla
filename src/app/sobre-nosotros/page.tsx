import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sobre Nosotros — VendeT-Venezuela',
  description: 'Conoce la historia detrás de VendeT-Venezuela, el marketplace hecho para Venezuela',
}

export default function SobreNosotrosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black text-gray-800 mb-2 text-center">Sobre VendeT-Venezuela</h1>
      <p className="text-center text-gray-500 mb-12 max-w-lg mx-auto">
        Nació de una necesidad real: no había un buen lugar donde comprar y vender en Venezuela.
      </p>

      <div className="space-y-10">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🇻🇪 La historia</h2>
          <p className="text-gray-600 leading-relaxed">
            Venezuela es un país de emprendedores. En cada ciudad, en cada pueblo, alguien tiene algo para vender. Pero las opciones eran limitadas: Facebook Marketplace sin filtros, grupos de WhatsApp que se llenan de spam, o plataformas diseñadas para otros mercados.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            Así nació VendeT-Venezuela: un marketplace pensado desde y para Venezuela. Con búsqueda en dólares sin intermediarios complicados. Con WhatsApp, porque aquí todos lo usan. Y con un diseño que funciona bien aunque tu internet no sea el mejor.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Nuestra misión</h2>
          <p className="text-gray-600 leading-relaxed">
            Hacer que comprar y vender en Venezuela sea fácil, gratuito y confiable. Queremos que cualquier persona pueda publicar un producto en minutos y que cualquier comprador pueda encontrar lo que necesita sin perder tiempo.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">💡 Lo que nos diferencia</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: '🆓', titulo: 'Siempre gratis para publicar', desc: 'Sin límites, sin letras pequeñas' },
              { icon: '💵', titulo: 'Precios en dólares', desc: 'La moneda real que se usa en el día a día' },
              { icon: '💚', titulo: 'WhatsApp integrado', desc: 'Contacta directo, sin intermediarios' },
              { icon: '📱', titulo: 'Optimizado para móviles', desc: 'Funciona bien con datos y conexiones lentas' },
              { icon: '⭐', titulo: 'Destacados accesibles', desc: 'Sistema de créditos simple y económico' },
              { icon: '🇻🇪', titulo: '100% Venezuela', desc: 'Pensado para el mercado venezolano, de punta a punta' },
            ].map((item) => (
              <div key={item.titulo} className="flex gap-3 p-4 bg-gray-50 rounded-xl">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-800">{item.titulo}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-brand-yellow rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-brand-blue mb-4">¿Quieres ser parte?</h2>
          <p className="text-brand-blue/80 max-w-md mx-auto mb-6">
            Estamos construyendo algo grande. Únete como usuario early adopter o escríbenos si quieres colaborar.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/register" className="bg-brand-blue text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-900 transition">
              Regístrate
            </a>
            <a href="/contacto" className="border border-brand-blue text-brand-blue px-8 py-3 rounded-lg font-bold hover:bg-brand-yellow/50 transition">
              Contáctanos
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
