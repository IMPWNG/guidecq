import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { defaultLocale, isLocale, localeCookie, locales } from '@/lib/i18n'
import { negotiateLocale } from '@/lib/negotiate-locale'

function preferredLocale(request: NextRequest) {
    const cookieLocale = request.cookies.get(localeCookie)?.value
    if (isLocale(cookieLocale)) return cookieLocale
    return negotiateLocale(request.headers.get('accept-language'))
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (pathname.startsWith('/adminchongqing') || pathname.startsWith('/api')) {
        return NextResponse.next()
    }

    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (pathnameHasLocale) {
        const current = pathname.split('/')[1]
        const response = NextResponse.next()
        if (isLocale(current)) {
            response.cookies.set(localeCookie, current, { path: '/', maxAge: 60 * 60 * 24 * 365 })
        }
        return response
    }

    const locale = preferredLocale(request) ?? defaultLocale
    request.nextUrl.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
    const response = NextResponse.redirect(request.nextUrl)
    response.cookies.set(localeCookie, locale, { path: '/', maxAge: 60 * 60 * 24 * 365 })
    return response
}

export const config = {
    matcher: ['/((?!_next|favicon.ico|.*\\..*).*)'],
}
