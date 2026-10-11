/**
 * AMBIENT GLOW (2026-10-11) — Un halo radial de color por sección, detrás del contenido.
 *
 * El fondo original (`night-halos` en app/page.tsx) está en `position: fixed`, así que pinta
 * siempre el mismo patrón en pantalla sin importar qué tan abajo se haya scrolleado — el resultado
 * son tramos largos y negros entre secciones, sin variación. Esto reemplaza esa idea por un glow
 * distinto POR SECCIÓN (anclado al documento, no al viewport), para que cada tramo del scroll
 * tenga su propio acento de color — Tornamesa en celeste, Venta de Beats en violeta, etc. — en vez
 * de repetir siempre el mismo fondo estático.
 */
const TONES = {
  primary: 'rgb(124 102 220 / 0.22)',
  celestite: 'rgb(0 191 255 / 0.16)',
  astra: 'rgb(75 0 130 / 0.35)',
  mint: 'rgb(152 255 152 / 0.1)',
} as const

export function AmbientGlow({
  tone = 'primary',
  position = 'top-right',
}: {
  tone?: keyof typeof TONES
  position?: 'top-right' | 'top-left' | 'bottom-left' | 'bottom-right' | 'center'
}) {
  const placement: Record<string, string> = {
    'top-right': '85% -10%',
    'top-left': '-10% 0%',
    'bottom-left': '0% 100%',
    'bottom-right': '100% 100%',
    center: '50% 50%',
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{
        background: `radial-gradient(42rem 32rem at ${placement[position]}, ${TONES[tone]}, transparent 65%)`,
      }}
    />
  )
}
