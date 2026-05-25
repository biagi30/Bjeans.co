"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface OrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  user?: {
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingAddress?: string;
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const orderId = params.id;

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.data);
          setError(null);
        } else {
          setError(data.message || "Order not found");
        }
      } catch (err) {
        setError("Failed to load order");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Memuat detail pesanan...</span>
      </div>
    );
  }
  if (error || !order) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-red-500">{error || "Order not found"}</p>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg mt-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-4">Detail Pesanan #{order._id.substring(order._id.length - 6).toUpperCase()}</h2>
      <div className="mb-6">
        <p className="font-semibold">Status: <span className="uppercase">{order.status}</span></p>
        <p>Tanggal Pesan: {new Date(order.createdAt).toLocaleDateString()}</p>
        <p>Nama Pemesan: {order.user?.name || "Guest User"}</p>
        <p>Email: {order.user?.email || "-"}</p>
        <p>Alamat Pengiriman: {order.shippingAddress || "-"}</p>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Daftar Item</h3>
        <ul className="divide-y">
          {order.items.map((item, idx) => (
            <li key={idx} className="py-2 flex justify-between">
              <span>{item.quantity}x {item.product?.name || "-"}</span>
              <span>Rp{(item.price * item.quantity).toLocaleString('id-ID')}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="text-right font-bold text-lg">
        Total: Rp{order.totalAmount?.toLocaleString('id-ID')}
      </div>
    </motion.div>
  );
}
