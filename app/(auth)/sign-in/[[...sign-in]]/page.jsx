"use client";

import { SignIn } from "@clerk/nextjs";

import { useTheme } from "@/app/_components/theme/ThemeProvider";
import { authAppearance } from "@/app/_components/theme/clerkAppearance";
import AuthShell from "../../_components/AuthShell";

export default function Page() {
  const { isDark } = useTheme();

  return (
    <AuthShell>
      <SignIn appearance={authAppearance(isDark)} />
    </AuthShell>
  );
}
