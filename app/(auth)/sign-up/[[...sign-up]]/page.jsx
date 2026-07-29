import { SignUp } from "@clerk/nextjs";
import AuthShell from "../../_components/AuthShell";

export default function Page() {
  return (
    <AuthShell>
      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#007a74",
            colorText: "#0f1620",
            colorTextSecondary: "#5c6a72",
            colorBackground: "#ffffff",
            borderRadius: "1rem",
          },
          elements: {
            rootBox: "w-full",
            card: "w-full border-0 bg-transparent p-0 shadow-none",
            headerTitle: "font-display text-3xl font-extrabold tracking-[-0.07em] text-[var(--cash-ink)]",
            headerSubtitle: "text-sm leading-6 text-[var(--cash-muted)]",
            socialButtonsBlockButton: "h-11 rounded-full border-[var(--cash-line)] bg-[var(--cash-mist)] hover:bg-[var(--cash-wash)]",
            formButtonPrimary: "h-11 rounded-full bg-[var(--cash-teal)] shadow-[var(--cash-shadow-button)] hover:bg-[var(--cash-ink)]",
            formFieldInput: "h-11 rounded-full border-[var(--cash-line)] bg-[var(--cash-mist)] focus:border-[var(--cash-teal)] focus:ring-[var(--cash-teal)]",
            footerActionLink: "font-semibold text-[var(--cash-teal)] hover:text-[var(--cash-ink)]",
            dividerLine: "bg-[var(--cash-line)]",
            dividerText: "text-[var(--cash-muted)]",
          },
        }}
      />
    </AuthShell>
  );
}
