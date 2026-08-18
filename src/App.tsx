import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AdminRotator from './components/AdminRotator';
import LinkRotator from './components/LinkRotator';
import DataForm from './components/DataForm';
import PublicRotator from './components/PublicRotator';
import ProfileSettings from './components/ProfileSettings';
import Analytics from './components/Analytics';
import Auth from './components/Auth';
import { AppProvider, useAppContext } from './context/AppContext';

function AppContent() {
  const { isAuthenticated, isLoading } = useAppContext();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [publicSlug, setPublicSlug] = useState<string | null>(null);

  useEffect(() => {
    const hostname = window.location.hostname;
    const path = window.location.pathname;
    
    // Check if it's a rotator subdomain
    if (hostname === 'wa.uniflow.my.id' || hostname === 'info.uniflow.my.id') {
      const slug = path.replace(/^\//, ''); // remove leading slash
      setPublicSlug(slug || 'not-found');
    } 
    // Fallback for app.uniflow.my.id or preview URLs: /r/slug
    else if (path.startsWith('/r/')) {
      const slug = path.replace('/r/', '');
      if (slug) {
        setPublicSlug(slug);
      }
    }
  }, []);

  if (publicSlug) {
    return <PublicRotator slug={publicSlug} />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f3f6f9]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#148e73]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen bg-[#f3f6f9] font-sans selection:bg-[#148e73] selection:text-white overflow-hidden relative">
      <Sidebar 
        activeItem={activeItem} 
        setActiveItem={(id) => {
          setActiveItem(id);
          setIsMobileSidebarOpen(false);
        }} 
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header 
          toggleMobile={() => setIsMobileSidebarOpen(true)}
          toggleDesktop={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isDesktopCollapsed={isSidebarCollapsed}
          setActiveItem={setActiveItem}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {activeItem === 'dashboard' ? (
            <Dashboard setActiveItem={setActiveItem} />
          ) : activeItem === 'admin' ? (
            <AdminRotator />
          ) : activeItem === 'campaign' ? (
            <LinkRotator />
          ) : activeItem === 'data' ? (
            <DataForm />
          ) : activeItem === 'profil' ? (
            <ProfileSettings />
          ) : activeItem === 'analytics' ? (
            <Analytics />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mx-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Segera Hadir</h2>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">Halaman untuk fitur <span className="font-semibold text-gray-700">"{activeItem}"</span> sedang dalam pengembangan. Silakan kembali ke Dashboard.</p>
                <button 
                  onClick={() => setActiveItem('dashboard')}
                  className="px-6 py-2.5 bg-[#148e73] hover:bg-[#107962] text-white rounded-xl font-bold text-sm shadow transition-colors"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
