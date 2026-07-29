"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleDollarSign,
  LayoutGrid,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import AiChat from "./AiChat";

function MobileNav({ isOpen, onClose }) {
  const path = usePathname();
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

  useEffect(() => {
    if (!isOpen) return undefined;

    // While the chat sheet is on top, Escape belongs to it (the sheet has its
    // own handler); closing the drawer too would unmount the sheet mid-exit.
    const handleEscape = (event) => {
      if (event.key === "Escape" && !chatOpen) onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, chatOpen]);

  if (!isOpen) return null;

  const isActivePath = (menuPath) =>
    menuPath === "/dashboard" ? path === menuPath : path.startsWith(menuPath);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Close navigation"
        className="fixed inset-0 z-40 cursor-default bg-[var(--cash-ink)]/35 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside
        className="fixed inset-y-0 left-0 z-50 flex w-[min(86vw,22rem)] flex-col border-r border-[var(--cash-line)] bg-white px-5 py-6 shadow-[var(--cash-shadow-preview)]"
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

        {/* Same assistant entry as the desktop sidebar. */}
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          className="group mt-auto w-full rounded-2xl border border-[var(--cash-line)] bg-[var(--cash-mist)] p-4 text-left transition-colors hover:border-[var(--cash-teal)]/40 hover:bg-[var(--cash-wash)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)]"
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
      </aside>

      <AiChat open={chatOpen} onClose={() => setChatOpen(false)} variant="sheet" />
    </div>
  );
}

export default MobileNav;
