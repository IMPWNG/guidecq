import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mat - Le Meilleur guide de Chongqing',
  description:
    'Journées guidées sur mesure à Chongqing : histoire, culture, nourriture et regard local. 9h–16h, 100 € par personne.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/fonts/syne-700.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="stylesheet" href="/select.css" />
      </head>
      <body>
        <div id="door" aria-hidden="true" suppressHydrationWarning>
          <div className="shutter" />
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(sessionStorage.getItem('cq-door')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.querySelector('#door').classList.add('is-shut','is-instant')}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  )
}
