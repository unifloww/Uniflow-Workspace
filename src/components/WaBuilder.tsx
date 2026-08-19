import React, { useState } from 'react';
import { useAppContext, WaLink } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import { Edit2, Copy, ExternalLink, Trash2, CheckCircle2 } from 'lucide-react';
import { initFirebase } from '../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

export default function WaBuilder() {
  const { waLinks, setWaLinks, user } = useAppContext();
  
  const [formData, setFormData] = useState({
    title: '',
    purpose: '',
    whatsapp: '',
    message: 'Halo, saya ingin mendapatkan informasi lebih lanjut.',
    isActive: true
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatPhoneNumber = (phone: string) => {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.substring(1);
    } else if (!clean.startsWith('62') && clean.length > 8) {
      clean = '62' + clean;
    }
    return clean;
  };

  const getWaUrl = (phone: string, message: string) => {
    return `https://wa.me/${formatPhoneNumber(phone)}?text=${encodeURIComponent(message)}`;
  };

  const handleSave = () => {
    if (!formData.title || !formData.whatsapp) {
      alert("Judul link dan Nomor WhatsApp wajib diisi!");
      return;
    }

    if (editingId) {
      setWaLinks(waLinks.map(link => 
        link.id === editingId ? { ...link, ...formData } : link
      ));
    } else {
      const newLink: WaLink = {
        id: Date.now().toString(),
        userId: user?.uid,
        ...formData,
        clicks: 0
      };
      setWaLinks([newLink, ...waLinks]);
    }
    
    setFormData({
      title: '',
      purpose: '',
      whatsapp: '',
      message: 'Halo, saya ingin mendapatkan informasi lebih lanjut.',
      isActive: true
    });
    setEditingId(null);
  };

  const handleEdit = (link: WaLink) => {
    setFormData({
      title: link.title,
      purpose: link.purpose,
      whatsapp: link.whatsapp,
      message: link.message,
      isActive: link.isActive
    });
    setEditingId(link.id);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus link ini?')) {
      setWaLinks(waLinks.filter(l => l.id !== id));
    }
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestOpen = async (link: WaLink) => {
    // Increment click locally
    setWaLinks(waLinks.map(l => l.id === link.id ? { ...l, clicks: l.clicks + 1 } : l));
    
    // Increment click in Firestore if possible
    try {
      const { db } = await initFirebase();
      await updateDoc(doc(db, 'walinks', link.id), {
        clicks: increment(1)
      });
    } catch (e) {
      console.error(e);
    }

    const url = getWaUrl(link.whatsapp, link.message);
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div>
        <h2 className="text-[10px] font-extrabold text-[#148e73] uppercase tracking-widest mb-1">WhatsApp Link Generator</h2>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">WA.me Builder</h1>
        <p className="text-sm font-medium text-gray-500 mt-2 max-w-2xl">
          Buat banyak link WhatsApp bernama, simpan tujuan campaign, salin QR, edit pesan, dan hapus kapan saja.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Panel - Form */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
            <h3 className="text-[10px] font-extrabold text-[#148e73] uppercase tracking-widest mb-1">Instant WhatsApp Link</h3>
            <h2 className="text-xl font-black text-gray-900 mb-2">{editingId ? 'Edit link WA.me' : 'Buat link WA.me baru'}</h2>
            <p className="text-sm text-gray-500 mb-6 font-medium">Beri nama link, tulis tujuan campaign, lalu simpan agar mudah diedit lagi nanti.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Judul link</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Contoh: WA Nia" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73]" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Tujuan / catatan</label>
                <input 
                  type="text" 
                  value={formData.purpose}
                  onChange={e => setFormData({...formData, purpose: e.target.value})}
                  placeholder="Contoh: Promo body lotion Juni" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73]" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Nomor WhatsApp</label>
                <input 
                  type="text" 
                  value={formData.whatsapp}
                  onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                  placeholder="081234567890" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73]" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Pesan pembuka</label>
                <textarea 
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73] resize-none" 
                ></textarea>
              </div>

              <label className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" 
                />
                <span className="text-sm font-bold text-gray-800">Aktif</span>
              </label>

              <button 
                onClick={handleSave}
                className="w-full bg-[#148e73] hover:bg-[#117a63] text-white py-3.5 rounded-xl font-bold text-sm transition-colors"
              >
                {editingId ? 'Simpan Perubahan' : 'Simpan Link WhatsApp'}
              </button>

              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-500 font-medium break-all">
                  Preview: {getWaUrl(formData.whatsapp || '6281234567890', formData.message)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - List */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-[10px] font-extrabold text-[#148e73] uppercase tracking-widest mb-1">Daftar Link</h3>
                <h2 className="text-xl font-black text-gray-900">Link WhatsApp tersimpan</h2>
              </div>
              <span className="bg-[#ebfcf6] text-[#10b981] px-3 py-1 rounded-full text-[11px] font-bold">
                {waLinks.length} link
              </span>
            </div>

            <div className="space-y-4">
              {waLinks.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                  <p className="text-gray-500 font-medium text-sm">Belum ada link WhatsApp yang disimpan.</p>
                </div>
              ) : (
                waLinks.map(link => {
                  const url = getWaUrl(link.whatsapp, link.message);
                  return (
                    <div key={link.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                      <div className="p-5 flex flex-col sm:flex-row gap-5">
                        
                        {/* QR Code */}
                        <div className="flex flex-col items-center shrink-0">
                          <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm mb-2">
                            <QRCodeSVG value={url} size={80} level="M" />
                          </div>
                          {link.isActive ? (
                            <span className="text-[10px] font-bold text-[#10b981] bg-[#ebfcf6] px-3 py-1 rounded-full w-full text-center">Aktif</span>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full w-full text-center">Nonaktif</span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="text-lg font-black text-gray-900 truncate pr-4">{link.title}</h3>
                              <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg shrink-0">
                                {link.clicks} klik
                              </span>
                            </div>
                            <p className="text-xs font-medium text-gray-500 mb-3">{link.purpose}</p>
                            
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                              <p className="text-[10px] text-gray-500 font-medium break-all line-clamp-2">
                                {url}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button 
                              onClick={() => handleCopy(url, link.id)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-[#ebfcf6] text-[#10b981] rounded-xl text-[11px] font-bold hover:bg-[#d1fae5] transition-colors border border-[#a7f3d0]"
                            >
                              {copiedId === link.id ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                              {copiedId === link.id ? 'Tersalin' : 'Salin link'}
                            </button>
                            <button 
                              onClick={() => handleTestOpen(link)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-700 rounded-xl text-[11px] font-bold hover:bg-gray-50 transition-colors border border-gray-200"
                            >
                              <ExternalLink size={14} /> Uji buka
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Footer Actions */}
                      <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-between items-center">
                        <button 
                          onClick={() => handleEdit(link)}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-[#148e73] hover:text-[#117a63] transition-colors"
                        >
                          <Edit2 size={14} /> Edit link
                        </button>
                        <button 
                          onClick={() => handleDelete(link.id)}
                          className="text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
