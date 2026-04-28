'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Camera, X, Tag, MapPin, DollarSign, Car, Smartphone, Shirt, Home, Wrench, Package } from 'lucide-react'

// ============================================================
// CATEGORÍAS — marcas, subcategorías y campos específicos
// ============================================================

interface CategoriaConfig {
  icon: string
  subcategorias: string[]
  marcas: string[]
  camposEspeciales: { label: string; type: string; placeholder: string; options?: string[] }[]
}

const categoriasConfig: Record<string, CategoriaConfig> = {
  vehiculos: {
    icon: '🚗',
    subcategorias: ['Carros', 'Motos', 'Camiones', 'Repuestos y Accesorios'],
    marcas: [
      'Toyota', 'Ford', 'Chevrolet', 'Honda', 'Nissan', 'Hyundai', 'Kia',
      'BMW', 'Mercedes-Benz', 'Jeep', 'Mitsubishi', 'Mazda', 'Renault',
      'Peugeot', 'Suzuki', 'Volkswagen', 'Yamaha', 'Bera', 'Empire',
      'Venom', 'Isuzu', 'Audi', 'Seat', 'Great Wall', 'Chery', 'Changan',
    ],
    camposEspeciales: [
      { label: 'Año', type: 'number', placeholder: 'Ej: 2015' },
      { label: 'Kilometraje (km)', type: 'number', placeholder: 'Ej: 45000' },
      { label: 'Transmisión', type: 'select', placeholder: 'Selecciona...', options: ['Automática', 'Manual', 'CVT', 'Semi-automática'] },
      { label: 'Combustible', type: 'select', placeholder: 'Selecciona...', options: ['Gasolina', 'Diésel', 'Eléctrico', 'Híbrido', 'GPL'] },
      { label: 'Color', type: 'text', placeholder: 'Ej: Blanco' },
    ],
  },
  tecnologia: {
    icon: '💻',
    subcategorias: ['Celulares', 'Laptops', 'Tablets', 'Consolas', 'Audio', 'Cámaras', 'Monitores', 'Accesorios'],
    marcas: [
      'Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Motorola', 'LG', 'Sony',
      'Asus', 'Lenovo', 'HP', 'Dell', 'Microsoft', 'PlayStation',
      'Xbox', 'Nintendo', 'JBL', 'Bose', 'Canon', 'Acer',
    ],
    camposEspeciales: [
      { label: 'Modelo específico', type: 'text', placeholder: 'Ej: iPhone 15 Pro Max' },
      { label: 'Almacenamiento', type: 'select', placeholder: 'Selecciona...', options: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB'] },
      { label: 'RAM', type: 'select', placeholder: 'Selecciona...', options: ['2GB', '4GB', '6GB', '8GB', '12GB', '16GB', '32GB'] },
      { label: 'Color', type: 'text', placeholder: 'Ej: Space Gray' },
    ],
  },
  moda: {
    icon: '👗',
    subcategorias: ['Ropa hombre', 'Ropa mujer', 'Calzado', 'Accesorios', 'Relojes', 'Bolsos'],
    marcas: [
      'Nike', 'Adidas', 'Zara', 'H&M', 'Puma', 'New Balance', 'Gucci',
      'Louis Vuitton', 'Calvin Klein', 'Tommy Hilfiger', 'Ralph Lauren',
      'Levi\'s', 'Versace', 'Lacoste', 'The North Face',
    ],
    camposEspeciales: [
      { label: 'Talla', type: 'select', placeholder: 'Selecciona...', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '29', '30', '31', '32', '34', '36', '38', '40', '42', '44'] },
      { label: 'Color', type: 'text', placeholder: 'Ej: Negro' },
    ],
  },
  hogar: {
    icon: '🏠',
    subcategorias: ['Muebles', 'Electrodomésticos', 'Decoración', 'Jardín', 'Cocina', 'Baño', 'Iluminación'],
    marcas: [
      'Samsung', 'LG', 'Mabe', 'Daewoo', 'Whirlpool', 'Indurama',
      'Oster', 'Philips', 'Truper', 'Black+Decker', 'IKEA',
    ],
    camposEspeciales: [
      { label: 'Dimensiones', type: 'text', placeholder: 'Ej: 180x90x60 cm' },
      { label: 'Material', type: 'text', placeholder: 'Ej: Madera, acero inoxidable...' },
    ],
  },
  herramientas: {
    icon: '🔧',
    subcategorias: ['Herramientas manuales', 'Herramientas eléctricas', 'Equipos industriales', 'Jardín'],
    marcas: [
      'DeWalt', 'Makita', 'Bosch', 'Stanley', 'Truper',
      'Black+Decker', 'Milwaukee', 'Husqvarna', 'Stihl',
    ],
    camposEspeciales: [
      { label: 'Voltaje', type: 'text', placeholder: 'Ej: 18V, 110V...' },
      { label: 'Potencia', type: 'text', placeholder: 'Ej: 1500W, 2HP...' },
    ],
  },
  otros: {
    icon: '📦',
    subcategorias: ['Deportes', 'Música', 'Libros', 'Juguetes', 'Mascotas', 'Inmuebles', 'Servicios', 'Otros'],
    marcas: [],
    camposEspeciales: [],
  },
}

