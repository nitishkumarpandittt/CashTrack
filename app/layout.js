import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

// Optimize font loading
const outfit = Outfit({
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata = {
  title: "CashTrack",
  description: "An AI powered finance management application",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en">
        <head>
          {/* Favicon */}
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="icon" href="/cashtrack-icon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/cashtrack-icon.svg" />

          {/* Fast refresh and development optimizations */}
          {process.env.NODE_ENV === 'development' && (
            <>
              <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate, max-age=0" />
              <meta httpEquiv="Pragma" content="no-cache" />
              <meta httpEquiv="Expires" content="0" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
            </>
          )}
        </head>
        <body className={`${outfit.className} antialiased`}>
          <Toaster />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
