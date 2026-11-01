/**
 * Regresión de S5: `/api/tasa-bcv` devolvía 429 con uso normal porque cada
 * montaje de componente pedía la tasa ignorando la caché de localStorage.
 *
 * Lo que se protege aquí:
 *  1. Caché fresca  -> CERO peticiones de red.
 *  2. Caché caducada -> UNA petición y se reescribe el registro.
 *  3. 429 / 5xx      -> se conserva el último valor conocido (no el 746 fijo).
 *  4. Red caída      -> ídem, sin lanzar.
 *  5. Concurrencia   -> N llamadas simultáneas = 1 sola petición.
 */

const CACHE_DURATION = 15 * 60 * 1000
const MINUTO = 60 * 1000

type Registro = { data: { tasa: number; fuente: string; ultimaActualizacion: string }; timestamp: number }

let fetchMock: jest.Mock

function escribirCache(tasa: number, edadMs: number, fuente: 'api' | 'fallback' = 'api') {
  const registro: Registro = {
    data: { tasa, fuente, ultimaActualizacion: new Date().toISOString() },
    timestamp: Date.now() - edadMs,
  }
  window.localStorage.setItem('tasa_bcv', JSON.stringify(registro))
}

function leerCache(): Registro | null {
  const raw = window.localStorage.getItem('tasa_bcv')
  return raw ? (JSON.parse(raw) as Registro) : null
}

/** jsdom ya ofrece `window` y `localStorage`; sólo hay que reiniciar el módulo. */
function cargarModulo() {
  jest.resetModules()
  return require('@/lib/tasaBCV')
}

beforeEach(() => {
  window.localStorage.clear()
  fetchMock = jest.fn()
  ;(global as any).fetch = fetchMock
})

const respuestaOk = (tasa: number) => ({
  ok: true,
  json: async () => ({ tasa, fuente: 'api', ultimaActualizacion: 'ahora' }),
})
const respuestaError = (status: number) => ({ ok: false, status, json: async () => ({}) })

describe('fetchTasaConCache', () => {
  it('con caché fresca NO hace ninguna petición de red', async () => {
    const { fetchTasaConCache } = cargarModulo()
    escribirCache(755, 2 * MINUTO)

    const tasa = await fetchTasaConCache()

    expect(tasa.tasa).toBe(755)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sirve la caché fresca aunque se guardó como `fallback` (el bug original)', async () => {
    const { fetchTasaConCache } = cargarModulo()
    escribirCache(750, MINUTO, 'fallback')

    const tasa = await fetchTasaConCache()

    expect(tasa.tasa).toBe(750)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('con caché caducada hace UNA petición y reescribe el registro', async () => {
    const { fetchTasaConCache } = cargarModulo()
    escribirCache(700, CACHE_DURATION + MINUTO)
    fetchMock.mockResolvedValue(respuestaOk(760))

    const tasa = await fetchTasaConCache()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('/api/tasa-bcv')
    expect(tasa.tasa).toBe(760)
    const guardado = leerCache()
    expect(guardado?.data.tasa).toBe(760)
    expect(Date.now() - (guardado?.timestamp ?? 0)).toBeLessThan(MINUTO)
  })

  it('ante 429 conserva el último valor conocido, no el fallback fijo', async () => {
    const { fetchTasaConCache } = cargarModulo()
    // Caducada hace 20 min, pero con una tasa real guardada (755, no el 746 fijo)
    escribirCache(755, 20 * MINUTO)
    fetchMock.mockResolvedValue(respuestaError(429))

    const tasa = await fetchTasaConCache()

    expect(tasa.tasa).toBe(755)
  })

  it('ante 5xx conserva el último valor conocido', async () => {
    const { fetchTasaConCache } = cargarModulo()
    escribirCache(755, CACHE_DURATION + MINUTO)
    fetchMock.mockResolvedValue(respuestaError(503))

    const tasa = await fetchTasaConCache()

    expect(tasa.tasa).toBe(755)
  })

  it('si la red lanza (offline) no propaga el error y devuelve lo último conocido', async () => {
    const { fetchTasaConCache } = cargarModulo()
    escribirCache(755, CACHE_DURATION + MINUTO)
    fetchMock.mockRejectedValue(new Error('offline'))

    await expect(fetchTasaConCache()).resolves.toMatchObject({ tasa: 755 })
  })

  it('sin caché previa y sin red cae al valor de contingencia', async () => {
    const { fetchTasaConCache, FALLBACK_BCV_RATE } = cargarModulo()
    fetchMock.mockRejectedValue(new Error('offline'))

    const tasa = await fetchTasaConCache()

    expect(tasa.tasa).toBe(FALLBACK_BCV_RATE)
  })

  it('deduplica peticiones concurrentes en una sola llamada de red', async () => {
    const { fetchTasaConCache } = cargarModulo()
    fetchMock.mockResolvedValue(respuestaOk(770))

    const [a, b, c] = await Promise.all([
      fetchTasaConCache(),
      fetchTasaConCache(),
      fetchTasaConCache(),
    ])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect([a.tasa, b.tasa, c.tasa]).toEqual([770, 770, 770])
  })

  it('una caché corrupta no rompe y se recupera con red', async () => {
    const { fetchTasaConCache } = cargarModulo()
    window.localStorage.setItem('tasa_bcv', '{esto no es json')
    fetchMock.mockResolvedValue(respuestaOk(780))

    const tasa = await fetchTasaConCache()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(tasa.tasa).toBe(780)
  })

  it('ignora un registro sin tasa válida y no lo sirve como caché', async () => {
    const { fetchTasaConCache } = cargarModulo()
    window.localStorage.setItem('tasa_bcv', JSON.stringify({ data: {}, timestamp: Date.now() }))
    fetchMock.mockResolvedValue(respuestaOk(790))

    const tasa = await fetchTasaConCache()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(tasa.tasa).toBe(790)
  })
})

describe('getTasaBCVClient', () => {
  it('devuelve el valor guardado aunque esté caducado (mejor una tasa vieja que una inventada)', () => {
    const { getTasaBCVClient } = cargarModulo()
    escribirCache(755, 3 * CACHE_DURATION)

    expect(getTasaBCVClient().tasa).toBe(755)
  })

  it('sin nada guardado devuelve la contingencia', () => {
    const { getTasaBCVClient, FALLBACK_BCV_RATE } = cargarModulo()
    expect(getTasaBCVClient().tasa).toBe(FALLBACK_BCV_RATE)
  })
})
