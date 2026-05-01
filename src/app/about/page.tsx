import Image from "next/image";
import { Award, Users, Leaf, MapPin, Phone, Mail } from "lucide-react";
import { Container, SectionHeader } from "@/core/components/shared";
import { landingImages } from "@/core/data/landing.data";

const values = [
  {
    icon: <Award size={24} />,
    title: "Kualitas",
    description:
      "Kami hanya menggunakan denim selvedge Jepang dan Amerika terbaik. Setiap potong pakaian melewati pemeriksaan kualitas yang ketat untuk memastikannya memenuhi standar kami yang tinggi sebelum sampai ke tangan Anda.",
  },
  {
    icon: <Users size={24} />,
    title: "Keahlian",
    description:
      "Penjahit ahli kami membawa pengalaman puluhan tahun ke setiap jahitan. Dari pemotongan pola hingga pengepresan akhir, setiap langkah dilakukan dengan presisi dan perawatan artisanal.",
  },
  {
    icon: <Leaf size={24} />,
    title: "Keberlanjutan",
    description:
      "Kami berkomitmen pada produksi yang bertanggung jawab. Model bespoke kami mengurangi limbah dengan membuat denim sesuai pesanan, dan kami bermitra dengan pabrik yang memprioritaskan praktik berkelanjutan.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground">
      {/* ─── Hero ──────────────────────────────────────────────── */}
      <section className="border-b border-border bg-surface py-16 lg:py-24">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Tentang Kami
            </p>
            <h1 className="font-[var(--font-display)] text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
              Mendefinisikan Ulang Denim, Satu Jahitan pada Satu Waktu
            </h1>
            <p className="max-w-lg text-muted-foreground leading-relaxed">
              Bjeans.co lahir dari satu keyakinan sederhana: semua orang berhak
              mendapatkan denim yang pas sempurna. Kami memadukan keahlian
              menjahit tradisional dengan teknologi modern untuk menghadirkan
              jeans custom premium yang unik milik Anda.
            </p>
          </div>
          <div className="relative h-[360px] overflow-hidden rounded-[24px] border border-border md:h-[440px]">
            <Image
              src={landingImages.craft}
              alt="Atelier Bjeans.co"
              fill
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* ─── Mission ───────────────────────────────────────────── */}
      <section className="py-20 lg:py-24">
        <Container className="mx-auto max-w-3xl text-center space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">
            Misi Kami
          </p>
          <h2 className="font-[var(--font-display)] text-3xl font-semibold md:text-4xl">
            Untuk merevolusi denim melalui penjahitan custom dan keahlian
            tradisional
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Kami percaya bahwa denim berkualitas tidak seharusnya menjadi kompromi. Dengan
            memadukan bahan baku terbaik, penjahit ahli, dan pengalaman
            digital yang mulus, kami menjadikan denim bespoke dapat diakses oleh semua orang —
            bukan hanya segelintir orang.
          </p>
        </Container>
      </section>

      {/* ─── Values ────────────────────────────────────────────── */}
      <section className="bg-surface py-20 lg:py-24">
        <Container className="space-y-10">
          <SectionHeader
            eyebrow="Nilai Kami"
            title="Apa yang mendorong kami setiap harinya."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((item) => (
              <div
                key={item.title}
                className="card-hover glass-card rounded-2xl p-7 space-y-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── Team / Story ──────────────────────────────────────── */}
      <section className="py-20 lg:py-24">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative h-[360px] overflow-hidden rounded-[24px] border border-border md:h-[440px]">
            <Image
              src={landingImages.heroTexture}
              alt="Pengrajin denim sedang bekerja"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-6">
            <SectionHeader
              eyebrow="Cerita Kami"
              title="Dari atelier kecil menjadi rumah denim global."
            />
            <p className="text-muted-foreground leading-relaxed">
              Didirikan di distrik mode Jakarta, Bjeans.co bermula sebagai
              atelier kecil dengan mimpi besar. Hari ini, kami melayani para penggemar denim
              di seluruh dunia dengan paduan unik dari layanan ritel dan bespoke.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Sistem keranjang terpadu inovatif kami memungkinkan pelanggan untuk mencampur
              pakaian siap pakai dengan pesanan custom, memisahkan alur
              pemenuhan di belakang layar secara mulus. Ini adalah pertemuan
              antara teknologi dan tradisi, untuk pengalaman denim yang benar-benar modern.
            </p>
          </div>
        </Container>
      </section>

      {/* ─── Visit Our Store ───────────────────────────────────── */}
      <section className="bg-surface py-20 lg:py-24">
        <Container className="space-y-10">
          <SectionHeader
            eyebrow="Kunjungi Kami"
            title="Kunjungi Toko Kami"
            description="Rasakan langsung koleksi denim premium kami. Staf ahli kami akan membantu Anda menemukan potongan yang sempurna."
          />
          <div className="grid gap-8 md:grid-cols-2">
            {/* Map placeholder */}
            <div className="relative h-[300px] overflow-hidden rounded-[24px] border border-border md:h-[360px]">
              <Image
                src={landingImages.press}
                alt="Lokasi toko Bjeans.co"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="rounded-full bg-white/90 px-6 py-3 text-sm font-semibold text-black">
                  📍 Fashion District, Jakarta
                </span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col justify-center space-y-6">
              <div className="glass-card rounded-2xl p-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="font-semibold">Alamat</p>
                    <p className="text-sm text-muted-foreground">
                      Jl. Fashion District No. 42
                      <br />
                      Jakarta Selatan, Indonesia 12110
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="font-semibold">Telepon</p>
                    <p className="text-sm text-muted-foreground">
                      +62 21 5555 0042
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-sm text-muted-foreground">
                      hello@bjeans.co
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <p className="font-semibold">Jam Operasional</p>
                <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Senin — Jumat</span>
                    <span>10:00 — 20:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sabtu</span>
                    <span>10:00 — 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minggu</span>
                    <span>12:00 — 17:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
