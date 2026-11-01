/**
 * Regresión de S4: la CSP no debe volver a abrirse.
 *
 * El caso real que motivó esto: `script-src` incluía `'unsafe-eval'`, que no lo
 * necesita nada del proyecto (verificado en navegador: /, /catalogo, /creditos,
 * /publicar, /login y /producto hidratan e interactúan sin un solo bloqueo).
 * Con `unsafe-eval` un XSS puede ejecutar código arbitrario desde una cadena.
 *
 * `'unsafe-inline'` se queda a propósito: quitarlo exige nonces, y los nonces
 * obligan a renderizar en cada petición las 25 rutas que hoy son ISR/SSG. La
 * decisión está documentada en `src/lib/security-headers.js`.
 */
const fs = require('fs')
const path = require('path')
const { buildCSP, supabaseOrigins } = require('@/lib/security-headers')

const ROOT = path.resolve(__dirname, '../..')

function directiva(csp: string, nombre: string): string {
  return csp.split(';').map((d) => d.trim()).find((d) => d.startsWith(nombre + ' ')) ?? ''
}

describe('script-src', () => {
  it('NO incluye unsafe-eval', () => {
    expect(directiva(buildCSP(undefined), 'script-src')).not.toContain("'unsafe-eval'")
  })

  it('no incluye vercel.live (su script necesita eval y no es de producción)', () => {
    expect(buildCSP(undefined)).not.toContain('vercel.live')
  })

  it('conserva unsafe-inline, y el motivo está escrito en el código', () => {
    expect(directiva(buildCSP(undefined), 'script-src')).toContain("'unsafe-inline'")
    const fuente = fs.readFileSync(path.join(ROOT, 'src/lib/security-headers.js'), 'utf8')
    expect(fuente).toMatch(/ISR|SSG/)
    expect(fuente).toMatch(/nonce/i)
  })

  it('permite Google Analytics (gtag.js)', () => {
    expect(directiva(buildCSP(undefined), 'script-src')).toContain('https://www.googletagmanager.com')
  })
})

describe('directivas que limitan el daño de un inline', () => {
  const csp = buildCSP(undefined)

  it('object-src none', () => expect(directiva(csp, 'object-src')).toContain("'none'"))
  it('frame-ancestors none', () => expect(directiva(csp, 'frame-ancestors')).toContain("'none'"))
  it('base-uri self', () => expect(directiva(csp, 'base-uri')).toContain("'self'"))
  it('form-action self', () => expect(directiva(csp, 'form-action')).toContain("'self'"))
  it('default-src self', () => expect(directiva(csp, 'default-src')).toContain("'self'"))
})

describe('connect-src derivado de NEXT_PUBLIC_SUPABASE_URL', () => {
  it('sin variable mantiene los comodines de Supabase', () => {
    const connect = directiva(buildCSP(undefined), 'connect-src')
    expect(connect).toContain('https://*.supabase.co')
    expect(connect).toContain('wss://*.supabase.co')
  })

  it('proyecto alojado: añade su host exacto y el wss', () => {
    const connect = directiva(buildCSP('https://jmbkqelkusxjebsdnjoc.supabase.co'), 'connect-src')
    expect(connect).toContain('https://jmbkqelkusxjebsdnjoc.supabase.co')
    expect(connect).toContain('wss://jmbkqelkusxjebsdnjoc.supabase.co')
  })

  it('Supabase autoalojado: el comodín *.supabase.co NO lo cubriría, el host sí', () => {
    const connect = directiva(buildCSP('https://api.midominio.com'), 'connect-src')
    expect(connect).toContain('https://api.midominio.com')
    expect(connect).toContain('wss://api.midominio.com')
  })

  it('entorno local: permite http:// y ws:// del mismo puerto (evita bloqueos silenciosos)', () => {
    const connect = directiva(buildCSP('http://localhost:54321'), 'connect-src')
    expect(connect).toContain('http://localhost:54321')
    expect(connect).toContain('ws://localhost:54321')
  })

  it('una URL inválida no rompe: cae a los comodines', () => {
    expect(supabaseOrigins('no-es-una-url')).not.toContain('no-es-una-url')
    expect(directiva(buildCSP('no-es-una-url'), 'connect-src')).toContain('https://*.supabase.co')
  })

  it('no duplica orígenes', () => {
    const origenes = supabaseOrigins('https://jmbkqelkusxjebsdnjoc.supabase.co').split(' ')
    expect(origenes.length).toBe(new Set(origenes).size)
  })
})

describe('archivos de configuración', () => {
  it('next.config.js delega la CSP en el módulo (una sola fuente de verdad)', () => {
    const config = fs.readFileSync(path.join(ROOT, 'next.config.js'), 'utf8')
    expect(config).toContain('buildCSP')
    expect(config).not.toContain("'unsafe-eval'")
  })

  it('no hay configs huérfanos que puedan reactivarse por accidente', () => {
    const sueltos = fs.readdirSync(ROOT).filter((f) => /^next\.config\..+\.js$/.test(f))
    // `next.config.optimized.js` era una copia sin usar con
    // dangerouslyAllowSVG: true; se eliminó porque un `cp` despistado la
    // habría activado (SVG externo = XSS almacenado en el dominio del sitio).
    expect(sueltos).toEqual([])
  })

  it('el config activo no habilita dangerouslyAllowSVG', () => {
    const config = fs.readFileSync(path.join(ROOT, 'next.config.js'), 'utf8')
    expect(config).toMatch(/dangerouslyAllowSVG:\s*false/)
    expect(config).not.toMatch(/dangerouslyAllowSVG:\s*true/)
  })
})
