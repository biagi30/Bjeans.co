"use client";

import { Package, ShoppingBag, LogOut, LayoutDashboard, Menu, Plus, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { getThemeColors } from '../theme';
import { ThemeToggle } from '@/core/components/shared/ThemeToggle';
import Link from 'next/link';
import type { CustomOption } from '@/api/models';
import { useToast } from '@/core/context/ToastContext';

export default function AdminCustomOptions() {
  const router = useRouter();
  const toast = useToast();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [options, setoptions] = useState<CustomOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'fit', name: '', description: '', priceDelta: 0, image: '', isActive: true
  });

  useEffect(() => {
    setMounted(true);
    fetchoptions();
  }, [router]);

  const fetchoptions = async () => {
    try {
      const res = await fetch('/api/custom-options');
      const data = await res.json();
      if (data.success) {
        setoptions(data.data);
      }
    } catch (err) {
      console.error("Failed to load Opsi Kustom", err);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/custom-options/${editingId}` : '/api/custom-options';
      const method = editingId ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchoptions();
        toast.success(`Custom Opsi Kustom ${editingId ? 'diperbarui' : 'ditambahkan'} dengan sukses!`);
      } else {
        toast.error(data.message || 'Failed to save Opsi Kustom');
      }
    } catch (err) {
      toast.error('Kesalahan Jaringan');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus opsi ini?')) {
      try {
        const res = await fetch(`/api/custom-options/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          fetchoptions();
          toast.success('Opsi Kustom deleted dengan sukses!');
        }
      } catch (err) {
        toast.error('Kesalahan Jaringan');
      }
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      type: 'fit', name: '', description: '', priceDelta: 0, image: '', isActive: true
    });
    setShowModal(true);
  };

  const openEditModal = (opt: CustomOption) => {
    setEditingId(opt._id || null);
    setFormData({
      type: opt.type as any, name: opt.name, description: opt.description || '', 
      priceDelta: opt.priceDelta || 0, image: opt.image || '', isActive: opt.isActive
    });
    setShowModal(true);
  };

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
              <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:opacity-80 transition" style={{ color: colors.text }}>
                <LayoutDashboard size={18} style={{ color: colors.textMuted }} />
                Dashboard
              </Link>
              
              <div className="px-2 py-4 text-xs font-bold uppercase tracking-wider mt-2" style={{ color: colors.textMuted }}>
                Manajemen
              </div>
              {[
                { icon: Package, label: 'Kelola Produk', path: '/admin/products' },
                { icon: Package, label: 'Materials (Bahan)', path: '/admin/materials' },
                { icon: Package, label: 'Opsi Kustom', path: '/admin/custom-options' },
                { icon: ShoppingBag, label: 'Pesanan Ritel', path: '/admin/orders' },
                { icon: Package, label: 'Pesanan Kustom', path: '/admin/custom-orders' }
              ].map((item) => (
                <Link key={item.label} href={item.path} 
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md shadow-sm transition" 
                  style={{ 
                    backgroundColor: item.path === '/admin/custom-options' ? colors.bg : 'transparent',
                    color: colors.text 
                  }}
                >
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
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Opsi Kustom</h1>
                <div className="flex items-center gap-2 text-sm" style={{ color: colors.textMuted }}>
                  <Link href="/admin/dashboard" className="hover:underline">Dasbor</Link>
                  <span>/</span>
                  <span>Opsi Kustom</span>
                </div>
              </div>
              <button 
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-sm"
              >
                <Plus size={18} /> Add Opsi Kustom
              </button>
            </div>

            {loading ? (
              <div className="text-center py-10">Loading...</div>
            ) : (
              <div className="rounded-lg border shadow-sm overflow-x-auto" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border }}>
                <table className="w-full text-sm text-left">
                  <thead className="bg-black/5" style={{ color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>
                    <tr>
                      <th className="px-6 py-3 font-semibold uppercase tracking-wider">Tipe</th>
                      <th className="px-6 py-3 font-semibold uppercase tracking-wider">Nama</th>
                      <th className="px-6 py-3 font-semibold uppercase tracking-wider">Deskripsi</th>
                      <th className="px-6 py-3 font-semibold uppercase tracking-wider">Addon Price</th>
                      <th className="px-6 py-3 font-semibold uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 font-semibold uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: colors.border }}>
                    {options.map((opt) => (
                      <tr key={opt._id} className="hover:bg-black/5" style={{ transition: 'background-color 0.2s' }}>
                        <td className="px-6 py-4 font-medium uppercase">{opt.type}</td>
                        <td className="px-6 py-4">{opt.name}</td>
                        <td className="px-6 py-4 max-w-xs truncate">{opt.description}</td>
                        <td className="px-6 py-4">Rp {opt.priceDelta.toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${opt.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {opt.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEditModal(opt)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(opt._id as string)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {options.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center" style={{ color: colors.textMuted }}>
                          No options found. Add one to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div 
            className="rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            style={{ backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 1 }}
          >
            <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: colors.border }}>
              <h3 className="text-xl font-bold">{editingId ? 'Edit Opsi Kustom' : 'Add Opsi Kustom'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">?</button>
            </div>
            
            <form onSubmit={handleSave} className="overflow-y-auto p-6 flex-1 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold" style={{ color: colors.textSecondary }}>Tipe</label>
                  <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500 outline-none" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.text }}>
                    {['fabric', 'model', 'detail', 'wash', 'fit', 'other'].map(t => (
                      <option key={t} value={t}>{t.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold" style={{ color: colors.textSecondary }}>Nama</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500 outline-none" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.text }} />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-semibold" style={{ color: colors.textSecondary }}>Harga Tambahan (Rp)</label>
                  <input required type="number" min="0" value={formData.priceDelta} onChange={e => setFormData({...formData, priceDelta: Number(e.target.value)})} className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500 outline-none" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.text }} />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-semibold" style={{ color: colors.textSecondary }}>Deskripsi</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500 outline-none" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.text }} />
                </div>

                  <div className="space-y-1"><label className="text-sm font-semibold" style={{ color: colors.textSecondary }}>URL Gambar</label><input type="text" value={formData.image} placeholder="https://example.com/img.jpg" onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500 outline-none" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.text }} />{formData.image && (<div className="mt-2 h-16 w-16 rounded overflow-hidden border" style={{ borderColor: colors.border }}><img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} /></div>)}</div></div><div className="mt-8 flex justify-end gap-3 pt-6 border-t" style={{ borderColor: colors.border }}>
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 rounded-lg font-medium bg-gray-200 text-gray-800 hover:bg-gray-300">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700">
                  {editingId ? 'Update' : 'Save'} Opsi Kustom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}














