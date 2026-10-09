import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Antonio, IBM_Plex_Mono, VT323 } from 'next/font/google'
import './globals.css'

const display = Antonio({
  subsets: ['latin'],
  weight: ['200', '300', '400', '600'],
  variable: '--font-display-face',
  display: 'swap',
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono-body',
  display: 'swap',
})

/** Fuente LCD/terminal — para el display del mezclador estilo Winamp/Napster clásico. */
const lcd = VT323({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-lcd-face',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BROKEBOIRICHIE — Música para sanar el alma',
  description:
    'Plataforma oficial de BROKEBOIRICHIE, artista y productor chileno de Plugg. Escucha REX (2025), sus estrenos en YouTube y su universo visual desde la Zona Sur de Santiago.',
  keywords: ['BROKEBOIRICHIE', 'Plugg', 'MexikoDro', 'Trap chileno', 'REX', 'Santiago', 'Zona Sur'],
  openGraph: {
    title: 'BROKEBOIRICHIE — Música para sanar el alma',
    description: 'Sonido atmosférico, plugg y dirección estética desde la Zona Sur de Santiago.',
    images: ['/images/rex-cover.png'],
    type: 'profile',
    locale: 'es_CL',
  },
  generator: 'v0.app',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#07080D',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${display.variable} ${mono.variable} ${lcd.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
