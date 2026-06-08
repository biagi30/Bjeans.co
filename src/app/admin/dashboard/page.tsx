"use client";

import { Package, ShoppingBag, LogOut, TrendingUp, Calendar, BarChart3, LayoutDashboard, Menu, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { getThemeColors } from '../theme';
import { ThemeToggle } from '@/core/components/shared/ThemeToggle';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Link from 'next/link';

interface Order {
  _id: string;
  orderNumber?: string;
  orderType?: 'unified' | 'retail' | 'custom';
  type?: 'retail' | 'custom';
  totalAmount: number;
  status: string;
  paymentStatus?: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch orders for dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST' }); 
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminEmail');
    router.push('/login');
  };

  const isToday = (date: Date) => {
    if (isNaN(date.getTime())) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isThisMonth = (date: Date) => {
    if (isNaN(date.getTime())) return false;
    const today = new Date();
    return date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const getTodayStats = () => {
    const todayOrdersList = orders.filter(o => isToday(new Date(o.createdAt)));
    const retail = todayOrdersList.filter(o => (o.orderType || o.type) !== 'custom');
    const custom = todayOrdersList.filter(o => (o.orderType || o.type) === 'custom');
    
    return {
      orders: todayOrdersList.length,
      revenue: todayOrdersList.reduce((acc, o) => acc + o.totalAmount, 0),
      retailOrders: retail.length,
      customOrders: custom.length
    };
  };

  const getMonthStats = () => {
    const monthOrdersList = orders.filter(o => isThisMonth(new Date(o.createdAt)));
    const retail = monthOrdersList.filter(o => (o.orderType || o.type) !== 'custom');
    const custom = monthOrdersList.filter(o => (o.orderType || o.type) === 'custom');
    
    return {
      orders: monthOrdersList.length,
      revenue: monthOrdersList.reduce((acc, o) => acc + o.totalAmount, 0),
      retailOrders: retail.length,
      customOrders: custom.length
    };
  };

  const getLast7DaysData = (ordersList: Order[]) => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      
      const label = d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
      
      // Filter orders on this day
      const dayOrders = ordersList.filter(o => {
        const oDate = new Date(o.createdAt);
        return oDate.getDate() === d.getDate() &&
               oDate.getMonth() === d.getMonth() &&
               oDate.getFullYear() === d.getFullYear();
      });
      
      let retailRevenue = 0;
      let customRevenue = 0;
      
      dayOrders.forEach(o => {
        const type = o.orderType || o.type || 'retail';
        if (type === 'custom') {
          customRevenue += o.totalAmount;
        } else {
          retailRevenue += o.totalAmount;
        }
      });
      
      data.push({
        day: label,
        retail: retailRevenue,
        custom: customRevenue
      });
    }
    
    return data;
  };

  const todayStats = getTodayStats();
  const monthStats = getMonthStats();
  const revenueTrendData = getLast7DaysData(orders);

  const orderDistribution = [
    { name: 'Pesanan Ritel', value: monthStats.retailOrders || 1, color: colors.accent },
    { name: 'Pesanan Kustom', value: monthStats.customOrders || 1, color: colors.accentSecondary }
  ];

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3" style={{ backgroundColor: colors.bg, color: colors.text }}>
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="text-lg font-medium" style={{ fontFamily: 'var(--font-space), sans-serif' }}>Memuat statistik dasbor...</span>
      </div>
    );
  }

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






