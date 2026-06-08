"use client";

import { Package, Plus, Edit, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { getThemeColors } from '../theme';
import { ThemeToggle } from '@/core/components/shared/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  description?: string;
  images?: string[];
}

export default function AdminProducts() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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
      .split(',')
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
        const form = new FormData();
        form.append('file', file);

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
      alert('Please wait for image upload to finish.');
      return;
    }
    const images = parseImages(formData.images);
    const priceValue = parsePrice(formData.price);
    if (Number.isNaN(priceValue)) {
      alert('Please enter a valid price.');
      return;
    }
    if (images.length === 0) {
      alert('Please upload at least one product image.');
      return;
    }
    try {
      const newProduct = {
        name: formData.name,
        sku: formData.sku,
        price: priceValue,
        stock: parseInt(formData.stock),
        category: formData.category,
        description: formData.description || 'No description',
        images,
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
        alert('Product added successfully!');
      } else {
        alert(data.message || 'Failed to add product');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      if (uploading) {
        alert('Please wait for image upload to finish.');
        return;
      }
      try {
        const images = parseImages(formData.images);
        const priceValue = parsePrice(formData.price);
        if (Number.isNaN(priceValue)) {
          alert('Please enter a valid price.');
          return;
        }
        const updatedProduct = {
          name: formData.name,
          sku: formData.sku,
          price: priceValue,
          stock: parseInt(formData.stock),
          category: formData.category,
          description: formData.description,
          images,
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
          alert('Product updated successfully!');
        } else {
          alert(data.message || 'Failed to update product');
        }
      } catch (err) {
        alert('Network error');
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (data.success) {
          setProducts(products.filter(p => p._id !== id));
          alert('Product deleted successfully!');
        } else {
          alert(data.message || 'Failed to delete product');
        }
      } catch (err) {
        alert('Network error');
      }
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
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
                    fontFamily: 'var(--font-playfair), serif',
                    color: colors.text
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Product Management
                </motion.h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <motion.button
                onClick={() => {
                  setEditingProduct(null);
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
                ADD PRODUCT
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
                <Loader2 className="animate-spin" /> Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No products found. Add one!
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
                      PRODUCT NAME
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
                      CATEGORY
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
                      PRICE
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
                      STOCK
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
                        {product.stock} units
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
              className="max-w-md w-full mx-auto p-5 rounded-2xl"
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
                  fontFamily: 'var(--font-playfair), serif',
                  fontSize: '20px',
                  color: colors.text
                }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {editingProduct ? 'Edit Product' : 'Add New Product'}
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
                      PRODUCT NAME *
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
                      placeholder="Enter product name"
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
                      placeholder="Enter SKU"
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
                      CATEGORY *
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
                      <option value="" style={{ backgroundColor: colors.bgSecondary }}>Select category</option>
                      <option value="Jeans" style={{ backgroundColor: colors.bgSecondary }}>Jeans</option>
                      <option value="Jackets" style={{ backgroundColor: colors.bgSecondary }}>Jackets</option>
                      <option value="Shirts" style={{ backgroundColor: colors.bgSecondary }}>Shirts</option>
                      <option value="Accessories" style={{ backgroundColor: colors.bgSecondary }}>Accessories</option>
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
                      PRICE (Rp) *
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
                      placeholder="Enter price"
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
                      STOCK *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
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
                      placeholder="Qty"
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
                      DESCRIPTION
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
                      placeholder="Enter description"
                    />
                  </motion.div>

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
                      UPLOAD PRODUCT IMAGES
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
                        Uploading images...
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
                    CANCEL
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
                    {editingProduct ? 'UPDATE' : 'ADD'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}