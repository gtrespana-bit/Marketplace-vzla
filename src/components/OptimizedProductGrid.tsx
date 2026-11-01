'use client';

import { ProductCardLazy } from './ProductCardLazy';

interface Producto {
  id: string;
  slug?: string | null;
  titulo: string;
  precio_usd: number;
  estado: string;
  imagen_url: string | null;
  ubicacion_ciudad: string | null;
  ubicacion_estado: string | null;
  creado_en: string;
  subcategoria: string | null;
  boosteado_en: string | null;
  destacado: boolean;
  destacado_hasta: string | null;
  vendedor_verificado: boolean | null;
}

interface OptimizedProductGridProps {
  productos: Producto[];
  t: (key: string) => string;
  currentPage: number;
  itemsPerPage: number;
}

export const OptimizedProductGrid = ({ 
  productos, 
  t, 
  currentPage,
  itemsPerPage
}: OptimizedProductGridProps) => {

  // Renderizar productos con carga diferida
  return (
    // 2 columnas en móvil (antes 1: las tarjetas ocupaban toda la pantalla y
    // la primera imagen tardaba en entrar). Es el patrón de los clasificados.
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {productos.map((p, index) => (
        <ProductCardLazy
          key={`${p.id}-${currentPage}`}
          p={p}
          t={t}
          // Las dos primeras tarjetas de la primera página se piden en eager:
          // son el LCP del catálogo y en móvil determinan la sensación de carga.
          priority={index < 2 && currentPage === 1}
        />
      ))}
    </div>
  );
};