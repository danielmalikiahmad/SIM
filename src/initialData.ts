import { Product, Purchase, Sale, BusinessProfile, AdminAccount } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'P001',
    name: 'Ikan Asin Jambal Roti (Super)',
    category: 'Jambal',
    purchasePrice: 90000,
    sellingPrice: 120000,
    stock: 45,
    minStock: 10,
    description: 'Ikan asin jambal roti kualitas premium, kering, tebal, dan sangat gurih.',
  },
  {
    id: 'P002',
    name: 'Ikan Asin Teri Medan',
    category: 'Teri',
    purchasePrice: 110000,
    sellingPrice: 145000,
    stock: 30,
    minStock: 8,
    description: 'Teri nasi/Medan bersih, putih alami tanpa pengawet berbahaya.',
  },
  {
    id: 'P003',
    name: 'Ikan Asin Peda Merah (Siam)',
    category: 'Peda',
    purchasePrice: 45000,
    sellingPrice: 60000,
    stock: 60,
    minStock: 15,
    description: 'Ikan peda merah kualitas ekspor, asin pas, tekstur lembut.',
  },
  {
    id: 'P004',
    name: 'Cumi Asin Rebus (Baby Cumi)',
    category: 'Cumi',
    purchasePrice: 75000,
    sellingPrice: 100000,
    stock: 5, // Set low to trigger notification
    minStock: 12,
    description: 'Baby cumi asin rebus, empuk tidak alot, cocok untuk sambal cumi.',
  },
  {
    id: 'P005',
    name: 'Ikan Asin Sepat Kering',
    category: 'Sepat',
    purchasePrice: 40000,
    sellingPrice: 55000,
    stock: 25,
    minStock: 10,
    description: 'Ikan asin sepat tawar ukuran sedang, kering matahari alami.',
  },
  {
    id: 'P006',
    name: 'Ikan Asin Bulu Ayam',
    category: 'Bulu Ayam',
    purchasePrice: 50000,
    sellingPrice: 70000,
    stock: 8, // Set low to trigger notification
    minStock: 10,
    description: 'Ikan asin bulu ayam tipis, sangat renyah ketika digoreng.',
  },
  {
    id: 'P007',
    name: 'Ikan Asin Gabus Siam',
    category: 'Gabus',
    purchasePrice: 85000,
    sellingPrice: 115000,
    stock: 18,
    minStock: 8,
    description: 'Ikan asin gabus ukuran besar belah rapi, kering sempurna.',
  },
  {
    id: 'P008',
    name: 'Ikan Asin Layang Kering',
    category: 'Layang',
    purchasePrice: 35000,
    sellingPrice: 48000,
    stock: 50,
    minStock: 15,
    description: 'Ikan asin layang belah, kering bersih cocok untuk konsumsi harian.',
  }
];

export const INITIAL_PROFILE: BusinessProfile = {
  name: 'CV ABADI',
  address: 'Kawasan Grosir Ikan Asin Blok C No. 12, Muara Angke, Pluit, Penjaringan, Jakarta Utara, DKI Jakarta 14450',
  phone: '0812-3456-7890 / (021) 662-8899',
  email: 'info@cvabadi-ikanasin.com',
  owner: 'H. Sudrajat',
  headerNote: 'Penyedia Berbagai Jenis Ikan Asin Berkualitas Tinggi Grosir dan Eceran',
};

export const INITIAL_ADMINS: AdminAccount[] = [
  {
    id: 'A001',
    username: 'admin',
    email: 'admin@cvabadi.com',
    role: 'Super Admin',
    passwordHash: 'admin123', // Clean plain-text for simple demo/auth
  },
  {
    id: 'A002',
    username: 'kasir',
    email: 'kasir@cvabadi.com',
    role: 'Kasir',
    passwordHash: 'kasir123',
  }
];

