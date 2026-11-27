'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import type { Dictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/i18n'

type Props = {
    locale: Locale
    dict: Dictionary['header']
}

export default function MobileMenu({ locale, dict }: Props) {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()
    const buttonRef = useRef<HTMLButtonElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)
    const menuId = useId()
    const home = `/${locale}`

    useEffect(() => {
        setOpen(false)
    }, [pathname])

    useEffect(() => {
        if (!open) return

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false)
                buttonRef.current?.focus()
            }
        }

        document.addEventListener('keydown', onKey)
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        const firstLink = panelRef.current?.querySelector<HTMLElement>('a, button')
        firstLink?.focus()

        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = previousOverflow
        }
    }, [open])

    const close = () => {
        setOpen(false)
        buttonRef.current?.focus()
    }

    const links = [
        { href: `${home}/select`, label: dict.request },
        { href: `${home}/avis`, label: dict.reviews },
        { href: `${home}/guides`, label: dict.guides },
    ]

    return (
        <div className="md:hidden">
            <button
                ref={buttonRef}
                type="button"
                className="inline-flex items-center justify-center w-11 h-11 text-foam hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lantern"
                aria-expanded={open}
                aria-controls={menuId}
                aria-label={open ? dict.close : dict.menu}
                onClick={() => setOpen((value) => !value)}
            >
                {open ? <X size={22} strokeWidth={2.4} /> : <Menu size={22} strokeWidth={2.4} />}
            </button>

            {open ? (
                <div className="fixed inset-0 top-[57px] z-50">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/50"
                        aria-label={dict.close}
                        onClick={close}
                    />
                    <div
                        ref={panelRef}
                        id={menuId}
                        role="dialog"
                        aria-modal="true"
                        aria-label={dict.navLabel}
                        className="relative bg-[#1a2430] border-b border-[#31404e] px-4 py-5 flex flex-col gap-1"
                    >
                        <nav aria-label={dict.navLabel} className="flex flex-col">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={close}
                                    className="flex items-center min-h-12 px-3 text-base font-semibold text-foam hover:bg-white/5"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                        <Link
                            href={`${home}/formulaire`}
                            onClick={close}
                            className="lock mt-2"
                        >
                            {dict.request}
                        </Link>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
