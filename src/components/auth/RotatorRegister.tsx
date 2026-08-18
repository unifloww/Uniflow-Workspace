import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { initFirebase } from '../../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

interface Props {
  onSwitch: (view: 'wa-login' | 'wa-register' | 'linkfit-login' | 'linkfit-register') => void;
}

export default function RotatorRegister({ onSwitch }: Props) {
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
    <div className="bg-white rounded-[2rem] p-8 md:p-12 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-gray-900 rounded-lg p-2">
          <img src="https://dash.uniflow.my.id/uniflow-logo-light.png" alt="Uniflow" className="h-5 object-contain" />
        </div>
        <span className="font-bold text-lg border-l border-gray-300 pl-3 text-gray-800">WA Rotator</span>
      </div>
      <h2 className="text-3xl font-black text-gray-900 mb-2">Mulai gratis 7 hari</h2>
      <p className="text-sm text-gray-500 mb-8 font-medium leading-relaxed">Satu email dan nomor WhatsApp hanya dapat digunakan untuk satu akun.</p>
      
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium">{error}</div>}

      <form className="space-y-4" onSubmit={handleAuth}>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Nama lengkap</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-gray-50 focus:bg-white transition-all" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-gray-50 focus:bg-white transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Nomor WhatsApp</label>
            <div className="flex">
              <div className="px-3 py-3.5 bg-gray-50 border border-gray-200 border-r-0 rounded-l-xl text-sm font-bold text-gray-600">+62</div>
              <input type="tel" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full px-4 py-3.5 rounded-r-xl border border-gray-200 text-sm font-medium outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-gray-50 focus:bg-white transition-all" />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 8 karakter" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-gray-50 focus:bg-white transition-all pr-10" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Kode referal <span className="text-gray-400 font-normal">(opsional)</span></label>
          <input type="text" placeholder="CONTOH: WR8F3K9Q2M" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-gray-50 focus:bg-white transition-all uppercase placeholder:normal-case" />
        </div>
        
        <button type="submit" disabled={isLoading} className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-3.5 rounded-xl font-bold text-[15px] transition-all mt-4 disabled:opacity-70">
          {isLoading ? 'Memproses...' : 'Buat akun'}
        </button>
      </form>
      
      <p className="text-center text-sm font-medium text-gray-500 mt-6">
        Sudah punya akun? <button onClick={() => onSwitch('wa-login')} className="text-[#10b981] font-bold hover:underline">Login</button>
      </p>
    </div>
  );
}
