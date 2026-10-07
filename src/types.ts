export interface Product {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  description: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  total: number;
}

export interface Purchase {
  id: string;
  invoiceNumber: string;
  date: string;
  items: PurchaseItem[];
  totalAmount: number;
  supplierName: string;
  notes?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  purchasePrice: number; // Stored to calculate real-time profit
  total: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  date: string;
  items: SaleItem[];
  totalAmount: number;
  paymentAmount: number;
  changeAmount: number;
  customerName: string;
  notes?: string;
}

export interface BusinessProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  owner: string;
  headerNote?: string;
}

export interface AdminAccount {
  id: string;
  username: string;
  email: string;
  role: 'Super Admin' | 'Kasir';
  passwordHash: string; // Simulated password for demonstration
}
