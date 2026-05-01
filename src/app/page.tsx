import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Scissors, Package, Truck } from "lucide-react";
import { Container, SectionHeader } from "@/core/components/shared";
import {
  landingImages,
  landingProducts,
  landingBuilderSteps,
  landingTestimonials,
  landingOutlets,
} from "@/core/data/landing.data";

export default function Home() {
  return (
    <div className="bg-background text-foreground">
      {/* ─── Hero Section ──────────────────────────────────────── */}
      <section className="landing-hero relative overflow-hidden">
        <div className="grain-overlay pointer-events-none absolute inset-0" />
        <Container className="relative z-10 flex flex-col gap-8 py-20 lg:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <Scissors size={12} />
              Rumah Denim Premium
            </p>
            <h1 className="text-balance font-[var(--font-display)] text-4xl font-semibold leading-tight tracking-tight md:text-6xl lg:text-7xl">
              Koleksi Raw Denim Premium
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Denim selvedge autentik Jepang &amp; Amerika • kisaran berat 11-18oz.
              Dari busana siap pakai hingga pengerjaan khusus (bespoke).
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.03]"
              >
                Jelajahi Koleksi
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/custom-tailor"
                className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Mulai Pembuatan Custom
              </Link>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative mx-auto mt-4 h-[320px] w-full max-w-5xl overflow-hidden rounded-[24px] border border-border md:h-[420px]">
            <Image
              src={landingImages.heroTexture}
              alt="Koleksi raw denim"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>
        </Container>
      </section>

      {/* ─── Stats Strip ───────────────────────────────────────── */}
      <section className="border-y border-border bg-surface py-8">
        <Container>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-semibold md:text-3xl">18+</p>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Ketebalan Denim
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold md:text-3xl">4-Langkah</p>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Kustomisasi
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold md:text-3xl">Seluruh Dunia</p>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Pengiriman
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── Featured Products ─────────────────────────────────── */}
      <section className="py-20 lg:py-24">
        <Container className="space-y-10">
          <div className="flex items-end justify-between">
            <SectionHeader
              eyebrow="Produk Unggulan"
              title="Siluet esensial. Pencucian yang terpahat."
              description="Beli denim siap pakai dengan kain premium Jepang."
            />
            <Link
              href="/shop"
              className="hidden items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80 md:flex"
            >
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {landingProducts.map((product) => (
              <div
                key={product.title}
                className="card-hover glass-card flex flex-col gap-4 overflow-hidden rounded-2xl p-4"
              >
                <div className="relative h-64 overflow-hidden rounded-xl">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{product.title}</p>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                      {product.meta}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    {product.price}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center md:hidden">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              Lihat Semua Produk <ArrowRight size={14} />
            </Link>
          </div>
        </Container>
      </section>

      {/* ─── Bespoke Builder Preview ───────────────────────────── */}
      <section className="bg-surface py-20 lg:py-24">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-primary">
              Layanan Penjahitan Bespoke
            </p>
            <h2 className="text-balance font-[var(--font-display)] text-3xl font-semibold leading-tight md:text-5xl">
              Denim Custom Dibuat Untuk Anda
            </h2>
            <p className="max-w-lg text-muted-foreground">
              Pilih kain yang tepat, pilih potongan ideal Anda, dan berikan
              ukuran Anda. Kami akan membuat celana denim premium yang disesuaikan
              persis dengan spesifikasi Anda.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              {landingBuilderSteps.map((step) => (
                <div
                  key={step.title}
                  className="glass-card rounded-xl p-4"
                >
                  <p className="text-sm font-semibold">{step.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/custom-tailor"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.03]"
            >
              Mulai Kustomisasi
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="relative h-[400px] overflow-hidden rounded-[24px] border border-border md:h-[500px]">
            <Image
              src={landingImages.customTailor}
              alt="Penjahitan denim custom"
              fill
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* ─── Why Bjeans.co ────────────────────────────────────── */}
      <section className="py-20 lg:py-24">
        <Container className="space-y-10">
          <SectionHeader
            eyebrow="Mengapa Bjeans.co"
            title="Dibuat berbeda. Dipakai dengan percaya diri."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: <Scissors size={24} />,
                title: "Kerajinan Bespoke",
                desc: "Setiap potong pakaian dipotong dan dijahit secara individu oleh penjahit ahli yang memiliki pengalaman puluhan tahun tentang denim.",
              },
              {
                icon: <Package size={24} />,
                title: "Checkout Terpadu",
                desc: "Campur item ritel dan kustom dalam satu keranjang. Sistem kami secara otomatis memisahkan pesanan untuk pemenuhan yang mulus.",
              },
              {
                icon: <Truck size={24} />,
                title: "Pengiriman ke Seluruh Dunia",
                desc: "Pengemasan premium dan pengiriman global. Denim Anda tiba dengan aman dan siap dipakai.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="glass-card rounded-2xl p-6 space-y-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── Testimonials ──────────────────────────────────────── */}
      <section className="bg-surface py-20 lg:py-24">
        <Container className="space-y-10">
          <SectionHeader
            eyebrow="Pers + Cerita"
            title="Cerita pers & klien terpilih."
            description="Sekilas pandang mengapa editor mode dan pencinta denim memilih Bjeans.co."
          />
          <div className="flex flex-wrap gap-3">
            {landingOutlets.map((name) => (
              <span
                key={name}
                className="rounded-full border border-border bg-card px-5 py-2 text-xs font-semibold tracking-[0.3em]"
              >
                {name}
              </span>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr_1fr]">
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
              <p className="text-sm text-muted-foreground italic">
                &ldquo;{landingTestimonials[0].quote}&rdquo;
              </p>
              <div className="mt-4">
                <p className="text-sm font-semibold">
                  {landingTestimonials[0].name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {landingTestimonials[0].role}
                </p>
              </div>
            </div>
            <div className="relative min-h-[220px] overflow-hidden rounded-2xl border border-border">
              <Image
                src={landingImages.press}
                alt="Tekstur denim"
                fill
                className="object-cover"
              />
            </div>
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
              <p className="text-sm text-muted-foreground italic">
                &ldquo;{landingTestimonials[1].quote}&rdquo;
              </p>
              <div className="mt-4">
                <p className="text-sm font-semibold">
                  {landingTestimonials[1].name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {landingTestimonials[1].role}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── CTA Section ───────────────────────────────────────── */}
      <section className="py-20 lg:py-24">
        <Container>
          <div className="rounded-[24px] bg-primary px-8 py-14 text-center text-primary-foreground md:px-16">
            <h2 className="text-3xl font-semibold md:text-4xl">
              Potongan Anda, akhir pengerjaan Anda, cerita Anda.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-primary-foreground/80">
              Mulai dengan layanan pembuat kustom kami atau jelajahi koleksi busana siap pakai. Denim premium menanti Anda.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/custom-tailor"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
              >
                Mulai Pembuat Kustom
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Belanja Koleksi
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
