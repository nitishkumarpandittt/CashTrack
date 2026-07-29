"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getLenis } from "./motion/lenis-instance";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

/**
 * Floating pill navbar.
 *
 * Styled from the same tokens as the landing page's cards — white surface,
 * --cash-line hairline, --cash-shadow-nav lift — so it reads as part of the
 * page rather than a separate treatment. Opaque white in both states, so page
 * content never shows through it while scrolling past.
 */
function Header() {
  const { isSignedIn } = useUser();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () =>
      setScrolled((window.scrollY || document.documentElement.scrollTop || 0) > 24);

    update();
    window.addEventListener("scroll", update, { passive: true });

    // Lenis owns the scroll loop, so subscribe to it as well as the native
    // event. It is created in MotionProvider's effect, which may run after
    // this one, hence the deferred hookup.
    let lenis = null;
    const attach = () => {
      lenis = getLenis();
      if (lenis) lenis.on("scroll", update);
    };
    attach();
    const retry = lenis ? null : setTimeout(attach, 0);

    return () => {
      window.removeEventListener("scroll", update);
      if (retry) clearTimeout(retry);
      if (lenis) lenis.off("scroll", update);
    };
  }, []);

  // One colour class at a time, so the cascade is unambiguous.
  const linkColor = scrolled ? "text-[var(--cash-ink)]" : "text-[var(--cash-muted)]";

  // The nav is opaque white on both states, so the page never bleeds through
  // it — the surface just firms up and lifts a little once you scroll.
  // The `shadow:` type hint is required: given a bare var(), Tailwind guesses
  // the arbitrary value is a shadow *colour* and emits --tw-shadow-color, which
  // leaves --tw-shadow undefined and the box-shadow resolving to `none`.
  const surface = scrolled
    ? "bg-white shadow-[0_16px_40px_rgba(15,22,32,0.12)]"
    : "bg-white/90 shadow-[shadow:var(--cash-shadow-nav)]";

  return (
    <header
      className={`site-header fixed left-4 right-4 top-4 py-8 z-50 mx-auto flex h-14 max-w-[1240px] items-center justify-between rounded-full border border-[var(--cash-line)] px-3 backdrop-blur-md sm:left-6 sm:right-6 sm:px-4 ${surface}`}
    >
      <Link
        href="/"
        className="flex items-center gap-2.5 rounded-full px-1 py-1"
        aria-label="CashTrack home"
      >
        <Image src="/cashtrack-icon-theme.svg" alt="" width={30} height={30} priority />
        <span className="font-display text-[15px] font-extrabold tracking-[-0.04em] text-[var(--cash-ink)] sm:text-base">
          CashTrack
        </span>
      </Link>

      <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={`nav-link relative rounded-full px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)] focus-visible:ring-offset-2 ${linkColor}`}
          >
            {/* Two stacked copies inside a mask: the resting label lifts out
                while the teal one rises into its place. The ghost is absolutely
                positioned so it adds no height and the nav geometry is
                unchanged.

                The whole mask is aria-hidden and the name comes from aria-label
                on the anchor — duplicating the text inline left these links with
                no accessible name at all in the a11y tree. */}
            <span className="nav-link__mask" aria-hidden="true">
              <span className="nav-link__label">{item.label}</span>
              <span className="nav-link__label nav-link__label--ghost">{item.label}</span>
            </span>
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        {isSignedIn ? (
          <>
            <Button
              asChild
              size="sm"
              className="h-9 rounded-full bg-[var(--cash-ink)] px-3.5 text-white hover:bg-[var(--cash-teal)] sm:px-4"
            >
              <Link href="/dashboard">
                Dashboard
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
            <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
          </>
        ) : (
          <>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden h-9 rounded-full px-3.5 text-[var(--cash-ink)] hover:bg-[var(--cash-ink)]/[0.06] sm:inline-flex"
            >
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="h-9 rounded-full bg-[var(--cash-teal)] px-4 text-white shadow-[var(--cash-shadow-button)] hover:bg-[var(--cash-ink)]"
            >
              <Link href="/dashboard">
                Get started
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
