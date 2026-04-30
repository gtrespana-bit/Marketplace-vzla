'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ConfirmEmailPage() {
  const router = useRouter()

  useEffect(() => {
    // Mostrar mensaje de éxito y redirigir automáticamente
    const timer = setTimeout(() => {
      router.push('/login')
    }, 3000)

    return () => clearTimeout(timer)
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
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="text-green-600" size={48} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            ¡Email confirmado con éxito!
          </h2>
          <p className="text-green-700 text-center mb-6">
            Tu cuenta está lista. Redirigiendo al login...
          </p>
          <Link
            href="/login"
            className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition"
          >
            Ir al login ahora
          </Link>
        </div>
      </div>
    </div>
  )
}
