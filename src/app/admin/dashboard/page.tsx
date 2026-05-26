"use client";

import { Package, ShoppingBag, LogOut, TrendingUp, Calendar, BarChart3, LayoutDashboard, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { getThemeColors } from '../theme';
import { ThemeToggle } from '@/core/components/shared/ThemeToggle';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, [router]);

  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST' }); 
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminEmail');
    router.push('/login');
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
    { name: 'Pesanan Ritel', value: monthStats.retailOrders, color: colors.accent },
    { name: 'Pesanan Kustom', value: monthStats.customOrders, color: colors.accentSecondary }
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: colors.bg, color: colors.text }}>
      {/* Topnav */}
      <nav 
        className="fixed top-0 z-50 w-full flex items-center justify-between px-4 h-14 border-b shadow-sm"
        style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border }}
      >
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-xl font-bold uppercase tracking-widest" style={{ color: colors.text }}>
            Bjeans Admin
          </Link>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded transition ml-2"
            style={{ color: colors.textMuted }}
          >
            <Menu size={20} />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-semibold" style={{ color: colors.textMuted }}>
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </nav>

      <div className="flex h-screen pt-14">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside 
            className="w-64 flex-shrink-0 border-r overflow-y-auto"
            style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border }}
          >
            <div className="px-4 py-4 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>
              Core
            </div>
            <nav className="flex flex-col gap-1 px-2">
              <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md shadow-sm" style={{ backgroundColor: colors.bg, color: colors.text }}>
                <LayoutDashboard size={18} style={{ color: colors.textMuted }} />
                Dashboard
              </Link>
              
              <div className="px-2 py-4 text-xs font-bold uppercase tracking-wider mt-2" style={{ color: colors.textMuted }}>
                Manajemen
              </div>
              {[
                { icon: Package, label: 'Kelola Produk', path: '/admin/products' },
                { icon: Package, label: 'Kelola Bahan', path: '/admin/materials' },
                { icon: ShoppingBag, label: 'Pesanan Ritel', path: '/admin/orders' },
                { icon: Package, label: 'Pesanan Kustom', path: '/admin/custom-orders' }
              ].map((item) => (
                <Link key={item.label} href={item.path} className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:opacity-80 transition" style={{ color: colors.text }}>
                  <item.icon size={18} style={{ color: colors.textMuted }} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Dasbor</h1>
            <div className="flex items-center gap-2 mb-8 text-sm" style={{ color: colors.textMuted }}>
              <Link href="/admin/dashboard" className="hover:underline">Dasbor</Link>
              <span>/</span>
              <span>Ringkasan</span>
            </div>

            {/* Top Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Pesanan Hari Ini", value: todayStats.orders, color: colors.accent, icon: Package },
                { label: "Pendapatan Hari Ini", value: `Rp${todayStats.revenue.toLocaleString('id-ID')}`, color: colors.success, icon: TrendingUp },
                { label: "Pesanan Bulan Ini", value: monthStats.orders, color: colors.accentSecondary, icon: Calendar },
                { label: "Pendapatan Bulanan", value: `Rp${monthStats.revenue.toLocaleString('id-ID')}`, color: colors.warning || '#F59E0B', icon: BarChart3 }
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="rounded-lg border shadow-sm p-4 border-l-4"
                  style={{ backgroundColor: colors.bgSecondary, borderTopColor: colors.border, borderRightColor: colors.border, borderBottomColor: colors.border, borderLeftColor: stat.color }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: stat.color }}>{stat.label}</p>
                      <h2 className="text-2xl font-bold" style={{ color: colors.text }}>{stat.value}</h2>
                    </div>
                    <stat.icon size={32} style={{ color: colors.border, opacity: 0.8 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              {/* Area Chart */}
              <div 
                className="rounded-lg border shadow-sm flex flex-col"
                style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border }}
              >
                <div className="px-4 py-3 border-b flex items-center gap-2 font-semibold" style={{ borderColor: colors.border }}>
                  <TrendingUp size={16} />
                  Tren Pendapatan
                </div>
                <div className="p-4 flex-1">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueTrendData}>
                      <defs>
                        <linearGradient id="colorRetail" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={colors.accent} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={colors.accent} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCustom" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={colors.accentSecondary} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={colors.accentSecondary} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                      <XAxis dataKey="day" stroke={colors.textMuted} fontSize={12} />
                      <YAxis stroke={colors.textMuted} fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, borderRadius: '8px' }}
                        labelStyle={{ color: colors.text, fontWeight: 'bold' }}
                        formatter={(value: any) => `Rp${Number(value).toLocaleString('id-ID')}`}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }}/>
                      <Area type="monotone" dataKey="retail" name="Ritel" stroke={colors.accent} fillOpacity={1} fill="url(#colorRetail)" strokeWidth={2} />
                      <Area type="monotone" dataKey="custom" name="Kustom" stroke={colors.accentSecondary} fillOpacity={1} fill="url(#colorCustom)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div 
                className="rounded-lg border shadow-sm flex flex-col"
                style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border }}
              >
                <div className="px-4 py-3 border-b flex items-center gap-2 font-semibold" style={{ borderColor: colors.border }}>
                  <BarChart3 size={16} />
                  Distribusi Pesanan
                </div>
                <div className="p-4 flex-1">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={orderDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                        {orderDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, borderRadius: '8px' }}
                        itemStyle={{ color: colors.text }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}






