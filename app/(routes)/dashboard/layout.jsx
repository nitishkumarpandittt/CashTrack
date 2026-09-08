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
    if (!isLoaded || pathname === BUDGETS_ROUTE) return undefined;

    let cancelled = false;
    callAction(hasBudgets())
      .then((exists) => {
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

  return (
    <div className="min-h-screen bg-[var(--cash-mist)] text-[var(--cash-ink)]">
      <Suspense fallback={<SideNavSkeleton />}>
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 md:block">
          <SideNav />
        </aside>
      </Suspense>

      <Suspense fallback={null}>
        <MobileNav isOpen={isMobileNavOpen} onClose={handleMobileNavClose} />
      </Suspense>

      <div className="min-h-screen md:pl-72">
        <Suspense fallback={<HeaderSkeleton />}>
          <DashboardHeader
            onMenuToggle={handleMenuToggle}
            isMobileNavOpen={isMobileNavOpen}
          />
        </Suspense>
        <main className="min-h-[calc(100vh-76px)]">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
