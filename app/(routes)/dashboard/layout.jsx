"use client";

import { useEffect, lazy, Suspense, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";

import { hasBudgets } from "@/app/actions/budgets";
import { callAction } from "@/utils/callAction";

const SideNav = lazy(() => import("./_components/SideNav"));
const DashboardHeader = lazy(() => import("./_components/DashboardHeader"));
const MobileNav = lazy(() => import("./_components/MobileNav"));

const BUDGETS_ROUTE = "/dashboard/budgets";

// Once an account is known to have budgets, the redirect can never apply
// again in this tab, so the check runs at most once per session instead of
// on every navigation.
let knownToHaveBudgets = false;

const SideNavSkeleton = () => (
  <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-[var(--cash-line)] bg-[rgb(var(--cash-paper-rgb)/0.9)] backdrop-blur md:block">
    <div className="flex h-full min-h-screen flex-col p-5">
      <div className="flex items-center gap-3 border-b border-[var(--cash-line)] pb-6">
        <div className="h-10 w-10 animate-pulse rounded-2xl bg-[var(--cash-wash)]" />
        <div className="space-y-2">
          <div className="h-4 w-24 animate-pulse rounded-full bg-[var(--cash-wash)]" />
          <div className="h-3 w-16 animate-pulse rounded-full bg-[var(--cash-wash)]" />
        </div>
      </div>
      <div className="mt-8 space-y-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-2xl px-4 py-3">
            <div className="h-5 w-5 animate-pulse rounded-lg bg-[var(--cash-wash)]" />
            <div className="h-3 w-24 animate-pulse rounded-full bg-[var(--cash-wash)]" />
          </div>
        ))}
      </div>
      <div className="mt-auto flex items-center gap-3 border-t border-[var(--cash-line)] pt-5">
        <div className="h-9 w-9 animate-pulse rounded-full bg-[var(--cash-wash)]" />
        <div className="h-3 w-28 animate-pulse rounded-full bg-[var(--cash-wash)]" />
      </div>
    </div>
  </aside>
);

const HeaderSkeleton = () => (
  <div className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[var(--cash-line)] bg-[rgb(var(--cash-paper-rgb)/0.8)] px-4 backdrop-blur md:px-8">
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 animate-pulse rounded-full bg-[var(--cash-wash)] md:hidden" />
      <div className="space-y-2">
        <div className="h-2.5 w-16 animate-pulse rounded-full bg-[var(--cash-wash)]" />
        <div className="h-4 w-32 animate-pulse rounded-full bg-[var(--cash-wash)]" />
      </div>
    </div>
    <div className="h-9 w-9 animate-pulse rounded-full bg-[var(--cash-wash)]" />
  </div>
);

function DashboardLayout({ children }) {
  const { isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // A brand-new account is steered to the budgets page first, because every
  // other screen is empty until at least one budget exists.
  useEffect(() => {
    if (!isLoaded || knownToHaveBudgets || pathname === BUDGETS_ROUTE) return undefined;
    // The assistant is useful before any budget exists; no need to bounce.
    if (pathname.startsWith("/dashboard/assistant")) return undefined;

    let cancelled = false;
    callAction(hasBudgets())
      .then((exists) => {
        if (exists) knownToHaveBudgets = true;
        if (!cancelled && !exists) router.replace(BUDGETS_ROUTE);
      })
      .catch((error) => {
        // The page itself reports load failures; the redirect is best-effort.
        console.error("Error checking budgets:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, pathname, router]);

  const handleMenuToggle = () => setIsMobileNavOpen((open) => !open);
  const handleMobileNavClose = () => setIsMobileNavOpen(false);

  // The assistant scrolls inside its own panes, so its route pins the frame
  // to the viewport and lets the header take whatever height it needs. Every
  // other page keeps the ordinary document scroll.
  const fillsViewport = pathname.startsWith("/dashboard/assistant");

  return (
    <div className="min-h-[100dvh] bg-[var(--cash-mist)] text-[var(--cash-ink)]">
      <Suspense fallback={<SideNavSkeleton />}>
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 md:block">
          <SideNav />
        </aside>
      </Suspense>

      <Suspense fallback={null}>
        <MobileNav isOpen={isMobileNavOpen} onClose={handleMobileNavClose} />
      </Suspense>

      {/* Header plus main always add up to exactly one viewport: the column
          is viewport-tall and main takes whatever the header leaves, with no
          hardcoded header height anywhere. Ordinary pages grow past that and
          scroll the document; the assistant is pinned and scrolls inside. */}
      <div
        className={`flex flex-col md:pl-72 ${
          fillsViewport ? "h-[100dvh] overflow-hidden" : "min-h-[100dvh]"
        }`}
      >
        <Suspense fallback={<HeaderSkeleton />}>
          <DashboardHeader
            onMenuToggle={handleMenuToggle}
            isMobileNavOpen={isMobileNavOpen}
          />
        </Suspense>
        <main className={`flex flex-1 flex-col ${fillsViewport ? "min-h-0" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
