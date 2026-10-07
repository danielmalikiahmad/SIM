import React, { useState, useMemo } from 'react';
import { Product, Purchase, PurchaseItem } from '../types';
import { 
  TrendingUp, 
  Plus, 
  Trash2, 
  User, 
  PlusCircle, 
  Calendar, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  Clock,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PurchaseManagementProps {
  products: Product[];
  purchases: Purchase[];
  onAddPurchase: (purchase: Purchase) => void;
  onIncreaseStocks: (items: { id: string; quantityToAdd: number; costPriceToUpdate?: number }[]) => void;
}

export default function PurchaseManagement({ 
  products, 
  purchases, 
  onAddPurchase, 
  onIncreaseStocks 
}: PurchaseManagementProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'history' | 'add'>('history');

  // Purchase History collapser
  const [expandedPurchaseId, setExpandedPurchaseId] = useState<string | null>(null);

  // New Purchase Form state
  const [supplierName, setSupplierName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [cartItems, setCartItems] = useState<Array<{ productId: string; quantity: number; purchasePrice: number }>>([]);

  // Temp state for adding item to the form cart
  const [selectedProductId, setSelectedProductId] = useState('');
  const [tempQty, setTempQty] = useState('');
  const [tempPrice, setTempPrice] = useState('');

  // Auto set price when product selected in temp fields
  const handleProductSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedProductId(id);
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setTempPrice(String(prod.purchasePrice));
    } else {
      setTempPrice('');
    }
  };

  // Add Item to the purchasing cart
  const handleAddItemToFormCart = () => {
    if (!selectedProductId) return;
    const qty = parseFloat(tempQty) || 0;
    const price = parseFloat(tempPrice) || 0;

    if (qty <= 0 || price <= 0) {
      alert('Jumlah (Kg) dan Harga Beli harus lebih besar dari 0!');
      return;
    }

    // Check if already in cart
    const existsIndex = cartItems.findIndex(it => it.productId === selectedProductId);
    if (existsIndex > -1) {
      const updated = [...cartItems];
      updated[existsIndex].quantity += qty;
      updated[existsIndex].purchasePrice = price; // update with latest price
      setCartItems(updated);
    } else {
      setCartItems([...cartItems, { productId: selectedProductId, quantity: qty, purchasePrice: price }]);
    }

    // Reset temp fields
    setSelectedProductId('');
    setTempQty('');
    setTempPrice('');
  };

  // Remove item from form cart
  const handleRemoveFromFormCart = (productId: string) => {
    setCartItems(cartItems.filter(it => it.productId !== productId));
  };

  // Calculate Form Cart Total
  const cartTotalAmount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.purchasePrice * item.quantity, 0);
  }, [cartItems]);

  // Submit purchase
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierName.trim()) {
      alert('Nama Supplier wajib diisi!');
      return;
    }

    if (cartItems.length === 0) {
      alert('Tambahkan minimal 1 jenis ikan asin ke dalam daftar pembelian!');
      return;
    }

    // Generate Invoice
    const todayStr = purchaseDate.replace(/-/g, '');
    const todaysPurchasesCount = purchases.filter(p => p.invoiceNumber.includes(`INV-PR-${todayStr}`)).length;
    const serial = String(todaysPurchasesCount + 1).padStart(2, '0');
    const invoiceNumber = `INV-PR-${todayStr}-${serial}`;

    const purchaseItems: PurchaseItem[] = cartItems.map((item) => {
      const prod = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: prod ? prod.name : 'Ikan Asin',
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        total: item.purchasePrice * item.quantity
      };
    });

    const newPurchase: Purchase = {
      id: `PR-${Math.random().toString(36).substr(2, 9)}`,
      invoiceNumber,
      date: purchaseDate,
      items: purchaseItems,
      totalAmount: cartTotalAmount,
      supplierName: supplierName.trim(),
      notes: notes.trim() || undefined
    };

    // 1. Save to purchases log
    onAddPurchase(newPurchase);

    // 2. Increase stock levels in database
    const stockAdditionRequests = cartItems.map(item => ({
      id: item.productId,
      quantityToAdd: item.quantity,
      costPriceToUpdate: item.purchasePrice // update product baseline cost if changed!
    }));
    onIncreaseStocks(stockAdditionRequests);

    // Reset Form
    setCartItems([]);
    setSupplierName('');
    setNotes('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setActiveTab('history');
    setExpandedPurchaseId(newPurchase.id); // Expand the newly created log!
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const toggleExpand = (id: string) => {
    if (expandedPurchaseId === id) {
      setExpandedPurchaseId(null);
    } else {
      setExpandedPurchaseId(id);
    }
  };

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight">Transaksi Pembelian Stok</h2>
          <p className="text-slate-500 text-sm">
            Catat transaksi pembelian ikan asin dari supplier nelayan untuk meningkatkan stok secara otomatis.
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-white/30">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'history'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Riwayat Pembelian ({purchases.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`pb-3 text-sm font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'add'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Pencatatan Belanja Baru
          </button>
        </nav>
      </div>

      {/* Tabs Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'history' ? (
          <motion.div
            key="history-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {purchases.length > 0 ? (
              <div className="space-y-3">
                {purchases.map((pr) => {
                  const isExpanded = expandedPurchaseId === pr.id;
                  return (
                    <div 
                      key={pr.id} 
                      className={`glass-card rounded-2xl border transition-all ${
                        isExpanded ? 'border-amber-500/40 bg-white/60 shadow-md shadow-amber-500/5' : 'border-white/60 shadow-sm'
                      }`}
                    >
                      {/* Collapsible Header row */}
                      <div 
                        onClick={() => toggleExpand(pr.id)}
                        className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-4">
                          <span className="h-10 w-10 bg-white/60 text-slate-500 rounded-xl flex items-center justify-center shrink-0 border border-white/50">
                            <FileText className="w-5 h-5 text-amber-600" />
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-extrabold text-slate-900 font-mono">{pr.invoiceNumber}</h4>
                              <span className="text-slate-300">•</span>
                              <p className="text-xs text-slate-500 font-bold">{pr.supplierName}</p>
                            </div>
                            <div className="flex items-center gap-3.5 text-[11px] text-slate-400 mt-1">
                              <span className="flex items-center gap-1 font-bold">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{new Date(pr.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                              </span>
                              <span>•</span>
                              <span className="font-bold">{pr.items.reduce((total, item) => total + item.quantity, 0)} Kg ({pr.items.length} jenis ikan)</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-end md:self-center">
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Biaya</p>
                            <p className="text-base font-black font-mono text-slate-950">{formatRupiah(pr.totalAmount)}</p>
                          </div>
                          <span className="p-1 text-slate-400 hover:text-slate-600 rounded">
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-amber-600" /> : <ChevronDown className="w-4 h-4 text-amber-600" />}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Section */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-1.5 border-t border-white/30">
                          {/* Invoice item table */}
                          <div className="overflow-x-auto rounded-xl border border-white/40 bg-white/30">
                            <table className="glass-table w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-white/45 border-b border-white/40 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  <th className="px-4 py-2.5 font-mono">ID</th>
                                  <th className="px-4 py-2.5">Nama Ikan Asin</th>
                                  <th className="px-4 py-2.5 text-right">Vol Masuk (Kg)</th>
                                  <th className="px-4 py-2.5 text-right">Harga Satuan (Rp/Kg)</th>
                                  <th className="px-4 py-2.5 text-right">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/30 font-semibold">
                                {pr.items.map((item, index) => (
                                  <tr key={index}>
                                    <td className="px-4 py-2.5 font-mono font-bold text-slate-400">{item.productId}</td>
                                    <td className="px-4 py-2.5 text-slate-800">{item.productName}</td>
                                    <td className="px-4 py-2.5 text-right font-mono text-slate-900 font-bold">{item.quantity} Kg</td>
                                    <td className="px-4 py-2.5 text-right font-mono text-slate-500">{formatRupiah(item.purchasePrice)}</td>
                                    <td className="px-4 py-2.5 text-right font-mono text-slate-900 font-extrabold">{formatRupiah(item.total)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Notes if present */}
                          {pr.notes && (
                            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/15 rounded-xl text-[11px] text-amber-800 font-semibold">
                              <span className="font-bold">Catatan Pembelian:</span> {pr.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card p-12 border border-white/60 flex flex-col items-center justify-center text-center text-slate-400">
                <Clock className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-500">Belum ada riwayat pembelian</p>
                <p className="text-xs text-slate-400 mt-0.5">Silakan tambahkan pencatatan belanja baru.</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="add-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Column: Invoice Parameters */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="glass-card p-5 border border-white/60 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Parameter Pengiriman</h3>

                {/* Supplier */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Nama Supplier *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      placeholder="Contoh: PT Nelayan Mandiri"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white/50 border border-white/40 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-semibold"
                    />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Tanggal Pembelian *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <input
                      type="date"
                      required
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white/50 border border-white/40 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-semibold"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Keterangan Belanja (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Titipan nelayan Blok A..."
                    className="w-full px-3 py-2 text-xs bg-white/50 border border-white/40 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-semibold resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Adding Items & Shopping cart list */}
            <form onSubmit={handleFormSubmit} className="lg:col-span-8 glass-card p-5 border border-white/60 flex flex-col h-[600px] shadow-xl">
              <h3 className="text-sm font-bold text-slate-900 mb-3.5">Detail Item Belanja</h3>

              {/* Selector toolbar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3.5 bg-white/50 border border-white/40 rounded-xl mb-4">
                {/* Select product */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Pilih Produk Ikan Asin
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={handleProductSelectionChange}
                    className="w-full px-2.5 py-1.5 text-xs bg-white/50 border border-white/40 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-semibold"
                  >
                    <option value="">-- Pilih Ikan --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stok: {p.stock} Kg)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vol Kg */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Volume Masuk (Kg)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    value={tempQty}
                    onChange={(e) => setTempQty(e.target.value)}
                    placeholder="Contoh: 10"
                    className="w-full px-2.5 py-1.5 text-xs bg-white/50 border border-white/40 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-semibold"
                  />
                </div>

                {/* Unit Price */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Harga Beli (Rp/Kg)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(e.target.value)}
                      placeholder="Beli Satuan"
                      className="w-full px-2.5 py-1.5 text-xs bg-white/50 border border-white/40 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-semibold pr-8"
                    />
                    <button
                      type="button"
                      onClick={handleAddItemToFormCart}
                      disabled={!selectedProductId}
                      className="absolute inset-y-0.5 right-0.5 px-2 bg-amber-500 disabled:bg-slate-300 text-white rounded text-[11px] font-bold cursor-pointer flex items-center justify-center hover:bg-amber-600 transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Shopping cart list */}
              <div className="flex-1 overflow-y-auto space-y-2.5 border-b border-white/30 pb-4 pr-1">
                {cartItems.length > 0 ? (
                  cartItems.map((item) => {
                    const prod = products.find(p => p.id === item.productId);
                    return (
                      <div key={item.productId} className="flex items-center justify-between p-3 border border-white/40 bg-white/40 rounded-xl">
                        <div className="overflow-hidden flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{prod ? prod.name : 'Ikan Asin'}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 font-bold">
                            ID: {item.productId} • {item.quantity} Kg @ {formatRupiah(item.purchasePrice)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 pl-2">
                          <p className="text-xs font-extrabold font-mono text-slate-900">
                            {formatRupiah(item.purchasePrice * item.quantity)}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromFormCart(item.productId)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 bg-white/10 rounded-2xl">
                    <Layers className="w-10 h-10 text-slate-200 mb-2" />
                    <p className="text-xs font-bold text-slate-500">Belum ada item belanja</p>
                    <p className="text-[10px] text-slate-400 mt-1">Pilih produk dan tentukan volume serta harga beli di atas.</p>
                  </div>
                )}
              </div>

              {/* Bill totals and checkout */}
              <div className="pt-4 flex items-center justify-between shrink-0">
                <div>
                  <p className="text-xs text-slate-400 font-bold">Grand Total Pembelian</p>
                  <p className="text-xl font-black font-mono text-amber-600 mt-0.5">{formatRupiah(cartTotalAmount)}</p>
                </div>
                <button
                  type="submit"
                  disabled={cartItems.length === 0 || !supplierName.trim()}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                    cartItems.length > 0 && supplierName.trim()
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/15'
                      : 'bg-white/20 text-slate-400 cursor-not-allowed border border-white/30 shadow-none'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Simpan Stok Masuk</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
