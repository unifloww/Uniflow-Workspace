import React, { useEffect, useState } from 'react';
import { initFirebase } from '../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, increment } from 'firebase/firestore';
import { BioLink, BioBlock, BioLinkSocial } from '../context/AppContext';
import { 
  Instagram, Youtube, Globe, ShoppingBag, Link as LinkIcon, 
  UserCircle2, MonitorPlay
} from 'lucide-react';

const SOCIAL_ICONS: Record<string, any> = {
  instagram: Instagram, youtube: Youtube, whatsapp: LinkIcon, tiktok: LinkIcon,
  website: Globe, shopee: ShoppingBag, tokopedia: ShoppingBag, other: LinkIcon
};

interface Props {
  username: string;
}

export default function PublicBioLink({ username }: Props) {
  const [linkData, setLinkData] = useState<BioLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { db } = await initFirebase();
        const linksRef = collection(db, 'biolinks');
        const q = query(linksRef, where('username', '==', username.toLowerCase()));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setError("Halaman tidak ditemukan.");
          setIsLoading(false);
          return;
        }

        const docSnapshot = snapshot.docs[0];
        const data = { id: docSnapshot.id, ...docSnapshot.data() } as BioLink;

        if (!data.isActive) {
          setError("Halaman ini sedang tidak aktif.");
          setIsLoading(false);
          return;
        }

        setLinkData(data);
        setIsLoading(false);

        // Add to stats (views)
        try {
          await updateDoc(doc(db, 'biolinks', docSnapshot.id), {
            views: increment(1)
          });
        } catch (e) {
          console.error("Failed to update views", e);
        }

      } catch (err) {
        console.error(err);
        setError("Terjadi kesalahan.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
          <div className="w-48 h-6 bg-gray-200 rounded mb-2"></div>
          <div className="w-32 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !linkData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold">!</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-500 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  const handleLinkClick = async (url: string | undefined, blockId: string) => {
    if (!url) return;
    
    // Open URL first
    window.open(url, '_blank');

    // Update clicks in background
    try {
      const { db } = await initFirebase();
      const docRef = doc(db, 'biolinks', linkData.id);
      
      // We also update the total clicks count
      // For block-specific clicks we'd need to update the array which is complex with increment()
      // For now we just increment the total clicks for the page.
      await updateDoc(docRef, {
        clicks: increment(1)
      });
    } catch (e) {
      console.error("Failed to log click", e);
    }
  };

  const themeClass = 
    linkData.theme === 'light' ? 'bg-gray-50 text-gray-900' :
    linkData.theme === 'dark' ? 'bg-gray-900 text-white' :
    linkData.theme === 'minimal' ? 'bg-white text-gray-900' :
    linkData.theme === 'gradient' ? 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white' :
    'bg-gradient-to-br from-blue-100 to-emerald-100 text-gray-900';

  const buttonClass = 
    linkData.theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 
    linkData.theme === 'gradient' ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30' :
    linkData.theme === 'minimal' ? 'bg-transparent border-2 border-gray-900 text-gray-900 hover:bg-gray-50' :
    'bg-white text-gray-900 hover:bg-gray-50 shadow-sm';

  const socialClass = 
    linkData.theme === 'dark' || linkData.theme === 'gradient' ? 'bg-white/10 hover:bg-white/20 text-white' : 
    'bg-white shadow-sm hover:bg-gray-50 text-gray-900';

  return (
    <div className={`min-h-screen ${themeClass} flex flex-col items-center py-16 px-4`}>
      <div className="w-full max-w-xl flex flex-col items-center text-center animate-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Profile */}
        <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white/20 mb-6 flex items-center justify-center overflow-hidden shadow-lg">
          <UserCircle2 size={64} className="text-gray-400" />
        </div>
        
        <h1 className="text-2xl font-black mb-2">{linkData.name}</h1>
        
        {linkData.bio && (
          <p className={`text-base mb-10 max-w-sm ${linkData.theme === 'dark' || linkData.theme === 'gradient' ? 'text-white/80' : 'text-gray-600'}`}>
            {linkData.bio}
          </p>
        )}

        {/* Blocks Rendering */}
        <div className="space-y-4 w-full">
          {linkData.blocks?.map((block, idx) => {
            if (!block.isActive) return null;

            if (block.type === 'link' || block.type === 'product') {
              return (
                <button 
                  key={idx} 
                  onClick={() => handleLinkClick(block.url, block.id)}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-base transition-transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center gap-1 ${buttonClass}`}
                >
                  <span>{block.title || 'Tombol Link'}</span>
                  {block.type === 'product' && block.price && (
                    <span className="text-sm opacity-70 font-normal">{block.price}</span>
                  )}
                </button>
              );
            }

            if (block.type === 'social') {
              return (
                <div key={idx} className="flex flex-wrap justify-center gap-4 py-2 w-full">
                  {block.socials?.map((s, i) => {
                    const Icon = SOCIAL_ICONS[s.platform] || LinkIcon;
                    return (
                      <button 
                        key={i} 
                        onClick={() => handleLinkClick(s.url, block.id)}
                        className={`p-4 rounded-full transition-transform hover:scale-110 ${socialClass}`}
                      >
                         <Icon size={24} />
                      </button>
                    )
                  })}
                </div>
              );
            }

            if (block.type === 'text') {
              return (
                <div key={idx} className={`w-full text-left p-4 rounded-2xl ${linkData.theme === 'dark' || linkData.theme === 'gradient' ? 'bg-black/10' : 'bg-gray-100/50'} `}>
                  <p className="whitespace-pre-wrap">{block.content}</p>
                </div>
              );
            }

            if (block.type === 'image') {
              return (
                <div key={idx} onClick={() => block.url && handleLinkClick(block.url, block.id)} className={`w-full rounded-2xl overflow-hidden shadow-sm bg-gray-200 ${block.url ? 'cursor-pointer hover:opacity-90' : ''}`}>
                   {block.url ? <img src={block.url} alt="content" className="w-full h-auto object-cover" /> : null}
                </div>
              );
            }
            
            if (block.type === 'video') {
              return (
                <div key={idx} onClick={() => block.url && handleLinkClick(block.url, block.id)} className="w-full aspect-video rounded-2xl overflow-hidden shadow-sm bg-gray-800 flex items-center justify-center cursor-pointer group hover:opacity-90 transition-opacity relative">
                   <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                     <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg"><PlayIcon /></div>
                   </div>
                </div>
              );
            }

            return null;
          })}
        </div>

        <div className="mt-16 text-center">
          <p className={`text-xs font-bold uppercase tracking-widest ${linkData.theme === 'dark' || linkData.theme === 'gradient' ? 'text-white/40' : 'text-gray-400'}`}>
            Powered by Uniflow
          </p>
        </div>

      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3L19 12L5 21V3Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
