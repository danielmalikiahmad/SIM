import React, { useState, useEffect } from 'react';
import { Product, Purchase, Sale, BusinessProfile, AdminAccount } from './types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_PROFILE, 
  INITIAL_ADMINS, 
  INITIAL_PURCHASES, 
  INITIAL_SALES 
} from './initialData';

// Component imports
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import ProductManagement from './components/ProductManagement';
import StockManagement from './components/StockManagement';
import PurchaseManagement from './components/PurchaseManagement';
import ReportModule from './components/ReportModule';
import BusinessProfileComponent from './components/BusinessProfile';

export default function App() {
  // ----------------------------------------------------
  // Persistent States loaded from localStorage
  // ----------------------------------------------------
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('cvabadi_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem('cvabadi_purchases');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('cvabadi_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [profile, setProfile] = useState<BusinessProfile>(() => {
    const saved = localStorage.getItem('cvabadi_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [admins, setAdmins] = useState<AdminAccount[]>(() => {
    const saved = localStorage.getItem('cvabadi_admins');
    return saved ? JSON.parse(saved) : INITIAL_ADMINS;
  });

  // Current logged in admin state
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(() => {
    const saved = sessionStorage.getItem('cvabadi_logged_admin');
    return saved ? JSON.parse(saved) : null;
  });

  // Active Screen View tab state
  const [currentTab, setCurrentTab] = useState<string>(() => {
    const saved = sessionStorage.getItem('cvabadi_active_tab');
    return saved || 'dashboard';
  });

  // ----------------------------------------------------
  // Sync states with LocalStorage and SessionStorage
  // ----------------------------------------------------
  useEffect(() => {
    localStorage.setItem('cvabadi_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('cvabadi_purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('cvabadi_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('cvabadi_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('cvabadi_admins', JSON.stringify(admins));
  }, [admins]);

  useEffect(() => {
    if (currentAdmin) {
      sessionStorage.setItem('cvabadi_logged_admin', JSON.stringify(currentAdmin));
    } else {
      sessionStorage.removeItem('cvabadi_logged_admin');
    }
  }, [currentAdmin]);

  useEffect(() => {
    sessionStorage.setItem('cvabadi_active_tab', currentTab);
  }, [currentTab]);

  // ----------------------------------------------------
  // Authentication Actions
  // ----------------------------------------------------
  const handleLoginSuccess = (admin: AdminAccount) => {
    setCurrentAdmin(admin);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari sistem CV ABADI?')) {
      setCurrentAdmin(null);
      sessionStorage.removeItem('cvabadi_logged_admin');
    }
  };

  // ----------------------------------------------------
  // Business logic State modifiers
  // ----------------------------------------------------
  
  // 1. Point of Sale (Sales) saving & inventory subtracter
  const handleAddSale = (newSale: Sale) => {
    setSales((prevSales) => [newSale, ...prevSales]);
  };

  const handleUpdateStocksAfterSale = (itemsToSubtract: { id: string; quantityToSubtract: number }[]) => {
    setProducts((prevProducts) => {
      return prevProducts.map((p) => {
        const req = itemsToSubtract.find((item) => item.id === p.id);
        if (req) {
          return {
            ...p,
            stock: Math.max(0, p.stock - req.quantityToSubtract),
          };
        }
        return p;
      });
    });
  };

  // 2. Re-stock (Purchases) saving & inventory adder
  const handleAddPurchase = (newPurchase: Purchase) => {
    setPurchases((prevPurchases) => [newPurchase, ...prevPurchases]);
  };

  const handleIncreaseStocksAfterPurchase = (itemsToAdd: { id: string; quantityToAdd: number; costPriceToUpdate?: number }[]) => {
    setProducts((prevProducts) => {
      return prevProducts.map((p) => {
        const req = itemsToAdd.find((item) => item.id === p.id);
        if (req) {
          return {
            ...p,
            stock: p.stock + req.quantityToAdd,
            // Automatically update supplier base purchase baseline if price changed
            purchasePrice: req.costPriceToUpdate !== undefined ? req.costPriceToUpdate : p.purchasePrice
          };
        }
        return p;
      });
    });
  };

  // 3. Product Catalog Operations (CRUD)
  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [...prev, newProduct]);
  };

  const handleEditProduct = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // 4. Manual Inventory Adjustments (Stock Opname)
  const handleAdjustStock = (productId: string, newStock: number) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p)));
  };

  // 5. Business Settings
  const handleUpdateProfile = (newProfile: BusinessProfile) => {
    setProfile(newProfile);
  };

  const handleUpdateAdmins = (newAdmins: AdminAccount[]) => {
    setAdmins(newAdmins);
  };

  // Calculated properties
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  // Render Login screen if not authenticated
  if (!currentAdmin) {
    return (
      <Login 
        admins={admins} 
        onLoginSuccess={handleLoginSuccess} 
        companyName={profile.name} 
      />
    );
  }

  // Render dashboard layout with sidebar navigation
  return (
    <div className="flex glass-bg min-h-screen text-slate-800 overflow-hidden print:bg-white">
      {/* PERSISTENT SIDEBAR PANEL */}
      <div className="print:hidden shrink-0">
        <Sidebar 
          currentTab={currentTab} 
          setTab={setCurrentTab} 
          admin={currentAdmin} 
          onLogout={handleLogout}
          lowStockCount={lowStockCount}
        />
      </div>

      {/* VIEWPORT CONTROLLER */}
      <main className="flex-1 p-8 overflow-y-auto h-screen print:p-0 print:overflow-visible print:h-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {currentTab === 'dashboard' && (
            <Dashboard 
              products={products} 
              sales={sales} 
              purchases={purchases} 
              onNavigateToTab={setCurrentTab} 
            />
          )}

          {currentTab === 'pos' && (
            <POS 
              products={products} 
              sales={sales} 
              onAddSale={handleAddSale} 
              onUpdateStocks={handleUpdateStocksAfterSale} 
            />
          )}

          {currentTab === 'pembelian' && (
            <PurchaseManagement 
              products={products} 
              purchases={purchases} 
              onAddPurchase={handleAddPurchase} 
              onIncreaseStocks={handleIncreaseStocksAfterPurchase} 
            />
          )}

          {currentTab === 'produk' && (
            <ProductManagement 
              products={products} 
              onAddProduct={handleAddProduct} 
              onEditProduct={handleEditProduct} 
              onDeleteProduct={handleDeleteProduct} 
            />
          )}

          {currentTab === 'stok' && (
            <StockManagement 
              products={products} 
              onAdjustStock={handleAdjustStock} 
            />
          )}

          {currentTab === 'laporan' && (
            <ReportModule 
              products={products} 
              sales={sales} 
              purchases={purchases} 
            />
          )}

          {currentTab === 'profil' && (
            <BusinessProfileComponent 
              profile={profile} 
              admins={admins} 
              onUpdateProfile={handleUpdateProfile} 
              onUpdateAdmins={handleUpdateAdmins} 
              currentAdmin={currentAdmin} 
              onUpdateCurrentAdminInState={setCurrentAdmin} 
            />
          )}

        </div>
      </main>
    </div>
  );
}
