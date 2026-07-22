import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from './lib/rate-limit';
import createIntlMiddleware from 'next-intl/middleware';

const intlMiddleware = createIntlMiddleware({
  locales: ['de', 'en', 'ar', 'tr'],
  defaultLocale: 'de'
});

const limiter = rateLimit({
  uniqueTokenPerInterval: 500, // Max 500 users per interval
  interval: 60000, // 60 seconds
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Apply CSRF (Origin matching) and Rate Limiting to API routes
  if (pathname.startsWith('/api/')) {
    
    // CSRF Mitigation: Ensure Origin or Referer matches the host
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');
    
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const isAllowedOrigin = origin ? origin.includes(host || '') : false;
      const isAllowedReferer = referer ? referer.includes(host || '') : false;
      
      // In development, Next.js sets origin to http://localhost:3000 which is fine.
      // But in production, enforce strict origin checks.
      if (process.env.NODE_ENV === 'production' && !isAllowedOrigin && !isAllowedReferer) {
        return NextResponse.json({ error: 'CSRF token mismatch or invalid origin.' }, { status: 403 });
      }
    }

    // Rate Limiting (especially for /identify)
    try {
      const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
      // Allow 10 requests per minute per IP for API routes
      await limiter.check(10, ip);
    } catch {
      return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }
    // Return Next.js response to prevent intlMiddleware from running on API routes
    return NextResponse.next();
  }

  // Handle i18n routing for non-API requests
  return intlMiddleware(request);
}

export const config = {
  // Skip all paths that should not be internationalized.
  // This matches all paths EXCEPT:
  // 1. /api routes (handled in middleware directly)
  // 2. /_next (Next.js internals)
  // 3. /_vercel (Vercel internals)
  // 4. all root files inside /public (e.g. /favicon.ico)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/api/:path*']
};
