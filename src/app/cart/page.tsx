"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag, ArrowRight, Sparkles, Ruler } from "lucide-react";
import { Container } from "@/core/components/shared";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: "retail" | "custom";
  image?: string | null;
  customSpec?: {
    fabricName: string;
    fabricWeight: string;
    fabricColor: string;
    fitName: string;
    sizeMode: "standard" | "bespoke";
    sizing: {
      waist: number;
      inseam: number;
      thigh?: number;
      calf?: number;
    };
  } | null;
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("bjeans_cart");
    if (stored) {
      try {
        setCartItems(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    } else {
      // Seed default mock items if empty
      const defaultItems: CartItem[] = [
        {
          id: "retail-mock-1",
          name: "Classic Blue Jeans (Retail Edition)",
          price: 749000,
          quantity: 1,
          type: "retail",
          image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&q=80"
        }
      ];
      localStorage.setItem("bjeans_cart", JSON.stringify(defaultItems));
      setCartItems(defaultItems);
    }
  }, []);

  const handleDeleteItem = (itemId: string) => {
    const updated = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updated);
    localStorage.setItem("bjeans_cart", JSON.stringify(updated));
  };

  const handleClearCart = () => {
    setCartItems([]);
    localStorage.setItem("bjeans_cart", JSON.stringify([]));
  };

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground pt-20">
        <div className="animate-pulse text-muted-foreground">Memuat keranjang Anda...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <Container className="max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-border/50 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-1">Pesanan Anda</p>
            <h1 className="font-[var(--font-display)] text-3xl md:text-5xl font-bold tracking-tight">Keranjang Belanja</h1>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-xs font-semibold text-muted-foreground hover:text-red-500 transition-colors bg-surface-elevated hover:bg-red-500/5 border border-border px-4 py-2 rounded-xl"
            >
              Bersihkan Keranjang
            </button>
          )}
        </div>

        {cartItems.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="glass-card rounded-[20px] p-5 border border-border/50 flex flex-col sm:flex-row gap-5 items-start sm:items-center transition-all duration-300 hover:border-border hover:shadow-md"
                >
                  {/* Item Image */}
                  <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-muted border border-border/40 shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted text-xs text-muted-foreground font-semibold">
                        Custom
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-grow space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold text-base text-foreground leading-snug">{item.name}</h2>
                          {item.type === "custom" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary border border-primary/20">
                              <Sparkles size={8} /> Bespoke
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Jumlah: {item.quantity}</p>
                      </div>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-500/10 shrink-0"
                        title="Hapus Produk"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Custom Bespoke Specifications */}
                    {item.type === "custom" && item.customSpec && (
                      <div className="bg-surface-elevated/60 rounded-xl p-3 border border-border/30 text-xs space-y-1.5 mt-2">
                        <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                          <div>
                            Kain: <span className="font-semibold text-foreground">{item.customSpec.fabricName} ({item.customSpec.fabricWeight})</span>
                          </div>
                          <div>
                            Model Potongan: <span className="font-semibold text-foreground">{item.customSpec.fitName}</span>
                          </div>
                          <div>
                            Sistem Ukuran: <span className="font-semibold text-foreground capitalize">{item.customSpec.sizeMode}</span>
                          </div>
                        </div>
                        
                        {/* Custom measurements details */}
                        <div className="border-t border-border/20 pt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Ruler size={10} className="text-primary" />
                            Pinggang: <b className="text-foreground">{item.customSpec.sizing.waist}"</b>
                          </span>
                          {item.customSpec.sizing.thigh && (
                            <span>Paha: <b className="text-foreground">{item.customSpec.sizing.thigh}"</b></span>
                          )}
                          {item.customSpec.sizing.calf && (
                            <span>Betis: <b className="text-foreground">{item.customSpec.sizing.calf}"</b></span>
                          )}
                          <span>Panjang Inseam: <b className="text-foreground">{item.customSpec.sizing.inseam}"</b></span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price info */}
                  <div className="sm:text-right shrink-0 pt-2 sm:pt-0">
                    <span className="text-sm text-muted-foreground block text-xs">Harga Satuan</span>
                    <span className="text-lg font-bold text-foreground block mt-0.5">
                      {formatIDR(item.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="glass-card rounded-[24px] p-6 border border-border/50 space-y-6 bg-surface-elevated/40">
                <h3 className="font-[var(--font-display)] text-xl font-semibold">Ringkasan Keranjang</h3>
                
                <div className="space-y-3 text-sm border-b border-border/40 pb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal Produk</span>
                    <span className="font-semibold">{formatIDR(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pengiriman</span>
                    <span className="font-semibold text-green-500">Gratis (Promo)</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Estimasi Pengerjaan Kustom</span>
                    <span>7-10 Hari Kerja</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Bayar</span>
                  <span className="text-xl text-primary">{formatIDR(total)}</span>
                </div>

                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full rounded-2xl bg-primary hover:bg-primary/95 text-primary-foreground py-4 text-base font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group mt-4"
                >
                  Lanjut ke Pembayaran
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </button>
                
                <Link
                  href="/custom-tailor"
                  className="inline-flex w-full justify-center text-xs font-semibold text-muted-foreground hover:text-primary transition-colors py-1.5"
                >
                  Tambah Kustom Denim Lain
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-[24px] p-12 border border-border/40 text-center space-y-6 max-w-md mx-auto my-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-elevated border border-border/50 text-muted-foreground">
              <ShoppingBag size={24} />
            </div>
            <div className="space-y-2">
              <h2 className="font-[var(--font-display)] text-2xl font-bold">Keranjang Belanja Kosong</h2>
              <p className="text-sm text-muted-foreground">
                Anda belum menambahkan produk retail atau rancangan denim kustom ke keranjang Anda.
              </p>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Link
                href="/shop"
                className="flex-1 rounded-full border border-border py-3 text-sm font-semibold hover:bg-muted transition-colors inline-flex items-center justify-center"
              >
                Belanja Retail
              </Link>
              <Link
                href="/custom-tailor"
                className="flex-1 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-indigo-500/10 inline-flex items-center justify-center"
              >
                Mulai Kustom Tailor
              </Link>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}