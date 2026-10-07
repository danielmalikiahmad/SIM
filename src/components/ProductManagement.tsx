import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  HelpCircle, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductManagementProps {
  products: Product[];
  onAddProduct: (prod: Product) => void;
  onEditProduct: (prod: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export default function ProductManagement({ 
  products, 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct 
}: ProductManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [prodId, setProdId] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [description, setDescription] = useState('');

  // Form errors
  const [errorMsg, setErrorMsg] = useState('');

  // Categories list
  const categories = useMemo(() => {
    const list = new Set(products.map((p) => p.category));
    return ['Semua', ...Array.from(list)];
  }, [products]);

  // Unique categories for select box in form
  const uniqueCategoriesForSelect = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category))).sort();
  }, [products]);

  // Filtered and searched list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Open modal for adding
  const openAddModal = () => {
    setEditingProduct(null);
    // Auto generate ID e.g., P009
    const maxNumeric = products.reduce((max, p) => {
      const num = parseInt(p.id.replace(/\D/g, ''));
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    const nextId = 'P' + String(maxNumeric + 1).padStart(3, '0');
    
    setProdId(nextId);
    setName('');
    setCategory('');
    setPurchasePrice('');
    setSellingPrice('');
    setStock('0');
    setMinStock('10');
    setDescription('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Open modal for editing
  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setProdId(prod.id);
    setName(prod.name);
    setCategory(prod.category);
    setPurchasePrice(String(prod.purchasePrice));
    setSellingPrice(String(prod.sellingPrice));
    setStock(String(prod.stock));
    setMinStock(String(prod.minStock));
    setDescription(prod.description);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!prodId.trim() || !name.trim() || !category.trim()) {
      setErrorMsg('Semua kolom bertanda bintang (*) wajib diisi!');
      return;
    }

    const buyPrice = parseFloat(purchasePrice) || 0;
    const sellPrice = parseFloat(sellingPrice) || 0;
    const stockVal = parseFloat(stock) || 0;
    const minVal = parseFloat(minStock) || 0;

    if (buyPrice <= 0 || sellPrice <= 0) {
      setErrorMsg('Harga Beli dan Harga Jual harus lebih besar dari Rp 0!');
      return;
    }

    if (sellPrice < buyPrice) {
      setErrorMsg('Peringatan: Harga Jual tidak boleh lebih rendah dari Harga Beli (Rugi)!');
      return;
    }

    if (stockVal < 0 || minVal < 0) {
      setErrorMsg('Stok dan Batas Minimum Stok tidak boleh bernilai negatif!');
      return;
    }

    // Check ID unique on ADD
    if (!editingProduct) {
      const exists = products.some(p => p.id.toUpperCase() === prodId.toUpperCase());
      if (exists) {
        setErrorMsg(`ID Produk "${prodId}" sudah terdaftar! Gunakan ID lain.`);
        return;
      }
    }

    const savedProduct: Product = {
      id: prodId.trim().toUpperCase(),
      name: name.trim(),
      category: category.trim(),
      purchasePrice: buyPrice,
      sellingPrice: sellPrice,
      stock: stockVal,
      minStock: minVal,
      description: description.trim(),
    };

    if (editingProduct) {
      onEditProduct(savedProduct);
    } else {
      onAddProduct(savedProduct);
    }

    setIsModalOpen(false);
  };

  // Handle Delete
  const handleDelete = (id: string, productName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${productName}" (ID: ${id}) dari katalog?`)) {
      onDeleteProduct(id);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight">Katalog Data Produk</h2>
          <p className="text-slate-500 text-sm">Kelola informasi harga beli, harga jual, nama, jenis, dan deskripsi produk.</p>
        </div>
        <button
          onClick={openAddModal}
          className="glass-btn-primary flex items-center gap-1.5 px-4.5 py-2.5 text-xs"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-card p-5 border border-white/60 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan ID atau nama produk..."
            className="w-full pl-9.5 pr-4 py-2 text-xs bg-white/50 border border-white/45 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-semibold"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 font-bold shrink-0 uppercase tracking-wider mr-1">KATEGORI:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/15'
                  : 'bg-white/40 text-slate-600 border-white/50 hover:bg-white/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="glass-card border border-white/60 overflow-hidden shadow-xl shadow-slate-200/20">
        <div className="overflow-x-auto">
          <table className="glass-table w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/45 border-b border-white/40 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4 font-mono">ID</th>
                <th className="px-6 py-4">Nama Produk</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4 text-right">Harga Beli</th>
                <th className="px-6 py-4 text-right">Harga Jual</th>
                <th className="px-6 py-4 text-right">Stok (Kg)</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/30 text-xs font-semibold">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-white/40 transition-colors">
                    {/* ID */}
                    <td className="px-6 py-4.5 font-mono font-bold text-slate-500">
                      {prod.id}
                    </td>
                    {/* Name & Desc */}
                    <td className="px-6 py-4.5 max-w-sm">
                      <div className="font-extrabold text-slate-900 leading-tight">{prod.name}</div>
                      {prod.description && (
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{prod.description}</p>
                      )}
                    </td>
                    {/* Category */}
                    <td className="px-6 py-4.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white/60 text-slate-600 border border-white/50 font-mono">
                        {prod.category}
                      </span>
                    </td>
                    {/* Harga Beli */}
                    <td className="px-6 py-4.5 text-right font-mono text-slate-500">
                      {formatRupiah(prod.purchasePrice)}
                    </td>
                    {/* Harga Jual */}
                    <td className="px-6 py-4.5 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(prod.sellingPrice)}
                    </td>
                    {/* Stok Status */}
                    <td className="px-6 py-4.5 text-right">
                      <span className={`font-mono font-bold inline-flex items-center gap-1 ${
                        prod.stock <= prod.minStock 
                          ? 'text-amber-800 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/20 font-black' 
                          : 'text-slate-800'
                      }`}>
                        {prod.stock <= prod.minStock && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-bounce" />}
                        {prod.stock}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 text-amber-700 bg-white/50 border border-white/45 hover:bg-white hover:text-amber-900 rounded-lg transition-colors cursor-pointer"
                          title="Edit Produk"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id, prod.name)}
                          className="p-1.5 text-rose-700 bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/20 hover:text-rose-900 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 bg-white/10">
                    <Info className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-500">Tidak ada data produk</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Cari dengan kata kunci lain atau tambah produk baru.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modal Pop-up */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card bg-white rounded-2xl border border-white/65 max-w-lg w-full shadow-2xl p-6 relative overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/30">
                <h3 className="text-base font-bold text-slate-900">
                  {editingProduct ? 'Ubah Informasi Produk' : 'Tambah Produk Baru'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                {errorMsg && (
                  <div className="p-3 bg-rose-500/10 border-l-4 border-rose-500 text-xs text-rose-800 rounded-r-lg font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {/* ID */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      ID Produk *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!!editingProduct}
                      value={prodId}
                      onChange={(e) => setProdId(e.target.value)}
                      placeholder="Contoh: P009"
                      className="w-full px-3 py-2 text-xs bg-white/50 border border-white/40 rounded-lg text-slate-900 bg-slate-50 font-mono disabled:opacity-55 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                  </div>

                  {/* Kategori */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Jenis / Kategori *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        list="categories-list"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Contoh: Teri, Jambal"
                        className="w-full px-3 py-2 text-xs bg-white/50 border border-white/40 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                      />
                      <datalist id="categories-list">
                        {uniqueCategoriesForSelect.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>

                {/* Nama Produk */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Nama Lengkap Produk *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Ikan Asin Teri Jengki Kering"
                    className="w-full px-3 py-2 text-xs bg-white/50 border border-white/40 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Harga Beli */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Harga Beli per Kg (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      placeholder="Contoh: 45000"
                      className="w-full px-3 py-2 text-xs bg-white/50 border border-white/40 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                  </div>

                  {/* Harga Jual */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Harga Jual per Kg (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      placeholder="Contoh: 60000"
                      className="w-full px-3 py-2 text-xs bg-white/50 border border-white/40 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Stok */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Volume Stok Sekarang (Kg) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="Contoh: 25"
                      className="w-full px-3 py-2 text-xs bg-white/50 border border-white/40 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                  </div>

                  {/* Min Stok */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Batas Minimum Stok Alert (Kg) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={minStock}
                      onChange={(e) => setMinStock(e.target.value)}
                      placeholder="Contoh: 10"
                      className="w-full px-3 py-2 text-xs bg-white/50 border border-white/40 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Deskripsi / Catatan Tambahan (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Contoh: Kualitas super jemuran langsung dari nelayan Pluit, bebas formaldehida..."
                    className="w-full px-3 py-2 text-xs bg-white/50 border border-white/40 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white resize-none"
                  />
                </div>

                {/* Footer buttons */}
                <div className="pt-4 border-t border-white/30 flex justify-end gap-3.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4.5 py-2 bg-white/40 border border-white/45 hover:bg-white/80 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="glass-btn-primary px-5 py-2 text-xs font-bold"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
