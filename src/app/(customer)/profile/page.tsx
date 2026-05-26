"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, MapPin, LogOut } from "lucide-react";
import { Button } from "@/core/components/shared/Button";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.data.user);
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh(); 
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <p className="text-muted-foreground animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 transition-colors">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-display font-bold text-foreground text-center">Profil Saya</h1>

        <div className="overflow-hidden rounded-2xl glass-panel border border-border/50 shadow-sm relative">
          {/* Glass edge highlight */}
          <div className="pointer-events-none absolute -inset-px rounded-2xl border border-white/10 dark:border-white/5" />
          
          <div className="p-8 relative z-10">
            <div className="flex items-center gap-6 border-b border-border/50 pb-8">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <span className="text-3xl font-bold uppercase">{user.name.charAt(0)}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">{user.name}</h2>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground mt-2">
                  {user.role}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div className="flex items-center gap-4 text-muted-foreground">
                <User className="h-5 w-5 opacity-70" />
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Nama</p>
                  <p className="text-foreground text-lg py-1">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-muted-foreground">
                <Mail className="h-5 w-5 opacity-70" />
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Email</p>
                  <p className="text-foreground text-lg py-1">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-muted-foreground">
                <Phone className="h-5 w-5 opacity-70" />
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Telepon</p>
                  <p className="text-foreground text-lg py-1">{user.phone || "-"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 text-muted-foreground">
                <MapPin className="h-5 w-5 mt-1 opacity-70" />
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Alamat Pengiriman</p>
                  <p className="text-foreground text-lg py-1 leading-relaxed">{user.address || "Belum ada alamat"}</p>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-border/50 pt-8 flex justify-end">
              <Button
                variant="outline"
                onClick={handleLogout}
                startIcon={<LogOut size={16} />}
                className="text-red-500 border-red-500/30 hover:bg-red-500/10"
              >
                Keluar (Logout)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}