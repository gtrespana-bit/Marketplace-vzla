/**
 * Regresión: hallazgos S1 y S2 de REVISION-2026-11.md.
 *
 * S2 — `x-forwarded-for` es una LISTA ("cliente, proxy1, proxy2"). Cuatro
 * endpoints (login, contacto, publicar, comprar-creditos) la usaban ENTERA
 * como identificador del rate limit, así que dos peticiones del mismo cliente
 * detrás de proxies distintos generaban claves distintas y el límite se podía
 * esquivar. Ahora todos pasan por `getClientIp()`, que normaliza al primer
 * salto.
 *
 * S1 — `/api/contacto` limitaba sólo por IP: un bot con IPs rotativas llenaba
 * el buzón. Ahora hay además un límite por email.
 */
import fs from 'fs'
import path from 'path'

const read = (...p: string[]) => fs.readFileSync(path.join(process.cwd(), ...p), 'utf8')

describe('S2: extracción de IP normalizada', () => {
  const rateLimit = read('src', 'lib', 'rate-limit.ts')

  it('getClientIp toma el primer salto de x-forwarded-for (no la lista completa)', () => {
    expect(rateLimit).toContain('getClientIp')
    expect(rateLimit).toMatch(/split\(','\)\[0\]/)
  })

  it('valida el formato de la IP antes de usarla como clave', () => {
    // Sin validación, un cliente podría inyectar basura como identificador.
    expect(rateLimit).toMatch(/\[0-9a-fA-F:\.\]\{3,45\}/)
  })

  it('tiene fallback a x-real-ip y a cloudflare', () => {
    expect(rateLimit).toContain("x-real-ip")
    expect(rateLimit).toContain("cf-connecting-ip")
    expect(rateLimit).toContain("return 'unknown'")
  })

  it('ningún endpoint vuelve a leer x-forwarded-for a mano', () => {
    const endpoints = [
      ['src', 'app', 'api', 'login', 'route.ts'],
      ['src', 'app', 'api', 'contacto', 'route.ts'],
      ['src', 'app', 'api', 'publicar', 'route.ts'],
      ['src', 'app', 'api', 'comprar-creditos', 'route.ts'],
    ]
    for (const parts of endpoints) {
      const src = read(...parts)
      expect(src).not.toContain("headers.get('x-forwarded-for')")
      expect(src).toContain('getClientIp(req)')
    }
  })
})

describe('S1: contacto limita también por email', () => {
  const contacto = read('src', 'app', 'api', 'contacto', 'route.ts')
  const rateLimit = read('src', 'lib', 'rate-limit.ts')

  it('existe un límite propio para la clave por email', () => {
    expect(rateLimit).toContain("'contacto:email'")
  })

  it('el endpoint comprueba IP y email, y exige que ambas pasen', () => {
    expect(contacto).toContain("checkRateLimit('contacto:send'")
    expect(contacto).toContain("checkRateLimit('contacto:email'")
    // Con que una de las dos se pase, se corta.
    expect(contacto).toMatch(/return byIp\.ok && byEmail\.ok/)
  })

  it('el email se normaliza en minúsculas antes de ser clave', () => {
    // Si no, "Ana@X.com" y "ana@x.com" serían dos claves distintas.
    expect(contacto).toContain('email.toLowerCase()')
  })

  it('valida ANTES de gastar una comprobación de rate limit', () => {
    // Una clave por email con un valor arbitrario del cliente permite crear
    // filas de rate limit basura sin límite.
    const idxValidateEmail = contacto.indexOf('isValidEmail(email)')
    // Ojo: `checkContactRateLimit` se DEFINE arriba; lo que importa es dónde
    // se LLAMA dentro del handler.
    const idxRateLimit = contacto.indexOf('await checkContactRateLimit(')
    expect(idxValidateEmail).toBeGreaterThan(-1)
    expect(idxRateLimit).toBeGreaterThan(-1)
    expect(idxValidateEmail).toBeLessThan(idxRateLimit)
  })

  it('un body JSON inválido devuelve 400 y no 500', () => {
    expect(contacto).toContain('Solicitud inválida')
    expect(contacto).toMatch(/try \{\s*\n\s*body = await req\.json\(\)/)
  })
})

describe('Next 16: middleware.ts migrado a proxy.ts', () => {
  it('existe src/proxy.ts y ya no src/middleware.ts', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'src', 'proxy.ts'))).toBe(true)
    expect(fs.existsSync(path.join(process.cwd(), 'src', 'middleware.ts'))).toBe(false)
  })

  it('exporta la función con el nombre que espera Next 16', () => {
    const proxy = read('src', 'proxy.ts')
    expect(proxy).toMatch(/export default async function proxy\(/)
  })

  it('conserva el matcher para no interceptar api/_next ni assets', () => {
    const proxy = read('src', 'proxy.ts')
    expect(proxy).toContain('matcher')
    expect(proxy).toContain('(?!api|_next|_vercel')
  })
})
