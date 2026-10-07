import React, { useState, useMemo } from 'react';
import { Product, Sale, Purchase } from '../types';
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  Layers, 
  Coins, 
  TrendingUp, 
  Package, 
  Info,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface ReportModuleProps {
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
}

export default function ReportModule({ products, sales, purchases }: ReportModuleProps) {
  // Navigation Tabs inside Report
  const [reportTab, setReportTab] = useState<'sales' | 'purchases' | 'stock' | 'profit'>('sales');

  // Filters
  const [filterYear, setFilterYear] = useState('2026');
  const [filterMonth, setFilterMonth] = useState('Semua'); // '01' through '12'

  const monthsList = [
    { value: 'Semua', label: 'Semua Bulan' },
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Filtered Sales according to chosen month and year
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const parts = s.date.split('-'); // YYYY-MM-DD
      const year = parts[0];
      const month = parts[1];
      const matchYear = year === filterYear;
      const matchMonth = filterMonth === 'Semua' || month === filterMonth;
      return matchYear && matchMonth;
    });
  }, [sales, filterYear, filterMonth]);

  // Filtered Purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const parts = p.date.split('-');
      const year = parts[0];
      const month = parts[1];
      const matchYear = year === filterYear;
      const matchMonth = filterMonth === 'Semua' || month === filterMonth;
      return matchYear && matchMonth;
    });
  }, [purchases, filterYear, filterMonth]);

  // Calculations for Sales Report
  const salesSummary = useMemo(() => {
    const totalRevenue = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalVolume = filteredSales.reduce((acc, s) => {
      const vol = s.items.reduce((vAcc, it) => vAcc + it.quantity, 0);
      return acc + vol;
    }, 0);
    return { totalRevenue, totalVolume };
  }, [filteredSales]);

  // Calculations for Purchase Report
  const purchaseSummary = useMemo(() => {
    const totalExpense = filteredPurchases.reduce((acc, p) => acc + p.totalAmount, 0);
    const totalVolume = filteredPurchases.reduce((acc, p) => {
      const vol = p.items.reduce((vAcc, it) => vAcc + it.quantity, 0);
      return acc + vol;
    }, 0);
    return { totalExpense, totalVolume };
  }, [filteredPurchases]);

  // Calculations for Stock Valuation Report
  const stockValuation = useMemo(() => {
    const totalAssetsAtCost = products.reduce((acc, p) => acc + p.stock * p.purchasePrice, 0);
    const totalAssetsAtMarket = products.reduce((acc, p) => acc + p.stock * p.sellingPrice, 0);
    const potentialGrossProfit = totalAssetsAtMarket - totalAssetsAtCost;
    return { totalAssetsAtCost, totalAssetsAtMarket, potentialGrossProfit };
  }, [products]);

  // Profit calculations based on actual goods sold in filtered timeframe
  const profitabilitySummary = useMemo(() => {
    let totalRevenue = 0;
    let totalCOGS = 0; // Cost of goods sold (HPP - Harga Pokok Penjualan)
    
    filteredSales.forEach((sale) => {
      totalRevenue += sale.totalAmount;
      sale.items.forEach((item) => {
        totalCOGS += item.purchasePrice * item.quantity;
      });
    });

    const grossProfit = totalRevenue - totalCOGS;
    const netMarginPercentage = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return { totalRevenue, totalCOGS, grossProfit, netMarginPercentage };
  }, [filteredSales]);

  // Real CSV Exporter
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    const separator = ";";

    if (reportTab === 'sales') {
      csvContent += `LAPORAN PENJUALAN CV ABADI (${filterMonth === 'Semua' ? 'Semua Bulan' : 'Bulan ' + filterMonth} - Tahun ${filterYear})\n\n`;
      csvContent += `No. Nota${separator}Tanggal${separator}Nama Pelanggan${separator}Jumlah Item${separator}Total Transaksi (IDR)\n`;
      filteredSales.forEach((s) => {
        const itemQty = s.items.reduce((acc, it) => acc + it.quantity, 0);
        csvContent += `${s.invoiceNumber}${separator}${s.date}${separator}${s.customerName}${separator}${itemQty}${separator}${s.totalAmount}\n`;
      });
      csvContent += `\nTOTAL REVENUE${separator}${separator}${separator}${separator}${salesSummary.totalRevenue}\n`;
      csvContent += `TOTAL VOLUME (Kg)${separator}${separator}${separator}${separator}${salesSummary.totalVolume}\n`;
    } 
    else if (reportTab === 'purchases') {
      csvContent += `LAPORAN PEMBELIAN BARANG CV ABADI (${filterMonth === 'Semua' ? 'Semua Bulan' : 'Bulan ' + filterMonth} - Tahun ${filterYear})\n\n`;
      csvContent += `No. Invoice${separator}Tanggal${separator}Nama Supplier${separator}Jumlah Item${separator}Total Belanja (IDR)\n`;
      filteredPurchases.forEach((p) => {
        const itemQty = p.items.reduce((acc, it) => acc + it.quantity, 0);
        csvContent += `${p.invoiceNumber}${separator}${p.date}${separator}${p.supplierName}${separator}${itemQty}${separator}${p.totalAmount}\n`;
      });
      csvContent += `\nTOTAL EXPENSES${separator}${separator}${separator}${separator}${purchaseSummary.totalExpense}\n`;
      csvContent += `TOTAL VOLUME (Kg)${separator}${separator}${separator}${separator}${purchaseSummary.totalVolume}\n`;
    } 
    else if (reportTab === 'stock') {
      csvContent += `LAPORAN PENILAIAN NILAI ASET STOK CV ABADI\n\n`;
      csvContent += `ID Produk${separator}Nama Ikan Asin${separator}Kategori${separator}Stok (Kg)${separator}Harga Beli (Rp/Kg)${separator}Harga Jual (Rp/Kg)${separator}Nilai Aset Modal${separator}Nilai Jual Pasar\n`;
      products.forEach((p) => {
        csvContent += `${p.id}${separator}${p.name}${separator}${p.category}${separator}${p.stock}${separator}${p.purchasePrice}${separator}${p.sellingPrice}${separator}${p.stock * p.purchasePrice}${separator}${p.stock * p.sellingPrice}\n`;
      });
      csvContent += `\nTOTAL ASET MODAL (HPP)${separator}${separator}${separator}${separator}${separator}${separator}${stockValuation.totalAssetsAtCost}\n`;
      csvContent += `TOTAL POTENSI NILAI JUAL${separator}${separator}${separator}${separator}${separator}${separator}${separator}${stockValuation.totalAssetsAtMarket}\n`;
    } 
    else if (reportTab === 'profit') {
      csvContent += `LAPORAN LABA / RUGI USAHA CV ABADI (${filterMonth === 'Semua' ? 'Semua Bulan' : 'Bulan ' + filterMonth} - Tahun ${filterYear})\n\n`;
      csvContent += `Indikator Keuangan${separator}Nilai (IDR)\n`;
      csvContent += `OMSET PENJUALAN${separator}${profitabilitySummary.totalRevenue}\n`;
      csvContent += `HARGA POKOK PENJUALAN (HPP/COGS)${separator}${profitabilitySummary.totalCOGS}\n`;
      csvContent += `KEUNTUNGAN BERSIH (GROSS PROFIT)${separator}${profitabilitySummary.grossProfit}\n`;
      csvContent += `PERSENTASE MARGIN PENJUALAN${separator}${profitabilitySummary.netMarginPercentage.toFixed(2)}%\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_${reportTab}_CV_ABADI_${filterYear}_${filterMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight font-sans">Laporan Manajemen Keuangan</h2>
          <p className="text-slate-500 text-sm">
            Tinjau rekapitulasi data penjualan harian, belanja bahan baku dari nelayan, aset inventori, serta profit bersih otomatis.
          </p>
        </div>
        
        {/* Report Operations */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/40 hover:bg-white/80 border border-white/50 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600/80 hover:bg-emerald-650 border border-emerald-500/10 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shadow-md shadow-emerald-500/10"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV (Excel)</span>
          </button>
        </div>
      </div>

      {/* Primary Toolbar for Time filtering */}
      <div className="glass-card p-5 border border-white/60 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Navigation reports Tabs */}
        <div className="flex items-center gap-1 border border-white/30 bg-white/30 p-1 rounded-xl w-full md:w-auto">
          {[
            { id: 'sales', label: 'Penjualan', icon: Coins },
            { id: 'purchases', label: 'Pembelian', icon: TrendingUp },
            { id: 'stock', label: 'Nilai Stok', icon: Package },
            { id: 'profit', label: 'Laba / Rugi', icon: FileText },
          ].map((tb) => {
            const Icon = tb.icon;
            return (
              <button
                key={tb.id}
                onClick={() => setReportTab(tb.id as any)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  reportTab === tb.id
                    ? 'bg-white/70 text-amber-700 shadow-sm font-extrabold border-white/50 border'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tb.label}</span>
              </button>
            );
          })}
        </div>

        {/* Month & Year Time Selector (only relevant for non-stock tab) */}
        {reportTab !== 'stock' && (
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* Year Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-bold">Tahun:</span>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-2 py-1 bg-white/50 border border-white/40 text-xs text-slate-800 font-bold rounded-lg bg-white focus:outline-none"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>

            {/* Month Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-bold">Bulan:</span>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-2.5 py-1 bg-white/50 border border-white/40 text-xs text-slate-800 font-bold rounded-lg bg-white focus:outline-none"
              >
                {monthsList.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Layout contents */}
      <div className="glass-card border border-white/60 p-6 shadow-xl shadow-slate-200/20">
        
        {/* REPORT TAB: SALES */}
        {reportTab === 'sales' && (
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-white/30 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Rangkuman Rekapitulasi Penjualan</h3>
                <p className="text-xs text-slate-400">Arus kas masuk dari pembeli eceran dan grosir katering.</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Pendapatan (Omset)</p>
                <p className="text-xl font-extrabold font-mono text-emerald-700 mt-0.5">{formatRupiah(salesSummary.totalRevenue)}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">Volume terjual: {salesSummary.totalVolume} Kg</p>
              </div>
            </div>

            {/* List Table of Sales */}
            <div className="overflow-x-auto rounded-xl border border-white/40 bg-white/10">
              <table className="glass-table w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/45 border-b border-white/40 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3 font-mono">No. Nota</th>
                    <th className="px-5 py-3">Tanggal</th>
                    <th className="px-5 py-3">Pelanggan</th>
                    <th className="px-5 py-3 text-right">Volume</th>
                    <th className="px-5 py-3 text-right">Nilai Transaksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/30 font-semibold">
                  {filteredSales.length > 0 ? (
                    filteredSales.map((s) => (
                      <tr key={s.id} className="hover:bg-white/40 transition-colors">
                        <td className="px-5 py-3 font-mono text-slate-500 font-extrabold">{s.invoiceNumber}</td>
                        <td className="px-5 py-3 text-slate-600">{s.date}</td>
                        <td className="px-5 py-3 text-slate-900 font-extrabold">{s.customerName}</td>
                        <td className="px-5 py-3 text-right font-mono text-slate-600">
                          {s.items.reduce((acc, it) => acc + it.quantity, 0)} Kg
                        </td>
                        <td className="px-5 py-3 text-right font-mono font-extrabold text-slate-950">
                          {formatRupiah(s.totalAmount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-400 bg-white/10 font-bold">
                        Tidak ada data penjualan pada periode terpilih.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT TAB: PURCHASES */}
        {reportTab === 'purchases' && (
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-white/30 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Rangkuman Rekapitulasi Pembelian</h3>
                <p className="text-xs text-slate-400">Arus kas keluar untuk restock bahan baku ikan asin.</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Pengeluaran (Kulakan)</p>
                <p className="text-xl font-extrabold font-mono text-rose-700 mt-0.5">{formatRupiah(purchaseSummary.totalExpense)}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">Volume masuk: {purchaseSummary.totalVolume} Kg</p>
              </div>
            </div>

            {/* List Table of Purchases */}
            <div className="overflow-x-auto rounded-xl border border-white/40 bg-white/10">
              <table className="glass-table w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/45 border-b border-white/40 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3 font-mono">No. Invoice</th>
                    <th className="px-5 py-3">Tanggal</th>
                    <th className="px-5 py-3">Supplier</th>
                    <th className="px-5 py-3 text-right">Volume</th>
                    <th className="px-5 py-3 text-right">Nilai Belanja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/30 font-semibold">
                  {filteredPurchases.length > 0 ? (
                    filteredPurchases.map((p) => (
                      <tr key={p.id} className="hover:bg-white/40 transition-colors">
                        <td className="px-5 py-3 font-mono text-slate-500 font-extrabold">{p.invoiceNumber}</td>
                        <td className="px-5 py-3 text-slate-600">{p.date}</td>
                        <td className="px-5 py-3 text-slate-900 font-extrabold">{p.supplierName}</td>
                        <td className="px-5 py-3 text-right font-mono text-slate-600">
                          {p.items.reduce((acc, it) => acc + it.quantity, 0)} Kg
                        </td>
                        <td className="px-5 py-3 text-right font-mono font-extrabold text-slate-950">
                          {formatRupiah(p.totalAmount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-400 bg-white/10 font-bold">
                        Tidak ada data transaksi pembelian pada periode terpilih.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT TAB: STOCK VALUATION */}
        {reportTab === 'stock' && (
          <div className="space-y-6">
            {/* Asset summary header block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-white/30 pb-5">
              <div className="p-4.5 bg-white/40 border border-white/50 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Nilai Stok HPP (Modal)</span>
                <p className="text-lg font-black font-mono text-slate-800 mt-1">{formatRupiah(stockValuation.totalAssetsAtCost)}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">Uang modal tertimbun di dalam persediaan fisik</p>
              </div>

              <div className="p-4.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-900">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Potensi Nilai Jual Pasar</span>
                <p className="text-lg font-black font-mono text-amber-700 mt-1">{formatRupiah(stockValuation.totalAssetsAtMarket)}</p>
                <p className="text-[10px] text-amber-500 mt-1 font-semibold">Jika seluruh stok terjual habis sesuai harga katalog</p>
              </div>

              <div className="p-4.5 bg-emerald-50/40 border border-emerald-100 rounded-xl">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Potensi Margin Kas Gudang</span>
                <p className="text-lg font-black font-mono text-emerald-700 mt-1">{formatRupiah(stockValuation.potentialGrossProfit)}</p>
                <p className="text-[10px] text-emerald-500 mt-1 font-semibold">Selisih laba kotor potensial yang tersimpan</p>
              </div>
            </div>

            {/* List Table of Assets */}
            <div className="overflow-x-auto rounded-xl border border-white/40 bg-white/10">
              <table className="glass-table w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/45 border-b border-white/40 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3 font-mono">ID</th>
                    <th className="px-5 py-3">Nama Produk</th>
                    <th className="px-5 py-3 text-right">Stok (Kg)</th>
                    <th className="px-5 py-3 text-right">Asset Modal (HPP)</th>
                    <th className="px-5 py-3 text-right">Aset Nilai Jual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/30 font-semibold">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-white/40 transition-colors">
                      <td className="px-5 py-3 font-mono text-slate-400 font-extrabold">{p.id}</td>
                      <td className="px-5 py-3 text-slate-900 font-extrabold">{p.name}</td>
                      <td className="px-5 py-3 text-right font-mono text-slate-700 font-black">{p.stock} Kg</td>
                      <td className="px-5 py-3 text-right font-mono text-slate-500">
                        {formatRupiah(p.stock * p.purchasePrice)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-slate-900 font-extrabold">
                        {formatRupiah(p.stock * p.sellingPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT TAB: PROFIT & LOSS */}
        {reportTab === 'profit' && (
          <div className="space-y-6">
            <div className="border-b border-white/30 pb-4">
              <h3 className="text-base font-bold text-slate-900">Perhitungan Laba & Rugi Operasional</h3>
              <p className="text-xs text-slate-400">Analisis margin keuntungan kotor real berdasarkan HPP barang yang benar-benar terjual.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {/* Revenue */}
              <div className="p-5 border border-white/40 rounded-2xl bg-white/40 shadow-xs">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">1. Omset Penjualan</p>
                <h4 className="text-lg font-black font-mono text-slate-900 mt-1">{formatRupiah(profitabilitySummary.totalRevenue)}</h4>
                <p className="text-[10px] text-slate-400 mt-2 font-semibold">Akumulasi total uang kas masuk dari pembeli.</p>
              </div>

              {/* COGS (HPP) */}
              <div className="p-5 border border-white/40 rounded-2xl bg-white/40 shadow-xs">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">2. Harga Pokok Penjualan (HPP)</p>
                <h4 className="text-lg font-black font-mono text-slate-900 mt-1">{formatRupiah(profitabilitySummary.totalCOGS)}</h4>
                <p className="text-[10px] text-slate-400 mt-2 font-semibold">Harga beli awal (modal) barang yang telah laku terjual.</p>
              </div>

              {/* Net Profit */}
              <div className="p-5 border border-emerald-500/20 rounded-2xl bg-emerald-500/10 shadow-xs md:col-span-2 text-emerald-900">
                <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">3. Keuntungan Kotor Bersih (Profit)</p>
                <h4 className="text-2xl font-black font-mono text-emerald-800 mt-1">{formatRupiah(profitabilitySummary.grossProfit)}</h4>
                <div className="flex items-center gap-1.5 mt-2 text-emerald-700 text-xs font-black">
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  <span>Margin Profit Penjualan: {profitabilitySummary.netMarginPercentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Educational disclaimer */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/15 rounded-xl flex gap-3 text-xs text-amber-800 leading-relaxed font-semibold">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Pengetahuan Akuntansi Usaha:</span> Nilai "Laba Kotor Bersih" dihitung secara presisi dari pengurangan nilai jual dengan HPP saat transaksi POS disimpan. Metode ini melacak margin profit secara akurat bahkan jika harga beli ikan asin di supplier fluktuatif di kemudian hari.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
