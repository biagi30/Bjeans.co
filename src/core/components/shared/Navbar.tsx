"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShoppingBag, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.data?.user?.role === "admin") {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        // fail silently
      }
    }
    checkUser();
  }, []);

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
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Dashboard Admin
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          
          <Link
            href="/profile"
            aria-label="Akun"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            <User size={18} />
          </Link>

          <Link
            href="/cart"
            aria-label="Keranjang"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          >
            <ShoppingBag size={18} />
          </Link>
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
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
              >
                Dashboard Admin
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
