export const locales = ['fr', 'en'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'fr'

export const localeCookie = 'NEXT_LOCALE'

export function isLocale(value: string | undefined | null): value is Locale {
    return value === 'fr' || value === 'en'
}

export function getLocaleFromPathname(pathname: string): Locale | null {
    const segment = pathname.split('/').filter(Boolean)[0]
    return isLocale(segment) ? segment : null
}

export function replaceLocaleInPath(pathname: string, nextLocale: Locale): string {
    const parts = pathname.split('/')
    if (isLocale(parts[1])) {
        parts[1] = nextLocale
        return parts.join('/') || `/${nextLocale}`
    }
    return `/${nextLocale}${pathname === '/' ? '' : pathname}`
}
