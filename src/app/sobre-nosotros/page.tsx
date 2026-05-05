import Link from 'next/link'

export default function SobreNosotrosPage() {
  return (
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
        </section>

        {/* Nuestra misión */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-4">Nuestra misión</h2>
          <p className="text-gray-600 leading-relaxed">
            Facilitar el comercio entre venezolanos. Queremos que cualquier persona pueda publicar lo que vende y encontrar
            compradores en su ciudad de forma rápida, segura y sin costos escondidos. Sin intermediarios, sin comisiones
            por venta, sin letra pequeña.
          </p>
        </section>

        {/* Por qué VendeT */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-4">¿Por qué VendeT?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { titulo: 'Sin comisiones', desc: 'El precio que pones es el que recibes. No tocamos tu dinero.' },
              { titulo: 'Contacto directo', desc: 'Chat interno para que acuerdes todo sin salir de la plataforma.' },
              { titulo: 'Todo Venezuela', desc: 'Desde Maracaibo hasta Caracas, tu anuncio llega a toda Venezuela.' },
              { titulo: 'Publica gratis', desc: '1 crédito gratis al registrarte. Sin tarjeta de crédito.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
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
      </div>

      <div className="h-8" />
    </div>
  )
}
