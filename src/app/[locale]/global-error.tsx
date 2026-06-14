"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Algo salió mal</h1>
            <p className="text-gray-500 mb-4">Ha ocurrido un error inesperado.</p>
            <button onClick={() => window.location.reload()} className="bg-brand-primary text-white px-6 py-2 rounded-lg font-bold">
              Intentar de nuevo
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
