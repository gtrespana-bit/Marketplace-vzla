'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { categoriasData } from '@/lib/categorias'
import { Camera, X, ArrowLeft, Save, AlertCircle, Trash2 } from 'lucide-react'

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

export default function EditarPage() {
  const params = useParams()
  const router = useRouter()
  const { user, session, loading } = useAuth()
  const productoId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState('')
  const [subcategoria, setSubcategoria] = useState('')
  const [marca, setMarca] = useState('')
  const [estadoProd, setEstadoProd] = useState('')
  const [precioUsd, setPrecioUsd] = useState('')
  const [ubicacionEstado, setUbicacionEstado] = useState('')
  const [ubicacionCiudad, setUbicacionCiudad] = useState('')
  const [activo, setActivo] = useState(true)
  const [specs, setSpecs] = useState<Record<string, string>>({})

  // Contact methods
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactWhatsApp, setContactWhatsApp] = useState('')
  const [contactMessenger, setContactMessenger] = useState('')
  const [showEmail, setShowEmail] = useState(false)
  const [showPhone, setShowPhone] = useState(false)
  const [showWhatsApp, setShowWhatsApp] = useState(false)
  const [showMessenger, setShowMessenger] = useState(false)

  // Images
  const [currentImages, setCurrentImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<{ file: File; preview: string }[]>([])

  useEffect(() => {
    if (loading) return
    if (!user) { router.push('/login'); return }
    if (!productoId) return

    async function load() {
      const { data: prod } = await supabase
        .from('productos')
        .select('*')
        .eq('id', productoId)
        .single()

      if (!prod) { setError('No encontrado'); setLoading(false); return }
      if (user && prod.user_id !== user.id) { setError('No tienes permiso'); setLoading(false); return }

      // Find category name
      const { data: cat } = await supabase.from('categorias').select('nombre').eq('id', prod.categoria_id).single()

      setTitulo(prod.titulo)
      setDescripcion(prod.descripcion || '')
      setCategoria(cat?.nombre || '')
      setSubcategoria(prod.subcategoria || '')
      setMarca(prod.marca || '')
      setEstadoProd(prod.estado || '')
      setPrecioUsd(prod.precio_usd?.toString() || '')
      setUbicacionEstado(prod.ubicacion_estado || '')
      setUbicacionCiudad(prod.ubicacion_ciudad || '')
      setActivo(prod.activo)
      setCurrentImages(prod.imagenes?.length ? prod.imagenes : (prod.imagen_url ? [prod.imagen_url] : []))

      // Load contact methods
      const mc = prod.metodos_contacto || {}
      setContactEmail(mc.email || '')
      setContactPhone(mc.telefono || '')
      setContactWhatsApp(mc.whatsapp || '')
      setContactMessenger(mc.messenger || '')
      setShowEmail(!!mc.email)
      setShowPhone(!!mc.telefono)
      setShowWhatsApp(!!mc.whatsapp)
      setShowMessenger(!!mc.messenger)

      // Load specs from categoria
      const catData = categoriasData[cat?.nombre]
      const sub = catData?.subs.find(s => s.label === prod.subcategoria)
      const campos = sub?.campos?.map((c: any) => ({ ...c, options: c.label === 'Ano' ? years : (c.options || []) })) || []

      const existingSpecs: Record<string, string> = {}
      campos.forEach((campo: any) => {
        existingSpecs[campo.label] = prod.especificaciones?.[campo.label] || ''
      })
      setSpecs(existingSpecs)

      setLoading(false)
    }
    load()
  }, [productoId, user])

  if (!session) return null

  const handleSubmit = async () => {
    setGuardando(true)
    setError('')
    setSuccess('')

    if (!isSupabaseConfigured()) { setError('Supabase no configurado'); setGuardando(false); return }

    try {
      // Upload new images
      let uploadedUrls = [...currentImages]
      if (newImages.length > 0) {
        for (const img of newImages) {
          const fileName = `${user?.id}/${Date.now()}_${img.file.name}`.replace(/\s+/g, '_')
          const { data, error: uploadError } = await supabase.storage
            .from('productos')
            .upload(fileName, img.file, { cacheControl: '3600' })
          if (!uploadError) {
            const { data: urlData } = supabase.storage.from('productos').getPublicUrl(data.path)
            uploadedUrls.push(urlData.publicUrl)
          }
        }
      }

      // Build contact methods
      const metodosContacto: Record<string, any> = {}
      if (showEmail && contactEmail) metodosContacto.email = contactEmail
      if (showPhone && contactPhone) metodosContacto.telefono = contactPhone
      if (showWhatsApp && contactWhatsApp) metodosContacto.whatsapp = contactWhatsApp
      if (showMessenger && contactMessenger) metodosContacto.messenger = contactMessenger

      // Get category id
      const { data: catData } = await supabase.from('categorias').select('id').eq('nombre', categoria).single()

      // Build updates
      const updates: Record<string, any> = {
        titulo,
        descripcion,
        categoria_id: catData?.id || null,
        subcategoria,
        marca: marca || null,
        estado: estadoProd,
        precio_usd: parseFloat(precioUsd) || null,
        ubicacion_estado: ubicacionEstado,
        ubicacion_ciudad: ubicacionCiudad,
        activo,
        imagen_url: uploadedUrls[0] || null,
        imagenes: uploadedUrls,
        especificaciones: Object.keys(specs).length > 0 ? specs : null,
        metodos_contacto: Object.keys(metodosContacto).length > 0 ? metodosContacto : null,
      }

      const { error: dbError } = await supabase.from('productos').update(updates).eq('id', productoId)

      if (dbError) {
        setError('Error al guardar: ' + dbError.message)
      } else {
        setSuccess('Guardado correctamente')
        setTimeout(() => router.push(`/producto/${productoId}`), 1500)
      }
    } catch (err) {
      setError('Error inesperado')
    }
    setGuardando(false)
  }

  const handleEliminar = async () => {
    if (!confirm('¿Eliminar permanentemente?')) return
    setEliminando(true)
    await supabase.from('productos').delete().eq('id', productoId)
    router.push('/dashboard')
  }

  const cat = categoriasData[categoria]
  const sub = cat?.subs.find(s => s.label === subcategoria)
  const camposEspeciales = sub?.campos?.map((c: any) => ({ ...c, options: c.label === 'Ano' ? years : (c.options || []) })) || []

  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.startsWith('image/')) {
        setNewImages(prev => [...prev, { file, preview: URL.createObjectURL(file) }])
      }
    }
  }

  const removeNewImage = (i: number) => setNewImages(prev => prev.filter((_, idx) => idx !== i))
  const removeCurrentImage = (i: number) => setCurrentImages(prev => prev.filter((_, idx) => idx !== i))

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12 text-center"><p>Cargando...</p></div>
  if (error && !titulo) return <div className="max-w-3xl mx-auto px-4 py-12 text-center"><h2 className="text-2xl font-bold mb-4">{error}</h2><button onClick={() => router.push('/dashboard')} className="bg-brand-blue text-white px-6 py-2 rounded-lg">Volver</button></div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 text-sm">
        <ArrowLeft size={16} /> Volver
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Editar publicación</h1>
      <p className="text-gray-500 mb-6">Modifica los campos que necesites</p>

      {/* Alerts */}
      {error && <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm"><AlertCircle size={18} /> {error}</div>}
      {success && <div className="flex items-center gap-2 bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">✅ {success}</div>}

      <div className="bg-white rounded-2xl shadow-sm p-6 border space-y-5">
        {/* Título */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">Título</label>
          <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={100} className="w-full border rounded-lg px-4 py-3" />
          <p className="text-xs text-gray-500 mt-1">{titulo.length}/100</p>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">Descripción</label>
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={4} className="w-full border rounded-lg px-4 py-3 resize-none" />
        </div>

        {/* Precio + Estado + Categoria/Sub */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Precio (USD)</label>
            <input type="number" value={precioUsd} onChange={e => setPrecioUsd(e.target.value)} className="w-full border rounded-lg px-4 py-3" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Condición</label>
            <select value={estadoProd} onChange={e => setEstadoProd(e.target.value)} className="w-full border rounded-lg px-4 py-3 bg-white">
              <option value="">Selecciona...</option>
              {estadosProducto.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Categoría</label>
            <select value={categoria} onChange={e => { setCategoria(e.target.value); setSubcategoria('') }} className="w-full border rounded-lg px-4 py-3 bg-white">
              <option value="">...</option>
              {Object.entries(categoriasData).map(([k, v]: any) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Subcategoría</label>
            <select value={subcategoria} onChange={e => setSubcategoria(e.target.value)} disabled={!categoria} className="w-full border rounded-lg px-4 py-3 bg-white disabled:bg-gray-100">
              <option value="">...</option>
              {cat?.subs.map((s: any) => <option key={s.label} value={s.label}>{s.icon} {s.label}</option>)}
            </select>
          </div>
        </div>

        {marca && <div><label className="block text-sm font-semibold text-gray-900 mb-1.5">Marca</label><input type="text" value={marca} onChange={e => setMarca(e.target.value)} className="w-full border rounded-lg px-4 py-3" /></div>}

        {/* Campos especiales */}
        {camposEspeciales.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-gray-900">Especificaciones</h3>
            {camposEspeciales.map((campo: any) => (
              <div key={campo.label}>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">{campo.label}</label>
                {campo.type === 'select' ? (
                  <select value={specs[campo.label] || ''} onChange={e => setSpecs(p => ({ ...p, [campo.label]: e.target.value }))} className="w-full border rounded-lg px-3 py-2 bg-white">
                    <option value="">Seleccionar...</option>
                    {(campo.options || []).map((o: string) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type="text" value={specs[campo.label] || ''} onChange={e => setSpecs(p => ({ ...p, [campo.label]: e.target.value }))} className="w-full border rounded-lg px-3 py-2" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Ubicación */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Estado</label>
            <select value={ubicacionEstado} onChange={e => setUbicacionEstado(e.target.value)} className="w-full border rounded-lg px-4 py-3 bg-white">
              <option value="">Estado...</option>
              {estadosVenezuela.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Ciudad</label>
            <input type="text" value={ubicacionCiudad} onChange={e => setUbicacionCiudad(e.target.value)} className="w-full border rounded-lg px-4 py-3" />
          </div>
        </div>

        {/* Métodos de contacto */}
        <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-5 space-y-3">
          <h3 className="font-bold text-gray-900">Métodos de contacto</h3>

          {showWhatsApp ? (
            <div className="bg-white border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">💚 WhatsApp</span>
                <button type="button" onClick={() => setShowWhatsApp(false)} className="text-red-500 text-xs hover:underline">Quitar</button>
              </div>
              <input type="tel" value={contactWhatsApp} onChange={e => setContactWhatsApp(e.target.value)} placeholder="+58 412 1234567" className="mt-2 w-full border rounded px-2 py-1.5 text-sm" />
            </div>
          ) : (
            <label className="flex items-center gap-3 bg-white border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
              <input type="checkbox" onChange={() => { setShowWhatsApp(true); setContactWhatsApp('+58 ') }} className="rounded" />
              <span className="text-sm">💚 WhatsApp</span>
            </label>
          )}

          {showPhone ? (
            <div className="bg-white border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">📞 Teléfono</span>
                <button type="button" onClick={() => setShowPhone(false)} className="text-red-500 text-xs hover:underline">Quitar</button>
              </div>
              <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+58 412 1234567" className="mt-2 w-full border rounded px-2 py-1.5 text-sm" />
            </div>
          ) : (
            <label className="flex items-center gap-3 bg-white border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
              <input type="checkbox" onChange={() => { setShowPhone(true); setContactPhone('+58 ') }} className="rounded" />
              <span className="text-sm">📞 Teléfono</span>
            </label>
          )}

          {showEmail ? (
            <div className="bg-white border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">📧 Email</span>
                <button type="button" onClick={() => setShowEmail(false)} className="text-red-500 text-xs hover:underline">Quitar</button>
              </div>
              <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="tu@email.com" className="mt-2 w-full border rounded px-2 py-1.5 text-sm" />
            </div>
          ) : (
            <label className="flex items-center gap-3 bg-white border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
              <input type="checkbox" onChange={() => setShowEmail(true)} className="rounded" />
              <span className="text-sm">📧 Email</span>
            </label>
          )}

          {showMessenger ? (
            <div className="bg-white border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">💬 Messenger</span>
                <button type="button" onClick={() => setShowMessenger(false)} className="text-red-500 text-xs hover:underline">Quitar</button>
              </div>
              <input type="url" value={contactMessenger} onChange={e => setContactMessenger(e.target.value)} placeholder="https://m.me/tuusuario" className="mt-2 w-full border rounded px-2 py-1.5 text-sm" />
            </div>
          ) : (
            <label className="flex items-center gap-3 bg-white border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
              <input type="checkbox" onChange={() => { setShowMessenger(true); setContactMessenger('https://m.me/') }} className="rounded" />
              <span className="text-sm">💬 Facebook Messenger</span>
            </label>
          )}
        </div>

        {/* Imágenes actuales */}
        {currentImages.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Imágenes actuales</label>
            <div className="grid grid-cols-4 gap-2">
              {currentImages.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeCurrentImage(i)} className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition"><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agregar nuevas imágenes */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Agregar imágenes</label>
          <label className="flex items-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-brand-yellow transition">
            <Camera size={20} className="text-gray-400" />
            <span className="text-sm text-gray-500">Seleccionar fotos...</span>
            <input type="file" accept="image/*" multiple onChange={handleNewImages} className="hidden" />
          </label>
          {newImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {newImages.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeNewImage(i)} className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white"><X size={12} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activo/Pausado */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} className="rounded" />
            <span className="text-sm font-medium">Publicación {activo ? 'activa' : 'pausada'}</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t">
          <button onClick={handleSubmit} disabled={guardando} className="flex items-center gap-2 bg-brand-yellow text-brand-blue px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition disabled:opacity-50">
            <Save size={16} /> {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button onClick={() => router.push(`/producto/${productoId}`)} className="px-4 py-3 border rounded-lg hover:bg-gray-50">Cancelar</button>
          <button onClick={handleEliminar} disabled={eliminando} className="flex items-center gap-2 ml-auto text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-lg transition disabled:opacity-50">
            <Trash2 size={16} /> {eliminando ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
