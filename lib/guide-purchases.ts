import { createHash, randomBytes, randomUUID } from 'crypto'
import { uniqueGuideIds } from '@/lib/guide-catalog'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import type { Locale } from '@/lib/i18n'
import type { MemberGuideId } from '@/lib/member-guides'

export type PurchaseStatus = 'pending' | 'paid' | 'expired' | 'cancelled'

export type GuidePurchase = {
    id: string
    prenom: string
    nom: string
    email: string
    telephone: string
    guides: MemberGuideId[]
    amount_eur: number
    currency: string
    status: PurchaseStatus
    access_token: string
    payment_reference: string
    wise_transfer_id: string | null
    locale: string
    message: string
    created_at: string
    paid_at: string | null
}

type PurchaseRow = Omit<GuidePurchase, 'guides' | 'amount_eur' | 'status'> & {
    guides: string[] | null
    amount_eur: number | string
    status: string
}

function extraCents(seed: string): number {
    const digest = createHash('sha256').update(seed).digest()
    return (digest[0]! % 89) + 1
}

function roundEur(value: number): number {
    return Math.round(value * 100) / 100
}

function withUniqueCents(baseEuros: number, seed: string, attempt: number): number {
    const extra = ((extraCents(seed) + attempt - 1) % 89) + 1
    return roundEur(baseEuros + extra / 100)
}

function paymentReference(): string {
    return `CQ-${randomBytes(3).toString('hex').toUpperCase()}`
}

export function mapPurchase(row: PurchaseRow): GuidePurchase {
    return {
        ...row,
        guides: uniqueGuideIds(row.guides),
        amount_eur: Number(row.amount_eur),
        status: row.status as PurchaseStatus,
        telephone: row.telephone || '',
        message: row.message || '',
        wise_transfer_id: row.wise_transfer_id || null,
        paid_at: row.paid_at || null,
    }
}

export async function getPurchaseByToken(token: string): Promise<GuidePurchase | null> {
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
        .from('guide_purchases')
        .select('*')
        .eq('access_token', token)
        .maybeSingle()
    if (error || !data) return null
    return mapPurchase(data as PurchaseRow)
}

export async function createPendingPurchase(input: {
    prenom: string
    nom: string
    email: string
    telephone: string
    guides: MemberGuideId[]
    amountBaseEur: number
    locale: Locale
    message: string
}): Promise<GuidePurchase> {
    const supabase = createSupabaseAdmin()
    const accessToken = randomUUID()
    const reference = paymentReference()

    for (let attempt = 0; attempt < 89; attempt++) {
        const amount = withUniqueCents(input.amountBaseEur, accessToken, attempt)
        const { data, error } = await supabase
            .from('guide_purchases')
            .insert([
                {
                    prenom: input.prenom,
                    nom: input.nom,
                    email: input.email,
                    telephone: input.telephone,
                    guides: input.guides,
                    amount_eur: amount,
                    currency: 'EUR',
                    status: 'pending',
                    access_token: accessToken,
                    payment_reference: reference,
                    locale: input.locale,
                    message: input.message,
                },
            ])
            .select('*')
            .single()

        if (!error && data) return mapPurchase(data as PurchaseRow)

        const duplicateAmount =
            error?.code === '23505' ||
            /amount_eur|guide_purchases_pending_amount/i.test(error?.message || '')
        if (duplicateAmount) continue

        throw new Error(error?.message || 'Impossible de créer la commande')
    }

    throw new Error('Impossible d’attribuer un montant unique')
}

export async function findPendingByAmount(
    amountEur: number,
    currency = 'EUR'
): Promise<GuidePurchase | null> {
    const supabase = createSupabaseAdmin()
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    const { data, error } = await supabase
        .from('guide_purchases')
        .select('*')
        .eq('status', 'pending')
        .eq('currency', currency)
        .eq('amount_eur', roundEur(amountEur))
        .gte('created_at', since)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()
    if (error || !data) return null
    return mapPurchase(data as PurchaseRow)
}

export async function markPurchasePaid(
    id: string,
    wiseTransferId?: string | null
): Promise<GuidePurchase | null> {
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
        .from('guide_purchases')
        .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            ...(wiseTransferId ? { wise_transfer_id: wiseTransferId } : {}),
        })
        .eq('id', id)
        .eq('status', 'pending')
        .select('*')
        .maybeSingle()
    if (error || !data) return null
    return mapPurchase(data as PurchaseRow)
}
