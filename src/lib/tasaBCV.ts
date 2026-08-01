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
    const oficial = Array.isArray(data) && data.find((item: any) => item.fuente === 'oficial')
    const rate = Number(oficial?.promedio)
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

export function getTasaBCVClient(): TasaData {
  if (typeof window === 'undefined') return { tasa: FALLBACK_BCV_RATE, fuente: 'fallback', ultimaActualizacion: 'Tasa de contingencia' }
  try {
    const cached = localStorage.getItem('tasa_bcv')
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Date.now() - parsed.timestamp < CACHE_DURATION && parsed.data?.tasa) return parsed.data
    }
  } catch { /* ignore corrupt client cache */ }
  return { tasa: FALLBACK_BCV_RATE, fuente: 'fallback', ultimaActualizacion: 'Actualizando tasa…' }
}

export async function actualizarTasaClient(): Promise<TasaData> {
  if (typeof window === 'undefined') return getTasaBCVClient()
  try {
    const response = await fetch('/api/tasa-bcv')
    if (!response.ok) throw new Error('Tasa no disponible')
    const data: TasaData = await response.json()
    localStorage.setItem('tasa_bcv', JSON.stringify({ data, timestamp: Date.now() }))
    return data
  } catch {
    return getTasaBCVClient()
  }
}
