"use client";

import { Package, ShoppingBag, LogOut, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { getThemeColors } from '../theme';
import { ThemeToggle } from '@/core/components/shared/ThemeToggle';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AdminDashboard() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
  }, [router]);

  const neumorph = {
    boxShadow: `
      ${theme === 'dark'
        ? '8px 8px 16px rgba(0, 0, 0, 0.5), -8px -8px 16px rgba(255, 255, 255, 0.05)'
        : '8px 8px 16px rgba(0, 0, 0, 0.15), -8px -8px 16px rgba(255, 255, 255, 1)'
      }
    `
  };

  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST' }); localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminEmail');
    router.push('/admin/login');
  };

  // Mock data for dashboard
  const todayStats = {
    orders: 8,
    revenue: 35100000,
    retailOrders: 5,
    customOrders: 3
  };

  const monthStats = {
    orders: 156,
    revenue: 678450000,
    retailOrders: 89,
    customOrders: 67
  };

  const revenueTrendData = [
    { day: 'Apr 7', retail: 18000000, custom: 12000000 },
    { day: 'Apr 8', retail: 22500000, custom: 16500000 },
    { day: 'Apr 9', retail: 27000000, custom: 14250000 },
    { day: 'Apr 10', retail: 31500000, custom: 19500000 },
    { day: 'Apr 11', retail: 28500000, custom: 21750000 },
    { day: 'Apr 12', retail: 34500000, custom: 24000000 },
    { day: 'Apr 13', retail: 21000000, custom: 14100000 }
  ];

  const orderDistribution = [
    { name: 'Retail Orders', value: monthStats.retailOrders, color: colors.accent },
    { name: 'Custom Orders', value: monthStats.customOrders, color: colors.accentSecondary }
  ];

  const categorySalesData = [
    { category: 'Jeans', sales: 427500000, orders: 95 },
    { category: 'Jackets', sales: 273000000, orders: 42 },
    { category: 'Shirts', sales: 186000000, orders: 68 },
    { category: 'Accessories', sales: 133500000, orders: 87 }
  ];

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
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1
                className="text-3xl tracking-tight mb-1 uppercase"
                style={{
                  fontFamily: 'var(--font-playfair), serif',
                  color: colors.text
                }}
              >
                Bjeans.co Admin
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-space), sans-serif',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: colors.textMuted
                }}
              >
                Administrator Dashboard
              </p>
            </motion.div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <motion.button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300"
                style={{
                  fontFamily: 'var(--font-space), sans-serif',
                  fontWeight: 700,
                  fontSize: '13px',
                  backgroundColor: colors.bgSecondary,
                  color: colors.text,
                  ...neumorph
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut size={16} />
                LOGOUT
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-0 py-0">
        <div className="mx-auto flex min-h-[calc(100vh-88px)] max-w-[1800px] flex-col lg:flex-row">
          {/* Sidebar */}
          <aside
            className="w-full border-b px-6 py-8 lg:w-[280px] lg:border-b-0 lg:border-r lg:px-8"
            style={{ borderColor: colors.border, backgroundColor: colors.bgSecondary }}
          >
            <div className="mb-8">
              <p
                style={{
                  fontFamily: 'var(--font-space), sans-serif',
                  fontWeight: 700,
                  fontSize: '11px',
                  letterSpacing: '1.2px',
                  color: colors.textMuted
                }}
              >
                ADMIN PANEL
              </p>
              <h2
                className="mt-2 text-2xl uppercase"
                style={{
                  fontFamily: 'var(--font-playfair), serif',
                  color: colors.text
                }}
              >
                Dashboard
              </h2>
              <p
                className="mt-2"
                style={{
                  fontFamily: 'var(--font-space), sans-serif',
                  fontWeight: 500,
                  fontSize: '12px',
                  color: colors.textSecondary
                }}
              >
                Manage catalog and orders.
              </p>
            </div>

            <nav className="flex flex-col gap-2">
              {[
                { icon: Package, label: 'Manage Products', path: '/admin/products' },
                { icon: ShoppingBag, label: 'Retail Orders', path: '/admin/orders' },
                { icon: Package, label: 'Custom Orders', path: '/admin/custom-orders' }
              ].map((item, index) => (
                <motion.button
                  key={item.label}
                  onClick={() => router.push(item.path)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-300"
                  style={{
                    backgroundColor: colors.bg,
                    color: colors.text,
                    boxShadow: `inset 0 0 0 1px ${colors.border}`
                  }}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.15 + index * 0.08 }}
                  whileHover={{ x: 4 }}
                >
                  <item.icon size={18} style={{ color: colors.accent }} />
                  <span
                    style={{
                      fontFamily: 'var(--font-space), sans-serif',
                      fontWeight: 600,
                      fontSize: '13px'
                    }}
                  >
                    {item.label}
                  </span>
                </motion.button>
              ))}
            </nav>

            <div className="mt-10 flex items-center gap-3">
              <ThemeToggle />
              <motion.button
                onClick={handleLogout}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                  boxShadow: `inset 0 0 0 1px ${colors.border}`
                }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut size={16} />
                <span
                  style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontWeight: 600,
                    fontSize: '12px'
                  }}
                >
                  Logout
                </span>
              </motion.button>
            </div>
          </aside>

          {/* Content */}
          <section className="min-w-0 flex-1 px-6 py-10 md:px-8 md:py-12">
          <motion.h2
            className="text-5xl mb-12 uppercase"
            style={{
              fontFamily: 'var(--font-playfair), serif',
              color: colors.text
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Dashboard
          </motion.h2>

          {/* Today's Performance */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={20} style={{ color: colors.textMuted }} />
              <h3
                style={{
                  fontFamily: 'var(--font-space), sans-serif',
                  fontWeight: 700,
                  fontSize: '16px',
                  letterSpacing: '0.5px',
                  color: colors.text
                }}
              >
                TODAY'S PERFORMANCE
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "TODAY'S ORDERS", value: todayStats.orders, color: colors.text },
                { label: "TODAY'S REVENUE", value: `Rp${todayStats.revenue.toLocaleString('id-ID')}`, color: colors.success },
                { label: "RETAIL ORDERS", value: todayStats.retailOrders, color: colors.accent },
                { label: "CUSTOM ORDERS", value: todayStats.customOrders, color: colors.accentSecondary }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="border rounded-2xl p-6"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.bgSecondary,
                    ...neumorph
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <p
                    className="mb-2"
                    style={{
                      fontFamily: 'var(--font-space), sans-serif',
                      fontWeight: 600,
                      fontSize: '13px',
                      letterSpacing: '0.5px',
                      color: colors.textMuted
                    }}
                  >
                    {stat.label}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-playfair), serif',
                      fontSize: '32px',
                      color: stat.color
                    }}
                  >
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* This Month's Performance */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} style={{ color: colors.textMuted }} />
              <h3
                style={{
                  fontFamily: 'var(--font-space), sans-serif',
                  fontWeight: 700,
                  fontSize: '16px',
                  letterSpacing: '0.5px',
                  color: colors.text
                }}
              >
                THIS MONTH
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "TOTAL ORDERS", value: monthStats.orders, color: colors.text },
                { label: "MONTHLY REVENUE", value: `Rp${monthStats.revenue.toLocaleString('id-ID')}`, color: colors.success },
                { label: "RETAIL ORDERS", value: monthStats.retailOrders, color: colors.accent },
                { label: "CUSTOM ORDERS", value: monthStats.customOrders, color: colors.accentSecondary }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="border rounded-2xl p-6"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.bgSecondary,
                    ...neumorph
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <p
                    className="mb-2"
                    style={{
                      fontFamily: 'var(--font-space), sans-serif',
                      fontWeight: 600,
                      fontSize: '13px',
                      letterSpacing: '0.5px',
                      color: colors.textMuted
                    }}
                  >
                    {stat.label}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-playfair), serif',
                      fontSize: '32px',
                      color: stat.color
                    }}
                  >
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Visual Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Trend Chart */}
            <motion.div
              className="lg:col-span-2 border rounded-2xl p-6"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.bgSecondary,
                ...neumorph
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={20} style={{ color: colors.success }} />
                <h3
                  style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontWeight: 700,
                    fontSize: '16px',
                    letterSpacing: '0.5px',
                    color: colors.text
                  }}
                >
                  REVENUE TREND (LAST 7 DAYS)
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueTrendData}>
                  <defs>
                    <linearGradient id="colorRetail" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.accent} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={colors.accent} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCustom" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.accentSecondary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={colors.accentSecondary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis
                    dataKey="day"
                    stroke={colors.textMuted}
                    style={{ fontFamily: 'var(--font-space), sans-serif', fontSize: '12px' }}
                  />
                  <YAxis
                    stroke={colors.textMuted}
                    style={{ fontFamily: 'var(--font-space), sans-serif', fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.bgSecondary,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      fontFamily: 'var(--font-space), sans-serif'
                    }}
                    labelStyle={{ color: colors.text, fontWeight: 700 }}
                    formatter={(value: any) => `Rp${Number(value).toLocaleString('id-ID')}`}
                  />
                  <Legend
                    wrapperStyle={{ fontFamily: 'var(--font-space), sans-serif', fontSize: '13px' }}
                    iconType="circle"
                  />
                  <Area
                    type="monotone"
                    dataKey="retail"
                    name="Retail"
                    stroke={colors.accent}
                    fillOpacity={1}
                    fill="url(#colorRetail)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="custom"
                    name="Custom"
                    stroke={colors.accentSecondary}
                    fillOpacity={1}
                    fill="url(#colorCustom)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Order Distribution Chart */}
            <motion.div
              className="border rounded-2xl p-6"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.bgSecondary,
                ...neumorph
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 size={20} style={{ color: colors.textMuted }} />
                <h3
                  style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontWeight: 700,
                    fontSize: '16px',
                    letterSpacing: '0.5px',
                    color: colors.text
                  }}
                >
                  ORDER DISTRIBUTION
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {orderDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.bgSecondary,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      fontFamily: 'var(--font-space), sans-serif'
                    }}
                    labelStyle={{ color: colors.text, fontWeight: 700 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {orderDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <p
                        style={{
                          fontFamily: 'var(--font-space), sans-serif',
                          fontWeight: 500,
                          fontSize: '13px',
                          color: colors.textSecondary
                        }}
                      >
                        {item.name}
                      </p>
                    </div>
                    <p
                      style={{
                        fontFamily: 'var(--font-space), sans-serif',
                        fontWeight: 700,
                        fontSize: '14px',
                        color: colors.text
                      }}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          </section>
        </div>
      </main>
    </motion.div>
  );
}
