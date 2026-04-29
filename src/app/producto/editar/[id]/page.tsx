'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { categoriasData } from '@/lib/categorias'
import { Camera, X, ArrowLeft, AlertCircle, UploadCloud } from 'lucide-react'

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

export default function EditarProductoPage() {
  const { user, session, loading: authLoading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const productId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState('')
  const [subcategoria, setSubcategoria] = useState('')
  const [marca, setMarca] = useState('')
  const [estadoProd, setEstadoProd] = useState('')
  const [precioUsd, setPrecioUsd] = useState('')
  const [ubicacionEstado, setUbicacionEstado] = useState('')
  const [ubicacionCiudad, setUbicacionCiudad] = useState('')
  const [specs, setSpecs] = useState<Record<string, string>>({})
  const [imagenes, setImagenes] = useState<Array<{ preview: string; file?: File; uploadedUrl?: string; uploading?: boolean }>>([])
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    if (!authLoading && !session) router.push('/login')
  }, [authLoading, session, router])

  useEffect(() => {
    if (!productId || !user) return
    async function load() {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', productId)
        .eq('user_id', user!.id)
        .single()

      if (error || !data) {
        setError(data ? 'No encontrado' : 'Error al cargar el producto')
        setLoading(false)
        return
      }

      setTitulo(data.titulo || '')
      setDescripcion(data.descripcion || '')
      setCategoria(data.categoria || '')
      setSubcategoria(data.subcategoria || '')
      setMarca(data.marca || '')
      setEstadoProd(data.estado || '')
      setPrecioUsd(String(data.precio_usd || ''))
      setUbicacionEstado(data.ubicacion_estado || '')
      setUbicacionCiudad(data.ubicacion_ciudad || '')
      if (data.imagen_url) {
        setImagenes([{ preview: data.imagen_url, uploadedUrl: data.imagen_url }])
      }
      setLoading(false)
    }
    load()
  }, [productId, user])

  if (authLoading || !session) return null
  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><p>Cargando...</p></div>
  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{error}</h1>
      <Link href="/dashboard" className="text-brand-blue font-semibold">Volver al panel</Link>
    </div>
  )

  const cat = categoriasData[categoria]
  const sub = cat?.subs.find((s: { label: string }) => s.label === subcategoria)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const maxFiles = 10 - imagenes.length
    if (maxFiles <= 0) return

    const newImages: { file: File; preview: string }[] = []
    for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue
      newImages.push({ file, preview: URL.createObjectURL(file) })
    }
    setImagenes(prev => [...prev, ...newImages])
  }

  const removeImage = (i: number) => {
    const img = imagenes[i]
    if (img.preview.startsWith('blob:')) URL.revokeObjectURL(img.preview)
    setImagenes(prev => prev.filter((_, idx) => idx !== i))
  }

  const uploadNewImages = async (): Promise<string[]> => {
    const existingUrls = imagenes.filter(i => i.uploadedUrl).map(i => i.uploadedUrl!)
    const newFiles = imagenes.filter(i => i.file && !i.uploadedUrl)

    if (newFiles.length === 0) return existingUrls

    const urls = [...existingUrls]
    for (let i = 0; i < newFiles.length; i++) {
      const img = newFiles[i]
      const fileName = `${user?.id}/${Date.now()}_${i}_${img.file!.name}`.replace(/\s+/g, '_')
      setImagenes(prev => prev.map(p => (p.file === img.file ? { ...p, uploading: true } : p)))

      const { data, error: uploadError } = await supabase.storage
        .from('productos')
        .upload(fileName, img.file!, { cacheControl: '3600' })

      if (uploadError) {
        setImagenes(prev => prev.map(p => (p.file === img.file ? { ...p, uploading: false } : p)))
        continue
      }

      const { data: urlData } = supabase.storage.from('productos').getPublicUrl(data.path)
      urls.push(urlData.publicUrl)
      setUploadProgress(Math.round(((i + 1) / newFiles.length) * 100))
    }
    return urls
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')

    let imagenesArr: string[] = []
    const newImgs = await uploadNewImages()
    imagenesArr = newImgs

    // Get categoria_id
    const { data: catData } = await supabase
      .from('categorias')
      .select('id')
      .eq('nombre', categoria)
      .single()

    const { error: dbError } = await supabase
      .from('productos')
      .update({
        titulo,
        descripcion,
        categoria_id: catData?.id || null,
        subcategoria,
        marca: marca || null,
        estado: estadoProd,
        precio_usd: parseFloat(precioUsd) || null,
        ubicacion_estado: ubicacionEstado,
        ubicacion_ciudad: ubicacionCiudad,
        imagen_url: imagenesArr.length > 0 ? imagenesArr[0] : null,
        imagenes: imagenesArr,
      })
      .eq('id', productId)

    if (dbError) {
      setError('Error al guardar: ' + dbError.message)
    } else {
      router.push(`/producto/${productId}`)
    }
    setSaving(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-blue transition mb-6">
        <ArrowLeft size={18} /> Volver al panel
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Editar publicacion</h1>
      <p className="text-gray-500 mb-8">Modifica los datos de tu producto</p>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-5">
        {/* Titulo */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">Titulo</label>
          <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={100} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 bg-white" />
          <p className="text-xs text-gray-500 mt-1">{titulo.length}/100</p>
        </div>

        {/* Descripcion */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">Descripcion</label>
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={5} maxLength={2000} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 resize-none bg-white" />
        </div>

        {/* Estado del producto */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">Estado</label>
          <div className="grid grid-cols-2 gap-2">
            {estadosProducto.map(e => (
              <button key={e} onClick={() => setEstadoProd(e)} className={`px-4 py-3 rounded-lg text-sm font-medium border transition ${estadoProd === e ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-gray-700 border-gray-200 hover:border-brand-yellow'}`}>{e}</button>
            ))}
          </div>
        </div>

        {/* Precio */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">Precio (USD)</label>
          <input type="number" value={precioUsd} onChange={e => setPrecioUsd(e.target.value)} placeholder="Ej: 250" min="0" step="0.01" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 bg-white" />
        </div>

        {/* Ubicacion */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Estado</label>
            <select value={ubicacionEstado} onChange={e => setUbicacionEstado(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-3 bg-white text-gray-800">
              <option value="">Estado...</option>
              {estadosVenezuela.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Ciudad</label>
            <input type="text" value={ubicacionCiudad} onChange={e => setUbicacionCiudad(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-800 bg-white" />
          </div>
        </div>

        {/* Imagenes */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">Fotos</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {imagenes.map((img, i) => (
              <div key={i} className="aspect-square relative rounded-lg overflow-hidden group border border-gray-200">
                <img src={img.preview} alt="" className="w-full h-full object-cover" />
                {i === 0 && <span className="absolute top-1 left-1 bg-brand-yellow text-brand-blue text-[10px] font-bold px-1.5 py-0.5 rounded">Portada</span>}
                {img.uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!img.uploading && (
                  <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"><X size={14} /></button>
                )}
              </div>
            ))}
            {imagenes.length < 10 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand-yellow hover:bg-yellow-50 transition">
                <Camera size={24} className="text-gray-400" /><span className="text-xs text-gray-500 mt-1">Añadir</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>
          {saving && uploadProgress > 0 && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-brand-blue h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} /></div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="px-6 py-3 rounded-lg font-medium border border-gray-200 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !titulo} className="flex-1 bg-brand-yellow text-brand-blue py-3 rounded-lg font-bold hover:bg-yellow-400 transition disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
