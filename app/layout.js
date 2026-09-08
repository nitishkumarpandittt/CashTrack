import { Manrope, Source_Sans_3 } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import ThemeProvider, { themeInitScript } from "@/app/_components/theme/ThemeProvider";
import { clerkLocalization } from "@/app/_components/theme/clerkLocalization";
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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      localization={clerkLocalization}
    >
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
          {/* A blocking inline script is the only way to set the theme class
              before the first paint. next/script's beforeInteractive queues
              inline code until the bundle runs, which flashes the wrong theme.
              React only warns about this tag when it has to *create* it on
              the client, i.e. after an uncaught error forced a full re-render;
              during normal hydration it is simply matched. */}
          <script
            id="cashtrack-theme-init"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: themeInitScript }}
          />
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
