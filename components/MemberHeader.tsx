'use client'

import Link from 'next/link'
import type { Dictionary } from '@/lib/dictionaries'
import { localeCookie, type Locale } from '@/lib/i18n'

type Props = {
    locale: Locale
    dict: Dictionary['header']
    path: string
}

export default function MemberHeader({ locale, dict, path }: Props) {
    const persist = (next: Locale) => {
        document.cookie = `${localeCookie}=${next}; path=/; max-age=${60 * 60 * 24 * 365}`
    }

    const switchPath = (next: Locale) => {
        const parts = path.split('/')
        if (parts[1] === 'fr' || parts[1] === 'en') {
            parts[1] = next
            return parts.join('/')
        }
        return `/${next}${path.startsWith('/') ? path : `/${path}`}`
    }

    return (
        <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-ink/10">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
                <Link
                    href={`/${locale}`}
                    className="font-extrabold text-ink tracking-tight text-sm sm:text-base min-w-0 truncate"
                >
                    {dict.brand}
                    <span className="text-apricot"> — </span>
                    {dict.brandRest}
                </Link>
                <div
                    className="flex items-center h-9 rounded-full border border-ink/15 p-0.5 text-xs font-bold tracking-wide shrink-0"
                    role="group"
                    aria-label="Language"
                >
                    <Link
                        href={switchPath('fr')}
                        onClick={() => persist('fr')}
                        className={`px-2.5 h-7 inline-flex items-center rounded-full transition ${
                            locale === 'fr' ? 'bg-ink text-white' : 'text-ink/55 hover:text-ink'
                        }`}
                        aria-current={locale === 'fr' ? 'true' : undefined}
                        hrefLang="fr"
                        lang="fr"
                        title={dict.langSwitchToFr}
                    >
                        {dict.langFr}
                    </Link>
                    <Link
                        href={switchPath('en')}
                        onClick={() => persist('en')}
                        className={`px-2.5 h-7 inline-flex items-center rounded-full transition ${
                            locale === 'en' ? 'bg-ink text-white' : 'text-ink/55 hover:text-ink'
                        }`}
                        aria-current={locale === 'en' ? 'true' : undefined}
                        hrefLang="en"
                        lang="en"
                        title={dict.langSwitchToEn}
                    >
                        {dict.langEn}
                    </Link>
                </div>
            </div>
        </header>
    )
}
