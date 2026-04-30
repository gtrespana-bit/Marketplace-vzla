// Tasa USD → Bs. Híbrida: API automática + fallback manual
// Si la API falla, usa el fallback. Se refresca cada 1 hora.

const FALLBACK_RATE = 90

interface TasaData {
  tasa: number
  fuente: 'api' | 'fallback'
  ultimaActualizacion: string
}

let cache: TasaData | null = null
let cacheTime = 0
const CACHE_DURATION = 3600 * 1000 // 1 hora

// Intenta obtener tasa de pydolarve.org (API gratuita de Venezuela)
async function fetchFromAPI(): Promise<number | null> {
  try {
    const resp = await fetch('https://pydolarve.org/api/v1/dollar?page=bcv', {
      next: { revalidate: 3600 }, // Cache SSR de Next.js: 1 hora
    })
    if (!resp.ok) return null

    const data = await resp.json()
    // La estructura de pydolarve: { dollars: { usd: { price, last_update } } }
    if (data?.dollars?.usd?.price) {
      return parseFloat(data.dollars.usd.price)
    }
    // Formato alternativo: { price, monitor, change, last_update }
    if (data?.price) {
      return parseFloat(data.price)
    }
    return null
  } catch {
    // Fallback a API alternativa: exchangerate-api o scraping-free
    try {
      const resp2 = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
        next: { revalidate: 3600 },
      })
      if (resp2.ok) {
        const data2 = await resp2.json()
        // Esta API da tasas internacionales, no BCV exacto
        // VES = Bolívar, pero es tasa paralela/BCV aproximado
        if (data2?.rates?.VES) {
          // VES está en centimos, dividir por 100000 (bolívares digitales)
          // 1 USD ≈ X VES, en bolívares actuales = VES / 100000
          return Math.round((data2.rates.VES / 100000) * 100) / 100
        }
      }
    } catch {
      // Segunda API falló también
    }
    return null
  }
}

export async function getTasaBCV(): Promise<TasaData> {
  // Cache en memoria del servidor
  if (cache && Date.now() - cacheTime < CACHE_DURATION) {
    return cache
  }

  const apiRate = await fetchFromAPI()

  if (apiRate && apiRate > 10) {
    cache = {
      tasa: Math.round(apiRate * 100) / 100,
      fuente: 'api',
      ultimaActualizacion: new Date().toLocaleString('es-VE'),
    }
  } else {
    cache = {
      tasa: FALLBACK_RATE,
      fuente: 'fallback',
      ultimaActualizacion: 'Tasa manual (pendiente actualización)',
    }
  }

  cacheTime = Date.now()
  return cache
}

// Versión síncrona para cliente (usa localStorage cache)
export function getTasaBCVClient(): TasaData {
  if (typeof window === 'undefined') {
    return { tasa: FALLBACK_RATE, fuente: 'fallback', ultimaActualizacion: '' }
  }

  try {
    const cached = localStorage.getItem('tasa_bcv')
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        return parsed.data
      }
    }
  } catch {
    // Cache corrupted
  }

  return { tasa: FALLBACK_RATE, fuente: 'fallback', ultimaActualizacion: '' }
}

export async function actualizarTasaClient(): Promise<TasaData> {
  if (typeof window === 'undefined') {
    return getTasaBCVClient()
  }

  try {
    const resp = await fetch('/api/tasa-bcv')
    const data = await resp.json()

    localStorage.setItem('tasa_bcv', JSON.stringify({
      data,
      timestamp: Date.now(),
    }))

    return data
  } catch {
    return getTasaBCVClient()
  }
}
