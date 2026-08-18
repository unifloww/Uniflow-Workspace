import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, PanelLeftClose, PanelLeftOpen, User, LogOut } from 'lucide-react';

import { useAppContext } from '../context/AppContext';

interface HeaderProps {
  toggleMobile: () => void;
  toggleDesktop: () => void;
  isDesktopCollapsed: boolean;
  setActiveItem: (id: string) => void;
}

export default function Header({ toggleMobile, toggleDesktop, isDesktopCollapsed, setActiveItem }: HeaderProps) {
  const { logout, user } = useAppContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-20 shadow-sm transition-all duration-300">
      <div className="flex-1 max-w-xl flex items-center gap-2 sm:gap-4">
        <button onClick={toggleMobile} className="md:hidden p-2 text-gray-500 hover:text-[#148e73] hover:bg-emerald-50 rounded-lg transition-colors flex-shrink-0">
          <Menu size={20} />
        </button>
        <button onClick={toggleDesktop} className="hidden md:flex p-2 text-gray-500 hover:text-[#148e73] hover:bg-emerald-50 rounded-lg transition-colors flex-shrink-0">
          {isDesktopCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
        
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#148e73]" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#148e73] focus:border-[#148e73] bg-gray-50/80 transition-shadow"
            placeholder="Cari campaign..."
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-2 sm:ml-4">
        <button className="p-2 text-gray-400 hover:text-[#148e73] rounded-full hover:bg-emerald-50 relative transition-colors flex-shrink-0">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center gap-2 sm:gap-3 border-l border-gray-200 pl-2 sm:pl-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800 leading-tight truncate max-w-[150px]">{user?.displayName || 'User'}</p>
              <p className="text-[11px] text-gray-500 font-medium truncate max-w-[150px]">{user?.email || 'user@example.com'}</p>
            </div>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover shadow-sm flex-shrink-0" />
            ) : (
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#10b981] text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 z-50">
              <button 
                onClick={() => {
                  setActiveItem('profil');
                  setIsProfileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User size={16} /> Profil
              </button>
              <div className="h-px bg-gray-100 my-1"></div>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
