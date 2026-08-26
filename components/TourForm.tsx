'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ProgressBar from '@/components/ProgressBar'
import SliderPreference from '@/components/SliderPreference'
import { ChevronLeft, ChevronRight, Loader2, Plus, X, AlertCircle } from 'lucide-react'

const TOTAL_STEPS = 5

type Participant = {
    id: number
    prenom: string
    age: string
}

const initialForm = {
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    participants: [{ id: 1, prenom: '', age: '' }] as Participant[],
    date_arrivee: '',
    date_depart: '',
    restrictions: '',
    mobilite: '',
    langues: [] as string[],
    pref_nature: 3,
    pref_ville: 3,
    pref_histoire: 3,
    pref_gastronomie: 3,
    pref_insolite: 3,
    pref_photo: 3,
    deja_visite_chine: false,
    excursions_interet: false,
    transport_prefere: '',
    rythme: '',
    commentaires: '',
    option_voiture_privee: false,
}

const inputClass =
    'border-2 border-ink/10 rounded-xl px-4 py-3 text-base w-full bg-white text-ink placeholder:text-ink/40 focus:outline-none focus:border-apricot'

export default function TourForm() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState(initialForm)
    const [errorModal, setErrorModal] = useState<string[] | null>(null)

    const update = (field: string, value: unknown) =>
        setForm((prev) => ({ ...prev, [field]: value }))

    const toggleLangue = (langue: string) => {
        setForm((prev) => ({
            ...prev,
            langues: prev.langues.includes(langue)
                ? prev.langues.filter((l) => l !== langue)
                : [...prev.langues, langue],
        }))
    }

    const addParticipant = () => {
        setForm((prev) => ({
            ...prev,
            participants: [
                ...prev.participants,
                { id: Date.now(), prenom: '', age: '' },
            ],
        }))
    }

    const removeParticipant = (id: number) => {
        setForm((prev) => ({
            ...prev,
            participants: prev.participants.filter((p) => p.id !== id),
        }))
    }

    const updateParticipant = (
        id: number,
        field: 'prenom' | 'age',
        value: string
    ) => {
        setForm((prev) => ({
            ...prev,
            participants: prev.participants.map((p) =>
                p.id === id ? { ...p, [field]: value } : p
            ),
        }))
    }

    const getStepErrors = (): string[] => {
        const errors: string[] = []

        if (step === 1) {
            if (!form.prenom.trim()) errors.push('Prénom')
            if (!form.nom.trim()) errors.push('Nom')
            if (!form.email.trim()) errors.push('Email')
            if (!form.telephone.trim()) errors.push('Numéro de téléphone')
        }

        if (step === 2) {
            form.participants.forEach((p, i) => {
                if (!p.prenom.trim()) errors.push(`Prénom du participant ${i + 1}`)
                if (!p.age.trim()) errors.push(`Âge du participant ${i + 1}`)
            })
            if (!form.date_arrivee) errors.push("Date d'arrivée")
            if (!form.date_depart) errors.push('Date de départ')
        }

        if (step === 3) {
            if (!form.restrictions.trim())
                errors.push('Restriction alimentaire (indiquez « aucune » si besoin)')
            if (!form.mobilite.trim()) errors.push('Niveau de mobilité')
            if (form.langues.length === 0) errors.push('Au moins une langue parlée')
        }

        return errors
    }

    const next = () => {
        const errors = getStepErrors()
        if (errors.length > 0) {
            setErrorModal(errors)
            return
        }
        setStep((s) => Math.min(s + 1, TOTAL_STEPS))
    }

    const prev = () => setStep((s) => Math.max(s - 1, 1))

    const handleSubmit = async () => {
        const errors = getStepErrors()
        if (errors.length > 0) {
            setErrorModal(errors)
            return
        }

        setLoading(true)
        const { error } = await supabase.from('tour_requests').insert([
            {
                prenom: form.prenom,
                nom: form.nom,
                email: form.email,
                telephone: form.telephone,
                participants: form.participants,
                date_arrivee: form.date_arrivee,
                date_depart: form.date_depart,
                hebergement: '',
                restrictions: form.restrictions,
                mobilite: form.mobilite,
                langues: form.langues,
                pref_nature: form.pref_nature,
                pref_ville: form.pref_ville,
                pref_histoire: form.pref_histoire,
                pref_gastronomie: form.pref_gastronomie,
                pref_insolite: form.pref_insolite,
                pref_photo: form.pref_photo,
                deja_visite_chine: form.deja_visite_chine,
                excursions_interet: form.excursions_interet,
                transport_prefere: form.transport_prefere,
                rythme: form.rythme,
                commentaires: form.commentaires,
                option_voiture_privee: form.option_voiture_privee,
            },
        ])

        setLoading(false)

        if (error) {
            setErrorModal(['Une erreur est survenue, merci de réessayer.'])
            console.error(error)
            return
        }

        router.push('/merci')
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-ink/10 p-5 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wide text-apricot mb-2">
                Étape {step} / {TOTAL_STEPS}
            </p>
            <ProgressBar step={step} total={TOTAL_STEPS} />

            {step === 1 && (
                <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-ink mb-2">
                        Tes informations
                    </h2>
                    <p className="text-sm text-ink/60 mb-5">
                        Pour que je puisse te recontacter avec une proposition.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Prénom *"
                            value={form.prenom}
                            onChange={(e) => update('prenom', e.target.value)}
                            className={inputClass}
                        />
                        <input
                            type="text"
                            placeholder="Nom *"
                            value={form.nom}
                            onChange={(e) => update('nom', e.target.value)}
                            className={inputClass}
                        />
                        <input
                            type="email"
                            placeholder="Email *"
                            value={form.email}
                            onChange={(e) => update('email', e.target.value)}
                            className={`${inputClass} sm:col-span-2`}
                        />
                        <input
                            type="tel"
                            placeholder="Numéro de téléphone *"
                            value={form.telephone}
                            onChange={(e) => update('telephone', e.target.value)}
                            className={`${inputClass} sm:col-span-2`}
                        />
                    </div>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-ink mb-2">
                        Voyageurs & dates
                    </h2>
                    <p className="text-sm text-ink/60 mb-5">
                        Inclus-toi dans la liste si tu participes aussi à la visite.
                    </p>

                    <div className="space-y-3 mb-5">
                        {form.participants.map((p, i) => (
                            <div
                                key={p.id}
                                className="flex flex-col sm:flex-row gap-2 sm:items-center"
                            >
                                <input
                                    type="text"
                                    placeholder={`Prénom participant ${i + 1} *`}
                                    value={p.prenom}
                                    onChange={(e) =>
                                        updateParticipant(p.id, 'prenom', e.target.value)
                                    }
                                    className={`${inputClass} flex-1`}
                                />
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="number"
                                        placeholder="Âge *"
                                        value={p.age}
                                        onChange={(e) =>
                                            updateParticipant(p.id, 'age', e.target.value)
                                        }
                                        className={`${inputClass} w-24`}
                                    />
                                    {form.participants.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeParticipant(p.id)}
                                            className="text-ink/40 hover:text-apricot p-2 shrink-0"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addParticipant}
                            className="flex items-center gap-1 text-apricot font-semibold text-sm"
                        >
                            <Plus size={16} /> Ajouter un participant
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-ink/50 mb-1 block">
                                Date d&apos;arrivée *
                            </label>
                            <input
                                type="date"
                                value={form.date_arrivee}
                                onChange={(e) => update('date_arrivee', e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-ink/50 mb-1 block">
                                Date de départ *
                            </label>
                            <input
                                type="date"
                                value={form.date_depart}
                                onChange={(e) => update('date_depart', e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-ink mb-5">
                        Besoins spécifiques
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-ink/50 mb-1 block">
                                Restriction alimentaire *
                            </label>
                            <input
                                type="text"
                                placeholder="Ex : végétarien, allergies, aucune..."
                                value={form.restrictions}
                                onChange={(e) => update('restrictions', e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-ink/50 mb-1 block">
                                Niveau de mobilité *
                            </label>
                            <select
                                value={form.mobilite}
                                onChange={(e) => update('mobilite', e.target.value)}
                                className={inputClass}
                            >
                                <option value="">Sélectionner...</option>
                                <option value="aucune_limite">
                                    Aucune limite (marche facilement)
                                </option>
                                <option value="limite_moderee">
                                    Limite modérée (fatigue rapide, escaliers difficiles)
                                </option>
                                <option value="limite_forte">
                                    Mobilité réduite (besoin d&apos;assistance / peu de marche)
                                </option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-ink/50 mb-2 block">
                                Langues parlées *
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {['Français', 'Anglais', 'Chinois'].map((langue) => (
                                    <label
                                        key={langue}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={form.langues.includes(langue)}
                                            onChange={() => toggleLangue(langue)}
                                            className="w-4 h-4 accent-apricot"
                                        />
                                        <span className="text-sm font-medium text-ink">
                                            {langue}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-ink mb-2">
                        Tes envies
                    </h2>
                    <p className="text-ink/60 mb-6 text-sm">
                        Pour chaque thème, dis-moi à quel point ça t&apos;intéresse (1 = pas du
                        tout, 5 = j&apos;adore).
                    </p>
                    <SliderPreference
                        label="Nature & paysages"
                        emoji="🏞️"
                        description="Montagnes, rivières, randonnées"
                        value={form.pref_nature}
                        onChange={(v) => update('pref_nature', v)}
                    />
                    <SliderPreference
                        label="Ville & architecture"
                        emoji="🏙️"
                        description="Buildings, skyline, quartiers modernes"
                        value={form.pref_ville}
                        onChange={(v) => update('pref_ville', v)}
                    />
                    <SliderPreference
                        label="Temples & histoire"
                        emoji="🏯"
                        description="Temples, sites historiques, culture locale"
                        value={form.pref_histoire}
                        onChange={(v) => update('pref_histoire', v)}
                    />
                    <SliderPreference
                        label="Gastronomie"
                        emoji="🍜"
                        description="Street food, spécialités locales, hot pot"
                        value={form.pref_gastronomie}
                        onChange={(v) => update('pref_gastronomie', v)}
                    />
                    <SliderPreference
                        label="Expériences insolites"
                        emoji="🎡"
                        description="Téléphérique, expériences uniques et surprenantes"
                        value={form.pref_insolite}
                        onChange={(v) => update('pref_insolite', v)}
                    />
                    <SliderPreference
                        label="Spots photo"
                        emoji="📸"
                        description="Lieux instagrammables, points de vue"
                        value={form.pref_photo}
                        onChange={(v) => update('pref_photo', v)}
                    />
                </div>
            )}

            {step === 5 && (
                <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-ink mb-5">
                        Derniers détails
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-ink/50 mb-1 block">
                                Rythme de voyage souhaité
                            </label>
                            <select
                                value={form.rythme}
                                onChange={(e) => update('rythme', e.target.value)}
                                className={inputClass}
                            >
                                <option value="">Sélectionner...</option>
                                <option value="tranquille">Tranquille</option>
                                <option value="modere">Modéré</option>
                                <option value="intense">Intense</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-ink/50 mb-1 block">
                                Transport préféré
                            </label>
                            <input
                                type="text"
                                placeholder="Ex : métro, taxi, marche..."
                                value={form.transport_prefere}
                                onChange={(e) => update('transport_prefere', e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div className="border-2 border-ink/10 rounded-2xl p-4 bg-cream">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.option_voiture_privee}
                                    onChange={(e) =>
                                        update('option_voiture_privee', e.target.checked)
                                    }
                                    className="mt-1 w-5 h-5 accent-apricot rounded shrink-0"
                                />
                                <span className="flex-1">
                                    <span className="font-semibold text-ink">
                                        Option voiture privée
                                    </span>
                                    <br />
                                    <span className="text-sm text-ink/60">+ 25 € par personne</span>
                                </span>
                            </label>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.deja_visite_chine}
                                onChange={(e) =>
                                    update('deja_visite_chine', e.target.checked)
                                }
                                className="w-4 h-4 accent-apricot shrink-0"
                            />
                            <span className="text-sm text-ink">J&apos;ai déjà visité la Chine</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.excursions_interet}
                                onChange={(e) =>
                                    update('excursions_interet', e.target.checked)
                                }
                                className="w-4 h-4 accent-apricot shrink-0"
                            />
                            <span className="text-sm text-ink">
                                Intéressé par des excursions en dehors de la ville
                            </span>
                        </label>
                        <div>
                            <label className="text-xs font-semibold text-ink/50 mb-1 block">
                                Commentaires
                            </label>
                            <textarea
                                value={form.commentaires}
                                onChange={(e) => update('commentaires', e.target.value)}
                                rows={4}
                                className={inputClass}
                                placeholder="Tout ce que tu veux ajouter..."
                            />
                        </div>
                    </div>

                    <div className="bg-cream rounded-2xl p-4 text-sm text-ink/80 leading-relaxed mt-5 space-y-3">
                        <p>
                            <span className="font-bold text-ink">Horaires. </span>
                            Les journées se déroulent en général de{' '}
                            <strong>9h à 16h</strong>.
                        </p>
                        <p>
                            <span className="font-bold text-ink">Tarif. </span>
                            85 € par personne pour une journée complète (hors transport,
                            restauration et billets d&apos;entrée). Acompte de 25 % pour
                            confirmer, solde au début de la visite.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex justify-between mt-8 gap-2">
                {step > 1 ? (
                    <button
                        type="button"
                        onClick={prev}
                        className="flex items-center gap-1 text-ink/60 font-semibold px-4 sm:px-6 py-3 rounded-xl hover:bg-ink/5 transition text-sm sm:text-base shrink-0"
                    >
                        <ChevronLeft size={18} /> Précédent
                    </button>
                ) : (
                    <div />
                )}

                {step < TOTAL_STEPS ? (
                    <button
                        type="button"
                        onClick={next}
                        className="flex items-center gap-1 bg-ink hover:bg-ink/90 text-white font-semibold px-4 sm:px-6 py-3 rounded-xl transition text-sm sm:text-base"
                    >
                        Suivant <ChevronRight size={18} />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 bg-apricot hover:bg-apricot/90 text-white font-semibold px-4 sm:px-6 py-3 rounded-xl transition text-sm sm:text-base"
                    >
                        {loading && <Loader2 className="animate-spin" size={18} />}
                        Envoyer ma demande
                    </button>
                )}
            </div>

            {errorModal && (
                <div
                    className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
                    onClick={() => setErrorModal(null)}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-ink/10 max-h-[85vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4 text-apricot">
                            <AlertCircle size={28} />
                            <h3 className="text-lg sm:text-xl font-bold">Champs manquants</h3>
                        </div>
                        <p className="text-ink/70 mb-4 text-sm sm:text-base">
                            Merci de compléter les éléments suivants avant de continuer :
                        </p>
                        <ul className="space-y-2 mb-6">
                            {errorModal.map((err) => (
                                <li
                                    key={err}
                                    className="flex items-center gap-2 text-ink bg-apricot/10 rounded-xl px-4 py-2 text-sm font-medium"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-apricot shrink-0" />
                                    {err}
                                </li>
                            ))}
                        </ul>
                        <button
                            type="button"
                            onClick={() => setErrorModal(null)}
                            className="w-full bg-ink hover:bg-ink/90 text-white font-semibold px-6 py-3 rounded-xl transition"
                        >
                            J&apos;ai compris
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
