import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Eliminar tu cuenta — VendeT',
  description: 'Solicita la eliminación de tu cuenta y todos tus datos asociados en VendeT.',
}

export default function EliminarCuentaPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black text-gray-800 mb-2">Eliminar tu cuenta de VendeT</h1>
      <p className="text-gray-500 mb-10">
        Si ya no deseas utilizar VendeT, podemos eliminar tu cuenta y todos los datos asociados.
      </p>

      <div className="space-y-8">
        {/* Cómo solicitar */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Cómo solicitar la eliminación</h2>
          <p className="text-gray-600 mb-4">
            Para eliminar tu cuenta de <strong>VendeT</strong> y todos tus datos asociados, sigue estos pasos:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Abre la aplicación VendeT en tu dispositivo o visita <a href="https://vendet.online" className="text-blue-600 underline">vendet.online</a>.</li>
            <li>Inicia sesión con tu correo electrónico y contraseña.</li>
            <li>Ve a <strong>Mi Perfil</strong> o <strong>Dashboard</strong>.</li>
            <li>Selecciona <strong>Configuración</strong> y luego <strong>Eliminar cuenta</strong>.</li>
            <li>Confirma tu decisión.</li>
          </ol>
          <p className="text-gray-600 mt-4">
            Si no puedes acceder a tu cuenta o prefieres solicitar la eliminación directamente, envíanos un correo electrónico a:
          </p>
          <a
            href="mailto:privacidad@vendet.online?subject=Solicitud%20de%20eliminación%20de%20cuenta%20—%20VendeT"
            className="text-blue-600 underline font-medium"
          >
            privacidad@vendet.online
          </a>
          <p className="text-gray-600 mt-2">
            Incluye tu correo electrónico registrado y la frase "Solicito la eliminación de mi cuenta de VendeT".
          </p>
        </section>

        {/* Qué datos se eliminan */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Qué datos se eliminan</h2>
          <p className="text-gray-600 mb-3">Al eliminar tu cuenta, se eliminan de forma permanente:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Tu perfil completo (nombre, email, teléfono, foto, ciudad)</li>
            <li>Todas tus publicaciones activas e inactivas</li>
            <li>Todos los mensajes de chat</li>
            <li>Tus favoritos y favoritos de otros usuarios sobre tus publicaciones</li>
            <li>Tu historial de transacciones y créditos</li>
          </ul>
        </section>

        {/* Qué datos se conservan */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Qué datos se conservan</h2>
          <p className="text-gray-600 mb-3">Por motivos legales y de seguridad, puede que conservemos:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Registros de actividad con tu correo electrónico anonimi<strong>zado</strong></li>
            <li>Datos necesarios para resolver disputas o reclamaciones pendientes</li>
            <li>Información requerida por ley</li>
          </ul>
          <p className="text-gray-500 text-sm mt-3">Estos datos retenidos serán eliminados automáticamente en un plazo máximo de <strong>30 días</strong>, salvo obligación legal de mantenerlos por más tiempo.</p>
        </section>

        {/* Período de retención */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Período de retención</h2>
          <p className="text-gray-600">
            Los datos eliminados son borrados de nuestros sistemas en un plazo de <strong>30 días</strong> después de recibir tu solicitud. Las copias de seguridad se limpian en el siguiente ciclo de rotación de backups (máximo <strong>30 días</strong>).
          </p>
        </section>

        {/* Contacto */}
        <section className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="font-bold text-gray-800 mb-2">¿Necesitas ayuda?</h3>
          <p className="text-gray-600">
            Si tienes alguna duda sobre la eliminación de tu cuenta, contáctanos en{' '}
            <a href="mailto:privacidad@vendet.online" className="text-blue-600 underline font-medium">
              privacidad@vendet.online
            </a>
          </p>
          <p className="text-gray-500 text-sm mt-2">
            VendeT — Vendé inteligente. Vendé sin comisión.
          </p>
        </section>
      </div>
    </div>
  )
}
