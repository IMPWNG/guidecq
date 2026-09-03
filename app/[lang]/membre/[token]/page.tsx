import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import MemberHeader from '@/components/MemberHeader'
import MemberSpace from '@/components/MemberSpace'
import { getDictionary } from '@/lib/dictionaries'
import { getPurchaseByToken } from '@/lib/guide-purchases'
import { isLocale } from '@/lib/i18n'

type PageProps = {
    params: Promise<{ lang: string; token: string }>
}

export const dynamic = 'force-dynamic'

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
        appleWebApp: {
            capable: true,
            title: lang === 'en' ? 'CQ Guides' : 'Guides CQ',
            statusBarStyle: 'default',
        },
    }
}

export const viewport: Viewport = {
    themeColor: '#FFF9EE',
    width: 'device-width',
    initialScale: 1,
}

export default async function MembreAccessPage({ params }: PageProps) {
    const { lang, token } = await params
    if (!isLocale(lang)) notFound()
    const dict = getDictionary(lang)
    const purchase = await getPurchaseByToken(token)
    if (!purchase) notFound()

    const memberPath = `/${lang}/membre/${purchase.access_token}`

    if (purchase.status !== 'paid') {
        return (
            <div className="min-h-screen bg-cream text-ink">
                <MemberHeader locale={lang} dict={dict.header} path={memberPath} />
                <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-20">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-apricot mb-3">
                        {dict.membre.eyebrow}
                    </p>
                    <h1 className="text-3xl font-extrabold mb-4">{dict.membre.pendingTitle}</h1>
                    <p className="text-ink/70 leading-relaxed mb-6">{dict.membre.pendingBody}</p>
                    <Link
                        href={`/${lang}/guides/paiement/${purchase.access_token}`}
                        className="inline-flex bg-apricot hover:bg-apricot/90 text-white font-semibold px-6 py-3 rounded-full"
                    >
                        {dict.membre.pendingCta}
                    </Link>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-cream text-ink">
            <MemberHeader locale={lang} dict={dict.header} path={memberPath} />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-20">
                <MemberSpace
                    locale={lang}
                    dict={dict.membre}
                    initialPrenom={purchase.prenom}
                    initialNom={purchase.nom}
                    initialGuides={purchase.guides}
                    accessToken={purchase.access_token}
                />
            </main>
        </div>
    )
}
