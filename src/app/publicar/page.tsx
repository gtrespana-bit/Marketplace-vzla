'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { categoriasData } from '@/lib/categorias'
import { Camera, X, UploadCloud, AlertCircle, Phone, Mail, MapPin, MessageSquare } from 'lucide-react'

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 30 }, (_, i) => String(currentYear - i))
const estadosProducto = ['Nuevo', 'Como nuevo', 'Bueno', 'Usado']
const estadosVenezuela = [
  'Distrito Capital', 'Miranda', 'Carabobo', 'Lara', 'Zulia',
  'Aragua', 'Anzoategui', 'Bolivar', 'Merida', 'Tachira',
  'Trujillo', 'Portuguesa', 'Barinas', 'Apure', 'Guarico',
  'Cojedes', 'Yaracuy', 'Sucre', 'Monagas', 'Nueva Esparta',
  'Amazonas', 'Delta Amacuro', 'Vargas',
]

interface ImageFile {
  file: File
  preview: string
  uploadedUrl?: string
  uploading?: boolean
  error?: boolean
}

export default function PublicarPage() {
  const { session, user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState('')
  const [subcategoria, setSubcategoria] = useState('')
  const [marca, setMarca] = useState('')
  const [estadoProd, setEstadoProd] = useState('')
  const [precioUsd, setPrecioUsd] = useState('')
  const [ubicacionEstado, setUbicacionEstado] = useState('')
  const [ubicacionCiudad, setUbicacionCiudad] = useState('')
  const [imagenes, setImagenes] = useState<ImageFile[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [specs, setSpecs] = useState<Record<string, string>>({})
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactWhatsApp, setContactWhatsApp] = useState('')
  const [contactMessenger, setContactMessenger] = useState('')

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/login')
    }
  }, [authLoading, session, router])

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      imagenes.forEach(img => {
        if (img.preview.startsWith('blob:')) URL.revokeObjectURL(img.preview)
      })
    }
  }, [])

  if (authLoading) return <div className="min-h-[60vh] flex items-center justify-center"><p>Cargando...</p></div>
  if (!session) return null

  const cat = categoriasData[categoria]
  const sub = cat?.subs.find(s => s.label === subcategoria)

  const camposEspeciales = sub?.campos.map(c => ({
    ...c,
    options: c.label === 'Ano' ? years : (c.options || []),
  })) || []

  const handleCatChange = (val: string) => {
    setCategoria(val); setSubcategoria(''); setMarca(''); setSpecs({})
  }
  const handleSubChange = (val: string) => {
    setSubcategoria(val); setMarca(''); setSpecs({})
  }
  const handleSpecChange = (label: string, value: string) => {
    setSpecs(prev => ({ ...prev, [label]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const maxFiles = 10 - imagenes.length
    if (maxFiles <= 0) return

    const newImages: ImageFile[] = []
    for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue
      newImages.push({
        file,
        preview: URL.createObjectURL(file),
      })
    }
    setImagenes(prev => [...prev, ...newImages])
  }

  const removeImage = (i: number) => {
    const img = imagenes[i]
    if (img.preview.startsWith('blob:')) URL.revokeObjectURL(img.preview)
    setImagenes(prev => prev.filter((_, idx) => idx !== i))
  }

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = []
    const userId = user?.id

    for (let i = 0; i < imagenes.length; i++) {
      const img = imagenes[i]
      // Mark as uploading
      setImagenes(prev => prev.map((p, idx) => idx === i ? { ...p, uploading: true } : p))

      const fileName = `${userId}/${Date.now()}_${i}_${img.file.name}`.replace(/\s+/g, '_')

      const { data, error: uploadError } = await supabase.storage
        .from('productos')
        .upload(fileName, img.file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setImagenes(prev => prev.map((p, idx) => idx === i ? { ...p, error: true } : p))
        continue
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('productos')
        .getPublicUrl(data.path)

      urls.push(urlData.publicUrl)
      setImagenes(prev => prev.map((p, idx) => idx === i ? { ...p, uploadedUrl: urlData.publicUrl, uploading: false } : p))
      setUploadProgress(Math.round(((i + 1) / imagenes.length) * 100))
    }

    return urls
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    if (!isSupabaseConfigured()) {
      setError('Supabase no esta configurado. Agrega las variables de entorno.')
      setLoading(false)
      return
    }

    try {
      // Upload images first
      let imagenUrl: string | null = null
      let imagenesArray: string[] = []

      if (imagenes.length > 0) {
        setUploadProgress(0)
        imagenesArray = await uploadImages()
        if (imagenesArray.length > 0) {
          imagenUrl = imagenesArray[0] // Use first as cover
        }
      }

      // Get categoria_id
      const { data: catData } = await supabase
        .from('categorias')
        .select('id')
        .eq('nombre', categoria)
        .single()

      // Build metodos_contacto JSON
      const metodosContacto: Record<string, any> = {}
      if (contactEmail) metodosContacto.email = contactEmail
      if (contactPhone) metodosContacto.telefono = contactPhone
      if (contactWhatsApp) metodosContacto.whatsapp = contactWhatsApp
      if (contactMessenger) metodosContacto.messenger = contactMessenger

      // Insert product
      const { error: dbError, data: producto } = await supabase
        .from('productos')
        .insert({
          user_id: user?.id,
          titulo,
          descripcion,
          categoria_id: catData?.id || null,
          subcategoria,
          marca: marca || null,
          estado: estadoProd,
          precio_usd: parseFloat(precioUsd) || null,
          ubicacion_estado: ubicacionEstado,
          ubicacion_ciudad: ubicacionCiudad,
          imagen_url: imagenUrl,
          imagenes: imagenesArray,
          metodos_contacto: Object.keys(metodosContacto).length > 0 ? metodosContacto : null,
          activo: true,
          destacado: false,
        })
        .select()
        .single()

      if (dbError) {
        console.error('DB error:', dbError)
        setError('Error al guardar: ' + dbError.message)
      } else {
        router.push(`/producto/${producto.id}?nuevo=1`)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Error inesperado, intentalo de nuevo.')
    }

    setLoading(false)
  }

  const canGoToStep2 = categoria && subcategoria
  const canGoToStep3 = titulo && descripcion && estadoProd && precioUsd

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Publicar algo</h1>
      <p className="text-gray-500 mb-8">Completa la informacion. Es gratis.</p>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {[{ num: 1, label: 'Categoria' }, { num: 2, label: 'Detalles' }, { num: 3, label: 'Fotos' }, { num: 4, label: 'Revisar' }].map(s => (
          <div key={s.num} className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setStep(s.num)} className={`w-10 h-10 rounded-full font-bold text-sm transition ${step >= s.num ? 'bg-brand-blue text-white' : 'bg-gray-200 text-gray-500'}`}>{s.num}</button>
            <span className={`text-sm font-medium hidden sm:inline ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
            {s.num < 4 && <div className={`w-6 sm:w-8 h-0.5 ${step > s.num ? 'bg-brand-blue' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">

        {/* PASO 1: Categoria → Subcategoria → Marca */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900">Que quieres publicar?</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Categoria</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(categoriasData).map(([key, cfg]) => (
                  <button key={key} onClick={() => handleCatChange(key)} className={`p-4 rounded-xl border-2 text-center transition ${categoria === key ? 'border-brand-blue bg-blue-50' : 'border-gray-200 hover:border-brand-yellow'}`}>
                    <span className="text-3xl block mb-2">{cfg.icon}</span>
                    <span className="text-sm font-bold text-gray-800">{cfg.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {cat && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Tipo</label>
                  <select value={subcategoria} onChange={e => handleSubChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-800">
                    <option value="">Selecciona...</option>
                    {cat.subs.map(s => <option key={s.label} value={s.label}>{s.icon} {s.label}</option>)}
                  </select>
                </div>
                {subcategoria && sub?.marcas.length && sub.marcas.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Marca</label>
                    <input type="text" value={marca} onChange={e => setMarca(e.target.value)} placeholder="Escribe la marca..." list={`pub-${categoria}-marcas`} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 bg-white" />
                    <datalist id={`pub-${categoria}-marcas`}>{sub.marcas.map(m => <option key={m} value={m} />)}</datalist>
                  </div>
                )}
              </>
            )}

            <button onClick={() => setStep(2)} disabled={!canGoToStep2} className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition disabled:opacity-50">Siguiente</button>
          </div>
        )}

        {/* PASO 2: Detalles */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900">Detalles del producto</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Titulo</label>
              <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Describe tu producto claramente..." maxLength={100} required className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 bg-white" />
              <p className="text-xs text-gray-500 mt-1">{titulo.length}/100</p>
            </div>

            {camposEspeciales.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200">
                <h3 className="font-bold text-gray-900">Especificaciones — {subcategoria}</h3>
                {camposEspeciales.map(campo => (
                  <div key={campo.label}>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">{campo.label}</label>
                    {campo.type === 'select' ? (
                      <select value={specs[campo.label] || ''} onChange={e => handleSpecChange(campo.label, e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-800">
                        <option value="">{campo.placeholder}</option>
                        {campo.options?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={campo.type} value={specs[campo.label] || ''} onChange={e => handleSpecChange(campo.label, e.target.value)} placeholder={campo.placeholder} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 bg-white" />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Descripcion</label>
              <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={5} maxLength={2000} required className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 resize-none bg-white" placeholder="Describe el estado, caracteristicas, accesorios incluidos..." />
              <p className="text-xs text-gray-500 mt-1">{descripcion.length}/2000</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Estado</label>
              <div className="grid grid-cols-2 gap-2">
                {estadosProducto.map(e => (
                  <button key={e} onClick={() => setEstadoProd(e)} className={`px-4 py-3 rounded-lg text-sm font-medium border transition ${estadoProd === e ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-gray-700 border-gray-200 hover:border-brand-yellow'}`}>{e}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Precio (USD)</label>
              <input type="number" value={precioUsd} onChange={e => setPrecioUsd(e.target.value)} placeholder="Ej: 250" min="0" step="0.01" required className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 bg-white" />
              <p className="text-xs text-gray-500 mt-1">Se muestra en USD y equivalente en Bs.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Estado</label>
                <select value={ubicacionEstado} onChange={e => setUbicacionEstado(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-3 bg-white text-gray-800">
                  <option value="">Estado...</option>
                  {estadosVenezuela.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Ciudad</label>
                <input type="text" value={ubicacionCiudad} onChange={e => setUbicacionCiudad(e.target.value)} placeholder="Ciudad" required className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-800 bg-white" />
              </div>
            </div>

            {/* Metodos de contacto por publicacion */}
            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <MapPin size={18} />
                Como te contactan en esta publicacion?
              </h3>
              <p className="text-xs text-gray-500">Los metodos de contacto son por publicacion. Elige los que quieras mostrar a los compradores.</p>

              <div className="space-y-3">
                {/* WhatsApp */}
                <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-3">
                  <input type="checkbox" id="useWhatsApp" checked={!!contactWhatsApp} onChange={e => setContactWhatsApp(e.target.checked ? '+' : '')} className="mt-1 rounded text-brand-blue" />
                  <label htmlFor="useWhatsApp" className="flex-1">
                    <span className="text-sm font-medium flex items-center gap-1.5">💚 WhatsApp</span>
                    {contactWhatsApp && <input type="tel" value={contactWhatsApp} onChange={e => setContactWhatsApp(e.target.value)} placeholder="+58 412 1234567" className="mt-1 w-full border border-gray-200 rounded px-2 py-1.5 text-sm" />}
                  </label>
                </div>

                {/* Telefono */}
                <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-3">
                  <input type="checkbox" id="usePhone" checked={!!contactPhone} onChange={e => setContactPhone(e.target.checked ? '+' : '')} className="mt-1 rounded text-brand-blue" />
                  <label htmlFor="usePhone" className="flex-1">
                    <span className="text-sm font-medium flex items-center gap-1.5"><Phone size={14} /> Llamadas</span>
                    {contactPhone && <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+58 412 1234567" className="mt-1 w-full border border-gray-200 rounded px-2 py-1.5 text-sm" />}
                  </label>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-3">
                  <input type="checkbox" id="useEmail" checked={!!contactEmail} onChange={e => setContactEmail(e.target.checked ? '+' : '')} className="mt-1 rounded text-brand-blue" />
                  <label htmlFor="useEmail" className="flex-1">
                    <span className="text-sm font-medium flex items-center gap-1.5"><Mail size={14} /> Email</span>
                    {contactEmail && <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="tu@email.com" className="mt-1 w-full border border-gray-200 rounded px-2 py-1.5 text-sm" />}
                  </label>
                </div>

                {/* Messenger */}
                <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-3">
                  <input type="checkbox" id="useMessenger" checked={!!contactMessenger} onChange={e => setContactMessenger(e.target.checked ? '+' : '')} className="mt-1 rounded text-brand-blue" />
                  <label htmlFor="useMessenger" className="flex-1">
                    <span className="text-sm font-medium flex items-center gap-1.5"><MessageSquare size={14} /> Facebook Messenger</span>
                    {contactMessenger && <input type="url" value={contactMessenger} onChange={e => setContactMessenger(e.target.value)} placeholder="https://m.me/tuusuario" className="mt-1 w-full border border-gray-200 rounded px-2 py-1.5 text-sm" />}
                  </label>
                </div>
              </div>

              {/* Chat interno siempre activo */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MessageSquare size={12} />
                <span>Chat interno activado automaticamente</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-6 py-3 rounded-lg font-medium border border-gray-200 hover:bg-gray-50"> atras</button>
              <button onClick={() => setStep(3)} disabled={!canGoToStep3} className="flex-1 bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition disabled:opacity-50">Siguiente</button>
            </div>
          </div>
        )}

        {/* PASO 3: Fotos */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900">Anade fotos</h2>
            <p className="text-sm text-gray-500">Sube hasta 10 fotos. La primera sera la portada.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {imagenes.map((img, i) => (
                <div key={i} className="aspect-square relative rounded-lg overflow-hidden group border border-gray-200">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  {i === 0 && img.uploadedUrl && <span className="absolute top-1 left-1 bg-brand-yellow text-brand-blue text-[10px] font-bold px-1.5 py-0.5 rounded">Portada</span>}
                  {img.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {img.error && (
                    <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                      <X size={20} className="text-white" />
                    </div>
                  )}
                  {!img.uploading && (
                    <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              {imagenes.length < 10 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand-yellow hover:bg-yellow-50 transition">
                  <Camera size={24} className="text-gray-400" /><span className="text-xs text-gray-500 mt-1">Anadir</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            {loading && imagenes.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Subiendo imagenes: {uploadProgress}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-brand-blue h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-6 py-3 rounded-lg font-medium border border-gray-200 hover:bg-gray-50"> atras</button>
              <button onClick={() => setStep(4)} className="flex-1 bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition">Revisar</button>
            </div>
          </div>
        )}

        {/* PASO 4: Revisar */}
        {step === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900">Revisa tu publicacion</h2>
            <div className="border rounded-lg p-5 space-y-3">
              {imagenes.length > 0 && <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden"><img src={imagenes[0].preview} alt="" className="w-full h-full object-cover" /></div>}
              <h3 className="text-lg font-bold text-gray-900">{titulo}</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Categoria:</span> {categoria} → {subcategoria}</p>
                {marca && <p><span className="text-gray-500">Marca:</span> {marca}</p>}
                {Object.entries(specs).filter(([,v]) => v).map(([k,v]) => <p key={k}><span className="text-gray-500">{k}:</span> {v}</p>)}
                <p><span className="text-gray-500">Estado:</span> {estadoProd}</p>
                <p><span className="text-gray-500">Precio:</span> <strong className="text-brand-blue text-lg">${precioUsd}</strong></p>
                <p><span className="text-gray-500">Ubicacion:</span> {ubicacionCiudad}, {ubicacionEstado}</p>
              </div>

              {/* Metodos contacto resumen */}
              {(contactEmail || contactPhone || contactWhatsApp || contactMessenger) && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Metodos de contacto:</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {contactEmail && <span className="bg-white px-2 py-1 rounded border">📧 {contactEmail}</span>}
                    {contactPhone && <span className="bg-white px-2 py-1 rounded border">📞 {contactPhone}</span>}
                    {contactWhatsApp && <span className="bg-white px-2 py-1 rounded border">💚 WhatsApp</span>}
                    {contactMessenger && <span className="bg-white px-2 py-1 rounded border">👤 Messenger</span>}
                    <span className="bg-white px-2 py-1 rounded border">💬 Chat interno</span>
                  </div>
                </div>
              )}

              <div className="mt-4 p-4 bg-gray-50 rounded-lg"><p className="text-sm text-gray-600"><strong>Descripcion:</strong></p><p className="text-sm text-gray-700 mt-1">{descripcion}</p></div>
            </div>

            {loading && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Publicando: {uploadProgress}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-brand-blue h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="px-6 py-3 rounded-lg font-medium border border-gray-200 hover:bg-gray-50">Editar</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-brand-yellow text-brand-blue py-3 rounded-lg font-bold hover:bg-yellow-400 transition disabled:opacity-50">{loading ? 'Publicando...' : 'Publicar gratis'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
