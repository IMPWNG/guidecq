'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { shutDoor } from '@/lib/door'
import type { Dictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/i18n'

type Props = {
    locale: Locale
    dict: Dictionary
}

export default function StreetHome({ locale, dict }: Props) {
    const router = useRouter()
    const street = dict.street
    const home = `/${locale}`

    useEffect(() => {
        document.body.classList.add('home')
        return () => {
            document.body.classList.remove('home')
        }
    }, [])

    return (
        <>
            <header className="bar">
                <a className="wordmark" href={home}>
                    {street.wordmark}
                </a>
                <LanguageSwitcher locale={locale} dict={dict.header} />
            </header>
            <main>
                <section className="stage">
                    <p className="kicker">{street.kicker}</p>
                    <h1>{street.title}</h1>
                    <p className="line">{street.line}</p>
                </section>
                <div className="actions">
                    <a
                        className="lock"
                        href={`${home}/select`}
                        onClick={(event) => {
                            event.preventDefault()
                            shutDoor('#e23b22', () => {
                                router.push(`${home}/select`)
                            })
                        }}
                    >
                        {street.cta}
                    </a>
                    <a className="back" href={`${home}/avis`}>
                        {dict.header.reviews}
                    </a>
                </div>
            </main>
        </>
    )
}
