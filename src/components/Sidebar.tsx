import { 
  LayoutDashboard, 
  ShoppingCart, 
  TrendingUp, 
  Layers, 
  Database, 
  FileText, 
  Store, 
  LogOut, 
  User, 
  Menu, 
  X,
  AlertTriangle
} from 'lucide-react';
import { AdminAccount } from '../types';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  admin: AdminAccount;
  onLogout: () => void;
  lowStockCount: number;
}

export default function Sidebar({ currentTab, setTab, admin, onLogout, lowStockCount }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'Point of Sale (POS)', icon: ShoppingCart },
    { id: 'pembelian', label: 'Transaksi Pembelian', icon: TrendingUp },
    { id: 'produk', label: 'Data Produk', icon: Layers },
    { 
      id: 'stok', 
      label: 'Manajemen Stok', 
      icon: Database,
      badge: lowStockCount > 0 ? lowStockCount : undefined 
    },
    { id: 'laporan', label: 'Laporan Keuangan', icon: FileText },
    { id: 'profil', label: 'Profil & Akun', icon: Store },
  ];

  return (
    <aside className="w-64 glass-sidebar flex flex-col shrink-0 h-screen">
      {/* Branding Header */}
      <div className="p-6 border-b border-white/40 flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-amber-500/25 shrink-0">
          A
        </div>
        <div>
          <h1 className="font-extrabold text-slate-900 text-base tracking-tight leading-none">CV ABADI</h1>
          <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Manajemen Ikan Asin</span>
        </div>
      </div>

      {/* User Status Bar */}
      <div className="px-6 py-4 border-b border-white/30 bg-white/10 flex items-center gap-3">
        <div className="h-9 w-9 bg-amber-100 rounded-full flex items-center justify-center border border-amber-200 shrink-0">
          <User className="w-4 h-4 text-amber-700" />
        </div>
        <div className="overflow-hidden">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider leading-tight">Pengguna Aktif</p>
          <p className="text-sm font-bold text-slate-800 truncate leading-normal">{admin.username}</p>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-800 border border-amber-500/20">
            {admin.role}
          </span>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold transition-all cursor-pointer group ${
                isActive 
                  ? 'bg-amber-500/10 text-amber-800 border border-amber-500/20 shadow-sm' 
                  : 'hover:bg-white/40 text-slate-600 hover:text-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-amber-700' : 'text-slate-400 group-hover:text-slate-600'
                }`} />
                <span>{item.label}</span>
              </div>
              
              {item.badge !== undefined && (
                <span className={`inline-flex items-center justify-center h-5 px-1.5 rounded-full text-[10px] font-bold border ${
                  isActive 
                    ? 'bg-amber-500 text-white border-amber-500' 
                    : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Action footer */}
      <div className="p-4 border-t border-white/30 bg-white/5">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs uppercase tracking-wider font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Aplikasi</span>
        </button>
      </div>
    </aside>
  );
}
