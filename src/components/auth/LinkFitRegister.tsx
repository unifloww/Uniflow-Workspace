import React, { useState } from 'react';
import { Eye, EyeOff, Link as LinkIcon, CheckCircle2, ShoppingBag, MessageCircle } from 'lucide-react';
import { initFirebase } from '../../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

interface Props {
  onSwitch: (view: 'wa-login' | 'wa-register' | 'linkfit-login' | 'linkfit-register') => void;
}

export default function LinkFitRegister({ onSwitch }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { auth } = await initFirebase();
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-[1050px] bg-white rounded-[2rem] overflow-hidden shadow-2xl min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500 border border-gray-100">
       <div className="hidden md:flex flex-col w-[40%] bg-[#081a1b] p-12 text-white relative">
        <div className="flex items-center gap-3 mb-12 relative z-10">
          <img src="https://dash.uniflow.my.id/uniflow-logo-light.png" alt="Uniflow" className="h-6 object-contain" />
          <span className="font-bold text-lg border-l border-white/30 pl-3 text-white">LinkFit</span>
        </div>
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#10b981]/20 border border-[#10b981]/30 text-[#10b981] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 w-fit">
             Mulai jualan dari satu link
          </div>
          <h1 className="text-4xl font-extrabold mb-4 leading-[1.1] tracking-tight">Buat Bio Link profesional dalam beberapa menit.</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-10 font-medium">Daftar gratis, atur profil bisnis, tambahkan WhatsApp, sosial media, produk digital, dan bagikan URL LinkFit ke semua calon pembeli.</p>
          
          <div className="space-y-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3"><LinkIcon size={16} className="text-gray-300" /><p className="font-bold text-sm text-gray-100">Profil Bio Link siap share</p></div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3"><ShoppingBag size={16} className="text-gray-300" /><p className="font-bold text-sm text-gray-100">Produk digital + checkout</p></div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3"><MessageCircle size={16} className="text-gray-300" /><p className="font-bold text-sm text-gray-100">Tombol WhatsApp dan sosial media</p></div>
          </div>
        </div>
      </div>
      
      <div className="w-full md:w-[60%] p-8 md:p-12 lg:p-14 flex flex-col justify-center bg-[#fdfdfd]">
        <div className="flex md:hidden items-center gap-3 mb-8">
           <div className="bg-[#081a1b] rounded-lg p-2">
             <img src="https://dash.uniflow.my.id/uniflow-logo-light.png" alt="Uniflow" className="h-5 object-contain" />
           </div>
           <span className="font-bold text-lg border-l border-gray-300 pl-3 text-gray-800">LinkFit</span>
         </div>
         
         <p className="text-[10px] font-bold uppercase tracking-widest text-[#10b981] mb-2">Daftar LinkFit</p>
         <h2 className="text-3xl lg:text-4xl font-black text-[#081a1b] mb-2 tracking-tight">Mulai gratis dan langsung buat Bio Link.</h2>
         <p className="text-sm font-medium text-gray-500 mb-8">Satu email dan nomor WhatsApp hanya dapat digunakan untuk satu akun.</p>
         
         {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium">{error}</div>}

         <form className="space-y-4 mb-8" onSubmit={handleAuth}>
           <div>
             <label className="block text-xs font-bold text-gray-700 mb-1.5">Nama lengkap</label>
             <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-white transition-all" />
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-bold text-gray-700 mb-1.5">Email</label>
               <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-[#f2fbf8] transition-all" />
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-700 mb-1.5">Nomor WhatsApp</label>
               <div className="flex">
                 <div className="px-3 py-3.5 bg-white border border-gray-200 border-r-0 rounded-l-xl text-sm font-bold text-gray-600">+62</div>
                 <input type="tel" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full px-4 py-3.5 rounded-r-xl border border-gray-200 text-sm font-medium outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-white transition-all" />
               </div>
             </div>
           </div>
           <div>
             <label className="block text-xs font-bold text-gray-700 mb-1.5">Password</label>
             <div className="relative">
               <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 8 karakter" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-[#f2fbf8] transition-all pr-10" />
               <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
               </button>
             </div>
           </div>
           <div>
             <label className="block text-xs font-bold text-gray-700 mb-1.5">Kode referal <span className="text-gray-400 font-normal">(opsional)</span></label>
             <input type="text" placeholder="CONTOH: WR8F3K9Q2M" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-white transition-all uppercase placeholder:normal-case" />
           </div>
           
           <button type="submit" disabled={isLoading} className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-3.5 rounded-xl font-bold text-[15px] transition-all mt-4 flex items-center justify-center gap-2 shadow-sm shadow-[#10b981]/20 disabled:opacity-70">
             {isLoading ? 'Memproses...' : 'Buat akun LinkFit'} <LinkIcon size={16} />
           </button>
         </form>
         
         <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="border border-gray-100 rounded-xl p-3 flex gap-2"><CheckCircle2 size={16} className="text-[#10b981]" /><p className="text-xs font-bold text-gray-600">Bio Link gratis</p></div>
            <div className="border border-gray-100 rounded-xl p-3 flex gap-2"><CheckCircle2 size={16} className="text-[#10b981]" /><p className="text-xs font-bold text-gray-600">Dashboard tetap sama</p></div>
            <div className="border border-gray-100 rounded-xl p-3 flex gap-2"><CheckCircle2 size={16} className="text-[#10b981]" /><p className="text-xs font-bold text-gray-600">Bisa upgrade premium</p></div>
            <div className="border border-gray-100 rounded-xl p-3 flex gap-2"><CheckCircle2 size={16} className="text-[#10b981]" /><p className="text-xs font-bold text-gray-600">Siap untuk produk digital</p></div>
         </div>
         
         <p className="text-center text-sm font-medium text-gray-500">
           Sudah punya akun? <button onClick={() => onSwitch('linkfit-login')} className="text-[#10b981] font-bold hover:underline">Login LinkFit</button>
         </p>
      </div>
    </div>
  );
}
