import React, { useState } from 'react';
import { BusinessProfile, AdminAccount } from '../types';
import { Store, User, KeyRound, ShieldCheck, Mail, Phone, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface BusinessProfileProps {
  profile: BusinessProfile;
  admins: AdminAccount[];
  onUpdateProfile: (newProfile: BusinessProfile) => void;
  onUpdateAdmins: (newAdmins: AdminAccount[]) => void;
  currentAdmin: AdminAccount;
  onUpdateCurrentAdminInState: (admin: AdminAccount) => void;
}

export default function BusinessProfileComponent({
  profile,
  admins,
  onUpdateProfile,
  onUpdateAdmins,
  currentAdmin,
  onUpdateCurrentAdminInState
}: BusinessProfileProps) {
  // Navigation inside Settings
  const [settingsTab, setSettingsTab] = useState<'profile' | 'security'>('profile');

  // Profile Form state
  const [companyName, setCompanyName] = useState(profile.name);
  const [address, setAddress] = useState(profile.address);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [owner, setOwner] = useState(profile.owner);
  const [headerNote, setHeaderNote] = useState(profile.headerNote || '');
  
  // Profile Success indicators
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Security Form State (Change password for currently logged-in account)
  const [username, setUsername] = useState(currentAdmin.username);
  const [emailAdmin, setEmailAdmin] = useState(currentAdmin.email);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Security Alert Messages
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityError, setSecurityError] = useState('');

  // Handle Profile Update
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);

    if (!companyName.trim() || !address.trim() || !phone.trim() || !owner.trim()) {
      alert('Isi semua kolom bertanda bintang (*)!');
      return;
    }

    const updatedProfile: BusinessProfile = {
      name: companyName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
      owner: owner.trim(),
      headerNote: headerNote.trim() || undefined,
    };

    onUpdateProfile(updatedProfile);
    setProfileSuccess(true);
    
    setTimeout(() => {
      setProfileSuccess(false);
    }, 3000);
  };

  // Handle Security / Admin Credentials Update
  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSecuritySuccess('');
    setSecurityError('');

    if (!username.trim() || !emailAdmin.trim()) {
      setSecurityError('Username dan Email tidak boleh kosong!');
      return;
    }

    // Optional password change logic
    let targetPasswordHash = currentAdmin.passwordHash;
    if (oldPassword || newPassword || confirmPassword) {
      if (oldPassword !== currentAdmin.passwordHash) {
        setSecurityError('Kata sandi lama yang dimasukkan tidak cocok!');
        return;
      }
      if (!newPassword) {
        setSecurityError('Masukkan Kata Sandi Baru Anda!');
        return;
      }
      if (newPassword !== confirmPassword) {
        setSecurityError('Konfirmasi Kata Sandi Baru tidak cocok!');
        return;
      }
      targetPasswordHash = newPassword;
    }

    const updatedAdmin: AdminAccount = {
      ...currentAdmin,
      username: username.trim(),
      email: emailAdmin.trim(),
      passwordHash: targetPasswordHash,
    };

    // Update inside list
    const updatedAdmins = admins.map((ad) => (ad.id === currentAdmin.id ? updatedAdmin : ad));
    onUpdateAdmins(updatedAdmins);

    // Update local state hook
    onUpdateCurrentAdminInState(updatedAdmin);

    // Reset Form Fields
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setSecuritySuccess('Informasi akun administrator berhasil disimpan!');
    
    setTimeout(() => {
      setSecuritySuccess('');
    }, 4000);
  };

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-950 tracking-tight">Profil & Pengaturan Akun</h2>
        <p className="text-slate-500 text-sm">
          Atur informasi badan usaha CV ABADI, logo cetak, serta kelola password administrator.
        </p>
      </div>

      {/* Settings Sub-tabs */}
      <div className="border-b border-slate-100 pb-0.5">
        <nav className="flex gap-4">
          <button
            onClick={() => setSettingsTab('profile')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              settingsTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Store className="w-4 h-4" />
              <span>Profil Usaha CV ABADI</span>
            </span>
          </button>
          <button
            onClick={() => setSettingsTab('security')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              settingsTab === 'security'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>Akun & Keamanan</span>
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Panels */}
      {settingsTab === 'profile' ? (
        <form onSubmit={handleProfileSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Biodata Perusahaan</h3>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Dicetak pada Nota
            </span>
          </div>

          {profileSuccess && (
            <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>Profil usaha berhasil diperbarui dan disinkronisasikan!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Nama Warung / Perusahaan *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
              />
            </div>

            {/* Owner */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Nama Pemilik (Owner) *
              </label>
              <input
                type="text"
                required
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Nomor Telepon Kontak *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium font-mono"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Email Perusahaan
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium font-mono"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Alamat Operasional Gudang/Toko *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 pt-2 items-start text-slate-400 pointer-events-none">
                <MapPin className="w-4 h-4" />
              </span>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
              />
            </div>
          </div>

          {/* Header Note */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Slogan / Header Nota (Samping Logo)
            </label>
            <input
              type="text"
              value={headerNote}
              onChange={(e) => setHeaderNote(e.target.value)}
              placeholder="Penyedia Berbagai Jenis Ikan Asin Berkualitas Tinggi..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
            />
          </div>

          {/* Action button */}
          <div className="pt-4 border-t border-slate-50 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-100 transition-all cursor-pointer"
            >
              Simpan Profil Usaha
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSecuritySubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Ubah Kredensial Administrator</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
              ID: {currentAdmin.id} ({currentAdmin.role})
            </span>
          </div>

          {securitySuccess && (
            <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>{securitySuccess}</span>
            </div>
          )}

          {securityError && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-xs font-semibold text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-red-600 shrink-0" />
              <span>{securityError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Username Akun *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Email Admin *
              </label>
              <input
                type="email"
                required
                value={emailAdmin}
                onChange={(e) => setEmailAdmin(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium font-mono"
              />
            </div>
          </div>

          <div className="border-t border-slate-50 pt-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ganti Kata Sandi (Opsional)</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Old password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Kata Sandi Lama
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan password saat ini"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Password baru"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Ulangi Sandi Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi sandi baru"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-4 border-t border-slate-50 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-100 transition-all cursor-pointer"
            >
              Simpan Perubahan Akun
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
