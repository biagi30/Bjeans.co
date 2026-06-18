"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ArrowLeft, Check, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/core/context/ToastContext";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  shrinkageWarning?: string;
  sizeOptions?: string[];
  sizes?: { size: string; stock: number }[];
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart States
  const [isAdding, setIsAdding] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartKey, setCartKey] = useState<string>("bjeans_cart_guest");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const userId = data.data?.user?._id;
          if (userId) {
            setCartKey(`bjeans_cart_${userId}`);
          }
        }
      } catch (err) {
        // Keep as guest
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setProduct(data.data);
          setError(null);
        } else {
          setError(data.message || "Produk tidak ditemukan");
        }
      } catch (err) {
        setError("Gagal memuat produk");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    const needsSize = product.category !== "Accessories" && product.category !== "Aksesoris";
    if (needsSize && !selectedSize) {
      toast.error("Silakan pilih ukuran terlebih dahulu sebelum menambahkan ke keranjang.");
      return;
    }

    setIsAdding(true);

    const cartItem = {
      id: `retail-${product._id}-${Date.now()}`,
      name: product.name,
      price: product.price,
      quantity: 1,
      type: "retail",
      customSpec: selectedSize ? { size: selectedSize } : null,
      image: product.images && product.images.length > 0 ? product.images[0] : null
    };

    const stored = localStorage.getItem(cartKey);
    let cart = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(cart)) cart = [];

    const existingIndex = cart.findIndex((item: any) => 
      item.type === "retail" && 
      item.id.split("-")[1] === product._id &&
      ((!item.customSpec && !selectedSize) || (item.customSpec?.size === selectedSize))
    );

    let maxStock = product.stock;
    if (product.sizes && product.sizes.length > 0 && selectedSize) {
      const sizeObj = product.sizes.find(s => s.size === selectedSize);
      if (sizeObj) {
        maxStock = sizeObj.stock;
      } else {
        maxStock = 0;
      }
    }

    if (existingIndex > -1) {
      if (cart[existingIndex].quantity >= maxStock) {
        toast.error(`Anda tidak dapat menambahkan lebih dari ${maxStock} unit ke dalam keranjang (batas stok maksimum).`);
        setIsAdding(false);
        return;
      }
      cart[existingIndex].quantity = cart[existingIndex].quantity + 1;
    } else {
      if (maxStock <= 0) {
        toast.error("Maaf, stok untuk ukuran terpilih sudah habis.");
        setIsAdding(false);
        return;
      }
      cart.push(cartItem);
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    setIsAdding(false);
    setAddedToCart(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Memuat detail produk...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20 bg-background text-foreground">
        <p className="text-lg text-red-500 mb-4">{error || "Produk tidak ditemukan"}</p>
        <Link href="/shop" className="inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft size={16} /> Kembali ke Toko
        </Link>
      </div>
    );
  }

  const needsToggle = !!(product.description && (
    product.description.length > 120 ||
    (product.description.match(/\n/g) || []).length >= 3
  ));

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-16">
      <div className="max-w-5xl mx-auto px-6 md:px-10">
        {/* Back Link */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Kembali ke Koleksi Toko
        </Link>

        <motion.div
          className="glass-card rounded-[24px] p-6 md:p-8 border border-border/50 flex flex-col md:flex-row gap-8 items-start"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Left Column: Image + Thumbnails */}
          <div className="w-full md:w-[320px] shrink-0 flex flex-col items-center">
            {product.images && product.images.length > 0 ? (
              <div className="w-full flex flex-col items-center">
                <div className="relative w-full aspect-[4/5] max-w-[320px] overflow-hidden rounded-2xl shadow-xl border border-border/40 group">
                  <Image
                    src={product.images[activeImageIndex] || product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                </div>
                
                {product.images.length > 1 && (
                  <div className="flex gap-2 mt-4 justify-center flex-wrap max-w-[320px] w-full">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative h-12 w-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                          activeImageIndex === idx
                            ? "border-primary scale-[1.05] shadow-md"
                            : "border-border/40 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${product.name} thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-[300px] h-[375px] flex items-center justify-center bg-muted rounded-xl text-muted-foreground border border-border/40">
                Tidak ada gambar
              </div>
            )}
          </div>

          {/* Right Column: Title, Category, Price, Stock, Description, Warnings & Add to Cart button */}
          <div className="flex-grow flex-1 flex flex-col gap-3.5 justify-start w-full">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider border border-primary/20 mb-1.5">
                {product.category}
              </span>
              <h1 className="text-xl md:text-2xl font-display font-semibold leading-tight text-foreground">{product.name}</h1>
            </div>

            <div className="flex items-center gap-3 py-1.5 border-y border-border/30">
              <span className="text-lg md:text-xl font-bold text-primary">Rp{product.price.toLocaleString('id-ID')}</span>
              {product.stock > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-semibold">Stok: {product.stock} Tersedia</span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-semibold">Stok Habis</span>
              )}
            </div>

            {/* Structured Description Block with Expander */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-border/40 w-full text-xs">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Deskripsi Produk</h3>
              {product.description ? (
                <div className="space-y-1">
                  <p className={`text-xs text-foreground leading-relaxed whitespace-pre-line ${!isExpanded ? "line-clamp-2" : "max-h-[90px] overflow-y-auto pr-1 custom-scrollbar"}`}>
                    {product.description}
                  </p>
                  {needsToggle && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-[10px] font-semibold text-primary hover:underline hover:text-primary/80 transition focus:outline-none block"
                    >
                      {isExpanded ? "Sembunyikan" : "Selengkapnya"}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Tidak ada deskripsi produk.</p>
              )}
            </div>

            {/* Shrinkage Warning Block */}
            {product.shrinkageWarning && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] space-y-0.5 w-full">
                <span className="font-bold uppercase tracking-wider block">Peringatan Penyusutan</span>
                <p className="leading-relaxed whitespace-pre-line">{product.shrinkageWarning}</p>
              </div>
            )}

            {/* Size Selector */}
            {product.category !== "Accessories" && product.category !== "Aksesoris" && (
              <div className="space-y-2 p-3 rounded-xl bg-white/5 border border-border/40 w-full">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {product.category === "Jeans" ? "Pilih Ukuran Celana" : "Pilih Ukuran Pakaian"}
                  </h3>
                  {selectedSize && (
                    <span className="text-[10px] font-semibold text-primary">
                      Terpilih: Ukuran {selectedSize} {product.sizes && product.sizes.find(s => s.size === selectedSize)?.stock === 0 && "(Habis)"}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes && product.sizes.length > 0 ? (
                    product.sizes.map((sizeObj) => {
                      const isOutOfStock = sizeObj.stock <= 0;
                      return (
                        <button
                          key={sizeObj.size}
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => setSelectedSize(sizeObj.size)}
                          className={`h-8 min-w-[32px] px-2 rounded-lg border font-bold text-[11px] transition-all duration-200 flex items-center justify-center relative ${
                            selectedSize === sizeObj.size
                              ? "bg-primary border-primary text-primary-foreground shadow-md shadow-indigo-500/20 scale-[1.05]"
                              : isOutOfStock
                              ? "border-dashed border-border/20 opacity-40 cursor-not-allowed bg-muted text-muted-foreground"
                              : "border-border/60 hover:border-primary/55 bg-background/40 hover:bg-background/80"
                          }`}
                        >
                          {sizeObj.size}
                          {isOutOfStock && (
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    (product.sizeOptions && product.sizeOptions.length > 0
                      ? product.sizeOptions
                      : (product.category === "Jeans"
                        ? ["28", "29", "30", "31", "32", "33", "34", "36", "38", "40"]
                        : ["S", "M", "L", "XL", "XXL"]
                      )
                    ).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`h-8 min-w-[32px] px-2 rounded-lg border font-bold text-[11px] transition-all duration-200 flex items-center justify-center ${
                          selectedSize === size
                            ? "bg-primary border-primary text-primary-foreground shadow-md shadow-indigo-500/20 scale-[1.05]"
                            : "border-border/60 hover:border-primary/55 bg-background/40 hover:bg-background/80"
                        }`}
                      >
                        {size}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              className="mt-1 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-indigo-500/20 hover:bg-primary/95 transition disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 group w-full"
              disabled={product.stock <= 0 || isAdding}
            >
              {isAdding ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Menambahkan...
                </>
              ) : (
                <>
                  <ShoppingBag size={14} className="transition-transform group-hover:scale-110" />
                  Tambah ke Keranjang Belanja
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Cart Success Notification Overlay */}
      <AnimatePresence>
        {addedToCart && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md bg-surface border border-border p-8 rounded-[24px] shadow-2xl text-center space-y-6 animate-fade-in"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                <Check size={32} strokeWidth={3} />
              </div>
              <div className="space-y-2">
                <h3 className="font-[var(--font-display)] text-2xl font-semibold">Produk Ditambahkan!</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  {product.name} telah sukses ditambahkan ke keranjang belanja Anda.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setAddedToCart(false)}
                  className="flex-1 rounded-full border border-border py-3 text-sm font-semibold hover:bg-muted transition-colors"
                >
                  Lanjut Belanja
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
