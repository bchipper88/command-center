import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === '/login'
  const authCookie = request.cookies.get('cc-auth')?.value

  if (isLoginPage) {
    if (authCookie === 'authenticated') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // API route for login
  if (request.nextUrl.pathname === '/api/login') {
    return NextResponse.next()
  }

  if (authCookie !== 'authenticated') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/login).*)'],
}
