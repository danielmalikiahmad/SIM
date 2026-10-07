import React, { useState } from 'react';
import { AdminAccount } from '../types';
import { KeyRound, User, Fish, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  admins: AdminAccount[];
  onLoginSuccess: (admin: AdminAccount) => void;
  companyName: string;
}

export default function Login({ admins, onLoginSuccess, companyName }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate light network delay
    setTimeout(() => {
      const foundAdmin = admins.find(
        (a) => a.username.toLowerCase() === username.toLowerCase() && a.passwordHash === password
      );

      setIsLoading(false);
      if (foundAdmin) {
        onLoginSuccess(foundAdmin);
      } else {
        setError('Username atau Password salah! Periksa kembali kredensial Anda.');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen glass-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="h-16 w-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/35 border border-amber-400"
          >
            <Fish className="h-9 w-9 text-white" />
          </motion.div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-slate-900 tracking-tight">
          {companyName}
        </h2>
        <p className="mt-2 text-center text-xs uppercase tracking-widest text-slate-500 font-bold">
          Sistem Informasi Manajemen & Penjualan Ikan Asin
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card py-8 px-4 sm:px-10 border border-white/60 shadow-2xl"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3"
              >
                <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <span className="text-xs text-red-800 font-semibold">{error}</span>
              </motion.div>
            )}

            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Username Admin
              </label>
              <div className="mt-1 relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoFocus
                  placeholder="Masukkan username (contoh: admin)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white/50 border border-white/40 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Kata Sandi (Password)
              </label>
              <div className="mt-1 relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Masukkan password (contoh: admin123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white/50 border border-white/40 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 glass-btn-primary cursor-pointer disabled:opacity-50 text-xs uppercase tracking-wider font-bold"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Memverifikasi...</span>
                  </div>
                ) : (
                  'Masuk ke Sistem'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-white/30 pt-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              Akun Uji Coba Cepat (Demo Mode)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => { setUsername('admin'); setPassword('admin123'); }}
                className="p-3 bg-white/40 hover:bg-white/60 border border-white/50 hover:border-amber-500/30 rounded-xl text-left transition-colors text-slate-600 font-medium shadow-sm cursor-pointer"
              >
                <div className="text-amber-700 font-bold">Admin Utama</div>
                <div className="text-[10px] mt-1">User: <code className="font-mono bg-white/50 px-1 rounded text-amber-900">admin</code></div>
                <div className="text-[10px]">Pass: <code className="font-mono bg-white/50 px-1 rounded text-amber-900">admin123</code></div>
              </button>
              <button
                onClick={() => { setUsername('kasir'); setPassword('kasir123'); }}
                className="p-3 bg-white/40 hover:bg-white/60 border border-white/50 hover:border-amber-500/30 rounded-xl text-left transition-colors text-slate-600 font-medium shadow-sm cursor-pointer"
              >
                <div className="text-orange-700 font-bold">Petugas Kasir</div>
                <div className="text-[10px] mt-1">User: <code className="font-mono bg-white/50 px-1 rounded text-orange-900">kasir</code></div>
                <div className="text-[10px]">Pass: <code className="font-mono bg-white/50 px-1 rounded text-orange-900">kasir123</code></div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
