/* Service Worker registration — VendeT PWA */
(function() {
  if (!('serviceWorker' in navigator)) return

  // Solo registrar después de que toda la página haya cargado
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(function(reg) {
        console.log('[PWA] Service Worker registrado, scope:', reg.scope)

        // Verificar actualizaciones
        reg.update()

        // Detectar cuando el nuevo SW está listo
        reg.onupdatefound = function() {
          const installingWorker = reg.installing
          if (!installingWorker) return
          installingWorker.onstatechange = function() {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              installingWorker.postMessage({ type: 'SKIP_WAITING' })
              if (window.showNewVersionReady) {
                window.showNewVersionReady()
              }
            }
          }
        }
      })
      .catch(function(err) {
        // Silenciar errores de registro — no afectan al usuario
        console.info('[PWA] SW registration deferred:', err.message || err)
      })
  })
})()
