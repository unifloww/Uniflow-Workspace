import React, { useState } from 'react';
import { 
  Plus, Calendar, Filter, RotateCcw, Power, Trash2, Edit2, 
  Copy, Eye, ChevronDown, Settings, AlertCircle, Users, 
  ShieldCheck, FormInput, SlidersHorizontal, Play, X
} from 'lucide-react';
import { useAppContext, Campaign, AdminStat } from '../context/AppContext';
import { initFirebase } from '../lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

const googleEvents = ['generate_lead', 'contact', 'add_to_cart', 'begin_checkout', 'purchase', 'sign_up', 'page_view'];
const metaEvents = ['Lead', 'Contact', 'AddToCart', 'InitiateCheckout', 'Purchase', 'CompleteRegistration', 'ViewContent', 'PageView'];
const tiktokEvents = ['Contact', 'SubmitForm', 'AddToCart', 'InitiateCheckout', 'CompletePayment', 'CompleteRegistration', 'ViewContent', 'ClickButton'];

export default function LinkRotator() {
  const { admins, campaigns, setCampaigns, leads, setLeads } = useAppContext();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedStats, setExpandedStats] = useState<string | null>(null);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);
  const [previewLeadForm, setPreviewLeadForm] = useState({ name: '', whatsapp: '', message: '' });
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [resetId, setResetId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pixelParamModal, setPixelParamModal] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);

  const defaultForm = {
    title: '',
    slug: '',
    method: 'berurutan',
    domain: 'wa.uniflow.my.id',
    selectedAdmins: [] as {id: string, weight: number}[],
    useSticky: true,
    stickyDays: 30,
    useForm: false,
    formTitle: 'Isi Data Dulu Ya',
    message: 'Halo {nickname}, saya tertarik dengan {campaign} pada {tanggal} {waktu}.'
  };
  const [formData, setFormData] = useState(defaultForm);

  const handleOpenForm = (camp?: Campaign) => {
    if (camp) {
      setEditingId(camp.id);
      setFormData({
        title: camp.name,
        slug: camp.slug,
        method: camp.method,
        domain: camp.url.split('/')[0] || 'wa.uniflow.my.id',
        useSticky: camp.isSticky,
        stickyDays: camp.stickyDays,
        useForm: camp.useForm,
        formTitle: camp.formTitle || 'Isi Data Dulu Ya',
        message: camp.message || 'Halo {nickname}, saya tertarik dengan {campaign} pada {tanggal} {waktu}.',
        selectedAdmins: camp.adminStats.map(s => ({ id: s.id, weight: s.weight || 1 }))
      });
    } else {
      setEditingId(null);
      setFormData(defaultForm);
    }
    setFormError(null);
    setIsFormOpen(true);
  };

  // Parameter states for modal
  const [params, setParams] = useState({
    judul: true, slug: true, namaAdmin: true, nickname: true,
    nomorWa: true, contentName: true, contentCategory: true
  });

  const toggleExpanded = (id: string) => {
    setExpandedStats(prev => prev === id ? null : id);
  };

  const toggleAdmin = (adminId: string) => {
    const exists = formData.selectedAdmins.find(a => a.id === adminId);
    if (exists) {
      setFormData({...formData, selectedAdmins: formData.selectedAdmins.filter(a => a.id !== adminId)});
    } else {
      setFormData({...formData, selectedAdmins: [...formData.selectedAdmins, {id: adminId, weight: 1}]});
    }
  };

  const updateAdminWeight = (adminId: string, weight: number) => {
    setFormData({...formData, selectedAdmins: formData.selectedAdmins.map(a => a.id === adminId ? {...a, weight} : a)});
  };

  const handleSave = () => {
    if (!formData.title || !formData.slug) {
      setFormError("Judul campaign dan Slug URL wajib diisi!");
      return;
    }
    if (formData.selectedAdmins.length === 0) {
      setFormError("Pilih minimal 1 admin untuk campaign ini.");
      return;
    }
    setFormError(null);
    
    if (editingId) {
      const existingCampaign = campaigns.find(c => c.id === editingId);
      if (!existingCampaign) return;

      const updatedCampaign: Campaign = {
        ...existingCampaign,
        name: formData.title,
        slug: formData.slug,
        url: `${formData.domain}/${formData.slug}`,
        method: formData.method,
        isSticky: formData.useSticky,
        stickyDays: formData.stickyDays,
        useForm: formData.useForm,
        formTitle: formData.formTitle,
        message: formData.message,
        adminStats: formData.selectedAdmins.map(sa => {
          const adminInfo = admins.find(a => a.id === sa.id);
          const existingStat = existingCampaign.adminStats.find(as => as.id === sa.id);
          return {
            id: sa.id,
            name: adminInfo?.name || 'Unknown',
            clicks: existingStat?.clicks || 0,
            invalid: existingStat?.invalid || 0,
            allTimeConnected: existingStat?.allTimeConnected || 0,
            allTimeRequests: existingStat?.allTimeRequests || 0,
            weight: sa.weight
          };
        })
      };

      setCampaigns(campaigns.map(c => c.id === editingId ? updatedCampaign : c));
    } else {
      const newCampaign: Campaign = {
        id: Date.now().toString(),
        name: formData.title,
        slug: formData.slug,
        url: `${formData.domain}/${formData.slug}`,
        method: formData.method,
        isSticky: formData.useSticky,
        stickyDays: formData.stickyDays,
        periodClicks: 0,
        totalClicks: 0,
        isActive: true,
        useForm: formData.useForm,
        formTitle: formData.formTitle,
        message: formData.message,
        dailyClicks: {},
        adminStats: formData.selectedAdmins.map(sa => {
          const adminInfo = admins.find(a => a.id === sa.id);
          return {
            id: sa.id,
            name: adminInfo?.name || 'Unknown',
            clicks: 0,
            invalid: 0,
            allTimeConnected: 0,
            allTimeRequests: 0,
            weight: sa.weight
          }
        })
      };
      setCampaigns([newCampaign, ...campaigns]);
    }
    setIsFormOpen(false);
    setFormData(defaultForm);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleReset = (id: string) => {
    setResetId(id);
  };

  const handleToggleStatus = (id: string) => {
    setCampaigns(campaigns.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const handleSimulateSubmitLead = () => {
    if (!previewCampaign) return;

    if (previewCampaign.useForm && (!previewLeadForm.name || !previewLeadForm.whatsapp)) {
      alert("Nama dan WhatsApp wajib diisi untuk simulasi!");
      return;
    }

    if (previewCampaign.useForm) {
      const newLead = {
        id: Date.now().toString(),
        name: previewLeadForm.name,
        whatsapp: previewLeadForm.whatsapp,
        message: previewLeadForm.message,
        campaign: previewCampaign.name,
        date: new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      };
      setLeads([newLead, ...leads]);
    }

    // Increment click simulation
    setCampaigns(campaigns.map(c => {
      if (c.id === previewCampaign.id) {
        // Increment first admin for simulation sake
        const newStats = [...c.adminStats];
        if (newStats.length > 0) {
          newStats[0] = {
            ...newStats[0],
            clicks: newStats[0].clicks + 1,
            allTimeConnected: newStats[0].allTimeConnected + 1,
            allTimeRequests: newStats[0].allTimeRequests + 1,
          };
        }
        const today = new Date().toISOString().split('T')[0];
        return {
          ...c,
          periodClicks: c.periodClicks + 1,
          totalClicks: c.totalClicks + 1,
          dailyClicks: {
            ...c.dailyClicks,
            [today]: (c.dailyClicks?.[today] || 0) + 1
          },
          adminStats: newStats
        };
      }
      return c;
    }));

    setPreviewCampaign(null);
    setPreviewLeadForm({ name: '', whatsapp: '', message: '' });
    alert("Simulasi berhasil! Lead tersimpan dan klik tercatat (cek Analytics/Admin).");
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header Banner */}
      {!isFormOpen && (
        <div className="bg-[#ebfcf6] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm border border-[#a7f3d0] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-50 transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
          
          <div className="relative z-10 space-y-1.5 mb-5 md:mb-0">
            <p className="text-[#107962] text-[11px] font-bold tracking-widest uppercase">LEAD DISTRIBUTION ENGINE</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Campaign Rotator</h1>
            <p className="text-gray-600 text-sm font-medium">Atur link, domain, admin, anti-bot, sticky admin, form lead, dan tracking campaign.</p>
          </div>
          <div className="relative z-10 flex w-full md:w-auto">
            <button 
              onClick={() => setIsFormOpen(true)}
              className="flex-1 md:flex-none bg-[#1ca886] hover:bg-[#20b893] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow border border-[#23c29b] transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Buat Campaign</span>
            </button>
          </div>
        </div>
      )}

      {/* Form View */}
      {isFormOpen && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="space-y-1.5 mb-4 md:mb-0">
              <p className="text-[#107962] text-[11px] font-bold tracking-widest uppercase">LEAD DISTRIBUTION ENGINE</p>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Campaign Rotator</h1>
              <p className="text-gray-500 text-sm">Atur link, domain, admin, anti-bot, sticky admin, form lead, dan tracking campaign.</p>
            </div>
            <button 
              className="bg-[#1ca886] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow border border-[#23c29b] opacity-50 cursor-not-allowed flex items-center gap-2"
            >
              <Plus size={18} /> Buat Campaign
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-lg font-extrabold text-[#8b5cf6]">Buat Campaign Lengkap</h2>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="px-5 py-2 border border-[#148e73] text-[#148e73] rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors"
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

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Left Column */}
              <div className="flex-1 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Judul campaign" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73] text-sm text-gray-700 outline-none transition-shadow" 
                  />
                  <input 
                    type="text" 
                    placeholder="Slug URL" 
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73] text-sm text-gray-700 outline-none transition-shadow" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select 
                    value={formData.method}
                    onChange={(e) => setFormData({...formData, method: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73] text-sm text-gray-700 outline-none bg-white font-medium"
                  >
                    <option value="berurutan">Berurutan</option>
                    <option value="acak">Acak Rata</option>
                    <option value="bobot">Berdasarkan Bobot</option>
                  </select>
                  <select 
                    value={formData.domain}
                    onChange={(e) => setFormData({...formData, domain: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73] text-sm text-gray-700 outline-none bg-white font-medium"
                  >
                    <option value="wa.uniflow.my.id">wa.uniflow.my.id</option>
                    <option value="info.uniflow.my.id">info.uniflow.my.id</option>
                  </select>
                </div>

                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73] text-sm text-gray-700 outline-none bg-white">
                  <option>Tanpa custom domain</option>
                </select>

                <textarea 
                  rows={4} 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#148e73]/20 focus:border-[#148e73] text-sm text-gray-700 outline-none transition-shadow resize-none"
                  placeholder="Halo {nickname}, saya tertarik dengan {campaign} pada {tanggal} {waktu}."
                ></textarea>

                {/* Pilih Admin Block */}
                <div className="relative">
                  <div 
                    onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                    className="bg-[#ebfcf6] px-4 py-3.5 flex items-center justify-between border border-[#a7f3d0] rounded-xl cursor-pointer hover:bg-[#d1fae5] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-[#10b981]" />
                      <span className="text-sm font-bold text-[#059669]">
                        {formData.selectedAdmins.length > 0 
                          ? `${formData.selectedAdmins.length} Admin terpilih` 
                          : 'Pilih Admin Campaign tanpa batas'}
                      </span>
                    </div>
                    <ChevronDown size={18} className={`text-[#10b981] transition-transform ${adminDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {adminDropdownOpen && (
                    <div className="absolute z-20 top-full mt-2 left-0 right-0 border border-gray-200 rounded-xl bg-white shadow-xl overflow-hidden">
                      <div className="p-3 space-y-2 max-h-[220px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                        {admins.map(admin => {
                          const isSelected = formData.selectedAdmins.some(a => a.id === admin.id);
                          const adminData = formData.selectedAdmins.find(a => a.id === admin.id);
                          return (
                            <div key={admin.id} className={`flex items-center justify-between p-3 border rounded-xl transition-colors ${isSelected ? 'border-[#148e73] bg-[#ebfcf6]/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                              <label className="flex items-center gap-3 cursor-pointer flex-1">
                                <input 
                                  type="checkbox" 
                                  checked={isSelected}
                                  onChange={() => toggleAdmin(admin.id)}
                                  className="w-4 h-4 rounded border-gray-300 text-[#148e73] focus:ring-[#148e73]" 
                                />
                                <div>
                                  <p className="text-sm font-bold text-gray-800">{admin.name}</p>
                                  <p className="text-[11px] text-gray-500 font-medium">+{admin.countryCode || '62'}{admin.whatsapp}</p>
                                </div>
                              </label>
                              {isSelected && formData.method === 'bobot' && (
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Bobot</span>
                                  <input 
                                    type="number" 
                                    min="1" 
                                    value={adminData?.weight || 1}
                                    onChange={(e) => updateAdminWeight(admin.id, parseInt(e.target.value) || 1)}
                                    className="w-14 px-2 py-1.5 text-sm font-bold text-center border border-gray-300 rounded-lg focus:outline-none focus:border-[#148e73] focus:ring-1 focus:ring-[#148e73]" 
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {admins.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">Tidak ada admin tersedia.</p>
                        )}
                      </div>
                      <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                        <button className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors">
                          Belum ada admin? Tambahkan admin baru
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sticky Admin Block */}
                <div className="border border-blue-100 rounded-2xl overflow-hidden bg-blue-50/40">
                  <div className="p-5">
                    <label className="flex items-center gap-2.5 cursor-pointer mb-1.5">
                      <input 
                        type="checkbox" 
                        checked={formData.useSticky}
                        onChange={(e) => setFormData({...formData, useSticky: e.target.checked})}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" 
                      />
                      <span className="text-sm font-bold text-gray-800">Gunakan Sticky Admin</span>
                    </label>
                    <p className="text-xs text-blue-600/80 font-medium mb-4 ml-7">Menjaga visitor tetap terhubung ke admin yang sama agar percakapan konsisten.</p>
                    {formData.useSticky && (
                      <div className="ml-7 animate-in fade-in slide-in-from-top-1">
                        <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Durasi sticky (hari)</label>
                        <input 
                          type="number" 
                          value={formData.stickyDays}
                          onChange={(e) => setFormData({...formData, stickyDays: parseInt(e.target.value) || 1})}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-700 outline-none bg-white transition-shadow" 
                        />
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column */}
              <div className="w-full lg:w-[400px] space-y-5">
                
                {/* Anti Bot */}
                <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 font-extrabold text-gray-800 mb-4">
                    <ShieldCheck size={20} className="text-gray-700" /> Keamanan Anti Bot
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer mb-4">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                    <span className="text-sm font-bold text-gray-800">Campaign aktif</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <input type="number" defaultValue={3} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 text-center outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    <input type="number" defaultValue={60} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 text-center outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    <input type="number" defaultValue={300} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 text-center outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>

                {/* Pre WA Form */}
                <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-5">
                  <label className="flex items-center gap-2.5 cursor-pointer mb-3">
                    <input 
                      type="checkbox" 
                      checked={formData.useForm}
                      onChange={(e) => setFormData({...formData, useForm: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" 
                    />
                    <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5"><FormInput size={18}/> Form sebelum WhatsApp</span>
                  </label>
                  {formData.useForm && (
                    <div className="animate-in fade-in slide-in-from-top-1">
                      <input 
                        type="text" 
                        value={formData.formTitle}
                        onChange={(e) => setFormData({...formData, formTitle: e.target.value})}
                        placeholder="Judul form custom" 
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white" 
                      />
                    </div>
                  )}
                </div>

                {/* Tracking Pixels */}
                <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-5 space-y-6">
                  <p className="text-[11px] font-medium text-gray-500 leading-relaxed mb-2">
                    Masukkan ID pixel saja. Event dipilih dari dropdown agar format tracking tetap rapi.
                  </p>

                  {/* Google */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Google Tag / Ads ID</label>
                      <button onClick={() => setPixelParamModal('google')} className="flex items-center gap-1 text-[10px] font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
                        <SlidersHorizontal size={12} /> Edit
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Contoh: G-XXXX" className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-white" />
                      <select className="w-[140px] px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-white font-medium">
                        {googleEvents.map(e => <option key={e}>{e}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-extrabold text-[#2563eb] uppercase tracking-widest">Meta Pixel ID</label>
                      <button onClick={() => setPixelParamModal('meta')} className="flex items-center gap-1 text-[10px] font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
                        <SlidersHorizontal size={12} /> Edit
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Contoh: 123456789" className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white" />
                      <select className="w-[140px] px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white font-medium">
                        {metaEvents.map(e => <option key={e}>{e}</option>)}
                      </select>
                    </div>
                    <p className="text-[10px] text-[#2563eb] font-medium leading-relaxed pt-1">
                      Untuk Meta cukup salin angka Pixel ID, lalu pilih event seperti Lead, Contact, atau AddToCart.
                    </p>
                  </div>

                  {/* Tiktok */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-extrabold text-gray-600 uppercase tracking-widest">Tiktok Pixel ID</label>
                      <button onClick={() => setPixelParamModal('tiktok')} className="flex items-center gap-1 text-[10px] font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
                        <SlidersHorizontal size={12} /> Edit
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Contoh: CXXXXXX" className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 bg-white" />
                      <select className="w-[140px] px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 bg-white font-medium">
                        {tiktokEvents.map(e => <option key={e}>{e}</option>)}
                      </select>
                    </div>
                  </div>

                </div>
                
                <button 
                  onClick={handleSave}
                  className="w-full bg-[#1ca886] hover:bg-[#20b893] text-white py-4 rounded-xl font-bold text-[15px] shadow border border-[#23c29b] transition-all"
                >
                  Simpan Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {!isFormOpen && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* List Header */}
          <div className="p-6 border-b border-gray-100 bg-[#f0fdf4]/30">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <p className="text-[#107962] text-[11px] font-bold tracking-widest uppercase mb-1">CAMPAIGN PERFORMANCE</p>
                <h2 className="text-xl font-extrabold text-gray-900">Daftar Campaign dan Klik Harian</h2>
                <p className="text-xs font-medium text-gray-500 mt-1">Panel monitor dipindahkan ke Analytics. Angka periode di tabel ini mengikuti filter: 30 hari terakhir.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm">
                  mm/dd/yyyy <Calendar size={16} className="ml-3 text-gray-400" />
                </div>
                <button className="flex items-center gap-2 bg-[#0b1120] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow hover:bg-gray-900 transition-colors">
                  <Filter size={16} /> Filter
                </button>
                <button className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors bg-white">
                  Reset
                </button>
                <div className="bg-[#0b1120] text-white px-5 py-2 rounded-xl flex flex-col items-center justify-center min-w-[100px] shadow-md ml-2">
                   <span className="text-[10px] font-medium text-gray-400">Klik periode</span>
                   <span className="text-xl font-black leading-none">102</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-gray-100 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Campaign</th>
                  <th className="px-6 py-4">Metode</th>
                  <th className="px-6 py-4">Klik Periode</th>
                  <th className="px-6 py-4">Statistik Admin</th>
                  <th className="px-6 py-4">Total Klik</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Link & Tools</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {campaigns.map((camp) => (
                  <tr key={camp.id} className={`hover:bg-gray-50/50 transition-colors align-top ${!camp.isActive ? 'opacity-70' : ''}`}>
                    <td className="px-6 py-5">
                      <p className="text-sm font-extrabold text-gray-900 mb-0.5">{camp.name}</p>
                      <p className="text-[11px] font-medium text-gray-500 mb-2">{camp.url}</p>
                      <button 
                        onClick={() => handleOpenForm(camp)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                      >
                        <Edit2 size={12} strokeWidth={2.5} /> Edit Campaign Lengkap
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-block px-2.5 py-1 bg-[#f3e8ff] text-[#7e22ce] text-[10px] font-extrabold tracking-wide rounded-full mb-1.5">
                        {camp.method}
                      </span>
                      <p className="text-[10px] font-medium text-gray-400">Sticky {camp.isSticky ? 'aktif' : 'nonaktif'}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="bg-[#0b1120] text-white rounded-xl p-3.5 inline-block min-w-[140px] shadow-md">
                        <p className="text-[10px] font-medium text-gray-400 mb-1">30 hari terakhir</p>
                        <p className="text-3xl font-black leading-none mb-1">{camp.periodClicks}</p>
                        <p className="text-[9px] font-bold text-[#86ebd3]">klik tersambung WA</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <button 
                        onClick={() => toggleExpanded(camp.id)} 
                        className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#107962] hover:text-[#0b6350] transition-colors mb-3"
                      >
                        {expandedStats === camp.id ? <ChevronDown size={14} strokeWidth={3}/> : <Play size={10} className="fill-current"/>} 
                        {camp.adminStats.length} admin - lihat performa
                      </button>
                      
                      {expandedStats === camp.id && (
                        <div className="border border-[#a7f3d0] rounded-xl p-4 bg-white shadow-sm w-full min-w-[260px] animate-in slide-in-from-top-2 duration-200">
                          {camp.adminStats.map(stat => {
                            const percent = Math.min(100, Math.round((stat.clicks / camp.periodClicks) * 100)) || 0;
                            return (
                              <div key={stat.id} className="mb-3.5 last:mb-0">
                                <div className="flex justify-between text-[11px] font-extrabold text-gray-800 mb-1.5">
                                  <span>{stat.name}</span>
                                  <span className="text-[#107962]">{stat.clicks} klik</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-1">
                                  <div className="h-full bg-[#06b6d4] rounded-full" style={{width: `${percent}%`}}></div>
                                </div>
                                <p className="text-[9px] font-medium text-gray-400">{stat.invalid} tidak valid pada periode ini</p>
                              </div>
                            );
                          })}
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <p className="text-[10px] font-extrabold text-gray-800 mb-1.5">Total sepanjang waktu:</p>
                            {camp.adminStats.map(stat => (
                               <p key={stat.id} className="text-[9px] text-gray-500 font-medium mb-0.5">
                                 {stat.name}: <span className="font-bold text-gray-700">{stat.allTimeConnected}</span> tersambung / {stat.allTimeRequests} request
                               </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xl font-extrabold text-gray-900 leading-none mb-1">{camp.totalClicks}</p>
                      <p className="text-[11px] font-medium text-gray-400">semua waktu</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {camp.isActive ? (
                        <span className="inline-flex px-3 py-1 bg-[#d1fae5] text-[#059669] text-[10px] font-extrabold tracking-wide rounded-full">Aktif</span>
                      ) : (
                        <span className="inline-flex px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-extrabold tracking-wide rounded-full">Nonaktif</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`https://${camp.url}`);
                            setCopiedId(camp.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg bg-white text-xs font-bold transition-colors shadow-sm ${copiedId === camp.id ? 'border-[#059669] text-[#059669]' : 'border-[#a7f3d0] text-[#10b981] hover:bg-[#d1fae5]'}`}
                        >
                          <Copy size={14} strokeWidth={2.5}/> {copiedId === camp.id ? 'Tersalin' : 'Salin'}
                        </button>
                        <button 
                          onClick={() => window.open(`/r/${camp.slug || camp.url.split('/').pop()}`, '_blank')}
                          className="p-1.5 border border-[#a7f3d0] text-[#10b981] rounded-lg hover:bg-[#d1fae5] bg-white transition-colors shadow-sm" title="Preview Halaman Rotator"
                        >
                          <Eye size={14} strokeWidth={2.5}/>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleStatus(camp.id)}
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors shadow-sm ${camp.isActive ? 'border-[#a7f3d0] text-[#10b981] hover:bg-[#d1fae5] bg-white' : 'border-gray-300 text-gray-400 hover:bg-gray-100 bg-white'}`}
                          title={camp.isActive ? "Nonaktifkan" : "Aktifkan"}
                        >
                          <Power size={14} strokeWidth={2.5}/>
                        </button>
                        <button 
                          onClick={() => handleReset(camp.id)}
                          className="w-8 h-8 rounded-lg border border-[#a7f3d0] text-[#10b981] flex items-center justify-center hover:bg-[#d1fae5] bg-white transition-colors shadow-sm"
                          title="Reset Statistik"
                        >
                          <RotateCcw size={14} strokeWidth={2.5}/>
                        </button>
                        <button 
                          onClick={() => handleDelete(camp.id)}
                          className="w-8 h-8 rounded-lg border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-50 bg-white transition-colors shadow-sm"
                          title="Hapus"
                        >
                          <Trash2 size={14} strokeWidth={2.5}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-center text-[11px] font-medium text-gray-400 py-2">
        Copyright © 2026 PT. LIFIE KARYA NUSANTARA. Seluruh hak cipta dilindungi.
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Hapus Campaign?</h3>
            <p className="text-sm font-medium text-gray-500 mb-8">Tindakan ini permanen. Semua data statistik dan konfigurasi rotasi akan hilang.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">Batal</button>
              <button onClick={async () => { 
                const { db } = await initFirebase();
                if (deleteId) await deleteDoc(doc(db, 'campaigns', deleteId));
                setCampaigns(campaigns.filter(c => c.id !== deleteId)); 
                setDeleteId(null); 
              }} className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors shadow-sm">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {resetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Reset Statistik?</h3>
            <p className="text-sm font-medium text-gray-500 mb-8">Jumlah klik pada periode ini akan direset menjadi 0. Data sepanjang waktu tetap aman.</p>
            <div className="flex gap-3">
              <button onClick={() => setResetId(null)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">Batal</button>
              <button onClick={() => { 
                setCampaigns(campaigns.map(c => c.id === resetId ? { ...c, periodClicks: 0, adminStats: c.adminStats.map(a => ({...a, clicks: 0, invalid: 0})) } : c)); 
                setResetId(null); 
              }} className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors shadow-sm">Ya, Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Pixel Parameter Modal */}
      {pixelParamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-[400px] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest mb-1">{pixelParamModal.toUpperCase()} PIXEL ID</p>
                <h3 className="text-lg font-extrabold text-gray-900">List Parameter</h3>
              </div>
              <button onClick={() => setPixelParamModal(null)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { key: 'judul', label: 'Judul campaign' },
                { key: 'slug', label: 'Slug campaign' },
                { key: 'namaAdmin', label: 'Nama Admin Campaign' },
                { key: 'nickname', label: 'Nickname admin' },
                { key: 'nomorWa', label: 'Nomor WhatsApp admin' },
                { key: 'contentName', label: 'Content name' },
                { key: 'contentCategory', label: 'Content category' },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between p-3 border border-gray-100 bg-gray-50/50 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <span className="text-xs font-bold text-gray-700 pr-2">{item.label}</span>
                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${params[item.key as keyof typeof params] ? 'bg-[#10b981] text-white' : 'border border-gray-300 bg-white'}`}>
                    {params[item.key as keyof typeof params] && <Settings size={12} className="opacity-0 hidden" />}
                    {params[item.key as keyof typeof params] && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={params[item.key as keyof typeof params]} 
                    onChange={() => setParams({...params, [item.key]: !params[item.key as keyof typeof params]})}
                  />
                </label>
              ))}
            </div>

            <button onClick={() => setPixelParamModal(null)} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition-colors shadow-sm">
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* Form Preview Modal (Lead Simulation) */}
      {previewCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
            <button 
              onClick={() => setPreviewCampaign(null)}
              className="absolute top-4 right-4 p-2 bg-gray-100 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X size={18} />
            </button>

            {previewCampaign.useForm ? (
              <>
                <div className="mb-6 text-center">
                  <div className="w-16 h-16 bg-[#ebfcf6] text-[#10b981] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#a7f3d0]">
                    <FormInput size={32} />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900">{previewCampaign.formTitle || 'Isi Data'}</h3>
                  <p className="text-sm font-medium text-gray-500 mt-1">Silakan lengkapi data di bawah ini sebelum melanjutkan ke WhatsApp admin.</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Nama Lengkap</label>
                    <input 
                      type="text" 
                      value={previewLeadForm.name}
                      onChange={(e) => setPreviewLeadForm({...previewLeadForm, name: e.target.value})}
                      placeholder="Masukkan nama Anda" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-shadow" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Nomor WhatsApp</label>
                    <input 
                      type="text" 
                      value={previewLeadForm.whatsapp}
                      onChange={(e) => setPreviewLeadForm({...previewLeadForm, whatsapp: e.target.value.replace(/[^0-9]/g, '')})}
                      placeholder="Contoh: 08123456789" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-shadow" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Pesan (Opsional)</label>
                    <textarea 
                      rows={2}
                      value={previewLeadForm.message}
                      onChange={(e) => setPreviewLeadForm({...previewLeadForm, message: e.target.value})}
                      placeholder="Tulis pesan Anda..." 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-shadow resize-none" 
                    ></textarea>
                  </div>
                </div>

                <button 
                  onClick={handleSimulateSubmitLead}
                  className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-3.5 rounded-xl font-bold text-[15px] transition-colors shadow flex justify-center items-center gap-2"
                >
                  Kirim & Lanjut WhatsApp
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#ebfcf6] text-[#10b981] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Play size={32} className="ml-1" />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">Mengarahkan ke WhatsApp...</h3>
                <p className="text-sm text-gray-500 mb-8">Sistem sedang memilih admin terbaik untuk Anda.</p>
                <button 
                  onClick={handleSimulateSubmitLead}
                  className="bg-[#10b981] hover:bg-[#059669] text-white px-8 py-3 rounded-xl font-bold text-sm transition-colors shadow inline-flex"
                >
                  Lanjutkan Simulasi
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
