"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { Container } from "@/core/components/shared";
import { cn } from "@/core/lib/utils";
import type { Product } from "@/api/models";
import { getProducts } from "@/api/services";

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await getProducts();
        setProducts(res.data.filter((p) => p.isActive));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Derive categories dynamically from product data
  const categories = [
    "Semua",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "Semua" || product.category === activeCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-background text-foreground">
      {/* ─── Header ────────────────────────────────────────────── */}
      <section className="border-b border-border bg-surface py-12 lg:py-16">
        <Container>
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Koleksi Ritel
          </p>
          <h1 className="font-[var(--font-display)] text-3xl font-semibold md:text-5xl">
            Koleksi Raw Denim Premium
          </h1>
          <p className="mt-3 text-muted-foreground">
            Denim selvedge autentik Jepang &amp; Amerika • kisaran berat 11-18oz
          </p>

          {/* Search */}
          <div className="relative mt-8 max-w-md">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="shop-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama, jenis kain, atau berat..."
              className="w-full rounded-full border border-border bg-background py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Filter tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-full px-5 py-2 text-xs font-semibold tracking-wide transition-colors",
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── Product Grid ──────────────────────────────────────── */}
      <section className="py-12 lg:py-16">
        <Container>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Memuat produk...</span>
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <p className="text-lg text-red-500">{error}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Pastikan backend server berjalan di port 5000
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg text-muted-foreground">
                Tidak ada produk yang cocok dengan kriteria Anda.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="card-hover glass-card group flex flex-col overflow-hidden rounded-2xl"
                >
                  <div className="relative h-72 overflow-hidden">
                    {product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted">
                        <span className="text-sm text-muted-foreground">
                          No Image
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute bottom-4 right-4 opacity-0 transition-all group-hover:opacity-100">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black">
                        Lihat Detail <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {product.category}
                    </p>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm font-semibold text-primary">
                      {formatIDR(product.price)}
                    </p>
                    {product.stock <= 0 && (
                      <span className="w-fit rounded-full bg-red-100 px-3 py-0.5 text-[10px] font-semibold uppercase text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        Habis
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}
