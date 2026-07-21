import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Chongqing Tours - Créons votre voyage sur mesure',
  description: 'Planifiez votre séjour à Chongqing selon vos envies',
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
    <html lang="fr">
      <body className="bg-cream text-ink font-sans min-h-screen">
        {children}
      </body>
    </html>
  )
}