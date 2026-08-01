/**
 * Regression tests para la resolución de campos por subcategoría.
 *
 * Bug original (reportado al publicar un repuesto de carro):
 * en el paso 2 "Especificaciones — Carros" el <select> de Marca aparecía
 * vacío y solo ofrecía "Otra marca" / "Otra (no está en la lista)", así que
 * era imposible elegir la marca del vehículo.
 *
 * Causa: las subcategorías de `repuestos` declaran
 *   { label: 'Marca', type: 'select', placeholder: 'Selecciona marca...' }
 * SIN `options`, y el formulario no las rellenaba desde `sub.marcas`.
 */
import {
  categoriasData,
  resolverCampos,
  esCampoMarca,
  getSubConfig,
} from '@/lib/categorias'

describe('resolverCampos: campo Marca', () => {
  test('repuestos › Carros ofrece las marcas de vehículo (el bug reportado)', () => {
    const sub = getSubConfig('repuestos', 'Carros')
    const campos = resolverCampos(sub)
    const marca = campos.find(c => c.label === 'Marca')

    expect(marca).toBeDefined()
    // Antes: [] → el select solo mostraba las opciones de "otra marca".
    expect(marca!.options!.length).toBeGreaterThan(10)
    expect(marca!.options).toEqual(expect.arrayContaining(['Ford', 'Toyota', 'Chevrolet']))
  })

  test('repuestos › Motos ofrece las marcas de moto, no las de carro', () => {
    const campos = resolverCampos(getSubConfig('repuestos', 'Motos'))
    const marca = campos.find(c => c.label === 'Marca')

    expect(marca!.options).toEqual(expect.arrayContaining(['Yamaha', 'Bera', 'Empire']))
    expect(marca!.options).not.toContain('Ford')
  })

  test('un campo select de Marca nunca queda sin opciones en ninguna subcategoría', () => {
    const vacios: string[] = []
    for (const [catKey, cat] of Object.entries(categoriasData)) {
      for (const sub of cat.subs) {
        for (const campo of resolverCampos(sub)) {
          if (esCampoMarca(campo) && !campo.options?.length) {
            vacios.push(`${catKey} › ${sub.label} › ${campo.label}`)
          }
        }
      }
    }
    // Si algo falla, el mensaje dice exactamente qué subcategoría se rompió.
    expect(vacios).toEqual([])
  })

  test('no se pierden las options ya declaradas explícitamente', () => {
    const campos = resolverCampos(getSubConfig('vehiculos', 'Carros'))
    const transmision = campos.find(c => c.label === 'Transmisión')
    expect(transmision!.options).toEqual(['Automática', 'Manual', 'CVT'])
  })
})

describe('resolverCampos: campo Año', () => {
  test('el campo Año se rellena con años reales (label con tilde incluido)', () => {
    const campos = resolverCampos(getSubConfig('vehiculos', 'Carros'))
    const anio = campos.find(c => c.label === 'Año')

    expect(anio).toBeDefined()
    expect(anio!.options).toHaveLength(30)
    // Comparar contra el año real evita que el test caduque.
    expect(anio!.options![0]).toBe(String(new Date().getFullYear()))
  })

  test('ningún campo select queda con options undefined', () => {
    for (const cat of Object.values(categoriasData)) {
      for (const sub of cat.subs) {
        for (const campo of resolverCampos(sub)) {
          if (campo.type === 'select') expect(Array.isArray(campo.options)).toBe(true)
        }
      }
    }
  })

  test('subcategoría inexistente devuelve lista vacía sin lanzar', () => {
    expect(resolverCampos(undefined)).toEqual([])
    expect(resolverCampos(getSubConfig('vehiculos', 'No existe'))).toEqual([])
  })
})

describe('esCampoMarca', () => {
  test('detecta el selector de marca e ignora los campos de texto libre', () => {
    expect(esCampoMarca({ label: 'Marca', type: 'select' })).toBe(true)
    expect(esCampoMarca({ label: 'marca del motor', type: 'select' })).toBe(true)
    // Un input de texto no debe recibir la opción "otra marca".
    expect(esCampoMarca({ label: 'Marca', type: 'text' })).toBe(false)
    expect(esCampoMarca({ label: 'Modelo', type: 'select' })).toBe(false)
  })
})
