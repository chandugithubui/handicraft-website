/**
 * src/pages/admin/AdminProducts.tsx
 *
 * Admin Product Catalog management page with server pagination,
 * image uploading, category filtering, search, and add/edit/delete operations.
 * Styled with Indian Artisan Theme (Maroon #6E1717, Terracotta #C85A2E, Gold #C99A4A).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  FiBox,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiUploadCloud,
  FiImage,
  FiCheckCircle,
  FiRefreshCw,
  FiX,
  FiLayers,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { http } from '../../services/apiClient';
import {
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  uploadProductImage,
} from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';

const CATEGORIES = [
  'All',
  'Pottery',
  'Woodwork',
  'Textiles',
  'Jewelry',
  'Home Decor',
  'Paintings',
  'Metal Crafts',
];

const EMPTY_PRODUCT_FORM = {
  name: '',
  price: '',
  originalPrice: '',
  description: '',
  category: 'Pottery',
  material: '',
  stock: '10',
  featured: false,
  imageUrl: '',
};

export const AdminProducts: React.FC = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Modals & form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);
  const [formData, setFormData] = useState(EMPTY_PRODUCT_FORM);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchProducts = useCallback(async (page: number = currentPage) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (categoryFilter !== 'All') {
        params.append('category', categoryFilter);
      }
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const res = await http.get<any>(`/products?${params.toString()}`);
      if (res?.products) {
        setProducts(res.products);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalProducts(res.pagination?.totalProducts || res.products.length);
      } else if (Array.isArray(res)) {
        setProducts(res);
        setTotalPages(1);
        setTotalProducts(res.length);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, searchTerm, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchProducts(1);
  }, [categoryFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts(page);
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData(EMPTY_PRODUCT_FORM);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      price: product.price?.toString() || '',
      originalPrice: product.originalPrice?.toString() || '',
      description: product.description || '',
      category: product.category || 'Pottery',
      material: product.material || '',
      stock: product.stock?.toString() || '10',
      featured: Boolean(product.featured || product.isFeatured),
      imageUrl: product.imageUrl || product.images?.[0] || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageUploading(true);
      const res = await uploadProductImage(file, token);
      if (res?.imageUrl) {
        setFormData((prev) => ({ ...prev, imageUrl: res.imageUrl }));
        showToast('Image uploaded successfully');
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      setFormError('Product title and price are required.');
      return;
    }

    try {
      setFormSaving(true);
      setFormError('');

      const payload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        description: formData.description,
        category: formData.category,
        material: formData.material,
        stock: parseInt(formData.stock, 10) || 0,
        featured: formData.featured,
        imageUrl: formData.imageUrl,
        images: formData.imageUrl ? [formData.imageUrl] : [],
      };

      if (editingProduct) {
        await updateAdminProduct(editingProduct._id, payload, token);
        showToast('Product updated successfully!');
      } else {
        await createAdminProduct(payload, token);
        showToast('New product created successfully!');
      }

      setIsModalOpen(false);
      fetchProducts(currentPage);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      await deleteAdminProduct(deletingProduct._id, token);
      showToast('Product removed from catalog');
      setDeletingProduct(null);
      fetchProducts(currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#6E1717] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-slide-up border border-[#C99A4A]">
          <FiCheckCircle className="w-4 h-4 text-[#C99A4A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#292522]">Products Catalog</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage handcrafted inventory, set pricing, upload artisan photos, and highlight featured crafts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchProducts(currentPage)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EBD8BC] text-gray-700 text-xs font-semibold hover:bg-[#FFF8ED] transition-colors shadow-xs"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6E1717] text-white text-xs font-bold hover:bg-[#4B0F0F] transition-colors shadow-xs"
          >
            <FiPlus className="w-4 h-4 text-[#C99A4A]" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#EBD8BC]/60 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80 flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by title, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#FFFDF9] border border-[#EBD8BC] rounded-xl text-xs focus:outline-hidden focus:border-[#6E1717]"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-[#6E1717] text-white rounded-xl text-xs font-semibold hover:bg-[#4B0F0F] transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
            <FiLayers className="w-3.5 h-3.5" />
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                categoryFilter === cat
                  ? 'bg-[#6E1717] text-white border-[#6E1717] shadow-xs'
                  : 'bg-[#FFFDF9] text-gray-600 border-[#EBD8BC]/60 hover:bg-[#FFF8ED]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#EBD8BC]/60 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center">
            <LoadingSpinner message="Loading product catalog..." />
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center">
            <FiBox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">No products found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              No products match your current search or category filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left border-collapse">
              <thead>
                <tr className="bg-[#FFFDF9] border-b border-gray-100 text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {products.map((p) => {
                  const img = p.imageUrl || p.images?.[0];
                  return (
                    <tr key={p._id} className="hover:bg-[#FFFDF9] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                            {img ? (
                              <img
                                src={img.startsWith('http') || img.startsWith('/') ? img : `/${img}`}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FiImage className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{p.name}</p>
                            <p className="text-[11px] text-gray-400 line-clamp-1 max-w-xs">
                              {p.material ? `Material: ${p.material}` : p.description || '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FFF8ED] text-[#C85A2E] border border-[#EBD8BC]/50">
                          {p.category || 'Craft'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900 font-serif">
                        {formatCurrency(p.price || 0)}
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="block text-[11px] font-normal text-gray-400 line-through">
                            {formatCurrency(p.originalPrice)}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold ${
                            p.stock > 5 ? 'text-gray-700' : 'text-amber-600'
                          }`}
                        >
                          {p.stock ?? 0} in stock
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {p.featured || p.isFeatured ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF8ED] text-[#C99A4A] border border-[#EBD8BC]">
                            ★ Featured
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-[#6E1717] hover:bg-[#FFF8ED] transition-colors"
                            title="Edit Product"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(p)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Product"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalProducts}
          pageSize={10}
          itemName="products"
          onPageChange={handlePageChange}
        />
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#EBD8BC] p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold font-serif text-[#292522]">
                {editingProduct ? 'Edit Artisan Product' : 'Add New Artisan Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Handmade Terracotta Water Jug"
                  className="w-full px-3 py-2 bg-[#FFFDF9] border border-[#EBD8BC] rounded-xl focus:outline-hidden focus:border-[#6E1717] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Price (INR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="999"
                    className="w-full px-3 py-2 bg-[#FFFDF9] border border-[#EBD8BC] rounded-xl focus:outline-hidden focus:border-[#6E1717] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Original / MRP Price (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="1299"
                    className="w-full px-3 py-2 bg-[#FFFDF9] border border-[#EBD8BC] rounded-xl focus:outline-hidden focus:border-[#6E1717] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFDF9] border border-[#EBD8BC] rounded-xl focus:outline-hidden focus:border-[#6E1717] text-xs"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFDF9] border border-[#EBD8BC] rounded-xl focus:outline-hidden focus:border-[#6E1717] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Material / Craft Technique
                </label>
                <input
                  type="text"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  placeholder="e.g. Natural Clay, Sheesham Wood, Pure Brass"
                  className="w-full px-3 py-2 bg-[#FFFDF9] border border-[#EBD8BC] rounded-xl focus:outline-hidden focus:border-[#6E1717] text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the artisan craft, cultural heritage, and care instructions..."
                  className="w-full px-3 py-2 bg-[#FFFDF9] border border-[#EBD8BC] rounded-xl focus:outline-hidden focus:border-[#6E1717] text-xs"
                />
              </div>

              {/* Image Upload / URL */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Product Image (File Upload or URL)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://... or /uploads/..."
                    className="flex-1 px-3 py-2 bg-[#FFFDF9] border border-[#EBD8BC] rounded-xl focus:outline-hidden focus:border-[#6E1717] text-xs"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFF8ED] hover:bg-[#F4E5D0] text-[#6E1717] text-xs font-semibold transition-colors border border-[#EBD8BC]">
                    <FiUploadCloud className="w-4 h-4" />
                    <span>{imageUploading ? 'Uploading…' : 'Browse'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={imageUploading}
                      className="hidden"
                    />
                  </label>
                </div>
                {formData.imageUrl && (
                  <div className="mt-2 w-16 h-16 rounded-xl border border-[#EBD8BC] overflow-hidden bg-gray-50">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured-checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 text-[#6E1717] rounded border-gray-300 focus:ring-[#6E1717]"
                />
                <label htmlFor="featured-checkbox" className="font-semibold text-gray-700 cursor-pointer">
                  Feature on Storefront Homepage
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#6E1717] hover:bg-[#4B0F0F] rounded-xl transition-colors shadow-xs"
                >
                  {formSaving ? 'Saving…' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <FiTrash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 font-serif">Delete Product</h3>
            <p className="text-xs text-gray-500 mt-2">
              Are you sure you want to permanently delete{' '}
              <span className="font-bold text-gray-800">"{deletingProduct.name}"</span>?
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
