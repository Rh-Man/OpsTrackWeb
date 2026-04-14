import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/login', '/register']
const protectedPaths = ['/dashboard', '/tickets', '/profile']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // For now, we'll rely on client-side auth checks
  // In production, you'd verify the Cognito token here
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
