"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  ShoppingBag,
  Scissors,
  CheckCircle2,
  Clock,
  Truck,
  Activity,
  AlertCircle,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { getThemeColors } from "@/app/admin/theme";
import { ThemeToggle } from "@/core/components/shared/ThemeToggle";
import { useToast } from "@/core/context/ToastContext";

interface OrderItem {
  itemType: "retail" | "custom";
  product?: {
    _id: string;
    name: string;
    price: number;
  } | null;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customSpec?: any;
}

interface Order {
  _id: string;
  orderNumber?: string;
  orderType?: "unified" | "retail" | "custom";
  type?: "retail" | "custom";
  parentOrder?: {
    _id: string;
    orderNumber?: string;
  } | string | null;
  customer?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: "waiting_payment" | "processing" | "done" | "shipped";
  paymentStatus?: "unpaid" | "paid" | "refunded";
  createdAt: string;
  shippingAddress?: string;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const { id: orderId } = useParams<{ id: string }>();
  const toast = useToast();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const [order, setOrder] = useState<Order | null>(null);
  const [splits, setSplits] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSplits, setLoadingSplits] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const neumorph = {
    boxShadow: theme === "dark"
      ? "8px 8px 16px rgba(0, 0, 0, 0.5), -8px -8px 16px rgba(255, 255, 255, 0.05)"
      : "8px 8px 16px rgba(0, 0, 0, 0.15), -8px -8px 16px rgba(255, 255, 255, 1)"
  };

  const neumorphInset = {
    boxShadow: theme === "dark"
      ? "inset 6px 6px 12px rgba(0, 0, 0, 0.5), inset -6px -6px 12px rgba(255, 255, 255, 0.05)"
      : "inset 6px 6px 12px rgba(0, 0, 0, 0.1), inset -6px -6px 12px rgba(255, 255, 255, 1)"
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        setError(null);
        
        // If it's a unified order, fetch its child split orders
        if (data.data.orderType === "unified") {
          fetchSplits(data.data._id);
        }
      } else {
        setError(data.message || "Order not found");
      }
    } catch (err) {
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const fetchSplits = async (id: string) => {
    try {
      setLoadingSplits(true);
      const res = await fetch(`/api/orders/${id}/splits`);
      const data = await res.json();
      if (data.success) {
        setSplits(data.data);
      }
    } catch (err) {
      console.error("Failed to load split orders", err);
    } finally {
      setLoadingSplits(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    try {
      setUpdatingStatus(true);
      const res = await fetch(`/api/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        toast.success(`Order status updated to ${newStatus.toUpperCase()}`);
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Network error updating status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePaymentStatusChange = async (newPaymentStatus: string) => {
    if (!order) return;
    try {
      setUpdatingPayment(true);
      const res = await fetch(`/api/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        toast.success(`Payment status updated to ${newPaymentStatus.toUpperCase()}`);
      } else {
        toast.error(data.message || "Failed to update payment status");
      }
    } catch (err) {
      toast.error("Network error updating payment status");
    } finally {
      setUpdatingPayment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting_payment":
        return "#F59E0B";
      case "processing":
        return "#3B82F6";
      case "shipped":
        return "#8B5CF6";
      case "done":
        return "#10B981";
      default:
        return "#64748B";
    }
  };

  const getStatusLabel = (status: string, type?: string) => {
    switch (status) {
      case "waiting_payment":
        return "WAITING PAYMENT";
      case "processing":
        return type === "custom" ? "IN PRODUCTION" : "PROCESSING";
      case "shipped":
        return type === "custom" ? "READY FOR PICKUP" : "SHIPPED";
      case "done":
        return type === "custom" ? "COMPLETED" : "DONE";
      default:
        return status ? status.toUpperCase() : "UNKNOWN";
    }
  };

  const getPaymentColor = (status?: string) => {
    switch (status) {
      case "unpaid":
        return "#EF4444";
      case "paid":
        return "#10B981";
      case "refunded":
        return "#F59E0B";
      default:
        return "#64748B";
    }
  };

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-3"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span
          className="text-lg font-medium"
          style={{ fontFamily: "var(--font-space), sans-serif" }}
        >
          Memuat detail pesanan...
        </span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen p-8 text-center"
        style={{ backgroundColor: colors.bg }}
      >
        <AlertCircle className="h-16 w-16 text-red-500 mb-4 animate-pulse" />
        <p className="text-xl font-bold mb-4" style={{ color: colors.text }}>
          {error || "Order not found"}
        </p>
        <motion.button
          onClick={() => router.push("/admin/orders")}
          className="px-6 py-3 rounded-xl flex items-center gap-2 font-semibold text-sm"
          style={{
            backgroundColor: colors.bgSecondary,
            color: colors.text,
            ...neumorph
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={16} /> KEMBALI KE DAFTAR PESANAN
        </motion.button>
      </div>
    );
  }

  const isCustomOrder = order.orderType === "custom" || order.type === "custom";
  const parentOrderObj = typeof order.parentOrder === "object" ? order.parentOrder : null;
  const parentOrderId = typeof order.parentOrder === "string" ? order.parentOrder : parentOrderObj?._id;

  return (
    <motion.div
      className="min-h-screen pb-16"
      style={{ backgroundColor: colors.bg }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <header className="border-b" style={{ borderColor: colors.border }}>
        <div className="px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => {
                  if (isCustomOrder) {
                    router.push("/admin/custom-orders");
                  } else {
                    router.push("/admin/orders");
                  }
                }}
                style={{ color: colors.text }}
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeft size={24} />
              </motion.button>
              <div>
                <motion.h1
                  className="text-3xl tracking-tight uppercase"
                  style={{
                    fontFamily: "var(--font-outfit), sans-serif",
                    color: colors.text
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  Detail Pesanan
                </motion.h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="px-8 py-10 max-w-[1400px] mx-auto">
        {/* Child split order warning banner or Parent Order Link */}
        {order.parentOrder && (
          <motion.div
            className="mb-8 p-4 rounded-2xl flex items-center justify-between border"
            style={{
              backgroundColor: `${colors.accent}10`,
              borderColor: `${colors.accent}30`
            }}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="flex items-center gap-3">
              <Activity size={20} className="text-primary animate-pulse" />
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  style={{ fontFamily: "var(--font-space), sans-serif" }}
                >
                  Split Order
                </p>
                <p className="text-sm font-medium" style={{ color: colors.text }}>
                  Pesanan ini dipisahkan dari Pesanan Gabungan (Unified Order).
                </p>
              </div>
            </div>
            <motion.button
              onClick={() => router.push(`/admin/orders/${parentOrderId}`)}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
              style={{
                backgroundColor: colors.bgSecondary,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                ...neumorph
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Lihat Pesanan Induk
            </motion.button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Main Section (2 Columns equivalent) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Overview / Card details */}
            <motion.div
              className="p-8 rounded-2xl"
              style={{
                backgroundColor: colors.bgSecondary,
                ...neumorph
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-6 mb-6 gap-4" style={{ borderColor: colors.border }}>
                <div>
                  <h2
                    className="text-2xl font-bold mb-1"
                    style={{
                      fontFamily: "var(--font-outfit), sans-serif",
                      color: colors.text
                    }}
                  >
                    {order.orderNumber || `#${order._id.substring(order._id.length - 6).toUpperCase()}`}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {new Date(order.createdAt).toLocaleString("id-ID")}
                    </span>
                    <span>•</span>
                    <span className="uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: `${colors.accent}15`, color: colors.accent }}>
                      TIPE: {order.orderType || order.type || "retail"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <span
                    className="px-4 py-2 rounded-full text-xs font-bold text-center tracking-wider"
                    style={{
                      backgroundColor: `${getStatusColor(order.status)}15`,
                      color: getStatusColor(order.status),
                      border: `1px solid ${getStatusColor(order.status)}40`
                    }}
                  >
                    {getStatusLabel(order.status, order.type)}
                  </span>
                  <span
                    className="px-4 py-2 rounded-full text-xs font-bold text-center tracking-wider"
                    style={{
                      backgroundColor: `${getPaymentColor(order.paymentStatus)}15`,
                      color: getPaymentColor(order.paymentStatus),
                      border: `1px solid ${getPaymentColor(order.paymentStatus)}40`
                    }}
                  >
                    PEMBAYARAN: {(order.paymentStatus || "unpaid").toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Update Controls */}
              <div className="space-y-6">
                <div>
                  <h4
                    className="text-xs font-bold uppercase tracking-wider mb-3 text-muted-foreground"
                    style={{ fontFamily: "var(--font-space), sans-serif" }}
                  >
                    Perbarui Status Pesanan
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { key: "waiting_payment", label: "Menunggu Pembayaran", icon: Clock },
                      { key: "processing", label: isCustomOrder ? "Produksi" : "Diproses", icon: Scissors },
                      { key: "shipped", label: isCustomOrder ? "Siap / Kirim" : "Dikirim", icon: Truck },
                      { key: "done", label: "Selesai", icon: CheckCircle2 }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = order.status === item.key;
                      return (
                        <motion.button
                          key={item.key}
                          onClick={() => handleStatusChange(item.key)}
                          disabled={updatingStatus}
                          className="p-3 rounded-xl border flex flex-col items-center justify-center gap-2 text-center text-xs font-bold transition-all"
                          style={{
                            backgroundColor: isActive ? `${getStatusColor(item.key)}15` : colors.bg,
                            color: isActive ? getStatusColor(item.key) : colors.textSecondary,
                            borderColor: isActive ? getStatusColor(item.key) : colors.border,
                            cursor: updatingStatus ? "not-allowed" : "pointer"
                          }}
                          whileHover={updatingStatus ? {} : { scale: 1.03, y: -2 }}
                          whileTap={updatingStatus ? {} : { scale: 0.97 }}
                        >
                          <Icon size={18} />
                          {item.label.toUpperCase()}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t pt-5" style={{ borderColor: colors.border }}>
                  <h4
                    className="text-xs font-bold uppercase tracking-wider mb-3 text-muted-foreground"
                    style={{ fontFamily: "var(--font-space), sans-serif" }}
                  >
                    Perbarui Status Pembayaran
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { key: "unpaid", label: "Belum Bayar", color: "#EF4444" },
                      { key: "paid", label: "Sudah Bayar", color: "#10B981" },
                      { key: "refunded", label: "Refund", color: "#F59E0B" }
                    ].map((item) => {
                      const isActive = order.paymentStatus === item.key;
                      return (
                        <motion.button
                          key={item.key}
                          onClick={() => handlePaymentStatusChange(item.key)}
                          disabled={updatingPayment}
                          className="px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all"
                          style={{
                            backgroundColor: isActive ? `${item.color}15` : colors.bg,
                            color: isActive ? item.color : colors.textSecondary,
                            borderColor: isActive ? item.color : colors.border,
                            cursor: updatingPayment ? "not-allowed" : "pointer"
                          }}
                          whileHover={updatingPayment ? {} : { scale: 1.03 }}
                          whileTap={updatingPayment ? {} : { scale: 0.97 }}
                        >
                          {item.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Items Card */}
            <motion.div
              className="p-8 rounded-2xl"
              style={{
                backgroundColor: colors.bgSecondary,
                ...neumorph
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="flex items-center gap-2 border-b pb-4 mb-6" style={{ borderColor: colors.border }}>
                <ShoppingBag size={20} className="text-primary" />
                <h3
                  className="text-lg font-bold"
                  style={{
                    fontFamily: "var(--font-outfit), sans-serif",
                    color: colors.text
                  }}
                >
                  Daftar Item Pesanan ({order.items.length})
                </h3>
              </div>

              <div className="divide-y" style={{ borderColor: colors.border }}>
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-6 first:pt-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {item.itemType === "custom" ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/30">
                              <Scissors size={10} /> CUSTOM
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-sky-500/10 text-sky-400 rounded-full border border-sky-500/30">
                              <ShoppingBag size={10} /> RETAIL
                            </span>
                          )}
                          <span className="text-sm font-semibold text-muted-foreground">
                            {item.quantity}x
                          </span>
                        </div>
                        <h4 className="text-base font-bold" style={{ color: colors.text }}>
                          {item.name || item.product?.name || "Premium Denim Product"}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Harga Satuan: Rp{item.unitPrice.toLocaleString("id-ID")}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-base font-extrabold" style={{ color: colors.text }}>
                          Rp{item.totalPrice.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>

                    {/* Custom Specifications detailing */}
                    {item.itemType === "custom" && item.customSpec && (
                      <div
                        className="mt-4 p-5 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 border"
                        style={{
                          backgroundColor: colors.bg,
                          borderColor: colors.border
                        }}
                      >
                        <div className="space-y-2.5">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Pilihan Bahan & Model
                          </p>
                          <div className="flex justify-between border-b pb-1.5" style={{ borderColor: `${colors.border}50` }}>
                            <span className="text-xs text-muted-foreground">Bahan Kain:</span>
                            <span className="text-xs font-bold" style={{ color: colors.text }}>
                              {item.customSpec.fabricName || "-"}
                            </span>
                          </div>
                          {item.customSpec.fabricWeight && (
                            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: `${colors.border}50` }}>
                              <span className="text-xs text-muted-foreground">Ketebalan:</span>
                              <span className="text-xs font-bold" style={{ color: colors.text }}>
                                {item.customSpec.fabricWeight}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between border-b pb-1.5" style={{ borderColor: `${colors.border}50` }}>
                            <span className="text-xs text-muted-foreground">Potongan Fit:</span>
                            <span className="text-xs font-bold" style={{ color: colors.text }}>
                              {item.customSpec.fitName || "-"}
                            </span>
                          </div>
                          {item.customSpec.sizeMode && (
                            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: `${colors.border}50` }}>
                              <span className="text-xs text-muted-foreground">Sistem Ukuran:</span>
                              <span className="text-xs font-bold capitalize" style={{ color: colors.text }}>
                                {item.customSpec.sizeMode}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2.5">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Ukuran Custom (Inci)
                          </p>
                          {item.customSpec.sizing ? (
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                              {Object.entries(item.customSpec.sizing).map(([key, val]) => {
                                if (key === "notes" || typeof val === "object" || typeof val === "function") return null;
                                return (
                                  <div key={key} className="flex justify-between border-b pb-1" style={{ borderColor: `${colors.border}30` }}>
                                    <span className="text-xs text-muted-foreground capitalize">{key}:</span>
                                    <span className="text-xs font-bold" style={{ color: colors.text }}>
                                      {String(val)}"
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">
                              Profil ukuran tidak dilampirkan secara detail
                            </p>
                          )}
                        </div>

                        {/* Custom Spec Notes */}
                        {(item.customSpec.notes || item.customSpec.sizing?.notes) && (
                          <div className="col-span-1 md:col-span-2 pt-2 border-t" style={{ borderColor: `${colors.border}50` }}>
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                              Catatan Tambahan
                            </p>
                            <p className="text-xs italic text-muted-foreground">
                              "{item.customSpec.notes || item.customSpec.sizing?.notes}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Total Amount Footer */}
              <div className="mt-8 pt-6 border-t flex justify-between items-center" style={{ borderColor: colors.border }}>
                <span className="text-base font-bold text-muted-foreground" style={{ fontFamily: "var(--font-space), sans-serif" }}>
                  TOTAL PEMBAYARAN
                </span>
                <span
                  className="text-3xl font-extrabold tracking-tight"
                  style={{
                    fontFamily: "var(--font-outfit), sans-serif",
                    color: colors.accent
                  }}
                >
                  Rp{order.totalAmount.toLocaleString("id-ID")}
                </span>
              </div>
            </motion.div>

            {/* Split Orders List (if Parent Unified Order) */}
            {order.orderType === "unified" && (
              <motion.div
                className="p-8 rounded-2xl"
                style={{
                  backgroundColor: colors.bgSecondary,
                  ...neumorph
                }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <div className="flex items-center gap-2 border-b pb-4 mb-6" style={{ borderColor: colors.border }}>
                  <FileText size={20} className="text-primary" />
                  <h3
                    className="text-lg font-bold"
                    style={{
                      fontFamily: "var(--font-outfit), sans-serif",
                      color: colors.text
                    }}
                  >
                    Daftar Pesanan Pecahan (Splits)
                  </h3>
                </div>

                {loadingSplits ? (
                  <div className="flex justify-center items-center py-6 gap-2 text-sm text-muted-foreground">
                    <Loader2 className="animate-spin" size={16} /> Memuat list pecahan...
                  </div>
                ) : splits.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Tidak ada pecahan pesanan yang terdaftar.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {splits.map((split) => {
                      const splitType = split.orderType || split.type || "retail";
                      return (
                        <div
                          key={split._id}
                          className="p-4 rounded-xl border flex flex-col justify-between"
                          style={{
                            backgroundColor: colors.bg,
                            borderColor: colors.border
                          }}
                        >
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-primary">
                                #{split.orderNumber || split._id.substring(split._id.length - 6).toUpperCase()}
                              </span>
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                                style={{
                                  backgroundColor: splitType === "custom" ? "rgba(99, 102, 241, 0.15)" : "rgba(14, 165, 233, 0.15)",
                                  color: splitType === "custom" ? "#818CF8" : "#38BDF8"
                                }}
                              >
                                {splitType}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center text-xs mb-3">
                              <span className="text-muted-foreground">Status:</span>
                              <span className="font-bold" style={{ color: getStatusColor(split.status) }}>
                                {getStatusLabel(split.status, splitType)}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center text-xs mb-4">
                              <span className="text-muted-foreground">Jumlah:</span>
                              <span className="font-bold text-foreground">
                                Rp{split.totalAmount.toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>

                          <motion.button
                            onClick={() => router.push(`/admin/orders/${split._id}`)}
                            className="w-full py-2 rounded-lg text-xs font-semibold text-center border"
                            style={{
                              backgroundColor: colors.bgSecondary,
                              borderColor: colors.border,
                              color: colors.text
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            LIHAT DETAIL PECAHAN
                          </motion.button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

          </div>

          {/* Right Column (Sidebar details) */}
          <div className="space-y-8">
            
            {/* Customer Information */}
            <motion.div
              className="p-8 rounded-2xl"
              style={{
                backgroundColor: colors.bgSecondary,
                ...neumorph
              }}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <div className="flex items-center gap-2 border-b pb-4 mb-6" style={{ borderColor: colors.border }}>
                <User size={18} className="text-primary" />
                <h3
                  className="text-lg font-bold"
                  style={{
                    fontFamily: "var(--font-outfit), sans-serif",
                    color: colors.text
                  }}
                >
                  Informasi Pelanggan
                </h3>
              </div>

              {order.customer ? (
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Nama Lengkap</p>
                    <p className="font-semibold" style={{ color: colors.text }}>{order.customer.name}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Alamat Email</p>
                    <p className="font-medium flex items-center gap-1.5" style={{ color: colors.text }}>
                      <Mail size={14} className="text-muted-foreground" /> {order.customer.email}
                    </p>
                  </div>

                  {order.customer.phone && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Nomor Telepon</p>
                      <p className="font-medium flex items-center gap-1.5" style={{ color: colors.text }}>
                        <Phone size={14} className="text-muted-foreground" /> {order.customer.phone}
                      </p>
                    </div>
                  )}

                  {order.customer.address && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Alamat Akun</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {order.customer.address}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Informasi pengguna tidak tersedia (Guest User)
                </p>
              )}
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              className="p-8 rounded-2xl"
              style={{
                backgroundColor: colors.bgSecondary,
                ...neumorph
              }}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <div className="flex items-center gap-2 border-b pb-4 mb-6" style={{ borderColor: colors.border }}>
                <MapPin size={18} className="text-primary" />
                <h3
                  className="text-lg font-bold"
                  style={{
                    fontFamily: "var(--font-outfit), sans-serif",
                    color: colors.text
                  }}
                >
                  Alamat Pengiriman
                </h3>
              </div>

              <div className="space-y-2">
                <p className="text-sm leading-relaxed" style={{ color: colors.text }}>
                  {order.shippingAddress || "Alamat pengiriman tidak disediakan."}
                </p>
              </div>
            </motion.div>

            {/* Admin Audit Logs placeholder or notes */}
            <motion.div
              className="p-8 rounded-2xl border border-dashed"
              style={{
                backgroundColor: `${colors.bgSecondary}50`,
                borderColor: colors.border
              }}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colors.text }}>
                Catatan Admin
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Setiap perubahan status atau pembayaran pada pesanan ini akan langsung disinkronkan ke pelanggan dan terintegrasi dengan pemisah pesanan (order splitting) di backend.
              </p>
            </motion.div>

          </div>
        </div>
      </main>
    </motion.div>
  );
}

