import React from 'react';
import { 
  LayoutDashboard, UserCog, GitMerge, FileText, BarChart2, 
  Link as LinkIcon, CreditCard, ShoppingBag, ClipboardList, Wallet, Link2, MessageCircle,
  Paintbrush, Globe, DollarSign, BookOpen, LifeBuoy, User, X, Shuffle
} from 'lucide-react';

const menuCategories = [
  {
    title: 'MANAJEMEN WA ROTATOR',
    items: [
      { id: 'admin', icon: UserCog, label: 'Admin Rotator', sub: 'Tim penerima lead' },
      { id: 'campaign', icon: Shuffle, label: 'Link WA Rotator', sub: 'Distribusi traffic', badge: 'STAR' },
      { id: 'data', icon: FileText, label: 'Data Form', sub: 'Database calon customer' },
      { id: 'analytics', icon: BarChart2, label: 'Analytics', sub: 'Insight dan performa' },
    ]
  },
  {
    title: 'MARKETING TOOLS',
    items: [
      { id: 'bio', icon: LinkIcon, label: 'Bio Link', sub: 'Profil publik @username' },
      { id: 'payment', icon: CreditCard, label: 'Payment LinkFit', sub: 'Link bayar siap share' },
      { id: 'store', icon: ShoppingBag, label: 'Store', sub: 'Produk digital dan fisik', hasDropdown: true },
      { id: 'pesanan', icon: ClipboardList, label: 'Pesanan', sub: 'Order produk digital' },
      { id: 'saldo', icon: Wallet, label: 'Saldo', sub: 'Wallet dan withdraw' },
      { id: 'smartlink', icon: Link2, label: 'Smart Link Tools', sub: 'Shortlink dan QR' },
      { id: 'wame', icon: MessageCircle, label: 'WA.me Builder', sub: 'Pembuat link WhatsApp' },
    ]
  },
  {
    title: 'BRANDING',
    items: [
      { id: 'custombrand', icon: Paintbrush, label: 'Custom Branding', sub: 'Identitas bisnis' },
      { id: 'customdomain', icon: Globe, label: 'Custom Domain', sub: 'Domain campaign Anda' },
    ]
  },
  {
    title: 'AKUN & BISNIS',
    items: [
      { id: 'affiliate', icon: DollarSign, label: 'Affiliate', sub: 'Referral dan komisi' },
      { id: 'billing', icon: CreditCard, label: 'Billing', sub: 'Paket dan pembayaran', hasDropdown: true },
    ]
  },
  {
    title: 'BANTUAN',
    items: [
      { id: 'panduan', icon: BookOpen, label: 'Panduan', sub: 'Tutorial penggunaan' },
      { id: 'support', icon: LifeBuoy, label: 'Support', sub: 'Bantuan langsung' },
      { id: 'profil', icon: User, label: 'Profil', sub: 'Akun dan keamanan' },
    ]
  }
];

interface SidebarProps {
  activeItem: string;
  setActiveItem: (id: string) => void;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
}

