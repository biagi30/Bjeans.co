"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/core/components/shared/Button";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.message || data.error || "Registration failed");
      }
    } catch (err: any) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground transition-colors pt-24 pb-12 px-4">
      <div className="w-full max-w-md p-8 glass-panel rounded-2xl border border-border/50 shadow-sm relative overflow-hidden">
        {/* Glow styling to mimic figma guidelines */}
        <div className="pointer-events-none absolute -inset-px rounded-2xl border border-white/10 dark:border-white/5" />

        <h1 className="text-2xl font-display font-bold text-center mb-6 text-foreground tracking-wide">
          Daftar Akun Baru
        </h1>
        
        {error && (
          <div className="mb-6 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 p-3 rounded-lg z-10 relative">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 p-3 rounded-lg z-10 relative">
            Registrasi berhasil! Mengarahkan ke halaman login...
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 relative z-10">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Nomor Telepon
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground"
              placeholder="08123456789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Alamat Lengkap
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground resize-none"
              placeholder="Jalan Mawar No 1..."
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading || success}
            >
              {loading ? "Memproses..." : "Daftar"}
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-foreground hover:text-primary transition-colors font-medium border-b border-foreground/30 pb-0.5">
              Masuk di sini
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}