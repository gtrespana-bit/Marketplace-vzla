import Link from 'next/link'
import type { Metadata } from 'next'
import { MapPin, Tag, MessageCircle, Phone, Mail, Share2, Heart, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Detalle del Producto — TuCambalo',
  description: 'Ver detalles del producto y contactar al vendedor',
}

export default function ProductoPage({ params }: { params: { slug: string } }) {
  // Datos de ejemplo (en producción vendrían de Supabase)
  const producto = {
    id: params.slug,
    titulo: 'iPhone 15 Pro Max 256GB Natural Titanium',
    precioUsd: 850,
    precioBs: 30600,
    estado: 'Como nuevo',
    categoria: 'tecnologia',
    subcategoria: 'Celulares',
    marca: 'Apple',
    descripcion:`Vendo iPhone 15 Pro Max de 256GB en color Natural Titanium. El teléfono está en excelentes condiciones, sin rayones ni golpes. Incluye caja original, cable USB-C y protector de pantalla ya instalado.

Batería al 94% de salud. Face ID funcionando perfectamente.

Se entrega desbloqueado y con factura. Solo cambio por otro iPhone o venta directa.

Entrega en punto seguro en Caracas. También me puedo desplazar según zona.

Precio negociable. No acepto cambios por Android.`,
    ubicacion: 'Caracas, Distrito Capital',
    fecha: 'publicado hace 2 horas',
    vendedor: {
      nombre: 'Carlos M.',
      registrado: 'Marzo 2024',
      productos: 12,
      contacto: {
        chat: true,
        whatsapp: '+584121234567',
        telefono: '0412-1234567',
        email: false,
      },
    },
  }

  const imagenes = [
    'https://picsum.photos/seed/prod1/800/600',
    'https://picsum.photos/seed/prod2/800/600',
    'https://picsum.photos/seed/prod3/800/600',
  ]

  const productosSimilares = [
    { id: '1', titulo: 'iPhone 14 Pro 128GB', precio: 650, img: 'https://picsum.photos/seed/sim1/400/400', estado: 'Bueno', ciudad: 'Valencia' },
    { id: '2', titulo: 'Samsung S24 Ultra 256GB', precio: 800, img: 'https://picsum.photos/seed/sim2/400/400', estado: 'Nuevo', ciudad: 'Caracas' },
    { id: '3', titulo: 'iPhone 13 128GB', precio: 400, img: 'https://picsum.photos/seed/sim3/400/400', estado: 'Usado', ciudad: 'Maracaibo' },
    { id: '4', titulo: 'Samsung Galaxy A54 128GB', precio: 200, img: 'https://picsum.photos/seed/sim4/400/400', estado: 'Como nuevo', ciudad: 'Mérida' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand-blue">Inicio</Link>
        <ChevronRight size={14} />
        <Link href={`/catalogo?categoria=${producto.categoria}`} className="hover:text-brand-blue capitalize">
          {producto.categoria}
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-800 font-medium truncate">{producto.titulo}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Imágenes + Descripción */}
        <div className="lg:col-span-2 space-y-6">
          {/* Galería */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="aspect-square md:aspect-[16/10] bg-gray-100">
              <img src={imagenes[0]} alt={producto.titulo} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2 p-3 overflow-x-auto hide-scrollbar">
              {imagenes.map((img, i) => (
                <button key={i} className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 hover:border-brand-yellow transition">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-3">{producto.titulo}</h1>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-blue-50 text-brand-blue px-3 py-1 rounded-full text-sm font-medium">
                {producto.estado}
              </span>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                {producto.marca}
              </span>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                {producto.subcategoria}
              </span>
            </div>

            <p className="text-gray-600 whitespace-pre-line leading-relaxed">{producto.descripcion}</p>
          </div>

          {/* Productos similares */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Productos similares</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {productosSimilares.map((p) => (
                <Link key={p.id} href={`/producto/${p.id}`} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition group border border-gray-100">
                  <div className="aspect-square bg-gray-100">
                    <img src={p.img} alt={p.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-800 truncate">{p.titulo}</p>
                    <p className="text-lg font-black text-brand-blue">${p.precio.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{p.estado} · {p.ciudad}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha - Precio + Contacto */}
        <div className="space-y-4">
          {/* Precio */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-20">
            <div className="mb-6">
              <p className="text-4xl font-black text-brand-blue">${producto.precioUsd.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">≈ Bs. {producto.precioBs.toLocaleString()} (referencial)</p>
            </div>

            {/* Vendedor info */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-6">
              <div className="w-12 h-12 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-lg">
                {producto.vendedor.nombre.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{producto.vendedor.nombre}</p>
                <p className="text-xs text-gray-500">Registrado {producto.vendedor.registrado} · {producto.vendedor.productos} publicaciones</p>
              </div>
            </div>

            {/* Contacto */}
            <div className="space-y-2 mb-6">
              <button className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition flex items-center justify-center gap-2">
                <MessageCircle size={18} />
                Enviar mensaje
              </button>

              {producto.vendedor.contacto.whatsapp && (
                <a href={`https://wa.me/${producto.vendedor.contacto.whatsapp.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition flex items-center justify-center gap-2">
                  💚 WhatsApp directo
                </a>
              )}

              {producto.vendedor.contacto.telefono && (
                <button className="w-full border border-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <Phone size={18} />
                  Mostrar teléfono
                </button>
              )}

              {producto.vendedor.contacto.email && (
                <button className="w-full border border-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <Mail size={18} />
                  Mostrar email
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <MapPin size={14} />
              {producto.ubicacion}
            </div>

            {/* Acciones adicionales */}
            <div className="flex gap-2 pt-4 border-t">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
                <Heart size={16} />
                Guardar
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
                <Share2 size={16} />
                Compartir
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              {producto.fecha}
            </p>
          </div>

          {/* Seguridad */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h4 className="font-bold text-yellow-800 text-sm mb-2">⚠️ Consejos de seguridad</h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Nunca envíes dinero por adelantado</li>
              <li>• Encuentra al vendedor en un lugar público</li>
              <li>• Verifica el producto antes de pagar</li>
              <li>• Desconfía de precios demasiado bajos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
