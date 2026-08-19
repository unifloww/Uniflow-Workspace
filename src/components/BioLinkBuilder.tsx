import React, { useState } from 'react';
import { useAppContext, BioLink, BioBlock, BioBlockType, BioLinkSocial } from '../context/AppContext';
import { 
  UserCircle2, Settings, Image as ImageIcon, LayoutTemplate, Plus, Trash2, 
  Link as LinkIcon, Copy, ExternalLink, CheckCircle2, Instagram, Youtube, Globe, 
  ShoppingBag, BarChart3, GripVertical, ChevronUp, ChevronDown, MonitorPlay,
  FileText, Calendar, Box, Mail, TrendingUp, CalendarDays, Wallet
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import { doc, writeBatch } from 'firebase/firestore';
import { initFirebase } from '../lib/firebase';


const SOCIAL_ICONS: Record<string, any> = {
  instagram: Instagram, youtube: Youtube, whatsapp: LinkIcon, tiktok: LinkIcon, 
  website: Globe, shopee: ShoppingBag, tokopedia: ShoppingBag, other: LinkIcon
};

export default function BioLinkBuilder() {
  const { bioLinks, setBioLinks, user } = useAppContext();
  
  // Views
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor' | 'stats'>('dashboard');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Editor State
  const [editorTab, setEditorTab] = useState<'blocks' | 'appearance'>('blocks');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    username: string; name: string; bio: string; theme: BioLink['theme']; isActive: boolean; blocks: BioBlock[];
  }>({ username: '', name: '', bio: '', theme: 'light', isActive: true, blocks: [] });


  const [isSavingBlocks, setIsSavingBlocks] = useState(false);
  const [blocksSaveStatus, setBlocksSaveStatus] = useState('');

  // Debounced Save for PageBlocks
  React.useEffect(() => {
    if (!editingId || formData.blocks.length === 0) return;
    
    setIsSavingBlocks(true);
    setBlocksSaveStatus('Menyimpan perubahan...');

    const timer = setTimeout(async () => {
      try {
        const { db } = await initFirebase();
        const batch = writeBatch(db);
        
        formData.blocks.forEach((block, index) => {
          const docRef = doc(db, 'pageBlocks', block.id);
          batch.set(docRef, {
            ...block,
            pageId: editingId,
            creatorId: user?.uid,
            position: index,
            visible: block.isActive !== false,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        });
        
        await batch.commit();
        setIsSavingBlocks(false);
        setBlocksSaveStatus('Tersimpan otomatis');
        setTimeout(() => setBlocksSaveStatus(''), 2000);
      } catch (err) {
        setIsSavingBlocks(false);
        setBlocksSaveStatus('Gagal menyimpan');
        console.error(err);
      }
    }, 1500); // 1.5s debounce

    return () => clearTimeout(timer);
  }, [formData.blocks, editingId, user?.uid]);

  const getBioUrl = (username: string) => `${window.location.origin}/@${username}`;

  const handleCopy = (username: string, id: string) => {
    navigator.clipboard.writeText(getBioUrl(username));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openEditor = (link?: BioLink) => {
    if (link) {
      setFormData({
        username: link.username, name: link.name, bio: link.bio, 
        theme: link.theme, isActive: link.isActive, blocks: link.blocks || []
      });
      setEditingId(link.id);
    } else {
      setFormData({ username: '', name: '', bio: '', theme: 'light', isActive: true, blocks: [] });
      setEditingId(null);
    }
    setCurrentView('editor');
    setEditorTab('blocks');
  };

  const saveLink = () => {
    if (!formData.username || !formData.name) {
      alert("Username dan Nama wajib diisi!");
      return;
    }
    const validUsername = formData.username.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    const exists = bioLinks.some(l => l.username === validUsername && l.id !== editingId);
    if (exists) {
      alert("Username sudah digunakan. Silakan pilih username lain.");
      return;
    }

    const newLink: BioLink = {
      id: editingId || Date.now().toString(),
      userId: user?.uid,
      username: validUsername,
      name: formData.name,
      bio: formData.bio,
      theme: formData.theme,
      blocks: formData.blocks,
      isActive: formData.isActive,
      clicks: editingId ? (bioLinks.find(l => l.id === editingId)?.clicks || 0) : 0,
      views: editingId ? (bioLinks.find(l => l.id === editingId)?.views || 0) : 0,
      createdAt: editingId ? (bioLinks.find(l => l.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    if (editingId) {
      setBioLinks(bioLinks.map(l => l.id === editingId ? newLink : l));
    } else {
      setBioLinks([newLink, ...bioLinks]);
    }
    setCurrentView('dashboard');
  };

  const addBlock = (type: BioBlockType) => {
    const newBlock: BioBlock = {
      id: Date.now().toString(),
      type,
      title: type === 'link' ? 'Tombol Baru' : type === 'text' ? 'Teks Baru' : type === 'product' ? 'Produk Baru' : '',
      url: '',
      content: '',
      isActive: true,
      clicks: 0
    };
    if (type === 'social') newBlock.socials = [];
    
    setFormData(prev => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
    setShowAddModal(false);
  };

  const updateBlock = (index: number, field: keyof BioBlock, value: any) => {
    const newBlocks = [...formData.blocks];
    newBlocks[index] = { ...newBlocks[index], [field]: value };
    setFormData(prev => ({ ...prev, blocks: newBlocks }));
  };

  const removeBlock = (index: number) => {
    const newBlocks = [...formData.blocks];
    newBlocks.splice(index, 1);
    setFormData(prev => ({ ...prev, blocks: newBlocks }));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formData.blocks.length - 1) return;
    const newBlocks = [...formData.blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setFormData(prev => ({ ...prev, blocks: newBlocks }));
  };

  const renderBlockEditor = (block: BioBlock, index: number) => {
    return (
      <div key={block.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-3">
        <div className="flex flex-col gap-1 mt-2 text-gray-400">
          <button onClick={() => moveBlock(index, 'up')} className="hover:text-emerald-600 disabled:opacity-30" disabled={index === 0}><ChevronUp size={18} /></button>
          <GripVertical size={18} className="opacity-30" />
          <button onClick={() => moveBlock(index, 'down')} className="hover:text-emerald-600 disabled:opacity-30" disabled={index === formData.blocks.length - 1}><ChevronDown size={18} /></button>
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{block.type}</span>
            <button onClick={() => removeBlock(index)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
          </div>
          
          {(block.type === 'link' || block.type === 'product' || block.type === 'video') && (
            <input 
              type="text" placeholder="Judul" 
              value={block.title || ''} onChange={e => updateBlock(index, 'title', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          )}
          
          {(block.type === 'link' || block.type === 'product' || block.type === 'video' || block.type === 'image') && (
            <input 
              type="text" placeholder="URL Target" 
              value={block.url || ''} onChange={e => updateBlock(index, 'url', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          )}

          {block.type === 'product' && (
            <input 
              type="text" placeholder="Harga (misal: Rp 150.000)" 
              value={block.price || ''} onChange={e => updateBlock(index, 'price', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          )}

          {block.type === 'text' && (
            <textarea 
              rows={3} placeholder="Teks konten..." 
              value={block.content || ''} onChange={e => updateBlock(index, 'content', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 resize-none"
            ></textarea>
          )}

          {block.type === 'social' && (
            <div className="space-y-2 border-t pt-2 mt-2">
              <p className="text-xs font-bold text-gray-500">Daftar Social Link</p>
              {block.socials?.map((soc, sIdx) => (
                <div key={sIdx} className="flex gap-2 items-center">
                  <select 
                    value={soc.platform}
                    onChange={e => {
                      const newSocials = [...(block.socials || [])];
                      newSocials[sIdx] = { ...soc, platform: e.target.value as any };
                      updateBlock(index, 'socials', newSocials);
                    }}
                    className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none"
                  >
                    <option value="instagram">Instagram</option><option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option><option value="whatsapp">WhatsApp</option>
                    <option value="website">Website</option><option value="other">Lainnya</option>
                  </select>
                  <input 
                    type="text" value={soc.url} placeholder="URL" 
                    onChange={e => {
                      const newSocials = [...(block.socials || [])];
                      newSocials[sIdx] = { ...soc, url: e.target.value };
                      updateBlock(index, 'socials', newSocials);
                    }}
                    className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none" 
                  />
                  <button onClick={() => {
                      const newSocials = [...(block.socials || [])];
                      newSocials.splice(sIdx, 1);
                      updateBlock(index, 'socials', newSocials);
                    }} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => {
                const newSocials = [...(block.socials || []), { platform: 'instagram', url: '' } as BioLinkSocial];
                updateBlock(index, 'socials', newSocials);
              }} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">+ Tambah Akun</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLivePreview = () => {
    return (
      <div className="w-full lg:w-[380px] shrink-0">
        <div className="sticky top-6">
          <div className="bg-gray-900 rounded-[3rem] p-4 shadow-xl border-8 border-gray-800 h-[750px] overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-20"></div>
            
            <div className={`w-full h-full rounded-2xl overflow-y-auto ${
              formData.theme === 'light' ? 'bg-gray-50 text-gray-900' :
              formData.theme === 'dark' ? 'bg-gray-900 text-white' :
              formData.theme === 'minimal' ? 'bg-white text-gray-900' :
              formData.theme === 'gradient' ? 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white' :
              'bg-gradient-to-br from-blue-100 to-emerald-100 text-gray-900'
            }`}>
              <div className="p-6 pt-12 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white/20 mb-4 flex items-center justify-center overflow-hidden">
                  <UserCircle2 size={48} className="text-gray-400" />
                </div>
                <h2 className="text-xl font-black mb-1">{formData.name || 'Nama Anda'}</h2>
                <p className={`text-sm mb-6 ${formData.theme === 'dark' || formData.theme === 'gradient' ? 'text-white/80' : 'text-gray-500'}`}>
                  {formData.bio || 'Bio singkat Anda...'}
                </p>

                <div className="w-full space-y-4">
                  {formData.blocks.map((block, idx) => {
                    if (block.type === 'link' || block.type === 'product') {
                      return (
                        <div key={idx} className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex flex-col justify-center items-center gap-1
                          ${formData.theme === 'dark' ? 'bg-white/10 text-white' : 
                            formData.theme === 'gradient' ? 'bg-white/20 text-white border border-white/30' :
                            formData.theme === 'minimal' ? 'bg-transparent border-2 border-gray-900 text-gray-900' :
                            'bg-white text-gray-900 shadow-sm'}
                        `}>
                          <span>{block.title || 'Tombol Link'}</span>
                          {block.type === 'product' && block.price && (
                            <span className="text-xs opacity-70 font-normal">{block.price}</span>
                          )}
                        </div>
                      )
                    }
                    if (block.type === 'social') {
                      return (
                        <div key={idx} className="flex flex-wrap justify-center gap-3 w-full">
                          {block.socials?.map((s, i) => {
                            const Icon = SOCIAL_ICONS[s.platform] || LinkIcon;
                            return (
                              <div key={i} className={`p-3 rounded-full ${formData.theme === 'dark' || formData.theme === 'gradient' ? 'bg-white/10 text-white' : 'bg-white shadow-sm text-gray-900'}`}>
                                 <Icon size={18} />
                              </div>
                            )
                          })}
                        </div>
                      )
                    }
                    if (block.type === 'text') {
                      return (
                        <div key={idx} className={`w-full text-left p-2 ${formData.theme === 'dark' || formData.theme === 'gradient' ? 'text-white' : 'text-gray-900'}`}>
                          <p className="text-sm">{block.content || 'Paragraf teks akan tampil di sini...'}</p>
                        </div>
                      )
                    }
                    if (block.type === 'image') {
                      return (
                        <div key={idx} className="w-full rounded-2xl overflow-hidden shadow-sm bg-gray-200 min-h-[150px] flex items-center justify-center">
                          {block.url ? <img src={block.url} alt="block" className="w-full h-auto object-cover" /> : <ImageIcon size={32} className="text-gray-400" />}
                        </div>
                      )
                    }
                    if (block.type === 'video') {
                      return (
                        <div key={idx} className="w-full aspect-video rounded-2xl overflow-hidden shadow-sm bg-gray-200 flex items-center justify-center relative">
                          <MonitorPlay size={32} className="text-gray-400" />
                          <div className="absolute inset-0 bg-black/10 flex items-center justify-center"><div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white"><PlayIcon /></div></div>
                        </div>
                      )
                    }
                    return null;
                  })}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (currentView === 'stats') {
    const totalViews = bioLinks.reduce((a, b) => a + (b.views || 0), 0);
    const totalClicks = bioLinks.reduce((a, b) => a + (b.clicks || 0), 0);
    
    return (
      <div className="max-w-[1200px] mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setCurrentView('dashboard')} className="text-gray-500 hover:text-emerald-600 font-bold text-sm">← Kembali</button>
          <h2 className="text-2xl font-black text-gray-900">Statistics</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-gray-700">Total Views & Clicks</h3>
              </div>
              <div className="flex gap-8 mb-8">
                <div>
                  <p className="text-gray-500 text-sm font-bold flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400"></span> Views</p>
                  <p className="text-3xl font-black text-gray-900">{totalViews}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-bold flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Clicks</p>
                  <p className="text-3xl font-black text-gray-900">{totalClicks}</p>
                </div>
              </div>
              {/* Fake chart matching screenshot */}
              <div className="h-48 flex items-end justify-between px-4">
                {[4, 5, 8, 4, 30, 15, 18].map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 w-8">
                    <div className="w-full flex flex-col justify-end h-32 gap-1">
                      <div className="w-full bg-amber-400 rounded-t-sm opacity-80" style={{ height: `${h * 1.5}%` }}></div>
                      <div className="w-full bg-emerald-500 rounded-b-sm opacity-80" style={{ height: `${h}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{13 + i} Aug</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-4">Top Pages</h3>
              <div className="space-y-4">
                {bioLinks.map(l => (
                  <div key={l.id} className="flex justify-between items-center text-sm border-b pb-2">
                    <span className="font-bold text-gray-900">@{l.username}</span>
                    <span className="text-emerald-600 font-bold">{l.views || 0} views</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === 'editor') {
    return (
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentView('dashboard')} className="text-gray-500 hover:text-emerald-600 font-bold text-sm">← Kembali</button>
            <h2 className="text-2xl font-black text-gray-900">{editingId ? 'Edit Landing Page' : 'Buat Landing Page'}</h2>
          </div>
          <button onClick={saveLink} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md transition-colors">
            Simpan Perubahan
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100 px-6 pt-4 gap-6 bg-gray-50">
              <button onClick={() => setEditorTab('blocks')} className={`pb-3 font-bold text-sm border-b-2 transition-colors ${editorTab === 'blocks' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                Susunan Blok
              </button>
              <button onClick={() => setEditorTab('appearance')} className={`pb-3 font-bold text-sm border-b-2 transition-colors ${editorTab === 'appearance' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                Penampilan (Tema)
              </button>
            </div>

            <div className="p-6 md:p-8 flex-1 overflow-y-auto bg-gray-50/50">
              {editorTab === 'blocks' ? (
                <div className="space-y-6 max-w-2xl mx-auto">
                  
                  {/* Basic Info Header */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><UserCircle2 size={18}/> Profil Header</h3>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center shrink-0 border border-gray-200">
                           <ImageIcon size={24} className="text-gray-400" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex shadow-sm rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 bg-white">
                            <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm font-bold border-r border-gray-200 shrink-0">/@</span>
                            <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="username" className="w-full px-3 py-2 text-sm font-bold focus:outline-none" />
                          </div>
                          <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nama Tampilan" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500" />
                        </div>
                      </div>
                      <textarea rows={2} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Tuliskan bio singkat Anda di sini..." className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 resize-none" />
                    </div>
                  </div>

                  {/* Add Block Button */}
                  <button onClick={() => setShowAddModal(true)} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all hover:shadow-lg shadow-emerald-500/30">
                    <Plus size={20} /> Tambah Blok Baru
                  </button>

                  {/* Blocks List */}
                  <div className="space-y-3">
                    {formData.blocks.length === 0 ? (
                      <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
                        <p className="text-gray-500 text-sm">Belum ada blok yang ditambahkan. Klik tombol di atas.</p>
                      </div>
                    ) : (
                      formData.blocks.map((block, idx) => renderBlockEditor(block, idx))
                    )}
                  </div>

                </div>
              ) : (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4">Pilih Tema</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { id: 'light', name: 'Light Basic', bg: 'bg-gray-100' },
                        { id: 'dark', name: 'Dark Mode', bg: 'bg-gray-900 text-white' },
                        { id: 'minimal', name: 'Minimalist', bg: 'bg-white border-2 border-gray-200' },
                        { id: 'gradient', name: 'Color Gradient', bg: 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white' },
                        { id: 'glass', name: 'Glassmorphism', bg: 'bg-gradient-to-br from-blue-100 to-emerald-100' }
                      ].map(t => (
                        <button key={t.id} onClick={() => setFormData({...formData, theme: t.id as any})} className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${formData.theme === t.id ? 'border-emerald-500 bg-emerald-50' : 'border-transparent hover:bg-gray-50 bg-white shadow-sm'}`}>
                          <div className={`w-16 h-20 rounded-lg shadow-sm border border-gray-200 ${t.bg}`}></div>
                          <span className="text-xs font-bold text-gray-700">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {renderLivePreview()}
        </div>

        {/* Add Block Modal matching screenshot */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="text-xl font-black text-gray-900">Add new block</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-900 p-2"><Plus size={24} className="rotate-45"/></button>
              </div>
              <div className="p-6 overflow-y-auto">
                
                <h4 className="font-bold text-gray-400 uppercase text-xs mb-4">Basic</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {[
                    { type: 'image', icon: ImageIcon, title: 'Image', desc: 'Add images', color: 'text-emerald-500 bg-emerald-50' },
                    { type: 'text', icon: FileText, title: 'Text', desc: 'Add headlines and descriptions', color: 'text-emerald-500 bg-emerald-50' },
                    { type: 'link', icon: LinkIcon, title: 'Link', desc: 'Add a link shortcut', color: 'text-emerald-500 bg-emerald-50' },
                    { type: 'video', icon: MonitorPlay, title: 'Video', desc: 'Play video from other platform', color: 'text-emerald-500 bg-emerald-50' },
                    { type: 'social', icon: UserCircle2, title: 'Social Connect', desc: 'Display your social media', color: 'text-emerald-500 bg-emerald-50', badge: 'NEW' }
                  ].map((b, i) => (
                    <button key={i} onClick={() => addBlock(b.type as BioBlockType)} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all text-left">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${b.color}`}><b.icon size={24} /></div>
                      <div>
                        <h5 className="font-bold text-gray-900 flex items-center gap-2">{b.title} {b.badge && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] rounded uppercase font-black">{b.badge}</span>}</h5>
                        <p className="text-xs text-gray-500">{b.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <h4 className="font-bold text-gray-400 uppercase text-xs mb-4">Monetization</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { type: 'product', icon: Box, title: 'Digital Product', desc: 'Sell digital products', color: 'text-orange-500 bg-orange-50' },
                    { type: 'link', icon: FileText, title: 'Blog', desc: 'Create paywall or free story contents', color: 'text-orange-500 bg-orange-50', badge: 'NEW' },
                    { type: 'link', icon: CalendarDays, title: 'Appointment', desc: 'Create paid calendar booking', color: 'text-orange-500 bg-orange-50' },
                    { type: 'product', icon: ShoppingBag, title: 'Affiliate Products', desc: 'Get commission from selling products', color: 'text-orange-500 bg-orange-50' }
                  ].map((b, i) => (
                    <button key={i} onClick={() => addBlock(b.type as BioBlockType)} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all text-left">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${b.color}`}><b.icon size={24} /></div>
                      <div>
                        <h5 className="font-bold text-gray-900 flex items-center gap-2">{b.title} {b.badge && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] rounded uppercase font-black">{b.badge}</span>}</h5>
                        <p className="text-xs text-gray-500">{b.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      
      {/* Top Banner Lynk.id style */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-900">My Lynk</h1>
        <button onClick={() => setCurrentView('stats')} className="p-3 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md text-gray-500 hover:text-emerald-600 transition-all">
          <BarChart3 size={20} />
        </button>
      </div>

      <div className="flex gap-4">
        <div className="px-6 py-2.5 bg-emerald-50 border-2 border-emerald-500 text-emerald-700 rounded-full font-bold text-sm shadow-sm cursor-pointer">
          My Link In Bio
        </div>
        <div className="px-6 py-2.5 bg-white border-2 border-gray-100 text-gray-400 rounded-full font-bold text-sm shadow-sm cursor-not-allowed flex items-center gap-2 relative">
          Landing Pages
          <span className="absolute -top-2.5 -right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-black">New</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Your Pages</h2>
          <button onClick={() => openEditor()} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-colors flex items-center gap-2">
            <Plus size={16} /> Add Page
          </button>
        </div>
        
        {bioLinks.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-2xl">
            <LayoutTemplate size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-bold text-gray-400">Belum ada Link In Bio</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bioLinks.map(link => {
              const bioUrl = getBioUrl(link.username);
              return (
                <div key={link.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className={`absolute top-0 left-0 w-full h-2 ${link.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                  
                  <div className="flex justify-between items-start mb-6 pt-2">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 font-black text-xl">
                         {link.name.charAt(0)}
                       </div>
                       <div>
                         <h3 className="text-lg font-black text-gray-900 leading-tight">{link.name}</h3>
                         <p className="text-xs font-bold text-emerald-600">@{link.username}</p>
                       </div>
                    </div>
                    <div className="p-1 bg-white border border-gray-100 rounded-lg shadow-sm">
                      <QRCodeSVG value={bioUrl} size={32} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100 mb-6">
                    <div className="truncate pr-2">
                      <p className="text-xs text-gray-500 font-medium truncate">{bioUrl}</p>
                    </div>
                    <button onClick={() => handleCopy(link.username, link.id)} className="p-1.5 text-gray-400 hover:text-emerald-600 bg-white rounded-md shadow-sm border border-gray-200 shrink-0">
                      {copiedId === link.id ? <CheckCircle2 size={14} className="text-[#10b981]" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-sm mt-auto border-t border-gray-100 pt-4">
                    <div className="flex gap-4 text-xs font-bold text-gray-500">
                      <span className="flex gap-1 items-center"><MonitorPlay size={14}/> {link.views || 0}</span>
                      <span className="flex gap-1 items-center"><TrendingUp size={14}/> {link.clicks || 0}</span>
                    </div>
                    
                    <div className="flex gap-1">
                       <a href={`/@${link.username}`} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-gray-50"><ExternalLink size={16} /></a>
                       <button onClick={() => openEditor(link)} className="p-2 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50"><Settings size={16} /></button>
                       <button onClick={() => {
                         if(confirm('Hapus Halaman ini?')) { setBioLinks(bioLinks.filter(l => l.id !== link.id)) }
                       }} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3L19 12L5 21V3Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
