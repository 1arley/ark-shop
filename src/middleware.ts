import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(_request: NextRequest) { // eslint-disable-line @typescript-eslint/no-unused-vars
  // Auth guards are handled client-side in page components.
  // This middleware is a placeholder for future server-side auth checks
  // (e.g., when using HTTP-only cookies for JWT tokens).
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons|.*\\..*$).*)',
  ],
}
