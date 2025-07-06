"use client";
import React, { useEffect, useCallback, Suspense, lazy, useState } from "react";
import { db } from "@/utils/dbConfig";
import { Budgets } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { useRouter } from "next/navigation";

// Lazy load components for faster initial render
const SideNav = lazy(() => import("./_components/SideNav"));
const DashboardHeader = lazy(() => import("./_components/DashboardHeader"));
const MobileNav = lazy(() => import("./_components/MobileNav"));

// Import loading components
import LoadingSpinner, { CardLoader } from "@/app/_components/LoadingSpinner";

// Lightweight loading components
const SideNavSkeleton = () => (
  <div className="fixed md:w-64 hidden md:block h-screen bg-white border-r z-40">
    <div className="p-5 space-y-4 animate-pulse">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 bg-gray-200 rounded-full" />
        <div className="h-6 w-24 bg-gray-200 rounded" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
            <div className="h-5 w-5 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const HeaderSkeleton = () => (
  <div className="h-16 bg-white border-b sticky top-0 z-30 animate-pulse">
    <div className="h-full flex items-center justify-between px-4 md:px-5">
      <div className="md:hidden flex items-center space-x-3">
        <div className="h-6 w-6 bg-gray-200 rounded" />
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
        <div className="h-5 w-20 bg-gray-200 rounded" />
      </div>
      <div className="h-8 w-8 bg-gray-200 rounded-full" />
    </div>
  </div>
);

function DashboardLayout({ children }) {
  const { user } = useUser();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const checkUserBudgets = useCallback(async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    try {
      const result = await db
        .select()
        .from(Budgets)
        .where(eq(Budgets.createdBy, user.primaryEmailAddress.emailAddress));

      if (result?.length === 0) {
        router.replace("/dashboard/budgets");
      }
    } catch (error) {
      console.error("Error checking budgets:", error);
    }
  }, [user?.primaryEmailAddress?.emailAddress, router]);

  useEffect(() => {
    if (user) {
      checkUserBudgets();
    }
  }, [user, checkUserBudgets]);

  const handleMenuToggle = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const handleMobileNavClose = () => {
    setIsMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Suspense fallback={<SideNavSkeleton />}>
        <div className="fixed md:w-64 hidden md:block z-40">
          <SideNav />
        </div>
      </Suspense>

      {/* Mobile Navigation */}
      <Suspense fallback={null}>
        <MobileNav
          isOpen={isMobileNavOpen}
          onClose={handleMobileNavClose}
        />
      </Suspense>

      {/* Main Content Area */}
      <div className="md:ml-64">
        <Suspense fallback={<HeaderSkeleton />}>
          <DashboardHeader onMenuToggle={handleMenuToggle} />
        </Suspense>
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
