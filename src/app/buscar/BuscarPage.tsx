'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ChevronRight, XCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { categoriasData } from '@/lib/categorias'
import UbicacionSelector from '@/components/UbicacionSelector'


  'Distrito Capital', 'Miranda', 'Carabobo', 'Lara', 'Zulia',
  'Aragua', 'Anzoategui', 'Bolivar', 'Merida', 'Tachira',
  'Trujillo', 'Portuguesa', 'Barinas', 'Apure', 'Guarico',
  'Cojedes', 'Yaracuy', 'Sucre', 'Monagas', 'Nueva Esparta',
  'Amazonas', 'Delta Amacuro', 'Vargas',


type Producto = {
  id: string
  titulo: string
  precio_usd: number
  estado: string
  imagen_url: string | null
  ubicacion_ciudad: string | null
  ubicacion_estado: string | null
  creado_en: string
  visitas: number
  subcategoria: string | null
  boosteado_en: string | null
  destacado: boolean
  destacado_hasta: string | null
  vendedor_verificado: boolean | null
  }

function ProductCard({ p }: { p: Producto }) {
  const isBoosted = p.boosteado_en != null
  const isFeatured = p.destacado && p.destacado_hasta && new Date(p.destacado_hasta) > new Date()
  const isPromoted = isBoosted || isFeatured
  
  return (
    <Link href={`/producto/${p.id}`} className={`bg-white rounded-xl overflow-hidden hover:shadow-lg transition group block border ${isPromoted ? 'border-2 border-brand-yellow shadow-sm' : 'border-gray-100 shadow-sm'}`}>
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {isFeatured && (
          <div className="absolute top-2 left-2 z-10 bg-brand-yellow text-brand-blue text-[10px