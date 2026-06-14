import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Smartphone, Share, Download, PlusCircle, ArrowDownToLine, CheckCircle2, Apple, MonitorDown } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Instala la App de VendeT — VendeT-Venezuela',
  description: 'Aprende cómo instalar VendeT-Venezuela como app en tu teléfono. Guía paso a paso para Android e iPhone.',
}

export default function ComoInstalarAppPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Botón volver */}
      <Link href="/" className="inline-flex items-center gap-2 text-brand-primary font-semibold text-sm hover:underline mb-6">
        <ArrowLeft size={16} /> Volver al inicio
      </Link>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Smartphone size={36} className="text-brand-accent" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Instala la App de VendeT</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          No necesitas buscar en ninguna tienda de apps. VendeT es una app web progresiva (PWA) que se instala directamente desde tu navegador. ¡En 3 pasos!
        </p>
      </div>

      {/* Sección Android */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <MonitorDown size={20} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Android</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-green-50 px-5 py-4 border-b border-green-100">
            <p className="text-sm font-semibold text-green-800">Requisito: Usa Google Chrome en tu Android</p>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Paso 1 */}
            <div className="p-5 flex gap-4">
              <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Abre Chrome y entra a <strong>vendet.online</strong></p>
                <p className="text-sm text-gray-500 mt-1">Asegúrate de estar en la URL correcta. Si ya tienes la página abierta, perfecto.</p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="p-5 flex gap-4">
              <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Toca el <strong>menú de 3 puntos</strong> (⋮) arriba a la derecha</p>
                <p className="text-sm text-gray-500 mt-1">Verás opciones como "Compartir", "Descargar", etc.</p>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="p-5 flex gap-4">
              <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Busca y toca <strong>"Instalar aplicación"</strong> o <strong>"Añadir a pantalla de inicio"</strong></p>
                <p className="text-sm text-gray-500 mt-1">
                  Dependiendo de tu versión de Chrome, verás una de estas opciones. También puede aparecer un banner en la parte inferior diciendo "Instalar VendeT".
                </p>
              </div>
            </div>

            {/* Paso 4 */}
            <div className="p-5 flex gap-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Confirma la instalación</p>
                <p className="text-sm text-gray-500 mt-1">
                  Aparecerá un diálogo de confirmación. Toca <strong>"Instalar"</strong>. ¡Listo! Ahora tienes VendeT como app en tu pantalla de inicio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección iPhone (iOS) */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Apple size={20} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">iPhone / iPad</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-blue-50 px-5 py-4 border-b border-blue-100">
            <p className="text-sm font-semibold text-blue-800">Requisito: Usa Safari en tu iPhone</p>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Paso 1 */}
            <div className="p-5 flex gap-4">
              <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Abre <strong>Safari</strong> y entra a <strong>vendet.online</strong></p>
                <p className="text-sm text-gray-500 mt-1">
                  ⚠️ Importante: No funciona con Chrome, Firefox ni otros navegadores en iPhone. <strong>Solo Safari</strong> permite instalar apps.
                </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="p-5 flex gap-4">
              <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Toca el botón <strong>Compartir</strong> (flecha hacia arriba)</p>
                <p className="text-sm text-gray-500 mt-1">
                  Está en la barra de Safari, abajo en la pantalla (en iPhones con Face ID está arriba en la barra).
                </p>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="p-5 flex gap-4">
              <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Desliza hacia abajo hasta ver <strong>"Añadir a pantalla de inicio"</strong></p>
                <p className="text-sm text-gray-500 mt-1">
                  Está un poco más abajo en el menú de compartir. Si no lo ves, desliza más.
                </p>
              </div>
            </div>

            {/* Paso 4 */}
            <div className="p-5 flex gap-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white font-bold text-sm">4</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Toca <strong>"Añadir"</strong> arriba a la derecha</p>
                <p className="text-sm text-gray-500 mt-1">
                  Puedes cambiarle el nombre si quieres. Luego toca <strong>"Añadir"</strong> en la esquina superior derecha. ¡Listo!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ¿Por qué instalar? */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">¿Por qué instalar la app?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 rounded-xl p-5 border border-brand-primary/10">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center mb-3">
              <Smartphone size={16} className="text-brand-accent" />
            </div>
            <p className="font-bold text-gray-900 text-sm">Acceso directo</p>
            <p className="text-xs text-gray-500 mt-1">Un icono en tu pantalla de inicio. Abre con un toque, sin buscar en bookmarks.</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-100">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
              <Download size={16} className="text-white" />
            </div>
            <p className="font-bold text-gray-900 text-sm">Más rápido</p>
            <p className="text-xs text-gray-500 mt-1">Carga sin la barra del navegador. Experiencia similar a una app nativa.</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-5 border border-green-100">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <p className="font-bold text-gray-900 text-sm">Notificaciones push</p>
            <p className="text-xs text-gray-500 mt-1">Recibe alertas de mensajes y nuevas publicaciones sin abrir la app.</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-5 border border-purple-100">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            </div>
            <p className="font-bold text-gray-900 text-sm">Offline</p>
            <p className="text-xs text-gray-500 mt-1">Puedes ver la última página que visitaste incluso sin conexión.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-brand-primary text-white px-8 py-3 rounded-xl font-bold text-base hover:bg-brand-dark transition shadow-lg"
        >
          Ir al marketplace <ArrowDownToLine size={18} />
        </Link>
      </div>
    </div>
  )
}
