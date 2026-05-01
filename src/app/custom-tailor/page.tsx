import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, SectionHeader } from "@/core/components/shared";
import {
  fabricOptions,
  fitOptions,
  sizeGuideData,
  landingImages,
} from "@/core/data/landing.data";

export default function CustomTailorPage() {
  return (
    <div className="bg-background text-foreground">
      {/* ─── Hero ──────────────────────────────────────────────── */}
      <section className="landing-hero relative overflow-hidden">
        <div className="grain-overlay pointer-events-none absolute inset-0" />
        <Container className="relative z-10 grid gap-10 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-primary">
              ✦ Layanan Penjahitan Bespoke
            </p>
            <h1 className="text-balance font-[var(--font-display)] text-4xl font-semibold leading-tight md:text-6xl">
              Denim Custom Dibuat Untuk Anda
            </h1>
            <p className="max-w-lg text-muted-foreground">
              Pilih kain yang tepat, pilih potongan ideal Anda, dan berikan
              ukuran Anda. Kami akan membuat celana denim premium yang disesuaikan
              persis dengan spesifikasi Anda.
            </p>
            <Link
              href="#fabrics"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.03]"
            >
              Mulai Kustomisasi
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="relative h-[360px] overflow-hidden rounded-[24px] border border-border md:h-[460px]">
            <Image
              src={landingImages.customTailor}
              alt="Penjahitan denim custom"
              fill
              priority
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* ─── Fabric Selection ──────────────────────────────────── */}
      <section id="fabrics" className="bg-surface py-20 lg:py-24">
        <Container className="space-y-10">
          <SectionHeader
            eyebrow="Langkah 1"
            title="Pilih Jenis Kain"
            description="Pilih dari koleksi kain denim premium kami yang telah dikurasi, masing-masing dengan karakteristik unik."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {fabricOptions.map((fabric) => (
              <div
                key={fabric.name}
                className="card-hover glass-card group flex flex-col overflow-hidden rounded-2xl md:flex-row"
              >
                <div className="relative h-48 md:h-auto md:w-48 shrink-0 overflow-hidden">
                  <Image
                    src={fabric.image}
                    alt={fabric.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-center gap-2 p-6">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{fabric.name}</h3>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      {fabric.weight}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {fabric.description}
                  </p>
                  <button
                    type="button"
                    className="mt-2 w-fit rounded-full border border-border px-4 py-1.5 text-xs font-semibold transition-colors hover:bg-muted"
                  >
                    Pilih
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── Fit Selection ─────────────────────────────────────── */}
      <section className="py-20 lg:py-24">
        <Container className="space-y-10">
          <SectionHeader
            eyebrow="Langkah 2"
            title="Pilih Potongan Anda"
            description="Pilih siluet yang sesuai dengan gaya dan preferensi kenyamanan Anda."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {fitOptions.map((fit) => (
              <div
                key={fit.name}
                className="card-hover glass-card group flex flex-col overflow-hidden rounded-2xl"
              >
                <div className="relative h-72 overflow-hidden">
                  <Image
                    src={fit.image}
                    alt={fit.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-lg font-semibold text-white">
                      {fit.name}
                    </h3>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-muted-foreground">
                    {fit.description}
                  </p>
                  <button
                    type="button"
                    className="mt-3 w-fit rounded-full border border-border px-4 py-1.5 text-xs font-semibold transition-colors hover:bg-muted"
                  >
                    Pilih Potongan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── Size Guide ────────────────────────────────────────── */}
      <section className="bg-surface py-20 lg:py-24">
        <Container className="space-y-10">
          <SectionHeader
            eyebrow="Langkah 3"
            title="Panduan Ukuran"
            description="Gunakan tabel ukuran komprehensif kami untuk menemukan potongan yang sempurna. Semua ukuran dalam inci."
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {["Ukuran", "Pinggang", "Pinggul", "Inseam", "Paha"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizeGuideData.map((row) => (
                  <tr
                    key={row.size}
                    className="border-b border-border/50 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-4 font-semibold">{row.size}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {row.waist}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {row.hip}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {row.inseam}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {row.thigh}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────── */}
      <section className="py-20 lg:py-24">
        <Container>
          <div className="rounded-[24px] bg-primary px-8 py-14 text-center text-primary-foreground md:px-16">
            <h2 className="text-3xl font-semibold md:text-4xl">
              Siap membuat celana sempurna Anda?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-primary-foreground/80">
              Penjahit ahli kami siap mewujudkan visi Anda. Mulailah dengan
              memilih kain dan kami akan memandu Anda melalui setiap
              langkah.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="#fabrics"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
              >
                Mulai Pesanan Custom
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Jelajahi Pakaian Siap Pakai
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
