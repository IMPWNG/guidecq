import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export default function Merci() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-bamboo mb-6" />
            <h1 className="text-3xl font-bold mb-3">Merci ! 🎉</h1>
            <p className="text-ink/70 max-w-md mb-8">
                Votre demande a bien été enregistrée. Je reviendrai vers toi
                rapidement avec un itinéraire personnalisé pour ton séjour à
                Chongqing.
            </p>
            <Link
                href="/"
                className="bg-sky hover:bg-sky/90 text-white font-semibold px-6 py-3 rounded-xl transition"
            >
                Retour à l&apos;accueil
            </Link>
        </main>
    )
}