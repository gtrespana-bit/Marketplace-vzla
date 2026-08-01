/**
 * Regression tests para el Service Worker (public/sw.js).
 *
 * Contexto del bug: un corte de red transitorio (blip de conectividad, muy
 * común en redes móviles) hacía que el SW respondiera 503 al instante, y la
 * consola mostraba "Failed to load resource: the server responded with a
 * status of 503 ()". Ahora fetchWithRetry reintenta antes de rendirse, y el
 * 503 solo aparece si la red sigue caída tras agotar los reintentos.
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
  private body: string

  constructor(
    body?: string | null,
    init: { status?: number; statusText?: string; headers?: HeadersInitLike } = {}
  ) {
    this.body = body ?? ''
    this.status = init.status ?? 200
    this.statusText = init.statusText ?? ''
    this.ok = this.status >= 200 && this.status < 300
    this.headers = new MockHeaders(init.headers)
  }

  clone(): MockResponse {
    return new MockResponse(this.body, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
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

  constructor(url: string, init: Record<string, any> = {}) {
    this.url = url
    this.method = (init.method || 'GET').toUpperCase()
    this.headers = new MockHeaders(init.headers)
    this.destination = init.destination || ''
    this.mode = init.mode || 'cors'
  }

  clone(): MockRequest {
    return new MockRequest(this.url, {
      method: this.method,
      headers: this.headers,
      destination: this.destination,
      mode: this.mode,
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

describe('Service Worker: fallos de red transitorios (503)', () => {
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

  test('tras agotar los reintentos, responde 503 con error offline (API)', async () => {
    const fetchImpl: FetchImpl = async () => {
      throw new TypeError('Failed to fetch')
    }
    const { dispatchFetch } = loadSW(fetchImpl)
    const { response } = dispatchFetch('https://vendet.online/api/tasa-bcv')
    const res = await response!
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.error).toBe('offline')
  })

  test('tras agotar los reintentos, responde 503 para REST de Supabase (no imagen)', async () => {
    const fetchImpl: FetchImpl = async () => {
      throw new TypeError('Failed to fetch')
    }
    const { dispatchFetch } = loadSW(fetchImpl)
    const { response } = dispatchFetch(REST_URL)
    const res = await response!
    expect(res.status).toBe(503)
  })
})
