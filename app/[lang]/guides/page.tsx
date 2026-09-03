import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Camera, MapPinned, UtensilsCrossed } from 'lucide-react'
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
        title: dict.meta.guidesTitle,
        description: dict.meta.guidesDescription,
        alternates: {
            languages: {
                fr: '/fr/guides',
                en: '/en/guides',
            },
        },
    }
}

export default async function GuidesPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    const dict = getDictionary(lang)
    const g = dict.guides

    return (
        <div className="min-h-screen bg-cream text-ink">
            <PublicHeader locale={lang} dict={dict.header} />

            <main>
                <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 sm:pt-20 pb-10">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-apricot mb-4">
                        {g.eyebrow}
                    </p>
                    <h1 className="text-3xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight">
                        {g.title}
                        <span className="block text-ink/50">{g.titleAccent}</span>
                    </h1>
                    <p className="mt-5 text-base sm:text-lg text-ink/70 leading-relaxed">{g.intro}</p>
                </section>

                <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-10">
                    <div className="rounded-[2rem] border border-ink/10 bg-white px-5 py-6 sm:px-8 sm:py-7">
                        <h2 className="text-xl font-extrabold mb-4">{g.accessLabel}</h2>
                        <ul className="space-y-2.5">
                            {g.accessLines.map((line) => (
                                <li key={line} className="flex gap-2 text-ink/75 leading-relaxed">
                                    <span className="text-apricot font-bold shrink-0">→</span>
                                    {line}
                                </li>
                            ))}
                        </ul>
                        <p className="mt-5 text-sm font-semibold text-apricot">{g.accessTease}</p>
                    </div>
                </section>

                <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-14 space-y-5">
                    <GuideCard
                        icon={<MapPinned size={22} />}
                        badge={g.inEditing}
                        price={g.priceEach}
                        title={g.classicTitle}
                        subtitle={g.classicSubtitle}
                        paragraphs={g.classicParagraphs}
                        extras={g.classicIncludes}
                    />
                    <GuideCard
                        icon={<Camera size={22} />}
                        badge={g.inEditing}
                        price={g.priceEach}
                        title={g.photoTitle}
                        subtitle={g.photoSubtitle}
                        paragraphs={g.photoParagraphs}
                        extras={g.photoIncludes}
                    />
                    <GuideCard
                        icon={<UtensilsCrossed size={22} />}
                        badge={g.inEditing}
                        price={g.priceEach}
                        title={g.gourmetTitle}
                        subtitle={g.gourmetSubtitle}
                        paragraphs={g.gourmetParagraphs}
                        extras={g.gourmetIncludes}
                    />
                </section>

                <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
                    <div className="rounded-[2rem] border border-ink/10 bg-white px-5 py-7 sm:px-10 sm:py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                        <div>
                            <h2 className="text-xl font-extrabold mb-1">{g.tourCtaTitle}</h2>
                            <p className="text-ink/65">{g.tourCtaText}</p>
                        </div>
                        <Link
                            href={`/${lang}/formulaire`}
                            className="bg-ink text-white font-semibold px-6 py-3 rounded-full hover:bg-ink/90 transition shrink-0 text-center"
                        >
                            {g.tourCtaButton}
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="border-t border-ink/10 py-8 text-center text-sm text-ink/45">
                {dict.footer.line}
            </footer>
        </div>
    )
}

function GuideCard({
    icon,
    badge,
    price,
    title,
    subtitle,
    paragraphs,
    extras,
}: {
    icon: ReactNode
    badge: string
    price: string
    title: string
    subtitle: string
    paragraphs: readonly string[]
    extras: readonly string[]
}) {
    return (
        <article className="bg-white rounded-[2rem] border border-ink/10 p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-ink/5 text-ink/70 flex items-center justify-center shrink-0">
                    {icon}
                </div>
                <span className="text-xs font-bold uppercase tracking-wide bg-apricot/15 text-apricot px-3 py-1 rounded-full">
                    {badge}
                </span>
                <span className="ml-auto text-lg font-extrabold text-ink">{price}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold mb-1">{title}</h2>
            <p className="text-ink/50 font-medium mb-4">{subtitle}</p>
            <div className="space-y-3">
                {paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-ink/70 leading-relaxed">
                        {paragraph}
                    </p>
                ))}
            </div>
            <ul className="mt-5 space-y-2">
                {extras.map((item) => (
                    <li key={item} className="flex gap-2 text-sm sm:text-base text-ink/80">
                        <span className="text-apricot font-bold shrink-0">→</span>
                        {item}
                    </li>
                ))}
            </ul>
        </article>
    )
}
