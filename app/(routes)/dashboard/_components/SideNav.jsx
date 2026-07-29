"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  CircleDollarSign,
  LayoutGrid,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import AiChat from "./AiChat";

function SideNav() {
  const path = usePathname();
  const { user } = useUser();
  const [chatOpen, setChatOpen] = useState(false);
  const menuList = useMemo(
    () => [
      { id: 1, name: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
      { id: 2, name: "Incomes", icon: CircleDollarSign, path: "/dashboard/incomes" },
      { id: 3, name: "Budgets", icon: PiggyBank, path: "/dashboard/budgets" },
      { id: 4, name: "Expenses", icon: ReceiptText, path: "/dashboard/expenses" },
      { id: 5, name: "Upgrade", icon: ShieldCheck, path: "/dashboard/upgrade" },
    ],
    []
  );

  const isActivePath = (menuPath) =>
    menuPath === "/dashboard" ? path === menuPath : path.startsWith(menuPath);

  return (
    <div className="flex min-h-screen flex-col border-r border-[var(--cash-line)] bg-white/90 px-5 py-6 shadow-[var(--cash-shadow-nav)] backdrop-blur">
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

      {/* The chat panel overlays exactly this region: below the logo header,
          above the account footer. */}
      <div className="relative flex min-h-0 flex-1 flex-col">
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

        {/* Was a static blurb; it now opens the assistant. */}
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          className="group w-full rounded-2xl border border-[var(--cash-line)] bg-[var(--cash-mist)] p-4 text-left transition-colors hover:border-[var(--cash-teal)]/40 hover:bg-[var(--cash-wash)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)]"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--cash-teal)]" aria-hidden="true" />
            <span className="font-display text-sm font-bold tracking-[-0.03em] text-[var(--cash-ink)]">
              CashTrack AI
            </span>
          </span>
          <span className="mt-1 block text-xs leading-5 text-[var(--cash-muted)]">
            Ask about your budgets, spending or savings.
          </span>
        </button>

        <AiChat open={chatOpen} onClose={() => setChatOpen(false)} />
      </div>

      <div className="mt-5 flex items-center gap-3 border-t border-[var(--cash-line)] pt-5">
        <UserButton
          afterSignOutUrl="/"
          appearance={{ elements: { avatarBox: "h-9 w-9" } }}
        />
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--cash-muted)]">
            Account
          </p>
          <p className="truncate text-sm font-semibold text-[var(--cash-ink)]">
            {user?.fullName || user?.primaryEmailAddress?.emailAddress || "Your profile"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SideNav;
