import React from 'react';
import { 
  GitMerge, Users, CheckCircle2, 
  UserCog, BarChart2, LinkIcon, ShoppingBag, MessageCircle,
  ArrowRight
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Dashboard({ setActiveItem }: { setActiveItem?: (item: string) => void }) {
  const { campaigns, admins, leads, user } = useAppContext();

  const totalCampaigns = campaigns.length;
  const activeAdmins = admins.filter(a => a.isActive).length;
  const validClicks = campaigns.reduce((acc, c) => acc + (c.totalClicks || 0), 0);
  const totalLeads = leads?.length || 0;

  // Time based greeting
  const hour = new Date().getHours();
  let greeting = 'Selamat Pagi';
  if (hour >= 10 && hour < 15) greeting = 'Selamat Siang';
  else if (hour >= 15 && hour < 18) greeting = 'Selamat Sore';
  else if (hour >= 18 || hour < 4) greeting = 'Selamat Malam';

  // Calculate top campaign
  const topCampaign = campaigns.length > 0 ? campaigns.reduce((prev, current) => 
    (prev.totalClicks > current.totalClicks) ? prev : current
  ) : null;

  // Calculate top admin
  let topAdminStats = { name: 'Belum ada data', clicks: 0 };
  campaigns.forEach(c => {
    c.adminStats?.forEach(stat => {
      if (stat.clicks > topAdminStats.clicks) {
        topAdminStats = { name: stat.name, clicks: stat.clicks };
      }
    });
  });

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[#107962] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between text-white relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
           {/* Abstract decorative element */}
           <svg width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#ffffff" d="M45.7,-76.1C58.9,-69.3,69.1,-55.3,77.5,-41.1C85.9,-26.9,92.5,-12.4,91.8,1.7C91.1,15.8,83.1,29.5,73.5,41.4C63.9,53.3,52.8,63.4,40.1,70.9C27.4,78.4,13.7,83.3,0.1,83.1C-13.5,82.9,-27,77.6,-39.8,70.3C-52.6,63,-64.7,53.7,-73.4,41.8C-82.1,29.9,-87.4,15.5,-87.9,0.9C-88.4,-13.7,-84.1,-28.5,-75.6,-40.7C-67.1,-52.9,-54.4,-62.5,-41,-69.1C-27.6,-75.7,-13.8,-79.3,1,-80.9C15.8,-82.5,32.5,-82.9,45.7,-76.1Z" transform="translate(100 100)" />
           </svg>
        </div>
        
        <div className="relative z-10 space-y-1.5 mb-5 md:mb-0">
          <p className="text-[#86ebd3] text-[11px] font-bold tracking-widest uppercase">Uniflow Dashboard</p>
          <h1 className="text-3xl font-extrabold tracking-tight">{greeting}, {user?.displayName || 'User'}</h1>
          <p className="text-emerald-50/90 text-sm font-medium">Pusat kontrol WA Rotator, Bio Link, dan penjualan Anda.</p>
        </div>
        <div className="relative z-10 flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => setActiveItem?.('campaign')}
            className="flex-1 md:flex-none bg-[#1ca886] hover:bg-[#20b893] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow border border-[#23c29b] transition-all flex items-center justify-center gap-2"
          >
            <span>+ Link WA Baru</span>
          </button>
          <button 
            onClick={() => setActiveItem?.('billing')}
            className="flex-1 md:flex-none bg-white text-[#107962] hover:bg-gray-50 px-5 py-2.5 rounded-xl font-bold text-sm shadow transition-all"
          >
            Upgrade
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-[#f5f3ff] text-[#8b5cf6] flex items-center justify-center flex-shrink-0">
            <GitMerge size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Campaign</p>
            <p className="text-2xl font-black text-gray-800 leading-none mb-1">{totalCampaigns}</p>
            <p className="text-[11px] text-gray-500 font-medium">Campaign aktif</p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-[#ecfdf5] text-[#10b981] flex items-center justify-center flex-shrink-0">
            <Users size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Admin Aktif</p>
            <p className="text-2xl font-black text-gray-800 leading-none mb-1">{activeAdmins}</p>
            <p className="text-[11px] text-gray-500 font-medium">Siap menerima lead</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-[#fff7ed] text-[#f97316] flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Klik Valid</p>
            <p className="text-2xl font-black text-gray-800 leading-none mb-1">{validClicks}</p>
            <p className="text-[11px] text-gray-500 font-medium">{validClicks > 0 ? '100%' : '0%'} tersambung ke WhatsApp</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aksi Cepat */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="text-[#a855f7]">
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800">Aksi Cepat</h2>
          </div>
          <p className="text-[13px] text-gray-500 mb-6 font-medium">Kelola fitur utama tanpa berpindah jauh.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
            {[
              { icon: GitMerge, label: 'Tambah Link WA', sub: 'Atur rotasi traffic', color: 'text-[#059669]', bg: 'bg-[#d1fae5]', hoverBorder: 'hover:border-[#34d399]', id: 'campaign' },
              { icon: UserCog, label: 'Kelola Admin Rotator', sub: 'Tim penerima lead', color: 'text-[#2563eb]', bg: 'bg-[#dbeafe]', hoverBorder: 'hover:border-[#60a5fa]', id: 'admin' },
              { icon: BarChart2, label: 'Buka Analytics', sub: 'Lihat performa', color: 'text-[#9333ea]', bg: 'bg-[#f3e8ff]', hoverBorder: 'hover:border-[#c084fc]', id: 'analytics' },
              { icon: LinkIcon, label: 'Bio Link', sub: 'Profil publik Anda', color: 'text-[#ec4899]', bg: 'bg-[#fce7f3]', hoverBorder: 'hover:border-[#f472b6]', id: 'biolink' },
              { icon: ShoppingBag, label: 'Store', sub: 'Produk digital & fisik', color: 'text-[#ea580c]', bg: 'bg-[#ffedd5]', hoverBorder: 'hover:border-[#fb923c]', id: 'store' },
              { icon: MessageCircle, label: 'WA.me Builder', sub: 'Buat link WhatsApp', color: 'text-[#0284c7]', bg: 'bg-[#e0f2fe]', hoverBorder: 'hover:border-[#38bdf8]', id: 'wabuilder' },
            ].map((action, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveItem?.(action.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 ${action.hoverBorder} hover:shadow-sm bg-white hover:bg-gray-50/50 transition-all group text-center h-full min-h-[120px]`}
              >
                <div className={`w-11 h-11 rounded-[14px] ${action.bg} ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon size={22} strokeWidth={2.5} />
                </div>
                <span className="text-[13px] font-bold text-gray-800 mb-1">{action.label}</span>
                <span className="text-[10px] text-gray-500 font-medium">{action.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Insight Akun */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <p className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-widest mb-1.5">Insight Akun</p>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Free Trial</h2>
          <p className="text-[13px] text-gray-500 mb-6 font-medium">0 hari masa aktif tersisa</p>

          <div className="space-y-1 mb-6 flex-1">
            <div className="flex justify-between items-center py-3.5 border-b border-gray-100">
              <span className="text-[13px] font-semibold text-gray-600">Link WA teratas</span>
              <span className="text-[13px] font-bold text-gray-800 truncate max-w-[150px]">{topCampaign ? topCampaign.name : 'Belum ada data'}</span>
            </div>
            <div className="flex justify-between items-center py-3.5 border-b border-gray-100">
              <span className="text-[13px] font-semibold text-gray-600">Admin teratas</span>
              <span className="text-[13px] font-bold text-gray-800 truncate max-w-[150px]">{topAdminStats.clicks > 0 ? topAdminStats.name : 'Belum ada data'}</span>
            </div>
            <div className="flex justify-between items-center py-3.5 border-gray-100">
              <span className="text-[13px] font-semibold text-gray-600">Device utama</span>
              <span className="text-[13px] font-bold text-gray-800">Mobile (Auto)</span>
            </div>
          </div>

          <button 
            onClick={() => setActiveItem?.('analytics')}
            className="w-full py-3 rounded-xl border border-[#148e73] text-[#148e73] font-bold text-[13px] hover:bg-[#f0fdf4] transition-colors bg-[#f0fdf4]/50 shadow-sm"
          >
            Lihat laporan lengkap
          </button>
        </div>
      </div>
      
      {/* Bottom Footer Area */}
      <div className="bg-[#0b6350] rounded-xl px-5 py-4 flex flex-col sm:flex-row justify-between items-center text-white text-[13px] font-medium shadow-sm">
        <span className="opacity-90">Traffic tervalidasi: <span className="font-bold text-white">{validClicks} klik</span> • <span className="font-bold text-white">{totalLeads} lead</span></span>
        <button className="font-bold flex items-center gap-1.5 hover:text-[#a7f3d0] transition-colors mt-2 sm:mt-0">
          Butuh bantuan? Hubungi Support <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </div>

      <div className="text-center text-[11px] font-medium text-gray-400 py-2">
        Copyright © 2026 PT. LIFIE KARYA NUSANTARA. Seluruh hak cipta dilindungi.
      </div>
    </div>
  );
}
