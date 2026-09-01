import Link from 'next/link'
import type { ReactNode } from 'react'
import {
    Clock,
    Compass,
    Landmark,
    Map,
    Quote,
    Utensils,
    Users,
} from 'lucide-react'
import PublicHeader from '@/components/PublicHeader'
import TourForm from '@/components/TourForm'

const REVIEWS: { name: string; quote: string; theme?: string }[] = [
    {
        name: 'Quentin',
        quote: `Mec, c’était incroyable de découvrir Chongqing comme tu me l’as fait découvrir. Pour une première fois ici et pour un premier jour, je pouvais difficilement espérer mieux !
Au-delà d’une découverte authentique de la ville, de ses quartiers et de ses bâtiments plus anciens, c’est surtout toute une vision de Chongqing que tu as essayé de me transmettre.
On ne s’est pas juste baladés à travers les 12 000 escaliers de la ville 😅 tu m’as raconté énormément d’histoires, que ce soit sur ton expérience personnelle, l’histoire de la ville, mais aussi plus largement sur la Chine et son évolution.

Clairement, il y a un avant et un après cette visite 👀

Le seul point négatif de la journée (si je dois en trouver un) c’est que je n’ai pas plus de temps à Chongqing pour en refaire une deuxième avec toi 🫣

Encore merci mec, c’était vraiment une journée incroyable !`,
    },
    {
        name: 'Flo',
        quote: `Bonsoir Mat, je t'avoue que j'avais un peu peur en réservant via insta.
Mais alors quelle belle surprise à été cette journée j'ai appris sur l'histoire de la ville, la culture de la population mais aussi sur la Chine en général , avec ton point de vue et ton vécu ici.
En tout cas je donnerai ton contact si des gens ont besoin continues ces belles visites et les belles idées que tu as en tête pour faire encore plus découvrir cette belle ville`,
    },
    {
        name: 'Mathieu',
        quote: `Merci beaucoup pour cette magnifique journée à Chongqing !
Tu as été un guide exceptionnel, très gentil, patient et passionné.
Grâce à toi, j'ai pu découvrir la ville d'une manière unique et vivre une super expérience.
Merci encore pour ton temps, tes conseils et ta bonne humeur. Je garderai un très bon souvenir de Chongqing et de cette journée avec toi. J'espère avoir l'occasion de te revoir un jour`,
    },
    {
        name: 'Walid',
        quote: `c'était incroyable tu m'as fait découvrir Chongqing comme je n'aurais pas pu la decouvrir par moi-même, tu m'as appris plus de choses sur l'histoire de la ville qu'on peut le faire par nous-mêmes grâce à toi j'ai pu expérimenter de nouvelles choses voir de nouveaux horizons et surtout me faire ma propre idée de cette ville, tu m'as permis d'apprécier chaque petit détail ta compagnie a été essentiel. Merci beaucoup Mat je reviendrai te voir à chaque fois que je reviendrai dans cette ville.`,
    },
    {
        name: 'Soiz',
        theme: 'Tour en famille',
        quote: `Merci Mattis pour cette journée où culture, histoire, économie, nourriture sont alimentés par tes connaissances du monde, de la Chine et de Chongching (la ville que tu as choisie). Ton adaptation de parcours a été Top.`,
    },
    {
        name: 'Sheri',
        quote: `Bonsoir Mat, merci pour la journée bien programmée d' aujourd'hui.
Elle était incroyable malgré cette lourde chaleur mide ).
Tu m as fait découvrir des spots géniaux. Je n'hésiterai pas à transmettre ton contact à mon entourage. Au plaisir de te revoir pour une nouvelle excursion`,
    },
    {
        name: 'Matheo',
        quote: `Merci encore pour la visite, très content d’avoir pu découvrir un chongqing que je n’imaginais pas ! C’est pile dans l’esprit que je voulais pour mon voyage ! Mention spéciale au resto du midi qui a participé à rendre la visite inoubliable !`,
    },
    {
        name: 'Léa',
        theme: 'Tour street photography',
        quote: `Hello Mat,
Encore merci pour hier. C’était vraiment une super journée, exactement ce que je cherchais. J’ai adoré découvrir tous ces quartiers et ces beaux points de vue où je ne serais pas allée seule. J’ai aussi beaucoup aimé pouvoir prendre mon temps et explorer à mon rythme. Et tes connaissances sur l’histoire et la culture chinoises ont vraiment rendu la journée encore plus intéressante. C’était un super équilibre entre photo, découverte et discussions 😊
Merci encore ! À +`,
    },
    {
        name: 'Vanessa',
        theme: 'Tour en famille',
        quote: `Encore merci pour cette journée de découvertes. Cela nous a permis de visiter la ville sous un angle différent. Ta connaissance des lieux fait que nous sommes passés par des endroits que nous n'aurions pas visités ou même trouvés. Apprendre l'histoire de Chongqing est également très intéressant . Un réel plaisir pour toute la famille. On pensera à toi si on repasse dans la région.`,
    },
]

