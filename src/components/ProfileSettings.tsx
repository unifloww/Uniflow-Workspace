import React, { useState, useEffect } from 'react';
import { Camera, User, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function ProfileSettings() {
  const { user } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    whatsapp: '',
    password: '',
    theme: 'terang'
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div className="relative z-10 space-y-1.5">
          <p className="text-[#107962] text-[11px] font-bold tracking-widest uppercase">ACCOUNT SETTINGS</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Profil & Keamanan</h1>
          <p className="text-gray-500 text-sm font-medium">Atur identitas akun, foto profil, WhatsApp, password, dan mode tampilan dashboard.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Avatar Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-24 h-24 rounded-3xl object-cover shadow-lg shadow-emerald-500/20 mb-4" />
            ) : (
              <div className="w-24 h-24 bg-[#10b981] rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4 text-white text-3xl font-black">
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <h3 className="text-lg font-bold text-gray-900">{formData.name || 'User'}</h3>
            <p className="text-sm text-[#10b981] font-medium mb-6">{formData.email}</p>
            
            <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#a7f3d0] text-[#10b981] font-bold text-sm rounded-xl hover:bg-[#ebfcf6] transition-colors">
              <Camera size={16} />
              Upload foto max 300 KB
            </button>
            <p className="text-[10px] text-gray-400 mt-3 font-medium">Foto ini akan tampil di profil dan tombol akun kanan atas.</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
             <div className="flex items-center gap-3 p-2 border-b border-gray-50 pb-3">
               <div className="p-2 bg-[#ebfcf6] text-[#10b981] rounded-lg">
                 <User size={18} />
               </div>
               <div>
                 <p className="text-sm font-bold text-gray-800">Identitas dashboard lebih personal.</p>
               </div>
             </div>
             <div className="flex items-center gap-3 p-2">
               <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                 <ShieldCheck size={18} />
               </div>
               <div>
                 <p className="text-sm font-bold text-gray-800">Password bisa diganti kapan saja.</p>
               </div>
             </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 h-full">
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nama lengkap</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73] transition-all bg-gray-50 focus:bg-white" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73] transition-all bg-gray-50 focus:bg-white" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp</label>
                <input 
                  type="text" 
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73] transition-all bg-gray-50 focus:bg-white" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password baru <span className="text-gray-400 font-normal">(kosongkan jika tidak diganti)</span></label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73] transition-all bg-gray-50 focus:bg-white" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mode tampilan</label>
                <select 
                  value={formData.theme}
                  onChange={(e) => setFormData({...formData, theme: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73] transition-all bg-gray-50 focus:bg-white appearance-none"
                >
                  <option value="terang">Terang</option>
                  <option value="gelap">Gelap</option>
                  <option value="sistem">Ikuti Sistem</option>
                </select>
              </div>

              <div className="pt-4">
                <button className="w-full py-3.5 bg-[#148e73] hover:bg-[#107962] text-white rounded-xl font-bold text-[15px] shadow-sm transition-all transform hover:-translate-y-0.5">
                  Simpan Profil & Keamanan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Referal Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[#107962] text-[10px] font-bold tracking-widest uppercase mb-1">KODE REFERAL</p>
          <h3 className="text-lg font-bold text-gray-900">Hubungkan akun ke partner Anda</h3>
          <p className="text-sm text-gray-500 font-medium mb-1 mt-1">Bisa diisi belakangan. Kode hanya dapat ditautkan satu kali.</p>
          <p className="text-xs text-gray-400">Kode referal sudah tercatat dan tidak dapat diubah.</p>
        </div>
        <div className="bg-[#ebfcf6] px-4 py-2 rounded-xl flex items-center gap-2">
           <CheckCircle2 size={16} className="text-[#10b981]" />
           <span className="text-sm font-bold text-[#10b981]">Sudah terhubung</span>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-red-100 flex flex-col items-start gap-4">
        <div>
          <p className="text-red-500 text-[10px] font-bold tracking-widest uppercase mb-1">ZONA AKUN</p>
          <p className="text-sm text-gray-500 font-medium mt-1">Akun akan dinonaktifkan dan Anda akan keluar dari semua sesi.</p>
        </div>
        <button className="px-5 py-2 border border-red-200 text-red-500 font-bold text-sm rounded-xl hover:bg-red-50 transition-colors">
          Hapus akun
        </button>
      </div>
      
      <div className="text-center text-[11px] font-medium text-gray-400 py-2">
        Copyright © 2026 PT. LIFIE KARYA NUSANTARA. Seluruh hak cipta dilindungi.
      </div>
    </div>
  );
}
