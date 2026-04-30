'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle, Zap, Star, X, Copy, Upload, MessageCircle, Loader2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const paquetesCredito = [
  {
    creditos: 2,
    precio: 1,
    descripcion: 'Para empezar',
    popular: false,
  },
  {
    creditos: 15,
    precio: 5,
    descripcion: '¡El más elegido! Mejor relación precio/crédito',
    popular: true,
  },
  {
    creditos: 40,
    precio: 10,
    descripcion: 'Para vendedores activos',
    popular: false,
  },
  {
    creditos: 100,
    precio: 20,
    descripcion: 'Máximo ahorro por crédito',
    popular: false,
  },
]

const metodosPago = [
  {
    id: 'pagomovil',
    nombre: 'Pago Móvil',
    emoji: '📱',
    instrucciones: {
      telefono: '041266443099',
      cedula: 'V-20794917',
      banco: '0134 — Banesco',
      nota: 'Envía el comprobante por WhatsApp después de pagar',
    },
  },
  {
    id: 'binance',
    nombre: 'Binance Pay',
    emoji: '🟡',
    instrucciones: {
      id: '2041475442',
      nota: 'Envía el receipt después del pago por WhatsApp',
    },
  },
  {
    id: 'transferencia',
    nombre: 'Transferencia',
    emoji: '🏦',
    disponible: false,
    instrucciones: {
      nota: 'No operativo actualmente',
    },
  },
]

const WHATSAPP_CONFIRMACION = '584227997043'
const FALLBACK_TASA = 487.12

