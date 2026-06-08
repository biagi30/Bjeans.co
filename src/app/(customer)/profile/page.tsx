"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, Mail, Phone, MapPin, LogOut, Edit2, X, 
  Package, Clock, Truck, CheckCircle2, ChevronDown, ChevronUp, 
  CreditCard, ClipboardList, ShoppingBag, Lock 
} from "lucide-react";
import { Button } from "@/core/components/shared/Button";
import { useToast } from "@/core/context/ToastContext";

interface ShippingAddress {
  name: string;
  phone: string;
  label: string;
  fullAddress: string;
  city: string;
  postalCode: string;
}

interface UserProfile {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  address: string; 
  role: string;
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

export default function ProfilePage() {
  const toast = useToast();
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

  // TABS & ORDERS tracking state
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Password state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const router = useRouter();

  const fetchOrders = async (userId: string) => {
    try {
      setOrdersLoading(true);
      const res = await fetch(`/api/orders?customer=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setOrders(data.data);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil riwayat pesanan:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
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

          // Fetch orders if user has ID
          if (userData._id) {
            await fetchOrders(userData._id);
          }

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok.");
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Password berhasil diperbarui!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setIsPasswordModalOpen(false);
      } else {
        toast.error(data.message || "Gagal memperbarui password.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat memperbarui password.");
    } finally {
      setPasswordLoading(false);
    }
  };

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
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
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
        toast.success("Alamat pengiriman berhasil diperbarui!");
      } else {
        toast.error("Gagal memperbarui alamat di server.");
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
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting_payment":
        return { label: "Menunggu Pembayaran", css: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
      case "processing":
        return { label: "Sedang Diproses", css: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
      case "shipped":
        return { label: "Dalam Pengiriman", css: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" };
      case "done":
        return { label: "Selesai", css: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
      default:
        return { label: "Menunggu Pembayaran", css: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    }
  };

  const getPaymentBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid":
        return { label: "Lunas", css: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
      case "unpaid":
        return { label: "Belum Bayar", css: "bg-rose-500/10 text-rose-500 border-rose-500/20" };
      case "refunded":
        return { label: "Refund", css: "bg-gray-500/10 text-gray-500 border-gray-500/20" };
      default:
        return { label: "Belum Bayar", css: "bg-rose-500/10 text-rose-500 border-rose-500/20" };
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case "waiting_payment": return 1;
      case "processing": return 2;
      case "shipped": return 3;
      case "done": return 4;
      default: return 1;
    }
  };

  if (loading && !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <p className="text-muted-foreground animate-pulse font-medium">Loading profile...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4 relative">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-display font-bold text-foreground text-center">Dashboard Saya</h1>

        {/* Tab Buttons (Neumorphic layout) */}
        <div className="flex space-x-2 p-1.5 bg-surface-elevated/40 border border-border/40 rounded-2xl mb-8 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === "profile" 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <User size={16} />
            Profil & Alamat
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === "orders" 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <ClipboardList size={16} />
            Pesanan Saya
            {orders.length > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === "orders" ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
              }`}>
                {orders.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "profile" ? (
          /* ──────────────── TAB 1: USER PROFILE ──────────────── */
          <div className="overflow-hidden rounded-[24px] glass-panel border border-border/50 shadow-sm relative">
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

              <div className="mt-10 border-t border-border/50 pt-8 flex justify-between items-center flex-wrap gap-4">
                <Button variant="outline" onClick={() => setIsPasswordModalOpen(true)} startIcon={<Lock size={16} />} className="text-primary border-primary/30 hover:bg-primary/10">
                  Ganti Kata Sandi
                </Button>
                <Button variant="outline" onClick={handleLogout} startIcon={<LogOut size={16} />} className="text-red-500 border-red-500/30 hover:bg-red-500/10">
                  Keluar (Logout)
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* ──────────────── TAB 2: MY ORDERS & TRACKING ──────────────── */
          <div className="space-y-4">
            {ordersLoading ? (
              <div className="p-12 text-center border rounded-2xl glass-panel">
                <p className="text-muted-foreground animate-pulse">Memuat riwayat pesanan Anda...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center border rounded-2xl glass-panel space-y-4 flex flex-col items-center">
                <ShoppingBag size={48} className="text-muted-foreground/60" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">Belum Ada Pesanan</h3>
                  <p className="text-sm text-muted-foreground mt-1">Anda belum pernah melakukan pemesanan di BJeans.co.</p>
                </div>
                <Button onClick={() => router.push("/shop")} className="mt-4">
                  Belanja Sekarang
                </Button>
              </div>
            ) : (
              orders.map((order) => {
                const isExpanded = expandedOrderId === order._id;
                const statusBadge = getStatusBadge(order.status);
                const paymentBadge = getPaymentBadge(order.paymentStatus);
                const activeStep = getStatusStep(order.status);

                return (
                  <div key={order._id} className="border border-border/50 rounded-2xl glass-panel overflow-hidden transition-all duration-300">
                    {/* Header Card (Selalu Terlihat) */}
                    <div 
                      onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-surface-elevated/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-foreground text-sm tracking-wide">{order.orderNumber}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-primary">{formatIDR(order.totalAmount)}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${statusBadge.css}`}>
                          {statusBadge.label}
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${paymentBadge.css}`}>
                          {paymentBadge.label}
                        </span>
                        {isExpanded ? <ChevronUp size={18} className="text-muted-foreground hidden md:block" /> : <ChevronDown size={18} className="text-muted-foreground hidden md:block" />}
                      </div>
                    </div>

                    {/* Accordion Detail & Tracking Progress */}
                    {isExpanded && (
                      <div className="border-t border-border/40 bg-surface/30 p-6 space-y-6">
                        
                        {/* ─── LIVE TRACKING STEPPER ─── */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status Pelacakan Pesanan</h4>
                          
                          {/* Stepper Graphic */}
                          <div className="relative pt-4 pb-8">
                            {/* Connector Line */}
                            <div className="absolute top-8 left-[6%] right-[6%] h-1 bg-border rounded-full z-0">
                              <div 
                                className="h-full bg-primary rounded-full transition-all duration-500" 
                                style={{ width: `${((activeStep - 1) / 3) * 100}%` }}
                              />
                            </div>

                            {/* Steps Container */}
                            <div className="relative z-10 flex justify-between">
                              {/* Step 1: Placed */}
                              <div className="flex flex-col items-center w-[12%] text-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                  activeStep >= 1 ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-muted-foreground"
                                }`}>
                                  <Clock size={14} />
                                </div>
                                <span className={`text-[10px] font-bold mt-2 leading-tight ${activeStep >= 1 ? "text-foreground" : "text-muted-foreground"}`}>
                                  Pesanan Dibuat
                                </span>
                              </div>

                              {/* Step 2: Processing */}
                              <div className="flex flex-col items-center w-[12%] text-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                  activeStep >= 2 ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-muted-foreground"
                                }`}>
                                  <Package size={14} />
                                </div>
                                <span className={`text-[10px] font-bold mt-2 leading-tight ${activeStep >= 2 ? "text-foreground" : "text-muted-foreground"}`}>
                                  Sedang Diproses
                                </span>
                              </div>

                              {/* Step 3: Shipped */}
                              <div className="flex flex-col items-center w-[12%] text-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                  activeStep >= 3 ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-muted-foreground"
                                }`}>
                                  <Truck size={14} />
                                </div>
                                <span className={`text-[10px] font-bold mt-2 leading-tight ${activeStep >= 3 ? "text-foreground" : "text-muted-foreground"}`}>
                                  Dalam Pengiriman
                                </span>
                              </div>

                              {/* Step 4: Done */}
                              <div className="flex flex-col items-center w-[12%] text-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                  activeStep >= 4 ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-muted-foreground"
                                }`}>
                                  <CheckCircle2 size={14} />
                                </div>
                                <span className={`text-[10px] font-bold mt-2 leading-tight ${activeStep >= 4 ? "text-foreground" : "text-muted-foreground"}`}>
                                  Diterima (Selesai)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ─── ORDER ITEMS LIST ─── */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rincian Produk</h4>
                          <div className="space-y-3 bg-surface-elevated/40 border border-border/40 p-4 rounded-xl">
                            {order.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex flex-col space-y-2 pb-3 border-b border-border/20 last:border-b-0 last:pb-0">
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <p className="font-semibold text-sm text-foreground">{item.name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {item.quantity}x @ {formatIDR(item.unitPrice)}
                                    </p>
                                  </div>
                                  <p className="text-sm font-bold text-foreground">{formatIDR(item.totalPrice)}</p>
                                </div>

                                {/* Custom Specifications Box if custom tailor jeans */}
                                {item.itemType === "custom" && item.customSpec && (
                                  <div className="mt-2 text-xs border bg-background/50 rounded-lg p-3 grid grid-cols-2 md:grid-cols-3 gap-2.5">
                                    <div>
                                      <span className="text-muted-foreground block font-medium">Model / Fit:</span>
                                      <span className="font-semibold text-foreground">{item.customSpec.fitName || "Bespoke Fit"}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground block font-medium">Bahan Denim:</span>
                                      <span className="font-semibold text-foreground">{item.customSpec.fabricColor || "Indigo Denim"}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground block font-medium">Ukuran Mode:</span>
                                      <span className="font-semibold text-foreground uppercase">{item.customSpec.sizeMode || "Bespoke"}</span>
                                    </div>
                                    {item.customSpec.sizing && (
                                      <div className="col-span-2 md:col-span-3 border-t border-border/20 pt-2 flex gap-4">
                                        <div>
                                          <span className="text-muted-foreground font-medium">Lingkar Pinggang:</span>
                                          <span className="font-bold text-primary ml-1">{item.customSpec.sizing.waist}"</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground font-medium">Lingkar Pinggul:</span>
                                          <span className="font-bold text-primary ml-1">{item.customSpec.sizing.hip}"</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground font-medium">Panjang Inseam:</span>
                                          <span className="font-bold text-primary ml-1">{item.customSpec.sizing.inseam}"</span>
                                        </div>
                                      </div>
                                    )}
                                    {item.customSpec.notes && (
                                      <div className="col-span-2 md:col-span-3 border-t border-border/20 pt-1">
                                        <span className="text-muted-foreground block font-medium">Catatan Tambahan:</span>
                                        <p className="text-foreground italic">{item.customSpec.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* ─── SHIPPING ADDRESS & INFO ─── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm border-t border-border/30 pt-4">
                          <div>
                            <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Alamat Pengiriman</h5>
                            <p className="text-foreground font-medium leading-relaxed">{order.shippingAddress}</p>
                          </div>
                          <div className="md:text-right space-y-1">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Status Pembayaran</h5>
                            <p className="font-semibold text-foreground">
                              Metode: <span className="uppercase text-primary font-bold">{order.orderType === "custom" ? "Custom Order" : "Retail Order"}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Pesanan ini terhubung dengan ID customer: {order.customer?._id || order.customer}
                            </p>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
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

      {/* MODAL GANTI PASSWORD */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[24px] border border-border/80 bg-background p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <Lock size={18} className="text-primary" /> Ganti Kata Sandi
              </h2>
              <button 
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }} 
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Password Lama</label>
                <input 
                  type="password" 
                  required 
                  value={oldPassword} 
                  onChange={(e) => setOldPassword(e.target.value)} 
                  className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Password Baru</label>
                <input 
                  type="password" 
                  required 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Konfirmasi Password Baru</label>
                <input 
                  type="password" 
                  required 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none" 
                />
              </div>
              <div className="flex gap-3 pt-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }} 
                  className="px-4 py-2 text-xs font-bold border border-border rounded-xl text-muted-foreground"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={passwordLoading}
                  className="px-5 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-xl shadow-md disabled:opacity-50"
                >
                  {passwordLoading ? "Memproses..." : "Perbarui Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}