"use client";

import { ShoppingBag, ArrowLeft, Eye, Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { getThemeColors } from '../theme';
import { ThemeToggle } from '@/core/components/shared/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/core/context/ToastContext';

interface OrderItem {
  itemType: 'retail' | 'custom';
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
  customer?: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: 'waiting_payment' | 'processing' | 'done' | 'shipped';
  paymentStatus?: 'unpaid' | 'paid' | 'refunded';
  createdAt: string;
  shippingAddress?: string;
  type?: 'retail' | 'custom';
  orderType?: 'unified' | 'retail' | 'custom';
}

export default function AdminOrders() {
  const router = useRouter();
  const toast = useToast();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusTab, setStatusTab] = useState('all');
  const [mounted, setMounted] = useState(false);

  const neumorph = {
    boxShadow: `
      ${theme === 'dark'
        ? '8px 8px 16px rgba(0, 0, 0, 0.5), -8px -8px 16px rgba(255, 255, 255, 0.05)'
        : '8px 8px 16px rgba(0, 0, 0, 0.15), -8px -8px 16px rgba(255, 255, 255, 1)'
      }
    `
  };

  const neumorphInset = {
    boxShadow: `
      ${theme === 'dark'
        ? 'inset 6px 6px 12px rgba(0, 0, 0, 0.5), inset -6px -6px 12px rgba(255, 255, 255, 0.05)'
        : 'inset 6px 6px 12px rgba(0, 0, 0, 0.1), inset -6px -6px 12px rgba(255, 255, 255, 1)'
      }
    `
  };

  useEffect(() => {
    setMounted(true);
    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        // Filter for retail orders only (or assume all are retail if type is not custom)
        const retailOrders = data.data.filter((o: Order) => o.type !== 'custom');
        setOrders(retailOrders);
      }
    } catch (err) {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting_payment':
        return '#F59E0B';
      case 'processing':
        return '#3B82F6';
      case 'shipped':
        return '#8B5CF6';
      case 'done':
        return '#10B981';
      default:
        return '#64748B';
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'unpaid': return '#EF4444';
      case 'paid': return '#10B981';
      case 'refunded': return '#F59E0B';
      default: return '#64748B';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'waiting_payment': return 'WAITING PAYMENT';
      case 'processing': return 'PROCESSING';
      case 'shipped': return 'SHIPPED';
      case 'done': return 'DONE';
      default: return status ? status.toUpperCase() : 'UNKNOWN';
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map(order =>
          order._id === orderId ? { ...order, status: newStatus as any } : order
        ));
        toast.success(`Order status updated to ${newStatus}`);
        setSelectedOrder(null);
      } else {
        toast.error(data.message || 'Failed to update order');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pesanan ini secara permanen? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.filter(order => order._id !== orderId));
        toast.success("Pesanan berhasil dihapus");
        setSelectedOrder(null);
      } else {
        toast.error(data.message || 'Gagal menghapus pesanan');
      }
    } catch (err) {
      toast.error('Gagal menghubungi server');
    }
  };

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const sortedFilteredOrders = [...orders]
    .filter(order => {
      // 1. Status Tab Filter
      if (statusTab === 'unpaid' && order.status !== 'waiting_payment') {
        return false;
      }
      if (statusTab === 'processing' && order.status !== 'processing' && order.status !== 'shipped') {
        return false;
      }
      if (statusTab === 'completed' && order.status !== 'done') {
        return false;
      }

      // 2. Date Filter
      if (dateFilter === 'today' && !isToday(order.createdAt)) {
        return false;
      }

      // 3. Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = order._id.toLowerCase().includes(q) || 
                        (order.orderNumber && order.orderNumber.toLowerCase().includes(q)) ||
                        `#${order._id.substring(order._id.length - 6)}`.toLowerCase().includes(q);
        const nameMatch = order.customer?.name?.toLowerCase().includes(q);
        const emailMatch = order.customer?.email?.toLowerCase().includes(q);
        return idMatch || nameMatch || emailMatch;
      }

      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const todayOrders = sortedFilteredOrders.filter(order => isToday(order.createdAt));
  const olderOrders = sortedFilteredOrders.filter(order => !isToday(order.createdAt));

  const renderOrdersTable = (ordersList: Order[], title: string, initialDelay: number = 0.5) => {
    return (
      <div className="space-y-4">
        <h2 
          className="text-lg tracking-wider uppercase font-semibold pl-2"
          style={{
            fontFamily: 'var(--font-space), sans-serif',
            color: colors.text
          }}
        >
          {title} ({ordersList.length})
        </h2>
        <motion.div
          className="rounded-2xl overflow-x-auto"
          style={{
            backgroundColor: colors.bgSecondary,
            ...neumorph
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: initialDelay }}
        >
          <table className="w-full min-w-[900px]">
            <thead style={{ backgroundColor: colors.bg }}>
              <tr>
                <th
                  className="px-6 py-4 text-left"
                  style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontWeight: 800,
                    fontSize: '13px',
                    letterSpacing: '0.5px',
                    color: colors.text
                  }}
                >
                  ORDER ID
                </th>
                <th
                  className="px-6 py-4 text-left"
                  style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontWeight: 800,
                    fontSize: '13px',
                    letterSpacing: '0.5px',
                    color: colors.text
                  }}
                >
                  CUSTOMER
                </th>
                <th
                  className="px-6 py-4 text-left"
                  style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontWeight: 800,
                    fontSize: '13px',
                    letterSpacing: '0.5px',
                    color: colors.text
                  }}
                >
                  DATE
                </th>
                <th
                  className="px-6 py-4 text-left"
                  style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontWeight: 800,
                    fontSize: '13px',
                    letterSpacing: '0.5px',
                    color: colors.text
                  }}
                >
                  ITEMS
                </th>
                <th
                  className="px-6 py-4 text-left"
                  style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontWeight: 800,
                    fontSize: '13px',
                    letterSpacing: '0.5px',
                    color: colors.text
                  }}
                >
                  TOTAL
                </th>
                <th
                  className="px-6 py-4 text-left"
                  style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontWeight: 800,
                    fontSize: '13px',
                    letterSpacing: '0.5px',
                    color: colors.text
                  }}
                >
                  STATUS
                </th>
                <th
                  className="px-6 py-4 text-left"
                  style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontWeight: 800,
                    fontSize: '13px',
                    letterSpacing: '0.5px',
                    color: colors.text
                  }}
                >
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {ordersList.map((order, index) => (
                <motion.tr
                  key={order._id}
                  style={{
                    borderTop: `1px solid ${colors.border}`
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: initialDelay + index * 0.05 }}
                  whileHover={{ backgroundColor: `${colors.bg}80` }}
                >
                  <td
                    className="px-6 py-4"
                    style={{
                      fontFamily: 'var(--font-space), sans-serif',
                      fontWeight: 700,
                      fontSize: '14px',
                      color: colors.text
                    }}
                  >
                    {order.orderNumber || `#${order._id.substring(order._id.length - 6).toUpperCase()}`}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p
                        style={{
                          fontFamily: 'var(--font-space), sans-serif',
                          fontWeight: 600,
                          fontSize: '14px',
                          color: colors.text
                        }}
                      >
                        {order.customer?.name || "Guest User"}
                      </p>
                      <p
                        style={{
                          fontFamily: 'var(--font-space), sans-serif',
                          fontWeight: 500,
                          fontSize: '12px',
                          color: colors.textSecondary
                        }}
                      >
                        {order.customer?.email || "No email"}
                      </p>
                    </div>
                  </td>
                  <td
                    className="px-6 py-4"
                    style={{
                      fontFamily: 'var(--font-space), sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      color: colors.textSecondary
                    }}
                  >
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td
                    className="px-6 py-4"
                    style={{
                      fontFamily: 'var(--font-space), sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: colors.text
                    }}
                  >
                    {order.items?.length || 0} items
                  </td>
                  <td
                    className="px-6 py-4"
                    style={{
                      fontFamily: 'var(--font-space), sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: colors.text
                    }}
                  >
                    Rp{order.totalAmount?.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs tracking-wider"
                      style={{
                        fontFamily: 'var(--font-space), sans-serif',
                        fontWeight: 700,
                        backgroundColor: `${getStatusColor(order.status)}20`,
                        color: getStatusColor(order.status)
                      }}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <motion.button
                      onClick={() => setSelectedOrder(order)}
                      style={{ color: colors.accent }}
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Eye size={18} />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    );
  };

  if (!mounted) return null;

  return (
    <motion.div
      className="min-h-screen"
      style={{ backgroundColor: colors.bg }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <header className="border-b" style={{ borderColor: colors.border }}>
        <div className="px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => router.push('/admin/dashboard')}
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
                    fontFamily: 'var(--font-outfit), sans-serif',
                    color: colors.text
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Retail Orders
                </motion.h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-12">
        <div className="max-w-[1800px] mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              className="rounded-2xl p-6"
              style={{
                backgroundColor: colors.bgSecondary,
                ...neumorph
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -4 }}
            >
              <p
                className="mb-2"
                style={{
                  fontFamily: 'var(--font-space), sans-serif',
                  fontWeight: 600,
                  fontSize: '13px',
                  letterSpacing: '0.5px',
                  color: colors.textSecondary
                }}
              >
                TOTAL ORDERS
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-outfit), sans-serif',
                  fontSize: '32px',
                  color: colors.text
                }}
              >
                {orders.length}
              </p>
            </motion.div>

            <motion.div
              className="rounded-2xl p-6"
              style={{
                backgroundColor: colors.bgSecondary,
                ...neumorph
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              whileHover={{ y: -4 }}
            >
              <p
                className="mb-2"
                style={{
                  fontFamily: 'var(--font-space), sans-serif',
                  fontWeight: 600,
                  fontSize: '13px',
                  letterSpacing: '0.5px',
                  color: colors.textSecondary
                }}
              >
                WAITING PAYMENT
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-outfit), sans-serif',
                  fontSize: '32px',
                  color: '#F59E0B'
                }}
              >
                {orders.filter(o => o.status === 'waiting_payment').length}
              </p>
            </motion.div>

            <motion.div
              className="rounded-2xl p-6"
              style={{
                backgroundColor: colors.bgSecondary,
                ...neumorph
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -4 }}
            >
              <p
                className="mb-2"
                style={{
                  fontFamily: 'var(--font-space), sans-serif',
                  fontWeight: 600,
                  fontSize: '13px',
                  letterSpacing: '0.5px',
                  color: colors.textSecondary
                }}
              >
                PROCESSING
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-outfit), sans-serif',
                  fontSize: '32px',
                  color: colors.accent
                }}
              >
                {orders.filter(o => o.status === 'processing').length}
              </p>
            </motion.div>

            <motion.div
              className="rounded-2xl p-6"
              style={{
                backgroundColor: colors.bgSecondary,
                ...neumorph
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              whileHover={{ y: -4 }}
            >
              <p
                className="mb-2"
                style={{
                  fontFamily: 'var(--font-space), sans-serif',
                  fontWeight: 600,
                  fontSize: '13px',
                  letterSpacing: '0.5px',
                  color: colors.textSecondary
                }}
              >
                DONE
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-outfit), sans-serif',
                  fontSize: '32px',
                  color: '#10B981'
                }}
              >
                {orders.filter(o => o.status === 'done').length}
              </p>
            </motion.div>
          </div>

          {/* Controls Panel */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8 items-stretch justify-between">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan Order ID, nama, atau email..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none transition-all duration-300 border-none"
                style={{
                  fontFamily: 'var(--font-space), sans-serif',
                  fontSize: '14px',
                  backgroundColor: colors.bgSecondary,
                  color: colors.text,
                  ...neumorphInset
                }}
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2"
                size={20}
                style={{ color: colors.textSecondary }}
              />
            </div>

            {/* Date Filters */}
            <div 
              className="flex items-center p-1.5 rounded-2xl gap-1 overflow-x-auto"
              style={{
                backgroundColor: colors.bgSecondary,
                ...neumorph
              }}
            >
              {[
                { id: 'all', label: 'SEMUA TANGGAL' },
                { id: 'today', label: 'HARI INI' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setDateFilter(filter.id)}
                  className="px-4 py-2.5 rounded-xl text-xs tracking-wider transition-all duration-300 font-bold uppercase whitespace-nowrap"
                  style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    backgroundColor: dateFilter === filter.id ? colors.accent : 'transparent',
                    color: dateFilter === filter.id ? '#ffffff' : colors.textSecondary,
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex border-b mb-8 gap-8 overflow-x-auto" style={{ borderColor: colors.border }}>
            {[
              { id: 'all', label: 'Semua Pesanan', count: orders.length },
              { id: 'unpaid', label: 'Belum Bayar', count: orders.filter(o => o.status === 'waiting_payment').length },
              { id: 'processing', label: 'Sedang Diproses', count: orders.filter(o => o.status === 'processing' || o.status === 'shipped').length },
              { id: 'completed', label: 'Selesai', count: orders.filter(o => o.status === 'done').length }
            ].map((tab) => {
              const isActive = statusTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusTab(tab.id)}
                  className="pb-4 relative text-sm tracking-wider font-semibold uppercase flex items-center gap-2 transition-all duration-300 whitespace-nowrap"
                  style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    color: isActive ? colors.accent : colors.textSecondary,
                  }}
                >
                  {tab.label}
                  <span 
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold transition-all duration-300"
                    style={{
                      backgroundColor: isActive ? `${colors.accent}20` : `${colors.border}`,
                      color: isActive ? colors.accent : colors.textSecondary,
                    }}
                  >
                    {tab.count}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: colors.accent }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="p-12 flex justify-center items-center gap-3 text-muted-foreground">
              <Loader2 className="animate-spin" /> Loading orders...
            </div>
          ) : sortedFilteredOrders.length === 0 ? (
            <motion.div
              className="text-center py-16 px-4 rounded-2xl"
              style={{
                backgroundColor: colors.bgSecondary,
                ...neumorph
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ShoppingBag className="mx-auto mb-4 opacity-40" size={48} style={{ color: colors.textSecondary }} />
              <p
                style={{
                  fontFamily: 'var(--font-space), sans-serif',
                  fontWeight: 600,
                  fontSize: '16px',
                  color: colors.text
                }}
              >
                Tidak ada pesanan yang cocok
              </p>
              <p
                className="mt-1 text-sm"
                style={{
                  fontFamily: 'var(--font-space), sans-serif',
                  color: colors.textSecondary
                }}
              >
                Coba gunakan kata kunci lain atau ubah filter Anda.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-12">
              {todayOrders.length > 0 && renderOrdersTable(todayOrders, "PESANAN HARI INI", 0.3)}
              {olderOrders.length > 0 && renderOrdersTable(olderOrders, "PESANAN SEBELUMNYA", 0.4)}
            </div>
          )}
        </div>
      </main>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => setSelectedOrder(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="max-w-2xl w-full mx-auto p-8 rounded-2xl max-h-[90vh] overflow-y-auto"
              style={{
                backgroundColor: colors.bgSecondary,
                ...neumorph
              }}
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <motion.h3
                  style={{
                    fontFamily: 'var(--font-outfit), sans-serif',
                    fontSize: '24px',
                    color: colors.text
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  ORDER #{selectedOrder._id.substring(selectedOrder._id.length - 6).toUpperCase()}
                </motion.h3>
                <motion.span
                  className="px-4 py-2 rounded-full"
                  style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontWeight: 700,
                    fontSize: '12px',
                    letterSpacing: '0.5px',
                    backgroundColor: `${getStatusColor(selectedOrder.status)}20`,
                    color: getStatusColor(selectedOrder.status)
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  {getStatusLabel(selectedOrder.status)}
                </motion.span>
              </div>

            <div className="space-y-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <p
                  className="mb-2"
                  style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontWeight: 700,
                    fontSize: '13px',
                    letterSpacing: '0.5px',
                    color: colors.textSecondary
                  }}
                >
                  CUSTOMER INFORMATION
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: colors.text
                  }}
                >
                  {selectedOrder.customer?.name || "Guest User"}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: colors.textSecondary
                  }}
                >
                  {selectedOrder.customer?.email || "No email"}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <p
                  className="mb-2"
                  style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontWeight: 700,
                    fontSize: '13px',
                    letterSpacing: '0.5px',
                    color: colors.textSecondary
                  }}
                >
                  SHIPPING ADDRESS
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: colors.text
                  }}
                >
                  {selectedOrder.shippingAddress || "No address provided"}
                </p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <div>
                  <p
                    className="mb-2"
                    style={{
                      fontFamily: 'var(--font-space), sans-serif',
                      fontWeight: 700,
                      fontSize: '13px',
                      letterSpacing: '0.5px',
                      color: colors.textSecondary
                    }}
                  >
                    ORDER DATE
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-space), sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: colors.text
                    }}
                  >
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p
                    className="mb-2"
                    style={{
                      fontFamily: 'var(--font-space), sans-serif',
                      fontWeight: 700,
                      fontSize: '13px',
                      letterSpacing: '0.5px',
                      color: colors.textSecondary
                    }}
                  >
                    ITEMS
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-space), sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: colors.text
                    }}
                  >
                    {selectedOrder.items?.length || 0} items
                  </p>
                </div>
                <div>
                  <p
                    className="mb-2"
                    style={{
                      fontFamily: 'var(--font-space), sans-serif',
                      fontWeight: 700,
                      fontSize: '13px',
                      letterSpacing: '0.5px',
                      color: colors.textSecondary
                    }}
                  >
                    TOTAL
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-outfit), sans-serif',
                      fontSize: '20px',
                      color: colors.text
                    }}
                  >
                    Rp{selectedOrder.totalAmount?.toLocaleString('id-ID')}
                  </p>
                </div>
              </motion.div>
              
              {/* Order Items List */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.55 }}
              >
                 <p
                  className="mb-2"
                  style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontWeight: 700,
                    fontSize: '13px',
                    letterSpacing: '0.5px',
                    color: colors.textSecondary
                  }}
                >
                  ORDERED ITEMS
                </p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-border/30">
                      <div className="text-sm">
                        <span className="font-semibold text-foreground">{item.quantity}x</span> {item.name || item.product?.name || 'Unknown Product'}
                      </div>
                      <div className="text-sm font-semibold">
                        Rp{(item.totalPrice || item.unitPrice * item.quantity).toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <p
                  className="mb-3"
                  style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontWeight: 700,
                    fontSize: '13px',
                    letterSpacing: '0.5px',
                    color: colors.textSecondary
                  }}
                >
                  UPDATE STATUS
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <motion.button
                    onClick={() => handleStatusChange(selectedOrder._id, 'processing')}
                    className="px-4 py-3 rounded-xl"
                    style={{
                      fontFamily: 'var(--font-space), sans-serif',
                      fontWeight: 700,
                      fontSize: '13px',
                      backgroundColor: `${colors.accent}20`,
                      color: colors.accent,
                      border: `2px solid ${colors.accent}`
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    PROCESS
                  </motion.button>
                  <motion.button
                    onClick={() => handleStatusChange(selectedOrder._id, 'shipped')}
                    className="px-4 py-3 rounded-xl"
                    style={{
                      fontFamily: 'var(--font-space), sans-serif',
                      fontWeight: 700,
                      fontSize: '13px',
                      backgroundColor: `#8B5CF620`,
                      color: '#8B5CF6',
                      border: `2px solid #8B5CF6`
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    SHIP
                  </motion.button>
                  <motion.button
                    onClick={() => handleStatusChange(selectedOrder._id, 'done')}
                    className="px-4 py-3 rounded-xl"
                    style={{
                      fontFamily: 'var(--font-space), sans-serif',
                      fontWeight: 700,
                      fontSize: '13px',
                      backgroundColor: `${colors.success}20`,
                      color: colors.success,
                      border: `2px solid ${colors.success}`
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    DONE
                  </motion.button>
                </div>
              </motion.div>
            </div>
            
            <div className="flex justify-between items-center mt-6">
               <motion.button
                  onClick={() => handleDeleteOrder(selectedOrder._id)}
                  className="px-6 py-3 rounded-xl transition-all duration-300"
                  style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontWeight: 700,
                    fontSize: '13px',
                    color: '#EF4444',
                    backgroundColor: '#EF444415',
                    border: '1px solid #EF4444'
                  }}
                  whileHover={{ scale: 1.02, backgroundColor: '#EF444425' }}
                  whileTap={{ scale: 0.98 }}
                >
                  HAPUS PESANAN
                </motion.button>

               <motion.button
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-3 rounded-xl"
                  style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontWeight: 700,
                    fontSize: '13px',
                    color: colors.textMuted,
                    backgroundColor: colors.bg
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  CLOSE
                </motion.button>
            </div>
            
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

