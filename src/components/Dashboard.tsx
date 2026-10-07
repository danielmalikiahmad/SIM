import { Product, Sale, Purchase } from '../types';
import { 
  TrendingUp, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Boxes, 
  DollarSign, 
  AlertCircle,
  Clock,
  ChevronRight,
  Plus
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  onNavigateToTab: (tab: string) => void;
}

export default function Dashboard({ products, sales, purchases, onNavigateToTab }: DashboardProps) {
  // Format to IDR (Rupiah)
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Calculations
  const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalPurchaseCost = purchases.reduce((acc, p) => acc + p.totalAmount, 0);
  
  // Real Net Profit calculated from sales items: (sellingPrice - purchasePrice) * quantity
  const totalNetProfit = sales.reduce((acc, sale) => {
    const saleProfit = sale.items.reduce((sAcc, item) => {
      const profitPerUnit = item.sellingPrice - item.purchasePrice;
      return sAcc + (profitPerUnit * item.quantity);
    }, 0);
    return acc + saleProfit;
  }, 0);

  // Stock health
  const lowStockItems = products.filter(p => p.stock <= p.minStock);
  const totalInStock = products.reduce((acc, p) => acc + p.stock, 0);

  // Prepare chart data: Sales Trend (by date)
  const salesByDate: { [key: string]: { date: string; revenue: number; transactions: number } } = {};
  
  // Gather last 7 days of sales
  sales.forEach(sale => {
    const dateFormatted = new Date(sale.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    if (!salesByDate[dateFormatted]) {
      salesByDate[dateFormatted] = { date: dateFormatted, revenue: 0, transactions: 0 };
    }
    salesByDate[dateFormatted].revenue += sale.totalAmount;
    salesByDate[dateFormatted].transactions += 1;
  });

  const salesTrendData = Object.values(salesByDate).slice(-7);

  // Prepare chart data: Top Selling Products
  const productSalesVolume: { [key: string]: { name: string; volume: number; profit: number } } = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productSalesVolume[item.productId]) {
        productSalesVolume[item.productId] = { name: item.productName.split('(')[0].trim(), volume: 0, profit: 0 };
      }
      productSalesVolume[item.productId].volume += item.quantity;
      productSalesVolume[item.productId].profit += (item.sellingPrice - item.purchasePrice) * item.quantity;
    });
  });

  const popularProductsData = Object.values(productSalesVolume)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  const chartColors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

  return (
    <div className="space-y-8 p-1">
      {/* Welcome Hero */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight">Ringkasan Eksekutif</h2>
          <p className="text-slate-500 text-sm">
            Pantau arus kas, performa penjualan, ketersediaan stok ikan asin CV ABADI.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTab('pos')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Transaksi Baru (POS)</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Omset */}
        <div className="glass-card glass-card-hover p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-sky-500/10 text-sky-700 rounded-xl border border-sky-500/10">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-500/15">
              <ArrowUpRight className="w-3 h-3" />
              <span>Omset</span>
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pendapatan</p>
            <h3 className="text-xl font-black font-mono text-slate-900 mt-1 leading-tight">
              {formatRupiah(totalRevenue)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">Dari {sales.length} transaksi penjualan</p>
          </div>
        </div>

        {/* Pengeluaran Belanja */}
        <div className="glass-card glass-card-hover p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-rose-500/10 text-rose-700 rounded-xl border border-rose-500/10">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-500/10 px-2.5 py-0.5 rounded-full border border-slate-500/10">
              Kulakan
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pembelian Stok</p>
            <h3 className="text-xl font-black font-mono text-slate-900 mt-1 leading-tight">
              {formatRupiah(totalPurchaseCost)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">Dari {purchases.length} invoice supplier</p>
          </div>
        </div>

        {/* Keuntungan Bersih */}
        <div className="glass-card glass-card-hover p-6 border-emerald-500/20 shadow-lg shadow-emerald-500/5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-700 rounded-xl border border-emerald-500/10">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Laba Bersih
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Keuntungan Bersih</p>
            <h3 className="text-2xl font-black font-mono text-emerald-800 mt-1 leading-tight">
              {formatRupiah(totalNetProfit)}
            </h3>
            <p className="text-[11px] text-emerald-600 mt-2 font-bold">Berdasarkan HPP barang terjual</p>
          </div>
        </div>

        {/* Status Produk & Stok */}
        <div className="glass-card glass-card-hover p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-amber-500/10 text-amber-700 rounded-xl border border-amber-500/10">
              <Boxes className="w-5 h-5" />
            </div>
            {lowStockItems.length > 0 ? (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-500/15 px-2.5 py-0.5 rounded-full flex items-center gap-0.5 border border-amber-500/20">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>{lowStockItems.length} Menipis</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Stok Aman
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Volume Stok</p>
            <h3 className="text-xl font-black font-mono text-slate-900 mt-1 leading-tight">
              {totalInStock} <span className="text-xs font-sans text-slate-500 font-normal">Kg</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">Tersebar di {products.length} variasi katalog</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Tren Penjualan Harian</h3>
              <p className="text-xs text-slate-400 mt-0.5">Grafik nilai omset penjualan seminggu terakhir</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {salesTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value / 1000}k`} 
                  />
                  <Tooltip 
                    formatter={(value: any) => [formatRupiah(Number(value)), 'Pendapatan']}
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#d97706" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Belum ada data transaksi penjualan.
              </div>
            )}
          </div>
        </div>

        {/* Top Products Volume Chart */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Produk Terlaris</h3>
              <p className="text-xs text-slate-400 mt-0.5">Paling sering dibeli berdasarkan volume (Kg)</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {popularProductsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularProductsData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.04)" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} width={80} />
                  <Tooltip 
                    formatter={(value: any) => [`${value} Kg`, 'Volume Terjual']}
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="volume" radius={[0, 6, 6, 0]}>
                    {popularProductsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Belum ada data produk terjual.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Low Stock Alert & Recent Transactions Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Watchlist */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-700 border border-amber-500/10">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Stok Menipis!</h3>
            </div>
            {lowStockItems.length > 0 && (
              <button 
                onClick={() => onNavigateToTab('stok')}
                className="text-xs text-amber-700 hover:text-amber-900 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <span>Kelola</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[280px] space-y-3 pr-1">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((prod) => (
                <div key={prod.id} className="flex items-center justify-between p-3 rounded-xl border border-amber-500/15 bg-amber-500/5">
                  <div className="overflow-hidden pr-2">
                    <p className="text-xs font-bold text-slate-800 truncate">{prod.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">ID: {prod.id} • Kategori: {prod.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-slate-400">Tersisa</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-800 border border-amber-500/15 font-mono mt-1">
                      {prod.stock} Kg
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full py-12 flex flex-col items-center justify-center text-center text-slate-400">
                <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/15 text-amber-600 rounded-full flex items-center justify-center mb-2">
                  ✓
                </div>
                <p className="text-xs font-bold text-slate-500">Kondisi Stok Aman</p>
                <p className="text-[10px] text-slate-400 mt-1">Semua produk berada di atas batas minimum stok.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions Feed */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-500/10 rounded-lg text-slate-700 border border-slate-500/10">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Aktivitas Transaksi Terakhir</h3>
            </div>
            <button 
              onClick={() => onNavigateToTab('laporan')}
              className="text-xs text-amber-700 hover:text-amber-900 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Riwayat Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[280px] space-y-3.5 pr-1">
            {/* Merge and sort last sales & purchases */}
            {(() => {
              const combined: Array<{
                id: string;
                invoice: string;
                date: string;
                type: 'SALE' | 'PURCHASE';
                entity: string;
                amount: number;
              }> = [];

              sales.forEach(s => {
                combined.push({
                  id: s.id,
                  invoice: s.invoiceNumber,
                  date: s.date,
                  type: 'SALE',
                  entity: s.customerName || 'Umum',
                  amount: s.totalAmount
                });
              });

              purchases.forEach(p => {
                combined.push({
                  id: p.id,
                  invoice: p.invoiceNumber,
                  date: p.date,
                  type: 'PURCHASE',
                  entity: p.supplierName,
                  amount: p.totalAmount
                });
              });

              // Sort by date descending
              const sorted = combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

              if (sorted.length === 0) {
                return (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Belum ada riwayat aktivitas transaksi.
                  </div>
                );
              }

              return sorted.map((trx) => (
                <div key={`${trx.type}-${trx.id}`} className="flex items-center justify-between p-3.5 rounded-xl border border-white/40 bg-white/30 hover:bg-white/60 transition-all">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border text-xs font-bold ${
                      trx.type === 'SALE' 
                        ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/15' 
                        : 'bg-rose-500/10 text-rose-800 border-rose-500/15'
                    }`}>
                      {trx.type === 'SALE' ? 'J' : 'B'}
                    </span>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-800 font-mono">{trx.invoice}</p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {trx.type === 'SALE' ? 'Pelanggan: ' : 'Supplier: '} <span className="font-bold text-slate-700">{trx.entity}</span> • {new Date(trx.date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-bold font-mono ${
                      trx.type === 'SALE' ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {trx.type === 'SALE' ? '+' : '-'}{formatRupiah(trx.amount)}
                    </p>
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
                      {trx.type === 'SALE' ? 'Penjualan' : 'Pembelian'}
                    </span>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
