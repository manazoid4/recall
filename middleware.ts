import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/library(.*)',
  '/boards(.*)',
  '/capture(.*)',
  '/graph(.*)',
  '/upload(.*)',
  '/settings(.*)',
  '/connect-extension(.*)',
  '/onboarding(.*)',
  '/api/extension(.*)',
  '/api/items(.*)',
  '/api/boards(.*)',
  '/api/enrich(.*)',
  '/api/refine(.*)',
  '/api/search(.*)',
  '/api/export(.*)',
  '/api/digest(.*)',
  '/api/graph(.*)',
  '/api/settings(.*)',
  '/api/stats(.*)',
  '/api/github/stars(.*)',
  '/api/license/verify(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|gif|png|webp|svg|ico|mp4|woff2?|ttf|txt)).*)',
    '/(api|trpc)(.*)',
  ],
};
