"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, CreditCard, Truck, ArrowLeft, CheckCircle2, Loader2, ChevronRight, X } from "lucide-react";
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
  customSpec?: any;
}

interface ShippingAddress {
  name: string;
  phone: string;
  label: string;
  fullAddress: string;
  city: string;
  postalCode: string;
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

export default function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentStep, setPaymentStep] = useState(false);
  const [createdOrderList, setCreatedOrderList] = useState<{ _id: string; orderNumber: string; totalAmount: number }[]>([]);
  const [snapToken, setSnapToken] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [cartKey, setCartKey] = useState<string>("bjeans_cart_guest");
  
  const [address, setAddress] = useState<ShippingAddress>({ name: "", phone: "", label: "", fullAddress: "", city: "", postalCode: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formAddress, setFormAddress] = useState<ShippingAddress>(address);

  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [selectedCourier, setSelectedCourier] = useState("reg");
  const [selectedPayment, setSelectedPayment] = useState("qris");

  const courierOptions = [
    { id: "reg", name: "Reguler (J&T / SiCepat)", price: 15000, desc: "Estimasi tiba 2-4 hari", isPromo: true },
    { id: "exp", name: "Ekspres (JNE YES)", price: 35000, desc: "Estimasi tiba 1-2 hari", isPromo: false },
  ];

  const paymentMethods = [
    { id: "qris", name: "QRIS / GoPay / ShopeePay", group: "E-Wallet" },
    { id: "bca", name: "BCA Virtual Account", group: "Transfer Bank" },
  ];

  useEffect(() => {
    setMounted(true);

    const initCheckout = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        const user = data.data.user;
        setUserEmail(user.email);
        
        const uid = user._id;
        if (uid) {
          setUserId(uid);
          setCartKey(`bjeans_cart_${uid}`);
        }

        // AMBIL ALAMAT BERDASARKAN KEY EMAIL UNIK USER
        const storedProfile = localStorage.getItem(`bjeans_profile_${user.email}`);
        if (storedProfile) {
          const profileData = JSON.parse(storedProfile);
          if (profileData.address) setAddress(profileData.address);
        } else {
          const defaultAddress = { name: user.name || "", phone: user.phone || "", label: "Rumah", fullAddress: "", city: "", postalCode: "" };
          setAddress(defaultAddress);
          localStorage.setItem(`bjeans_profile_${user.email}`, JSON.stringify({ address: defaultAddress }));
        }

        // AMBIL PRODUK CHECKOUT BERDASARKAN KEY GLOBAL SINKRON DENGAN CARTPAGE
        const storedCheckout = localStorage.getItem("bjeans_checkout");
        if (storedCheckout) {
          const parsed = JSON.parse(storedCheckout);
          setCheckoutItems(parsed);
          if (parsed.length === 0) router.push("/cart");
        } else {
          router.push("/cart");
        }
      } catch (e) {
        console.error(e);
      }
    };

    initCheckout();
  }, [router]);

  const productSubtotal = checkoutItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const activeCourier = courierOptions.find(c => c.id === selectedCourier);
  const shippingFee = activeCourier ? (activeCourier.isPromo ? 0 : activeCourier.price) : 0;
  const grandTotal = productSubtotal + shippingFee + 2000;

  const openAddressModal = () => {
    setFormAddress(address);
    setIsModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setAddress(formAddress);
    setIsModalOpen(false);
  };

  const triggerSnapPayment = (
    token: string,
    ordersList: { _id: string; orderNumber: string; totalAmount: number }[]
  ) => {
    if (typeof window !== "undefined" && (window as any).snap) {
      (window as any).snap.pay(token, {
        onSuccess: async (result: any) => {
          console.log("Midtrans payment success:", result);
          setLoading(true);
          try {
            // Update all orders in the list
            for (const order of ordersList) {
              await fetch(`/api/orders/${order._id}/payment`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  paymentStatus: "paid",
                  status: "processing"
                })
              });
            }
            setPaymentStep(false);
            setSuccess(true);
          } catch (err: any) {
            toast.error("Gagal mengonfirmasi pembayaran ke server: " + err.message);
          } finally {
            setLoading(false);
          }
        },
        onPending: (result: any) => {
          console.log("Midtrans payment pending:", result);
          toast.info("Pembayaran tertunda. Silakan selesaikan pembayaran Anda sesuai petunjuk.");
        },
        onError: (result: any) => {
          console.error("Midtrans payment error:", result);
          toast.error("Pembayaran gagal. Silakan coba metode pembayaran lain.");
        },
        onClose: () => {
          console.log("Midtrans payment popup closed");
          toast.info("Anda menutup jendela pembayaran sebelum selesai.");
        }
      });
    } else {
      toast.error("Midtrans Snap SDK gagal dimuat. Coba muat ulang halaman.");
    }
  };

  const handlePlaceOrder = async () => {
    if (!userEmail || !userId || checkoutItems.length === 0) return;
    setLoading(true);

    const generateOrderNumber = (prefix: string) => {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).slice(2, 6).toUpperCase();
      return `${prefix}-${timestamp}-${random}`;
    };

    const fullAddrStr = `${address.name} (${address.phone}) - ${address.fullAddress}, ${address.city}, ${address.postalCode}`;

    // Map checkout items to backend schema format
    const orderItems = checkoutItems.map(item => {
      let productObjectId = null;
      if (item.type === "retail") {
        const parts = item.id.split("-");
        if (parts.length > 1 && parts[1].length === 24) {
          productObjectId = parts[1];
        }
      }
      return {
        itemType: item.type,
        product: productObjectId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        customSpec: item.customSpec || null
      };
    });

    const retailItems = orderItems.filter(item => item.itemType === "retail");
    const customItems = orderItems.filter(item => item.itemType === "custom");
    const newlyCreated: { _id: string; orderNumber: string; totalAmount: number }[] = [];

    try {
      if (retailItems.length > 0) {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNumber: generateOrderNumber("RTL"),
            orderType: "retail",
            customer: userId,
            items: retailItems,
            status: "waiting_payment",
            paymentStatus: "unpaid",
            shippingAddress: fullAddrStr,
            totalAmount: retailItems.reduce((acc, item) => acc + item.totalPrice, 0)
          })
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          console.error("Retail order error:", res.status, errBody);
          throw new Error(errBody?.error || "Gagal membuat pesanan retail");
        }
        const json = await res.json();
        if (json.success && json.data) {
          newlyCreated.push(json.data);
        }
      }

      if (customItems.length > 0) {
        const customPayload = {
            orderNumber: generateOrderNumber("CST"),
            orderType: "custom",
            customer: userId,
            items: customItems,
            status: "waiting_payment",
            paymentStatus: "unpaid",
            shippingAddress: fullAddrStr,
            totalAmount: customItems.reduce((acc, item) => acc + item.totalPrice, 0)
        };
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(customPayload)
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          console.error("Custom order error:", res.status, errBody);
          throw new Error(errBody?.error || "Gagal membuat pesanan custom");
        }
        const json = await res.json();
        if (json.success && json.data) {
          newlyCreated.push(json.data);
        }
      }

      // Ambil sisa keranjang belanja global untuk user tertentu
      const originalCartStr = localStorage.getItem(cartKey);
      if (originalCartStr) {
        const originalCart: CartItem[] = JSON.parse(originalCartStr);
        const updatedCart = originalCart.filter(cartItem => {
          const cId = cartItem.id || cartItem._id;
          return !checkoutItems.some(chkItem => (chkItem.id || chkItem._id) === cId);
        });
        localStorage.setItem(cartKey, JSON.stringify(updatedCart));
      }
      
      // Hapus data temporary checkout
      localStorage.removeItem("bjeans_checkout");

      if (newlyCreated.length > 0) {
        setCreatedOrderList(newlyCreated);
        
        // --- FETCH MIDTRANS TOKEN ---
        const tokenRes = await fetch("/api/payment/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderIds: newlyCreated.map(o => o._id),
            shippingFee,
            serviceFee: 2000
          })
        });

        if (!tokenRes.ok) {
          const errData = await tokenRes.json().catch(() => ({}));
          throw new Error(errData.error || "Gagal mendapatkan token pembayaran dari Midtrans.");
        }

        const tokenJson = await tokenRes.json();
        if (tokenJson.success && tokenJson.data?.token) {
          const token = tokenJson.data.token;
          setSnapToken(token);
          setPaymentStep(true);
          triggerSnapPayment(token, newlyCreated);
        } else {
          throw new Error("Respon pembayaran Midtrans tidak valid.");
        }
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat membuat pesanan.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (paymentStep) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24 pb-16 flex items-center justify-center">
        <Container className="max-w-md">
          <div className="glass-card rounded-[24px] p-8 border space-y-6 flex flex-col items-center">
            <h1 className="text-2xl font-bold tracking-tight text-center">Selesaikan Pembayaran</h1>
            <p className="text-sm text-muted-foreground text-center">
              Silakan selesaikan pembayaran untuk pesanan Anda menggunakan tombol di bawah ini.
            </p>
            
            {/* Total Harga */}
            <div className="w-full bg-surface-elevated p-4 rounded-xl text-center border">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Total Tagihan</span>
              <p className="text-2xl font-extrabold text-primary mt-1">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(grandTotal)}
              </p>
            </div>

            <div className="w-full space-y-4 py-2">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3 text-xs text-muted-foreground text-center justify-center">
                <CreditCard className="text-primary shrink-0" size={18} />
                <span>Klik tombol di bawah untuk membuka halaman pembayaran Midtrans.</span>
              </div>
            </div>

            {/* Pay Button */}
            <div className="w-full space-y-3">
              <button
                onClick={() => triggerSnapPayment(snapToken, createdOrderList)}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Bayar Sekarang"
                )}
              </button>
              
              <button
                onClick={() => {
                  setPaymentStep(false);
                  router.push("/cart");
                }}
                disabled={loading}
                className="w-full bg-surface hover:bg-muted py-3 rounded-xl font-semibold text-xs border text-muted-foreground"
              >
                Batalkan & Kembali ke Keranjang
              </button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24 pb-16 flex items-center justify-center">
        <Container className="max-w-md text-center">
          <div className="glass-card rounded-[24px] p-8 border text-center space-y-6 flex flex-col items-center">
            <div className="h-16 w-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center"><CheckCircle2 size={36} /></div>
            <h1 className="text-3xl font-bold">Pesanan Berhasil!</h1>
            <button onClick={() => router.push("/")} className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold">Kembali ke Toko</button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16 relative">
      <Container className="max-w-5xl">
        <div className="mb-6">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground"><ArrowLeft size={14} /> Kembali</button>
        </div>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-8">Checkout Pesanan</h1>
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-card rounded-[20px] p-5 border space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 font-semibold text-sm uppercase text-primary"><MapPin size={16} /> Alamat Pengiriman</div>
                <button onClick={openAddressModal} className="text-xs font-semibold text-primary/80 hover:text-primary flex items-center gap-0.5">Ubah Alamat <ChevronRight size={14} /></button>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-foreground">{address.name || "Belum ada nama"}</span>
                  <span className="text-xs text-muted-foreground">{address.phone}</span>
                  {address.label && <span className="bg-primary/10 border text-[10px] text-primary px-1.5 py-0.5 rounded font-bold uppercase">{address.label}</span>}
                </div>
                <p className="text-muted-foreground leading-relaxed pt-1">{address.fullAddress ? `${address.fullAddress}, ${address.city}, ${address.postalCode}` : "Alamat belum lengkap."}</p>
              </div>
            </div>

            <div className="glass-card rounded-[20px] p-5 border space-y-4">
              <div className="font-semibold text-sm uppercase text-primary border-b pb-3">Produk yang Dipesan</div>
              <div className="divide-y space-y-4">
                {checkoutItems.map((item) => (
                  <div key={item.id || item._id} className="flex gap-4 pt-4 first:pt-0 items-start">
                    <div className="relative h-16 w-16 bg-muted rounded-xl overflow-hidden shrink-0">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                    </div>
                    <div className="flex-grow space-y-1">
                      <h3 className="font-semibold text-sm text-foreground">{item.name}</h3>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Jumlah: {item.quantity}x</span>
                        <span className="font-bold">{formatIDR(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-[20px] p-5 border space-y-4">
              <div className="flex items-center gap-2 font-semibold text-sm uppercase text-primary border-b pb-3"><Truck size={16} /> Opsi Pengiriman</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {courierOptions.map((courier) => (
                  <label key={courier.id} className={`border rounded-xl p-4 flex flex-col justify-between gap-2 cursor-pointer transition-all ${selectedCourier === courier.id ? "border-primary bg-primary/5" : "border-border/60"}`}>
                    <div>
                      <input type="radio" name="courier" checked={selectedCourier === courier.id} onChange={() => setSelectedCourier(courier.id)} className="sr-only" />
                      <p className="font-semibold text-sm">{courier.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{courier.desc}</p>
                    </div>
                    <div className="text-right border-t pt-2 flex justify-between items-center text-xs font-bold">
                      <span className="text-[10px] text-muted-foreground uppercase">Biaya</span>
                      <span>{courier.isPromo ? "Gratis" : formatIDR(courier.price)}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* METODE PEMBAYARAN INFO */}
            <div className="glass-card rounded-[20px] p-5 border space-y-4">
              <div className="flex items-center gap-2 font-semibold text-sm uppercase text-primary border-b pb-3"><CreditCard size={16} /> Metode Pembayaran</div>
              <div className="bg-surface-elevated/40 border border-border/40 p-4 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                  <CreditCard size={20} />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-sm text-foreground">Midtrans Payment Gateway</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Pembayaran aman & instan. Mendukung QRIS, GoPay, ShopeePay, Transfer Bank (Virtual Account), dan Kartu Kredit.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="glass-card rounded-[24px] p-6 border space-y-6">
              <h3 className="text-xl font-semibold">Ringkasan Pembayaran</h3>
              <div className="space-y-3 text-sm border-b pb-4">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal Produk</span><span className="font-medium">{formatIDR(productSubtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Ongkos Kirim</span><span className="font-medium">{activeCourier?.isPromo ? "Gratis" : formatIDR(shippingFee)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Biaya Layanan & Admin</span><span className="font-medium">{formatIDR(2000)}</span></div>
              </div>
              <div className="flex justify-between items-center text-lg font-bold"><span>Total</span><span className="text-xl text-primary">{formatIDR(grandTotal)}</span></div>
              <button onClick={handlePlaceOrder} disabled={loading || checkoutItems.length === 0} className="w-full rounded-2xl bg-primary text-primary-foreground py-4 text-base font-bold shadow-lg flex items-center justify-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Buat Pesanan"}
              </button>
            </div>
          </div>
        </div>
      </Container>

      {/* MODAL UBAH ALAMAT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[24px] border bg-background p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><MapPin size={18} className="text-primary" /> Ubah Alamat Tujuan</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-muted-foreground"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Nama Penerima</label>
                  <input type="text" required value={formAddress.name} onChange={(e) => setFormAddress({ ...formAddress, name: e.target.value })} className="w-full rounded-xl border bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">No. Telepon</label>
                  <input type="text" required value={formAddress.phone} onChange={(e) => setFormAddress({ ...formAddress, phone: e.target.value })} className="w-full rounded-xl border bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Label Alamat</label>
                <input type="text" required value={formAddress.label} onChange={(e) => setFormAddress({ ...formAddress, label: e.target.value })} className="w-full rounded-xl border bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Alamat Lengkap</label>
                <textarea required rows={3} value={formAddress.fullAddress} onChange={(e) => setFormAddress({ ...formAddress, fullAddress: e.target.value })} className="w-full rounded-xl border bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none resize-none" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Kota & Provinsi</label>
                  <input type="text" required value={formAddress.city} onChange={(e) => setFormAddress({ ...formAddress, city: e.target.value })} className="w-full rounded-xl border bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Kode Pos</label>
                  <input type="text" required value={formAddress.postalCode} onChange={(e) => setFormAddress({ ...formAddress, postalCode: e.target.value })} className="w-full rounded-xl border bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold border rounded-xl text-muted-foreground">Batal</button>
                <button type="submit" className="px-5 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-xl shadow-md">Simpan Alamat Tujuan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}