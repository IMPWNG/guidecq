import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DoorBoot from '@/components/DoorBoot'
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
        title: dict.meta.avisTitle,
        description: dict.meta.avisDescription,
    }
}

export default async function AvisPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    const dict = getDictionary(lang)
    const home = `/${lang}`

    return (
        <div>
            <DoorBoot />
            <PublicHeader locale={lang} dict={dict.header} />
            <main>
                <section className="stage is-center">
                    <p className="kicker">{dict.home.reviewsEyebrow}</p>
                    <h1 className="is-page">{dict.home.reviewsTitle}</h1>
                    <p className="line">{dict.home.reviewsIntro}</p>
                </section>
                <ol className="voices">
                    {dict.home.reviews.map((review) => (
                        <li key={review.name}>
                            <figure className="voice">
                                <figcaption>
                                    <span>{review.name}</span>
                                </figcaption>
                                <blockquote>
                                    <p>{review.quote}</p>
                                </blockquote>
                            </figure>
                        </li>
                    ))}
                </ol>
                <div className="actions">
                    <Link className="lock" href={`${home}/select`}>
                        {dict.street.cta}
                    </Link>
                    <Link className="back" href={home}>
                        <span className="arrow" aria-hidden="true" />
                        {dict.street.back}
                    </Link>
                </div>
            </main>
        </div>
    )
}
