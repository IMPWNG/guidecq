import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import {
    Clock,
    Compass,
    Landmark,
    Map,
    Quote,
    Utensils,
    Users,
} from 'lucide-react'
import PublicHeader from '@/components/PublicHeader'
import TourForm from '@/components/TourForm'
import { getDictionary } from '@/lib/dictionaries'
import { isLocale } from '@/lib/i18n'
import { notFound } from 'next/navigation'

const SKILL_ICONS = [
    <Map size={22} key="map" />,
    <Landmark size={22} key="landmark" />,
    <Utensils size={22} key="utensils" />,
    <Compass size={22} key="compass" />,
    <Clock size={22} key="clock" />,
    <Users size={22} key="users" />,
]

export default async function Home({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    const dict = getDictionary(lang)
    const home = `/${lang}`

    return (
        <div className="min-h-screen bg-cream text-ink">
            <PublicHeader locale={lang} dict={dict.header} />

            <main>
                <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16">
                    <div className="grid lg:grid-cols-[minmax(0,1fr)_min(280px,32%)] gap-10 lg:gap-12 items-center">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-apricot mb-4">
                                {dict.home.eyebrow}
                            </p>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight max-w-3xl">
                                {dict.home.title}
                                <span className="block text-ink/50">{dict.home.titleAccent}</span>
                            </h1>
                            <p className="mt-6 text-lg sm:text-xl text-ink/70 max-w-2xl leading-relaxed">
                                {dict.home.intro}
                                <br />
                                <br />
                                {dict.home.intro2}
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    href="#demande"
                                    className="bg-ink text-white font-semibold px-6 py-3 rounded-full hover:bg-ink/90 transition"
                                >
                                    {dict.home.ctaPrimary}
                                </Link>
                                <Link
                                    href="#avis"
                                    className="border-2 border-ink/15 font-semibold px-6 py-3 rounded-full hover:border-ink/40 transition"
                                >
                                    {dict.home.ctaSecondary}
                                </Link>
                            </div>
                            <p className="mt-6 text-sm font-medium text-ink/50">{dict.home.metaLine}</p>
                        </div>

                        <a
                            href="https://www.instagram.com/chongqingbarbermat/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={dict.home.instagramAria}
                            className="mx-auto lg:mx-0 justify-self-center lg:justify-self-end w-full max-w-50 sm:max-w-60 lg:max-w-65 group"
                        >
                            <span className="block rounded-3xl overflow-hidden bg-white shadow-[0_18px_40px_-18px_rgba(58,58,58,0.45)] transition group-hover:shadow-[0_22px_48px_-16px_rgba(58,58,58,0.5)] group-hover:-translate-y-0.5">
                                <Image
                                    src="/instagram-qr.png"
                                    alt="@chongqingbarbermat"
                                    width={453}
                                    height={453}
                                    className="w-full h-auto"
                                    priority
                                />
                            </span>
                            <span className="mt-3 block text-center text-sm font-semibold text-ink/55 group-hover:text-ink">
                                {dict.home.instagramHint}
                            </span>
                        </a>
                    </div>
                </section>

                <section
                    id="savoir-faire"
                    className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 scroll-mt-20"
                >
                    <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
                        {dict.home.skillsTitle}
                    </h2>
                    <p className="text-ink/65 max-w-2xl mb-8 leading-relaxed">
                        {dict.home.skillsIntro}
                    </p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dict.home.skills.map((skill, index) => (
                            <Skill
                                key={skill.title}
                                icon={SKILL_ICONS[index]}
                                title={skill.title}
                                text={skill.text}
                            />
                        ))}
                    </div>
                </section>

                <section id="avis" className="bg-white border-y border-ink/10 py-16 sm:py-20">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6">
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-apricot mb-3">
                            {dict.home.reviewsEyebrow}
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
                            {dict.home.reviewsTitle}
                        </h2>
                        <p className="text-ink/65 max-w-2xl mb-10">{dict.home.reviewsIntro}</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            {dict.home.reviews.map((review) => (
                                <figure
                                    key={review.name}
                                    className="bg-cream rounded-3xl p-6 border border-ink/10"
                                >
                                    <Quote
                                        size={22}
                                        className="text-apricot mb-3"
                                        aria-hidden
                                    />
                                    <blockquote className="text-[15px] sm:text-base leading-relaxed text-ink whitespace-pre-line">
                                        {review.quote}
                                    </blockquote>
                                    <figcaption className="mt-4 text-sm font-semibold text-ink/45">
                                        {review.name}
                                        {'theme' in review && review.theme ? (
                                            <span className="font-medium text-ink/35">
                                                {' '}
                                                · {review.theme}
                                            </span>
                                        ) : null}
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
                    <h2 className="text-2xl sm:text-3xl font-extrabold mb-8">
                        {dict.home.howTitle}
                    </h2>
                    <ol className="grid sm:grid-cols-3 gap-6">
                        {dict.home.how.map((item, index) => (
                            <li key={item.title}>
                                <p className="text-apricot font-extrabold text-sm mb-2">
                                    {String(index + 1).padStart(2, '0')}
                                </p>
                                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                <p className="text-ink/65 text-sm leading-relaxed">{item.text}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
                    <div className="rounded-[2rem] bg-ink text-cream px-6 py-8 sm:px-10 sm:py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        <div className="max-w-xl">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-apricot mb-2">
                                {dict.header.guides}
                            </p>
                            <h2 className="text-2xl font-extrabold mb-2">
                                {dict.home.pdfBannerTitle}
                            </h2>
                            <p className="text-cream/75 leading-relaxed">
                                {dict.home.pdfBannerText}
                            </p>
                        </div>
                        <Link
                            href={`${home}/guides`}
                            className="bg-apricot text-white font-semibold px-6 py-3 rounded-full hover:bg-apricot/90 transition shrink-0 text-center"
                        >
                            {dict.home.pdfBannerCta}
                        </Link>
                    </div>
                </section>

                <section
                    id="demande"
                    className="max-w-2xl mx-auto px-4 sm:px-6 pb-24 scroll-mt-20"
                >
                    <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">
                        {dict.home.requestTitle}
                    </h2>
                    <p className="text-ink/65 mb-8">{dict.home.requestIntro}</p>
                    <TourForm locale={lang} dict={dict.form} />
                </section>
            </main>

            <footer className="border-t border-ink/10 py-8 text-center text-sm text-ink/45">
                {dict.footer.line}
            </footer>
        </div>
    )
}

function Skill({
    icon,
    title,
    text,
}: {
    icon: ReactNode
    title: string
    text: string
}) {
    return (
        <article className="bg-white rounded-3xl p-5 border border-ink/10">
            <div className="w-10 h-10 rounded-2xl bg-apricot/15 text-apricot flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <p className="text-sm text-ink/65 leading-relaxed">{text}</p>
        </article>
    )
}
