'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl';
import { CheckCircle, Mail, ExternalLink, ArrowRight } from 'lucide-react'
import LocalLink from '@/components/LocalLink'
import { useRouter } from 'next/navigation'

function ConfirmacionContent() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [email, setEmail] = useState('')

  useEffect(() => {
    setEmail(sessionStorage.getItem('tempEmail') || 'tu correo electrónico')
  }, [])

  const handleConfirmClick = () => {
    sessionStorage.removeItem('tempEmail')
    router.push('/login')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-brand-primary">
            VendeT-Venezuela
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* Icono de éxito */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="text-green-600" size={48} />
            </div>
          </div>

          {/* Mensaje principal */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {t('confirmacion.title')}
          </h2>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <Mail className="text-blue-600 mt-0.5" size={20} />
              <div className="text-left">
                <p className="font-semibold text-blue-900 mb-1">
                  {t('confirmacion.sent_to')}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>{email}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-600 mb-6">
            <p>
              {t('confirmacion.instructions')}
            </p>
          </div>

          {/* Bloque de confirmación manual */}
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg mb-6">
            <p className="text-sm text-yellow-900 font-semibold mb-2">
              {t('confirmacion.not_received')}
            </p>
            <p className="text-sm text-yellow-800 mb-3">
              {t('confirmacion.resend_hint')}
            </p>
            <LocalLink
              href="/login"
              className="w-full bg-yellow-500 text-brand-dark font-bold py-3 rounded-lg hover:bg-accent/90 transition flex items-center justify-center gap-2"
            >
              <ExternalLink size={16} />
              {t('confirmacion.go_to_login')}
            </LocalLink>
          </div>

          {/* Botón principal */}
          <div className="space-y-3">
            <button
              onClick={handleConfirmClick}
              className="w-full bg-brand-primary text-white py-4 rounded-lg font-bold hover:bg-brand-dark transition flex items-center justify-center gap-2 text-lg"
            >
              {t('confirmacion.confirmed')}
              <ArrowRight size={20} />
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-4 text-center">{t('confirmacion.footer')}</p>
        </div>
      </div>
    </div>
  )
}

export default ConfirmacionContent
