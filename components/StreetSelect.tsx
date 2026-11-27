'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { openDoor, shutDoor } from '@/lib/door'
import type { Dictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/i18n'

const ACCENT = '#e23b22'

type Props = {
    locale: Locale
    dict: Dictionary
}

export default function StreetSelect({ locale, dict }: Props) {
    const router = useRouter()
    const street = dict.street
    const home = `/${locale}`
    const [hover, setHover] = useState(false)
    const [locked, setLocked] = useState(false)

    useEffect(() => {
        openDoor()
        return () => {
            delete document.body.dataset.guide
        }
    }, [])

    useEffect(() => {
        if (hover || locked) document.body.dataset.guide = 'mat'
        else delete document.body.dataset.guide
    }, [hover, locked])

    const confirm = () => {
        if (locked) return
        setLocked(true)
        shutDoor(ACCENT, () => {
            router.push(`${home}/formulaire`)
        })
    }

    return (
        <>
            <header className="bar">
                <a className="wordmark" href={home}>
                    {street.wordmark}
                </a>
                <div className="flex items-center gap-3">
                    <p>{street.pick}</p>
                    <LanguageSwitcher locale={locale} dict={dict.header} />
                </div>
            </header>
            <main>
                <section className="stage" aria-live="polite">
                    <div className="stage-top">
                        <p className="tours">{hover || locked ? street.tours : ''}</p>
                    </div>
                    <h1 className={hover || locked ? undefined : 'is-prompt'} style={{ color: locked ? ACCENT : undefined }}>
                        {hover || locked ? street.name : street.prompt}
                    </h1>
                    {locked ? <p className="stamp">{street.locked}</p> : null}
                    <img
                        className="stage-face"
                        src="/guides/mat.png"
                        alt=""
                        width="612"
                        height="720"
                        hidden={!hover && !locked}
                    />
                </section>
                <div className="pick">
                    <div className="roster is-solo" role="listbox" aria-label={street.name}>
                        <button
                            type="button"
                            className={`fighter${locked ? ' is-on' : ''}`}
                            data-id="mat"
                            role="option"
                            aria-selected={hover || locked}
                            style={{ ['--accent' as string]: ACCENT }}
                            disabled={locked}
                            onPointerEnter={() => {
                                if (!locked) setHover(true)
                            }}
                            onPointerLeave={() => {
                                if (!locked) setHover(false)
                            }}
                            onClick={confirm}
                        >
                            <span className="handle">@chongqingbarber.mat</span>
                            <strong>{street.name}</strong>
                            <em className="tours">{street.tours}</em>
                            <img
                                className="face"
                                alt=""
                                width="612"
                                height="720"
                                src="/guides/mat.png"
                            />
                        </button>
                    </div>
                </div>
                <div className="actions">
                    <button className="lock" type="button" disabled={!hover && !locked} onClick={confirm}>
                        {street.lock}
                    </button>
                    <a className="back" href={home}>
                        <span className="arrow" aria-hidden="true" />
                        {street.back}
                    </a>
                </div>
            </main>
        </>
    )
}
