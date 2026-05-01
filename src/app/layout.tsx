import type { Metadata } from "next";
import { Playfair_Display, Space_Grotesk } from "next/font/google";
import "@/core/styles/globals.css";
import { ThemeProvider } from "@/core/providers/ThemeProvider";
import { Navbar } from "@/core/components/shared";
import { FooterSection } from "@/core/components/sections";

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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${spaceGrotesk.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="min-h-screen pt-16">{children}</main>
          <FooterSection />
        </ThemeProvider>
      </body>
    </html>
  );
}
