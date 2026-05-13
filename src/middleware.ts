import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/', '/about']
const ADMIN_ROUTES_REGEX = /^\/admin/

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas — sempre permitir
  if (PUBLIC_ROUTES.includes(pathname) || pathname === '') {
    return NextResponse.next()
  }

  // Rotas admin exigem cookie de acesso
  if (ADMIN_ROUTES_REGEX.test(pathname)) {
    const accessToken = request.cookies.get('access_token')?.value

    if (!accessToken) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons|.*\\..*$).*)',
  ],
}
