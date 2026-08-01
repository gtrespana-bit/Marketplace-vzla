/**
 * Regression tests para el Service Worker (public/sw.js).
 *
 * Contexto del bug: un corte de red transitorio (blip de conectividad, muy
 * común en redes móviles) hacía que el SW respondiera 503 sintéticos, y la
 * consola mostraba "Failed to load resource: the server responded with a
 * status of 503 ()" aunque el servidor estuviera sano.
 *
 * Comportamiento v6: fetchWithRetry reintenta los fallos de red y, si la red
 * sigue caída, propaga un ERROR DE RED real (Response.error(), status 0) en
 * vez de inventar un status HTTP 503. Además distingue el abort propio del
 * timeout (reintentable) de la cancelación por la página (no reintentable).
 *
 * El SW se ejecuta en un contexto vm con stubs mínimos de Response/Request
 * (el entorno jsdom de Jest no expone fetch/Request/Response).
 */
import * as fs from 'fs'
import * as path from 'path'
import * as vm from 'vm'

const SW_PATH = path.join(__dirname, '../../public/sw.js')

// ── Stubs mínimos compatibles con lo que usa sw.js ──────────────────────────

type HeadersInitLike = Record<string, string> | Headers | MockHeaders | undefined

class MockHeaders {
  private map = new Map<string, string>()
  constructor(init?: HeadersInitLike) {
    if (init instanceof Headers || init instanceof MockHeaders) {
      init.forEach((v, k) => this.map.set(k.toLowerCase(), v))
    } else if (init) {
      Object.entries(init).forEach(([k, v]) => this.map.set(k.toLowerCase(), v))
    }
  }
  get(name: string): string | null {
    return this.map.get(name.toLowerCase()) ?? null
  }
  has(name: string): boolean {
    return this.map.has(name.toLowerCase())
  }
  set(name: string, value: string): void {
    this.map.set(name.toLowerCase(), value)
  }
  append(name: string, value: string): void {
    this.map.set(name.toLowerCase(), value)
  }
  entries(): IterableIterator<[string, string]> {
    return this.map.entries()
  }
  forEach(cb: (value: string, key: string) => void): void {
    this.map.forEach(cb)
  }
}

class MockResponse {
  readonly status: number
  readonly statusText: string
  readonly ok: boolean
  readonly headers: MockHeaders
  readonly type: string
  private body: string

  constructor(
    body?: string | null,
    init: { status?: number; statusText?: string; headers?: HeadersInitLike; type?: string } = {}
  ) {
    this.body = body ?? ''
    this.status = init.status ?? 200
    this.statusText = init.statusText ?? ''
    this.ok = this.status >= 200 && this.status < 300
    this.headers = new MockHeaders(init.headers)
    this.type = init.type ?? 'basic'
  }

  // Réplica de Response.error(): un "network error response" (status 0).
  static error(): MockResponse {
    return new MockResponse(null, { status: 0, statusText: '', type: 'error' })
  }

  clone(): MockResponse {
    return new MockResponse(this.body, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
      type: this.type,
    })
  }

  async json(): Promise<any> {
    return JSON.parse(this.body)
  }

  async text(): Promise<string> {
    return this.body
  }

  async blob(): Promise<{ size: number }> {
    return { size: this.body.length }
  }
}

class MockRequest {
  readonly url: string
  readonly method: string
  readonly headers: MockHeaders
  readonly destination: string
  readonly mode: string
  readonly signal: AbortSignal | null

  constructor(url: string, init: Record<string, any> = {}) {
    this.url = url
    this.method = (init.method || 'GET').toUpperCase()
    this.headers = new MockHeaders(init.headers)
    this.destination = init.destination || ''
    this.mode = init.mode || 'cors'
    this.signal = init.signal ?? null
  }

  clone(): MockRequest {
    return new MockRequest(this.url, {
      method: this.method,
      headers: this.headers,
      destination: this.destination,
      mode: this.mode,
      signal: this.signal,
    })
  }
}

// ── Carga del SW en un contexto aislado ─────────────────────────────────────

type FetchImpl = (req: MockRequest, init?: { signal?: AbortSignal }) => Promise<MockResponse>