const estadosProducto = ['Nuevo', 'Como nuevo', 'Bueno', 'Usado', 'Para repuestos']
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function PublicarPage() {
  const [step, setStep] = useState(1)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState('')
  const [subcategoria, setSubcategoria] = useState('')
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

  // Reset modelo y specs al cambiar categoría
  const handleCatChange = (val: string) => {
    setCategoria(val)
    setSubcategoria('')
    setMarca('')
    setModelo('')
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
      subcategoria,
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

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Publicar algo</h1>
      <p className="text-gray-500 mb-8">Completa la información de tu producto. Es gratis.</p>

      {/* Steps indicator */}
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
            <span className={`text-sm font-medium hidden sm:inline ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>
              {s.label}
            </span>
            {s.num < 4 && <div className={`w-6 sm:w-8 h-0.5 ${step > s.num ? 'bg-brand-blue' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">

        {/* ====== PASO 1: Categoría ====== */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Tag size={20} className="text-brand-blue" />
              Elige la categoría
            </h2>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Categoría</label>
              <select
                value={categoria}
                onChange={(e) => handleCatChange(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white text-gray-800"
              >
                <option value="">Selecciona una categoría</option>
                {Object.keys(categoriasConfig).map((key) => (
                  <option key={key} value={key}>
                    {categoriasConfig[key].icon} {key.charAt(0).toUpperCase() + key.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {catConfig && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Subcategoría</label>
                  <select
                    value={subcategoria}
                    onChange={(e) => setSubcategoria(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white text-gray-800"
                  >
                    <option value="">Selecciona...</option>
                    {catConfig.subcategorias.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {catConfig.marcas.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Marca</label>
                    <input
                      type="text"
                      value={marca}
                      onChange={(e) => setMarca(e.target.value)}
                      placeholder="Escribe la marca..."
                      list={`${categoria}-marcas`}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow text-gray-800"
                    />
                    <datalist id={`${categoria}-marcas`}>
                      {catConfig.marcas.map((m) => <option key={m} value={m} />)}
                    </datalist>
                  </div>
                )}

                {(categoria === 'vehiculos' || categoria === 'tecnologia') && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Modelo</label>
                    <input
                      type="text"
                      value={modelo}
                      onChange={(e) => setModelo(e.target.value)}
                      placeholder={categoria === 'vehiculos' ? 'Ej: 4Runner, Civic, Corolla...' : 'Ej: iPhone 15, Galaxy S24...'}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow text-gray-800"
                    />
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

        {/* ====== PASO 2: Detalles ====== */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Tag size={20} className="text-brand-blue" />
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
                  'Ej: iPhone 15 Pro Max 256GB Natural Titanium'
                }
                maxLength={100}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow text-gray-800"
              />
              <p className="text-xs text-gray-500 mt-1">{titulo.length}/100 caracteres</p>
            </div>

            {/* Specs específicos por categoría */}
            {catConfig && catConfig.camposEspeciales.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  {categoria === 'vehiculos' && <Car size={18} />}
                  {categoria === 'tecnologia' && <Smartphone size={18} />}
                  {categoria === 'moda' && <Shirt size={18} />}
                  {categoria === 'hogar' && <Home size={18} />}
                  {categoria === 'herramientas' && <Wrench size={18} />}
                  {categoria === 'otros' && <Package size={18} />}
                  Especificaciones
                </h3>

                {catConfig.camposEspeciales.map((campo) => (
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
                placeholder="Describe tu producto: estado, características, accesorios incluidos..."
                rows={5}
                maxLength={2000}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow text-gray-800 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{descripcion.length}/2000 caracteres</p>
            </div>

            {/* Estado del producto */}
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
              <p className="text-xs text-gray-500 mt-1">El precio se muestra en USD. También se mostrará equivalente en Bs.</p>
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
                  <option>D.M. Capital</option><option>Miranda</option><option>Carabobo</option>
                  <option>Lara</option><option>Zulia</option><option>Aragua</option>
                  <option>Anzoátegui</option><option>Bolívar</option><option>Mérida</option>
                  <option>Táchira</option><option>Otro</option>
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

        {/* ====== PASO 3: Fotos ====== */}
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

        {/* ====== PASO 4: Revisar ====== */}
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
                <p><span className="text-gray-500">Categoría:</span> {categoria} → {subcategoria}</p>
                {marca && <p><span className="text-gray-500">Marca:</span> {marca}</p>}
                {modelo && <p><span className="text-gray-500">Modelo:</span> {modelo}</p>}
                {catConfig && catConfig.camposEspeciales.map(c => specs[c.label] && (
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
                💡 <strong>¿Quieres que tu publicación aparezca primero?</strong> Puedes comprar créditos en <Link href="/creditos" className="underline font-bold">/creditos</Link>.
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
