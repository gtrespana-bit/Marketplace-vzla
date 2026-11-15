import LocalLink from '@/components/LocalLink'

/**
 * Bloque de contenido único por ciudad + categoría.
 *
 * ⚠️ POR QUÉ EXISTE:
 * Estas landings eran la plantilla más delgada del sitio: un H1
 * ("Vehículos en Caracas"), una frase y una rejilla de productos. Con 2.640
 * combinaciones posibles, Google ve 2.640 páginas casi idénticas con una
 * palabra cambiada → las agrupa como duplicado y no indexa ninguna. Eso es lo
 * que impide que /caracas/vehiculos compita por "carros en venta caracas",
 * una consulta con altísima intención de compra.
 *
 * El texto no es relleno: varía por categoría (qué revisar antes de pagar) y
 * por ciudad (inventario real, contexto local). Es contenido corto pero ÚNICO,
 * que es lo que un rastreador —y un motor de respuestas— necesita para citar
 * la página en lugar de descartarla.
 */
export function ContenidoLocal({
  ciudadNombre,
  estado,
  categoriaSlug,
  categoriaNombre,
  total,
}: {
  ciudadNombre: string
  estado: string
  categoriaSlug: string
  categoriaNombre: string
  total: number
}) {
  // Pauta propia de cada categoría: qué preguntar y qué mirar antes de cerrar
  // el trato. Genérica por categoría, pero combinada con la ciudad deja de ser
  // la misma frase repetida en cientos de páginas.
  const CONSEJOS: Record<string, string[]> = {
    vehiculos: [
      'Pide la cédula del vehículo y verifica que el número de motor y de carrocería coincidan con el documento.',
      'Revisa el RCV (Registro de Vehículos) para confirmar que no tenga prendas ni prohibición de enajenar.',
      'Haz una inspección mecánica antes de pagar; en las ciudades grandes hay talleres que la hacen por poco dinero.',
    ],
    tecnologia: [
      'Pide el IMEI del teléfono y compruébalo contra la caja del equipo antes de pagar.',
      'En computadoras, pide el reporte de salud de la batería y revisa que la pantalla no tenga píxeles muertos.',
      'Queda en un sitio público con wifi para probar el equipo antes de cerrar la compra.',
    ],
    moda: [
      'Confirma talla, medidas reales y si la prenda tiene alguna marca o desgaste visible.',
      'Pide una foto a la luz del día: la luz artificial esconde manchas en la ropa usada.',
      'Acuerda la entrega en un lugar público y revisa la prenda antes de pagar.',
    ],
    hogar: [
      'Pide ver el mueble o electrodoméstico funcionando antes de pagar; no aceptes solo fotos.',
      'Mide el espacio donde va a ir: las medidas del anuncio casi nunca incluyen las manijas.',
      'Si es un electrodoméstico, comprueba el voltaje y el estado del cable y del enchufe.',
    ],
    herramientas: [
      'Pide ver la herramienta encendida (si es eléctrica) y comprueba el estado del cable y del mandril.',
      'Confirma que el modelo tenga repuestos disponibles en el país antes de comprarla.',
      'En herramientas a batería, pregunta si el paquete incluye cargador y cuántas baterías.',
    ],
    materiales: [
      'Confirma la cantidad real disponible y el costo del flete hasta tu obra.',
      'Pide la especificación del material: no todas las cabillas o bloques son del mismo calibre.',
      'Coordina el retiro tú mismo si el vendedor no ofrece transporte.',
    ],
    repuestos: [
      'Aporta el número de pieza o el año, marca y modelo exacto del vehículo para evitar errores.',
      'Comprueba si el repuesto es original, genérico o de segunda mano; el anuncio debe decirlo.',
      'Pide comprobante de compra para poder reclamar si no sirve.',
    ],
    otros: [
      'Pregunta todos los detalles al vendedor antes de comprometerte: el anuncio puede ser breve.',
      'Acuerda un punto de encuentro público y paga en presencia de testigos.',
      'Desconfía de precios muy por debajo del mercado y de quien pide pago por adelantado.',
    ],
  }

  const consejos = CONSEJOS[categoriaSlug] || CONSEJOS.otros
  const cat = categoriaNombre.toLowerCase()

  return (
    <section aria-labelledby="guia-local" className="mt-12 space-y-8">
      <div>
        <h2 id="guia-local" className="text-2xl font-black text-gray-900 mb-4">
          Cómo comprar y vender {cat} en {ciudadNombre}
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {ciudadNombre} es un municipio del estado {estado}. En VendeT, cualquier persona de{' '}
          {ciudadNombre} puede publicar un anuncio de {cat} gratis y recibir mensajes por el chat
          de la plataforma sin mostrar su número de teléfono.{' '}
          {total > 0 ? (
            <>
              Ahora mismo hay {total} {total === 1 ? 'anuncio' : 'anuncios'} de {cat}{' '}
              {total === 1 ? 'activo' : 'activos'} en la ciudad y sus alrededores.
            </>
          ) : (
            <>
              Todavía no hay anuncios activos de {cat} en la ciudad: publicar el primero te deja
              solo frente a toda la demanda local.
            </>
          )}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="font-bold text-gray-900 mb-3">
            Antes de pagar: qué revisar en {cat}
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {consejos.map((consejo) => (
              <li key={consejo} className="flex gap-2">
                <span aria-hidden="true" className="text-brand-primary font-black">
                  ✓
                </span>
                <span>{consejo}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="font-bold text-gray-900 mb-3">
            Publicar {cat} en {ciudadNombre}
          </h3>
          <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
            <li>Toma 3 o 4 fotos con luz natural y sube la principal bien nítida.</li>
            <li>Escribe un título con marca, modelo y estado real del producto.</li>
            <li>Fija el precio en dólares (el comprador ve además la referencia en bolívares).</li>
            <li>
              Selecciona {ciudadNombre} como ubicación para aparecer en esta página y en el
              catálogo.
            </li>
          </ol>
          <LocalLink
            href="/publicar"
            className="mt-4 inline-flex items-center gap-1 font-bold text-brand-primary hover:underline"
          >
            Publicar anuncio gratis en {ciudadNombre} →
          </LocalLink>
        </div>
      </div>

      <div className="rounded-2xl bg-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-2">
          ¿Por qué comprar {cat} en {ciudadNombre} y no fuera?
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Comprar localmente en {ciudadNombre} te permite ver el producto antes de pagar y evitar
          fletes o envíos entre estados, que en Venezuela suelen ser lentos y costosos. Para el
          vendedor, publicar en la página de su ciudad hace que el anuncio le aparezca a personas
          que ya están cerca y pueden concretar la entrega en persona.
        </p>
      </div>
    </section>
  )
}
