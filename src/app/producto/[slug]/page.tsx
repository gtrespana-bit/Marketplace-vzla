import Link from 'next/link'
import type { Metadata } from 'next'
import { MapPin, Tag, MessageCircle, Phone, Mail, Share2, Heart, ChevronRight, Shield, Star, Clock, Eye } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Detalle del Producto — Todo Anuncios',
  description: 'Ver detalles del producto y contactar al vendedor',
}

export default function ProductoPage({ params }: { params: { slug: string } }) {
  const producto = {
    titulo: 'Toyota 4Runner 2013 Automática Blanca',
    precioUsd: 15000,
    precioBs: 540000,
    estado: 'Bueno',
    categoria: 'vehiculos',
    tipo: 'Camionetas/SUV',
    marca: 'Toyota',
    modelo: '4Runner',
    specs: {
      'Año': '2013',
      'Kilometraje': '85,000 km',
      'Tracción': '4x4',
      'Transmisión': 'Automática',
      'Motor': '4.0L V6',
      'Color': 'Blanco',
    },
    descripcion: `Vendo Toyota 4Runner Limited 2013 en excelentes condiciones.

- Motor 4.0L V6, 270hp
- Tracción 4x4 con reductora
- Transmisión automática de 5 velocidades
- Cuero completo, techo corredizo
- Cámara de reversa, sensores de estacionamiento
- Llantas nuevas (5.000 km)
- Mantenimiento al día, servicios en Toyota

Sin detalles de carrocería. Interior impecable.
Papeles al día, traspaso inmediato.

Solo interesados reales. No cambios.
Precio ligeramente negociable.`,
    ubicacion: 'Caracas, Distrito Capital',
    publicado: 'hace 2 horas',
    visitas: 147,
    vendedor: {
      nombre: 'Carlos M.',
      registrado: 'Marzo 2024',
      publicaciones: 12,
      verificado: true,
      confianza: 4.7,
      contacto: {
        chat: true,
        whatsapp: '+584121234567',
        telefono: '0412-1234567',
        email: false,
        pagaMovil: true,
      },
    },
  }

  const imagenes = [
    'https://picsum.photos/seed/prod1/800/600',
    'https://picsum.photos/seed/prod2/800/600',
    'https://picsum.photos/seed/prod3/800/600',
    'https://picsum.photos/seed/prod4/800/600',
  ]

  const productosSimilares = [
    { id: '1', titulo: 'Toyota Hilux 2015', precio: 18000, img: 'https://picsum.photos/seed/sim1/400/400', estado: 'Usado', ciudad: 'Valencia' },
    { id: '2', titulo: 'Ford Explorer 2014', precio: 14000, img: 'https://picsum.photos/seed/sim2/400/400', estado: 'Bueno', ciudad: 'Caracas' },
    { id: '3', titulo: 'Chevrolet Trailblazer 2016', precio: 16000, img: 'https://picsum.photos/seed/sim3/400/400', estado: 'Como nuevo', ciudad: 'Maracaibo' },
    { id: '4', titulo: 'Hyundai Tucson 2015', precio: 13000, img: 'https://picsum.photos/seed/sim4/400/400', estado: 'Usado', ciudad: 'Mérida' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 overflow-x-auto hide-scrollbar">
        <Link href="/" className="hover:text-brand-blue flex-shrink-0">Inicio</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <Link href="/catalogo" className="hover:text-brand-blue flex-shrink-0">Catálogo</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <Link href={`/catalogo?categoria=${producto.categoria}`} className="hover:text-brand-blue capitalize flex-shrink-0">{producto.tipo}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <span className="text-gray-800 font-medium truncate flex-shrink-0">{producto.marca} {producto.modelo}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT = Imágenes + Descripción */}
        <div className="lg:col-span-2 space-y-6">
          {/* Galería */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="aspect-square md:aspect-[16/10] bg-gray-100">
              <img src={imagenes[0]} alt={producto.titulo} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2 p-3 overflow-x-auto hide-scrollbar">
              {imagenes.map((img, i) => (
                <button key={i} className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 border-gray-200 hover:border-brand-yellow transition">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{producto.titulo}</h1>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="badge-trust">✅ {producto.estado}</span>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">{producto.marca}</span>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">{producto.tipo}</span>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">{producto.modelo}</span>
            </div>

            {/* Especificaciones */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {Object.entries(producto.specs).map(([key, val]) => (
                <div key={key} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{key}</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{val}</p>
                </div>
              ))}
            </div>

            <p className="text-gray-600 whitespace-pre-line leading-relaxed">{producto.descripcion}</p>
          </div>

          {/* Seguridad */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h3 className="font-bold text-brand-blue mb-3 flex items-center gap-2">
              <Shield size={18} />
              Compra seguro
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
              <li className="flex items-center gap-2">✅ Encuentra al vendedor en un lugar público</li>
              <li className="flex items-center gap-2">✅ Verifica el producto antes de pagar</li>
              <li className="flex items-center gap-2">🚫 Nunca envíes dinero por adelantado</li>
              <li className="flex items-center gap-2">🚫 Desconfía de precios demasiado bajos</li>
              <li className="flex items-center gap-2">🔒 Papeles al día antes de traspasar</li>
              <li className="flex items-center gap-2">📝 Haz un recibo de compra-venta</li>
            </ul>
          </div>

          {/* Productos similares */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Productos similares</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {productosSimilares.map((p) => (
                <Link key={p.id} href={`/producto/${p.id}`} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group block border border-gray-100 card-hover">
                  <div className="aspect-square bg-gray-100">
                    <img src={p.img} alt={p.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.titulo}</p>
                    <p className="text-lg font-black text-brand-blue">${p.precio.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{p.estado} · {p.ciudad}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT = Precio + Contacto (STICKY) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-20">
            {/* Precio */}
            <div className="mb-4">
              <p className="text-4xl font-black text-brand-blue">${producto.precioUsd.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">≈ Bs. {producto.precioBs.toLocaleString()} (tasa ref.)</p>
            </div>

            {/* Urgencia */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-5 pb-4 border-b">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {producto.publicado}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {producto.visitas} vistas
              </span>
            </div>

            {/* Vendedor */}
            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-lg">
                  {producto.vendedor.nombre.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                    {producto.vendedor.nombre}
                    {producto.vendedor.verificado && (
                      <span className="badge-verified">
                        <Shield size={12} />
                        Verificado
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-1 text-xs">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-bold">{producto.vendedor.confianza}</span>
                    <span className="text-gray-400">· {producto.vendedor.publicaciones} publicaciones</span>
                  </div>
                </div>
              </div>

              {producto.vendedor.contacto.pagaMovil && (
                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                  📱 Pago Móvil verificado
                </span>
              )}
            </div>

            {/* Botones de contacto */}
            <div className="space-y-2">
              <button className="w-full bg-brand-blue text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition flex items-center justify-center gap-2 btn-primary">
                <MessageCircle size={18} />
                Enviar mensaje
              </button>

              {producto.vendedor.contacto.whatsapp && (
                <a
                  href={`https://wa.me/${producto.vendedor.contacto.whatsapp.replace('+', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition flex items-center justify-center gap-2 btn-primary"
                >
                  💚 WhatsApp directo
                </a>
              )}

              {producto.vendedor.contacto.telefono && (
                <button className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <Phone size={18} />
                  Ver teléfono
                </button>
              )}

              {producto.vendedor.contacto.email && (
                <button className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <Mail size={18} />
                  Ver email
                </button>
              )}
            </div>

            {/* Ubicación */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-4 pt-4 border-t">
              <MapPin size={16} />
              {producto.ubicacion}
            </div>

            {/* Acciones */}
            <div className="flex gap-2 mt-3">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                <Heart size={16} />
                Guardar
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                <Share2 size={16} />
                Compartir
              </button>
            </div>

            {/* Reportar */}
            <button className="w-full text-xs text-gray-400 hover:text-gray-600 mt-3 transition py-1">
              ⚠️ Reportar publicación
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
