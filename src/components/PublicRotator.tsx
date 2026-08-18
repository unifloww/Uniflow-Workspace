import React, { useState, useEffect } from 'react';
import { FormInput, Play } from 'lucide-react';
import { Admin, Campaign } from '../context/AppContext';
import { initFirebase } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment, addDoc } from 'firebase/firestore';

export default function PublicRotator({ slug }: { slug: string }) {
  const [formData, setFormData] = useState({ name: '', whatsapp: '', message: '' });
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        const { db } = await initFirebase();
        const campaignsRef = collection(db, 'campaigns');
        const q = query(campaignsRef, where('slug', '==', slug));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const campDoc = querySnapshot.docs[0];
          const campData = { id: campDoc.id, ...campDoc.data() } as Campaign;
          
          if (!campData.isActive) {
             setCampaign(null);
             setIsLoading(false);
             return;
          }

          setCampaign(campData);

          // Fetch admins for this user
          if (campData.userId) {
            const adminsRef = collection(db, 'admins');
            const adminsQuery = query(adminsRef, where('userId', '==', campData.userId));
            const adminsSnapshot = await getDocs(adminsQuery);
            const adminsData = adminsSnapshot.docs
              .map(d => ({ id: d.id, ...d.data() } as Admin))
              .filter(a => a.isActive);
            setAdmins(adminsData);
          }
        }
      } catch (err) {
        console.error('Error fetching campaign', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampaignData();
  }, [slug]);

  useEffect(() => {
    if (campaign && !campaign.useForm && admins.length > 0) {
      setIsRedirecting(true);
      const timer = setTimeout(() => {
        executeRotation();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [campaign, admins]);

  const executeRotation = async (leadData?: any) => {
    if (!campaign) return;
    
    // 1. Find active admins for this campaign
    const activeAdminIds = campaign.adminStats.map(stat => stat.id);
    const availableAdmins = admins.filter(a => activeAdminIds.includes(a.id));

    if (availableAdmins.length === 0) {
      setError("Maaf, tidak ada admin yang tersedia saat ini.");
      setIsRedirecting(false);
      return;
    }

    // 2. Select admin based on method
    let selectedAdmin: Admin = availableAdmins[0];
    
    if (campaign.method === 'acak') {
      const randomIndex = Math.floor(Math.random() * availableAdmins.length);
      selectedAdmin = availableAdmins[randomIndex];
    } else if (campaign.method === 'bobot') {
      const totalWeight = campaign.adminStats.reduce((sum, stat) => sum + (stat.weight || 1), 0);
      let randomWeight = Math.random() * totalWeight;
      for (const stat of campaign.adminStats) {
        randomWeight -= (stat.weight || 1);
        if (randomWeight <= 0) {
          const found = availableAdmins.find(a => a.id === stat.id);
          if (found) {
            selectedAdmin = found;
            break;
          }
        }
      }
    } else {
      const lastIndexStr = localStorage.getItem(`rotator_last_${campaign.id}`);
      let nextIndex = lastIndexStr ? parseInt(lastIndexStr) + 1 : 0;
      if (nextIndex >= availableAdmins.length) nextIndex = 0;
      selectedAdmin = availableAdmins[nextIndex];
      localStorage.setItem(`rotator_last_${campaign.id}`, nextIndex.toString());
    }

    // 3. Update Stats in Firestore
    try {
      const { db } = await initFirebase();
      const newStats = campaign.adminStats.map(stat => {
        if (stat.id === selectedAdmin.id) {
          return {
            ...stat,
            clicks: stat.clicks + 1,
            allTimeConnected: stat.allTimeConnected + 1,
            allTimeRequests: stat.allTimeRequests + 1,
          };
        }
        return stat;
      });

      const today = new Date().toISOString().split('T')[0];
      const dailyClicks = campaign.dailyClicks || {};
      
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const device = isMobile ? 'Mobile' : 'Desktop';
      
      const hour = new Date().getHours().toString().padStart(2, '0') + ':00';
      
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const location = tz.includes('/') ? tz.split('/')[1].replace('_', ' ') : tz || 'Unknown';

      await updateDoc(doc(db, 'campaigns', campaign.id), {
        periodClicks: increment(1),
        totalClicks: increment(1),
        [`dailyClicks.${today}`]: increment(1),
        [`deviceStats.${device}`]: increment(1),
        [`hourlyStats.${hour}`]: increment(1),
        [`locationStats.${location}`]: increment(1),
        adminStats: newStats
      });

      // Update global admin stats
      await updateDoc(doc(db, 'admins', selectedAdmin.id), {
        'stats.forwarded': increment(1)
      });

      if (leadData) {
        await addDoc(collection(db, 'leads'), {
          ...leadData,
          createdAt: new Date(),
          campaignId: campaign.id,
          userId: campaign.userId
        });
      }
    } catch (e) {
      console.error('Error updating stats', e);
    }

    // 4. Construct WhatsApp URL
    let waPhone = selectedAdmin.whatsapp.replace(/[^0-9]/g, '');
    let countryCode = selectedAdmin.countryCode || '62';
    if (waPhone.startsWith('0')) {
       waPhone = countryCode + waPhone.substring(1);
    } else if (!waPhone.startsWith(countryCode)) {
       // if it doesn't start with 0 and doesn't have country code, prepend it
       // Wait, if user typed 85155441987 and selected +62, waPhone won't start with 62.
       // It's safer to always ensure it starts with country code if it's a valid local number format.
       if (waPhone.length >= 8 && waPhone.length <= 15 && !waPhone.startsWith(countryCode)) {
           waPhone = countryCode + waPhone;
       }
    }
    
    let textMessage = campaign.message || selectedAdmin.message || `Halo {nickname}, saya tertarik dengan {campaign} pada {tanggal} {waktu}.`;
    textMessage = textMessage.replace(/{nickname}/g, selectedAdmin.nickname || '');
    textMessage = textMessage.replace(/{campaign}/g, campaign.name || '');
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    textMessage = textMessage.replace(/{tanggal}/g, dateStr);
    textMessage = textMessage.replace(/{waktu}/g, timeStr);
    
    if (leadData && leadData.name) {
      textMessage += `\n\n*Data Customer:*\nNama: ${leadData.name}\nWA: ${leadData.whatsapp}`;
      if (leadData.message) textMessage += `\nCatatan: ${leadData.message}`;
    }

    const waUrl = `https://api.whatsapp.com/send/?phone=${waPhone}&text=${encodeURIComponent(textMessage)}`;
    
    window.location.href = waUrl;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.whatsapp || !campaign) return;

    const newLead = {
      name: formData.name,
      whatsapp: formData.whatsapp,
      message: formData.message,
      campaign: campaign.name,
      date: new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    setIsRedirecting(true);
    executeRotation(newLead);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f3f6f9] flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981]"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full">
          <h1 className="text-4xl font-black text-gray-900 mb-4">404</h1>
          <p className="text-gray-500 mb-6">Campaign tidak ditemukan atau sudah tidak aktif.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f6f9] flex flex-col items-center justify-center p-4 font-sans selection:bg-[#148e73] selection:text-white">
      <div className="mb-8 flex items-center justify-center gap-4">
        <img src="https://firebasestorage.googleapis.com/v0/b/uniflow/o/Uniflowlogo.jpg?alt=media&token=13a47214-7471-49a8-a272-9664cdfe700f" alt="Uniflow" className="h-10 md:h-12 object-contain mix-blend-multiply" />
        <span className="text-gray-300 text-3xl font-light mb-1">|</span>
        <img src="https://rkgroupproperti.com/wp-content/uploads/2026/05/WA-ROTATOR-LOGO-scaled.png" alt="WA Rotator" className="h-8 md:h-10 object-contain opacity-80" />
      </div>
      <div className="bg-white rounded-[2rem] p-6 md:p-8 w-full max-w-sm shadow-2xl relative overflow-hidden border border-gray-100">
        
        {error ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold">!</span>
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Terjadi Kesalahan</h3>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        ) : isRedirecting ? (
          <div className="text-center py-10">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-[#10b981] rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-2 bg-[#10b981] rounded-full animate-pulse opacity-30"></div>
              <div className="relative w-full h-full bg-[#ebfcf6] text-[#10b981] rounded-full flex items-center justify-center shadow-inner z-10">
                <Play size={40} className="ml-1" fill="currentColor" />
              </div>
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-3 tracking-tight">Mengarahkan ke WhatsApp...</h3>
            <p className="text-sm text-gray-500 max-w-[250px] mx-auto leading-relaxed">
              Sistem sedang menghubungkan Anda dengan admin terbaik kami.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6 text-center">
              <div className="w-16 h-16 bg-[#ebfcf6] text-[#10b981] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#a7f3d0] shadow-sm">
                <FormInput size={30} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">{campaign.formTitle || 'Isi Data'}</h3>
              <p className="text-sm font-medium text-gray-500 mt-2 leading-relaxed">Silakan lengkapi data di bawah ini sebelum melanjutkan ke WhatsApp admin.</p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Masukkan nama Anda" 
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all bg-gray-50 focus:bg-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Nomor WhatsApp</label>
                <input 
                  type="text" 
                  required
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value.replace(/[^0-9]/g, '')})}
                  placeholder="Contoh: 08123456789" 
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all bg-gray-50 focus:bg-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Pesan <span className="text-gray-400 font-normal capitalize">(Opsional)</span></label>
                <textarea 
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Tulis pesan Anda..." 
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all resize-none bg-gray-50 focus:bg-white" 
                ></textarea>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-4 rounded-xl font-bold text-[15px] transition-all shadow-md shadow-emerald-500/20 flex justify-center items-center gap-2 hover:shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-0.5"
            >
              Kirim & Lanjut WhatsApp
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
