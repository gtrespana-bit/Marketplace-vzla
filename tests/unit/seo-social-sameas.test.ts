import { PERFILES_SOCIALES, SAME_AS } from '@/lib/social'

/**
 * Regresión del Hallazgo 2 (docs/SEO-DIAGNOSTICO-2026-11.md):
 * el layout declaraba `sameAs` con instagram.com/vendet, twitter.com/vendet y
 * facebook.com/vendet, que NO eran cuentas del proyecto. Un `sameAs` falso le
 * dice a Google que el dominio es otra entidad y es la razón de que las
 * búsquedas de marca no devolvieran el sitio.
 *
 * Estos tests impiden que vuelva a colarse un perfil inventado.
 */
describe('perfiles sociales y sameAs', () => {
  it('todo perfil declarado tiene una URL https válida', () => {
    for (const perfil of PERFILES_SOCIALES) {
      expect(() => new URL(perfil.url)).not.toThrow()
      expect(perfil.url).toMatch(/^https:\/\//)
      expect(perfil.url).not.toMatch(/\s/)
    }
  })

  it('no contiene los perfiles históricamente inventados', () => {
    // Estas URLs apuntaban a cuentas ajenas. Si alguien las vuelve a añadir
    // "porque suenan a marca", el test falla.
    const inventadas = [
      /instagram\.com\/vendet\/?$/i,
      /twitter\.com\/vendet\/?$/i,
      /facebook\.com\/vendet\/?$/i,
    ]
    for (const perfil of PERFILES_SOCIALES) {
      for (const patron of inventadas) {
        expect(perfil.url).not.toMatch(patron)
      }
    }
  })

  it('declara el perfil real de Facebook de VendeT', () => {
    const facebook = PERFILES_SOCIALES.find((p) => p.nombre === 'Facebook')
    expect(facebook).toBeDefined()
    expect(facebook!.url).toBe('https://www.facebook.com/profile.php?id=61589268274357')
  })

  it('SAME_AS se deriva de los perfiles y excluye los pendientes', () => {
    const activos = PERFILES_SOCIALES.filter((p) => !p.pendiente).map((p) => p.url)
    expect(SAME_AS).toEqual(activos)
  })

  it('no hay URLs duplicadas en SAME_AS', () => {
    expect(new Set(SAME_AS).size).toBe(SAME_AS.length)
  })

  it('un perfil marcado como pendiente no entra en sameAs', () => {
    // Contrato del helper: `pendiente` existe para poder dejar constancia de
    // un perfil sin afirmarle a Google que ya es público.
    const pendientes = PERFILES_SOCIALES.filter((p) => p.pendiente)
    for (const p of pendientes) {
      expect(SAME_AS).not.toContain(p.url)
    }
  })
})
