import React, { useState } from 'react';
import { useAppContext, SmartLink } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Link as LinkIcon, 
  Settings2, 
  BarChart3, 
  QrCode, 
  Globe, 
  Smartphone, 
  Lock, 
  Clock, 
  Copy, 
  ExternalLink,
  Trash2,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { initFirebase } from '../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

export default function SmartLinkTools() {
  const { smartLinks, setSmartLinks, user } = useAppContext();
  const [activeTab, setActiveTab] = useState<'create' | 'links'>('create');
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    originalUrl: '',
    shortUrl: '',
    isActive: true,
  });

  // Advanced Options State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedTab, setAdvancedTab] = useState<'utm' | 'geo' | 'device' | 'protect' | 'limit' | 'rotate'>('utm');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-generate shortUrl if empty based on title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => {
      // If user hasn't typed a custom shortUrl yet, auto generate one
      if (!prev.shortUrl || prev.shortUrl === prev.title.toLowerCase().replace(/[^a-z0-9]/g, '-')) {
        return {
          ...prev,
          title: val,
          shortUrl: val.toLowerCase().replace(/[^a-z0-9]/g, '-')
        };
      }
      return { ...prev, title: val };
    });
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.originalUrl || !formData.shortUrl) {
      alert("Judul, URL Asli, dan Alias (Short URL) wajib diisi!");
      return;
    }

    if (!validateUrl(formData.originalUrl)) {
      alert("Format URL Asli tidak valid.");
      return;
    }

    // Check if shortUrl exists
    const exists = smartLinks.some(l => l.shortUrl.toLowerCase() === formData.shortUrl.toLowerCase());
    if (exists) {
      alert("Alias (Short URL) sudah digunakan. Silakan pilih nama lain.");
      return;
    }

    const newLink: SmartLink = {
      id: Date.now().toString(),
      userId: user?.uid,
      title: formData.title,
      originalUrl: formData.originalUrl.startsWith('http') ? formData.originalUrl : `https://${formData.originalUrl}`,
      shortUrl: formData.shortUrl.toLowerCase(),
      clicks: 0,
      createdAt: new Date().toISOString(),
      isActive: formData.isActive,
    };

    setSmartLinks([newLink, ...smartLinks]);
    
    // Reset Form
    setFormData({ title: '', originalUrl: '', shortUrl: '', isActive: true });
    setShowAdvanced(false);
    setActiveTab('links');
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus SmartLink ini?')) {
      setSmartLinks(smartLinks.filter(l => l.id !== id));
    }
  };

  const getSmartUrl = (shortUrl: string) => {
    // Ideally this points to a redirector like sml.ink/alias.
    // For preview, we show the app url /s/alias
    const origin = window.location.origin;
    return `${origin}/s/${shortUrl}`;
  };

  const handleCopy = (shortUrl: string, id: string) => {
    navigator.clipboard.writeText(getSmartUrl(shortUrl));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#148e73] to-[#0d5c4b] rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <LinkIcon size={24} className="opacity-80" />
            <h2 className="text-sm font-bold uppercase tracking-widest opacity-80">SmartLink Platform</h2>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
            Shorten. Track. Optimize.
          </h1>
          <p className="text-lg opacity-90 font-medium">
            Ubah URL panjang menjadi link pendek yang mudah diingat, pantau analitik real-time, dan optimalkan setiap klik untuk konversi maksimal.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('create')}
          className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'create' ? 'border-[#148e73] text-[#148e73]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Buat Link Baru
        </button>
        <button 
          onClick={() => setActiveTab('links')}
          className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'links' ? 'border-[#148e73] text-[#148e73]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Kelola Link ({smartLinks.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'create' ? (
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
          <div className="max-w-3xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Judul / Nama Campaign</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="Contoh: Promo Ramadhan 2026" 
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73] bg-gray-50 focus:bg-white transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">URL Asli (Destination)</label>
                  <input 
                    type="text" 
                    value={formData.originalUrl}
                    onChange={e => setFormData({...formData, originalUrl: e.target.value})}
                    placeholder="https://tokoanda.com/produk/detail-panjang..." 
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73] bg-gray-50 focus:bg-white transition-colors" 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Custom Alias (Short URL)</label>
                  <div className="flex shadow-sm rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-[#148e73]/20 focus-within:border-[#148e73] transition-colors">
                    <span className="px-4 py-3.5 bg-gray-100 text-gray-500 text-sm font-bold border-r border-gray-200 shrink-0">
                      sml.ink/
                    </span>
                    <input 
                      type="text" 
                      value={formData.shortUrl}
                      onChange={e => setFormData({...formData, shortUrl: e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()})}
                      placeholder="promo-ramadhan" 
                      className="w-full px-4 py-3.5 text-sm font-bold focus:outline-none bg-gray-50 focus:bg-white" 
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1.5 font-medium">Hanya huruf, angka, dan strip (-). Contoh: sml.ink/<span className="font-bold text-gray-700">promo-ramadhan</span></p>
                </div>
                
                <div className="pt-2">
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={formData.isActive}
                      onChange={e => setFormData({...formData, isActive: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300 text-[#148e73] focus:ring-[#148e73]" 
                    />
                    <div>
                      <span className="block text-sm font-bold text-gray-800">Status Link Aktif</span>
                      <span className="block text-xs text-gray-500">Link dapat diakses oleh publik</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Advanced Settings Toggle */}
            <div className="pt-4 border-t border-gray-100">
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#148e73] transition-colors"
              >
                <Settings2 size={16} />
                {showAdvanced ? 'Tutup Pengaturan Lanjutan' : 'Buka Pengaturan Lanjutan (Opsional)'}
              </button>
            </div>

            {/* Advanced Settings Panel (UI Mockup) */}
            {showAdvanced && (
              <div className="bg-gray-50 rounded-2xl p-4 md:p-6 border border-gray-100 animate-in slide-in-from-top-2 duration-200">
                <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
                  {[
                    { id: 'utm', icon: Filter, label: 'UTM Builder' },
                    { id: 'geo', icon: Globe, label: 'Geo Targeting' },
                    { id: 'device', icon: Smartphone, label: 'Device Targeting' },
                    { id: 'protect', icon: Lock, label: 'Password' },
                    { id: 'limit', icon: BarChart3, label: 'Click Limit' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setAdvancedTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${advancedTab === tab.id ? 'bg-white text-[#148e73] shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      <tab.icon size={14} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="min-h-[150px]">
                  {advancedTab === 'utm' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">UTM Source</label>
                        <input type="text" placeholder="google, facebook, instagram" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-[#148e73] focus:ring-1 focus:ring-[#148e73] outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">UTM Medium</label>
                        <input type="text" placeholder="cpc, banner, email" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-[#148e73] focus:ring-1 focus:ring-[#148e73] outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">UTM Campaign</label>
                        <input type="text" placeholder="promo_ramadhan" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-[#148e73] focus:ring-1 focus:ring-[#148e73] outline-none" />
                      </div>
                    </div>
                  )}
                  {advancedTab === 'geo' && (
                    <div className="text-center py-8">
                      <Globe className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm font-bold text-gray-700">Arahkan pengunjung berdasarkan Negara</p>
                      <p className="text-xs text-gray-500 mt-1">Fitur ini tersedia untuk pengguna Premium.</p>
                    </div>
                  )}
                  {advancedTab === 'device' && (
                    <div className="text-center py-8">
                      <Smartphone className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm font-bold text-gray-700">Arahkan pengunjung berdasarkan Perangkat (iOS, Android, Desktop)</p>
                      <p className="text-xs text-gray-500 mt-1">Fitur ini tersedia untuk pengguna Premium.</p>
                    </div>
                  )}
                  {advancedTab === 'protect' && (
                    <div className="max-w-sm">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Password Link</label>
                      <input type="password" placeholder="Masukkan password untuk membuka link" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-[#148e73] focus:ring-1 focus:ring-[#148e73] outline-none" />
                    </div>
                  )}
                  {advancedTab === 'limit' && (
                    <div className="max-w-sm">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Batas Maksimal Klik</label>
                      <input type="number" placeholder="Contoh: 500" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-[#148e73] focus:ring-1 focus:ring-[#148e73] outline-none" />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button 
                onClick={handleSave}
                className="px-8 py-3.5 bg-[#148e73] hover:bg-[#117a63] text-white rounded-xl font-bold text-sm shadow-md transition-colors flex items-center gap-2"
              >
                Buat SmartLink
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {smartLinks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 border-dashed">
              <div className="w-16 h-16 bg-[#ebfcf6] text-[#148e73] rounded-full flex items-center justify-center mx-auto mb-4">
                <LinkIcon size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Belum Ada Link</h3>
              <p className="text-sm text-gray-500 mb-6">Buat SmartLink pertama Anda untuk mulai melacak klik.</p>
              <button onClick={() => setActiveTab('create')} className="px-6 py-2.5 bg-[#148e73] text-white rounded-xl font-bold text-sm shadow-md">
                Buat SmartLink Baru
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {smartLinks.map(link => {
                const smartUrl = getSmartUrl(link.shortUrl);
                return (
                  <div key={link.id} className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                    {/* QR Code */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm mb-3">
                        <QRCodeSVG value={smartUrl} size={80} level="M" />
                      </div>
                      <button className="text-[10px] font-bold text-gray-600 hover:text-[#148e73] flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                        <QrCode size={12} /> Unduh QR
                      </button>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-black text-gray-900 truncate">{link.title}</h3>
                          {link.isActive ? (
                            <span className="text-[10px] font-bold text-[#10b981] bg-[#ebfcf6] px-2 py-0.5 rounded-md border border-[#a7f3d0]">Aktif</span>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">Nonaktif</span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-gray-500 mb-4 truncate" title={link.originalUrl}>{link.originalUrl}</p>
                        
                        <div className="flex items-center gap-2 mb-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100 w-fit">
                          <span className="text-sm font-bold text-[#148e73]">{smartUrl}</span>
                          <button 
                            onClick={() => handleCopy(link.shortUrl, link.id)}
                            className="p-1.5 text-gray-400 hover:text-[#148e73] bg-white rounded-md shadow-sm border border-gray-200 transition-colors"
                            title="Salin Link"
                          >
                            {copiedId === link.id ? <CheckCircle2 size={14} className="text-[#10b981]" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm mt-auto border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <BarChart3 size={16} />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-gray-500 uppercase">Total Clicks</span>
                            <span className="block font-black text-gray-900 leading-none">{link.clicks.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center">
                            <Clock size={16} />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-gray-500 uppercase">Dibuat Pada</span>
                            <span className="block font-bold text-gray-700 leading-none text-xs mt-0.5">
                              {new Date(link.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        
                        <div className="ml-auto flex gap-2">
                           <button onClick={() => handleDelete(link.id)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                             <Trash2 size={16} />
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
