import { clerkMiddleware } from "@clerk/nextjs/server";

// Next 16 renamed the `middleware` file convention to `proxy`, and Clerk v7
// looks for it under that name.
//
// This only attaches Clerk's request context (so `auth()` works downstream);
// it deliberately makes no access decisions. Clerk deprecated route matching
// here because middleware path matching can diverge from how Next routes a
// request, which can leave a protected page reachable. Each protected
// resource checks for itself instead:
//
//   - app/(routes)/dashboard/layout.jsx  redirects a signed-out visitor
//   - app/actions/_shared.js             every server action calls auth()
//   - app/api/insights/route.js          returns 401 without a session
export default clerkMiddleware();

export const config = {
  matcher: [
    // Everything except Next internals and static assets.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
