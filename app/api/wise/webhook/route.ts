import { NextResponse } from 'next/server'
import { findPendingByAmount, markPurchasePaid } from '@/lib/guide-purchases'
import { creditFromWebhook, verifyWiseWebhookSignature, type WiseWebhookPayload } from '@/lib/wise'

export async function GET() {
    return NextResponse.json({ ok: true })
}

export async function POST(request: Request) {
    const rawBody = await request.text()
    const signature =
        request.headers.get('x-signature-sha256') || request.headers.get('X-Signature-SHA256')

    if (!verifyWiseWebhookSignature(rawBody, signature)) {
        return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
    }

    let payload: unknown
    try {
        payload = JSON.parse(rawBody || '{}')
    } catch {
        return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
    }

    const credit = creditFromWebhook(payload as WiseWebhookPayload)
    if (!credit) {
        return NextResponse.json({ ok: true, ignored: true })
    }

    const purchase = await findPendingByAmount(credit.amount, credit.currency)
    if (!purchase) {
        return NextResponse.json({ ok: true, matched: false })
    }

    await markPurchasePaid(purchase.id, credit.reference)
    return NextResponse.json({ ok: true, matched: true, token: purchase.access_token })
}
