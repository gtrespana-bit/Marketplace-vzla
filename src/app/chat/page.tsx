import type { Metadata } from 'next'
import { MessageSquare } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Chat — Mensajes | Todo Anuncios',
  description: 'Chatea con compradores y vendedores en tiempo real',
}

export default function ChatPage() {
  const conversaciones = [
    { id: 1, nombre: 'Carlos M.', ultima: '¿Sigue disponible el iPhone?', hora: '14:30', noLeidos: 2, online: true, avatar: 'C' },
    { id: 2, nombre: 'María G.', ultima: 'Te ofrezco $300 por la MacBook', hora: '11:15', noLeidos: 0, online: false, avatar: 'M' },
    { id: 3, nombre: 'Pedro R.', ultima: '¿Aceptas Pago Móvil?', hora: 'Ayer', noLeidos: 1, online: false, avatar: 'P' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">💬 Mensajes</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row h-[600px]">
          {/* Lista de conversaciones */}
          <div className="w-full md:w-80 border-r border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <input
                type="text"
                placeholder="Buscar conversación..."
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="overflow-y-auto h-[calc(600px-65px)]">
              {conversaciones.map((conv) => (
                <button
                  key={conv.id}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-50 transition text-left"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-lg">
                      {conv.avatar}
                    </div>
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-800 text-sm truncate">{conv.nombre}</p>
                      <span className="text-xs text-gray-400 ml-2">{conv.hora}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{conv.ultima}</p>
                  </div>
                  {conv.noLeidos > 0 && (
                    <span className="bg-brand-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                      {conv.noLeidos}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold">
                  C
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Carlos M.</p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                    En línea
                  </p>
                </div>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <div className="flex justify-end">
                <div className="bg-brand-blue text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-xs">
                  <p className="text-sm">Hola Carlos, ¿está disponible el iPhone?</p>
                  <p className="text-xs text-blue-200 mt-1 text-right">14:25</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm px-4 py-2 max-w-xs">
                  <p className="text-sm">¡Hola! Sí, sigue disponible. ¿Quieres verlo?</p>
                  <p className="text-xs text-gray-400 mt-1">14:28</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-brand-blue text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-xs">
                  <p className="text-sm">¿Sigue disponible el iPhone?</p>
                  <p className="text-xs text-blue-200 mt-1 text-right">14:30</p>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100">
              <form className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  className="flex-1 border rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
                <button type="submit" className="bg-brand-blue text-white w-10 h-10 rounded-full hover:bg-blue-900 transition flex items-center justify-center">
                  <MessageSquare size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
