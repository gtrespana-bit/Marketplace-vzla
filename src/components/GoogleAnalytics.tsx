import Script from 'next/script'

// Google Analytics 4 (gtag.js). Se activa SOLO si existe la variable de
// entorno NEXT_PUBLIC_GA_ID (formato G-XXXXXXXXXX) en Vercel/local.
// Si no está configurada, el componente no renderiza nada — cero overhead.
//
// OJO: GA4 envía los eventos como beacons a *.google-analytics.com, que
// debe estar permitido en el connect-src del CSP (next.config.js).
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function GoogleAnalytics() {
  if (!GA_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            anonymize_ip: true,
            page_title: document.title,
          });
        `}
      </Script>
    </>
  )
}
