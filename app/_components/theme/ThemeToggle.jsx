"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "./ThemeProvider";

/**
 * Light/dark switch.
 *
 * The icons are chosen by CSS (`dark:` variants) rather than by state, so the
 * markup the server sends is identical to the first client render — no
 * hydration mismatch, and no beat where the wrong icon is showing. Only the
 * accessible name depends on state, and it settles after mount.
 */
function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();

  const label =
    theme === null
      ? "Toggle theme"
      : theme === "dark"
        ? "Switch to light theme"
        : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--cash-line)] text-[var(--cash-muted)] transition-colors hover:border-[rgb(var(--cash-teal-rgb)/0.4)] hover:bg-[var(--cash-wash)] hover:text-[var(--cash-teal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)] focus-visible:ring-offset-2 ${className}`}
    >
      <Moon className="h-4 w-4 dark:hidden" aria-hidden="true" />
      <Sun className="hidden h-4 w-4 dark:block" aria-hidden="true" />
    </button>
  );
}

export default ThemeToggle;
