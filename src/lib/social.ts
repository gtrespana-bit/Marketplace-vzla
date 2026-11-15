/**
 * Perfiles sociales oficiales de VendeT.
 *
 * ⚠️ ÚNICA FUENTE DE VERDAD. De aquí salen dos cosas que deben coincidir
 * siempre:
 *   1. El `sameAs` del JSON-LD `Organization` (src/app/layout.tsx).
 *   2. Los enlaces visibles del footer (src/components/Footer.tsx).
 *
 * Por qué importa tener las dos:
 *   Un `sameAs` sin enlace visible es una afirmación que el sitio no respalda
 *   en su propio contenido. Google y los motores de IA cruzan ambas señales:
 *   el enlace rastreable del footer demuestra que el perfil es realmente del
 *   sitio, y el `sameAs` le dice al Knowledge Graph "esta cuenta y este
 *   dominio son la misma entidad". Es lo que permite que buscar la marca
 *   devuelva el sitio, y que una IA sepa qué es VendeT cuando le preguntan
 *   dónde comprar o vender en Venezuela.
 *
 * ⚠️ NUNCA añadir aquí un perfil que no exista. Un `sameAs` a una cuenta
 * ajena le dice a Google que el dominio es otra entidad — es peor que no
 * tener ninguno. (Esto ya pasó: el layout declaraba instagram/twitter/facebook
 * /vendet, que no eran del proyecto; se retiraron en nov-2026.
 * Ver docs/SEO-DIAGNOSTICO-2026-11.md §Hallazgo 2.)
 */

export type PerfilSocial = {
  /** Nombre legible del perfil, usado en aria-label y title */
  nombre: 'Facebook' | 'Instagram' | 'X' | 'TikTok' | 'YouTube' | 'WhatsApp'
  /** URL canónica del perfil, tal cual se declara en `sameAs` */
  url: string
  /** `true` mientras no se haya podido verificar que el perfil es público */
  pendiente?: boolean
}

/**
 * Facebook: perfil verificado por el equipo.
 * La URL es la forma estable que Facebook asigna a los perfiles creados sin
 * nombre de usuario (profile.php?id=…). Funciona y se indexa igual, pero si
 * algún día se reserva un @usuario (facebook.com/vendet), conviene cambiarla:
 * una URL con nombre es más reconocible para las personas y refuerza la marca.
 */
const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61589268274357'

export const PERFILES_SOCIALES: PerfilSocial[] = [
  { nombre: 'Facebook', url: FACEBOOK_URL },
]

/** URLs para el `sameAs` de Schema.org */
export const SAME_AS: string[] = PERFILES_SOCIALES.filter((p) => !p.pendiente).map((p) => p.url)