export default function Home() {
    return (
        <div className="min-h-screen bg-cream text-ink">
            <PublicHeader />

            <main>
                <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-apricot mb-4">
                        Guide francophone à Chongqing
                    </p>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight max-w-3xl">
                        Découvrir Chongqing
                        <span className="block text-ink/50">comme on ne la voit pas dans les guides.</span>
                    </h1>
                    <p className="mt-6 text-lg sm:text-xl text-ink/70 max-w-2xl leading-relaxed">
                        J&apos;ai envie de vous faire découvrir ma ville comme je la connais vraiment.
                        <br /><br />
                        Ses coins préférés, sa nourriture, ses beaux points de vue et toutes les
                        petites expériences qu&apos;on ne trouve pas forcément dans les guides.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            href="#demande"
                            className="bg-ink text-white font-semibold px-6 py-3 rounded-full hover:bg-ink/90 transition"
                        >
                            Préparer ma journée
                        </Link>
                        <Link
                            href="#avis"
                            className="border-2 border-ink/15 font-semibold px-6 py-3 rounded-full hover:border-ink/40 transition"
                        >
                            Lire les retours
                        </Link>
                    </div>
                    <p className="mt-6 text-sm font-medium text-ink/50">
                        Journée type 9h–16h · 85 € par personne · Parcours sur mesure
                    </p>
                </section>

                <section
                    id="savoir-faire"
                    className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 scroll-mt-20"
                >
                    <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
                        Mon savoir-faire
                    </h2>
                    <p className="text-ink/65 max-w-2xl mb-8 leading-relaxed">
                        Ce n’est pas un circuit figé. C’est une journée construite avec toi,
                        adaptée à ton rythme, tes envies, et à ce que Chongqing a de plus
                        vivant.
                    </p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Skill
                            icon={<Map size={22} />}
                            title="Un parcours adapté"
                            text="J’ajuste le chemin en fonction de toi : mobilité, chaleur, envies du moment. C’est souvent ce que les gens retiennent."
                        />
                        <Skill
                            icon={<Landmark size={22} />}
                            title="Histoire & culture"
                            text="Quartiers, bâtiments anciens, évolution de la Chine : je raconte la ville comme je la vis, pas comme une fiche Wikipedia."
                        />
                        <Skill
                            icon={<Utensils size={22} />}
                            title="Nourriture & quotidien"
                            text="Street food, hot pot, adresses locales. Manger fait partie de la visite, pas d’une pause à part."
                        />
                        <Skill
                            icon={<Compass size={22} />}
                            title="Un regard de l’intérieur"
                            text="Chongqing est la ville que j’ai choisie. Je transmets un point de vue, un vécu, pas seulement des spots photo."
                        />
                        <Skill
                            icon={<Clock size={22} />}
                            title="Une vraie journée"
                            text="En général de 9h à 16h. Assez long pour voir, comprendre, et se faire sa propre idée de la ville."
                        />
                        <Skill
                            icon={<Users size={22} />}
                            title="À taille humaine"
                            text="Petits groupes, ton, patience. L’idée n’est pas d’enchaîner les sites, c’est de te faire aimer la ville."
                        />
                    </div>
                </section>

                <section
                    id="avis"
                    className="bg-white border-y border-ink/10 py-16 sm:py-20"
                >
                    <div className="max-w-5xl mx-auto px-4 sm:px-6">
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-apricot mb-3">
                            Retours d’expérience
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
                            Ce que les gens en disent
                        </h2>
                        <p className="text-ink/65 max-w-2xl mb-10">
                            Des messages reçus après les visites — le plus honnête des
                            argumentaires.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            {REVIEWS.map((review) => (
                                <figure
                                    key={review.name}
                                    className="bg-cream rounded-3xl p-6 border border-ink/10"
                                >
                                    <Quote
                                        size={22}
                                        className="text-apricot mb-3"
                                        aria-hidden
                                    />
                                    <blockquote className="text-[15px] sm:text-base leading-relaxed text-ink whitespace-pre-line">
                                        {review.quote}
                                    </blockquote>
                                    <figcaption className="mt-4 text-sm font-semibold text-ink/45">
                                        {review.name}
                                        {review.theme ? (
                                            <span className="font-medium text-ink/35">
                                                {' '}
                                                · {review.theme}
                                            </span>
                                        ) : null}
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
                    <h2 className="text-2xl sm:text-3xl font-extrabold mb-8">
                        Comment ça se passe
                    </h2>
                    <ol className="grid sm:grid-cols-3 gap-6">
                        <li>
                            <p className="text-apricot font-extrabold text-sm mb-2">01</p>
                            <h3 className="font-bold text-lg mb-2">Tu me parles de toi</h3>
                            <p className="text-ink/65 text-sm leading-relaxed">
                                Dates, rythme, envies, contraintes. Le formulaire prend quelques
                                minutes.
                            </p>
                        </li>
                        <li>
                            <p className="text-apricot font-extrabold text-sm mb-2">02</p>
                            <h3 className="font-bold text-lg mb-2">Je compose la journée</h3>
                            <p className="text-ink/65 text-sm leading-relaxed">
                                Un parcours pensé pour votre groupe. Confirmation avec un acompte
                                de 25 %.
                            </p>
                        </li>
                        <li>
                            <p className="text-apricot font-extrabold text-sm mb-2">03</p>
                            <h3 className="font-bold text-lg mb-2">On part de 9h à 16h</h3>
                            <p className="text-ink/65 text-sm leading-relaxed">
                                85 € par personne, hors transport, repas et billets. Le solde se
                                règle au début de la visite.
                            </p>
                        </li>
                    </ol>
                </section>

                <section
                    id="demande"
                    className="max-w-2xl mx-auto px-4 sm:px-6 pb-24 scroll-mt-20"
                >
                    <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">
                        Demander un tour
                    </h2>
                    <p className="text-ink/65 mb-8">
                        Dis-moi qui tu es et ce que tu aimerais vivre. Je reviens vers toi
                        avec une proposition.
                    </p>
                    <TourForm />
                </section>
            </main>

            <footer className="border-t border-ink/10 py-8 text-center text-sm text-ink/45">
                Mat - Le Meilleur guide de Chongqing
            </footer>
        </div>
    )
}

function Skill({
    icon,
    title,
    text,
}: {
    icon: ReactNode;
    title: string
    text: string
}) {
    return (
        <article className="bg-white rounded-3xl p-5 border border-ink/10">
            <div className="w-10 h-10 rounded-2xl bg-apricot/15 text-apricot flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <p className="text-sm text-ink/65 leading-relaxed">{text}</p>
        </article>
    )
}
