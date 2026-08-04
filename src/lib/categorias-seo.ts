export type CategoriaSEO = {
  slug: string
  nombre: string
  icono: string
  titulo: string
  descripcion: string
  introduccion: string[]
  terminos: string[]
  faq: { pregunta: string; respuesta: string }[]
}

export const CATEGORIAS_SEO: Record<string, CategoriaSEO> = {
  vehiculos: {
    slug: 'vehiculos',
    nombre: 'Vehículos',
    icono: '🚗',
    titulo: 'Vehículos en venta en Venezuela — Carros, motos y camionetas',
    descripcion: 'Compra y vende carros, motos, camionetas y otros vehículos nuevos o usados en Venezuela. Revisa anuncios por ubicación y publica gratis en VendeT.',
    introduccion: [
      'Encuentra vehículos en venta publicados por particulares y comercios de distintas ciudades de Venezuela. Compara carros, camionetas, motos y vehículos de trabajo según su precio, año, estado y ubicación.',
      'Si quieres vender un vehículo, crea un anuncio gratuito con fotografías, características y precio. Los compradores pueden comunicarse directamente contigo desde VendeT.',
    ],
    terminos: ['Carros usados', 'Camionetas y SUV', 'Motos', 'Camiones', 'Vehículos en Venezuela'],
    faq: [
      { pregunta: '¿Cómo comprar un vehículo en VendeT?', respuesta: 'Revisa los anuncios disponibles, compara precios y características y contacta al vendedor desde la publicación para coordinar una inspección y una forma segura de pago.' },
      { pregunta: '¿Puedo publicar un carro gratis?', respuesta: 'Sí. Puedes crear gratuitamente una publicación de tu carro, moto o camioneta y añadir fotografías, precio, ubicación y detalles del vehículo.' },
    ],
  },
  tecnologia: {
    slug: 'tecnologia',
    nombre: 'Tecnología',
    icono: '💻',
    titulo: 'Tecnología en Venezuela — Celulares, laptops y electrónica',
    descripcion: 'Compra y vende celulares, iPhone, laptops, computadoras, consolas y accesorios tecnológicos nuevos o usados en Venezuela.',
    introduccion: [
      'Explora anuncios de tecnología en Venezuela: celulares, laptops, computadoras, tablets, consolas, audio y accesorios. Consulta el precio y la ubicación de cada producto antes de contactar al vendedor.',
      'Publica gratuitamente los equipos que ya no utilizas o anuncia el inventario de tu negocio para llegar a compradores de todo el país.',
    ],
    terminos: ['Celulares y iPhone', 'Laptops', 'Computadoras', 'Consolas', 'Accesorios tecnológicos'],
    faq: [
      { pregunta: '¿Hay celulares nuevos y usados?', respuesta: 'Los vendedores pueden publicar productos nuevos o usados. El estado indicado aparece en cada anuncio junto con el precio y la ubicación.' },
      { pregunta: '¿Cómo vender un celular en VendeT?', respuesta: 'Crea una publicación gratuita, selecciona Tecnología, añade fotos reales, modelo, capacidad, estado, precio y tu ubicación.' },
    ],
  },
  moda: {
    slug: 'moda',
    nombre: 'Moda',
    icono: '👗',
    titulo: 'Moda en Venezuela — Ropa, calzado y accesorios',
    descripcion: 'Compra y vende ropa, zapatos, bolsos, relojes y accesorios de moda nuevos o usados en Venezuela. Publica tus productos gratis.',
    introduccion: [
      'Descubre ropa, calzado, bolsos, relojes y accesorios publicados en Venezuela. Filtra las opciones del catálogo y consulta directamente con cada vendedor la talla, condición y disponibilidad.',
      'Vende prendas nuevas o usadas sin pagar comisión por la publicación. Incluye fotos claras, talla, marca y ubicación para ayudar a los compradores a decidir.',
    ],
    terminos: ['Ropa para mujer', 'Ropa para hombre', 'Zapatos', 'Bolsos y mochilas', 'Accesorios'],
    faq: [
      { pregunta: '¿Puedo vender ropa usada?', respuesta: 'Sí. Indica claramente el estado de la prenda, añade fotografías reales y especifica talla, marca y precio.' },
      { pregunta: '¿VendeT cobra comisión por vender moda?', respuesta: 'Publicar es gratuito y VendeT no cobra comisión por la venta. El comprador y el vendedor acuerdan directamente la operación.' },
    ],
  },
  hogar: {
    slug: 'hogar',
    nombre: 'Hogar',
    icono: '🏠',
    titulo: 'Productos para el hogar en Venezuela — Muebles y electrodomésticos',
    descripcion: 'Encuentra muebles, electrodomésticos, decoración, artículos de cocina y jardín en venta en Venezuela. Compra o publica gratis.',
    introduccion: [
      'Busca productos para equipar tu hogar: muebles, electrodomésticos, decoración, artículos de cocina, electrónica doméstica y jardín disponibles en Venezuela.',
      'Compara precios y ubicaciones y conversa directamente con el vendedor. También puedes publicar gratuitamente los artículos para el hogar que deseas vender.',
    ],
    terminos: ['Muebles', 'Electrodomésticos', 'Decoración', 'Cocina', 'Jardín'],
    faq: [
      { pregunta: '¿Cómo coordino la entrega de un mueble?', respuesta: 'Consulta al vendedor desde el anuncio. Ambas partes deben acordar el transporte, lugar de entrega y pago antes de cerrar la compra.' },
      { pregunta: '¿Puedo anunciar electrodomésticos usados?', respuesta: 'Sí. Describe su estado y funcionamiento, añade fotos actuales y especifica si el comprador debe retirarlo en tu ubicación.' },
    ],
  },
  herramientas: {
    slug: 'herramientas',
    nombre: 'Herramientas',
    icono: '🔧',
    titulo: 'Herramientas en venta en Venezuela — Manuales y eléctricas',
    descripcion: 'Compra y vende herramientas manuales, eléctricas, industriales y de jardín en Venezuela. Encuentra equipos nuevos y usados.',
    introduccion: [
      'Encuentra herramientas manuales, eléctricas y de jardín para trabajos domésticos, construcción, talleres y actividades profesionales en Venezuela.',
      'Revisa la marca, condición y ubicación de los equipos publicados o crea gratis tu propio anuncio para vender herramientas nuevas o usadas.',
    ],
    terminos: ['Herramientas manuales', 'Herramientas eléctricas', 'Taladros', 'Equipos de taller', 'Herramientas de jardín'],
    faq: [
      { pregunta: '¿Se pueden publicar herramientas profesionales?', respuesta: 'Sí. Puedes anunciar herramientas domésticas, profesionales o industriales e indicar sus especificaciones y estado.' },
      { pregunta: '¿Cómo comprobar el estado de una herramienta usada?', respuesta: 'Solicita fotografías y detalles al vendedor y, cuando sea posible, prueba el equipo personalmente antes de pagar.' },
    ],
  },
  materiales: {
    slug: 'materiales',
    nombre: 'Materiales',
    icono: '🧱',
    titulo: 'Materiales de construcción en Venezuela — Ferretería y suministros',
    descripcion: 'Compra y vende materiales de construcción, productos eléctricos, plomería y suministros de ferretería en Venezuela.',
    introduccion: [
      'Consulta materiales de construcción y suministros de ferretería disponibles en Venezuela, incluyendo productos eléctricos, plomería, bloques, cemento y otros insumos para obras y reparaciones.',
      'Publica gratuitamente excedentes de obra o inventario comercial con la cantidad, unidad de venta, precio y ubicación para recibir consultas de compradores.',
    ],
    terminos: ['Materiales de construcción', 'Ferretería', 'Material eléctrico', 'Plomería', 'Suministros para obras'],
    faq: [
      { pregunta: '¿Puedo vender materiales sobrantes de una obra?', respuesta: 'Sí. Indica la cantidad disponible, condición, precio por unidad o lote y dónde deben retirarse.' },
      { pregunta: '¿Los precios incluyen transporte?', respuesta: 'Cada vendedor establece las condiciones. Confirma directamente si el precio incluye entrega o si debes retirar los materiales.' },
    ],
  },
  repuestos: {
    slug: 'repuestos',
    nombre: 'Repuestos',
    icono: '⚙️',
    titulo: 'Repuestos para carros y motos en Venezuela',
    descripcion: 'Encuentra repuestos y accesorios para carros y motos en Venezuela. Compara piezas nuevas o usadas y contacta directamente al vendedor.',
    introduccion: [
      'Busca repuestos para carros y motos publicados en Venezuela. Consulta compatibilidad, marca, modelo, estado, precio y ubicación antes de realizar la compra.',
      'Si vendes repuestos, publica gratis e incluye el número de pieza y los modelos compatibles para que los compradores encuentren tu anuncio con mayor facilidad.',
    ],
    terminos: ['Repuestos para carros', 'Repuestos para motos', 'Accesorios automotrices', 'Piezas usadas', 'Repuestos nuevos'],
    faq: [
      { pregunta: '¿Cómo sé si un repuesto es compatible?', respuesta: 'Compara el número de pieza y el modelo indicado y confirma la compatibilidad directamente con el vendedor antes de comprar.' },
      { pregunta: '¿Puedo publicar repuestos usados?', respuesta: 'Sí. Especifica que son usados, describe su condición e incluye fotos y los vehículos compatibles.' },
    ],
  },
  otros: {
    slug: 'otros',
    nombre: 'Otros',
    icono: '📦',
    titulo: 'Otros productos y servicios en venta en Venezuela',
    descripcion: 'Descubre artículos de deportes, música, libros, juguetes, mascotas, coleccionables y otros productos en Venezuela.',
    introduccion: [
      'Explora productos y servicios que no pertenecen a las categorías principales: deportes, música, libros, juguetes, artículos para mascotas, coleccionables y mucho más.',
      'Publica gratuitamente aquello que quieras vender y añade una descripción precisa para que los compradores puedan encontrarlo y contactarte.',
    ],
    terminos: ['Deportes y fitness', 'Instrumentos musicales', 'Libros', 'Juguetes', 'Coleccionables'],
    faq: [
      { pregunta: '¿Qué puedo publicar en esta categoría?', respuesta: 'Puedes publicar artículos permitidos que no encajen en las categorías principales, eligiendo la subcategoría más cercana al producto.' },
      { pregunta: '¿Publicar tiene algún costo?', respuesta: 'La publicación estándar es gratuita. Opcionalmente puedes destacar o impulsar el anuncio para aumentar su visibilidad.' },
    ],
  },
}

export const CATEGORIAS_SEO_LIST = Object.values(CATEGORIAS_SEO)

export function getCategoriaSEO(slug: string) {
  return CATEGORIAS_SEO[slug]
}
