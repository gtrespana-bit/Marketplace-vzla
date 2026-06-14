import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Eliminar tu cuenta — VendeT',
  description: 'Solicita la eliminación de tu cuenta y datos asociados en VendeT.',
}

export default function EliminarCuentaPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black text-gray-800 mb-2">Eliminar tu cuenta de VendeT</h1>
      <p className="text-gray-500 mb-10">
        Podés solicitar la eliminación completa de tu cuenta y todos tus datos asociados en VendeT-Venezuela.
      </p>

      <div className="space-y-8">
        {/* Cómo solicitar */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Cómo solicitar la eliminación</h2>
          <p className="text-gray-600 mb-4">
            Envía un correo electrónico a{' '}
            <a
              href="mailto:privacidad@vendet.online?subject=Solicitud%20de%20eliminación%20de%20cuenta%20—%20VendeT"
              className="text-blue-600 underline font-medium"
            >
              privacidad@vendet.online
            </a>{' '}
            con el asunto <strong>&quot;Eliminar cuenta — VendeT&quot;</strong>.
          </p>
          <p className="text-gray-600 mb-3">En el cuerpo del email indicá:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>El correo electrónico asociado a tu cuenta de VendeT</li>
            <li>La frase &quot;Solicito la eliminación completa de mi cuenta&quot;</li>
          </ul>
          <p className="text-gray-600 mt-4 text-sm">
            Procesaremos tu solicitud en un plazo máximo de 72 horas y te confirmaremos por el mismo email cuando se haya completado.
          </p>
        </section>

        {/* Qué se elimina */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Datos que se eliminan</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Tu perfil (nombre, email, teléfono, foto, ciudad)</li>
            <li>Todas tus publicaciones activas e inactivas</li>
            <li>Historial de mensajes de chat</li>
            <li>Publicaciones guardadas (favoritos)</li>
            <li>Sesión activa y tokens de autenticación</li>
          </ul>
        </section>

        {/* Qué se conserva */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Datos que se conservan</h2>
          <p className="text-gray-600">
            Conservamos únicamente los registros mínimos necesarios para cumplir con obligaciones legales y resolver disputas. Estos datos se almacenan de forma anonimizada y se eliminan automáticamente tras un período de <strong>30 días</strong>.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="font-bold text-gray-800 mb-2">Contacto</h3>
          <p className="text-gray-600">
            Para cualquier consulta sobre tus datos: <a href="mailto:privacidad@vendet.online" className="text-blue-600 underline font-medium">privacidad@vendet.online</a>
          </p>
          <p className="text-gray-500 text-sm mt-2">
            VendeT — Vendé inteligente. Vendé sin comisión.
          </p>
        </section>
      </div>
    </div>
  )
}
