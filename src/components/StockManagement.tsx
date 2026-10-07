import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Minus, 
  Database, 
  RefreshCw,
  Search,
  Wrench,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StockManagementProps {
  products: Product[];
  onAdjustStock: (productId: string, newStock: number) => void;
}

export default function StockManagement({ products, onAdjustStock }: StockManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // Adjustment Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('Koreksi Selisih Timbangan');
  const [adjustType, setAdjustType] = useState<'ADD' | 'SUBTRACT'>('ADD');

  // Stock status classifications
  const stockWithStatus = useMemo(() => {
    return products.map((p) => {
      let status: 'CRITICAL' | 'WARNING' | 'HEALTHY' = 'HEALTHY';
      if (p.stock <= 0) {
        status = 'CRITICAL';
      } else if (p.stock <= p.minStock) {
        status = 'WARNING';
      }
      return { ...p, status };
    });
  }, [products]);

  // Filtered list
  const filteredProducts = useMemo(() => {
    return stockWithStatus.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'Semua' ||
                          (statusFilter === 'CRITICAL' && p.status === 'CRITICAL') ||
                          (statusFilter === 'WARNING' && p.status === 'WARNING') ||
                          (statusFilter === 'HEALTHY' && p.status === 'HEALTHY');
      return matchSearch && matchStatus;
    });
  }, [stockWithStatus, searchQuery, statusFilter]);

  // Handle Adjustment Submit
  const handleAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const amount = parseFloat(adjustAmount) || 0;
    if (amount <= 0) {
      alert('Masukkan jumlah penyesuaian yang valid (lebih besar dari 0 Kg)!');
      return;
    }

    let finalStock = selectedProduct.stock;
    if (adjustType === 'ADD') {
      finalStock += amount;
    } else {
      finalStock = Math.max(0, finalStock - amount);
    }

    onAdjustStock(selectedProduct.id, finalStock);
    setSelectedProduct(null);
    setAdjustAmount('');
    setAdjustReason('Koreksi Selisih Timbangan');
  };

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-950 tracking-tight">Manajemen Persediaan & Stok</h2>
        <p className="text-slate-500 text-sm">
          Monitoring persediaan ikan asin real-time, penyusutan bobot, dan rekonsiliasi opname stok fisik gudang.
        </p>
      </div>

      {/* Stock Health Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 flex items-center gap-4.5 border border-rose-500/20 shadow-md shadow-rose-500/5">
          <div className="h-11 w-11 bg-rose-500/10 text-rose-700 rounded-xl flex items-center justify-center shrink-0 border border-rose-500/10">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Stok Habis (0 Kg)</p>
            <h3 className="text-xl font-black font-mono text-slate-900 mt-0.5">
              {stockWithStatus.filter(p => p.status === 'CRITICAL').length} <span className="text-xs font-sans text-slate-500 font-medium">Ikan</span>
            </h3>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4.5 border border-amber-500/20 shadow-md shadow-amber-500/5">
          <div className="h-11 w-11 bg-amber-500/10 text-amber-700 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/10">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Stok Tipis (≤ Limit)</p>
            <h3 className="text-xl font-black font-mono text-slate-900 mt-0.5">
              {stockWithStatus.filter(p => p.status === 'WARNING').length} <span className="text-xs font-sans text-slate-500 font-medium">Ikan</span>
            </h3>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4.5 border border-emerald-500/20 shadow-md shadow-emerald-500/5">
          <div className="h-11 w-11 bg-emerald-500/10 text-emerald-700 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/10">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kondisi Aman</p>
            <h3 className="text-xl font-black font-mono text-slate-900 mt-0.5">
              {stockWithStatus.filter(p => p.status === 'HEALTHY').length} <span className="text-xs font-sans text-slate-500 font-medium">Ikan</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Filter Status */}
      <div className="glass-card p-5 border border-white/60 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode atau nama ikan asin..."
            className="w-full pl-9.5 pr-4 py-2 text-xs bg-white/50 border border-white/45 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-semibold"
          />
        </div>

        {/* Status Tab buttons */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'Semua', label: 'Semua Produk' },
            { id: 'CRITICAL', label: 'Habis (0 Kg)' },
            { id: 'WARNING', label: 'Hampir Habis' },
            { id: 'HEALTHY', label: 'Stok Sehat' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all shrink-0 cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/15'
                  : 'bg-white/40 text-slate-600 border-white/50 hover:bg-white/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Grid Table */}
      <div className="glass-card border border-white/60 overflow-hidden shadow-xl shadow-slate-200/20">
        <div className="overflow-x-auto">
          <table className="glass-table w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/45 border-b border-white/40 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4 font-mono">ID</th>
                <th className="px-6 py-4">Nama Produk</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4 text-right">Limit Minimum</th>
                <th className="px-6 py-4 text-right">Stok Aktual (Kg)</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Aksi Opname</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/30 text-xs font-semibold">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-500">{p.id}</td>
                    <td className="px-6 py-4 font-extrabold text-slate-900">{p.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/60 text-slate-600 border border-white/50 font-mono">{p.category}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-500">{p.minStock} Kg</td>
                    <td className="px-6 py-4 text-right font-mono font-extrabold text-slate-950 text-sm">{p.stock} Kg</td>
                    <td className="px-6 py-4 text-center">
                      {p.status === 'CRITICAL' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-800 border border-rose-500/20">
                          HABIS TOTAL
                        </span>
                      ) : p.status === 'WARNING' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-800 border border-amber-500/20">
                          CRITICAL LIMIT
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-800 border border-emerald-500/20">
                          STOK AMAN
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedProduct(p)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-white/50 hover:bg-white text-slate-700 hover:text-amber-800 border border-white/45 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                      >
                        <Wrench className="w-3.5 h-3.5 text-amber-600" />
                        <span>Koreksi Stok</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 bg-white/10">
                    <Database className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-500">Katalog stok kosong</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Tidak ada produk yang sesuai dengan filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Opname Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card bg-white rounded-2xl border border-white/65 max-w-md w-full shadow-2xl p-6 relative flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/30">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Penyesuaian Opname Stok</h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{selectedProduct.id} • {selectedProduct.name}</p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <Minus className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleAdjustmentSubmit} className="space-y-4 pt-4">
                {/* Visual indicator of current stock */}
                <div className="p-3.5 bg-white/50 border border-white/40 rounded-xl flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold">Stok Sistem Saat Ini:</span>
                  <span className="font-bold font-mono text-slate-900 text-sm">{selectedProduct.stock} Kg</span>
                </div>

                {/* Adjustment Mode (ADD vs SUBTRACT) */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Metode Koreksi
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAdjustType('ADD')}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                        adjustType === 'ADD'
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-800 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Stok (+)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustType('SUBTRACT')}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                        adjustType === 'SUBTRACT'
                          ? 'bg-rose-500/10 border-rose-500 text-rose-800 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Minus className="w-4 h-4" />
                      <span>Penyusutan (-)</span>
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Selisih Koreksi (Kg) *
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="any"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      placeholder="Contoh: 2.5"
                      className="block w-full px-3 py-2 bg-white/50 border border-white/40 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white font-semibold"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-slate-400 text-xs font-bold">Kg</span>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Alasan Rekonsiliasi *
                  </label>
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white/50 border border-white/40 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-semibold"
                  >
                    <option value="Koreksi Selisih Timbangan">Koreksi Selisih Timbangan (Penyusutan Air)</option>
                    <option value="Barang Busuk / Rusak">Ikan Asin Rusak / Berjamur / Busuk</option>
                    <option value="Bonus / Retur Pelanggan">Bonus Khusus atau Retur Pelanggan</option>
                    <option value="Salah Input Transaksi">Salah Input Catatan Manual Sebelumnya</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>

                {/* Summary calculation */}
                {parseFloat(adjustAmount) > 0 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/15 rounded-xl text-[11px] text-amber-850 leading-normal font-semibold">
                    Stok akhir produk setelah disimpan akan menjadi:{' '}
                    <span className="font-extrabold font-mono text-amber-900">
                      {adjustType === 'ADD' 
                        ? selectedProduct.stock + parseFloat(adjustAmount) 
                        : Math.max(0, selectedProduct.stock - parseFloat(adjustAmount))}
                    </span>{' '}
                    Kg.
                  </div>
                )}

                {/* Footer buttons */}
                <div className="pt-4 border-t border-white/30 flex justify-end gap-3.5">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="px-4.5 py-2 bg-white/40 border border-white/45 hover:bg-white/80 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="glass-btn-primary px-5 py-2 text-xs font-bold"
                  >
                    Simpan Koreksi
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
