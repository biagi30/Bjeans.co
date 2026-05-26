"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ArrowLeft, Check, ShoppingBag, Ruler, Scissors, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Material {
  _id: string;
  name: string;
  description?: string;
  weightOz?: number;
  origin?: string;
  color?: string;
  stretch?: string;
  images: string[];
  price?: number;
}

interface CustomOption {
  _id: string;
  type: string;
  name: string;
  description?: string;
  priceDelta?: number;
  image?: string;
  isActive: boolean;
}

const FALLBACK_FITS = [
  {
    _id: "fit-regular",
    name: "Regular Fit",
    description: "Potongan lurus klasik yang nyaman dari pinggul hingga ujung mata kaki. Sangat cocok untuk pemakaian kasual sehari-hari.",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&q=80"
  },
  {
    _id: "fit-straight",
    name: "Straight Cut",
    description: "Potongan modern yang sejajar dari lutut ke bawah, memberikan siluet rapi dan fleksibel untuk berbagai acara.",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80"
  },
  {
    _id: "fit-wide",
    name: "Wide Leg",
    description: "Potongan lebar yang trendi dan leluasa, memberikan sirkulasi udara maksimal serta gaya edgy yang menonjol.",
    image: "https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=400&q=80"
  }
];

export default function FabricDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [fabric, setFabric] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Figma Active Preview Image
  const [activeImage, setActiveImage] = useState("");

  // Customization States
  const [fits, setFits] = useState<CustomOption[]>([]);
  const [loadingFits, setLoadingFits] = useState(true);
  const [selectedFitId, setSelectedFitId] = useState("");
  const [selectedFitName, setSelectedFitName] = useState("");
  
  // Sizing States
  const [sizeMode, setSizeMode] = useState<"standard" | "bespoke">("standard");
  const [selectedStandardSize, setSelectedStandardSize] = useState("32");
  
  // Bespoke Sizing States (Inches)
  const [waist, setWaist] = useState(32);
  const [thigh, setThigh] = useState(22);
  const [calf, setCalf] = useState(15);
  const [inseam, setInseam] = useState(32);

  // Cart Status State
  const [addedToCart, setAddedToCart] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    async function fetchFabric() {
      try {
        setLoading(true);
        const res = await fetch(`/api/materials/${id}`);
        const data = await res.json();
        if (data.success) {
          setFabric(data.data);
          if (data.data.images && data.data.images.length > 0) {
            setActiveImage(data.data.images[0]);
          } else {
            setActiveImage("/images/1-229.png");
          }
          setError(null);
        } else {
          setError(data.message || "Kain tidak ditemukan");
        }
      } catch (err) {
        setError("Gagal memuat kain");
      } finally {
        setLoading(false);
      }
    }

    async function fetchFits() {
      try {
        setLoadingFits(true);
        const res = await fetch("/api/custom-options");
        const data = await res.json();
        if (data.success) {
          const fetchedFits = data.data.filter(
            (o: any) => o.type === "fit" && o.isActive
          );
          if (fetchedFits.length > 0) {
            setFits(fetchedFits);
            setSelectedFitId(fetchedFits[0]._id);
            setSelectedFitName(fetchedFits[0].name);
          } else {
            // Use fallback if empty
            setFits(FALLBACK_FITS as any);
            setSelectedFitId(FALLBACK_FITS[0]._id);
            setSelectedFitName(FALLBACK_FITS[0].name);
          }
        } else {
          setFits(FALLBACK_FITS as any);
          setSelectedFitId(FALLBACK_FITS[0]._id);
          setSelectedFitName(FALLBACK_FITS[0].name);
        }
      } catch {
        setFits(FALLBACK_FITS as any);
        setSelectedFitId(FALLBACK_FITS[0]._id);
        setSelectedFitName(FALLBACK_FITS[0].name);
      } finally {
        setLoadingFits(false);
      }
    }

    fetchFabric();
    fetchFits();
  }, [id]);

  const handleFitSelect = (fitId: string, name: string) => {
    setSelectedFitId(fitId);
    setSelectedFitName(name);
  };

  const handleAddToCart = () => {
    if (!fabric) return;
    setIsAdding(true);

    const price = fabric.price || 850000; // Base custom price

    const customSpec = {
      fabricId: fabric._id,
      fabricName: fabric.name,
      fabricWeight: fabric.weightOz ? `${fabric.weightOz}oz` : "14oz",
      fabricColor: fabric.color || "Indigo Blue",
      fitId: selectedFitId,
      fitName: selectedFitName,
      sizeMode,
      sizing: sizeMode === "standard" 
        ? { waist: parseInt(selectedStandardSize), inseam: 32 }
        : { waist, thigh, calf, inseam }
    };

    const cartItem = {
      id: `custom-${Date.now()}`,
      name: `Bespoke Jeans - ${fabric.name} (${selectedFitName})`,
      price,
      quantity: 1,
      type: "custom",
      customSpec,
      image: fabric.images && fabric.images.length > 0 ? fabric.images[0] : null
    };

    // Store in localStorage cart
    setTimeout(() => {
      const stored = localStorage.getItem("bjeans_cart");
      let cart = stored ? JSON.parse(stored) : [];
      
      // Make sure stored cart is an array
      if (!Array.isArray(cart)) cart = [];

      cart.push(cartItem);
      localStorage.setItem("bjeans_cart", JSON.stringify(cart));
      
      setIsAdding(false);
      setAddedToCart(true);
    }, 800);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background text-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-3 mt-4 text-sm text-muted-foreground">Mempersiapkan Atelier Builder...</span>
      </div>
    );
  }

  if (error || !fabric) {
    return (
      <div className="text-center py-24 bg-background text-foreground">
        <p className="text-xl text-red-500 font-semibold mb-4">{error || "Kain tidak ditemukan"}</p>
        <Link href="/custom-tailor" className="inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft size={16} /> Kembali ke halaman kustom
        </Link>
      </div>
    );
  }

  // Base price for custom jeans
  const basePrice = fabric.price || 850000;

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Back Link */}
        <Link
          href="/custom-tailor"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Kembali ke Kustom Tailor
        </Link>

        {/* Builder Title */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.35em] text-primary mb-2">✦ Layanan Bespoke Bjeans.co</p>
          <h1 className="font-[var(--font-display)] text-3xl md:text-5xl font-semibold leading-tight">
            Desain Celana Denim Anda
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Atelier Custom Builder kami memungkinkan Anda mendesain denim selvedge premium sesuai spesifikasi tubuh dan gaya Anda.
          </p>
        </div>

        {/* Builder Grid */}
        <div className="grid gap-12 lg:grid-cols-12 items-start">
          {/* LEFT COLUMN: Fabric showcase (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="relative h-[360px] md:h-[500px] overflow-hidden rounded-[24px] border border-border/80 bg-surface shadow-xl group">
              {activeImage || (fabric.images && fabric.images.length > 0) ? (
                <Image
                  src={activeImage || fabric.images[0]}
                  alt={fabric.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
                  No Image Available
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 text-white">
                <span className="rounded-full bg-primary/20 backdrop-blur-md px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary border border-primary/30">
                  Denim Terpilih
                </span>
                <h2 className="text-2xl font-bold mt-2">{fabric.name}</h2>
              </div>
            </div>

            {/* Figma Gallery Thumbnails */}
            <div className="grid grid-cols-5 gap-2.5">
              {fabric.images && fabric.images.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveImage(fabric.images[0])}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === fabric.images[0] ? "border-primary scale-[1.05]" : "border-border/40 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={fabric.images[0]} alt="Tekstur Bahan" fill className="object-cover" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveImage("/images/1-229.png")}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  activeImage === "/images/1-229.png" ? "border-primary scale-[1.05]" : "border-border/40 opacity-70 hover:opacity-100"
                }`}
              >
                <Image src="/images/1-229.png" alt="Draped Look" fill className="object-cover" />
              </button>
              <button
                type="button"
                onClick={() => setActiveImage("/images/1-259.png")}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  activeImage === "/images/1-259.png" ? "border-primary scale-[1.05]" : "border-border/40 opacity-70 hover:opacity-100"
                }`}
              >
                <Image src="/images/1-259.png" alt="Pocket Detail" fill className="object-cover" />
              </button>
              <button
                type="button"
                onClick={() => setActiveImage("/images/1-219.png")}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  activeImage === "/images/1-219.png" ? "border-primary scale-[1.05]" : "border-border/40 opacity-70 hover:opacity-100"
                }`}
              >
                <Image src="/images/1-219.png" alt="Stacked Look" fill className="object-cover" />
              </button>
              <button
                type="button"
                onClick={() => setActiveImage("/images/1-279.png")}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  activeImage === "/images/1-279.png" ? "border-primary scale-[1.05]" : "border-border/40 opacity-70 hover:opacity-100"
                }`}
              >
                <Image src="/images/1-279.png" alt="Lineup Look" fill className="object-cover" />
              </button>
            </div>

            {/* Fabric Specs */}
            <div className="glass-card rounded-[20px] p-6 space-y-4 border border-border/50">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Scissors size={18} className="text-primary" /> Karakteristik Kain
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-background/40 rounded-xl p-3 border border-border/20">
                  <p className="text-xs text-muted-foreground">Bobot Kain</p>
                  <p className="font-semibold text-foreground mt-1">{fabric.weightOz ? `${fabric.weightOz} oz` : "14 oz"} (Heavyweight)</p>
                </div>
                <div className="bg-background/40 rounded-xl p-3 border border-border/20">
                  <p className="text-xs text-muted-foreground">Asal Denim</p>
                  <p className="font-semibold text-foreground mt-1">{fabric.origin || "Kurabo Mills, Jepang"}</p>
                </div>
                <div className="bg-background/40 rounded-xl p-3 border border-border/20">
                  <p className="text-xs text-muted-foreground">Tingkat Stretch</p>
                  <p className="font-semibold text-foreground mt-1">{fabric.stretch || "100% Cotton (Rigid)"}</p>
                </div>
                <div className="bg-background/40 rounded-xl p-3 border border-border/20">
                  <p className="text-xs text-muted-foreground">Warna Karakter</p>
                  <p className="font-semibold text-foreground mt-1">{fabric.color || "Deep Indigo Raw"}</p>
                </div>
              </div>
              {fabric.description && (
                <p className="text-sm text-muted-foreground border-t border-border/30 pt-4">
                  {fabric.description}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Customization flow (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Step 1: Fit Selection */}
            <div className="glass-card rounded-[24px] p-6 md:p-8 border border-border/50 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-[var(--font-display)] text-xl font-semibold flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20">1</span>
                  Pilih Potongan Model (Fit)
                </h3>
              </div>

              {loadingFits ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {fits.map((fit) => {
                    const isSelected = fit._id === selectedFitId;
                    return (
                      <div
                        key={fit._id}
                        onClick={() => handleFitSelect(fit._id, fit.name)}
                        className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-lg shadow-indigo-500/10 scale-[1.01]"
                            : "border-border/60 bg-surface-elevated/40 hover:border-border hover:bg-surface-elevated/80"
                        }`}
                      >
                        <div className="relative h-32 w-full overflow-hidden">
                          {fit.image ? (
                            <Image
                              src={fit.image}
                              alt={fit.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                              No Image
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute top-2 right-2 rounded-full bg-primary p-1 text-white shadow-md">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex-grow flex flex-col justify-between">
                          <h4 className={`font-semibold text-sm transition-colors ${isSelected ? "text-primary" : ""}`}>
                            {fit.name}
                          </h4>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                            {fit.description ? (fit.description.length > 60 ? `${fit.description.substring(0, 57)}...` : fit.description) : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 2: Sizing Customization */}
            <div className="glass-card rounded-[24px] p-6 md:p-8 border border-border/50 space-y-6">
              <h3 className="font-[var(--font-display)] text-xl font-semibold flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20">2</span>
                Tentukan Ukuran Anda
              </h3>

              {/* Mode Toggle Tabs */}
              <div className="flex rounded-xl bg-surface-elevated p-1 border border-border/30">
                <button
                  type="button"
                  onClick={() => setSizeMode("standard")}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                    sizeMode === "standard"
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Ukuran Standar
                </button>
                <button
                  type="button"
                  onClick={() => setSizeMode("bespoke")}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                    sizeMode === "bespoke"
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Bespoke Sizing (Kustom)
                </button>
              </div>

              {/* Sizing Interface */}
              <AnimatePresence mode="wait">
                {sizeMode === "standard" ? (
                  <motion.div
                    key="standard-size"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <p className="text-sm text-muted-foreground">
                      Pilih ukuran standar pinggang Anda. Inseam standar untuk ukuran ini disesuaikan pada panjang **32 inci**.
                    </p>
                    <div className="grid grid-cols-6 gap-2">
                      {["28", "30", "32", "34", "36", "38"].map((size) => {
                        const isSel = size === selectedStandardSize;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedStandardSize(size)}
                            className={`rounded-xl py-3 text-sm font-bold border-2 transition-all ${
                              isSel
                                ? "border-primary bg-primary/10 text-primary scale-[1.03]"
                                : "border-border/60 hover:border-border bg-background"
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/10 p-3 text-xs text-primary mt-4">
                      <Info size={14} className="shrink-0" />
                      <span>Butuh panduan lebih lanjut? Lihat tabel panduan ukuran di halaman sebelumnya.</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="bespoke-size"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-2 bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-3 text-xs text-amber-500">
                      <Ruler size={16} className="shrink-0" />
                      <span>Ukur celana jeans ternyaman Anda di permukaan datar untuk mendapatkan angka yang paling presisi.</span>
                    </div>

                    <div className="space-y-5">
                      {/* Waist */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Lingkar Pinggang (Waist)</span>
                          <span className="font-semibold text-primary">{waist} inci</span>
                        </div>
                        <input
                          type="range"
                          min="28"
                          max="42"
                          value={waist}
                          onChange={(e) => setWaist(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>28"</span>
                          <span>32" (Rekomendasi)</span>
                          <span>42"</span>
                        </div>
                      </div>

                      {/* Thigh */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Lebar Paha (Thigh Width)</span>
                          <span className="font-semibold text-primary">{thigh} inci</span>
                        </div>
                        <input
                          type="range"
                          min="18"
                          max="28"
                          value={thigh}
                          onChange={(e) => setThigh(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>18"</span>
                          <span>22" (Rekomendasi)</span>
                          <span>28"</span>
                        </div>
                      </div>

                      {/* Calf */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Lebar Betis (Calf Width)</span>
                          <span className="font-semibold text-primary">{calf} inci</span>
                        </div>
                        <input
                          type="range"
                          min="12"
                          max="20"
                          value={calf}
                          onChange={(e) => setCalf(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>12"</span>
                          <span>15" (Rekomendasi)</span>
                          <span>20"</span>
                        </div>
                      </div>

                      {/* Inseam */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Panjang Inseam (Inseam Length)</span>
                          <span className="font-semibold text-primary">{inseam} inci</span>
                        </div>
                        <input
                          type="range"
                          min="28"
                          max="36"
                          value={inseam}
                          onChange={(e) => setInseam(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>28"</span>
                          <span>32" (Rekomendasi)</span>
                          <span>36"</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary & Add to Cart */}
            <div className="glass-card rounded-[24px] p-6 md:p-8 border border-border/50 space-y-6">
              <h3 className="font-[var(--font-display)] text-xl font-semibold">Ringkasan Konfigurasi</h3>
              
              <div className="rounded-2xl bg-surface-elevated/60 border border-border/30 p-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kain Denim</span>
                  <span className="font-semibold text-right">{fabric.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model Potongan</span>
                  <span className="font-semibold text-right">{selectedFitName || "Belum dipilih"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sistem Ukuran</span>
                  <span className="font-semibold capitalize text-right">{sizeMode === "standard" ? `Standar (Size ${selectedStandardSize})` : "Bespoke (Kustom)"}</span>
                </div>
                {sizeMode === "bespoke" && (
                  <div className="border-t border-border/30 pt-2 mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-background/30 rounded-lg p-2.5">
                    <div>Waist: <b className="text-foreground">{waist}"</b></div>
                    <div>Thigh: <b className="text-foreground">{thigh}"</b></div>
                    <div>Calf: <b className="text-foreground">{calf}"</b></div>
                    <div>Inseam: <b className="text-foreground">{inseam}"</b></div>
                  </div>
                )}
                <div className="border-t border-border/30 pt-4 flex justify-between items-center mt-4">
                  <span className="font-bold text-base">Harga Total Bespoke</span>
                  <span className="text-2xl font-bold text-primary">
                    Rp{basePrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Add to Cart CTA */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full rounded-2xl bg-primary hover:bg-primary/95 text-primary-foreground py-4 text-base font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-80"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Menyimpan racikan bespoke...
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} className="transition-transform group-hover:scale-110" />
                    Pesan Denim Custom Ini
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Confetti/Success Popup Notification */}
      <AnimatePresence>
        {addedToCart && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md bg-surface border border-border p-8 rounded-[24px] shadow-2xl text-center space-y-6"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                <Check size={32} strokeWidth={3} />
              </div>
              <div className="space-y-2">
                <h3 className="font-[var(--font-display)] text-2xl font-semibold">Racikan Disimpan!</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Celana Denim Custom Bespoke Anda telah sukses dirancang dan ditambahkan ke keranjang belanja.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setAddedToCart(false)}
                  className="flex-1 rounded-full border border-border py-3 text-sm font-semibold hover:bg-muted transition-colors"
                >
                  Lanjut Desain Lain
                </button>
                <Link
                  href="/cart"
                  className="flex-1 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-colors inline-flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10"
                >
                  Buka Keranjang
                  <ShoppingBag size={14} />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
