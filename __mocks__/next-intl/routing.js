export function defineRouting(config) {
  return {
    locales: config.locales || ['es', 'en'],
    defaultLocale: config.defaultLocale || 'es',
    localePrefix: config.localePrefix || 'as-needed',
    pathnames: config.pathnames || {},
  };
}

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
});