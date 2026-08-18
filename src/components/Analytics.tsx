import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  AreaChart, Area, Cell 
} from 'recharts';
import { 
  BarChart2, 
  MapPin, 
  Smartphone, 
  Clock, 
  Calendar,
  Filter,
  Users,
  Target,
  ChevronDown
} from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 text-sm z-50">
        <p className="font-bold text-gray-800">{label}</p>
        <p className="text-emerald-500 font-semibold">{payload[0].value} klik</p>
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { campaigns, admins, leads } = useAppContext();
  const [dateFilter, setDateFilter] = useState('7hari');

  // Aggregate Data
  const { 
    dailyData, 
    deviceData, 
    locationData, 
    hourlyData,
    totalRequest,
    totalTerhubung,
    totalTidakValid
  } = useMemo(() => {
    const daily: Record<string, number> = {};
    const device: Record<string, number> = {};
    const location: Record<string, number> = {};
    const hourly: Record<string, number> = {};
    
    let tReq = 0;
    let tTerhubung = 0;
    let tTidakValid = 0;

    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      daily[d] = 0;
    }

    campaigns.forEach(c => {
      tReq += (c.totalClicks || 0);
      tTerhubung += (c.periodClicks || 0);
      
      c.adminStats?.forEach(astat => {
        tTidakValid += (astat.invalid || 0);
      });

      if (c.dailyClicks) {
        Object.entries(c.dailyClicks).forEach(([date, count]) => {
          if (daily[date] !== undefined) {
             daily[date] += (count as number);
          }
        });
      }
      if (c.deviceStats) {
        Object.entries(c.deviceStats).forEach(([dev, count]) => {
          device[dev] = (device[dev] || 0) + (count as number);
        });
      }
      if (c.locationStats) {
        Object.entries(c.locationStats).forEach(([loc, count]) => {
          location[loc] = (location[loc] || 0) + (count as number);
        });
      }
      if (c.hourlyStats) {
        Object.entries(c.hourlyStats).forEach(([hour, count]) => {
          hourly[hour] = (hourly[hour] || 0) + (count as number);
        });
      }
    });

    const dailyFormatted = Object.entries(daily)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, clicks]) => ({ 
        name: format(parseISO(date), 'dd MMM', { locale: localeId }), 
        clicks 
      }));

    const deviceFormatted = Object.entries(device)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
      
    const locationFormatted = Object.entries(location)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) 
      .map(([name, value]) => ({ name, value }));

    const hourlyFormatted = Object.entries(hourly)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, value]) => ({ name, value }));

    return { 
      dailyData: dailyFormatted, 
      deviceData: deviceFormatted, 
      locationData: locationFormatted, 
      hourlyData: hourlyFormatted,
      totalRequest: tReq,
      totalTerhubung: tTerhubung,
      totalTidakValid: tTidakValid
    };
  }, [campaigns]);

  const activeCampaigns = campaigns.filter(c => c.isActive).length;
  const activeAdminsCount = admins.filter(a => a.isActive).length;
  const totalLeads = leads.length;

  const highestDay = [...dailyData].sort((a, b) => b.clicks - a.clicks)[0];
  const avgClicks = dailyData.length > 0 ? Math.round(dailyData.reduce((acc, curr) => acc + curr.clicks, 0) / dailyData.length) : 0;
  
  // Custom Bar Shape for Recharts
  const CustomBar = (props: any) => {
    const { fill, x, y, width, height } = props;
    const radius = width / 2;
    if (height <= 0) return null;
    return (
      <g>
        <defs>
          <linearGradient id={`gradient-${x}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        <rect x={x} y={y} width={width} height={height} fill={`url(#gradient-${x})`} rx={radius} ry={radius} />
      </g>
    );
  };

  // Helper to render horizontal progress bars
  const renderProgressBarList = (data: {name: string, value: number}[], colorClass: string) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
      <div className="space-y-4">
        {data.length > 0 ? data.map((item, idx) => {
          const percentage = (item.value / max) * 100;
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-gray-800">
                <span>{item.name}</span>
                <span className="text-gray-500">{item.value} klik</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${colorClass} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
          );
        }) : (
          <p className="text-sm text-gray-400 text-center py-4">Belum ada data</p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-4 pb-12 text-[#1e293b]">
      
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100/50 flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-r from-emerald-50/50 to-cyan-50/30">
        <div>
          <p className="text-emerald-600 text-[10px] font-extrabold tracking-widest uppercase mb-1">ANALYTICS ROTATOR</p>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Ringkasan Performa Anda</h1>
          <p className="text-gray-500 text-xs font-medium">Pantau klik valid, koneksi WhatsApp, campaign, dan kualitas traffic.</p>
        </div>
      </div>

      {/* Top Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Dark Card */}
        <div className="lg:col-span-5 bg-[#1e293b] rounded-2xl p-6 text-white flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          
          <div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-extrabold tracking-wider uppercase mb-3">
              <BarChart2 size={12} strokeWidth={3} /> Campaign Analytics Lab
            </div>
            <h2 className="text-3xl font-black leading-tight tracking-tight mb-3 pr-8 text-white">
              Monitor klik harian, campaign, dan performa admin.
            </h2>
            <p className="text-slate-400 text-xs font-medium mb-6 leading-relaxed">
              Data dari Campaign Rotator sekarang dikumpulkan di sini: filter harian, tren 30 hari, campaign aktif, dan admin penerima lead dalam zona waktu Asia/Jakarta.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl flex-1 flex items-center px-4 py-2.5">
              <input type="text" value="mm/dd/yyyy" readOnly className="bg-transparent border-none outline-none text-gray-800 text-sm font-semibold w-full cursor-pointer" />
              <Calendar size={16} className="text-gray-400" />
            </div>
            <button className="bg-cyan-400 hover:bg-cyan-500 text-cyan-950 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-1.5 transition-colors">
              <Filter size={14} /> Terapkan
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors">
              Reset
            </button>
          </div>
        </div>

        {/* Right Top Cards 2x2 */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <p className="text-xs font-extrabold text-gray-600">Klik 30 hari terakhir</p>
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                <BarChart2 size={16} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900 mb-1">{totalTerhubung}</p>
              <p className="text-[10px] font-bold text-gray-400">Tersambung ke WhatsApp</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <p className="text-xs font-extrabold text-gray-600">Campaign aktif</p>
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <Target size={16} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900 mb-1">{activeCampaigns}</p>
              <p className="text-[10px] font-bold text-gray-400">{campaigns.length} total campaign</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <p className="text-xs font-extrabold text-gray-600">Admin tersedia</p>
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
                <Users size={16} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900 mb-1">{activeAdminsCount}</p>
              <p className="text-[10px] font-bold text-gray-400">Penerima lead aktif/nonaktif</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <p className="text-xs font-extrabold text-gray-600">Mode periode</p>
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                <Calendar size={16} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900 mb-1">30 hari</p>
              <p className="text-[10px] font-bold text-gray-400">Waktu Asia/Jakarta</p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Bar Chart & Summary */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 size={16} className="text-gray-400" />
              <h3 className="text-sm font-extrabold text-gray-800">Tren klik tersambung</h3>
            </div>
            <p className="text-[11px] font-medium text-gray-500">Ringkasan data 7 hari terakhir.</p>
          </div>
          <button className="text-[11px] font-extrabold text-emerald-600 border border-emerald-200 bg-emerald-50 px-4 py-1.5 rounded-full hover:bg-emerald-100 transition-colors">
            Lihat hari ini
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 h-[200px]">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }} barSize={36} barGap={8}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="clicks" shape={<CustomBar />} >
                     {/* Values on top of bars */}
                     {
                       dailyData.map((entry, index) => (
                         <Cell key={`cell-${index}`} />
                       ))
                     }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-sm font-medium text-gray-400">Belum ada data</div>
            )}
          </div>
          
          <div className="lg:w-64 border border-gray-100 rounded-2xl p-5 flex flex-col justify-center">
            <p className="text-[10px] font-extrabold text-purple-600 tracking-widest uppercase mb-2">Ringkasan Periode</p>
            <p className="text-3xl font-black text-gray-900 mb-1">{totalTerhubung} <span className="text-base font-bold text-gray-600">klik</span></p>
            <p className="text-[10px] font-bold text-gray-400 mb-6">Total tersambung WhatsApp</p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-500">Hari tertinggi</span>
                <span className="font-black text-gray-800 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">{highestDay?.name || '-'}</span>
              </div>
              <div className="w-full h-px bg-gray-100"></div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-500">Rata-rata</span>
                <span className="font-black text-cyan-600">{avgClicks}/hari</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Intelligence Banner */}
      <div className="bg-[#1e293b] rounded-2xl p-6 text-white shadow-md flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-emerald-400 text-[10px] font-extrabold tracking-wider uppercase mb-1">Traffic Intelligence</p>
          <h2 className="text-xl font-black mb-1">Data yang menjelaskan perilaku calon customer.</h2>
          <p className="text-slate-400 text-xs font-medium">Temukan waktu terbaik, lokasi terbanyak, device utama, dan titik kehilangan traffic untuk mengoptimalkan distribusi admin.</p>
        </div>
        <div className="relative z-10 w-20 h-20 rounded-full border-4 border-emerald-400/30 flex items-center justify-center flex-shrink-0 bg-[#0f172a]">
           <div className="text-center">
             <p className="text-lg font-black leading-none">100%</p>
             <p className="text-[7px] font-bold text-emerald-400 uppercase tracking-widest mt-1">WA Connect</p>
           </div>
        </div>
        <div className="absolute top-0 right-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/4">
          <label className="block text-[10px] font-extrabold text-gray-600 mb-1.5 uppercase">Filter periode</label>
          <div className="relative">
            <select className="w-full appearance-none bg-white border border-gray-200 text-gray-800 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500">
              <option>7 Hari terakhir</option>
              <option>30 Hari terakhir</option>
            </select>
            <ChevronDown size={16} className="absolute right-4 top-3 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="w-full md:w-1/4">
          <label className="block text-[10px] font-extrabold text-gray-600 mb-1.5 uppercase">Dari tanggal</label>
          <div className="relative">
            <input type="text" value="mm/dd/yyyy" readOnly className="w-full bg-white border border-gray-200 text-gray-800 text-sm font-bold rounded-xl px-4 py-2.5 outline-none" />
            <Calendar size={16} className="absolute right-4 top-3 text-gray-400" />
          </div>
        </div>
        <div className="w-full md:w-1/4">
          <label className="block text-[10px] font-extrabold text-gray-600 mb-1.5 uppercase">Sampai tanggal</label>
          <div className="relative">
             <input type="text" value="mm/dd/yyyy" readOnly className="w-full bg-white border border-gray-200 text-gray-800 text-sm font-bold rounded-xl px-4 py-2.5 outline-none" />
             <Calendar size={16} className="absolute right-4 top-3 text-gray-400" />
          </div>
        </div>
        <button className="w-full md:w-auto bg-[#10b981] hover:bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
          Terapkan Filter
        </button>
      </div>

      {/* 4 Colored Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-blue-500 to-cyan-400 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
          <div className="mb-6"><Target size={20} className="text-white/80" /></div>
          <p className="text-[11px] font-extrabold tracking-wider uppercase mb-1">Total Request</p>
          <p className="text-4xl font-black mb-1">{totalRequest}</p>
          <p className="text-[10px] font-bold text-white/80">Semua traffic</p>
        </div>
        <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-emerald-500 to-teal-400 shadow-sm relative overflow-hidden group">
           <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
          <div className="mb-6"><BarChart2 size={20} className="text-white/80" /></div>
          <p className="text-[11px] font-extrabold tracking-wider uppercase mb-1">Terhubung WhatsApp</p>
          <p className="text-4xl font-black mb-1">{totalTerhubung}</p>
          <p className="text-[10px] font-bold text-white/80">100% dari total request</p>
        </div>
        <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-rose-500 to-pink-500 shadow-sm relative overflow-hidden group">
           <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
          <div className="mb-6"><Target size={20} className="text-white/80" /></div>
          <p className="text-[11px] font-extrabold tracking-wider uppercase mb-1">Tidak Valid</p>
          <p className="text-4xl font-black mb-1">{totalTidakValid}</p>
          <p className="text-[10px] font-bold text-white/80">Bot/klik berulang</p>
        </div>
        <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-purple-500 to-fuchsia-400 shadow-sm relative overflow-hidden group">
           <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
          <div className="mb-6"><Users size={20} className="text-white/80" /></div>
          <p className="text-[11px] font-extrabold tracking-wider uppercase mb-1">Database Lead</p>
          <p className="text-4xl font-black mb-1">{totalLeads}</p>
          <p className="text-[10px] font-bold text-white/80">Data form tersimpan</p>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] font-extrabold text-blue-600 tracking-widest uppercase mb-1">LIVE PERFORMANCE</p>
            <h3 className="text-lg font-black text-gray-900 mb-1">Grafik Klik 7 Hari</h3>
            <p className="text-[11px] font-medium text-gray-500">Hover atau sentuh titik grafik untuk melihat detail. Seluruh waktu menggunakan Asia/Jakarta.</p>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Zona waktu WIB</span>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex-1 border border-gray-100 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
              <span className="text-[10px] font-extrabold text-gray-500 uppercase">Terhubung WhatsApp</span>
            </div>
            <p className="text-xl font-black text-gray-900">{totalTerhubung}</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex-1 border border-gray-100 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#ef4444]"></div>
              <span className="text-[10px] font-extrabold text-gray-500 uppercase">Tidak valid</span>
            </div>
            <p className="text-xl font-black text-gray-900">{totalTidakValid}</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex-1 border border-gray-100 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#6366f1]"></div>
              <span className="text-[10px] font-extrabold text-gray-500 uppercase">Puncak traffic</span>
            </div>
            <p className="text-xl font-black text-gray-900">{highestDay?.name || '-'}</p>
          </div>
        </div>

        <div className="h-[250px] w-full">
           {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
              </AreaChart>
            </ResponsiveContainer>
           ) : (
             <div className="h-full flex items-center justify-center text-sm font-medium text-gray-400">Belum ada data grafik</div>
           )}
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-1.5">
             <div className="w-3 h-3 rounded bg-[#10b981]"></div>
             <span className="text-[10px] font-bold text-gray-500">Terhubung WhatsApp</span>
          </div>
          <div className="flex items-center gap-1.5">
             <div className="w-3 h-3 rounded bg-[#ef4444]"></div>
             <span className="text-[10px] font-bold text-gray-500">Tidak valid</span>
          </div>
        </div>
      </div>

      {/* Bottom Lists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lokasi */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <MapPin size={16} className="text-emerald-500" />
            <h3 className="text-sm font-extrabold text-gray-800">Lokasi Klik</h3>
          </div>
          {renderProgressBarList(locationData, 'bg-blue-500')}
        </div>
        
        {/* Perangkat */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <Smartphone size={16} className="text-emerald-500" />
            <h3 className="text-sm font-extrabold text-gray-800">Perangkat</h3>
          </div>
          {renderProgressBarList(deviceData, 'bg-emerald-400')}
        </div>
        
        {/* Jam */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={16} className="text-emerald-500" />
            <h3 className="text-sm font-extrabold text-gray-800">Jam Paling Aktif</h3>
          </div>
          {renderProgressBarList(hourlyData, 'bg-indigo-500')}
        </div>
      </div>

      {/* Data Table (Leads as recent activities) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
           <h3 className="text-sm font-extrabold text-gray-800">Riwayat Lead / Form</h3>
           <span className="text-[11px] font-bold text-gray-500">Menampilkan {leads.length} data terakhir</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-500 uppercase tracking-wider border-b border-gray-100">Waktu (WIB)</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-500 uppercase tracking-wider border-b border-gray-100">Campaign</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-500 uppercase tracking-wider border-b border-gray-100">Nama Lengkap</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-500 uppercase tracking-wider border-b border-gray-100">WhatsApp</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-500 uppercase tracking-wider border-b border-gray-100">Status/Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.length > 0 ? leads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-[11px] font-bold text-gray-800">{new Date(lead.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})} WIB</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[11px] font-bold text-gray-800">{lead.campaign}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[11px] font-bold text-gray-800">{lead.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[11px] font-bold text-gray-800">{lead.whatsapp}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[11px] font-bold text-emerald-600 mb-0.5">Database Lead Masuk</p>
                    <p className="text-[9px] font-medium text-gray-400">Pengguna telah mengisi form</p>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm font-medium text-gray-400">Belum ada riwayat form/lead masuk.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
