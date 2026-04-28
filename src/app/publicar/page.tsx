'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import categoriasConfig, { anos, estadosProducto, estadosVenezuela } from '@/lib/categorias'
import { Camera, X, Tag, MapPin, DollarSign, Car, Smartphone, Shirt, Home, Wrench, Package } from 'lucide-react'

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

export default function PublicarPage() {
  const [step, setStep] = useState(1)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState('')
  const [tipo, setTipo] = useState('')
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [estadoProd, setEstadoProd] = useState('')
  const [precioUsd, setPrecioUsd] = useState('')
  const [ubicacionEstado, setUbicacionEstado] = useState('')
  const [ubicacionCiudad, setUbicacionCiudad] = useState('')
  const [imagenes, setImagenes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [specs, setSpecs] = useState<Record<string, string>>({})

  const catConfig = categoriasConfig[categoria]
  const marcas = catConfig?.marcasPorTipo[tipo] || catConfig?.marcasPorTipo['default'] || []
  const camposEspeciales = catConfig?.camposEspeciales[tipo] || catConfig?.camposEspeciales['default'] || []

  const handleCatChange = (val: string) => {
    setCategoria(val)
    setTipo('')
    setMarca('')
    setModelo('')
    setSpecs({})
  }

  const handleTipoChange = (val: string) => {
    setTipo(val)
    setMarca('')
    setSpecs({})
  }

  const handleSpecChange = (label: string, value: string) => {
    setSpecs(prev => ({ ...prev, [label]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newImages: string[] = []
    for (let i = 0; i < Math.min(files.length, 10 - imagenes.length); i++) {
      const reader = new FileReader()
      reader.onloadend = () => {
        newImages.push(reader.result as string)
        if (newImages.length === Math.min(files.length, 10 - imagenes.length)) {
          setImagenes(prev => [...prev, ...newImages])
        }
      }
      reader.readAsDataURL(files[i])
    }
  }

  const removeImage = (index: number) => {
    setImagenes(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setLoading(true)
    const { error } = await supabase.from('productos').insert({
      titulo,
      descripcion,
      categoria,
      subcategoria: tipo,
      marca: marca || null,
      modelo: modelo || null,
      estado: estadoProd,
      precio_usd: parseFloat(precioUsd) || null,
      ubicacion_estado: ubicacionEstado,
      ubicacion_ciudad: ubicacionCiudad,
      especificaciones: JSON.stringify(specs),
      activo: true,
      destacado: false,
    })
    if (error) {
      alert('Error al publicar: ' + error.message)
    } else {
      alert('¡Publicado con éxito! Tu aviso está visible.')
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  const catIcon = catConfig?.icon || '📦'

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Publicar algo</h1>
      <p className="text-gray-500 mb-8">Completa la información de tu producto. Es gratis.</p>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {[{ num: 1, label: 'Categoría' }, { num: 2, label: 'Detalles' }, { num: 3, label: 'Fotos' }, { num: 4, label: 'Revisar' }].map((s) => (
          <div key={s.num} className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setStep(s.num)} className={`w-10 h-10 rounded-full font-bold text-sm transition ${step >= s.num ? 'bg-brand-blue text-white' : 'bg-gray-200 text-gray-500'}`}>
              {s.num}
            </button>
            <span className={`text-sm font-medium hidden sm:inline ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
            {s.num < 4 && <div className={`w-6 sm:w-8 h-0.5 ${step > s.num ? 'bg-brand-blue' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">

        {/* PASO 1: Categoría y Tipo */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Tag size={20} className="text-brand-blue" />
              ¿Qué quieres publicar?
            </h2>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Categoría principal</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(categoriasConfig).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => handleCatChange(key)}
                    className={`p-4 rounded-xl border-2 text-center transition ${
                      categoria === key
                        ? 'border-brand-blue bg-blue-50'
                        : 'border-gray-200 hover:border-brand-yellow'
                    }`}
                  >
                    <span className="text-3xl block mb-2">{cfg.icon}</span>
                    <span className="text-sm font-bold text-gray-800">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>

            {catConfig && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Tipo de artículo</label>
                  <select
                    value={tipo}
                    onChange={(e) => handleTipoChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white text-gray-800"
                  >
                    <option value="">Selecciona el tipo...</option>
                    {catConfig.tipos.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {marcas.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Marca</label>
                    <input
                      type="text"
                      value={marca}
                      onChange={(e) => setMarca(e.target.value)}
                      placeholder="Escribe la marca..."
                      list={`${categoria}-${tipo}-marcas`}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow text-gray-800"
                    />
                    <datalist id={`${categoria}-${tipo}-marcas`}>
                      {marcas.map((m) => <option key={m} value={m} />)}
                    </datalist>
                  </div>
                )}
              </>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!categoria || !tipo}
              className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              siguiente
            </button>
          </div>
        )}

        {/* PASO 2: Detalles + Especificaciones */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {catIcon && <span className="text-2xl">{catIcon}</span>}
              Detalles del producto
            </h2>

            {/* Título */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Título</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder={
                  categoria === 'vehiculos' ? 'Ej: Toyota 4Runner 2013 Automática Blanca' :
                  categoria === 'tecnologia' ? 'Ej: iPhone 15 Pro Max 256GB' :
                  'Describe tu producto claramente...'
                }
                maxLength={100}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow text-gray-800"
              />
              <p className="text-xs text-gray-500 mt-1">{titulo.length}/100 caracteres</p>
            </div>

            {/* Especificaciones específicas por tipo */}
            {camposEspeciales.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  {categoria === 'vehiculos' && <Car size={18} />}
                  {categoria === 'tecnologia' && <Smartphone size={18} />}
                  {categoria === 'moda' && <Shirt size={18} />}
                  {categoria === 'hogar' && <Home size={18} />}
                  {categoria === 'herramientas' && <Wrench size={18} />}
                  {categoria === 'otros' && <Package size={18} />}
                  Especificaciones — {tipo}
                </h3>
                {camposEspeciales.map((campo) => (
                  <div key={campo.label}>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">{campo.label}</label>
                    {campo.type === 'select' ? (
                      <select
                        value={specs[campo.label] || ''}
                        onChange={(e) => handleSpecChange(campo.label, e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white text-gray-800"
                      >
                        <option value="">{campo.placeholder}</option>
                        {campo.label === 'Año'
                          ? years.map((y) => <option key={y} value={y}>{y}</option>)
                          : campo.options?.map((o) => <option key={o} value={o}>{o}</option>)
                        }
                      </select>
                    ) : (
                      <input
                        type={campo.type}
                        value={specs[campo.label] || ''}
                        onChange={(e) => handleSpecChange(campo.label, e.target.value)}
                        placeholder={campo.placeholder}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow text-gray-800"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe el estado, características, accesorios incluidos..."
                rows={5}
                maxLength={2000}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow text-gray-800 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{descripcion.length}/2000 caracteres</p>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Estado del producto</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {estadosProducto.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEstadoProd(e)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium border transition ${
                      estadoProd === e
                        ? 'bg-brand-blue text-white border-brand-blue'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-brand-yellow'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5 flex items-center gap-1">
                <DollarSign size={16} /> Precio (USD)
              </label>
              <input
                type="number"
                value={precioUsd}
                onChange={(e) => setPrecioUsd(e.target.value)}
                placeholder="Ej: 250"
                min="0"
                step="0.01"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow text-gray-800"
              />
              <p className="text-xs text-gray-500 mt-1">Se mostrará en USD y equivalente en Bs.</p>
            </div>

            {/* Ubicación */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5 flex items-center gap-1">
                  <MapPin size={16} /> Estado
                </label>
                <select
                  value={ubicacionEstado}
                  onChange={(e) => setUbicacionEstado(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow text-gray-800 bg-white"
                >
                  <option value="">Estado...</option>
                  {estadosVenezuela.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Ciudad</label>
                <input
                  type="text"
                  value={ubicacionCiudad}
                  onChange={(e) => setUbicacionCiudad(e.target.value)}
                  placeholder="Ciudad"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow text-gray-800"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-6 py-3 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition">← Atrás</button>
              <button
                onClick={() => setStep(3)}
                disabled={!titulo || !descripcion || !estadoProd || !precioUsd}
                className="flex-1 bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: Fotos */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Camera size={20} className="text-brand-blue" />
              Añade fotos
            </h2>
            <p className="text-sm text-gray-500">Sube hasta 10 fotos. La primera será la portada.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {imagenes.map((img, i) => (
                <div key={i} className="aspect-square relative rounded-lg overflow-hidden group border border-gray-200">
                  <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 bg-brand-yellow text-brand-blue text-[10px] font-bold px-1.5 py-0.5 rounded">Portada</span>
                  )}
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {imagenes.length < 10 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand-yellow hover:bg-yellow-50 transition">
                  <Camera size={24} className="text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Añadir</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-6 py-3 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition">← Atrás</button>
              <button onClick={() => setStep(4)} className="flex-1 bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition">Revisar publicación</button>
            </div>
          </div>
        )}

        {/* PASO 4: Revisar */}
        {step === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900">✅ Revisa tu publicación</h2>

            <div className="border rounded-lg p-5 space-y-3">
              {imagenes.length > 0 && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <img src={imagenes[0]} alt={titulo} className="w-full h-full object-cover" />
                </div>
              )}
              <h3 className="text-lg font-bold text-gray-900">{titulo}</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Categoría:</span> {categoria} → {tipo}</p>
                {marca && <p><span className="text-gray-500">Marca:</span> {marca}</p>}
                {modelo && <p><span className="text-gray-500">Modelo:</span> {modelo}</p>}
                {camposEspeciales.map(c => specs[c.label] && (
                  <p key={c.label}><span className="text-gray-500">{c.label}:</span> {specs[c.label]}</p>
                ))}
                <p><span className="text-gray-500">Estado:</span> {estadoProd}</p>
                <p><span className="text-gray-500">Precio:</span> <strong className="text-brand-blue text-lg">${precioUsd}</strong></p>
                <p><span className="text-gray-500">Ubicación:</span> {ubicacionCiudad}, {ubicacionEstado}</p>
                <p><span className="text-gray-500">Fotos:</span> {imagenes.length}</p>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600"><strong>Descripción:</strong></p>
                <p className="text-sm text-gray-700 mt-1">{descripcion}</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                💡 <strong>¿Quieres que tu publicación aparezca primero?</strong> Puedes en <Link href="/creditos" className="underline font-bold">/creditos</Link>.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="px-6 py-3 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition">← Editar</button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-brand-yellow text-brand-blue py-3 rounded-lg font-bold hover:bg-yellow-400 transition disabled:opacity-50"
              >
                {loading ? 'Publicando...' : '🚀 Publicar gratis'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
