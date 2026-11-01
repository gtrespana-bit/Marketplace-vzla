/**
 * Regresión: el hero de la portada se recortaba por la derecha en móvil.
 *
 * Causa raíz: la columna del hero era un item de grid (`min-width: auto`) sin
 * ancho definido y con hijos en `w-full`. En una columna flex esos porcentajes
 * se resuelven contra el *max-content* del contenido, no contra el espacio
 * disponible: medía 598 px dentro de un móvil de 360. Como la sección lleva
 * `overflow-hidden`, el resultado se recortaba en vez de desbordar.
 *
 * El test comprueba estáticamente las tres condiciones que lo evitaban, porque
 * el bug no se ve en el HTML (las clases existen); sólo se ve midiendo en un
 * navegador con viewport móvil.
 */
import fs from 'fs'
import path from 'path'

const PAGE = path.join(process.cwd(), 'src', 'app', '[locale]', 'page.tsx')
const source = fs.readFileSync(PAGE, 'utf8')

/** Devuelve el bloque de la columna de contenido del hero. */
function heroColumn(): string {
  const start = source.indexOf('min-w-0 flex flex-col items-center')
  expect(start).toBeGreaterThan(-1)
  // Ventana amplia: el bloque incluye comentarios JSX y creció con las correcciones.
  return source.slice(start, source.indexOf('HeroCollage items=', start))
}

describe('hero de la portada: geometría', () => {
  it('la columna del hero tiene min-w-0 (sin esto los w-full resuelven contra max-content)', () => {
    expect(source).toContain('w-full min-w-0 flex flex-col items-center')
  })

  it('la columna está centrada en móvil y alineada a la izquierda sólo cuando hay collage (xl)', () => {
    const col = source.match(/<div className="w-full min-w-0 flex flex-col[^"]*"/)
    expect(col).not.toBeNull()
    const cls = col![0]
    expect(cls).toContain('items-center')
    expect(cls).toContain('text-center')
    // El collage sólo existe desde xl, así que el cambio a izquierda también.
    expect(cls).toContain('xl:items-start')
    expect(cls).toContain('xl:text-left')
  })

  it('el collage no aparece antes de xl (en lg se solapaba con el titular)', () => {
    expect(source).toMatch(/relative hidden xl:block h-\[460px\]/)
    expect(source).not.toMatch(/relative hidden lg:block h-\[460px\]/)
  })

  it('los hijos de ancho limitado del hero no se salen de su eje', () => {
    const col = heroColumn()
    // H1, subtítulo, buscador y stats deben declarar w-full + max-w, nunca mx-auto
    // suelto (eso fue justo lo que dejaba el bloque descentrado).
    expect(col).toMatch(/<h1 className="w-full max-w-2xl/)
    expect(col).toContain('text-white/80 mb-6 w-full max-w-xl')
    expect(col).toMatch(/className="relative w-full max-w-xl mb-3"/)
    expect(col).toMatch(/grid w-full max-w-md grid-cols-3/)
  })

  it('el placeholder del buscador usa la versión corta en móvil', () => {
    // El texto largo medía 331 px y sólo hay 142-236 px disponibles: se
    // cortaba a mitad de palabra ("iPhone" -> "iPhor").
    expect(source).toContain("placeholder={t('home.hero.searchPlaceholderShort')}")
  })

  it('el placeholder corto existe en los dos diccionarios', () => {
    for (const lang of ['es', 'en']) {
      const dict = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'src', 'i18n', 'dictionaries', `${lang}.json`), 'utf8')
      )
      const short = dict?.home?.hero?.searchPlaceholderShort
      expect(typeof short).toBe('string')
      expect(short.length).toBeGreaterThan(0)
      // Medido en Chromium a 320 px: con un botón de ~80 px quedan ~150 px
      // para el texto, así que el placeholder corto no debe pasar de ~26
      // caracteres (el largo anterior tenía 38 y se cortaba).
      expect(short.length).toBeLessThanOrEqual(26)
    }
  })

  it('la sección del hero mantiene overflow-hidden (los blobs decorativos)', () => {
    expect(source).toMatch(/from-brand-primary to-brand-dark[^"]*overflow-hidden/)
  })
})
