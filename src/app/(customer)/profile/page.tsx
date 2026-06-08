"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, MapPin, LogOut, Edit2, X } from "lucide-react";
import { Button } from "@/core/components/shared/Button";

interface ShippingAddress {
  name: string;
  phone: string;
  label: string;
  fullAddress: string;
  city: string;
  postalCode: string;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string; 
  role: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [structuredAddress, setStructuredAddress] = useState<ShippingAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formAddress, setFormAddress] = useState<ShippingAddress>({
    name: "",
    phone: "",
    label: "Rumah",
    fullAddress: "",
    city: "",
    postalCode: ""
  });
  
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          const userData: UserProfile = data.data.user;
          setUser(userData);

          // Parsing alamat aman
          let parsedAddress: ShippingAddress;
          try {
            parsedAddress = JSON.parse(userData.address);
          } catch {
            parsedAddress = {
              name: userData.name || "",
              phone: userData.phone || "",
              label: "Utama",
              fullAddress: userData.address || "",
              city: "",
              postalCode: ""
            };
          }

          setStructuredAddress(parsedAddress);

          // SIMPAN MENGGUNAKAN KEY UNIK BERDASARKAN EMAIL USER
          localStorage.setItem(`bjeans_profile_${userData.email}`, JSON.stringify({ address: parsedAddress }));

        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Gagal mengambil data profil:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleOpenEdit = () => {
    if (structuredAddress) {
      setFormAddress(structuredAddress);
      setIsModalOpen(true);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const res = await fetch("/api/user/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: JSON.stringify(formAddress),
          phone: formAddress.phone
        })
      });

      if (res.ok) {
        setStructuredAddress(formAddress);
        setUser({ ...user, phone: formAddress.phone, address: JSON.stringify(formAddress) });
        
        // SINKRONISASI UPDATE KE LOCALSTORAGE DENGAN KEY UNIK
        localStorage.setItem(`bjeans_profile_${user.email}`, JSON.stringify({ address: formAddress }));
        setIsModalOpen(false);
      } else {
        alert("Gagal memperbarui alamat di server.");
      }
    } catch (err) {
      console.error("Gagal mengupdate alamat:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh(); 
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading && !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <p className="text-muted-foreground animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 relative">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-display font-bold text-foreground text-center">Profil Saya</h1>

        <div className="overflow-hidden rounded-2xl glass-panel border border-border/50 shadow-sm relative">
          <div className="p-8 relative z-10">
            <div className="flex items-center gap-6 border-b border-border/50 pb-8">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shrink-0">
                <span className="text-3xl font-bold uppercase">{user.name ? user.name.charAt(0) : "U"}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">{user.name}</h2>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground mt-2">{user.role}</p>
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

              <div className="flex items-start gap-4 text-muted-foreground border-t border-border/20 pt-4">
                <MapPin className="h-5 w-5 mt-1 opacity-70" />
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Alamat Pengiriman</p>
                    <button onClick={handleOpenEdit} className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
                      <Edit2 size={12} /> Ubah Alamat
                    </button>
                  </div>
                  
                  {structuredAddress && structuredAddress.fullAddress ? (
                    <div className="mt-1">
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-bold text-foreground text-sm">{structuredAddress.name}</span>
                        <span className="text-xs text-muted-foreground">({structuredAddress.phone})</span>
                        <span className="bg-primary/10 border border-primary/20 text-[9px] text-primary px-1.5 py-0.2 rounded font-bold uppercase">
                          {structuredAddress.label}
                        </span>
                      </div>
                      <p className="text-foreground text-base mt-1 leading-relaxed">
                        {structuredAddress.fullAddress}, {structuredAddress.city} {structuredAddress.postalCode}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm py-1 italic">Belum ada alamat pengiriman dikonfigurasi.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-border/50 pt-8 flex justify-end">
              <Button variant="outline" onClick={handleLogout} startIcon={<LogOut size={16} />} className="text-red-500 border-red-500/30 hover:bg-red-500/10">
                Keluar (Logout)
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL EDIT ALAMAT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[24px] border border-border/80 bg-background p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <MapPin size={18} className="text-primary" /> Atur Alamat Profil
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Nama Penerima</label>
                  <input type="text" required value={formAddress.name} onChange={(e) => setFormAddress({ ...formAddress, name: e.target.value })} className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">No. Telepon</label>
                  <input type="text" required value={formAddress.phone} onChange={(e) => setFormAddress({ ...formAddress, phone: e.target.value })} className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Label Alamat</label>
                <input type="text" required value={formAddress.label} onChange={(e) => setFormAddress({ ...formAddress, label: e.target.value })} className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Alamat Lengkap</label>
                <textarea required rows={3} value={formAddress.fullAddress} onChange={(e) => setFormAddress({ ...formAddress, fullAddress: e.target.value })} className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none resize-none" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Kota & Provinsi</label>
                  <input type="text" required value={formAddress.city} onChange={(e) => setFormAddress({ ...formAddress, city: e.target.value })} className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Kode Pos</label>
                  <input type="text" required value={formAddress.postalCode} onChange={(e) => setFormAddress({ ...formAddress, postalCode: e.target.value })} className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold border border-border rounded-xl text-muted-foreground">Batal</button>
                <button type="submit" className="px-5 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-xl shadow-md">Simpan Ke Profil</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}