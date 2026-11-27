import { notFound } from 'next/navigation'
import StreetHome from '@/components/StreetHome'
import { getDictionary } from '@/lib/dictionaries'
import { isLocale } from '@/lib/i18n'

export default async function Home({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    const dict = getDictionary(lang)

    return <StreetHome locale={lang} dict={dict} />
}
