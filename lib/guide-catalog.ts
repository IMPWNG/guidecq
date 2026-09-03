import type { Locale } from '@/lib/i18n'
import { isMemberGuideId, type MemberGuideId } from '@/lib/member-guides'

export const GUIDE_UNIT_PRICE_EUR = 35
export const GUIDE_CURRENCY = 'EUR'

export function uniqueGuideIds(raw: unknown): MemberGuideId[] {
    const list = Array.isArray(raw) ? raw : []
    return [...new Set(list.map(String).filter(isMemberGuideId))]
}

export function priceForGuides(guides: MemberGuideId[]): number {
    return uniqueGuideIds(guides).length * GUIDE_UNIT_PRICE_EUR
}

export function formatEur(amount: number, locale: Locale): string {
    return new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'fr-FR', {
        style: 'currency',
        currency: GUIDE_CURRENCY,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)
}
