"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/core/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/shop", label: "Toko" },
  { href: "/custom-tailor", label: "Kustom Tailor" },
  { href: "/about", label: "Tentang Kami" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="glass-panel fixed left-0 right-0 top-0 z-50 border-b border-border/50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-10">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold tracking-[0.15em] uppercase">
          Bjeans.co
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm transition-colors hover:text-foreground",
                pathname === link.href
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Cari"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          >
            <Search size={18} />
          </button>
          <button
            type="button"
            aria-label="Akun"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            <User size={18} />
          </button>
          <button
            type="button"
            aria-label="Keranjang"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          >
            <ShoppingBag size={18} />
          </button>
          <ThemeToggle />

          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-label="Buka menu"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground md:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="glass-panel border-t border-border/50 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname === link.href
                    ? "bg-primary/10 font-semibold text-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
