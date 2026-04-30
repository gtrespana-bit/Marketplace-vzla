'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function ConfirmEmailPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Supabase maneja la confirmación automáticamente al cargar esta página
    // cuando el usuario hace clic en el email
    const handleConfirm = async () => {
      try {
        // Supabase detecta automáticamente el token en la URL
        const { user, error } = await fetch('/api/confirm-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })

        if (error) {
          setStatus('error')
          setMessage('Hubo un problema al confirmar tu cuenta. Por favor intenta de nuevo o contacta soporte.')
          
          setTimeout(() => {
            router.push('/login')
          }, 4000)
          return
        }

        setStatus('success')
        setMessage('¡Email confirmado con éxito! Redirigiendo al login...')
        
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } catch (err) {
        setStatus('error')
        setMessage('Error al confirmar. Por favor intenta de nuevo.')
      }
    }

    handleConfirm()
  }, [router])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-brand-blue">
            Todo<span className="text-brand-yellow">Anuncios</span>
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {status === 'loading' ? (
            <>
              <div className="flex justify-center mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-blue"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Confirmando tu cuenta...
              </h2>
              <p className="text-gray-600">
                Verificamos tu email, por favor espera...
              </p>
            </>
          ) : status === 'success' ? (
            <>
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 rounded-full p-4">
                  <CheckCircle className="text-green-600" size={48} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                ¡Email confirmado con éxito!
              </h2>
              <p className="text-green-700 mb-6">{message}</p>
              <Link
                href="/login"
                className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition flex items-center justify-center gap-2"
              >
                Ir al login
              </Link>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-6">
                <div className="bg-red-100 rounded-full p-4">
                  <XCircle className="text-red-600" size={48} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Error al confirmar
              </h2>
              <p className="text-red-700 mb-6">{message}</p>
              <Link
                href="/confirmacion"
                className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition"
              >
                Volver
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
