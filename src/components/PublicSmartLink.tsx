import React, { useEffect, useState } from 'react';
import { initFirebase } from '../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, increment } from 'firebase/firestore';
import { SmartLink } from '../context/AppContext';
import { Play } from 'lucide-react';

interface Props {
  slug: string;
}

export default function PublicSmartLink({ slug }: Props) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const { db } = await initFirebase();
        const linksRef = collection(db, 'smartlinks');
        const q = query(linksRef, where('shortUrl', '==', slug.toLowerCase()));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setError("Link tidak ditemukan.");
          return;
        }

        const linkDoc = snapshot.docs[0];
        const linkData = { id: linkDoc.id, ...linkDoc.data() } as SmartLink;

        if (!linkData.isActive) {
          setError("Link ini sedang tidak aktif.");
          return;
        }

        // Add to stats
        try {
          await updateDoc(doc(db, 'smartlinks', linkDoc.id), {
            clicks: increment(1)
          });
        } catch (e) {
          console.error("Failed to update stats", e);
        }

        // Process URL if it has UTM builder tags saved in advanced config
        let finalUrl = linkData.originalUrl;
        
        // Simple direct redirect
        window.location.href = finalUrl;
        
      } catch (err) {
        console.error(err);
        setError("Terjadi kesalahan saat memproses link.");
      }
    };

    handleRedirect();
  }, [slug]);

  if (error) {
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

  return (
    <div className="min-h-screen bg-[#f3f6f9] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-[#10b981] rounded-full animate-ping opacity-20"></div>
          <div className="absolute inset-2 bg-[#10b981] rounded-full animate-pulse opacity-30"></div>
          <div className="relative w-full h-full bg-[#ebfcf6] text-[#10b981] rounded-full flex items-center justify-center shadow-inner z-10">
            <Play size={40} className="ml-1" fill="currentColor" />
          </div>
        </div>
        <h3 className="text-xl font-extrabold text-gray-900 mb-3 tracking-tight">Mengarahkan...</h3>
      </div>
    </div>
  );
}
