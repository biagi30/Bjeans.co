import type { Metadata } from "next";
import { Playfair_Display, Space_Grotesk } from "next/font/google";
import "@/core/styles/globals.css";
import { ThemeProvider } from "@/core/providers/ThemeProvider";
import { LayoutWrapper } from "@/core/components/shared/LayoutWrapper";
import { ToastProvider } from "@/core/context/ToastContext";
import Script from "next/script";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bjeans.co | Your Denim, Your Way",
  description: "Premium Bespoke Denim & Retail Collection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clientKey = (process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "").trim();
  const midtransMode = (process.env.MIDTRANS_MODE || process.env.NEXT_PUBLIC_MIDTRANS_MODE || "").trim().toLowerCase();
  
  const isProduction = midtransMode === "production"
    ? true
    : midtransMode === "sandbox"
      ? false
      : (process.env.NODE_ENV === "production" && !clientKey.startsWith("SB-"));
  const snapUrl = isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${spaceGrotesk.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </ToastProvider>
        </ThemeProvider>
        {clientKey && (
          <Script
            src={snapUrl}
            data-client-key={clientKey}
            strategy="beforeInteractive"
          />
        )}
      </body>
    </html>
  );
}

