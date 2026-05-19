import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware for route protection and security headers.
 *
 * Note: Full httpOnly cookie auth requires same-domain setup (frontend + backend).
 * Currently frontend (Vercel) and backend (Railway) are on different domains,
 * so the backend's httpOnly cookie is not visible here.
 *
 * Current protection: client-side useAuth() in admin layout + backend JwtAuthGuard.
 * This middleware adds a basic cookie check as a defense-in-depth layer.
 *
 * When migrating to same-domain, uncomment the full token validation below.
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- Admin route protection (defense-in-depth) ---
  if (pathname.startsWith('/admin')) {
    // Check for any auth indicator (cookie or custom header from client)
    const hasAuthCookie =
      request.cookies.has('access_token') ||
      request.cookies.has('ark-shop-auth')

    if (!hasAuthCookie) {
      // No auth cookie present — redirect to login
      // Note: client-side useAuth() is the primary guard when using cross-domain Bearer tokens
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  const response = NextResponse.next()

  // --- Security headers on every response ---
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons|.*\\..*$).*)',
  ],
}
