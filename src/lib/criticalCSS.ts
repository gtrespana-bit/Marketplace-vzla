// Extract critical CSS for above-the-fold content
export const criticalCSS = `
/* Critical styles for initial render */
.bg-white { background-color: #fff; }
.rounded-xl { border-radius: 0.75rem; }
.overflow-hidden { overflow: hidden; }
.border { border-width: 1px; }
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.grid { display: grid; }
.aspect-square { aspect-ratio: 1 / 1; }
.bg-gray-100 { background-color: #f3f4f6; }
.relative { position: relative; }
.overflow-hidden { overflow: hidden; }
.w-full { width: 100%; }
.h-full { height: 100%; }
.object-cover { object-fit: cover; }
.group:hover .group-hover\\:scale-105 { transform: scale(1.05); }
.transition-transform { transition-property: transform; }
.duration-300 { transition-duration: 300ms; }
.p-4 { padding: 1rem; }
.font-semibold { font-weight: 600; }
.text-gray-900 { color: #111827; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.group:hover .group-hover\\:text-brand-primary { color: #008080; }
.transition-colors { transition-property: color; }
.text-xl { font-size: 1.25rem; }
.font-black { font-weight: 900; }
.text-brand-primary { color: #008080; }
.mt-1 { margin-top: 0.25rem; }
.text-xs { font-size: 0.75rem; }
.text-gray-500 { color: #6b7280; }
.mt-1 { margin-top: 0.25rem; }
.inline-flex { display: inline-flex; }
.items-center { align-items: center; }
.gap-1 { gap: 0.25rem; }
.text-emerald-700 { color: #047857; }
.bg-emerald-50 { background-color: #ecfdf5; }
.border-emerald-200 { border-color: #a7f3d0; }
.px-1\\.5 { padding-left: 0.375rem; padding-right: 0.375rem; }
.py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
.rounded-full { border-radius: 9999px; }
.mt-1 { margin-top: 0.25rem; }

/* Grid layouts */
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.sm\\:grid-cols-2 { @media (min-width: 640px) { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.xl\\:grid-cols-3 { @media (min-width: 1280px) { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

/* Gap utilities */
.gap-4 { gap: 1rem; }

/* Flex utilities */
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }

/* Text utilities */
.text-sm { font-size: 0.875rem; }
.font-medium { font-weight: 500; }

/* Responsive utilities */
.w-full { width: 100%; }
.max-w-7xl { max-width: 80rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }

/* Sticky positioning */
.sticky { position: sticky; }
.top-20 { top: 5rem; }

/* Animation for loading states */
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }

/* Background colors for loading states */
.bg-gray-200 { background-color: #e5e7eb; }
`;