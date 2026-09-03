import { createVerify } from 'crypto'

const WISE_PRODUCTION_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvO8vXV+JksBzZAY6GhSO
XdoTCfhXaaiZ+qAbtaDBiu2AGkGVpmEygFmWP4Li9m5+Ni85BhVvZOodM9epgW3F
bA5Q1SexvAF1PPjX4JpMstak/QhAgl1qMSqEevL8cmUeTgcMuVWCJmlge9h7B1CS
D4rtlimGZozG39rUBDg6Qt2K+P4wBfLblL0k4C4YUdLnpGYEDIth+i8XsRpFlogx
CAFyH9+knYsDbR43UJ9shtc42Ybd40Afihj8KnYKXzchyQ42aC8aZ/h5hyZ28yVy
Oj3Vos0VdBIs/gAyJ/4yyQFCXYte64I7ssrlbGRaco4nKF3HmaNhxwyKyJafz19e
HwIDAQAB
-----END PUBLIC KEY-----`

const WISE_SANDBOX_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwpb91cEYuyJNQepZAVfP
ZIlPZfNUefH+n6w9SW3fykqKu938cR7WadQv87oF2VuT+fDt7kqeRziTmPSUhqPU
ys/V2Q1rlfJuXbE+Gga37t7zwd0egQ+KyOEHQOpcTwKmtZ81ieGHynAQzsn1We3j
wt760MsCPJ7GMT141ByQM+yW1Bx+4SG3IGjXWyqOWrcXsxAvIXkpUD/jK/L958Cg
nZEgz0BSEh0QxYLITnW1lLokSx/dTianWPFEhMC9BgijempgNXHNfcVirg1lPSyg
z7KqoKUN0oHqWLr2U1A+7kqrl6O2nx3CKs1bj1hToT1+p4kcMoHXA7kA+VBLUpEs
VwIDAQAB
-----END PUBLIC KEY-----`

type WiseProfile = { id: number; type?: string }
type WiseBalance = { id: number; currency?: string; type?: string }
type WiseStatementTx = {
    type?: string
    date?: string
    referenceNumber?: string
    amount?: { value?: number; currency?: string }
    details?: { description?: string; paymentReference?: string }
}

export type WiseCreditMatch = {
    amount: number
    currency: string
    reference?: string
    occurredAt?: string
}

function wiseBase(): string {
    return (process.env.WISE_API_BASE || 'https://api.wise.com').replace(/\/$/, '')
}

function isSandbox(): boolean {
    return wiseBase().includes('sandbox')
}

function wiseToken(): string {
    const token = process.env.WISE_API_TOKEN
    if (!token) throw new Error('WISE_API_TOKEN manquant')
    return token
}

export function wiseConfigured(): boolean {
    return Boolean(process.env.WISE_PAY_URL)
}

export function wiseApiConfigured(): boolean {
    return Boolean(process.env.WISE_API_TOKEN)
}

export function buildWisePayUrl(amountEur: number, reference: string): string {
    const raw = process.env.WISE_PAY_URL
    if (!raw) throw new Error('WISE_PAY_URL manquant')
    const url = new URL(raw)
    url.searchParams.set('currency', 'EUR')
    url.searchParams.set('amount', amountEur.toFixed(2))
    url.searchParams.set('description', reference)
    return url.toString()
}

async function wiseFetch<T>(path: string): Promise<T> {
    const res = await fetch(`${wiseBase()}${path}`, {
        headers: {
            Authorization: `Bearer ${wiseToken()}`,
            Accept: 'application/json',
        },
        cache: 'no-store',
    })
    if (!res.ok) {
        const body = await res.text()
        throw new Error(`Wise ${res.status}: ${body.slice(0, 280)}`)
    }
    return (await res.json()) as T
}

async function getProfileId(): Promise<number> {
    if (process.env.WISE_PROFILE_ID) return Number(process.env.WISE_PROFILE_ID)
    const profiles = await wiseFetch<WiseProfile[]>('/v1/profiles')
    const business = profiles.find((profile) => profile.type === 'BUSINESS') || profiles[0]
    if (!business) throw new Error('Aucun profil Wise')
    return business.id
}