function ModalPago({ paquete, tasa, onClose }: { paquete: any; tasa: number; onClose: () => void }) {
  const router = useRouter()
  const [metodo, setMetodo] = useState('')
  const [copiado, setCopiado] = useState('')
  const [modoEnvio, setModoEnvio] = useState<'whatsapp' | 'subir' | null>(null)
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null)
  const [comprobantePreview, setComprobantePreview] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [completado, setCompletado] = useState(false)

  const precioBs = (paquete.precio * tasa).toFixed(2)
  const selectedMetodo = metodosPago.find(m => m.id === metodo)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiado(label)
    setTimeout(() => setCopiado(''), 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar 5MB')
      return
    }
    setComprobanteFile(file)
    setComprobantePreview(URL.createObjectURL(file))
  }

  const subirComprobante = async () => {
    if (!comprobanteFile) { alert('Selecciona una imagen del comprobante'); return }
    if (!metodo) { alert('Selecciona un método de pago'); return }

    setEnviando(true)
    try {
      // Verificar que hay sesión
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Redirigir a login con redirect
        const redirect = `/creditos`
        router.push(`/login?redirect=${redirect}`)
        return
      }

      // Subir imagen a Supabase Storage
      const fileExt = comprobanteFile.name.split('.').pop()
      const fileName = `comprobante_${user.id}_${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('comprobantes')
        .upload(fileName, comprobanteFile, { contentType: comprobanteFile.type })

      if (uploadError) {
        alert('Error subiendo comprobante: ' + uploadError.message)
        setEnviando(false)
        return
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('comprobantes')
        .getPublicUrl(fileName)

      // Crear transacción en estado pendiente
      const { error: dbError } = await supabase
        .from('transacciones_creditos')
        .insert({
          user_id: user.id,
          tipo: 'compra',
          monto: paquete.creditos,
          precio_usd: paquete.precio,
          metodo_pago: selectedMetodo?.nombre || metodo,
          comprobante_url: publicUrl,
          estado: 'pendiente',
        })

      if (dbError) {
        alert('Error registrando la transacción: ' + dbError.message)
        setEnviando(false)
        return
      }

      setCompletado(true)
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Error desconocido'))
      setEnviando(false)
    }
  }

  const enviarWhatsApp = () => {
    if (!metodo) { alert('Selecciona un método de pago'); return }
    const msg = encodeURIComponent(
      `Hola, quiero comprar ${paquete.creditos} créditos ($${paquete.precio} USD ≈ Bs. ${precioBs}) por ${selectedMetodo?.nombre}. Te envío el comprobante:`
    )
    window.open(`https://wa.me/${WHATSAPP_CONFIRMACION}?text=${msg}`, '_blank')
    setTimeout(onClose, 500)
  }
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center">
      <div className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{paquete.creditos} créditos — ${paquete.precio} USD</h3>
            <p className="text-sm text-gray-500">≈ Bs. {precioBs}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Paso 1: Elegir método */}
          <div>
            <h4 className="font-bold text-gray-800 mb-3">1. Elige método de pago</h4>
            <div className="grid grid-cols-3 gap-2">
              {metodosPago.map(m => {
                const disp = m.disponible !== false
                return (
                  <button
                    key={m.id}
                    onClick={() => disp && setMetodo(m.id)}
                    disabled={!disp}
                    className={`p-3 rounded-xl border-2 text-center transition ${
                      !disp ? 'opacity-40 cursor-not-allowed border-gray-100 bg-gray-50' :
                      metodo === m.id ? 'border-brand-yellow bg-yellow-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl block">{m.emoji}</span>
                    <span className="text-xs font-medium text-gray-700">{m.nombre}</span>
                    {!disp && <span className="text-[10px] text-gray-400">No disp.</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Paso 2: Datos de pago */}
          {selectedMetodo && selectedMetodo.disponible !== false && (
            <>
              <div>
                <h4 className="font-bold text-gray-800 mb-3">2. Realiza el pago</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  {Object.entries(selectedMetodo.instrucciones).map(([key, value]) => {
                    if (key === 'nota') return (
                      <p key={key} className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                        ⚠️ {value as string}
                      </p>
                    )
                    const labelMap: Record<string, string> = {
                      telefono: 'Teléfono',
                      cedula: 'Cédula',
                      banco: 'Banco',
                      id: 'Binance ID',
                    }
                    const isCopiable = ['telefono', 'cedula', 'id'].includes(key)
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-500">{labelMap[key] || key}</span>
                          <p className="text-sm font-medium text-gray-800">{value as string}</p>
                        </div>
                        {isCopiable && (
                          <button
                            onClick={() => copyToClipboard(value as string, key)}
                            className="text-xs bg-white border rounded-md px-2 py-1 hover:bg-gray-100 transition ml-2"
                          >
                            {copiado === key ? '✓ Copiado' : 'Copiar'}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Paso 3: Elegir cómo enviar */}
              {!modoEnvio && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">3. ¿Cómo quieres enviar el comprobante?</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setModoEnvio('whatsapp')}
                      className="flex items-center gap-3 bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl p-4 hover:bg-[#25D366]/20 transition"
                    >
                      <MessageCircle className="text-[#25D366]" size={24} />
                      <div className="text-left">
                        <p className="font-bold text-gray-800">Por WhatsApp</p>
                        <p className="text-xs text-gray-500">Envía captura directo al admin</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setModoEnvio('subir')}
                      className="flex items-center gap-3 bg-brand-blue/10 border border-brand-blue/30 rounded-xl p-4 hover:bg-brand-blue/20 transition"
                    >
                      <Upload className="text-brand-blue" size={24} />
                      <div className="text-left">
                        <p className="font-bold text-gray-800">Subir aquí</p>
                        <p className="text-xs text-gray-500">Se envía al panel de admin</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Opción WhatsApp */}
              {modoEnvio === 'whatsapp' && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-green-800 font-medium mb-1">✅ Comprobante por WhatsApp</p>
                    <p className="text-xs text-green-700">Toca el botón, abre WhatsApp y envía una captura del pago</p>
                  </div>
                  <button
                    onClick={enviarWhatsApp}
                    className="w-full bg-[#25D366] text-white py-3.5 rounded-xl font-bold hover:brightness-90 transition flex items-center justify-center gap-2"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Abrir WhatsApp
                  </button>
                  <button onClick={() => setModoEnvio(null)} className="w-full text-sm text-gray-400 hover:text-gray-600 transition py-2">← Volver</button>
                </div>
              )}

              {/* Opción Subir comprobante */}
              {modoEnvio === 'subir' && (
                <div className="space-y-4">
                  {completado ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                      <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
                      <p className="font-bold text-green-800 text-lg">¡Comprobante enviado!</p>
                      <p className="text-sm text-green-700 mt-2">Tu transacción está pendiente. Recibirás tus créditos cuando el admin la apruebe.</p>
                      <button onClick={onClose} className="mt-4 bg-brand-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900 transition">Cerrar</button>
                    </div>
                  ) : (
                    <>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-brand-blue transition">
                        <input
                          type="file"
                          accept="image/*"
                          id="comprobante-input"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        {comprobantePreview ? (
                          <div>
                            <img src={comprobantePreview} alt="Comprobante" className="max-h-48 mx-auto rounded-lg mb-3" />
                            <button onClick={() => { setComprobanteFile(null); setComprobantePreview('') }} className="text-sm text-red-500 hover:underline">Quitar imagen</button>
                          </div>
                        ) : (
                          <label htmlFor="comprobante-input" className="cursor-pointer block">
                            <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Toca aquí para subir tu comprobante</p>
                            <p className="text-xs text-gray-400 mt-1">JPG, PNG — máx 5MB</p>
                          </label>
                        )}
                      </div>
                      <button
                        onClick={subirComprobante}
                        disabled={enviando || !comprobanteFile}
                        className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold hover:bg-blue-900 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {enviando ? (
                          <><Loader2 size={18} className="animate-spin" /> Subiendo...</>
                        ) : (
                          <><Upload size={18} /> Enviar comprobante</>
                        )}
                      </button>
                      <button onClick={() => setModoEnvio(null)} className="w-full text-sm text-gray-400 hover:text-gray-600 transition py-2">← Volver</button>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {!metodo && (
            <div className="text-center py-4 text-sm text-gray-400">
              Selecciona un método de pago para continuar ↓
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CreditosPage() {
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState<any>(null)
  const [tasa, setTasa] = useState<number>(FALLBACK_TASA)
  const [tasaCargando, setTasaCargando] = useState(true)

  useEffect(() => {
    fetch('/api/tasa-bcv')
      .then(r => r.json())
      .then(data => {
        if (data.tasa) setTasa(data.tasa)
      })
      .catch(() => {})
      .finally(() => setTasaCargando(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-4">
          Compra créditos y <span className="text-brand-yellow">destaca</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Publicar siempre es <strong>gratis</strong>. Los créditos son opcionales para dar visibilidad a tus publicaciones.
        </p>
      </div>

      {/* ============ ¿QUÉ PUEDES HACER? ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">¿Para qué sirven los créditos?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Boost */}
          <div className="border border-gray-200 rounded-xl p-6 hover:border-brand-yellow transition">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-yellow-50 text-brand-yellow">
                <Zap size={28} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">⚡ Boost — Subir al #1</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Tu publicación sube de posición y aparece <strong>primera</strong> en la lista. Si alguien más hace boost después, le toca el turno a él. El boost es instantáneo.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-brand-blue font-bold text-2xl">1 crédito</span>
                </div>
              </div>
            </div>
          </div>

          {/* Destacado */}
          <div className="border border-gray-200 rounded-xl p-6 hover:border-brand-yellow transition">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-50 text-brand-blue">
                <Star size={28} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">⭐ Destacar — 2 en 1</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Tu publicación aparece en la <strong>página principal</strong> como destacado Y con prioridad en los <strong>resultados de búsqueda</strong>.
                </p>
                <div className="space-y-1 text-sm">
                  <p className="text-brand-blue font-bold">4 créditos → 12 horas</p>
                  <p className="text-brand-blue font-bold">6 créditos → 24 horas</p>
                  <p className="text-brand-blue font-bold">10 créditos → 48 horas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ PAQUETES DE CRÉDITOS ============ */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Elige tu paquete</h2>
        <p className="text-gray-500 text-center mb-2">Cada crédito vale para un boost o contribuye a un destacado</p>
        {tasaCargando ? (
          <p className="text-center text-sm text-gray-400 mb-4 animate-pulse">Cargando tasa BCV...</p>
        ) : (
          <p className="text-center text-sm text-gray-500 mb-4">
            Tasa BCV: <span className="font-bold text-brand-blue">Bs. {tasa.toFixed(2)} por $</span>
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paquetesCredito.map((pkg) => {
            const porCredito = (pkg.precio / pkg.creditos).toFixed(2)
            const precioBs = (pkg.precio * tasa).toFixed(2)
            return (
              <div
                key={pkg.creditos}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition hover:-translate-y-1 ${
                  pkg.popular ? 'border-brand-yellow' : 'border-transparent'
                }`}
              >
                {pkg.popular && (
                  <div className="bg-brand-yellow text-brand-blue text-center py-1.5 text-xs font-bold">
                    ⭐ MÁS POPULAR
                  </div>
                )}
                <div className="bg-gradient-to-br from-brand-blue to-blue-800 p-6 text-white text-center">
                  <p className="text-5xl font-black">{pkg.creditos}</p>
                  <p className="text-sm opacity-80">créditos</p>
                </div>
                <div className="p-6 text-center">
                  <p className="text-3xl font-black text-gray-800 mb-1">
                    ${pkg.precio} <span className="text-sm font-normal text-gray-500">USD</span>
                  </p>
                  <p className="text-sm text-gray-400 mb-4">≈ Bs. {precioBs}</p>
                  <p className="text-xs text-gray-500 mb-5 bg-gray-50 rounded-lg py-1 px-2 inline-block">
                    ${porCredito} por crédito
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                    <li className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                      <strong>{pkg.creditos}</strong> boost(s) al #1
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                      o {Math.floor(pkg.creditos / 4)}× destacado 12h aproximadamente
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                      Sin expiración
                    </li>
                  </ul>
                  <button
                    onClick={() => setPaqueteSeleccionado(pkg)}
                    className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition cursor-pointer"
                  >
                    Comprar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ============ TABLA COMPARATIVA ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">💡 ¿Cuántos créditos necesitas?</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700 font-bold">Acción</th>
                <th className="text-center py-3 px-4 text-gray-700 font-bold">Costo</th>
                <th className="text-center py-3 px-4 text-gray-700 font-bold">Resultado</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 flex items-center gap-2">
                  <Zap size={16} className="text-yellow-500" /> Boost (subir al #1)
                </td>
                <td className="py-3 px-4 text-center font-bold text-brand-blue">1 crédito</td>
                <td className="py-3 px-4 text-center text-gray-500">Instantáneo, se mueve con el tiempo</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 flex items-center gap-2">
                  <Star size={16} className="text-brand-blue" /> Destacado 12h
                </td>
                <td className="py-3 px-4 text-center font-bold text-brand-blue">4 créditos</td>
                <td className="py-3 px-4 text-center text-gray-500">Home + búsqueda prioritaria</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 flex items-center gap-2">
                  <Star size={16} className="text-brand-blue" /> Destacado 24h
                </td>
                <td className="py-3 px-4 text-center font-bold text-brand-blue">6 créditos</td>
                <td className="py-3 px-4 text-center text-gray-500">Home + búsqueda prioritaria</td>
              </tr>
              <tr>
                <td className="py-3 px-4 flex items-center gap-2">
                  <Star size={16} className="text-brand-blue" /> Destacado 48h
                </td>
                <td className="py-3 px-4 text-center font-bold text-brand-blue">10 créditos</td>
                <td className="py-3 px-4 text-center text-gray-500">Home + búsqueda prioritaria</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ============ MÉTODOS DE PAGO ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Métodos de pago aceptados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[
            { nombre: 'Pago Móvil', emoji: '📱', ok: true },
            { nombre: 'Binance Pay', emoji: '🟡', ok: true },
            { nombre: 'Transferencia', emoji: '🏦', ok: false },
            { nombre: 'Zelle', emoji: '💵', ok: false },
            { nombre: 'PayPal', emoji: '🅿️', ok: false },
          ].map((m) => (
            <div key={m.nombre} className={`rounded-xl p-4 text-center ${m.ok ? 'bg-gray-50' : 'bg-gray-50 opacity-50'}`}>
              <span className="text-3xl block mb-2">{m.emoji}</span>
              <p className="text-sm font-medium text-gray-800">{m.nombre}</p>
              {!m.ok && <p className="text-[10px] text-gray-400 mt-1">No operativo</p>}
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
          <h3 className="font-bold text-brand-blue text-sm mb-2">ℹ️ Cómo funciona el pago</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Selecciona tu paquete de créditos</li>
            <li>Realiza el pago por tu método preferido</li>
            <li>Envía el comprobante por WhatsApp</li>
            <li>Recibirás tus créditos al confirmar (horario 8am-10pm VET)</li>
          </ol>
        </div>
      </div>

      {/* Modal de pago */}
      {paqueteSeleccionado && (
        <ModalPago
          paquete={paqueteSeleccionado}
          tasa={tasa}
          onClose={() => setPaqueteSeleccionado(null)}
        />
      )}
    </div>
  )
}
