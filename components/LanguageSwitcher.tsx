'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Dictionary } from '@/lib/dictionaries'
import { localeCookie, replaceLocaleInPath, type Locale } from '@/lib/i18n'

type Props = {
    locale: Locale
    dict: Dictionary['header']
}

function persistLocale(next: Locale) {
    document.cookie = `${localeCookie}=${next}; path=/; max-age=${60 * 60 * 24 * 365}`
}

export default function LanguageSwitcher({ locale, dict }: Props) {
    const pathname = usePathname() || `/${locale}`

    return (
        <div
            className="flex items-center h-9 rounded-none border border-[#31404e] p-0.5 text-xs font-bold tracking-wide shrink-0"
            role="group"
            aria-label="Language"
        >
            <Link
                href={replaceLocaleInPath(pathname, 'fr')}
                onClick={() => persistLocale('fr')}
                className={`px-2 sm:px-2.5 h-7 inline-flex items-center transition ${
                    locale === 'fr' ? 'bg-chili text-white' : 'text-concrete hover:text-foam'
                }`}
                aria-current={locale === 'fr' ? 'true' : undefined}
                hrefLang="fr"
                lang="fr"
                title={dict.langSwitchToFr}
            >
                {dict.langFr}
            </Link>
            <Link
                href={replaceLocaleInPath(pathname, 'en')}
                onClick={() => persistLocale('en')}
                className={`px-2 sm:px-2.5 h-7 inline-flex items-center transition ${
                    locale === 'en' ? 'bg-chili text-white' : 'text-concrete hover:text-foam'
                }`}
                aria-current={locale === 'en' ? 'true' : undefined}
                hrefLang="en"
                lang="en"
                title={dict.langSwitchToEn}
            >
                {dict.langEn}
            </Link>
        </div>
    )
}
