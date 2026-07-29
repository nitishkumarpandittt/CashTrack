import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Next 16 renamed the `middleware` file convention to `proxy`, and Clerk v7
// looks for it under that name. The v4 `authMiddleware` helper this replaced
// read `headers()` synchronously, which Next 16 no longer allows — that was the
// "used `...headers()` or similar iteration" error on every render of `/`.

// The marketing page is open to everyone; so are the Clerk-hosted auth screens,
// which must stay reachable while signed out or sign-in would redirect to
// itself. Everything else — the dashboard and the AI routes that spend against
// the Gemini key — requires a session.
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return undefined;

  // auth.protect() answers with a 307 to the sign-in page, which is right for a
  // navigation but useless to fetch() — the caller gets an HTML body where it
  // expected JSON. API routes get a plain 401 instead so the assistant can show
  // a real message when a session has expired.
  if (isApiRoute(request)) {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Your session has expired. Sign in again." }, { status: 401 });
    }
    return undefined;
  }

  await auth.protect();
  return undefined;
});

export const config = {
  matcher: [
    // Everything except Next internals and static assets.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