export default function Sidebar({ activeItem, setActiveItem, isCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[#148e73] text-white border-r border-[#107962] custom-scrollbar transition-all duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-64`}>
        
        {/* Logo Area */}
        <div className="p-4 flex items-center justify-between sticky top-0 bg-[#148e73] z-10 border-b border-[#1b9a7f] h-16">
          {!isCollapsed ? (
            <img src="https://dash.uniflow.my.id/uniflow-logo-light.png" alt="Uniflow" className="h-8 object-contain" />
          ) : (
            <div className="w-full flex justify-center items-center">
              <span className="font-black text-2xl tracking-tighter hidden md:block">U</span>
              <img src="https://dash.uniflow.my.id/uniflow-logo-light.png" alt="Uniflow" className="h-8 object-contain md:hidden" />
            </div>
          )}
          
          <button 
            className="md:hidden p-1 rounded-md bg-[#107962] hover:bg-[#0e6b57]"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Free Trial Badge */}
        <div className={`py-3 border-b border-[#1b9a7f] flex ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'} items-center`}>
          {!isCollapsed && <span className="text-xs font-semibold tracking-wider opacity-90">Free Trial</span>}
          <div className={`flex items-center gap-1 bg-[#107962] ${isCollapsed ? 'px-1.5 py-1.5' : 'px-2 py-0.5'} rounded-full shadow-inner`} title="Online">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
            {!isCollapsed && <span className="text-[10px] font-bold">ONLINE</span>}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-3 space-y-5 pb-8 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Dashboard Link */}
          <div>
            <button 
              onClick={() => setActiveItem('dashboard')}
              title={isCollapsed ? "Dashboard" : undefined}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all relative ${activeItem === 'dashboard' ? 'bg-[#1b9a7f] shadow-sm ring-1 ring-white/10' : 'hover:bg-[#107962]'}`}
            >
              <div className={`p-1.5 rounded-lg flex-shrink-0 ${activeItem === 'dashboard' ? 'bg-emerald-50 text-[#148e73]' : 'text-emerald-100'}`}>
                 <LayoutDashboard size={isCollapsed ? 20 : 18} />
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex flex-col items-start flex-1 text-left">
                    <span className={`text-sm font-semibold ${activeItem === 'dashboard' ? 'text-white' : 'text-emerald-50'}`}>Dashboard</span>
                    <span className="text-[10px] text-emerald-200">Ringkasan operasi</span>
                  </div>
                  {activeItem === 'dashboard' && <span className="text-[9px] font-bold bg-[#22c55e] px-1.5 py-0.5 rounded text-white shadow-sm">AKTIF</span>}
                </>
              )}
              {isCollapsed && activeItem === 'dashboard' && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#22c55e] rounded-full border border-[#148e73]"></span>
              )}
            </button>
          </div>

          {menuCategories.map((category, idx) => (
            <div key={idx} className="mt-4">
              {!isCollapsed ? (
                <h3 className="px-3 text-[10px] font-bold text-[#86ebd3] mb-2 uppercase tracking-widest">{category.title}</h3>
              ) : (
                <div className="w-full flex justify-center mb-2">
                  <div className="w-6 h-px bg-[#1b9a7f]"></div>
                </div>
              )}
              <div className="space-y-0.5">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveItem(item.id)}
                      title={isCollapsed ? item.label : undefined}
                      className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-xl transition-all group relative ${isActive ? 'bg-[#1b9a7f] shadow-sm ring-1 ring-white/10' : 'hover:bg-[#107962]'}`}
                    >
                      <div className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${isActive ? 'bg-emerald-50 text-[#148e73]' : 'text-emerald-200 group-hover:text-white'}`}>
                        <Icon size={isCollapsed ? 20 : 18} />
                      </div>
                      {!isCollapsed && (
                        <>
                          <div className="flex flex-col items-start flex-1 text-left min-w-0">
                            <span className={`text-sm font-semibold truncate w-full ${isActive ? 'text-white' : 'text-emerald-50 group-hover:text-white'}`}>{item.label}</span>
                            <span className="text-[10px] text-[#a7f3d0] opacity-80 truncate w-full">{item.sub}</span>
                          </div>
                          {item.badge && <span className="text-[9px] font-bold bg-[#3b82f6] px-1.5 py-0.5 rounded-full text-white shadow-sm flex-shrink-0">{item.badge}</span>}
                          {item.hasDropdown && <svg className="w-4 h-4 text-[#86ebd3] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>}
                        </>
                      )}
                      {isCollapsed && item.badge && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#3b82f6] rounded-full border border-[#148e73]"></span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #107962;
            border-radius: 10px;
          }
          .custom-scrollbar:hover::-webkit-scrollbar-thumb {
            background: #0f6c58;
          }
        `}</style>
      </div>
    </>
  );
}
