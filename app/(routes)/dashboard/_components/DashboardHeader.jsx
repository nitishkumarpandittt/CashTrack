"use client";

import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

const pageTitles = {
  "/dashboard": "Overview",
  "/dashboard/incomes": "Income streams",
  "/dashboard/budgets": "Budgets",
  "/dashboard/expenses": "Expenses",
  "/dashboard/upgrade": "Upgrade your plan",
};

function DashboardHeader({ onMenuToggle, isMobileNavOpen }) {
  const pathname = usePathname();
  const pageTitle =
    pageTitles[pathname] ||
    (pathname.startsWith("/dashboard/expenses/") ? "Budget details" : "Workspace");

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--cash-line)] bg-white/80 px-4 py-3 backdrop-blur md:px-8 md:py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label={isMobileNavOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isMobileNavOpen}
            className="rounded-full p-2 text-[var(--cash-muted)] transition-colors hover:bg-[var(--cash-mist)] hover:text-[var(--cash-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)] md:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <Image
            src="/cashtrack-icon-theme.svg"
            alt=""
            width={32}
            height={32}
            priority
            className="md:hidden"
          />

          <div className="min-w-0">
            <p className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cash-teal)] md:block">
              CashTrack workspace
            </p>
            <h1 className="truncate font-display text-lg font-extrabold tracking-[-0.05em] text-[var(--cash-ink)] md:text-2xl">
              {pageTitle}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-[var(--cash-line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--cash-muted)] sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--cash-emerald)]" aria-hidden="true" />
            Synced just now
          </div>
          <UserButton
            afterSignOutUrl="/"
            appearance={{ elements: { avatarBox: "h-9 w-9" } }}
          />
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
