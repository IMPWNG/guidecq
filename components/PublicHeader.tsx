import Link from 'next/link'
import type { Dictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import MobileMenu from '@/components/MobileMenu'

type Props = {
    locale: Locale
    dict: Dictionary['header']
}

export default function PublicHeader({ locale, dict }: Props) {
    const home = `/${locale}`

    return (
        <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-ink/10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 min-h-14 md:h-16 py-2 md:py-0 flex items-center justify-between gap-2">
                <Link
                    href={home}
                    className="font-extrabold text-ink tracking-tight text-[13px] sm:text-sm md:text-base leading-snug min-w-0 flex-1"
                >
                    {dict.brand}
                    <span className="text-apricot"> — </span>
                    {dict.brandRest}
                </Link>

                <nav
                    className="hidden md:flex items-center gap-5 text-sm font-semibold"
                    aria-label={dict.navLabel}
                >
                    <Link
                        href={`${home}#savoir-faire`}
                        className="inline-flex items-center h-9 text-ink/70 hover:text-ink"
                    >
                        {dict.tour}
                    </Link>
                    <Link
                        href={`${home}#avis`}
                        className="inline-flex items-center h-9 text-ink/70 hover:text-ink"
                    >
                        {dict.reviews}
                    </Link>
                    <Link
                        href={`${home}/guides`}
                        className="inline-flex items-center h-9 text-ink/70 hover:text-ink"
                    >
                        {dict.guides}
                    </Link>
                    <LanguageSwitcher locale={locale} dict={dict} />
                    <Link
                        href={`${home}/formulaire`}
                        className="inline-flex items-center justify-center h-9 bg-ink text-white px-4 rounded-full hover:bg-ink/90 transition"
                    >
                        {dict.request}
                    </Link>
                </nav>

                <div className="flex md:hidden items-center gap-1 shrink-0">
                    <LanguageSwitcher locale={locale} dict={dict} />
                    <MobileMenu locale={locale} dict={dict} />
                </div>
            </div>
        </header>
    )
}
