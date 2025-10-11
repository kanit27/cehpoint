// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the JWT token from the user's cookies
  const token = request.cookies.get('jwt');
  const { pathname } = request.nextUrl;

  // Define which paths are protected
  const protectedPaths = ['/home', '/profile', '/create', '/my-projects', '/course', '/admin'];

  // Redirect to sign-in if trying to access a protected path without a token
  if (protectedPaths.some(path => pathname.startsWith(path)) && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/signin';
    return NextResponse.redirect(url);
  }

  // If the user is logged in (has a token) and tries to access signin/signup, redirect them to home
  if (['/signin', '/signup'].includes(pathname) && token) {
    const url = request.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Configuration to specify which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};