async function getEurBalanceId(profileId: number): Promise<number> {
    if (process.env.WISE_BALANCE_ID) return Number(process.env.WISE_BALANCE_ID)
    const paths = [
        `/v4/profiles/${profileId}/balances?types=STANDARD`,
        `/v1/profiles/${profileId}/balances?types=STANDARD`,
        `/2026Q3/profiles/${profileId}/balances?types=STANDARD`,
    ]
    let lastError: Error | null = null
    for (const path of paths) {
        try {
            const balances = await wiseFetch<WiseBalance[]>(path)
            const eur =
                balances.find((balance) => balance.currency === 'EUR') || balances[0]
            if (eur?.id) return eur.id
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error))
        }
    }
    throw lastError || new Error('Solde EUR Wise introuvable')
}

function asCredits(transactions: WiseStatementTx[]): WiseCreditMatch[] {
    return transactions
        .filter((tx) => (tx.type || '').toUpperCase() === 'CREDIT')
        .map((tx) => ({
            amount: Number(tx.amount?.value),
            currency: tx.amount?.currency || 'EUR',
            reference: tx.referenceNumber || tx.details?.paymentReference || tx.details?.description,
            occurredAt: tx.date,
        }))
        .filter((tx) => Number.isFinite(tx.amount) && tx.amount > 0)
}

export async function listRecentWiseCredits(since: Date): Promise<WiseCreditMatch[]> {
    const profileId = await getProfileId()
    const balanceId = await getEurBalanceId(profileId)
    const start = since.toISOString()
    const end = new Date().toISOString()
    const query = `currency=EUR&intervalStart=${encodeURIComponent(start)}&intervalEnd=${encodeURIComponent(end)}&type=COMPACT`
    const paths = [
        `/v1/profiles/${profileId}/balance-statements/${balanceId}/statement.json?${query}`,
        `/2026Q3/profiles/${profileId}/balance-statements/${balanceId}/statement.json?${query}`,
        `/v1/borderless-accounts/${balanceId}/statement.json?${query}`,
    ]
    let lastError: Error | null = null
    for (const path of paths) {
        try {
            const statement = await wiseFetch<{ transactions?: WiseStatementTx[] }>(path)
            return asCredits(statement.transactions || [])
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error))
        }
    }
    throw lastError || new Error('Relevé Wise inaccessible')
}

export function amountsMatch(a: number, b: number): boolean {
    return Math.abs(Number(a) - Number(b)) < 0.005
}

export async function findWiseCreditForAmount(
    amountEur: number,
    since: Date,
    reference?: string
): Promise<WiseCreditMatch | null> {
    const credits = await listRecentWiseCredits(since)
    const exact = credits.find(
        (credit) =>
            amountsMatch(credit.amount, amountEur) &&
            (!credit.currency || credit.currency === 'EUR')
    )
    if (exact) return exact
    if (!reference) return null
    return (
        credits.find((credit) =>
            (credit.reference || '').toUpperCase().includes(reference.toUpperCase())
        ) || null
    )
}

export function verifyWiseWebhookSignature(rawBody: string, signature: string | null): boolean {
    if (process.env.WISE_WEBHOOK_SKIP_VERIFY === 'true') return true
    if (!signature) return process.env.NODE_ENV !== 'production'
    const key = process.env.WISE_WEBHOOK_PUBLIC_KEY || (isSandbox() ? WISE_SANDBOX_PUBLIC_KEY : WISE_PRODUCTION_PUBLIC_KEY)
    try {
        const verifier = createVerify('RSA-SHA256')
        verifier.update(rawBody)
        verifier.end()
        return verifier.verify(key, signature, 'base64')
    } catch {
        return false
    }
}

export type WiseWebhookPayload = {
    event_type?: string
    data?: {
        amount?: number
        currency?: string
        transaction_type?: string
        transfer_reference?: string
        occurred_at?: string
    }
}

export function creditFromWebhook(payload: WiseWebhookPayload): WiseCreditMatch | null {
    const data = payload.data
    if (!data) return null
    const type = (payload.event_type || '').toLowerCase()
    if (type && type !== 'balances#update' && type !== 'balances#credit') return null
    if ((data.transaction_type || 'credit').toLowerCase() !== 'credit') return null
    const amount = Number(data.amount)
    if (!Number.isFinite(amount) || amount <= 0) return null
    const currency = (data.currency || 'EUR').toUpperCase()
    if (currency !== 'EUR') return null
    return {
        amount,
        currency,
        reference: data.transfer_reference,
        occurredAt: data.occurred_at,
    }
}
