// Tasa USD -> Bs. Fuente remota BCV con una contingencia única y explícita.
export const FALLBACK_BCV_RATE = 746
const CACHE_DURATION = 15 * 60 * 1000

export interface TasaData {
  tasa: number
  fuente: 'api' | 'fallback'
  ultimaActualizacion: string
}

let cache: TasaData | null = null
let cacheTime = 0

export function usdToBs(usd: number, rate: number): number {
  return Math.round(usd * rate * 100) / 100
}

async function fetchFromAPI(): Promise<number | null> {
  try {
    const response = await fetch('https://ve.dolarapi.com/v1/dolares', {
      next: { revalidate: CACHE_DURATION / 1000 },
      signal: AbortSignal.timeout(8_000),
    })
    if (!response.ok) return null
    const data = await response.json()
    // La API puede devolver una lista de casas o `{ promedio }` para la oficial.
    const oficial = Array.isArray(data)
      ? data.find((item: any) => item?.fuente === 'oficial')
      : data?.fuente === 'oficial' || data?.promedio != null
        ? data
        : null
    const rate = Number(oficial?.promedio)
    // El bolívar no baja de ~10 Bs/USD desde 2021; por debajo es un dato corrupto.
    return Number.isFinite(rate) && rate > 10 ? rate : null
  } catch {
    return null
  }
}

export async function getTasaBCV(): Promise<TasaData> {
  if (cache && Date.now() - cacheTime < CACHE_DURATION) return cache

  const apiRate = await fetchFromAPI()
  cache = apiRate
    ? { tasa: Math.round(apiRate * 100) / 100, fuente: 'api', ultimaActualizacion: new Date().toLocaleString('es-VE') }
    : { tasa: FALLBACK_BCV_RATE, fuente: 'fallback', ultimaActualizacion: 'Tasa de contingencia' }
  cacheTime = Date.now()
  return cache
}

/**
 * Lee el registro guardado en localStorage, **sin** juzgar si está caducado.
 * Es el único punto que toca `localStorage` para la tasa: la decisión de
 * refrescar vive en `fetchTasaConCache`, no aquí.
 */
function leerCacheCliente(): { data: TasaData; edadMs: number } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('tasa_bcv')
    if (!raw) return null
    const stored = JSON.parse(raw)
    if (!stored?.data?.tasa || typeof stored.timestamp !== 'number') return null
    return { data: stored.data as TasaData, edadMs: Date.now() - stored.timestamp }
  } catch {
    return null // caché corrupta o localStorage bloqueado
  }
}

/**
 * Última tasa conocida en el cliente. Devuelve el valor guardado aunque esté
 * caducado: es mejor pintar la tasa de hace 20 minutos —y refrescarla justo
 * después— que un número fijo inventado. Sólo cae al valor por defecto cuando
 * no hay nada guardado.
 */
export function getTasaBCVClient(): TasaData {
  const guardado = leerCacheCliente()
  if (guardado) return guardado.data
  return { tasa: FALLBACK_BCV_RATE, fuente: 'fallback', ultimaActualizacion: 'Actualizando tasa…' }
}

/**
 * Obtiene la tasa desde el cliente respetando la caché de localStorage.
 *
 * ⚠️ POR QUÉ EXISTE (S5): el endpoint tiene un rate limit de 60/h **por IP**, y
 * una IP pública es una oficina o una familia entera compartiendo salida NAT.
 * El 429 llegaba con un uso perfectamente normal.
 *
 * El problema de fondo era `actualizarTasaClient()`: se llamaba en el montaje de
 * cada componente y **siempre** hacía red, ignorando la caché que ya tenía al
 * lado. Eso generaba 2 peticiones por visita al dashboard y una por ficha de
 * producto, multiplicado por todos los usuarios de esa IP.
 *
 * Ahora:
 *  - Si la caché está fresca (< 15 min) NO se toca la red.
 *  - Si la red falla (429/5xx/offline) se devuelve la última tasa conocida.
 *  - Las peticiones concurrentes se deduplican (una sola promesa en vuelo).
 */
let tasaEnVuelo: Promise<TasaData> | null = null

export async function fetchTasaConCache(): Promise<TasaData> {
  const guardado = leerCacheCliente()
  // OJO: no sirve comprobar `fuente === 'api'`. Si la tasa real se guardó con
  // `fuente: 'fallback'` porque el proveedor no respondió en esa petición, la
  // caché está fresca igual; mirar la fuente hacía que se pidiera de nuevo en
  // cada montaje. La única pregunta válida es la ANTIGÜEDAD del registro.
  if (guardado && guardado.edadMs < CACHE_DURATION) return guardado.data
  // Lo último conocido sirve de red de seguridad si la petición falla.
  const ultimoConocido = guardado?.data ?? getTasaBCVClient()
  if (tasaEnVuelo) return tasaEnVuelo

  tasaEnVuelo = (async () => {
    try {
      const response = await fetch('/api/tasa-bcv')
      if (!response.ok) return ultimoConocido // 429 / 5xx: seguimos con lo último válido
      const data: TasaData = await response.json()
      if (data?.tasa) {
        try {
          localStorage.setItem('tasa_bcv', JSON.stringify({ data, timestamp: Date.now() }))
        } catch { /* localStorage lleno o bloqueado */ }
      }
      return data
    } catch {
      return ultimoConocido
    } finally {
      tasaEnVuelo = null
    }
  })()

  return tasaEnVuelo
}

/**
 * @deprecated Usa `fetchTasaConCache()`. Se mantiene como alias para no tocar
 * a sus consumidores (dashboard y ficha de producto), pero ahora **sí** respeta
 * la caché en lugar de pedir siempre a la red. Ese comportamiento era el bug.
 */
export async function actualizarTasaClient(): Promise<TasaData> {
  return fetchTasaConCache()
}
