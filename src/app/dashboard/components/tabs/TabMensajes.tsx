"use client"

import Link from 'next/link'
import { MessageSquare } from 'lucide-react'

export default function TabMensajes() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
      <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-800 mb-2">Chat en tiempo real</h3>
      <p className="text-gray-500">Gestiona tus conversaciones con compradores y vendedores.</p>
      <Link href="/chat" className="inline-block mt-4 bg-brand-blue text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-900 transition">Abrir Chat</Link>
    </div>
  )
}
