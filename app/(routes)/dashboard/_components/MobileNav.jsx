"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleDollarSign,
  Home,
  LayoutGrid,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

function MobileNav({ isOpen, onClose }) {
  const path = usePathname();
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

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // "/" and "/dashboard" are prefixes of every other route, so they only count
  // as active on an exact match.
  const isActivePath = (menuPath) =>
    menuPath === "/dashboard" || menuPath === "/"
      ? path === menuPath
      : path.startsWith(menuPath);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Close navigation"
        className="fixed inset-0 z-40 cursor-default bg-[rgb(var(--cash-onyx-rgb)/0.35)] backdrop-blur-sm"
        onClick={onClose}
      />

      <aside
        className="fixed inset-y-0 left-0 z-50 flex w-[min(86vw,22rem)] flex-col border-r border-[var(--cash-line)] bg-[var(--cash-paper)] px-5 py-6 shadow-[var(--cash-shadow-preview)]"
        role="dialog"
        aria-modal="true"
        aria-label="CashTrack navigation"
      >
        <div className="flex items-center justify-between border-b border-[var(--cash-line)] pb-6">
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <Image
              src="/cashtrack-icon-theme.svg"
              alt=""
              width={36}
              height={36}
              priority
              className="h-9 w-9 shrink-0"
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
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-full p-2 text-[var(--cash-muted)] transition-colors hover:bg-[var(--cash-mist)] hover:text-[var(--cash-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="mt-8 space-y-1.5" aria-label="Dashboard navigation">
          {menuList.map((menu) => {
            const isActive = isActivePath(menu.path);
            const Icon = menu.icon;

            return (
              <Link
                href={menu.path}
                key={menu.id}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)] focus-visible:ring-offset-2 ${
                  isActive
                    ? "bg-[var(--cash-wash)] text-[var(--cash-teal)]"
                    : "text-[var(--cash-muted)] hover:bg-[var(--cash-mist)] hover:text-[var(--cash-ink)]"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{menu.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}

export default MobileNav;
