if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(function(reg) {
        console.log('[PWA] Service Worker registrado, scope:', reg.scope)
        
        // Forzar update check
        reg.update()
        
        // Detectar cuando el nuevo SW está listo
        reg.onupdatefound = function() {
          const installingWorker = reg.installing
          if (installingWorker) {
            installingWorker.onstatechange = function() {
              console.log('[PWA] SW nuevo estado:', installingWorker.state)
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nuevo SW disponible, activar
                installingWorker.postMessage({ type: 'SKIP_WAITING' })
                // Mostrar notificación sutil
                if (window.showNewVersionReady) {
                  window.showNewVersionReady()
                }
              }
            }
          }
        }
      })
      .catch(function(err) {
        console.log('[PWA] Service Worker registration failed:', err)
      })
    
    // Skip waiting listener
    navigator.serviceWorker.addEventListener('controllerchange', function() {
      console.log('[PWA] Controller changed, new SW active')
    })
  })
}
