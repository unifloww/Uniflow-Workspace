import React, { useState } from 'react';
import { Plus, Search, RotateCcw, Power, Edit2, Trash2, UserCog, AlertCircle } from 'lucide-react';
import { useAppContext, Admin } from '../context/AppContext';
import { initFirebase } from '../lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

const allDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const defaultForm = {
  name: '',
  nickname: '',
  countryCode: '62',
  whatsapp: '',
  is24Hours: true,
  startTime: '08:00',
  endTime: '17:00',
  days: allDays,
  message: 'Halo {nickname}, saya tertarik dengan {campaign}.'
};

export default function AdminRotator() {
  const { admins, setAdmins } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultForm);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua status');
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [resetId, setResetId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenForm = (admin?: Admin) => {
    setFormError(null);
    if (admin) {
      setFormData({
        name: admin.name,
        nickname: admin.nickname,
        countryCode: admin.countryCode || '62',
        whatsapp: admin.whatsapp,
        is24Hours: admin.is24Hours,
        startTime: admin.startTime,
        endTime: admin.endTime,
        days: admin.days,
        message: admin.message,
      });
      setEditingId(admin.id);
    } else {
      setFormData(defaultForm);
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!formData.name || !formData.whatsapp) {
      setFormError("Nama dan WhatsApp wajib diisi!");
      return;
    }
    setFormError(null);

    if (editingId) {
      setAdmins(admins.map(a => a.id === editingId ? { ...a, ...formData } : a));
    } else {
      const newAdmin: Admin = {
        id: Date.now().toString(),
        ...formData,
        stats: { forwarded: 0, unforwarded: 0, invalid: 0 },
        isActive: true,
      };
      setAdmins([...admins, newAdmin]);
    }
    handleCloseForm();
  };

  const handleToggleStatus = (id: string) => {
    setAdmins(admins.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleResetStats = (id: string) => {
    setResetId(id);
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day) 
        : [...prev.days, day]
    }));
  };

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          admin.whatsapp.includes(searchQuery);
    const matchesStatus = statusFilter === 'Semua status' || 
                          (statusFilter === 'Aktif' && admin.isActive) || 
                          (statusFilter === 'Nonaktif' && !admin.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm border border-gray-100 relative overflow-hidden">
        {/* Subtle gradient background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        
        <div className="relative z-10 space-y-1.5 mb-5 md:mb-0">
          <p className="text-[#107962] text-[11px] font-bold tracking-widest uppercase">KONTAK DAN PERFORMA CS</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Admin Rotator</h1>
          <p className="text-gray-500 text-sm font-medium">Kelola nomor, status, jam kerja, dan statistik setiap admin.</p>
        </div>
        <div className="relative z-10 flex w-full md:w-auto">
          {!isFormOpen && (
            <button 
              onClick={() => handleOpenForm()}
              className="flex-1 md:flex-none bg-[#1ca886] hover:bg-[#20b893] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow border border-[#23c29b] transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Tambah Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Add/Edit Admin Form */}
      {isFormOpen && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-[#107962]">
              {editingId ? 'Edit Admin' : 'Tambah Admin Baru'}
            </h2>
            <button 
              onClick={handleCloseForm}
              className="px-4 py-2 border border-[#148e73] text-[#148e73] rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors"
            >
              Tutup
            </button>
          </div>

          {formError && (
            <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle size={16} />
              {formError}
            </div>
          )}

          <div className="space-y-4 md:space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <input 
                type="text" 
                placeholder="Nama admin" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73] text-sm text-gray-700 placeholder-gray-400" 
              />
              <input 
                type="text" 
                placeholder="Nickname" 
                value={formData.nickname}
                onChange={e => setFormData({...formData, nickname: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73] text-sm text-gray-700 placeholder-gray-400" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 items-center">
              <div className="flex gap-2">
                <select 
                  className="px-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73] text-sm text-gray-700 bg-white" 
                  value={formData.countryCode}
                  onChange={e => setFormData({...formData, countryCode: e.target.value})}
                >
                  <option value="62">🇮🇩 ID +62</option>
                  <option value="60">🇲🇾 MY +60</option>
                  <option value="65">🇸🇬 SG +65</option>
                  <option value="82">🇰🇷 KR +82</option>
                  <option value="86">🇨🇳 CN +86</option>
                  <option value="81">🇯🇵 JP +81</option>
                </select>
                <input 
                  type="text" 
                  placeholder="8123456789" 
                  value={formData.whatsapp}
                  onChange={e => setFormData({...formData, whatsapp: e.target.value.replace(/[^0-9]/g, '')})}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73] text-sm text-gray-700 placeholder-gray-400" 
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.is24Hours}
                  onChange={e => setFormData({...formData, is24Hours: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300 text-[#148e73] focus:ring-[#148e73]" 
                />
                <span className="text-sm font-bold text-gray-700">Aktif 24 jam</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div className="relative">
                <input 
                  type="time" 
                  value={formData.startTime}
                  onChange={e => setFormData({...formData, startTime: e.target.value})}
                  disabled={formData.is24Hours}
                  className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73] text-sm text-gray-700 bg-white ${formData.is24Hours ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`} 
                />
              </div>
              <div className="relative">
                <input 
                  type="time" 
                  value={formData.endTime}
                  onChange={e => setFormData({...formData, endTime: e.target.value})}
                  disabled={formData.is24Hours}
                  className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73] text-sm text-gray-700 bg-white ${formData.is24Hours ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`} 
                />
              </div>
            </div>

            <div>
              <textarea 
                rows={3} 
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73] text-sm text-gray-700 placeholder-gray-400 resize-none"
                placeholder="Halo {nickname}, saya tertarik dengan {campaign}."
              ></textarea>
            </div>

            <div className="flex flex-wrap gap-4">
              {allDays.map(day => (
                <label key={day} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.days.includes(day)}
                    onChange={() => toggleDay(day)}
                    className="w-4 h-4 rounded border-gray-300 text-[#148e73] focus:ring-[#148e73]" 
                  />
                  <span className="text-sm font-medium text-gray-600">{day}</span>
                </label>
              ))}
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-[#1ca886] hover:bg-[#20b893] text-white py-3.5 rounded-xl font-bold text-sm shadow border border-[#23c29b] transition-all flex items-center justify-center gap-2 mt-2"
            >
              <UserCog size={18} />
              <span>Simpan Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73] bg-white transition-shadow"
            placeholder="Cari nama atau nomor..."
          />
        </div>
        <div className="flex gap-3">
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73] min-w-[140px]"
          >
            <option>Semua status</option>
            <option>Aktif</option>
            <option>Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Data Table / List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-4 md:px-6 py-4 whitespace-nowrap">Admin</th>
                <th className="p-4 md:px-6 py-4 whitespace-nowrap">WhatsApp</th>
                <th className="p-4 md:px-6 py-4 whitespace-nowrap">Jam Kerja</th>
                <th className="p-4 md:px-6 py-4 whitespace-nowrap">Statistik</th>
                <th className="p-4 md:px-6 py-4 whitespace-nowrap text-center">Status</th>
                <th className="p-4 md:px-6 py-4 whitespace-nowrap text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 text-sm">
                    Tidak ada data admin yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id} className={`hover:bg-gray-50/50 transition-colors group ${!admin.isActive ? 'opacity-75' : ''}`}>
                    <td className="p-4 md:px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-bold text-gray-800">{admin.name}</p>
                      <p className="text-[11px] text-gray-500">{admin.nickname}</p>
                    </td>
                    <td className="p-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                      +62{admin.whatsapp}
                    </td>
                    <td className="p-4 md:px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-bold text-gray-800">
                        {admin.is24Hours ? '24 Jam' : `${admin.startTime} - ${admin.endTime}`}
                      </p>
                      <p className="text-[11px] text-gray-500 w-32 truncate" title={admin.days.join(', ')}>
                        {admin.days.length === 7 ? 'Setiap Hari' : admin.days.join(', ')}
                      </p>
                    </td>
                    <td className="p-4 md:px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-bold text-gray-800">{admin.stats.forwarded} diteruskan</p>
                      <p className="text-[11px] text-gray-500 mb-1.5">{admin.stats.unforwarded} belum diteruskan · {admin.stats.invalid} tidak valid</p>
                      <button 
                        onClick={() => handleResetStats(admin.id)}
                        className="text-[11px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw size={12} strokeWidth={3} />
                        Reset statistik
                      </button>
                    </td>
                    <td className="p-4 md:px-6 py-4 whitespace-nowrap text-center">
                      {admin.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#d1fae5] text-[#059669]">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="p-4 md:px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleStatus(admin.id)}
                          className={`w-8 h-8 md:w-9 md:h-9 rounded-lg border flex items-center justify-center transition-colors ${admin.isActive ? 'border-[#a7f3d0] text-[#10b981] hover:bg-[#d1fae5]' : 'border-gray-300 text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`} 
                          title={admin.isActive ? "Nonaktifkan" : "Aktifkan"}
                        >
                          <Power size={16} strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={() => handleOpenForm(admin)}
                          className="h-8 md:h-9 px-3 rounded-lg border border-[#a7f3d0] text-[#10b981] flex items-center justify-center gap-1.5 hover:bg-[#d1fae5] transition-colors font-bold text-xs" 
                          title="Edit"
                        >
                          <Edit2 size={14} strokeWidth={2.5} />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(admin.id)}
                          className="w-8 h-8 md:w-9 md:h-9 rounded-lg border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-50 transition-colors" 
                          title="Hapus"
                        >
                          <Trash2 size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="text-center text-[11px] font-medium text-gray-400 py-2">
        Copyright © 2026 PT. LIFIE KARYA NUSANTARA. Seluruh hak cipta dilindungi.
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Admin?</h3>
            <p className="text-sm text-gray-500 mb-6">Tindakan ini tidak dapat dibatalkan. Admin akan dihapus dari sistem.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">Batal</button>
              <button onClick={async () => { 
                const { db } = await initFirebase();
                if (deleteId) await deleteDoc(doc(db, 'admins', deleteId));
                setAdmins(admins.filter(a => a.id !== deleteId)); 
                setDeleteId(null); 
              }} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {resetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reset Statistik?</h3>
            <p className="text-sm text-gray-500 mb-6">Apakah Anda yakin ingin mengatur ulang semua angka statistik admin ini ke 0?</p>
            <div className="flex gap-3">
              <button onClick={() => setResetId(null)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">Batal</button>
              <button onClick={() => { setAdmins(admins.map(a => a.id === resetId ? { ...a, stats: { forwarded: 0, unforwarded: 0, invalid: 0 } } : a)); setResetId(null); }} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors">Ya, Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
