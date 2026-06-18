"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag, ArrowRight, Sparkles, Ruler, Plus, Minus } from "lucide-react";
import { Container } from "@/core/components/shared";
import { useToast } from "@/core/context/ToastContext";

interface CartItem {
  id: string;
  _id?: string;
  name: string;
  price: number;
  quantity: number;
  type: "retail" | "custom";
  image?: string | null;
  customSpec?: {
    size?: string;
    fabricName?: string;
    fabricWeight?: string;
    fabricColor?: string;
    fitName?: string;
    sizeMode?: "standard" | "bespoke";
    sizing?: {
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
  const toast = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [cartKey, setCartKey] = useState<string>("bjeans_cart_guest");
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);

    const initCart = async () => {
      // 1. Tampilkan data dari guest cart dulu secara instan agar UI tidak kosong/menunggu lama
      const guestStored = localStorage.getItem("bjeans_cart_guest");
      if (guestStored) {
        try {
          const parsedItems = JSON.parse(guestStored);
          setCartItems(parsedItems);
          setSelectedIds(parsedItems.map((item: CartItem) => item.id || item._id));
        } catch (e) {
          console.error("Gagal mengurai keranjang tamu awal:", e);
        }
      }

      // 2. Lakukan request API secara PARALLEL (bukan sekuensial) untuk memangkas waktu load
      try {
        const [authRes, prodRes] = await Promise.all([
          fetch("/api/auth/me", { cache: "no-store" }).catch(() => null),
          fetch("/api/products").catch(() => null)
        ]);

        let key = "bjeans_cart_guest";
        if (authRes && authRes.ok) {
          const data = await authRes.json();
          const userId = data.data?.user?._id;
          if (userId) {
            key = `bjeans_cart_${userId}`;
          }
        }
        setCartKey(key);

        if (prodRes && prodRes.ok) {
          const prodData = await prodRes.json();
          if (prodData.success) {
            setProducts(prodData.data);
          }
        }

        // 3. Setelah mendapat key yang sesuai (guest atau user terdaftar), muat keranjang yang sebenarnya
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const parsedItems = JSON.parse(stored);
            setCartItems(parsedItems);
            setSelectedIds(parsedItems.map((item: CartItem) => item.id || item._id));
          } catch (e) {
            console.error("Gagal mengurai data keranjang tersimpan:", e);
          }
        } else if (key !== "bjeans_cart_guest") {
          // Jika key-nya ternyata user terdaftar tapi data local storage kosong, reset keranjang
          setCartItems([]);
          setSelectedIds([]);
        }
      } catch (err) {
        console.error("Gagal memuat inisialisasi data keranjang:", err);
      }
    };

    initCart();
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    const updatedItems = cartItems.map((item) => {
      const itemId = item.id || item._id;
      if (itemId === id) {
        let maxStock = 999;
        if (item.type === "retail") {
          const parts = id.split("-");
          if (parts.length > 1) {
            const productId = parts[1];
            const foundProduct = products.find((p) => p._id === productId);
            if (foundProduct) {
              maxStock = foundProduct.stock;
            }
          }
        }
        // Limit quantity to [1, maxStock]
        const newQuantity = Math.min(maxStock, Math.max(1, item.quantity + delta));
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCartItems(updatedItems);
    localStorage.setItem(cartKey, JSON.stringify(updatedItems));
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === cartItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cartItems.map((item) => (item.id || item._id) as string));
    }
  };

  const handleDeleteItem = (itemId: string) => {
    const updated = cartItems.filter((item) => (item.id || item._id) !== itemId);
    setCartItems(updated);
    setSelectedIds((prev) => prev.filter((id) => id !== itemId));
    localStorage.setItem(cartKey, JSON.stringify(updated));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setSelectedIds([]);
    localStorage.setItem(cartKey, JSON.stringify([]));
  };

  const total = cartItems
    .filter((item) => selectedIds.includes((item.id || item._id) as string))
    .reduce((acc, item) => acc + item.price * item.quantity, 0);

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
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-3 px-2 pb-2">
                <input
                  type="checkbox"
                  checked={selectedIds.length === cartItems.length && cartItems.length > 0}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary bg-background accent-primary cursor-pointer"
                />
                <span className="text-sm font-semibold text-foreground">
                  Pilih Semua ({cartItems.length})
                </span>
              </div>

              {cartItems.map((item) => {
                const itemId = (item.id || item._id) as string;
                const isSelected = selectedIds.includes(itemId);
                
                // Get max stock for this specific item
                let maxStock = 999;
                if (item.type === "retail") {
                  const parts = itemId.split("-");
                  if (parts.length > 1) {
                    const productId = parts[1];
                    const foundProduct = products.find((p) => p._id === productId);
                    if (foundProduct) {
                      maxStock = foundProduct.stock;
                    }
                  }
                }

                return (
                  <div
                    key={itemId}
                    className={`glass-card rounded-[20px] p-5 border flex flex-col sm:flex-row gap-4 items-start sm:items-center transition-all duration-300 ${
                      isSelected ? "border-primary/50 shadow-sm" : "border-border/50 hover:border-border"
                    }`}
                  >
                    <div className="pt-1 sm:pt-0 shrink-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(itemId)}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary bg-background accent-primary cursor-pointer"
                      />
                    </div>

                    <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-muted border border-border/40 shrink-0">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-muted text-xs text-muted-foreground font-semibold">
                          Custom
                        </div>
                      )}
                    </div>

                    <div className="flex-grow space-y-2 w-full">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-semibold text-base text-foreground leading-snug">{item.name}</h2>
                            {item.type === "custom" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary border border-primary/20">
                                <Sparkles size={8} /> Bespoke
                              </span>
                            )}
                            {item.type === "retail" && item.customSpec?.size && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary border border-primary/20">
                                Ukuran: {item.customSpec.size}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteItem(itemId)}
                          className="text-muted-foreground hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-500/10 shrink-0"
                          title="Hapus Produk"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {item.type === "custom" && item.customSpec && item.customSpec.sizing && (
                        <div className="bg-surface-elevated/60 rounded-xl p-3 border border-border/30 text-xs space-y-1.5 mt-2">
                          <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                            <div>Kain: <span className="font-semibold text-foreground">{item.customSpec.fabricName} ({item.customSpec.fabricWeight})</span></div>
                            <div>Model Potongan: <span className="font-semibold text-foreground">{item.customSpec.fitName}</span></div>
                            <div>Sistem Ukuran: <span className="font-semibold text-foreground capitalize">{item.customSpec.sizeMode}</span></div>
                          </div>
                          <div className="border-t border-border/20 pt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1"><Ruler size={10} className="text-primary" />Pinggang: <b className="text-foreground">{item.customSpec.sizing.waist}&quot;</b></span>
                            {item.customSpec.sizing.thigh && <span>Paha: <b className="text-foreground">{item.customSpec.sizing.thigh}&quot;</b></span>}
                            {item.customSpec.sizing.calf && <span>Betis: <b className="text-foreground">{item.customSpec.sizing.calf}&quot;</b></span>}
                            <span>Panjang Inseam: <b className="text-foreground">{item.customSpec.sizing.inseam}&quot;</b></span>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1 bg-surface-elevated border border-border/60 rounded-lg p-1 w-fit">
                            <button
                              onClick={() => updateQuantity(itemId, -1)}
                              disabled={item.quantity <= 1}
                              className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors rounded-md hover:bg-muted"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(itemId, 1)}
                              disabled={item.quantity >= maxStock}
                              className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors rounded-md hover:bg-muted"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          {item.type === "retail" && maxStock <= item.quantity && (
                            <span className="text-[10px] text-rose-500 font-semibold">
                              Batas stok maksimum tercapai ({maxStock} unit)
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-muted-foreground block mb-0.5">Subtotal Item</span>
                          <span className="text-base font-bold text-foreground block">{formatIDR(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="glass-card rounded-[24px] p-6 border border-border/50 space-y-6 bg-surface-elevated/40">
                <h3 className="font-[var(--font-display)] text-xl font-semibold">Ringkasan Belanja</h3>
                <div className="space-y-3 text-sm border-b border-border/40 pb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Produk ({selectedIds.length} dipilih)</span>
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
                  onClick={() => {
                    const itemsToCheckout = cartItems.filter(item => {
                      const itemId = item.id || item._id;
                      return itemId && selectedIds.includes(itemId);
                    });

                    if (itemsToCheckout.length === 0) {
                      toast.error("Gagal memproses produk. Pastikan produk sudah dicentang.");
                      return;
                    }

                    localStorage.setItem("bjeans_checkout", JSON.stringify(itemsToCheckout));
                    router.push("/checkout");
                  }}
                  disabled={selectedIds.length === 0}
                  className="w-full rounded-2xl bg-primary hover:bg-primary/95 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none text-primary-foreground py-4 text-base font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group mt-4"
                >
                  {selectedIds.length === 0 ? "Pilih Produk Dahulu" : "Lanjut ke Pembayaran"}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </button>
                
                <Link href="/custom-tailor" className="inline-flex w-full justify-center text-xs font-semibold text-muted-foreground hover:text-primary transition-colors py-1.5">
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
              <p className="text-sm text-muted-foreground">Anda belum menambahkan produk retail atau rancangan denim kustom ke keranjang Anda.</p>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Link href="/shop" className="flex-1 rounded-full border border-border py-3 text-sm font-semibold hover:bg-muted transition-colors inline-flex items-center justify-center">Belanja Retail</Link>
              <Link href="/custom-tailor" className="flex-1 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-indigo-500/10 inline-flex items-center justify-center">Mulai Kustom Tailor</Link>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}