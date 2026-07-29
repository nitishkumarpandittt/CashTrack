import { Manrope, Source_Sans_3 } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import ThemeProvider, { themeInitScript } from "@/app/_components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
  preload: true,
  weight: ["400", "500", "600", "700", "800"],
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
  preload: true,
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "CashTrack | Make money feel manageable",
  description: "A calmer, smarter way to track your spending, budgets, and financial goals.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      {/* suppressHydrationWarning: the theme script below rewrites <html>'s
          class list before React hydrates, and browser extensions routinely
          add their own attributes to <body> (bis_register, cz-shortcut-listen
          and friends). Both are expected client-only attribute differences. */}
      {/* data-scroll-behavior: globals.css sets `scroll-behavior: smooth`, and
          Next needs this marker to know it should suppress that during route
          transitions so restored scroll positions do not animate. */}
      <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/cashtrack-icon-theme.svg" />
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        </head>
        <body
          className={`${manrope.variable} ${sourceSans.variable} antialiased`}
          suppressHydrationWarning
        >
          <ThemeProvider>
            <Toaster />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
