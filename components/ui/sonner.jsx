"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group-[.toaster]:border-[var(--cash-line)] group-[.toaster]:bg-[var(--cash-paper)] group-[.toaster]:text-[var(--cash-ink)] group-[.toaster]:shadow-[var(--cash-shadow-card)]",
          description: "group-[.toast]:text-[var(--cash-muted)]",
          actionButton: "group-[.toast]:bg-[var(--cash-teal)] group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-[var(--cash-wash)] group-[.toast]:text-[var(--cash-muted)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
