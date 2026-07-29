import { authMiddleware } from "@clerk/nextjs";

// Next 16 renamed the `middleware` file convention to `proxy`. The handler is
// still the default export, so Clerk's helper is used exactly as before.
export default authMiddleware({
    publicRoutes:['/']
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)","/","/(api|trpc)(.*)"],
};