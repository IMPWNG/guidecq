'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Dictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/i18n'
import {
    getMemberGuide,
    MEMBER_GUIDE_IDS,
    type MemberGuideId,
} from '@/lib/member-guides'
import AddToHomeScreen from '@/components/AddToHomeScreen'

const STORAGE_KEY = 'chongqing-membre'

type StoredAccess = {
    token: string
    prenom: string
    nom: string
    guides: MemberGuideId[]
}

type Props = {
    locale: Locale
    dict: Dictionary['membre']
    initialPrenom: string
    initialNom: string
    initialGuides: MemberGuideId[]
    accessToken: string
}

export default function MemberSpace({
    locale,
    dict,
    initialPrenom,
    initialNom,
    initialGuides,
    accessToken,
}: Props) {
    const guides = useMemo(
        () => initialGuides.filter((id): id is MemberGuideId => MEMBER_GUIDE_IDS.includes(id)),
        [initialGuides]
    )
    const [active, setActive] = useState<MemberGuideId>(guides[0] || 'classic')

    useEffect(() => {
        if (guides.length > 0 && !guides.includes(active)) {
            setActive(guides[0])
        }
    }, [guides, active])

    useEffect(() => {
        if (!accessToken || guides.length === 0) return
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                token: accessToken,
                prenom: initialPrenom,
                nom: initialNom,
                guides,
            } satisfies StoredAccess)
        )
    }, [accessToken, initialPrenom, initialNom, guides])

    const fullName = [initialPrenom, initialNom].filter(Boolean).join(' ')
    const hello = fullName ? dict.helloNamed.replace('{name}', fullName) : dict.hello
    const visibleGuides = guides.length > 0 ? guides : []
    const guide = useMemo(
        () => (visibleGuides[0] ? getMemberGuide(locale, active) : null),
        [locale, active, visibleGuides]
    )

    if (!guide) return null

    return (
        <div className="space-y-8">
            <section>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-apricot mb-3">
                    {dict.eyebrow}
                </p>
                {fullName ? (
                    <p className="text-sm font-semibold text-ink/50 mb-1">{fullName}</p>
                ) : null}
                <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">
                    {hello}
                </h1>
            </section>

            <AddToHomeScreen dict={dict} />

            <section>
                {visibleGuides.length > 1 ? (
                    <div className="mb-5">
                        <p className="text-xs font-bold uppercase tracking-wide text-ink/45 mb-2">
                            {dict.yourGuides}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {visibleGuides.map((id) => {
                                const item = getMemberGuide(locale, id)
                                const selected = id === active
                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => setActive(id)}
                                        className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                                            selected
                                                ? 'bg-ink text-white'
                                                : 'bg-white border border-ink/10 text-ink/70 hover:border-ink/30'
                                        }`}
                                    >
                                        {item.title}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ) : null}

                <article className="bg-white rounded-[2rem] border border-ink/10 px-5 py-7 sm:px-8 sm:py-9">
                    <p className="text-sm font-medium text-ink/50 mb-1">{guide.subtitle}</p>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-ink mb-6">
                        {guide.title}
                    </h2>
                    <div className="space-y-8">
                        {guide.sections.map((section) => (
                            <section key={section.heading}>
                                <h3 className="text-lg font-extrabold text-ink mb-3">
                                    {section.heading}
                                </h3>
                                <div className="space-y-3">
                                    {section.paragraphs.map((paragraph) => (
                                        <p key={paragraph} className="text-ink/75 leading-relaxed">
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                    <p className="mt-8 text-sm text-ink/50 leading-relaxed border-t border-ink/10 pt-5">
                        {guide.moreComing}
                    </p>
                </article>
            </section>
        </div>
    )
}
