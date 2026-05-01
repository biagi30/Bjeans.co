import Link from "next/link";
import { Container } from "@/core/components/shared";
import { Globe, ExternalLink } from "lucide-react";

export function FooterSection() {
  return (
    <footer className="border-t border-border bg-surface py-16">
      <Container className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr]">
        {/* Brand */}
        <div className="space-y-4">
          <p className="text-lg font-bold tracking-[0.15em] uppercase">
            Bjeans.co
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Denim bespoke premium buatan Indonesia. Dari raw selvedge hingga
            potongan custom — setiap pasang celana menceritakan kisah Anda.
          </p>
          <div className="flex gap-3 pt-2">
            <a
              href="#"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Globe size={16} />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        {/* Company */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]">
            Perusahaan
          </p>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link href="/about" className="transition-colors hover:text-foreground">Tentang Kami</Link>
            <Link href="#" className="transition-colors hover:text-foreground">Atelier</Link>
            <Link href="#" className="transition-colors hover:text-foreground">Karier</Link>
          </div>
        </div>

        {/* Services */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]">
            Layanan
          </p>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link href="/shop" className="transition-colors hover:text-foreground">Toko Ritel</Link>
            <Link href="/custom-tailor" className="transition-colors hover:text-foreground">Custom Tailor</Link>
            <Link href="#" className="transition-colors hover:text-foreground">Panduan Ukuran</Link>
          </div>
        </div>

        {/* Support */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]">
            Bantuan
          </p>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link href="#" className="transition-colors hover:text-foreground">Pengiriman</Link>
            <Link href="#" className="transition-colors hover:text-foreground">Pengembalian</Link>
            <Link href="#" className="transition-colors hover:text-foreground">Kontak</Link>
          </div>
        </div>

        {/* Newsletter */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]">
            Buletin
          </p>
          <p className="text-sm text-muted-foreground">
            Dapatkan pembaruan rilis terbaru dan penawaran eksklusif.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="email@anda.com"
              className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Gabung
            </button>
          </div>
        </div>
      </Container>

      {/* Bottom bar */}
      <Container className="mt-12 border-t border-border pt-6">
        <p className="text-center text-xs text-muted-foreground">
          © 2026 Bjeans.co. Hak cipta dilindungi undang-undang. Premium Bespoke Denim.
        </p>
      </Container>
    </footer>
  );
}
