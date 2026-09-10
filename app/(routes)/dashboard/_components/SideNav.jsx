"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  CircleDollarSign,
  Home,
  LayoutGrid,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { userButtonElements } from "@/app/_components/theme/clerkAppearance";

function SideNav() {
  const path = usePathname();
  const { user } = useUser();
  const menuList = useMemo(
    () => [
      { id: 1, name: "Home", icon: Home, path: "/" },
      { id: 2, name: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
      { id: 3, name: "Incomes", icon: CircleDollarSign, path: "/dashboard/incomes" },
      { id: 4, name: "Budgets", icon: PiggyBank, path: "/dashboard/budgets" },
      { id: 5, name: "Expenses", icon: ReceiptText, path: "/dashboard/expenses" },
      { id: 6, name: "Assistant", icon: Sparkles, path: "/dashboard/assistant" },
      { id: 7, name: "Upgrade", icon: ShieldCheck, path: "/dashboard/upgrade" },
    ],
    []
  );

  // "/" and "/dashboard" are prefixes of every other route, so they only count
  // as active on an exact match.
  const isActivePath = (menuPath) =>
    menuPath === "/dashboard" || menuPath === "/"
      ? path === menuPath
      : path.startsWith(menuPath);

  return (
    <div className="flex min-h-screen flex-col border-r border-[var(--cash-line)] bg-[rgb(var(--cash-paper-rgb)/0.9)] px-5 py-6 shadow-[var(--cash-shadow-nav)] backdrop-blur">
      <Link
        href="/"
        className="flex items-center gap-3 border-b border-[var(--cash-line)] pb-6"
        aria-label="CashTrack home"
      >
        <Image
          src="/cashtrack-icon-theme.svg"
          alt=""
          width={40}
          height={40}
          priority
          className="h-10 w-10 shrink-0"
        />
        <span>
          <span className="block font-display text-lg font-extrabold tracking-[-0.06em] text-[var(--cash-ink)]">
            CashTrack
          </span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--cash-muted)]">
            Personal finance
          </span>
        </span>
      </Link>

      <div className="flex min-h-0 flex-1 flex-col">
        <nav className="mt-8 flex-1 space-y-1.5" aria-label="Dashboard navigation">
          {menuList.map((menu) => {
            const isActive = isActivePath(menu.path);
            const Icon = menu.icon;

            return (
              <Link
                href={menu.path}
                key={menu.id}
                aria-current={isActive ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)] focus-visible:ring-offset-2 ${
                  isActive
                    ? "bg-[var(--cash-wash)] text-[var(--cash-teal)] shadow-sm"
                    : "text-[var(--cash-muted)] hover:bg-[var(--cash-mist)] hover:text-[var(--cash-ink)]"
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                    isActive ? "text-[var(--cash-teal)]" : "text-[var(--cash-glaucous)]"
                  }`}
                  aria-hidden="true"
                />
                <span>{menu.name}</span>
                {isActive && (
                  <span
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--cash-emerald)]"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-5 flex items-center gap-3 border-t border-[var(--cash-line)] pt-5">
        {/* The Clerk button must keep its natural width so the text beside it
            gets the rest of the row; the name truncates only as a last resort. */}
        <div className="shrink-0">
          <UserButton
            afterSignOutUrl="/"
            appearance={{ elements: { ...userButtonElements, avatarBox: "h-9 w-9" } }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--cash-muted)]">
            Account
          </p>
          <p
            className="truncate text-sm font-semibold text-[var(--cash-ink)]"
            title={user?.fullName || user?.primaryEmailAddress?.emailAddress || undefined}
          >
            {user?.fullName || user?.primaryEmailAddress?.emailAddress || "Your profile"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SideNav;
