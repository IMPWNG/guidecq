import { NextResponse } from 'next/server'
import { priceForGuides, uniqueGuideIds } from '@/lib/guide-catalog'
import { createPendingPurchase } from '@/lib/guide-purchases'
import { isLocale } from '@/lib/i18n'
import { buildWisePayUrl, wiseConfigured } from '@/lib/wise'

function originFrom(request: Request): string {
    const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
    if (env) return env
    return new URL(request.url).origin
}

export async function POST(request: Request) {
    if (!wiseConfigured()) {
        return NextResponse.json(
            { error: 'WISE_PAY_URL manquant. Ajoute ton lien Quick Pay Wise.' },
            { status: 503 }
        )
    }

    let body: Record<string, unknown>
    try {
        body = (await request.json()) as Record<string, unknown>
    } catch {
        return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
    }

    const localeRaw = String(body.locale || '')
    const locale = isLocale(localeRaw) ? localeRaw : 'fr'
    const prenom = String(body.prenom || '').trim()
    const nom = String(body.nom || '').trim()
    const email = String(body.email || '').trim()
    const telephone = String(body.telephone || '').trim()
    const message = String(body.message || '').trim()
    const guides = uniqueGuideIds(body.guides)

    if (!prenom || !nom || !email || guides.length === 0) {
        return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    try {
        const purchase = await createPendingPurchase({
            prenom,
            nom,
            email,
            telephone,
            guides,
            amountBaseEur: priceForGuides(guides),
            locale,
            message,
        })
        const waitUrl = `${originFrom(request)}/${locale}/guides/paiement/${purchase.access_token}`
        return NextResponse.json({
            token: purchase.access_token,
            amount: purchase.amount_eur,
            reference: purchase.payment_reference,
            payUrl: buildWisePayUrl(purchase.amount_eur, purchase.payment_reference),
            waitUrl,
        })
    } catch (error) {
        const text = error instanceof Error ? error.message : String(error)
        const missingTable = /guide_purchases|schema cache|does not exist/i.test(text)
        return NextResponse.json(
            {
                error: missingTable
                    ? 'Table guide_purchases absente. Exécute supabase/guide_purchases.sql dans Supabase.'
                    : text,
            },
            { status: 500 }
        )
    }
}
