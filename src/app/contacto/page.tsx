import type { Metadata } from 'next'
import { Mail, MessageCircle, Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contacto — VendeT-Venezuela',
  description: '¿Tienes dudas o sugerencias? Contáctanos',
}

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black text-gray-800 mb-2 text-center">Contáctanos</h1>
      <p className="text-center text-gray-500 mb-10 max-w-lg mx-auto">
        ¿Tienes alguna pregunta, sugerencia o problema? Estamos aquí para ayudarte.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Envíanos un mensaje</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" required className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
              <select className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow">
                <option>Pregunta general</option>
                <option>Reportar un anuncio</option>
                <option>Problema con mi cuenta</option>
                <option>Sugerencia</option>
                <option>Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
              <textarea rows={5} required className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow resize-none"></textarea>
            </div>
            <button type="submit" className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition">
              Enviar mensaje
            </button>
          </form>
        </div>

        {/* Info de contacto */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4">Otras formas de contacto</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-brand-blue">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Email</p>
                  <p className="text-sm text-gray-500">soporte@vendet.online</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-800">WhatsApp / Telegram</p>
                  <p className="text-sm text-gray-500">@VendeT-Venezuela</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-brand-yellow">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Teléfono</p>
                  <p className="text-sm text-gray-500">+58 412 XXX XXXX</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-yellow rounded-2xl p-6 text-center">
            <h3 className="font-bold text-brand-blue text-lg">Horario de atención</h3>
            <p className="text-brand-blue/80 mt-2">
              Lunes a sábado<br />
              8:00 AM – 10:00 PM (hora Venezuela)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
