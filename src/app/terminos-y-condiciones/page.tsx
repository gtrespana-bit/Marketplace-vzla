import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones — Todo Anuncios',
}

export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black text-gray-800 mb-2">Términos y Condiciones</h1>
      <p className="text-gray-500 mb-8">Última actualización: Abril 2026</p>

      <div className="prose prose-sm text-gray-600 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">1. Introducción</h2>
          <p>Bienvenido a Todo Anuncios. Al usar nuestra plataforma, aceptas estos términos y condiciones. Si no estás de acuerdo con alguno de estos términos, no utilices nuestros servicios.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">2. Descripción del servicio</h2>
          <p>Todo Anuncios es una plataforma de publicación de anuncios que conecta compradores y vendedores. No somos parte de las transacciones: no manejamos pagos ni entregas, y no nos hacemos responsables de los productos publicados.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">3. Publicación de anuncios</h2>
          <p>Los usuarios pueden publicar anuncios de forma gratuita. Al publicar un anuncio, declaras que:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>El producto es legítimo y legal para la venta.</li>
            <li>Las fotos y descripciones son veraces y corresponden al producto real.</li>
            <li>Tienes derecho legal de vender el producto.</li>
          </ul>
          <p className="mt-2">Están prohibidos los productos ilegales, robados, falsificados, de naturaleza peligrosa, o que violen derechos de terceros.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">4. Sistema de créditos</h2>
          <p>Los créditos son una moneda virtual utilizada para destacar publicaciones. Los créditos no son reembolsables y no tienen valor fuera de la plataforma.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">5. Conducta del usuario</h2>
          <p>No se permiten: spam, estafas, publicaciones falsas, contenido ofensivo, ni la publicación de datos personales de terceros sin su consentimiento.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">6. Responsabilidad</h2>
          <p>Todo Anuncios no garantiza la veracidad de los anuncios ni la calidad de las transacciones. Los usuarios actúan bajo su propio riesgo. Recomendamos tomar precauciones durante las transacciones.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">7. Modificación de los términos</h2>
          <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor al ser publicados.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">8. Contacto</h2>
          <p>Para dudas sobre estos términos: <a href="mailto:legal@todo-anuncios.com" className="text-brand-blue underline">legal@todo-anuncios.com</a></p>
        </section>
      </div>
    </div>
  )
}
