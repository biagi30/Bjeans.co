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
    setIsAdding(true);

    const cartItem = {
      id: `retail-${product._id}-${Date.now()}`,
      name: product.name,
      price: product.price,
      quantity: 1,
      type: "retail",
      customSpec: null,
      image: product.images && product.images.length > 0 ? product.images[0] : null
    };

    const stored = localStorage.getItem(cartKey);
    let cart = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(cart)) cart = [];

    const existingIndex = cart.findIndex((item: any) => 
      item.type === "retail" && item.id.split("-")[1] === product._id
    );

    if (existingIndex > -1) {
      if (cart[existingIndex].quantity >= product.stock) {
        toast.error(`Anda tidak dapat menambahkan lebih dari ${product.stock} unit ke dalam keranjang (batas stok maksimum).`);
        setIsAdding(false);
        return;
      }
      cart[existingIndex].quantity = cart[existingIndex].quantity + 1;
    } else {
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

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Back Link */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Kembali ke Koleksi Toko
        </Link>

        <motion.div
          className="glass-card rounded-[24px] p-6 md:p-12 border border-border/50 flex flex-col md:flex-row gap-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex-1 flex flex-col items-center justify-center">
            {product.images && product.images.length > 0 ? (
              <div className="relative w-full aspect-[4/5] max-w-[400px] overflow-hidden rounded-2xl shadow-xl border border-border/40 group">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              </div>
            ) : (
              <div className="w-[400px] h-[500px] flex items-center justify-center bg-muted rounded-xl text-muted-foreground border border-border/40">
                Tidak ada gambar
              </div>
            )}
          </div>

          <div className="flex-grow flex-1 flex flex-col gap-6 justify-center max-w-xl">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20 mb-3">
                {product.category}
              </span>
              <h1 className="text-3xl md:text-5xl font-display font-semibold leading-tight text-foreground">{product.name}</h1>
            </div>

            <div className="flex items-center gap-4 py-2 border-y border-border/30">
              <span className="text-3xl font-bold text-primary">Rp{product.price.toLocaleString('id-ID')}</span>
              {product.stock > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-semibold">Stok: {product.stock} Tersedia</span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-semibold">Stok Habis</span>
              )}
            </div>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{product.description || "Tidak ada deskripsi produk."}</p>

            <button
              onClick={handleAddToCart}
              className="mt-4 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-lg shadow-indigo-500/20 hover:bg-primary/95 transition disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 group"
              disabled={product.stock <= 0 || isAdding}
            >
              {isAdding ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Menambahkan...
                </>
              ) : (
                <>
                  <ShoppingBag size={18} className="transition-transform group-hover:scale-110" />
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
