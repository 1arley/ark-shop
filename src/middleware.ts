import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware for security headers.
 *
 * Note: Full httpOnly cookie auth requires same-domain setup (frontend + backend).
 * Currently frontend (Vercel) and backend (Railway) are on different domains,
 * so the backend's httpOnly cookie is not visible here.
 *
 * Admin route protection is handled client-side via useAuth() in admin layout
 * and server-side via backend JwtAuthGuard.
 *
 * When migrating to same-domain, uncomment the cookie validation in middleware().
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(request: NextRequest) {
  // --- Admin route protection (defense-in-depth) ---
  // NOTE: Currently a no-op because frontend (Vercel) and backend (Railway)
  // are on different domains, so httpOnly cookies are not visible here.
  // The primary guard is client-side useAuth() in the admin layout.
  // When migrating to same-domain, enable full cookie validation:
  //
  //   const { pathname } = _request.nextUrl
  //   const hasAuthCookie = _request.cookies.has('access_token')
  //   if (!hasAuthCookie) {
  //     const loginUrl = new URL('/login', _request.url)
  //     loginUrl.searchParams.set('redirect', pathname)
  //     return NextResponse.redirect(loginUrl)
  //   }

  const response = NextResponse.next()

  // --- Security headers on every response ---
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|.*\\..*$).*)'],
}
