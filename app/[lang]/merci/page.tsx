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
        <div>
            <PublicHeader locale={lang} dict={dict.header} />
            <main className="text-center">
                <section className="stage">
                    <CheckCircle2 className="w-14 h-14 text-lantern mx-auto mb-6" />
                    <h1 className="is-page">{dict.merci.title}</h1>
                    <p className="line" style={{ marginInline: 'auto' }}>
                        {dict.merci.body}
                    </p>
                </section>
                <div className="actions" style={{ justifyContent: 'center' }}>
                    <Link href={`/${lang}`} className="lock">
                        {dict.merci.back}
                    </Link>
                </div>
            </main>
        </div>
    )
}
