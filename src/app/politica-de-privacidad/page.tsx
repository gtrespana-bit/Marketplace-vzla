import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad — TuCambalo',
}

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black text-gray-800 mb-2">Política de Privacidad</h1>
      <p className="text-gray-500 mb-8">Última actualización: Abril 2026</p>

      <div className="space-y-6 text-gray-600">
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">1. Qué información recogemos</h2>
          <p>Recogemos la información que nos proporcionas al registrarte (nombre, email, teléfono, ubicación) y la información de tus publicaciones (fotos, descripciones, precios).</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">2. Para qué usamos tu información</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Crear y gestionar tu cuenta</li>
            <li>Publicar tus anuncios</li>
            <li>Facilitar la comunicación entre usuarios</li>
            <li>Mejorar el servicio</li>
            <li>Enviar notificaciones relevantes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">3. Compartimos tu información</h2>
          <p>No vendemos ni compartimos tus datos personales con terceros. Tu email nunca es visible públicamente a menos que tú lo decidas. Tu información de contacto solo se comparte con tu consentimiento.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">4. Seguridad</h2>
          <p>Utilizamos medidas de seguridad estándar de la industria para proteger tus datos, incluyendo conexiones cifradas (HTTPS) y almacenamiento seguro.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">5. Tus derechos</h2>
          <p>Puedes solicitar la eliminación de tu cuenta y todos tus datos en cualquier momento desde la configuración de tu perfil o escribiéndonos a <a href="mailto:privacidad@tucambalo.com" className="text-brand-blue underline">privacidad@tucambalo.com</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">6. Cookies</h2>
          <p>Utilizamos cookies esenciales para el funcionamiento del sitio y cookies opcionales para analíticas. Puedes gestionar tus preferencias en la configuración de tu navegador.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">7. Contacto</h2>
          <p>Para preguntas sobre privacidad: <a href="mailto:privacidad@tucambalo.com" className="text-brand-blue underline">privacidad@tucambalo.com</a></p>
        </section>
      </div>
    </div>
  )
}