// Helper to generate dates relative to current date (June 2026)
const getDateOffset = (daysAgo: number): string => {
  const date = new Date('2026-06-29T10:00:00');
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const INITIAL_PURCHASES: Purchase[] = [
  {
    id: 'PR001',
    invoiceNumber: 'INV-PR-20260615-01',
    date: getDateOffset(14), // June 15
    items: [
      { productId: 'P001', productName: 'Ikan Asin Jambal Roti (Super)', quantity: 50, purchasePrice: 90000, total: 4500000 },
      { productId: 'P002', productName: 'Ikan Asin Teri Medan', quantity: 40, purchasePrice: 110000, total: 4400000 }
    ],
    totalAmount: 8900000,
    supplierName: 'PT Samudra Berkah Jaya',
    notes: 'Pembelian rutin stok bulanan'
  },
  {
    id: 'PR002',
    invoiceNumber: 'INV-PR-20260620-01',
    date: getDateOffset(9), // June 20
    items: [
      { productId: 'P003', productName: 'Ikan Asin Peda Merah (Siam)', quantity: 80, purchasePrice: 45000, total: 3600000 },
      { productId: 'P004', productName: 'Cumi Asin Rebus (Baby Cumi)', quantity: 30, purchasePrice: 75000, total: 2250000 },
      { productId: 'P005', productName: 'Ikan Asin Sepat Kering', quantity: 30, purchasePrice: 40000, total: 1200000 }
    ],
    totalAmount: 7050000,
    supplierName: 'Nelayan Muara Angke H. Nurdin',
    notes: 'Kualitas istimewa langsung bongkar kapal'
  },
  {
    id: 'PR003',
    invoiceNumber: 'INV-PR-20260627-01',
    date: getDateOffset(2), // June 27
    items: [
      { productId: 'P006', productName: 'Ikan Asin Bulu Ayam', quantity: 15, purchasePrice: 50000, total: 750000 },
      { productId: 'P007', productName: 'Ikan Asin Gabus Siam', quantity: 20, purchasePrice: 85000, total: 1700000 }
    ],
    totalAmount: 2450000,
    supplierName: 'UD Nelayan Bersatu Cirebon',
    notes: 'Pengiriman darat ekspres'
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'SL001',
    invoiceNumber: 'TRX-20260625-001',
    date: getDateOffset(4), // June 25
    items: [
      { productId: 'P001', productName: 'Ikan Asin Jambal Roti (Super)', quantity: 3, sellingPrice: 120000, purchasePrice: 90000, total: 360000 },
      { productId: 'P002', productName: 'Ikan Asin Teri Medan', quantity: 5, sellingPrice: 145000, purchasePrice: 110000, total: 725000 }
    ],
    totalAmount: 1085000,
    paymentAmount: 1100000,
    changeAmount: 15000,
    customerName: 'RM Padang Sederhana',
    notes: 'Pelanggan tetap restoran'
  },
  {
    id: 'SL002',
    invoiceNumber: 'TRX-20260626-001',
    date: getDateOffset(3), // June 26
    items: [
      { productId: 'P003', productName: 'Ikan Asin Peda Merah (Siam)', quantity: 10, sellingPrice: 60000, purchasePrice: 45000, total: 600000 },
      { productId: 'P004', productName: 'Cumi Asin Rebus (Baby Cumi)', quantity: 12, sellingPrice: 100000, purchasePrice: 75000, total: 1200000 },
      { productId: 'P006', productName: 'Ikan Asin Bulu Ayam', quantity: 5, sellingPrice: 70000, purchasePrice: 50000, total: 350000 }
    ],
    totalAmount: 2150000,
    paymentAmount: 2200000,
    changeAmount: 50000,
    customerName: 'Ibu Hajah Lilis',
    notes: 'Untuk dikirim ke Bandung'
  },
  {
    id: 'SL003',
    invoiceNumber: 'TRX-20260628-001',
    date: getDateOffset(1), // June 28
    items: [
      { productId: 'P005', productName: 'Ikan Asin Sepat Kering', quantity: 5, sellingPrice: 55000, purchasePrice: 40000, total: 275000 },
      { productId: 'P007', productName: 'Ikan Asin Gabus Siam', quantity: 2, sellingPrice: 115000, purchasePrice: 85000, total: 230000 }
    ],
    totalAmount: 505000,
    paymentAmount: 550000,
    changeAmount: 45000,
    customerName: 'Bapak Rudi Sumpena',
    notes: 'Eceran biasa'
  },
  {
    id: 'SL004',
    invoiceNumber: 'TRX-20260629-001',
    date: getDateOffset(0), // June 29 (Today)
    items: [
      { productId: 'P001', productName: 'Ikan Asin Jambal Roti (Super)', quantity: 2, sellingPrice: 120000, purchasePrice: 90000, total: 240000 },
      { productId: 'P002', productName: 'Ikan Asin Teri Medan', quantity: 5, sellingPrice: 145000, purchasePrice: 110000, total: 725000 },
      { productId: 'P004', productName: 'Cumi Asin Rebus (Baby Cumi)', quantity: 13, sellingPrice: 100000, purchasePrice: 75000, total: 1300000 },
      { productId: 'P006', productName: 'Ikan Asin Bulu Ayam', quantity: 2, sellingPrice: 70000, purchasePrice: 50000, total: 140000 }
    ],
    totalAmount: 2405000,
    paymentAmount: 2500000,
    changeAmount: 95000,
    customerName: 'Katering Sedap Malam',
    notes: 'Pesanan partai katering pernikahan'
  }
];
