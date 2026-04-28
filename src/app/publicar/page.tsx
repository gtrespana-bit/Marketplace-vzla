'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Camera, X, Tag, MapPin, DollarSign } from 'lucide-react'

const categorias: Record<string, { subcategorias: string[]; marcas: string[] }> = {
  vehiculos: {
    subcategorias: ['Carros', 'Motos', 'Camiones', 'Repuestos'],
    marcas: ['Toyota', 'Ford', 'Chevrolet', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'BMW', 'Mercedes-Benz', 'Jeep', 'Mitsubishi', 'Mazda', 'Renault', 'Peugeot', 'Suzuki', 'Volkswagen', 'Yamaha', 'Bera', 'Empire', 'Venom'],
  },
  tecnologia: {
    subcategorias: ['Celulares', 'Laptops', 'Tablets', 'Consolas', 'Audio', 'Cámaras', 'Accesorios'],
    marcas: ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Motorola', 'LG', 'Sony', 'Asus', 'Lenovo', 'HP', 'Dell', 'Microsoft', 'PlayStation', 'Xbox', 'Nintendo', 'JBL', 'Bose', 'Canon'],
  },
  moda: {
    subcategorias: ['Ropa hombre', 'Ropa mujer', 'Calzado', 'Accesorios', 'Relojes', 'Bolsos'],
    marcas: ['Nike', 'Adidas', 'Zara', 'H&M', 'Puma', 'New Balance', 'Gucci', 'Louis Vuitton', 'Calvin Klein', 'Tommy Hilfiger', 'Levi\'s'],
  },
  hogar: {
    subcategorias: ['Muebles', 'Electrodomésticos', 'Decoración', 'Jardín', 'Cocina'],
    marcas: ['Samsung', 'LG', 'Mabe', 'Daewoo', 'Whirlpool', 'Indurama', 'Oster', 'Philips', 'Truper'],
  },
  herramientas: {
    subcategorias: ['Herramientas manuales', 'Herramientas eléctricas', 'Equipos'],
    marcas: ['DeWalt', 'Makita', 'Bosch', 'Stanley', 'Truper', 'Black+Decker', 'Milwaukee'],
  },
  otros: {
    subcategorias: ['Deportes', 'Música', 'Libros', 'Juguetes', 'Mascotas', 'Otros'],
    marcas: [],
  },
}

const estadosProducto = ['Nuevo', 'Como nuevo', 'Bueno', 'Usado', 'Para repuestos']

