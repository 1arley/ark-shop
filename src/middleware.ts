import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Nota: Middleware de autenticação via cookie só funciona quando frontend e backend
// estão no MESMO domínio (ex: ark-shop.com + api.ark-shop.com).
// Atualmente frontend (Vercel) e backend (Railway) estão em domínios diferentes,
// então o cookie httpOnly do backend não é visível aqui.
//
// A proteção de rotas admin é feita via:
//   1. API Client: envia Authorization: Bearer de localStorage
//   2. Backend: JwtAuthGuard valida em toda requisição
//   3. Admin Layout: useAuth() verifica autenticação antes de renderizar
//
// Quando migrar para mesmo domínio, reativar:
//   const accessToken = request.cookies.get('access_token')?.value
//   if (!accessToken) return NextResponse.redirect(new URL('/login', request.url))

export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons|.*\\..*$).*)',
  ],
}
