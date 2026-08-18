import React, { useState } from 'react';
import RotatorLogin from './auth/RotatorLogin';
import RotatorRegister from './auth/RotatorRegister';
import LinkFitLogin from './auth/LinkFitLogin';
import LinkFitRegister from './auth/LinkFitRegister';

export type AuthViewType = 'wa-login' | 'wa-register' | 'linkfit-login' | 'linkfit-register';

export default function Auth() {
  const [view, setView] = useState<AuthViewType>('wa-login');

  const renderView = () => {
    switch (view) {
      case 'wa-login':
        return <RotatorLogin onSwitch={setView} />;
      case 'wa-register':
        return <RotatorRegister onSwitch={setView} />;
      case 'linkfit-login':
        return <LinkFitLogin onSwitch={setView} />;
      case 'linkfit-register':
        return <LinkFitRegister onSwitch={setView} />;
      default:
        return <RotatorLogin onSwitch={setView} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 selection:bg-[#10b981] selection:text-white transition-colors duration-500 ${view.includes('linkfit') ? 'bg-[#e7f3f2]' : 'bg-[#f0f4f8]'}`}>
      
      {renderView()}

      {/* FOOTER & PREVIEW SWITCHER (Only for this Demo) */}
      <div className="mt-8 text-center space-y-4">
        <p className="text-xs text-gray-400 font-medium">Copyright © 2026 PT. LIFIE KARYA NUSANTARA. Seluruh hak cipta dilindungi.</p>
        <div className="bg-white/50 backdrop-blur border border-gray-200 rounded-full p-1.5 inline-flex shadow-sm">
          <button onClick={() => setView('wa-login')} className={`px-3 py-1.5 rounded-full text-xs font-bold ${view === 'wa-login' ? 'bg-[#10b981] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>WA Login</button>
          <button onClick={() => setView('wa-register')} className={`px-3 py-1.5 rounded-full text-xs font-bold ${view === 'wa-register' ? 'bg-[#10b981] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>WA Register</button>
          <button onClick={() => setView('linkfit-login')} className={`px-3 py-1.5 rounded-full text-xs font-bold ${view === 'linkfit-login' ? 'bg-[#081a1b] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>LinkFit Login</button>
          <button onClick={() => setView('linkfit-register')} className={`px-3 py-1.5 rounded-full text-xs font-bold ${view === 'linkfit-register' ? 'bg-[#081a1b] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>LinkFit Register</button>
        </div>
      </div>
    </div>
  );
}
