import PublicHeader from '@/components/PublicHeader'
import TourForm from '@/components/TourForm'

export default function Formulaire() {
    return (
        <div className="min-h-screen bg-cream">
            <PublicHeader />
            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-ink mb-2">
                    Demander un tour
                </h1>
                <p className="text-ink/65 mb-8">
                    Quelques questions pour composer une journée à Chongqing autour de toi.
                    Les visites se font en général de 9h à 16h.
                </p>
                <TourForm />
            </main>
        </div>
    )
}