export default function PublicarPage() {
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
  const [imagenes, setImagenes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const cat = categorias[categoria]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages: string[] = []
    for (let i = 0; i < Math.min(files.length, 10 - imagenes.length); i++) {
      const reader = new FileReader()
      reader.onloadend = () => {
        newImages.push(reader.result as string)
        if (newImages.length === Math.min(files.length, 10 - imagenes.length)) {
          setImagenes((prev) => [...prev, ...newImages])
        }
      }
      reader.readAsDataURL(files[i])
    }
  }

  const removeImage = (index: number) => {
    setImagenes((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setLoading(true)

    // En production: subir imágenes a Supabase Storage, luego crear el registro
    const { error } = await supabase.from('productos').insert({
      titulo,
      descripcion,
      categoria,
      subcategoria,
      marca: marca || null,
      estado: estadoProd,
      precio_usd: parseFloat(precioUsd) || null,
      ubicacion_estado: ubicacionEstado,
      ubicacion_ciudad: ubicacionCiudad,
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Publicar algo</h1>
      <p className="text-gray-500 mb-8">Completa la información de tu producto. Es gratis.</p>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {[
          { num: 1, label: 'Categoría' },
          { num: 2, label: 'Detalles' },
          { num: 3, label: 'Fotos' },
          { num: 4, label: 'Revisar' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setStep(s.num)}
              className={`w-10 h-10 rounded-full font-bold text-sm transition ${
                step >= s.num ? 'bg-brand-blue text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s.num}
            </button>
            <span className={`text-sm font-medium hidden sm:inline ${step >= s.num ? 'text-gray-800' : 'text-gray-400'}`}>
              {s.label}
            </span>
            {s.num < 4 && <div className={`w-8 h-0.5 ${step > s.num ? 'bg-brand-blue' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        {/* Paso 1: Categoría */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Tag size={20} className="text-brand-blue" />
              Elige la categoría
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoría</label>
              <select
                value={categoria}
                onChange={(e) => { setCategoria(e.target.value); setSubcategoria(''); setMarca('') }}
                required
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              >
                <option value="">Selecciona una categoría</option>
                {Object.keys(categorias).map((key) => (
                  <option key={key} value={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {cat && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Subcategoría</label>
                  <select
                    value={subcategoria}
                    onChange={(e) => setSubcategoria(e.target.value)}
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  >
                    <option value="">Selecciona...</option>
                    {cat.subcategorias.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {cat.marcas.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Marca</label>
                    <input
                      type="text"
                      value={marca}
                      onChange={(e) => setMarca(e.target.value)}
                      placeholder="Escribe la marca o selecciona..."
                      list={`${categoria}-marcas`}
                      className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    />
                    <datalist id={`${categoria}-marcas`}>
                      {cat.marcas.map((m) => <option key={m} value={m} />)}
                    </datalist>
                  </div>
                )}
              </>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!categoria || !subcategoria}
              className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}

        {/* Paso 2: Detalles */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Tag size={20} className="text-brand-blue" />
              Detalles del producto
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Título</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: iPhone 15 Pro Max 256GB Natural Titanium"
                maxLength={100}
                required
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
              <p className="text-xs text-gray-500 mt-1">{titulo.length}/100 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe tu producto: estado, características, accesorios incluidos..."
                rows={5}
                maxLength={2000}
                required
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{descripcion.length}/2000 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado del producto</label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
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
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
              <p className="text-xs text-gray-500 mt-1">El precio se muestra en USD. También se mostrará equivalente en Bs.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <MapPin size={16} /> Estado
                </label>
                <select
                  value={ubicacionEstado}
                  onChange={(e) => setUbicacionEstado(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
                >
                  <option value="">Estado...</option>
                  <option>D.M. Capital</option>
                  <option>Miranda</option>
                  <option>Carabobo</option>
                  <option>Lara</option>
                  <option>Zulia</option>
                  <option>Aragua</option>
                  <option>Anzoátegui</option>
                  <option>Bolívar</option>
                  <option>Mérida</option>
                  <option>Táchira</option>
                  <option>Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ciudad</label>
                <input
                  type="text"
                  value={ubicacionCiudad}
                  onChange={(e) => setUbicacionCiudad(e.target.value)}
                  placeholder="Ciudad"
                  required
                  className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-6 py-3 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition">
                ← Atrás
              </button>
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

        {/* Paso 3: Fotos */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Camera size={20} className="text-brand-blue" />
              Añade fotos
            </h2>
            <p className="text-sm text-gray-500">Sube hasta 10 fotos. La primera será la portada.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {imagenes.map((img, i) => (
                <div key={i} className="aspect-square relative rounded-lg overflow-hidden group border border-gray-200">
                  <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 bg-brand-yellow text-brand-blue text-[10px] font-bold px-1.5 py-0.5 rounded">
                      Portada
                    </span>
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
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-6 py-3 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition">
                ← Atrás
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition"
              >
                Revisar publicación
              </button>
            </div>
          </div>
        )}

        {/* Paso 4: Revisar */}
        {step === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800">✅ Revisa tu publicación</h2>

            <div className="border rounded-lg p-5 space-y-3">
              {/* Preview imagen */}
              {imagenes.length > 0 && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <img src={imagenes[0]} alt={titulo} className="w-full h-full object-cover" />
                </div>
              )}

              <h3 className="text-lg font-bold text-gray-800">{titulo}</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Categoría:</span> {categoria} → {subcategoria}</p>
                {marca && <p><span className="text-gray-500">Marca:</span> {marca}</p>}
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
                💡 <strong>¿Quieres que tu publicación aparezca primero?</strong> Puedes comprar créditos en <Link href="/creditos" className="underline font-bold">/creditos</Link> y destacar esta publicación.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="px-6 py-3 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition">
                ← Editar
              </button>
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
