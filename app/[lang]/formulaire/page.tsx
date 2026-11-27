import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import DoorBoot from '@/components/DoorBoot'
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
        <div>
            <DoorBoot />
            <PublicHeader locale={lang} dict={dict.header} />
            <main>
                <section className="stage">
                    <p className="kicker">{dict.street.wordmark}</p>
                    <h1 className="is-page">{dict.formulaire.title}</h1>
                    <p className="line">{dict.formulaire.intro}</p>
                </section>
                <TourForm locale={lang} dict={dict.form} />
            </main>
        </div>
    )
}
