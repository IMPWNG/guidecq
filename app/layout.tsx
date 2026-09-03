import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Mat - Le Meilleur guide de Chongqing',
  description:
    'Journées guidées sur mesure à Chongqing : histoire, culture, nourriture et regard local. 9h–16h, 85 € par personne.',
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
      <body className={`${poppins.className} bg-cream text-ink min-h-screen`}>
        {children}
      </body>
    </html>
  )
}