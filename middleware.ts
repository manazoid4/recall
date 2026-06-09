import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/library(.*)',
  '/boards(.*)',
  '/graph(.*)',
  '/upload(.*)',
  '/settings(.*)',
  '/api/items(.*)',
  '/api/boards(.*)',
  '/api/enrich(.*)',
  '/api/search(.*)',
  '/api/export(.*)',
  '/api/digest(.*)',
  '/api/graph(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const session = await auth();
    if (!session.userId) {
      return new Response('Unauthorized', { status: 401 });
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|gif|png|webp|svg|ico|mp4|woff2?|ttf|txt)).*)',
    '/(api|trpc)(.*)',
  ],
};
