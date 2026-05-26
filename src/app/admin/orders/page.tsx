"use client";

import { ShoppingBag, ArrowLeft, Eye, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { getThemeColors } from '../theme';
import { ThemeToggle } from '@/core/components/shared/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress?: string;
  type?: 'retail' | 'custom';
}

export default function AdminOrders() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

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
      case 'pending':
        return '#F59E0B';
      case 'processing':
        return '#3B82F6';
      case 'shipped':
        return '#8B5CF6';
      case 'delivered':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  const getStatusLabel = (status: string) => {
    return status ? status.toUpperCase() : 'UNKNOWN';
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
        alert(`Order status updated to ${newStatus}`);
        setSelectedOrder(null);
      } else {
        alert(data.message || 'Failed to update order');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status === filterStatus);

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
                    fontFamily: 'var(--font-playfair), serif',
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
              <motion.select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-xl outline-none transition-all duration-300"
                style={{
                  fontFamily: 'var(--font-space), sans-serif',
                  fontWeight: 600,
                  fontSize: '13px',
                  backgroundColor: colors.bgSecondary,
                  color: colors.text,
                  border: `2px solid ${colors.border}`,
                  ...neumorphInset
                }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <option value="all" style={{ backgroundColor: colors.bgSecondary }}>ALL ORDERS</option>
                <option value="pending" style={{ backgroundColor: colors.bgSecondary }}>PENDING</option>
                <option value="processing" style={{ backgroundColor: colors.bgSecondary }}>PROCESSING</option>
                <option value="shipped" style={{ backgroundColor: colors.bgSecondary }}>SHIPPED</option>
                <option value="delivered" style={{ backgroundColor: colors.bgSecondary }}>DELIVERED</option>
                <option value="cancelled" style={{ backgroundColor: colors.bgSecondary }}>CANCELLED</option>
              </motion.select>
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
                  fontFamily: 'var(--font-playfair), serif',
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
                PENDING
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-playfair), serif',
                  fontSize: '32px',
                  color: '#F59E0B'
                }}
              >
                {orders.filter(o => o.status === 'pending').length}
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
                  fontFamily: 'var(--font-playfair), serif',
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
                DELIVERED
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-playfair), serif',
                  fontSize: '32px',
                  color: '#10B981'
                }}
              >
                {orders.filter(o => o.status === 'delivered').length}
              </p>
            </motion.div>
          </div>

          {/* Orders Table */}
          <motion.div
            className="rounded-2xl overflow-x-auto"
            style={{
              backgroundColor: colors.bgSecondary,
              ...neumorph
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {loading ? (
              <div className="p-12 flex justify-center items-center gap-3 text-muted-foreground">
                <Loader2 className="animate-spin" /> Loading orders...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No orders found.
              </div>
            ) : (
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
                  {filteredOrders.map((order, index) => (
                    <motion.tr
                      key={order._id}
                      style={{
                        borderTop: `1px solid ${colors.border}`
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 + index * 0.05 }}
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
                        #{order._id.substring(order._id.length - 6).toUpperCase()}
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
                            {order.user?.name || "Guest User"}
                          </p>
                          <p
                            style={{
                              fontFamily: 'var(--font-space), sans-serif',
                              fontWeight: 500,
                              fontSize: '12px',
                              color: colors.textSecondary
                            }}
                          >
                            {order.user?.email || "No email"}
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
                          onClick={() => router.push(`/admin/orders/${order._id}`)}
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
            )}
          </motion.div>
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
                    fontFamily: 'var(--font-playfair), serif',
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
                  {selectedOrder.user?.name || "Guest User"}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: colors.textSecondary
                  }}
                >
                  {selectedOrder.user?.email || "No email"}
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
                      fontFamily: 'var(--font-playfair), serif',
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
                        <span className="font-semibold text-foreground">{item.quantity}x</span> {item.product?.name || 'Unknown Product'}
                      </div>
                      <div className="text-sm font-semibold">
                        Rp{(item.price * item.quantity).toLocaleString('id-ID')}
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
                    onClick={() => handleStatusChange(selectedOrder._id, 'delivered')}
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
                    DELIVER
                  </motion.button>
                  <motion.button
                    onClick={() => handleStatusChange(selectedOrder._id, 'cancelled')}
                    className="px-4 py-3 rounded-xl"
                    style={{
                      fontFamily: 'var(--font-space), sans-serif',
                      fontWeight: 700,
                      fontSize: '13px',
                      backgroundColor: `${colors.error}20`,
                      color: colors.error,
                      border: `2px solid ${colors.error}`
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    CANCEL
                  </motion.button>
                </div>
              </motion.div>
            </div>
            
            <div className="flex justify-end mt-6">
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

