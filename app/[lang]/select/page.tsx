import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import StreetSelect from '@/components/StreetSelect'
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
        title: `${dict.street.prompt} — ${dict.street.wordmark}`,
        description: dict.street.line,
    }
}

export default async function SelectPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    const dict = getDictionary(lang)

    return <StreetSelect locale={lang} dict={dict} />
}
