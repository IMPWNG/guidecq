import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import PublicHeader from '@/components/PublicHeader'
import { getDictionary } from '@/lib/dictionaries'
import { isLocale } from '@/lib/i18n'

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>
}): Promise<Metadata> {
    const { lang } = await params
    if (!isLocale(lang)) return {}
    const dict = getDictionary(lang)
    return {
        title: dict.meta.merciTitle,
        description: dict.meta.merciDescription,
    }
}

export default async function Merci({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    const dict = getDictionary(lang)

    return (
        <div className="min-h-screen bg-cream">
            <PublicHeader locale={lang} dict={dict.header} />
            <main className="flex flex-col items-center justify-center px-6 py-24 text-center">
                <CheckCircle2 className="w-14 h-14 text-bamboo mb-6" />
                <h1 className="text-3xl font-extrabold text-ink mb-3">{dict.merci.title}</h1>
                <p className="text-ink/70 max-w-md mb-8 leading-relaxed">{dict.merci.body}</p>
                <Link
                    href={`/${lang}`}
                    className="bg-ink hover:bg-ink/90 text-white font-semibold px-6 py-3 rounded-full transition"
                >
                    {dict.merci.back}
                </Link>
            </main>
        </div>
    )
}
