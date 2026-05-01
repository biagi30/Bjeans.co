"use client";

import Image from "next/image";
import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { Container } from "@/core/components/shared";
import { shopProducts, shopCategories } from "@/core/data/landing.data";
import { cn } from "@/core/lib/utils";

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = shopProducts.filter((product) => {
    const matchesCategory =
      activeCategory === "Semua" || product.category === activeCategory;
    const matchesSearch = product.title
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
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama, jenis kain, atau berat..."
              className="w-full rounded-full border border-border bg-background py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Filter tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            {shopCategories.map((cat) => (
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
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg text-muted-foreground">
                Tidak ada produk yang cocok dengan kriteria Anda.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="card-hover glass-card group flex flex-col overflow-hidden rounded-2xl"
                >
                  <div className="relative h-72 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
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
                    <p className="font-semibold">{product.title}</p>
                    <p className="text-sm font-semibold text-primary">
                      {product.price}
                    </p>
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
