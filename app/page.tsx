import Link from 'next/link'
import { Mountain, Building2, Landmark, Utensils, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-center px-4 md:px-6 text-center bg-gradient-to-br from-sunshine via-apricot to-sky">

      {/* Formes décoratives flottantes */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-white/20 rounded-full blur-sm" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-bamboo/30 rounded-full blur-md" />
      <div className="absolute top-1/3 right-20 w-16 h-16 bg-white/30 rounded-full" />
      <div className="absolute bottom-10 left-16 w-20 h-20 bg-sky/40 rounded-full blur-sm" />

      <div className="relative z-10 w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-3xl px-6 md:px-8 py-8 md:py-10 shadow-2xl border-4 border-white flex flex-col gap-4 md:gap-6">

        <span className="inline-flex items-center gap-2 bg-bamboo/20 text-bamboo font-bold px-5 py-2 rounded-full text-sm mx-auto">
          <Sparkles size={16} /> Une aventure à Chongqing
        </span>

        <h1 className="text-3xl md:text-4xl font-extrabold text-ink leading-tight">
          Viens découvrir
          <span className="block bg-gradient-to-r from-apricot to-sky bg-clip-text text-transparent">
            Chongqing avec moi ✨
          </span>
        </h1>

        <p className="text-sm md:text-base text-ink/70">
          J&apos;ai envie de vous faire découvrir ma ville comme je la connais vraiment 😁<br /><br />
          Ses coins préférés, sa nourriture, ses beaux points de vue et toutes les
          petites expériences qu&apos;on ne trouve pas forcément dans les guides.
        </p>

        <p className="text-sm md:text-base text-ink/70">
          Si tu aimerais participer à un tour guidé avec moi à Chongqing,
          remplis ce petit formulaire pour me parler de ton projet 💛
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <div className="bg-bamboo/10 p-3 rounded-2xl hover:scale-105 transition flex flex-col items-center justify-center min-h-[85px]">
            <Mountain className="w-6 h-6 text-bamboo mb-2" />
            <span className="text-xs font-semibold text-ink text-center line-clamp-2">
              Vues de folie
            </span>
          </div>

          <div className="bg-sky/10 p-3 rounded-2xl hover:scale-105 transition flex flex-col items-center justify-center min-h-[85px]">
            <Building2 className="w-6 h-6 text-sky mb-2" />
            <span className="text-xs font-semibold text-ink text-center line-clamp-2">
              Comme un local
            </span>
          </div>

          <div className="bg-apricot/10 p-3 rounded-2xl hover:scale-105 transition flex flex-col items-center justify-center min-h-[85px]">
            <Landmark className="w-6 h-6 text-apricot mb-2" />
            <span className="text-xs font-semibold text-ink text-center line-clamp-2">
              Culture locale
            </span>
          </div>

          <div className="bg-sunshine/10 p-3 rounded-2xl hover:scale-105 transition flex flex-col items-center justify-center min-h-[85px]">
            <Utensils className="w-6 h-6 text-sunshine mb-2" />
            <span className="text-xs font-semibold text-ink text-center line-clamp-2">
              Food trip
            </span>
          </div>
        </div>

        <Link
          href="/formulaire"
          className="inline-block bg-gradient-to-r from-apricot to-sunshine hover:scale-105 text-white font-bold px-8 py-3 md:py-4 rounded-full shadow-lg transition-transform text-base md:text-lg mx-auto"
        >
          Découvrir Chongqing 🚀
        </Link>

        <p className="text-xs md:text-sm text-ink/60">
          Quelques questions pour en savoir plus sur toi et ton voyage.
        </p>

        <p className="relative z-10 text-sunshine mt-8 text-sm font-medium">
          ⏱️ Ça prend seulement quelques minutes 💌
        </p>
      </div>
    </main>
  )
}