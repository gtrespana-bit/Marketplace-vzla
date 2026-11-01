/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#7B2D3B',
          dark: '#5C1E2B',
          accent: '#C9A84C',
          gray: '#F5F5F5',
          darkNav: '#1a1a2e',
        },
        // `hover:bg-accent`, `text-accent`… se usaban en 19 sitios pero NO
        // existían en el theme: Tailwind no generaba la clase y el hover (o el
        // color) simplemente no se aplicaba. Alias para que la escala corta
        // funcione igual que `brand-accent`.
        accent: '#C9A84C',
        'accent-dark': '#B8963F',
      },
      // Superficie cálida para las secciones de la home: antes se mezclaban
      // `bg-gray-50` (frío) con los neutros del body y el dorado del brand.
      backgroundColor: {
        canvas: '#FAF7F2',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
