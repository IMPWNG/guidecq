import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PublicHeader from '@/components/PublicHeader'
import TourForm from '@/components/TourForm'
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
        title: dict.meta.formulaireTitle,
        description: dict.meta.formulaireDescription,
    }
}

export default async function Formulaire({
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
            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-ink mb-2">
                    {dict.formulaire.title}
                </h1>
                <p className="text-ink/65 mb-8">{dict.formulaire.intro}</p>
                <TourForm locale={lang} dict={dict.form} />
            </main>
        </div>
    )
}
