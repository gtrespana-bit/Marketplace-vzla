/**
 * Placeholder de desenfoque para `next/image` (`placeholder="blur"`).
 *
 * ⚠️ `blurDataURL` debe ser una **data URL** (base64). Varias tarjetas del
 * home y de las landings pasaban `"/placeholder-product.webp"` (una ruta), lo
 * que el navegador no puede decodificar como imagen en línea: el efecto blur
 * nunca se veía y quedaba el fondo gris del contenedor. Este es un JPEG de
 * 4×3 px con el gris exacto del placeholder (#E5E7EB), ~60 bytes.
 */
export const BLUR_PLACEHOLDER =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAADAAQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
