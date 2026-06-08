"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Container, SectionHeader } from "@/core/components/shared";
import { sizeGuideData } from "@/core/data/landing.data";
import { cn } from "@/core/lib/utils";
import { useToast } from "@/core/context/ToastContext";
import type { Material } from "@/api/models";
import type { CustomOption } from "@/api/models";
import { getMaterials } from "@/api/services";
import { getCustomOptionsByType } from "@/api/services";

export default function CustomTailorPage() {
  const router = useRouter();
  const toast = useToast();
  const [fabrics, setFabrics] = useState<Material[]>([]);
  const [fits, setFits] = useState<CustomOption[]>([]);
  const [loadingFabrics, setLoadingFabrics] = useState(true);
  const [loadingFits, setLoadingFits] = useState(true);

  // Custom Selection States
  const [selectedFabric, setSelectedFabric] = useState<Material | null>(null);
  const [selectedFit, setSelectedFit] = useState<CustomOption | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [cartKey, setCartKey] = useState<string>("bjeans_cart_guest");

  const [savedProfileId, setSavedProfileId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    waist: "",
    hip: "",
    inseam: "",
    notes: ""
  });

  useEffect(() => {
    async function fetchFabrics() {
      try {
        const res = await getMaterials();
        // Filter to only denim-type materials that are active
        setFabrics(res.data.filter((m) => m.type === "denim" && m.isActive));
      } catch {
        // Silently fail
      } finally {
        setLoadingFabrics(false);
      }
    }
    async function fetchFits() {
      try {
        const res = await getCustomOptionsByType("fit");
        setFits(res.data.filter((o) => o.isActive));
      } catch {
        // Silently fail
      } finally {
        setLoadingFits(false);
      }
    }
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const user = data.data?.user;
          if (user) {
            setCartKey(`bjeans_cart_${user._id}`);
            setFormData(prev => ({
              ...prev,
              name: user.name || "",
              email: user.email || "",
              phone: user.phone || ""
            }));

            // Ambil ukuran tubuh tersimpan
            try {
              const mpRes = await fetch("/api/measurement-profiles");
              if (mpRes.ok) {
                const mpData = await mpRes.json();
                if (mpData.success && Array.isArray(mpData.data)) {
                  const myProfile = mpData.data.find((p: any) => p.user?._id === user._id);
                  if (myProfile) {
                    setSavedProfileId(myProfile._id);
                    setFormData(prev => ({
                      ...prev,
                      waist: myProfile.waist ? myProfile.waist.toString() : "",
                      hip: myProfile.thigh ? myProfile.thigh.toString() : "",
                      inseam: myProfile.inseam ? myProfile.inseam.toString() : "",
                      notes: myProfile.notes || ""
                    }));
                  }
                }
              }
            } catch (err) {
              console.error("Gagal mengambil ukuran tersimpan:", err);
            }
          }
        }
      } catch {
        // Guest mode default
      }
    }
    fetchFabrics();
    fetchFits();
    fetchUser();
  }, []);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFabric || !selectedFit) {
      toast.error("Silakan pilih jenis kain dan potongan terlebih dahulu.");
      return;
    }

    setIsAdding(true);
    const price = selectedFabric.price || 850000;

    const customSpec = {
      fabricId: selectedFabric._id,
      fabricName: selectedFabric.name,
      fabricWeight: selectedFabric.weightOz ? `${selectedFabric.weightOz}oz` : "14oz",
      fabricColor: selectedFabric.color || "Indigo Blue",
      fitId: selectedFit._id,
      fitName: selectedFit.name,
      sizeMode: "bespoke",
      sizing: {
        waist: parseFloat(formData.waist) || 32,
        hip: parseFloat(formData.hip) || 38,
        inseam: parseFloat(formData.inseam) || 32,
      },
      notes: formData.notes
    };

    const cartItem = {
      id: `custom-${Date.now()}`,
      name: `Bespoke Jeans - ${selectedFabric.name} (${selectedFit.name})`,
      price,
      quantity: 1,
      type: "custom",
      customSpec,
      image: selectedFabric.images && selectedFabric.images.length > 0 ? selectedFabric.images[0] : null
    };

    // Simpan ukuran tubuh secara otomatis ke database jika user sudah login
    const userId = cartKey !== "bjeans_cart_guest" ? cartKey.replace("bjeans_cart_", "") : null;
    if (userId) {
      const payload = {
        user: userId,
        waist: parseFloat(formData.waist) || 0,
        thigh: parseFloat(formData.hip) || 0, // thigh disimpan sebagai representasi lingkar pinggul
        inseam: parseFloat(formData.inseam) || 0,
        notes: formData.notes || ""
      };

      const url = savedProfileId ? `/api/measurement-profiles/${savedProfileId}` : "/api/measurement-profiles";
      const method = savedProfileId ? "PATCH" : "POST";

      fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?._id) {
          setSavedProfileId(data.data._id);
        }
      })
      .catch(err => console.error("Gagal menyimpan profil ukuran otomatis:", err));
    }

    setTimeout(() => {
      const stored = localStorage.getItem(cartKey);
      let cart = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(cart)) cart = [];

      cart.push(cartItem);
      localStorage.setItem(cartKey, JSON.stringify(cart));
      setIsAdding(false);
      router.push("/cart");
    }, 800);
  };

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
            <h1 className="text-balance font-[var(--font-display)] text-3xl font-semibold leading-tight md:text-5xl">
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
              src="/images/hero.png"
              alt="Penjahitan denim custom bespoke premium"
              fill
              priority
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* ─── Fabric Selection (Langkah 1) ──────────────────────── */}
      <section id="fabrics" className="bg-surface py-20 lg:py-24">
        <Container className="space-y-10">
          <SectionHeader
            eyebrow="Langkah 1"
            title="Pilih Jenis Kain"
            description="Pilih dari koleksi kain denim premium kami yang telah dikurasi, masing-masing dengan karakteristik unik."
          />

          {loadingFabrics ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-3 text-sm text-muted-foreground">Memuat kain...</span>
            </div>
          ) : fabrics.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {fabrics.map((fabric) => {
                const isSelected = selectedFabric?._id === fabric._id;
                return (
                  <div
                    key={fabric._id}
                    onClick={() => setSelectedFabric(fabric)}
                    className={cn(
                      "card-hover glass-card group flex flex-col overflow-hidden rounded-2xl cursor-pointer transition-all border-2",
                      isSelected ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border/50"
                    )}
                  >
                    <div className="relative h-48 w-full shrink-0 overflow-hidden bg-muted">
                      {fabric.images && fabric.images.length > 0 ? (
                        <Image
                          src={fabric.images[0]}
                          alt={fabric.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full min-h-[12rem] items-center justify-center bg-muted">
                          <span className="text-xs text-muted-foreground">No Image</span>
                        </div>
                      )}
                      
                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-primary text-primary-foreground p-1.5 rounded-full flex items-center justify-center shadow-lg z-10">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-between p-5 flex-grow gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-sm line-clamp-1 text-foreground">{fabric.name}</h3>
                          {fabric.weightOz > 0 && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary shrink-0">
                              {fabric.weightOz}oz
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {fabric.origin && `Asal: ${fabric.origin}`}
                          {fabric.origin && fabric.color && " • "}
                          {fabric.color && `Warna: ${fabric.color}`}
                          {fabric.stretch && ` • Stretch: ${fabric.stretch}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        className={cn(
                          "mt-2 inline-flex w-full justify-center rounded-full py-1.5 text-xs font-semibold transition-colors border",
                          isSelected 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "border-border hover:bg-primary hover:text-primary-foreground"
                        )}
                      >
                        {isSelected ? "Terpilih" : "Pilih Kain"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              Belum ada data kain tersedia.
            </p>
          )}
        </Container>
      </section>

      {/* ─── Fit Selection (Langkah 2) ─────────────────────────── */}
      <section id="fits" className="py-20 lg:py-24">
        <Container className="space-y-10">
          <SectionHeader
            eyebrow="Langkah 2"
            title="Pilih Potongan Anda"
            description="Pilih siluet yang sesuai dengan gaya dan preferensi kenyamanan Anda."
          />

          {loadingFits ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-3 text-sm text-muted-foreground">Memuat pilihan potongan...</span>
            </div>
          ) : fits.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {fits.map((fit) => {
                const isSelected = selectedFit?._id === fit._id;
                return (
                  <div
                    key={fit._id}
                    onClick={() => setSelectedFit(fit)}
                    className={cn(
                      "card-hover glass-card group flex flex-col overflow-hidden rounded-2xl cursor-pointer transition-all border-2",
                      isSelected ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border/50"
                    )}
                  >
                    <div className="relative h-60 overflow-hidden bg-muted">
                      {fit.image ? (
                        <Image
                          src={fit.image}
                          alt={fit.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-muted">
                          <span className="text-xs text-muted-foreground">No Image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <h3 className="text-base font-semibold text-white">
                          {fit.name}
                        </h3>
                        {isSelected && (
                          <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow">
                            Terpilih
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col justify-between flex-grow gap-4">
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {fit.description}
                      </p>
                      <button
                        type="button"
                        className={cn(
                          "w-full inline-flex justify-center rounded-full py-1.5 text-xs font-semibold transition-colors border",
                          isSelected 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "border-border hover:bg-primary hover:text-primary-foreground"
                        )}
                      >
                        {isSelected ? "Terpilih" : "Pilih Potongan"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              Belum ada data pilihan potongan tersedia.
            </p>
          )}
        </Container>
      </section>

      {/* ─── Size Guide (Langkah 3) ────────────────────────────── */}
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

      {/* ─── Langkah 4: Detail & Ukuran Anda ───────────────────── */}
      <section className="py-20 lg:py-24 border-t border-border/50" id="details">
        <Container className="space-y-10">
          <SectionHeader
            eyebrow="Langkah 4"
            title="Detail & Ukuran Anda"
            description="Lengkapi informasi detail Anda dan berikan ukuran badan presisi untuk celana jeans bespoke Anda."
          />

          {!selectedFabric || !selectedFit ? (
            <div className="glass-card rounded-[24px] border border-border/50 p-8 text-center max-w-2xl mx-auto space-y-4">
              <p className="text-muted-foreground text-sm">
                Anda perlu memilih <strong>Kain (Langkah 1)</strong> dan <strong>Potongan (Langkah 2)</strong> terlebih dahulu untuk melengkapi bagian ini.
              </p>
              <div className="flex justify-center gap-4">
                {!selectedFabric && (
                  <Link href="#fabrics" className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline">
                    Pilih Kain <ArrowRight size={14} />
                  </Link>
                )}
                {!selectedFit && (
                  <Link href="#fits" className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline">
                    Pilih Potongan <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-12 items-start">
              {/* Ringkasan Pilihan */}
              <div className="lg:col-span-4 glass-card rounded-[24px] border border-border/50 p-6 space-y-6">
                <h3 className="font-[var(--font-display)] text-lg font-bold uppercase tracking-wider text-foreground">Ringkasan Pilihan</h3>
                
                <div className="space-y-4 text-sm">
                  {/* Kain */}
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Jenis Kain (Langkah 1)</p>
                    <div className="flex gap-3 items-center">
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0 bg-muted">
                        {selectedFabric.images && selectedFabric.images.length > 0 ? (
                          <Image src={selectedFabric.images[0]} alt={selectedFabric.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No Image</div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-foreground truncate">{selectedFabric.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">Warna: {selectedFabric.color || "-"} • Berat: {selectedFabric.weightOz || 0}oz</p>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border/50" />

                  {/* Potongan */}
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Potongan Jeans (Langkah 2)</p>
                    <div className="flex gap-3 items-center">
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0 bg-muted">
                        {selectedFit.image ? (
                          <Image src={selectedFit.image} alt={selectedFit.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No Image</div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-foreground truncate">{selectedFit.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{selectedFit.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border/50" />

                  {/* Estimasi Harga */}
                  <div className="flex justify-between items-center pt-2">
                    <p className="font-semibold text-foreground">Harga Bespoke</p>
                    <p className="font-bold text-primary text-lg">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(selectedFabric.price || 850000)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Order */}
              <form onSubmit={handleSubmitOrder} className="lg:col-span-8 glass-card rounded-[24px] border border-border/50 p-8 space-y-6">
                <h3 className="font-[var(--font-display)] text-lg font-bold uppercase tracking-wider text-foreground">Formulir Detail & Ukuran (Bespoke)</h3>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="fullName">Nama Lengkap *</label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      placeholder="Masukkan nama lengkap"
                      className="w-full px-4 py-3 bg-surface border border-border/50 rounded-xl outline-none focus:border-primary transition-colors text-sm text-foreground placeholder:text-muted-foreground"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="emailAddress">Email *</label>
                    <input
                      id="emailAddress"
                      type="email"
                      required
                      placeholder="Masukkan email aktif"
                      className="w-full px-4 py-3 bg-surface border border-border/50 rounded-xl outline-none focus:border-primary transition-colors text-sm text-foreground placeholder:text-muted-foreground"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="phoneNumber">No. Telepon / WhatsApp *</label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      required
                      placeholder="Masukkan nomor telepon"
                      className="w-full px-4 py-3 bg-surface border border-border/50 rounded-xl outline-none focus:border-primary transition-colors text-sm text-foreground placeholder:text-muted-foreground"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="waistSize">Lingkar Pinggang (Waist - inci) *</label>
                    <input
                      id="waistSize"
                      type="number"
                      step="0.1"
                      required
                      placeholder="Contoh: 32"
                      className="w-full px-4 py-3 bg-surface border border-border/50 rounded-xl outline-none focus:border-primary transition-colors text-sm text-foreground placeholder:text-muted-foreground"
                      value={formData.waist}
                      onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="hipSize">Lingkar Pinggul (Hip - inci) *</label>
                    <input
                      id="hipSize"
                      type="number"
                      step="0.1"
                      required
                      placeholder="Contoh: 38"
                      className="w-full px-4 py-3 bg-surface border border-border/50 rounded-xl outline-none focus:border-primary transition-colors text-sm text-foreground placeholder:text-muted-foreground"
                      value={formData.hip}
                      onChange={(e) => setFormData({ ...formData, hip: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="inseamSize">Panjang Kaki Dalam (Inseam - inci) *</label>
                    <input
                      id="inseamSize"
                      type="number"
                      step="0.1"
                      required
                      placeholder="Contoh: 32"
                      className="w-full px-4 py-3 bg-surface border border-border/50 rounded-xl outline-none focus:border-primary transition-colors text-sm text-foreground placeholder:text-muted-foreground"
                      value={formData.inseam}
                      onChange={(e) => setFormData({ ...formData, inseam: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="specialNotes">Catatan Khusus (Opsional)</label>
                  <textarea
                    id="specialNotes"
                    rows={4}
                    placeholder="Tulis instruksi khusus atau kustomisasi tambahan di sini..."
                    className="w-full px-4 py-3 bg-surface border border-border/50 rounded-xl outline-none focus:border-primary transition-colors text-sm text-foreground placeholder:text-muted-foreground resize-none"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.02] disabled:opacity-50"
                  >
                    {isAdding ? "Memproses Kustomisasi..." : "Tambahkan Custom Order ke Keranjang"}
                    {!isAdding && <ArrowRight size={16} />}
                  </button>
                </div>
              </form>
            </div>
          )}
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