function loadSW(fetchImpl: FetchImpl) {
  const code = fs.readFileSync(SW_PATH, 'utf8')
  const listeners: Record<string, ((e: any) => void)[]> = {}
  const cachesStore = new Map<string, MockResponse>()

  const cachesMock = {
    open: async () => {
      const cache = {
        match: async (req: MockRequest | string) => {
          const key = typeof req === 'string' ? req : req.url
          const hit = cachesStore.get(key)
          return hit ? hit.clone() : undefined
        },
        put: async (req: MockRequest | string, res: MockResponse) => {
          cachesStore.set(typeof req === 'string' ? req : req.url, res.clone())
        },
        add: async () => {},
      }
      return cache
    },
    keys: async () => [...cachesStore.keys()],
    delete: async () => true,
  }

  const sandbox: any = {
    console,
    URL,
    AbortController,
    setTimeout,
    clearTimeout,
    Date,
    JSON,
    Promise,
    Request: MockRequest,
    Response: MockResponse,
    fetch: fetchImpl,
    caches: cachesMock,
    registration: { showNotification: async () => {} },
    clients: { claim: async () => {}, matchAll: async () => [], openWindow: async () => {} },
    addEventListener: (type: string, cb: any) => {
      ;(listeners[type] ||= []).push(cb)
    },
    skipWaiting: () => {},
  }
  sandbox.self = sandbox

  vm.createContext(sandbox)
  vm.runInContext(code, sandbox, { filename: 'sw.js' })

  const dispatchFetch = (
    url: string,
    init: Record<string, any> = {}
  ): { request: MockRequest; response: Promise<MockResponse> | null } => {
    const request = new MockRequest(url, init)
    let respondWithPromise: Promise<MockResponse> | null = null
    const event = {
      request,
      respondWith: (p: Promise<MockResponse>) => {
        respondWithPromise = p
      },
    }
    for (const cb of listeners['fetch'] || []) cb(event)
    return { request, response: respondWithPromise }
  }

  return { dispatchFetch, cachesStore }
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Service Worker: fallos de red transitorios', () => {
  const REST_URL = 'https://jmbkqelkusxjebsdnjoc.supabase.co/rest/v1/productos?select=id'

  test('no reintenta cuando la petición responde correctamente (200)', async () => {
    let calls = 0
    const fetchImpl: FetchImpl = async () => {
      calls++
      return new MockResponse('{"data":[]}', { status: 200 })
    }
    const { dispatchFetch } = loadSW(fetchImpl)
    const { response } = dispatchFetch(REST_URL)
    const res = await response!
    expect(calls).toBe(1)
    expect(res.status).toBe(200)
  })

  test('reintenta y devuelve 200 si el fallo de red fue transitorio', async () => {
    let calls = 0
    const fetchImpl: FetchImpl = async () => {
      calls++
      if (calls === 1) throw new TypeError('Failed to fetch')
      return new MockResponse('{"data":[]}', { status: 200 })
    }
    const { dispatchFetch } = loadSW(fetchImpl)
    const { response } = dispatchFetch(REST_URL)
    const res = await response!
    expect(calls).toBe(2)
    expect(res.status).toBe(200)
  })

  test('reintenta también ante AbortError propio del timeout (no lo confunde con cancelación de página)', async () => {
    let calls = 0
    const fetchImpl: FetchImpl = async () => {
      calls++
      if (calls === 1) {
        const err = new Error('The operation was aborted')
        err.name = 'AbortError'
        throw err
      }
      return new MockResponse('{"data":[]}', { status: 200 })
    }
    const { dispatchFetch } = loadSW(fetchImpl)
    const { response } = dispatchFetch(REST_URL)
    const res = await response!
    expect(calls).toBe(2)
    expect(res.status).toBe(200)
  })

  test('NO reintenta si la página canceló la petición (request.signal abortado)', async () => {
    let calls = 0
    const fetchImpl: FetchImpl = async () => {
      calls++
      const err = new Error('The operation was aborted')
      err.name = 'AbortError'
      throw err
    }
    const controller = new AbortController()
    controller.abort() // la página ya canceló antes de que falle el fetch
    const { dispatchFetch } = loadSW(fetchImpl)
    const { response } = dispatchFetch(REST_URL, { signal: controller.signal })
    // La garantía clave es NO quemar reintentos en una petición cancelada
    // (la página ya no quiere la respuesta). El SW responde network-error.
    const res = await response!
    expect(res.type).toBe('error')
    expect(calls).toBe(1)
  })

  test('tras agotar los reintentos, propaga un error de red real (API) — no un 503 sintético', async () => {
    let calls = 0
    const fetchImpl: FetchImpl = async () => {
      calls++
      throw new TypeError('Failed to fetch')
    }
    const { dispatchFetch } = loadSW(fetchImpl)
    const { response } = dispatchFetch('https://vendet.online/api/tasa-bcv')
    const res = await response!
    // Response.error(): status 0 / type 'error' — el caller ve un fallo de red,
    // no un "503 del servidor" falso en consola.
    expect(res.status).toBe(0)
    expect(res.type).toBe('error')
    expect(calls).toBe(3) // 1 intento + 2 reintentos
  })

  test('tras agotar los reintentos, propaga un error de red real para REST de Supabase (no imagen)', async () => {
    const fetchImpl: FetchImpl = async () => {
      throw new TypeError('Failed to fetch')
    }
    const { dispatchFetch } = loadSW(fetchImpl)
    const { response } = dispatchFetch(REST_URL)
    const res = await response!
    expect(res.status).toBe(0)
    expect(res.type).toBe('error')
  })

  test('no intercepta peticiones RSC de Next.js (?_rsc=)', async () => {
    let calls = 0
    const fetchImpl: FetchImpl = async () => {
      calls++
      return new MockResponse('{"data":[]}', { status: 200 })
    }
    const { dispatchFetch } = loadSW(fetchImpl)
    const { response } = dispatchFetch('https://vendet.online/catalogo?_rsc=abc123', {
      headers: { RSC: '1' },
    })
    // Sin respondWith: la petición pasa directo a la red, el SW no la toca.
    expect(response).toBeNull()
    expect(calls).toBe(0)
  })
})
