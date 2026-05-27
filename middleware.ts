import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware runs on the edge — Firebase SDK can't run here.
// We protect routes using a session cookie set after login.
// The AuthContext handles the actual role-gating client-side.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('cargo-session');

  const isAuthPage = pathname.startsWith('/login');
  const isProtected = pathname.startsWith('/admin') || pathname.startsWith('/employee');

  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/employee/:path*', '/login'],
};
