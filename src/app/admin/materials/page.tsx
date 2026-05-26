"use client";

import { Package, ShoppingBag, LogOut, LayoutDashboard, Menu, Plus, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { getThemeColors } from '../theme';
import { ThemeToggle } from '@/core/components/shared/ThemeToggle';
import Link from 'next/link';
import type { Material } from '@/api/models';

export default function AdminMaterials() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', sku: '', type: 'denim', price: 0, stock: 0, 
    color: '', weightOz: 0, stretch: '', origin: '', isActive: true,
    images: [] as string[]
  });

  useEffect(() => {
    setMounted(true);
    fetchMaterials();
  }, [router]);

  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/materials');
      const data = await res.json();
      if (data.success) {
        setMaterials(data.data);
      }
    } catch (err) {
      console.error("Failed to load materials", err);
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
      const url = editingId ? `/api/materials/${editingId}` : '/api/materials';
      const method = editingId ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchMaterials();
        alert(`Material ${editingId ? 'diperbarui' : 'ditambahkan'} dengan sukses!`);
      } else {
        alert(data.message || 'Gagal menyimpan bahan');
      }
    } catch (err) {
      alert('Kesalahan Jaringan');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus bahan ini?')) {
      try {
        const res = await fetch(`/api/materials/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          fetchMaterials();
          alert('Material deleted dengan sukses!');
        }
      } catch (err) {
        alert('Kesalahan Jaringan');
      }
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '', sku: '', type: 'denim', price: 0, stock: 0, 
      color: '', weightOz: 0, stretch: '', origin: '', isActive: true,
      images: []
    });
    setShowModal(true);
  };

  const openEditModal = (material: Material) => {
    setEditingId(material._id || null);
    setFormData({
      name: material.name, sku: material.sku, type: material.type, 
      price: material.price, stock: material.stock, color: material.color || '', 
      weightOz: material.weightOz || 0, stretch: material.stretch || '', 
      origin: material.origin || '', isActive: material.isActive,
      images: material.images || []
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
                { icon: Package, label: 'Kelola Bahan', path: '/admin/materials' },
                { icon: ShoppingBag, label: 'Pesanan Ritel', path: '/admin/orders' },
                { icon: Package, label: 'Pesanan Kustom', path: '/admin/custom-orders' }
              ].map((item) => (
                <Link key={item.label} href={item.path} 
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md shadow-sm transition" 
                  style={{ 
                    backgroundColor: item.path === '/admin/materials' ? colors.bg : 'transparent',
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
                <h1 className="text-3xl font-bold mb-2">Bahan/Material</h1>
                <div className="flex items-center gap-2 text-sm" style={{ color: colors.textMuted }}>
                  <Link href="/admin/dashboard" className="hover:underline">Dasbor</Link>
                  <span>/</span>
                  <span>Bahan/Material</span>
                </div>
              </div>
              <button 
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-sm"
              >
                <Plus size={18} /> Tambah Bahan
              </button>
            </div>

            {loading ? (
              <div className="text-center py-10">Loading...</div>
            ) : (
              <div className="rounded-lg border shadow-sm overflow-x-auto" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border }}>
                <table className="w-full text-sm text-left">
                  <thead className="bg-black/5" style={{ color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }}>
                    <tr>
                      <th className="px-6 py-3 font-semibold uppercase tracking-wider">SKU</th>
                      <th className="px-6 py-3 font-semibold uppercase tracking-wider">Nama</th>
                      <th className="px-6 py-3 font-semibold uppercase tracking-wider">Tipe</th>
                      <th className="px-6 py-3 font-semibold uppercase tracking-wider">Stok</th>
                      <th className="px-6 py-3 font-semibold uppercase tracking-wider">Harga (Tambahan)</th>
                      <th className="px-6 py-3 font-semibold uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 font-semibold uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: colors.border }}>
                    {materials.map((m) => (
                      <tr key={m._id} className="hover:bg-black/5" style={{ transition: 'background-color 0.2s' }}>
                        <td className="px-6 py-4 font-medium">{m.sku}</td>
                        <td className="px-6 py-4">{m.name}</td>
                        <td className="px-6 py-4 capitalize">{m.type}</td>
                        <td className="px-6 py-4">{m.stock}</td>
                        <td className="px-6 py-4">Rp {m.price.toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${m.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {m.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEditModal(m)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(m._id as string)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {materials.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center" style={{ color: colors.textMuted }}>
                          Tidak ada bahan ditemukan. Tambahkan satu untuk memulai.
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
            className="rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            style={{ backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 1 }}
          >
            <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: colors.border }}>
              <h3 className="text-xl font-bold">{editingId ? 'Edit Bahan' : 'Tambah Bahan'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">?</button>
            </div>
            
            <form onSubmit={handleSave} className="overflow-y-auto p-6 flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold" style={{ color: colors.textSecondary }}>Nama</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500 outline-none" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.text }} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold" style={{ color: colors.textSecondary }}>SKU</label>
                  <input required type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500 outline-none" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.text }} />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-semibold" style={{ color: colors.textSecondary }}>Tipe</label>
                  <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500 outline-none" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.text }}>
                    {['denim', 'button', 'rivet', 'thread', 'leather', 'zipper', 'other'].map(t => (
                      <option key={t} value={t}>{t.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold" style={{ color: colors.textSecondary }}>Harga Tambahan (Rp)</label>
                  <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500 outline-none" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.text }} />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-semibold" style={{ color: colors.textSecondary }}>Stok</label>
                  <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500 outline-none" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.text }} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold" style={{ color: colors.textSecondary }}>Warna</label>
                  <input type="text" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500 outline-none" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.text }} />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold" style={{ color: colors.textSecondary }}>Berat (oz)</label>
                  <input type="number" min="0" value={formData.weightOz} onChange={e => setFormData({...formData, weightOz: Number(e.target.value)})} className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500 outline-none" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.text }} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold" style={{ color: colors.textSecondary }}>Sifat Lentur (Stretch)</label>
                  <input type="text" value={formData.stretch} placeholder="e.g. 2% Elastane" onChange={e => setFormData({...formData, stretch: e.target.value})} className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500 outline-none" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.text }} />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-semibold" style={{ color: colors.textSecondary }}>Asal/Origin</label>
                  <input type="text" value={formData.origin} placeholder="e.g. Japan, Kuroki Mill" onChange={e => setFormData({...formData, origin: e.target.value})} className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500 outline-none" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.text }} />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-semibold" style={{ color: colors.textSecondary }}>URL Gambar (pisahkan dengan koma)</label>
                  <input type="text" value={formData.images.join(', ')} placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" onChange={e => setFormData({...formData, images: e.target.value.split(',').map(url => url.trim()).filter(url => url !== '')})} className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500 outline-none" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.text }} />
                  {formData.images.length > 0 && formData.images[0] !== '' && (
                    <div className="flex gap-2 mt-2 overflow-x-auto">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="h-16 w-16 rounded overflow-hidden flex-shrink-0 border" style={{ borderColor: colors.border }}>
                          <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1 md:col-span-2 flex items-center gap-2 mt-2">
                  <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 rounded" />
                  <label htmlFor="isActive" className="text-sm font-semibold" style={{ color: colors.text }}>Aktif (Terlihat oleh pelanggan)</label>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t" style={{ borderColor: colors.border }}>
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 rounded-lg font-medium bg-gray-200 text-gray-800 hover:bg-gray-300">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700">
                  {editingId ? 'Perbarui' : 'Simpan'} Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}







