'use client'

import { useEffect } from 'react'

// When user changes the category dropdown, reload the catalog URL with the new category
// so the server re-renders with the correct subcategories and brands

export function CatalogoForm({ currentCat, currentSub }: { currentCat: string; currentSub: string }) {
  useEffect(() => {
    const catSelect = document.getElementById('filtro-categoria') as HTMLSelectElement | null
    const subSelect = document.getElementById('filtro-sub') as HTMLSelectElement | null
    const form = document.getElementById('filter-form') as HTMLFormElement | null
    const btn = document.getElementById('btn-aplicar') as HTMLButtonElement | null

    if (catSelect && form) {
      catSelect.addEventListener('change', () => {
        const cat = catSelect.value
        const url = new URL(window.location.href)
        url.searchParams.set('categoria', cat)
        if (cat === '') url.searchParams.delete('subcategoria')
        window.location.href = url.toString()
      })
    }

    if (btn && form) {
      btn.addEventListener('click', (e) => {
        e.preventDefault()

        const params = new URLSearchParams()

        const cat = catSelect?.value
        if (cat) params.set('categoria', cat)

        const sub = subSelect?.value
        if (sub) params.set('subcategoria', sub)

        const marcaInput = form.querySelector('[name="marca"]') as HTMLInputElement | null
        if (marcaInput?.value) params.set('marca', marcaInput.value)

        const checked = form.querySelectorAll('[name="estado"]:checked') as NodeListOf<HTMLInputElement>
        checked.forEach(cb => params.set('estado', cb.value))

        const ubicacion = form.querySelector('[name="ubicacion"]') as HTMLSelectElement | null
        if (ubicacion?.value) params.set('ubicacion', ubicacion.value)

        const precioMin = form.querySelector('[name="precioMin"]') as HTMLInputElement | null
        if (precioMin?.value) params.set('precioMin', precioMin.value)

        const precioMax = form.querySelector('[name="precioMax"]') as HTMLInputElement | null
        if (precioMax?.value) params.set('precioMax', precioMax.value)

        window.location.href = `/catalogo?${params.toString()}`
      })
    }
  }, [])

  return null
}
