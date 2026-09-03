import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import HtmlLang from '@/components/HtmlLang'
import { getDictionary } from '@/lib/dictionaries'
import { isLocale, locales } from '@/lib/i18n'

export async function generateStaticParams() {
    return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>
}): Promise<Metadata> {
    const { lang } = await params
    if (!isLocale(lang)) return {}
    const dict = getDictionary(lang)
    return {
        title: dict.meta.title,
        description: dict.meta.description,
        alternates: {
            languages: {
                fr: '/fr',
                en: '/en',
            },
        },
    }
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()

    return (
        <>
            <HtmlLang locale={lang} />
            {children}
        </>
    )
}
