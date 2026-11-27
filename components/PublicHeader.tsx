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
        <header className="bar">
            <Link href={home} className="wordmark">
                Chongqing Tour
            </Link>
            <nav className="hidden md:flex items-center gap-5" aria-label={dict.navLabel}>
                <Link href={`${home}/avis`} className="back" style={{ margin: 0 }}>
                    {dict.reviews}
                </Link>
                <Link href={`${home}/guides`} className="back" style={{ margin: 0 }}>
                    {dict.guides}
                </Link>
                <LanguageSwitcher locale={locale} dict={dict} />
                <Link href={`${home}/formulaire`} className="lock" style={{ minHeight: 40, padding: '0.45rem 1rem' }}>
                    {dict.request}
                </Link>
            </nav>
            <div className="flex md:hidden items-center gap-2">
                <LanguageSwitcher locale={locale} dict={dict} />
                <MobileMenu locale={locale} dict={dict} />
            </div>
        </header>
    )
}
