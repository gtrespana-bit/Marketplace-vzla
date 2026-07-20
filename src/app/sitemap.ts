import { MetadataRoute } from 'next';
import { getCiudades } from '@/lib/ubicaciones-seo';
import { CATEGORIAS_PRINCIPALES } from '@/lib/categories';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // FORZAMOS HTTPS EXPLÍCITO - SIN DEPENDENCIA DE VARIABLES DE ENTORNO
  const baseUrl = 'https://vendet.online';
  
  // Sitemap estático principal
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/buscar`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // URLs dinámicas de ciudades
  const ciudades = await getCiudades();
  const cityUrls: MetadataRoute.Sitemap = ciudades.map((ciudad) => ({
    url: `${baseUrl}/${ciudad.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // URLs dinámicas de categorías por ciudad
  const categoryUrls: MetadataRoute.Sitemap = [];
  for (const ciudad of ciudades) {
    for (const categoria of CATEGORIAS_PRINCIPALES) {
      categoryUrls.push({
        url: `${baseUrl}/${ciudad.slug}/${categoria.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  }

  return [...staticUrls, ...cityUrls, ...categoryUrls];
}
