"use client";

import { Package, Plus, Edit, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { getThemeColors } from '../theme';
import { ThemeToggle } from '@/core/components/shared/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/core/context/ToastContext';
import { resizeAndCropImage } from '@/core/lib/utils';

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  description?: string;
  images?: string[];
  sizes?: { size: string; stock: number }[];
}

export default function AdminProducts() {
  const router = useRouter();
  const toast = useToast();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [sizes, setSizes] = useState<{ size: string; stock: number }[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    stock: '',
    category: '',
    description: '',
    images: '',
  });

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
    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const parseImages = (value: string) =>
    value
      .split(/(?<!base64),/)
      .map((item) => item.trim())
      .filter(Boolean);

  const parsePrice = (value: string) => {
    const digits = value.replace(/[^0-9]/g, "");
    return digits ? Number(digits) : NaN;
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      const uploads = Array.from(files);
      const uploadedUrls: string[] = [];

      for (const file of uploads) {
        let processedFile: File | Blob = file;
        try {
          const resizedBlob = await resizeAndCropImage(file);
          processedFile = new File([resizedBlob], file.name || "image.jpg", { type: 'image/jpeg' });
        } catch (e) {
          console.warn('Client-side resize failed, using original file:', e);
        }

        const form = new FormData();
        form.append('file', processedFile);

        const res = await fetch('/api/uploads', {
          method: 'POST',
          body: form,
        });

        const data = await res.json();
        if (!data.success || !data.data?.url) {
          throw new Error(data.message || 'Upload failed');
        }

        uploadedUrls.push(data.data.url as string);
      }

      setFormData((prev) => {
        const merged = [...parseImages(prev.images), ...uploadedUrls];
        return { ...prev, images: merged.join(', ') };
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    setFormData((prev) => {
      const filtered = parseImages(prev.images).filter((img) => img !== url);
      return { ...prev, images: filtered.join(', ') };
    });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) {
      toast.error('Harap tunggu sampai unggah gambar selesai.');
      return;
    }
    const images = parseImages(formData.images);
    const priceValue = parsePrice(formData.price);
    if (Number.isNaN(priceValue)) {
      toast.error('Harap masukkan harga yang valid.');
      return;
    }
    if (images.length === 0) {
      toast.error('Harap unggah minimal satu gambar produk.');
      return;
    }
    try {
      const isAccessory = formData.category === "Accessories" || formData.category === "Aksesoris";
      const finalSizes = isAccessory ? [] : sizes;
      const totalStock = (!isAccessory && finalSizes.length > 0)
        ? finalSizes.reduce((sum, s) => sum + s.stock, 0)
        : parseInt(formData.stock) || 0;

      const newProduct = {
        name: formData.name,
        sku: formData.sku,
        price: priceValue,
        stock: totalStock,
        category: formData.category,
        description: formData.description || 'No description',
        images,
        sizes: finalSizes,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      const data = await res.json();
      if (data.success) {
        setProducts([data.data, ...products]);
        setShowAddModal(false);
        setFormData({ name: '', sku: '', price: '', stock: '', category: '', description: '', images: '' });
        toast.success('Produk berhasil ditambahkan!');
      } else {
        toast.error(data.message || 'Gagal menambahkan produk');
      }
    } catch (err) {
      toast.error('Kesalahan jaringan');
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      if (uploading) {
        toast.error('Harap tunggu sampai unggah gambar selesai.');
        return;
      }
      try {
        const images = parseImages(formData.images);
        const priceValue = parsePrice(formData.price);
        if (Number.isNaN(priceValue)) {
          toast.error('Harap masukkan harga yang valid.');
          return;
        }
        const isAccessory = formData.category === "Accessories" || formData.category === "Aksesoris";
        const finalSizes = isAccessory ? [] : sizes;
        const totalStock = (!isAccessory && finalSizes.length > 0)
          ? finalSizes.reduce((sum, s) => sum + s.stock, 0)
          : parseInt(formData.stock) || 0;

        const updatedProduct = {
          name: formData.name,
          sku: formData.sku,
          price: priceValue,
          stock: totalStock,
          category: formData.category,
          description: formData.description,
          images,
          sizes: finalSizes,
        };

        const res = await fetch(`/api/products/${editingProduct._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProduct),
        });

        const data = await res.json();
        if (data.success) {
          setProducts(products.map(p =>
            p._id === editingProduct._id ? data.data : p
          ));
          setEditingProduct(null);
          setFormData({ name: '', sku: '', price: '', stock: '', category: '', description: '', images: '' });
          toast.success('Produk berhasil diperbarui!');
        } else {
          toast.error(data.message || 'Gagal memperbarui produk');
        }
      } catch (err) {
        toast.error('Kesalahan jaringan');
      }
    }
  };

  const handleDeleteProduct = (id: string) => {
    setDeleteConfirmId(id);
  };

  const executeDeleteProduct = async () => {
    if (!deleteConfirmId) return;
    try {
      const res = await fetch(`/api/products/${deleteConfirmId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter(p => p._id !== deleteConfirmId));
        toast.success('Produk berhasil dihapus!');
      } else {
        toast.error(data.message || 'Gagal menghapus produk');
      }
    } catch (err) {
      toast.error('Kesalahan jaringan');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setSizes(product.sizes || []);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      description: product.description || '',
      images: product.images && product.images.length > 0 ? product.images.join(', ') : '',
    });
  };

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
                  Manajemen Produk
                </motion.h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <motion.button
                onClick={() => {
                  setEditingProduct(null);
                  setSizes([]);
                  setFormData({ name: '', sku: '', price: '', stock: '', category: '', description: '', images: '' });
                  setShowAddModal(true);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl"
                style={{
                  fontFamily: 'var(--font-space), sans-serif',
                  fontWeight: 800,
                  fontSize: '13px',
                  letterSpacing: '0.5px',
                  backgroundColor: colors.accent,
                  color: '#FFFFFF',
                  ...neumorph
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Plus size={16} />
                TAMBAH PRODUK
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-12">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            className="rounded-2xl overflow-x-auto"
            style={{
              backgroundColor: colors.bgSecondary,
              ...neumorph
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {loading ? (
              <div className="p-12 flex justify-center items-center gap-3 text-muted-foreground">
                <Loader2 className="animate-spin" /> Memuat Produk...
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                Tidak ada produk yang ditemukan. Tambahkan satu!
              </div>
            ) : (
              <table className="w-full min-w-[800px]">
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
                      NAMA PRODUK
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
                      KATEGORI
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
                      HARGA
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
                      STOK
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
                      AKSI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <motion.tr
                      key={product._id}
                      style={{
                        borderTop: `1px solid ${colors.border}`
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                      whileHover={{ backgroundColor: `${colors.bg}80` }}
                    >
                      <td
                        className="px-6 py-4"
                        style={{
                          fontFamily: 'var(--font-space), sans-serif',
                          fontWeight: 600,
                          fontSize: '14px',
                          color: colors.text
                        }}
                      >
                        {product.name}
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
                        {product.category}
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
                        Rp{product.price.toLocaleString('id-ID')}
                      </td>
                      <td
                        className="px-6 py-4"
                        style={{
                          fontFamily: 'var(--font-space), sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: product.stock < 10 ? '#EF4444' : '#10B981'
                        }}
                      >
                        {product.stock} unit
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <motion.button
                            onClick={() => openEditModal(product)}
                            style={{ color: colors.accent }}
                            whileHover={{ scale: 1.2, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit size={18} />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDeleteProduct(product._id)}
                            style={{ color: '#EF4444' }}
                            whileHover={{ scale: 1.2, rotate: -5 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>
        </div>
      </main>

      {/* Add/Edit Product Modal (UKURAN LEBIH KECIL & RAMPING) */}
      <AnimatePresence>
        {(showAddModal || editingProduct) && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => {
              setShowAddModal(false);
              setEditingProduct(null);
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="max-w-lg w-full mx-auto p-5 rounded-2xl max-h-[90vh] overflow-y-auto"
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
              <motion.h3
                className="mb-4 uppercase"
                style={{
                  fontFamily: 'var(--font-outfit), sans-serif',
                  fontSize: '20px',
                  color: colors.text
                }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </motion.h3>

              <form onSubmit={editingProduct ? handleEditProduct : handleAddProduct}>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Product Name (Full Width) */}
                  <motion.div
                    className="col-span-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <label
                      className="block mb-1"
                      style={{
                        fontFamily: 'var(--font-space), sans-serif',
                        fontWeight: 700,
                        fontSize: '12px',
                        letterSpacing: '0.5px',
                        color: colors.text
                      }}
                    >
                      NAMA PRODUK *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl outline-none transition-all duration-300"
                      style={{
                        fontFamily: 'var(--font-space), sans-serif',
                        fontWeight: 500,
                        fontSize: '13px',
                        backgroundColor: colors.bg,
                        color: colors.text,
                        border: `2px solid ${colors.border}`,
                        ...neumorphInset
                      }}
                      placeholder="Masukkan nama produk"
                    />
                  </motion.div>

                  {/* SKU */}
                  <motion.div
                    className="col-span-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                  >
                    <label
                      className="block mb-1"
                      style={{
                        fontFamily: 'var(--font-space), sans-serif',
                        fontWeight: 700,
                        fontSize: '12px',
                        letterSpacing: '0.5px',
                        color: colors.text
                      }}
                    >
                      SKU *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl outline-none transition-all duration-300"
                      style={{
                        fontFamily: 'var(--font-space), sans-serif',
                        fontWeight: 500,
                        fontSize: '13px',
                        backgroundColor: colors.bg,
                        color: colors.text,
                        border: `2px solid ${colors.border}`,
                        ...neumorphInset
                      }}
                      placeholder="Masukkan SKU"
                    />
                  </motion.div>

                  {/* Category */}
                  <motion.div
                    className="col-span-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <label
                      className="block mb-1"
                      style={{
                        fontFamily: 'var(--font-space), sans-serif',
                        fontWeight: 700,
                        fontSize: '12px',
                        letterSpacing: '0.5px',
                        color: colors.text
                      }}
                    >
                      KATEGORI *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl outline-none transition-all duration-300"
                      style={{
                        fontFamily: 'var(--font-space), sans-serif',
                        fontWeight: 500,
                        fontSize: '13px',
                        backgroundColor: colors.bg,
                        color: colors.text,
                        border: `2px solid ${colors.border}`,
                        ...neumorphInset
                      }}
                    >
                      <option value="" style={{ backgroundColor: colors.bgSecondary }}>Pilih kategori</option>
                      <option value="Jeans" style={{ backgroundColor: colors.bgSecondary }}>Jeans</option>
                      <option value="Jackets" style={{ backgroundColor: colors.bgSecondary }}>Jaket</option>
                      <option value="Shirts" style={{ backgroundColor: colors.bgSecondary }}>Kemeja</option>
                      <option value="Accessories" style={{ backgroundColor: colors.bgSecondary }}>Aksesoris</option>
                    </select>
                  </motion.div>

                  {/* Price */}
                  <motion.div
                    className="col-span-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <label
                      className="block mb-1"
                      style={{
                        fontFamily: 'var(--font-space), sans-serif',
                        fontWeight: 700,
                        fontSize: '12px',
                        letterSpacing: '0.5px',
                        color: colors.text
                      }}
                    >
                      HARGA (Rp) *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl outline-none transition-all duration-300"
                      style={{
                        fontFamily: 'var(--font-space), sans-serif',
                        fontWeight: 500,
                        fontSize: '13px',
                        backgroundColor: colors.bg,
                        color: colors.text,
                        border: `2px solid ${colors.border}`,
                        ...neumorphInset
                      }}
                      placeholder="Masukkan harga"
                    />
                  </motion.div>

                  {/* Stock */}
                  <motion.div
                    className="col-span-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >
                    <label
                      className="block mb-1"
                      style={{
                        fontFamily: 'var(--font-space), sans-serif',
                        fontWeight: 700,
                        fontSize: '12px',
                        letterSpacing: '0.5px',
                        color: colors.text
                      }}
                    >
                      STOK *
                    </label>
                    <input
                      type="number"
                      required
                      disabled={formData.category !== "Accessories" && formData.category !== "Aksesoris" && sizes.length > 0}
                      value={formData.category !== "Accessories" && formData.category !== "Aksesoris" && sizes.length > 0 ? sizes.reduce((sum, s) => sum + s.stock, 0) : formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl outline-none transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed"
                      style={{
                        fontFamily: 'var(--font-space), sans-serif',
                        fontWeight: 500,
                        fontSize: '13px',
                        backgroundColor: colors.bg,
                        color: colors.text,
                        border: `2px solid ${colors.border}`,
                        ...neumorphInset
                      }}
                      placeholder="Jumlah"
                    />
                  </motion.div>

                  {/* Description (Full Width) */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    className="col-span-2"
                  >
                    <label
                      className="block mb-1"
                      style={{
                        fontFamily: 'var(--font-space), sans-serif',
                        fontWeight: 700,
                        fontSize: '12px',
                        letterSpacing: '0.5px',
                        color: colors.text
                      }}
                    >
                      DESKRIPSI
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl outline-none transition-all duration-300 min-h-[70px]"
                      style={{
                        fontFamily: 'var(--font-space), sans-serif',
                        fontWeight: 500,
                        fontSize: '13px',
                        backgroundColor: colors.bg,
                        color: colors.text,
                        border: `2px solid ${colors.border}`,
                        ...neumorphInset
                      }}
                      placeholder="Masukkan deskripsi"
                    />
                  </motion.div>

                  {/* Ukuran dan Stok Celana/Pakaian (Full Width) */}
                  {formData.category !== "Accessories" && formData.category !== "Aksesoris" && formData.category !== "" && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.62 }}
                      className="col-span-2 p-3.5 rounded-xl border border-dashed flex flex-col gap-2.5"
                      style={{ borderColor: colors.border }}
                    >
                      <h4 className="text-[12px] font-bold uppercase tracking-wider" style={{ color: colors.text }}>
                        Ukuran & Stok Celana/Pakaian
                      </h4>

                      {/* Presets */}
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            const presetSizes = ["28", "29", "30", "31", "32", "33", "34", "36", "38", "40"];
                            const newSizes = presetSizes.map(s => {
                              const existing = sizes.find(x => x.size === s);
                              return { size: s, stock: existing ? existing.stock : 0 };
                            });
                            setSizes(newSizes);
                          }}
                          className="px-2.5 py-1 text-[10px] font-bold rounded-lg hover:opacity-85 transition"
                          style={{ backgroundColor: colors.accent, color: '#FFFFFF', ...neumorph }}
                        >
                          Preset Celana (28-40)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const presetSizes = ["S", "M", "L", "XL", "XXL"];
                            const newSizes = presetSizes.map(s => {
                              const existing = sizes.find(x => x.size === s);
                              return { size: s, stock: existing ? existing.stock : 0 };
                            });
                            setSizes(newSizes);
                          }}
                          className="px-2.5 py-1 text-[10px] font-bold rounded-lg hover:opacity-85 transition"
                          style={{ backgroundColor: colors.accent, color: '#FFFFFF', ...neumorph }}
                        >
                          Preset Baju (S-XXL)
                        </button>
                      </div>

                      {/* Comma-separated Input */}
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          id="quick-add-sizes"
                          placeholder="Tambah banyak ukuran, pisahkan koma (contoh: 28, 29, 30)"
                          className="flex-1 px-3 py-2 rounded-xl outline-none text-[12px]"
                          style={{
                            fontFamily: 'var(--font-space), sans-serif',
                            fontWeight: 500,
                            backgroundColor: colors.bg,
                            color: colors.text,
                            border: `2px solid ${colors.border}`,
                            ...neumorphInset
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = (e.currentTarget as HTMLInputElement).value;
                              if (val.trim()) {
                                const parsed = val.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
                                const updated = [...sizes];
                                parsed.forEach(s => {
                                  if (!updated.some(x => x.size === s)) {
                                    updated.push({ size: s, stock: 0 });
                                  }
                                });
                                setSizes(updated);
                                (e.currentTarget as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const inputEl = document.getElementById('quick-add-sizes') as HTMLInputElement;
                            const val = inputEl?.value;
                            if (val?.trim()) {
                              const parsed = val.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
                              const updated = [...sizes];
                              parsed.forEach(s => {
                                if (!updated.some(x => x.size === s)) {
                                  updated.push({ size: s, stock: 0 });
                                }
                              });
                              setSizes(updated);
                              inputEl.value = '';
                            }
                          }}
                          className="px-4 py-2 text-[12px] font-bold rounded-xl hover:opacity-85 transition shrink-0"
                          style={{ backgroundColor: colors.accent, color: '#FFFFFF', ...neumorph }}
                        >
                          Tambah
                        </button>
                      </div>

                      {/* Sizes list with stocks */}
                      {sizes.length > 0 ? (
                        <div className="max-h-[160px] overflow-y-auto pr-1 flex flex-col gap-2 border-t pt-2 mt-1" style={{ borderColor: colors.border }}>
                          {sizes.map((sz, idx) => (
                            <div key={sz.size} className="flex items-center justify-between gap-3 bg-black/5 p-1.5 rounded-lg">
                              <span className="text-[12px] font-bold ml-1" style={{ color: colors.text }}>
                                Ukuran {sz.size}
                              </span>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px]" style={{ color: colors.textSecondary }}>Stok:</span>
                                <input
                                  type="number"
                                  min="0"
                                  required
                                  value={sz.stock}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    const updated = [...sizes];
                                    updated[idx].stock = val;
                                    setSizes(updated);
                                  }}
                                  className="w-16 px-2 py-1 rounded-lg border outline-none text-center text-xs"
                                  style={{
                                    backgroundColor: colors.bg,
                                    color: colors.text,
                                    borderColor: colors.border,
                                    ...neumorphInset
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSizes(sizes.filter(x => x.size !== sz.size));
                                  }}
                                  className="text-red-500 hover:text-red-700 font-bold text-xs mr-1"
                                >
                                  Hapus
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] italic text-center py-2" style={{ color: colors.textSecondary }}>
                          Belum ada ukuran yang ditambahkan. Gunakan preset atau ketik manual di atas.
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* Upload Images (Full Width) */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.65 }}
                    className="col-span-2"
                  >
                    <label
                      className="block mb-1"
                      style={{
                        fontFamily: 'var(--font-space), sans-serif',
                        fontWeight: 700,
                        fontSize: '12px',
                        letterSpacing: '0.5px',
                        color: colors.text
                      }}
                    >
                      UPLOAD GAMBAR PRODUK
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="w-full px-3 py-2 rounded-xl outline-none transition-all duration-300"
                      style={{
                        fontFamily: 'var(--font-space), sans-serif',
                        fontWeight: 500,
                        fontSize: '13px',
                        backgroundColor: colors.bg,
                        color: colors.text,
                        border: `2px solid ${colors.border}`,
                        ...neumorphInset
                      }}
                    />
                    {uploading && (
                      <p className="mt-1 text-[11px]" style={{ color: colors.textSecondary }}>
                        Mengunggah gambar...
                      </p>
                    )}
                    {uploadError && (
                      <p className="mt-1 text-[11px]" style={{ color: '#EF4444' }}>
                        {uploadError}
                      </p>
                    )}
                    {parseImages(formData.images).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {parseImages(formData.images).map((img) => (
                          <div key={img} className="relative h-12 w-12 overflow-hidden rounded border" style={{ borderColor: colors.border }}>
                            <img src={img} alt="Preview" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(img)}
                              className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full text-[10px] flex items-center justify-center"
                              style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFFFFF' }}
                              aria-label="Remove image"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingProduct(null);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl"
                    style={{
                      fontFamily: 'var(--font-space), sans-serif',
                      fontWeight: 700,
                      fontSize: '12px',
                      color: colors.textMuted,
                      backgroundColor: colors.bg
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  >
                    BATALKAN
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl"
                    style={{
                      fontFamily: 'var(--font-space), sans-serif',
                      fontWeight: 800,
                      fontSize: '12px',
                      letterSpacing: '1px',
                      backgroundColor: colors.accent,
                      color: '#FFFFFF',
                      ...neumorph
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                  >
                    {editingProduct ? 'PERBARUI' : 'TAMBAH'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm pointer-events-auto">
          <div
            className="rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col p-6 border"
            style={{ backgroundColor: colors.bg, borderColor: colors.border }}
          >
            <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>Hapus Produk</h3>
            <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
              Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg font-medium text-sm transition"
                style={{ backgroundColor: colors.bgSecondary, color: colors.text }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeleteProduct}
                className="px-4 py-2 rounded-lg font-medium text-sm text-white bg-red-600 hover:bg-red-700 transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}