import React, { useState } from 'react';
import { Eye, EyeOff, MessageCircle, Link as LinkIcon } from 'lucide-react';
import { initFirebase } from '../../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

interface Props {
  onSwitch: (view: 'wa-login' | 'wa-register' | 'linkfit-login' | 'linkfit-register') => void;
}

export default function RotatorLogin({ onSwitch }: Props) {
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
    <div className="flex w-full max-w-[1050px] bg-white rounded-[2rem] overflow-hidden shadow-2xl min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="hidden md:flex flex-col w-[45%] bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#1e3a8a] p-10 text-white relative overflow-hidden">
        <div className="flex items-center gap-3 mb-12 relative z-10">
          <img src="https://dash.uniflow.my.id/uniflow-logo-light.png" alt="Uniflow" className="h-6 object-contain" />
          <span className="font-bold text-lg border-l border-white/30 pl-3">WA Rotator</span>
        </div>
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <p className="text-emerald-300 font-extrabold text-[10px] tracking-widest uppercase mb-3">Platform Distribusi Lead WhatsApp</p>
          <h1 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight">Ubah klik jadi peluang closing.</h1>
          <p className="text-emerald-50/80 text-sm leading-relaxed mb-8 font-medium">Bagikan lead otomatis, lindungi traffic, dan pantau performa dari satu dashboard.</p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">Simulasi Live Traffic</p>
              <span className="bg-emerald-500/30 text-emerald-100 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Online</span>
            </div>
            <p className="font-bold text-sm mb-4">Lead masuk dan dibagi otomatis</p>
            <div className="space-y-2 mb-4">
              <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg"><MessageCircle size={14} className="text-emerald-300" /></div>
                  <div><p className="text-xs font-bold">Instagram Ads</p><p className="text-[10px] text-emerald-200">Nia Admin - Palembang</p></div>
                </div>
                <span className="text-xs font-black text-emerald-300">+24%</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg"><LinkIcon size={14} className="text-blue-300" /></div>
                  <div><p className="text-xs font-bold">Bio Link</p><p className="text-[10px] text-emerald-200">Fito Admin - Jakarta</p></div>
                </div>
                <span className="text-xs font-black text-blue-300">+18%</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/10 rounded-xl p-2.5 text-center"><p className="text-lg font-black">312</p><p className="text-[9px] font-bold text-emerald-200 uppercase tracking-widest mt-0.5">Klik</p></div>
              <div className="bg-white/10 rounded-xl p-2.5 text-center"><p className="text-lg font-black">74</p><p className="text-[9px] font-bold text-emerald-200 uppercase tracking-widest mt-0.5">Lead</p></div>
              <div className="bg-white/10 rounded-xl p-2.5 text-center"><p className="text-lg font-black">96%</p><p className="text-[9px] font-bold text-emerald-200 uppercase tracking-widest mt-0.5">Valid</p></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full md:w-[55%] p-8 md:p-12 lg:p-16 flex flex-col justify-center">
         <div className="flex md:hidden items-center gap-3 mb-8">
           <div className="bg-gray-900 rounded-lg p-2">
             <img src="https://dash.uniflow.my.id/uniflow-logo-light.png" alt="Uniflow" className="h-5 object-contain" />
           </div>
           <span className="font-bold text-lg border-l border-gray-300 pl-3 text-gray-800">WA Rotator</span>
         </div>
         <div className="flex items-center justify-between mb-2">
           <p className="text-[10px] font-bold uppercase tracking-widest text-[#10b981]">Selamat Datang</p>
           <span className="hidden md:inline-flex bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold">Secure Login</span>
         </div>
         <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-2 tracking-tight">Masuk ke WA ROTATOR</h2>
         <p className="text-sm font-medium text-gray-500 mb-8">Kelola campaign, lead, admin, tracking, dan link WhatsApp.</p>
         
         {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium">{error}</div>}

         <form className="space-y-4 mb-6" onSubmit={handleAuth}>
           <div>
             <label className="block text-xs font-bold text-gray-700 mb-1.5">Email</label>
             <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="nama@email.com" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-gray-50 focus:bg-white transition-all" />
           </div>
           <div>
             <label className="block text-xs font-bold text-gray-700 mb-1.5">Password</label>
             <div className="relative">
               <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Minimal 8 karakter" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-gray-50 focus:bg-white transition-all pr-10" />
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
           <button type="submit" disabled={isLoading} className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-3.5 rounded-xl font-bold text-[15px] transition-all mt-4 disabled:opacity-70">
             {isLoading ? 'Memproses...' : 'Masuk Dashboard'}
           </button>
         </form>
         
         <div className="relative flex items-center justify-center my-6">
           <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
           <span className="relative bg-white px-4 text-xs font-bold text-gray-400">ATAU</span>
         </div>
         
         <button type="button" onClick={handleGoogleLogin} className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3 mb-8">
           <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
           Lanjutkan dengan Google
         </button>
         
         <p className="text-center text-sm font-medium text-gray-500">
           Belum punya akun? <button onClick={() => onSwitch('wa-register')} className="text-[#10b981] font-bold hover:underline">Daftar gratis</button>
         </p>
      </div>
    </div>
  );
}
