import * as Sentry from "@sentry/nextjs";

const DSN = 'https://80cf7b21b140a0842c4fd65714286be4@o4511327356518400.ingest.us.sentry.io/4511327360450560';

Sentry.init({
  dsn: DSN,
  tracesSampleRate: 0.5,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});

// Test: enviar un evento al cargar
if (typeof window !== 'undefined') {
  console.log('[Sentry] DSN:', DSN.substring(0, 20) + '...')
  Sentry.captureMessage('Sentry conectado en vendet.online')
}
