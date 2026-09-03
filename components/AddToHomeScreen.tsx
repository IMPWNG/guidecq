'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Share, Smartphone } from 'lucide-react'
import type { Dictionary } from '@/lib/dictionaries'

type Platform = 'ios' | 'android' | 'other'

function detectPlatform(): Platform {
    if (typeof navigator === 'undefined') return 'other'
    const ua = navigator.userAgent
    if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
    if (/android/i.test(ua)) return 'android'
    return 'other'
}

function isStandalone() {
    if (typeof window === 'undefined') return false
    const media = window.matchMedia('(display-mode: standalone)').matches
    const iosStandalone = 'standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
    return media || iosStandalone
}

export default function AddToHomeScreen({ dict }: { dict: Dictionary['membre'] }) {
    const [platform, setPlatform] = useState<Platform>('other')
    const [installed, setInstalled] = useState(false)

    useEffect(() => {
        setPlatform(detectPlatform())
        setInstalled(isStandalone())
    }, [])

    if (installed) {
        return (
            <section className="rounded-[1.75rem] border border-bamboo/40 bg-bamboo/10 px-5 py-5 sm:px-6">
                <p className="font-extrabold text-ink mb-1">{dict.addHomeTitle}</p>
                <p className="text-ink/70 leading-relaxed">{dict.alreadyInstalled}</p>
            </section>
        )
    }

    const iosFirst = platform !== 'android'

    return (
        <section className="rounded-[1.75rem] border border-ink/10 bg-white px-5 py-6 sm:px-7 sm:py-7">
            <div className="flex items-start gap-3 mb-3">
                <span className="w-10 h-10 rounded-2xl bg-apricot/15 text-apricot flex items-center justify-center shrink-0">
                    <Smartphone size={20} />
                </span>
                <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-ink">{dict.addHomeTitle}</h2>
                    <p className="mt-1 text-ink/65 leading-relaxed">{dict.addHomeIntro}</p>
                </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <InstallCard
                    title={dict.iosTitle}
                    note={dict.iosNote}
                    steps={dict.iosSteps}
                    emphasized={iosFirst}
                    icon={<Share size={16} />}
                />
                <InstallCard
                    title={dict.androidTitle}
                    note={dict.androidNote}
                    steps={dict.androidSteps}
                    emphasized={!iosFirst}
                    icon={<span className="text-sm font-black leading-none">⋮</span>}
                />
            </div>
        </section>
    )
}

function InstallCard({
    title,
    note,
    steps,
    emphasized,
    icon,
}: {
    title: string
    note: string
    steps: readonly string[]
    emphasized: boolean
    icon: ReactNode
}) {
    return (
        <div
            className={`rounded-2xl px-4 py-4 ${
                emphasized ? 'bg-cream border-2 border-apricot/40' : 'bg-cream/60 border border-ink/10'
            }`}
        >
            <p className="font-extrabold text-ink flex items-center gap-2 mb-1">
                <span className="text-apricot">{icon}</span>
                {title}
            </p>
            <p className="text-xs font-medium text-ink/50 mb-3">{note}</p>
            <ol className="space-y-2">
                {steps.map((step, index) => (
                    <li key={step} className="flex gap-2.5 text-sm text-ink/80 leading-snug">
                        <span className="font-extrabold text-apricot shrink-0">{index + 1}.</span>
                        {step}
                    </li>
                ))}
            </ol>
        </div>
    )
}
