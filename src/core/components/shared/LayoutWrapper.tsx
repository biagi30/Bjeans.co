"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { FooterSection } from "../sections/FooterSection";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navbar />}
      <main className={!isAdmin ? "min-h-screen pt-16 customer-layout" : "admin-layout"}>{children}</main>
      {!isAdmin && <FooterSection />}
    </>
  );
}
