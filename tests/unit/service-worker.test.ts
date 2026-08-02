/**
 * Regression guard for the retirement service worker.
 *
 * A service worker is a network proxy once it has a `fetch` listener. The
 * prior implementation intercepted every request on the origin, including the
 * HTML/JS required by Lighthouse, and was the global source of timeouts. The
 * migration worker must only clean up old VendeT caches and unregister itself.
 */
import * as fs from 'fs'
import * as path from 'path'

const SW_PATH = path.join(__dirname, '../../public/sw.js')

describe('retired Service Worker', () => {
  const source = fs.readFileSync(SW_PATH, 'utf8')

  test('does not install a fetch handler or proxy application traffic', () => {
    expect(source).not.toMatch(/addEventListener\(\s*['"]fetch['"]/)
    expect(source).not.toMatch(/fetchWithRetry|event\.respondWith/)
  })

  test('deletes only VendeT caches and unregisters itself on activation', () => {
    expect(source).toContain("name.startsWith('vendet-')")
    expect(source).toContain('self.registration.unregister()')
    expect(source).toContain("self.addEventListener('activate'")
  })
})
