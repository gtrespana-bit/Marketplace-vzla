'use client';

import { useState, useEffect, useRef } from 'react';
import LocalLink from './LocalLink';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface Producto {
  id: string;
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

interface ProductCardLazyProps {
  p: Producto;
  t: (key: string) => string;
  priority?: boolean;
}

const PLACEHOLDER_IMAGES = [
  '/placeholder-product.webp',
];

const BLUR_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAADAAQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='

function getPlaceholderImage(titulo: string) {
  return PLACEHOLDER_IMAGES[Math.abs(titulo.charCodeAt(0)) % PLACEHOLDER_IMAGES.length];
}

export const ProductCardLazy = ({ p, t, priority = false }: ProductCardLazyProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  const isBoosted = p.boosteado_en != null;
  const isFeatured = !!(p.destacado && p.destacado_hasta && new Date(p.destacado_hasta) > new Date());
  const isPromoted = isBoosted || isFeatured;

  const imgUrl = p.imagen_url || getPlaceholderImage(p.titulo);

  if (!isVisible) {
    // Placeholder ligero mientras no está visible
    return (
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
        <div className="aspect-square bg-gray-200" />
        <div className="p-4 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  // Componente real cuando está visible
  return (
    <LocalLink 
      ref={elementRef}
      href={`/producto/${p.id}`} 
      className={`bg-white rounded-xl overflow-hidden transition-all duration-200 group block border ${isPromoted ? 'border-2 border-brand-accent shadow-md hover:shadow-xl hover:-translate-y-1' : 'border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-gray-200'}`}
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {isFeatured && (
          <div className="absolute top-2 left-2 z-10 bg-brand-accent text-brand-primary text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            ⭐ {t('product.featured')}
          </div>
        )}
        {isBoosted && !isFeatured && (
          <div className="absolute top-2 left-2 z-10 bg-green-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            ⚡ <span className="text-white">Boost</span>
          </div>
        )}
        <Image
          src={imgUrl}
          alt={p.titulo}
          width={300}
          height={300}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
          decoding="async"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          fetchPriority={priority ? 'high' : 'low'}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('/placeholder-product.webp')) {
              target.src = '/placeholder-product.webp';
            }
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate group-hover:text-brand-primary transition-colors">{p.titulo}</h3>
        <p className="text-xl font-black text-brand-primary mt-1">${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(p.precio_usd || 0))}</p>
        {p.vendedor_verificado && (
          <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full mt-1">
            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            {t('product.verified')}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">{p.ubicacion_ciudad || p.ubicacion_estado || 'Venezuela'}</p>
      </div>
    </LocalLink>
  );
};