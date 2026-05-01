import { Container } from "@/core/components/shared";

export function FooterSection() {
  return (
    <footer className="border-t border-white/10 bg-background px-6 py-12 md:px-10">
      <Container className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="font-[var(--font-display)] text-xl">Bjeans.co</p>
          <p className="text-sm text-muted-foreground">
            Premium denim crafted in Indonesia.
          </p>
        </div>
        <div className="grid gap-8 text-sm text-muted-foreground sm:grid-cols-3">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-foreground">
              Company
            </p>
            <p>About</p>
            <p>Atelier</p>
            <p>Careers</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-foreground">
              Support
            </p>
            <p>Sizing</p>
            <p>Shipping</p>
            <p>Returns</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-foreground">
              Social
            </p>
            <p>Instagram</p>
            <p>TikTok</p>
            <p>Journal</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
