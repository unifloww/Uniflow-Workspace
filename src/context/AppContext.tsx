import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initFirebase } from '../lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, setDoc, writeBatch } from 'firebase/firestore';

export type Admin = {
  id: string;
  userId?: string;
  name: string;
  nickname: string;
  countryCode?: string;
  whatsapp: string;
  is24Hours: boolean;
  startTime: string;
  endTime: string;
  days: string[];
  message: string;
  stats: {
    forwarded: number;
    unforwarded: number;
    invalid: number;
  };
  isActive: boolean;
};

export type AdminStat = {
  id: string;
  name: string;
  clicks: number;
  invalid: number;
  allTimeConnected: number;
  allTimeRequests: number;
  weight?: number;
};

export type Campaign = {
  id: string;
  userId?: string;
  name: string;
  slug: string;
  url: string;
  method: string;
  isSticky: boolean;
  stickyDays: number;
  periodClicks: number;
  totalClicks: number;
  isActive: boolean;
  adminStats: AdminStat[];
  useForm: boolean;
  formTitle: string;
  dailyClicks?: Record<string, number>;
  deviceStats?: Record<string, number>;
  hourlyStats?: Record<string, number>;
  locationStats?: Record<string, number>;
};

export type Lead = {
  id: string;
  userId?: string;
  name: string;
  whatsapp: string;
  message: string;
  campaign: string;
  date: string;
};

type AppContextType = {
  admins: Admin[];
  setAdmins: React.Dispatch<React.SetStateAction<Admin[]>>;
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [admins, setAdminsState] = useState<Admin[]>([]);
  const [campaigns, setCampaignsState] = useState<Campaign[]>([]);
  const [leads, setLeadsState] = useState<Lead[]>([]);

  // Local state mirror to avoid infinite loops when writing back
  const [remoteAdmins, setRemoteAdmins] = useState<Admin[]>([]);
  const [remoteCampaigns, setRemoteCampaigns] = useState<Campaign[]>([]);
  const [remoteLeads, setRemoteLeads] = useState<Lead[]>([]);

  useEffect(() => {
    let unsubscribeAuth: () => void;
    let unsubAdmins: () => void;
    let unsubCampaigns: () => void;
    let unsubLeads: () => void;

    initFirebase().then(({ auth, db }) => {
      unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setIsAuthenticated(!!currentUser);
        
        if (currentUser) {
          // Subscribe to Firestore collections
          unsubAdmins = onSnapshot(query(collection(db, 'admins'), where('userId', '==', currentUser.uid)), (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Admin);
            setAdminsState(data);
            setRemoteAdmins(data);
          });
          unsubCampaigns = onSnapshot(query(collection(db, 'campaigns'), where('userId', '==', currentUser.uid)), (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Campaign);
            setCampaignsState(data);
            setRemoteCampaigns(data);
          });
          unsubLeads = onSnapshot(query(collection(db, 'leads'), where('userId', '==', currentUser.uid)), (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Lead);
            setLeadsState(data);
            setRemoteLeads(data);
          });
          setIsLoading(false);
        } else {
          setAdminsState([]);
          setCampaignsState([]);
          setLeadsState([]);
          if (unsubAdmins) unsubAdmins();
          if (unsubCampaigns) unsubCampaigns();
          if (unsubLeads) unsubLeads();
          setIsLoading(false);
        }
      });
    });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubAdmins) unsubAdmins();
      if (unsubCampaigns) unsubCampaigns();
      if (unsubLeads) unsubLeads();
    };
  }, []);

  // Sync back to Firestore when local state changes
  useEffect(() => {
    if (!user) return;
    const syncAdmins = async () => {
      if (JSON.stringify(admins) === JSON.stringify(remoteAdmins)) return;
      const { db } = await initFirebase();
      const batch = writeBatch(db);
      admins.forEach(admin => {
        const docRef = doc(db, 'admins', admin.id);
        batch.set(docRef, { ...admin, userId: user.uid });
      });
      // We are not handling deletes here to keep it simple, 
      // but ideally we should track deleted items
      await batch.commit();
    };
    syncAdmins();
  }, [admins, user, remoteAdmins]);

  useEffect(() => {
    if (!user) return;
    const syncCampaigns = async () => {
      if (JSON.stringify(campaigns) === JSON.stringify(remoteCampaigns)) return;
      const { db } = await initFirebase();
      const batch = writeBatch(db);
      campaigns.forEach(campaign => {
        const docRef = doc(db, 'campaigns', campaign.id);
        batch.set(docRef, { ...campaign, userId: user.uid });
      });
      await batch.commit();
    };
    syncCampaigns();
  }, [campaigns, user, remoteCampaigns]);

  useEffect(() => {
    if (!user) return;
    const syncLeads = async () => {
      if (JSON.stringify(leads) === JSON.stringify(remoteLeads)) return;
      const { db } = await initFirebase();
      const batch = writeBatch(db);
      leads.forEach(lead => {
        const docRef = doc(db, 'leads', lead.id);
        batch.set(docRef, { ...lead, userId: user.uid });
      });
      await batch.commit();
    };
    syncLeads();
  }, [leads, user, remoteLeads]);

  // Provide wrappers for setters to update local state immediately
  const setAdmins = (action: React.SetStateAction<Admin[]>) => {
    setAdminsState(action);
  };
  const setCampaigns = (action: React.SetStateAction<Campaign[]>) => {
    setCampaignsState(action);
  };
  const setLeads = (action: React.SetStateAction<Lead[]>) => {
    setLeadsState(action);
  };

  const logout = async () => {
    const { auth } = await initFirebase();
    await signOut(auth);
  };

  return (
    <AppContext.Provider value={{ admins, setAdmins, campaigns, setCampaigns, leads, setLeads, isAuthenticated, user, isLoading, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
