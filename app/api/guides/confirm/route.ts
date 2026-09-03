import { NextResponse } from 'next/server'
import { getPurchaseByToken, markPurchasePaid } from '@/lib/guide-purchases'
import { findWiseCreditForAmount, wiseApiConfigured } from '@/lib/wise'

function originFrom(request: Request): string {
    const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
    if (env) return env
    return new URL(request.url).origin
}

export async function POST(request: Request) {
    let body: Record<string, unknown>
    try {
        body = (await request.json()) as Record<string, unknown>
    } catch {
        return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
    }

    const token = String(body.token || '').trim()
    if (!token) {
        return NextResponse.json({ error: 'Token manquant' }, { status: 400 })
    }

    const purchase = await getPurchaseByToken(token)
    if (!purchase) {
        return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }

    const locale = purchase.locale || 'fr'
    const memberUrl = `${originFrom(request)}/${locale}/membre/${purchase.access_token}`

    if (purchase.status === 'paid') {
        return NextResponse.json({ status: 'paid', memberUrl })
    }

    if (purchase.status !== 'pending') {
        return NextResponse.json({ status: purchase.status })
    }

    if (!wiseApiConfigured()) {
        return NextResponse.json({
            status: 'pending',
            reason: 'api_missing',
        })
    }

    try {
        const since = new Date(new Date(purchase.created_at).getTime() - 10 * 60 * 1000)
        const match = await findWiseCreditForAmount(
            purchase.amount_eur,
            since,
            purchase.payment_reference
        )
        if (!match) {
            return NextResponse.json({ status: 'pending' })
        }
        await markPurchasePaid(purchase.id, match.reference)
        return NextResponse.json({ status: 'paid', memberUrl })
    } catch (error) {
        const text = error instanceof Error ? error.message : String(error)
        return NextResponse.json({
            status: 'pending',
            reason: 'wise_error',
            error: text.slice(0, 280),
        })
    }
}
