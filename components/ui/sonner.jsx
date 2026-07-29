"use client";

import { Toaster as Sonner } from "sonner";

import { useTheme } from "@/app/_components/theme/ThemeProvider";

const Toaster = ({ ...props }) => {
  // Null until the provider has resolved the stored preference; "system" is
  // the right stand-in for that first beat.
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme ?? "system"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group-[.toaster]:border-[var(--cash-line)] group-[.toaster]:bg-[var(--cash-paper)] group-[.toaster]:text-[var(--cash-ink)] group-[.toaster]:shadow-[var(--cash-shadow-card)]",
          description: "group-[.toast]:text-[var(--cash-muted)]",
          actionButton: "group-[.toast]:bg-[var(--cash-teal-solid)] group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-[var(--cash-wash)] group-[.toast]:text-[var(--cash-muted)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
