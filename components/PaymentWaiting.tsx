'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'
import type { Dictionary } from '@/lib/dictionaries'
import { formatEur } from '@/lib/guide-catalog'
import type { Locale } from '@/lib/i18n'

type Props = {
    locale: Locale
    dict: Dictionary['paiement']
    token: string
    amount: number
    reference: string
    payUrl: string
    alreadyPaid?: boolean
}

export default function PaymentWaiting({
    locale,
    dict,
    token,
    amount,
    reference,
    payUrl,
    alreadyPaid = false,
}: Props) {
    const router = useRouter()
    const [checking, setChecking] = useState(false)
    const [message, setMessage] = useState<string | null>(alreadyPaid ? dict.redirecting : null)
    const [paid, setPaid] = useState(alreadyPaid)

    const goToMember = (url?: string) => {
        setPaid(true)
        setMessage(dict.redirecting)
        router.replace(url || `/${locale}/membre/${token}`)
    }

    const confirm = async (silent = false) => {
        if (!silent) setChecking(true)
        if (!silent) setMessage(null)
        try {
            const res = await fetch('/api/guides/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            })
            const data = (await res.json()) as {
                status?: string
                memberUrl?: string
                reason?: string
            }
            if (data.status === 'paid') {
                goToMember(data.memberUrl)
                return
            }
            if (!silent) {
                if (data.reason === 'api_missing') setMessage(dict.apiMissing)
                else setMessage(dict.notYet)
            }
        } catch {
            if (!silent) setMessage(dict.error)
        } finally {
            if (!silent) setChecking(false)
        }
    }

    useEffect(() => {
        if (alreadyPaid) {
            goToMember()
            return
        }
        const id = window.setInterval(() => {
            void confirm(true)
        }, 8000)
        return () => window.clearInterval(id)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alreadyPaid, token])

    return (
        <div className="bg-white rounded-[2rem] border border-ink/10 p-5 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-apricot mb-3">
                {dict.eyebrow}
            </p>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">{dict.title}</h1>
            <p className="text-ink/70 leading-relaxed mb-7">{dict.intro}</p>

            <div className="rounded-2xl bg-cream border border-ink/10 px-5 py-4 mb-6">
                <p className="text-xs font-bold uppercase tracking-wide text-ink/45 mb-1">
                    {dict.amountLabel}
                </p>
                <p className="text-3xl font-extrabold text-ink">{formatEur(amount, locale)}</p>
                <p className="text-sm text-ink/60 mt-2 leading-relaxed">{dict.amountHint}</p>
                <p className="text-sm text-ink/55 mt-3">
                    {dict.referenceLabel}{' '}
                    <span className="font-semibold text-ink">{reference}</span>
                </p>
            </div>

            {paid ? (
                <div className="flex items-center gap-2 text-ink font-semibold">
                    <CheckCircle2 size={20} className="text-apricot" />
                    {dict.redirecting}
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                    <a
                        href={payUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center bg-apricot hover:bg-apricot/90 text-white font-semibold px-6 py-3 rounded-xl transition text-center"
                    >
                        {dict.payCta}
                    </a>
                    <button
                        type="button"
                        onClick={() => void confirm(false)}
                        disabled={checking}
                        className="inline-flex items-center justify-center gap-2 bg-ink text-white font-semibold px-6 py-3 rounded-xl hover:bg-ink/90 transition disabled:opacity-60"
                    >
                        {checking && <Loader2 size={18} className="animate-spin" />}
                        {checking ? dict.checking : dict.paidCta}
                    </button>
                </div>
            )}

            {message && !paid ? (
                <p className="mt-5 text-sm leading-relaxed text-ink/70">{message}</p>
            ) : null}
        </div>
    )
}
