import { Button, Container } from "@/core/components/shared";

export function CtaSection() {
  return (
    <Container>
      <section className="rounded-[32px] bg-primary px-10 py-12 text-primary-foreground">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold">
              Potongan Anda, akhir pengerjaan Anda, cerita Anda.
            </h2>
            <p className="max-w-xl text-sm text-primary-foreground/80">
              Mulai dengan pembuat kustom kami atau jelajahi koleksi siap pakai.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button variant="light">Mulai Kustomisasi</Button>
            <Button
              variant="outline"
              className="border-white/40 text-primary-foreground"
            >
              Belanja Koleksi
            </Button>
          </div>
        </div>
      </section>
    </Container>
  );
}
