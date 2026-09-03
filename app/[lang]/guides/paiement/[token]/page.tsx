import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PublicHeader from '@/components/PublicHeader'
import PaymentWaiting from '@/components/PaymentWaiting'
import { getDictionary } from '@/lib/dictionaries'
import { getPurchaseByToken } from '@/lib/guide-purchases'
import { isLocale } from '@/lib/i18n'
import { buildWisePayUrl, wiseConfigured } from '@/lib/wise'

type PageProps = {
    params: Promise<{ lang: string; token: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { lang } = await params
    if (!isLocale(lang)) return {}
    const dict = getDictionary(lang)
    return {
        title: dict.meta.paiementTitle,
        robots: { index: false, follow: false },
    }
}

export default async function PaiementPage({ params }: PageProps) {
    const { lang, token } = await params
    if (!isLocale(lang)) notFound()
    const dict = getDictionary(lang)
    const purchase = await getPurchaseByToken(token)
    if (!purchase) notFound()

    const payUrl = wiseConfigured()
        ? buildWisePayUrl(purchase.amount_eur, purchase.payment_reference)
        : ''

    return (
        <div className="min-h-screen bg-cream text-ink">
            <PublicHeader locale={lang} dict={dict.header} />
            <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-20">
                {!payUrl ? (
                    <div className="bg-white rounded-[2rem] border border-ink/10 p-6 sm:p-8">
                        <h1 className="text-2xl font-extrabold mb-3">{dict.paiement.title}</h1>
                        <p className="text-ink/70 leading-relaxed">{dict.paiement.configMissing}</p>
                    </div>
                ) : (
                    <PaymentWaiting
                        locale={lang}
                        dict={dict.paiement}
                        token={purchase.access_token}
                        amount={purchase.amount_eur}
                        reference={purchase.payment_reference}
                        payUrl={payUrl}
                        alreadyPaid={purchase.status === 'paid'}
                    />
                )}
            </main>
        </div>
    )
}
