import Link from 'next/link'

export default function PublicHeader() {
    return (
        <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-ink/10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                <Link href="/" className="font-extrabold text-ink tracking-tight">
                    Mattis
                    <span className="text-apricot"> · </span>
                    Chongqing
                </Link>
                <nav className="flex items-center gap-4 sm:gap-6 text-sm font-semibold">
                    <Link href="/#savoir-faire" className="text-ink/70 hover:text-ink hidden sm:inline">
                        Le tour
                    </Link>
                    <Link href="/#avis" className="text-ink/70 hover:text-ink hidden sm:inline">
                        Avis
                    </Link>
                    <Link
                        href="/formulaire"
                        className="bg-ink text-white px-4 py-2 rounded-full hover:bg-ink/90 transition"
                    >
                        Demander un tour
                    </Link>
                </nav>
            </div>
        </header>
    )
}
