import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('medcoor_auth');
  const isLoginPage = request.nextUrl.pathname === '/login';

  // Allow webhooks, static files, and images to bypass authentication
  if (
    request.nextUrl.pathname.startsWith('/api/') || 
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.includes('favicon.ico') ||
    request.nextUrl.pathname.includes('pfhw_logo.png')
  ) {
    return NextResponse.next();
  }

  // If there is no cookie and they aren't on the login page, boot them to login
  if (!authCookie && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If they are already logged in and try to hit the login page, send them to the dashboard
  if (authCookie && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // This ensures the middleware runs on all pages
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};