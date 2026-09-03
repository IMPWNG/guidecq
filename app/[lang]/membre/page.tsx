import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import MemberHeader from '@/components/MemberHeader'
import { getDictionary } from '@/lib/dictionaries'
import { isLocale } from '@/lib/i18n'

type PageProps = {
    params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { lang } = await params
    if (!isLocale(lang)) return {}
    const dict = getDictionary(lang)
    return {
        title: dict.meta.membreTitle,
        description: dict.meta.membreDescription,
        robots: { index: false, follow: false },
        manifest: '/manifest.webmanifest',
        icons: {
            icon: '/icon-guide.svg',
            apple: '/icon-guide.svg',
        },
    }
}

export const viewport: Viewport = {
    themeColor: '#FFF9EE',
    width: 'device-width',
    initialScale: 1,
}

export default async function MembreLockedPage({ params }: PageProps) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    const dict = getDictionary(lang)

    return (
        <div className="min-h-screen bg-cream text-ink">
            <MemberHeader locale={lang} dict={dict.header} path={`/${lang}/membre`} />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-20">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-apricot mb-3">
                    {dict.membre.eyebrow}
                </p>
                <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-4">
                    {dict.membre.lockedTitle}
                </h1>
                <p className="text-ink/70 leading-relaxed mb-7">{dict.membre.lockedBody}</p>
                <Link
                    href={`/${lang}/guides`}
                    className="inline-flex bg-apricot hover:bg-apricot/90 text-white font-semibold px-6 py-3 rounded-full"
                >
                    {dict.membre.lockedCta}
                </Link>
            </main>
        </div>
    )
}
