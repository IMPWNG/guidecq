import { defaultLocale, isLocale, type Locale } from '@/lib/i18n'

export function negotiateLocale(acceptLanguage: string | null): Locale {
    if (!acceptLanguage) return defaultLocale

    const candidates = acceptLanguage
        .split(',')
        .map((part) => {
            const [tag, ...params] = part.trim().split(';')
            const q = params.find((p) => p.trim().startsWith('q='))
            const quality = q ? Number.parseFloat(q.split('=')[1] ?? '1') : 1
            return { tag: tag.trim().toLowerCase(), quality: Number.isFinite(quality) ? quality : 0 }
        })
        .sort((a, b) => b.quality - a.quality)

    for (const { tag } of candidates) {
        const base = tag.split('-')[0]
        if (isLocale(base)) return base
    }

    return defaultLocale
}
