/**
 * Regresión: aviso antifraude en el modal de compra de créditos.
 *
 * Contexto — por qué los datos de pago son públicos:
 * el Pago Móvil / Binance ID del administrador son una **dirección de cobro**,
 * no un secreto. Sin verlos nadie puede pagar, y el flujo es
 * "pagar → subir comprobante → el admin aprueba". Ocultarlos rompería la
 * compra. Además están en el bundle del cliente, así que "protegerlos" en el
 * servidor no aportaría nada.
 *
 * El riesgo real es la **suplantación**: un estafador escribe por el chat
 * diciendo que es del equipo y da SU número. La mitigación correcta no es
 * esconder los datos, sino que el aviso viaje pegado a ellos en el mismo
 * bloque, siempre visible antes de copiar el número.
 */
import fs from 'fs'
import path from 'path'

const PAGE = path.join(
  process.cwd(),
  'src',
  'app',
  '[locale]',
  'creditos',
  'page.tsx'
)
const source = fs.readFileSync(PAGE, 'utf8')

/** Bloque de "Datos de pago" del modal. */
function paymentBlock(): string {
  const start = source.indexOf("t('paymentData')")
  expect(start).toBeGreaterThan(-1)
  return source.slice(start, start + 2200)
}

describe('créditos: aviso antifraude junto a los datos de pago', () => {
  it('los datos de pago siguen siendo visibles (son una dirección de cobro)', () => {
    // Si alguien los "protege" detrás de login, el usuario no puede pagar.
    expect(source).toContain("telefono: '04126443099'")
    expect(source).toContain("id: '204147542'")
    // Y deben renderizarse en el modal, no solo definirise.
    expect(paymentBlock()).toContain('selectedMetodo.instrucciones')
  })

  it('el aviso aparece dentro del mismo bloque que los datos de pago', () => {
    const block = paymentBlock()
    expect(block).toContain("t('antiFraudTitle')")
    expect(block).toContain("t.rich('antiFraudBody'")
    // Debe ir ANTES de la lista de instrucciones (se lee antes de copiar).
    const notice = block.indexOf("t('antiFraudTitle')")
    const instructions = block.indexOf('selectedMetodo.instrucciones')
    expect(notice).toBeGreaterThan(-1)
    expect(instructions).toBeGreaterThan(-1)
    expect(notice).toBeLessThan(instructions)
  })

  it('advierte explícitamente del fraude por chat (suplantación del equipo)', () => {
    expect(source).toContain("t.rich('antiFraudChat'")
  })

  it('el aviso es accesible: role=note y los iconos son decorativos', () => {
    const block = paymentBlock()
    expect(block).toContain('role="note"')
    // Los iconos dentro del aviso no deben ser anunciados por lectores de pantalla
    expect(block).toMatch(/<ShieldAlert size=\{16\} aria-hidden="true" \/>/)
  })

  it('los textos existen en los dos diccionarios y no quedan vacíos', () => {
    const keys = [
      'antiFraudTitle',
      'antiFraudBody',
      'antiFraudChat',
      'antiFraudAmount',
      'officialAccount',
    ]
    for (const lang of ['es', 'en']) {
      const dict = JSON.parse(
        fs.readFileSync(
          path.join(process.cwd(), 'src', 'i18n', 'dictionaries', `${lang}.json`),
          'utf8'
        )
      )
      for (const key of keys) {
        const value = dict?.creditos?.[key]
        expect(typeof value).toBe('string')
        expect(value.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('el endpoint huérfano /api/datos-pago no vuelve a aparecer', () => {
    // No lo llamaba nadie, usaba SERVICE_ROLE_KEY y devolvía la cuenta con un
    // fallback hardcodeado: superficie de ataque sin beneficio.
    expect(fs.existsSync(path.join(process.cwd(), 'src', 'app', 'api', 'datos-pago'))).toBe(false)
  })
})
