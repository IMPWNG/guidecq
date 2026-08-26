import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import PublicHeader from '@/components/PublicHeader'

export default function Merci() {
    return (
        <div className="min-h-screen bg-cream">
            <PublicHeader />
            <main className="flex flex-col items-center justify-center px-6 py-24 text-center">
                <CheckCircle2 className="w-14 h-14 text-bamboo mb-6" />
                <h1 className="text-3xl font-extrabold text-ink mb-3">C’est envoyé</h1>
                <p className="text-ink/70 max-w-md mb-8 leading-relaxed">
                    Ta demande est bien enregistrée. Je reviens vers toi rapidement avec une
                    proposition de journée à Chongqing.
                </p>
                <Link
                    href="/"
                    className="bg-ink hover:bg-ink/90 text-white font-semibold px-6 py-3 rounded-full transition"
                >
                    Retour à l&apos;accueil
                </Link>
            </main>
        </div>
    )
}
