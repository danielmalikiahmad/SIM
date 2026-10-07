import React, { useState, useMemo } from 'react';
import { Product, Sale, SaleItem } from '../types';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  User, 
  FileText, 
  Printer, 
  CheckCircle,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface POSProps {
  products: Product[];
  sales: Sale[];
  onAddSale: (sale: Sale) => void;
  onUpdateStocks: (items: { id: string; quantityToSubtract: number }[]) => void;
}

export default function POS({ products, sales, onAddSale, onUpdateStocks }: POSProps) {
  // POS States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [notes, setNotes] = useState('');
  
  // Receipt State
  const [activeReceipt, setActiveReceipt] = useState<Sale | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const list = new Set(products.map((p) => p.category));
    return ['Semua', ...Array.from(list)];
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Cart actions
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        // Validate stock
        if (existing.quantity >= product.stock) {
          alert(`Stok tidak mencukupi! Hanya tersedia ${product.stock} Kg.`);
          return prevCart;
        }
        return prevCart.map((item) => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.product.id === productId) {
          const targetQty = item.quantity + delta;
          if (targetQty <= 0) return null;
          // Validate stock
          if (targetQty > item.product.stock) {
            alert(`Stok tidak mencukupi! Hanya tersedia ${item.product.stock} Kg.`);
            return item;
          }
          return { ...item, quantity: targetQty };
        }
        return item;
      }).filter(Boolean) as typeof prevCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  // Calculations
  const totalAmount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.sellingPrice * item.quantity, 0);
  }, [cart]);

  const changeAmount = useMemo(() => {
    const pay = parseFloat(paymentAmount) || 0;
    return Math.max(0, pay - totalAmount);
  }, [paymentAmount, totalAmount]);

  const isCheckoutEnabled = useMemo(() => {
    const pay = parseFloat(paymentAmount) || 0;
    return cart.length > 0 && pay >= totalAmount;
  }, [cart, paymentAmount, totalAmount]);

  // Handle Checkout
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCheckoutEnabled) return;

    // Generate Invoice Number format: TRX-YYYYMMDD-XXX
    const today = new Date();
    const dateStr = today.getFullYear() + 
                    String(today.getMonth() + 1).padStart(2, '0') + 
                    String(today.getDate()).padStart(2, '0');
    
    const todaysTransactionsCount = sales.filter(s => s.invoiceNumber.includes(`TRX-${dateStr}`)).length;
    const serial = String(todaysTransactionsCount + 1).padStart(3, '0');
    const invoiceNumber = `TRX-${dateStr}-${serial}`;

    const saleItems: SaleItem[] = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      sellingPrice: item.product.sellingPrice,
      purchasePrice: item.product.purchasePrice, // Required for profitability reporting
      total: item.product.sellingPrice * item.quantity
    }));

    const paymentVal = parseFloat(paymentAmount) || 0;

    const newSale: Sale = {
      id: `SL-${Math.random().toString(36).substr(2, 9)}`,
      invoiceNumber,
      date: today.toISOString().split('T')[0],
      items: saleItems,
      totalAmount,
      paymentAmount: paymentVal,
      changeAmount: paymentVal - totalAmount,
      customerName: customerName.trim() || 'Pelanggan Umum',
      notes: notes.trim() || undefined
    };

    // 1. Save sale history
    onAddSale(newSale);

    // 2. Subtract stocks
    const subtractRequests = cart.map(item => ({
      id: item.product.id,
      quantityToSubtract: item.quantity
    }));
    onUpdateStocks(subtractRequests);

    // 3. Keep for showing receipt modal
    setActiveReceipt(newSale);

    // 4. Reset POS state
    setCart([]);
    setCustomerName('');
    setPaymentAmount('');
    setNotes('');
  };

  // Helper formats
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Trigger print logic
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-1">
      
      {/* Catalog Panel (Left side) */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        <div className="glass-card p-5 space-y-4 border border-white/60">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Katalog Ikan Asin</h3>
              <p className="text-xs text-slate-400 mt-0.5">Pilih produk di bawah ini untuk transaksi penjualan</p>
            </div>
            
            {/* Search */}
            <div className="relative w-full md:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kode atau nama ikan..."
                className="w-full pl-9 pr-3 py-2 bg-white/50 border border-white/45 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Categories Pill Grid */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            <span className="text-xs text-slate-400 mr-1 flex items-center gap-1 font-bold">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>JENIS:</span>
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-bold rounded-full border transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/10'
                    : 'bg-white/40 text-slate-600 border-white/50 hover:bg-white/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((prod) => {
              const isLowStock = prod.stock <= prod.minStock;
              const isOutOfStock = prod.stock <= 0;
              const cartItem = cart.find(item => item.product.id === prod.id);
              const qtyInCart = cartItem ? cartItem.quantity : 0;
              const effectiveStock = prod.stock - qtyInCart;

              return (
                <div
                  key={prod.id}
                  onClick={() => !isOutOfStock && effectiveStock > 0 && addToCart(prod)}
                  className={`glass-card glass-card-hover p-4 border transition-all flex flex-col justify-between text-left group select-none ${
                    isOutOfStock 
                      ? 'border-white/30 opacity-55 cursor-not-allowed bg-white/10' 
                      : effectiveStock <= 0 
                        ? 'border-white/30 opacity-70 cursor-not-allowed bg-white/10'
                        : 'border-white/50 hover:border-amber-500/30'
                  }`}
                >
                  <div>
                    {/* Header: ID & Stock Badge */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-mono font-bold text-slate-500 bg-white/60 px-1.5 py-0.5 rounded border border-white/40">
                        {prod.id}
                      </span>
                      {isOutOfStock ? (
                        <span className="text-[9px] font-bold text-rose-800 bg-rose-500/15 px-1.5 py-0.5 rounded border border-rose-500/20">
                          Habis
                        </span>
                      ) : isLowStock ? (
                        <span className="text-[9px] font-bold text-amber-800 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/20">
                          Menipis: {prod.stock} Kg
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-600 bg-white/60 px-1.5 py-0.5 rounded border border-white/45">
                          Stok: {prod.stock} Kg
                        </span>
                      )}
                    </div>

                    {/* Fish Name */}
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-tight">
                      {prod.name}
                    </h4>
                    
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{prod.category}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/30 flex items-end justify-between">
                    <div>
                      <p className="text-[9px] text-slate-400 leading-none">Harga Jual</p>
                      <p className="text-xs font-black font-mono text-slate-900 mt-1">
                        {formatRupiah(prod.sellingPrice)}
                        <span className="text-[10px] font-sans font-normal text-slate-400">/Kg</span>
                      </p>
                    </div>

                    {/* Quantity Indicator inside Grid */}
                    {qtyInCart > 0 && (
                      <span className="h-5 w-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md shadow-amber-500/20 border border-amber-400">
                        {qtyInCart}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full glass-card p-12 border border-white/50 rounded-2xl flex flex-col items-center justify-center text-center text-slate-400">
              <HelpCircle className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-500">Ikan Asin tidak ditemukan</p>
              <p className="text-xs text-slate-400 mt-0.5">Silakan ganti pencarian atau kategori Anda.</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart & Billing Panel (Right side) */}
      <div className="lg:col-span-5">
        <form onSubmit={handleCheckout} className="glass-card bg-white/30 backdrop-blur-xl border border-white/60 shadow-2xl flex flex-col h-[calc(100vh-140px)]">
          
          {/* Cart Header */}
          <div className="p-4 border-b border-white/40 flex items-center justify-between bg-white/20 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900">Keranjang Penjualan</h3>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => setCart([])}
                className="text-xs text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
              >
                Kosongkan
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between gap-2 p-3 border border-white/40 bg-white/30 rounded-xl hover:bg-white/60 transition-all shadow-sm">
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.product.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-mono text-slate-500 font-semibold">{item.product.id}</span>
                      <span className="text-[10px] text-slate-300">•</span>
                      <span className="text-[10px] font-bold text-slate-700 font-mono">{formatRupiah(item.product.sellingPrice)}</span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="h-6 w-6 rounded bg-white/60 border border-white/55 hover:bg-white text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold font-mono text-slate-900 w-8 text-center bg-white/80 border border-white/50 rounded py-0.5 shadow-inner">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="h-6 w-6 rounded bg-white/60 border border-white/55 hover:bg-white text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Total & Delete */}
                  <div className="text-right shrink-0 min-w-[70px] pl-2">
                    <p className="text-xs font-extrabold font-mono text-slate-900">
                      {formatRupiah(item.product.sellingPrice * item.quantity)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-[10px] text-rose-600 hover:text-rose-800 font-bold mt-1 inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-16">
                <ShoppingCart className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-500">Keranjang masih kosong</p>
                <p className="text-[10px] text-slate-400 mt-1">Klik pada katalog produk untuk menambahkan item.</p>
              </div>
            )}
          </div>

          {/* Billing Input Fields */}
          <div className="p-4 border-t border-white/35 bg-white/10 space-y-3 shrink-0">
            {/* Customer Name */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nama Pelanggan (opsional)"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white/50 border border-white/40 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-semibold"
              />
            </div>

            {/* Notes */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <FileText className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan transaksi (opsional)"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white/50 border border-white/40 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-semibold"
              />
            </div>
          </div>

          {/* Calculation Bottom Bar */}
          <div className="p-4 border-t border-white/35 bg-white/20 rounded-b-2xl space-y-4 shrink-0">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                <span>SUBTOTAL PENJUALAN</span>
                <span className="font-mono">{formatRupiah(totalAmount)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Pembayaran Kasir</span>
                <div className="relative w-40">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-[10px] font-bold text-slate-400 pointer-events-none">
                    Rp
                  </span>
                  <input
                    type="text"
                    pattern="[0-9]*"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value.replace(/\D/g, ''))}
                    placeholder="Contoh: 100000"
                    required={cart.length > 0}
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs font-bold font-mono text-slate-900 border border-white/45 bg-white/60 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Kembalian */}
              {cart.length > 0 && (parseFloat(paymentAmount) || 0) > 0 && (
                <div className="flex justify-between items-center pt-2 border-t border-dashed border-white/40">
                  <span className="text-xs font-bold text-slate-500">Kembalian</span>
                  <span className={`text-sm font-bold font-mono ${
                    changeAmount >= 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    {parseFloat(paymentAmount) < totalAmount ? 'Pembayaran Kurang!' : formatRupiah(changeAmount)}
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isCheckoutEnabled}
              className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex justify-center items-center gap-1.5 transition-all cursor-pointer ${
                isCheckoutEnabled 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/10' 
                  : 'bg-white/30 text-slate-400 cursor-not-allowed border border-white/30'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Simpan & Cetak Nota</span>
            </button>
          </div>
        </form>
      </div>

      {/* Invoice Modal Pop-up (Nota) */}
      <AnimatePresence>
        {activeReceipt && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 z-50 print:bg-white print:p-0">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card bg-white rounded-2xl border border-white/65 max-w-md w-full shadow-2xl p-6 relative overflow-hidden flex flex-col print:shadow-none print:border-none"
            >
              {/* Receipt Logo & Header */}
              <div className="text-center pb-4 border-b border-dashed border-slate-200">
                <div className="flex justify-center mb-1.5 print:hidden">
                  <div className="h-10 w-10 bg-amber-500/10 text-amber-700 rounded-full flex items-center justify-center border border-amber-500/20">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">NOTA PENJUALAN</h2>
                <h3 className="text-sm font-black text-amber-600 mt-0.5">CV ABADI</h3>
                <p className="text-[10px] text-slate-400 leading-tight mt-1 px-4">
                  Sentra Ikan Asin Blok C-12, Muara Angke, Pluit, Penjaringan, Jakarta Utara
                </p>
                <p className="text-[10px] text-slate-400 font-semibold">Telp: 0812-3456-7890</p>
              </div>

              {/* Metadata Details */}
              <div className="py-3.5 grid grid-cols-2 gap-y-2 text-[11px] text-slate-600 border-b border-dashed border-slate-100">
                <div>
                  <p className="text-slate-400">No. Nota:</p>
                  <p className="font-bold font-mono text-slate-800">{activeReceipt.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400">Tanggal:</p>
                  <p className="font-medium text-slate-800">{activeReceipt.date}</p>
                </div>
                <div>
                  <p className="text-slate-400">Pelanggan:</p>
                  <p className="font-bold text-slate-800">{activeReceipt.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400">Status:</p>
                  <p className="font-bold text-emerald-600">LUNAS CASH</p>
                </div>
              </div>

              {/* Items List */}
              <div className="py-4 flex-1 space-y-2.5 max-h-60 overflow-y-auto border-b border-dashed border-slate-100">
                {activeReceipt.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <div className="pr-4 overflow-hidden">
                      <p className="font-bold text-slate-800 truncate">{it.productName}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {it.quantity} Kg x {formatRupiah(it.sellingPrice)}
                      </p>
                    </div>
                    <span className="font-bold font-mono text-slate-900 shrink-0">
                      {formatRupiah(it.total)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals & Payments */}
              <div className="py-4 space-y-2 text-xs border border-white/50 bg-slate-500/5 px-3.5 rounded-xl my-4">
                <div className="flex justify-between font-bold text-slate-500">
                  <span>Grand Total</span>
                  <span className="font-mono">{formatRupiah(activeReceipt.totalAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-500">
                  <span>Bayar</span>
                  <span className="font-mono">{formatRupiah(activeReceipt.paymentAmount)}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 pt-1.5 border-t border-slate-200/60 animate-pulse">
                  <span>Kembalian</span>
                  <span className="font-mono text-emerald-600">{formatRupiah(activeReceipt.changeAmount)}</span>
                </div>
              </div>

              {/* Footer Greet */}
              <div className="text-center text-[10px] text-slate-400 leading-tight">
                <p className="font-medium text-slate-500">Terima kasih atas kunjungan Anda!</p>
                <p className="mt-0.5">Barang yang sudah dibeli tidak dapat ditukar kembali.</p>
              </div>

              {/* Actions */}
              <div className="mt-6 grid grid-cols-2 gap-3 print:hidden">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="py-2.5 px-3 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Nota</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReceipt(null)}
                  className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center cursor-pointer"
                >
                  <span>Selesai (OK)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
