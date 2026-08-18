import React, { useState } from 'react';
import { Eye, EyeOff, Link as LinkIcon, CheckCircle2, PieChart, Lock, ShoppingBag } from 'lucide-react';
import { initFirebase } from '../../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

interface Props {
  onSwitch: (view: 'wa-login' | 'wa-register' | 'linkfit-login' | 'linkfit-register') => void;
}

export default function LinkFitLogin({ onSwitch }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { auth } = await initFirebase();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || 'Gagal login. Periksa kembali email dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { auth } = await initFirebase();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message || 'Gagal login dengan Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-[1050px] bg-white rounded-[2rem] overflow-hidden shadow-2xl min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500 border border-gray-100">
      <div className="hidden md:flex flex-col w-[45%] bg-[#081a1b] p-12 text-white relative">
        <div className="flex items-center gap-3 mb-12 relative z-10">
          <img src="https://dash.uniflow.my.id/uniflow-logo-light.png" alt="Uniflow" className="h-6 object-contain" />
          <span className="font-bold text-lg border-l border-white/30 pl-3 text-white">LinkFit</span>
        </div>
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#10b981]/20 border border-[#10b981]/30 text-[#10b981] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 w-fit">
            <LinkIcon size={12} /> One Link, More Sales
          </div>
          <h1 className="text-4xl font-extrabold mb-4 leading-[1.1] tracking-tight">Selamat datang kembali di pusat bisnis digital Anda.</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-10 font-medium">Kelola Bio Link, produk digital dan fisik, Payment LinkFit, checkout, pesanan, saldo, serta analytics dari satu dashboard.</p>
          
          <div className="grid grid-cols-2 gap-3 mb-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4"><LinkIcon size={18} className="text-[#10b981] mb-2" /><p className="font-bold text-xs text-gray-200">Bio Link profesional</p></div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4"><ShoppingBag size={18} className="text-[#10b981] mb-2" /><p className="font-bold text-xs text-gray-200">Produk digital & fisik</p></div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4"><Lock size={18} className="text-[#10b981] mb-2" /><p className="font-bold text-xs text-gray-200">Midtrans & QRIS</p></div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4"><PieChart size={18} className="text-[#10b981] mb-2" /><p className="font-bold text-xs text-gray-200">Analytics bisnis</p></div>
          </div>
          
          <div className="bg-gradient-to-r from-[#10b981]/20 to-transparent p-5 rounded-2xl border-l-2 border-[#10b981]">
            <p className="font-bold text-sm text-white mb-1">Siap lanjut dari linkfit.my.id</p>
            <p className="text-xs font-medium text-gray-400">Setelah login, Anda tetap masuk ke dashboard utama yang sama.</p>
          </div>
        </div>
      </div>
      
      <div className="w-full md:w-[55%] p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-[#fdfdfd]">
        <div className="flex md:hidden items-center gap-3 mb-8">
           <div className="bg-[#081a1b] rounded-lg p-2">
             <img src="https://dash.uniflow.my.id/uniflow-logo-light.png" alt="Uniflow" className="h-5 object-contain" />
           </div>
           <span className="font-bold text-lg border-l border-gray-300 pl-3 text-gray-800">LinkFit</span>
         </div>
         
         <p className="text-[10px] font-bold uppercase tracking-widest text-[#10b981] mb-2">Selamat Datang di LinkFit</p>
         <h2 className="text-3xl lg:text-4xl font-black text-[#081a1b] mb-2 tracking-tight">Login Bio Link</h2>
         <p className="text-sm font-medium text-gray-500 mb-8">Akses dashboard untuk mengatur Bio Link, produk digital, short link, dan pesanan.</p>
         
         {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium">{error}</div>}

         <form className="space-y-4 mb-6" onSubmit={handleAuth}>
           <div>
             <label className="block text-xs font-bold text-gray-700 mb-1.5">Email</label>
             <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-white transition-all" />
           </div>
           <div>
             <label className="block text-xs font-bold text-gray-700 mb-1.5">Password</label>
             <div className="relative">
               <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 8 karakter" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-white transition-all pr-10" />
               <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
               </button>
             </div>
           </div>
           <div className="flex items-center justify-between pt-1">
             <label className="flex items-center gap-2 cursor-pointer">
               <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#10b981] focus:ring-[#10b981]" />
               <span className="text-xs font-bold text-gray-600">Ingat saya</span>
             </label>
             <button type="button" className="text-xs font-bold text-[#10b981] hover:text-[#059669]">Lupa password?</button>
           </div>
           <button type="submit" disabled={isLoading} className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-3.5 rounded-xl font-bold text-[15px] transition-all mt-4 flex items-center justify-center gap-2 shadow-sm shadow-[#10b981]/20 disabled:opacity-70">
             {isLoading ? 'Memproses...' : 'Masuk ke Dashboard'}
           </button>
         </form>
         
         <button type="button" onClick={handleGoogleLogin} className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3 mb-6">
           <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
           Lanjutkan dengan Google
         </button>
         
         <div className="bg-[#f2fbf8] border border-[#10b981]/20 rounded-2xl p-4 flex gap-3">
           <CheckCircle2 size={20} className="text-[#10b981] flex-shrink-0" />
           <p className="text-xs font-medium text-[#081a1b] leading-relaxed">Tampilan khusus LinkFit. Akun dan data tetap aman di sistem dashboard yang sama.</p>
         </div>
         
         <p className="text-center text-sm font-medium text-gray-500 mt-8">
           Belum punya akun? <button onClick={() => onSwitch('linkfit-register')} className="text-[#10b981] font-bold hover:underline">Daftar LinkFit gratis</button>
         </p>
      </div>
    </div>
  );
}
