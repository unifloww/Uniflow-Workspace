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
  message?: string;
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

export type WaLink = {
  id: string;
  userId?: string;
  title: string;
  purpose: string;
  whatsapp: string;
  message: string;
  isActive: boolean;
  clicks: number;
};

export type SmartLink = {
  id: string;
  userId?: string;
  title: string;
  originalUrl: string;
  shortUrl: string; // The alias
  clicks: number;
  createdAt: string;
  isActive: boolean;
  password?: string;
  clickLimit?: number;
  expireDate?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  geoTargeting?: Record<string, string>; // country code -> url
  deviceTargeting?: { desktop?: string; mobile?: string; ios?: string; android?: string };
  rotator?: { url: string; percentage: number }[];
};

export type BioBlockType = 'link' | 'text' | 'image' | 'video' | 'social' | 'product';

export type BioBlock = {
  id: string;
  type: BioBlockType;
  title?: string;
  url?: string;
  content?: string;
  price?: string;
  socials?: BioLinkSocial[];
  isActive: boolean;
  clicks: number;
};


export type ProductType = 'DIGITAL' | 'COURSE' | 'EVENT' | 'APPOINTMENT' | 'DONATION' | 'PHYSICAL';
export type Product = {
  id: string;
  creatorId?: string;
  userId?: string;
  type: ProductType;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  coverImage?: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  creatorId?: string;
  userId?: string;
  customerId?: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  productId: string;
  grossAmount: number;
  status: 'PENDING' | 'PAID' | 'FAILED';
  createdAt: string;
};

export type WalletLedger = {
  id: string;
  creatorId: string;
  orderId?: string;
  type: 'SALE' | 'WITHDRAWAL';
  amount: number;
  direction: 'CREDIT' | 'DEBIT';
  status: 'PENDING' | 'CLEARED';
  createdAt: string;
};

export type BioLinkSocial = {
  platform: 'instagram' | 'tiktok' | 'youtube' | 'whatsapp' | 'website' | 'shopee' | 'tokopedia' | 'other';
  url: string;
};

export type BioLink = {
  id: string;
  userId?: string;
  username: string; // the @username part
  profilePhoto?: string;
  name: string;
  bio: string;
  theme: 'light' | 'dark' | 'glass' | 'gradient' | 'minimal';
  blocks: BioBlock[];
  views: number;
  clicks: number;
  createdAt: string;
  isActive: boolean;
};

type AppContextType = {
  admins: Admin[];
  setAdmins: React.Dispatch<React.SetStateAction<Admin[]>>;
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  waLinks: WaLink[];
  setWaLinks: React.Dispatch<React.SetStateAction<WaLink[]>>;
  smartLinks: SmartLink[];
  setSmartLinks: React.Dispatch<React.SetStateAction<SmartLink[]>>;
  bioLinks: BioLink[];
  setBioLinks: React.Dispatch<React.SetStateAction<BioLink[]>>;

  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;

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
  const [waLinks, setWaLinksState] = useState<WaLink[]>([]);
  const [smartLinks, setSmartLinksState] = useState<SmartLink[]>([]);
  const [bioLinks, setBioLinksState] = useState<BioLink[]>([]);

  // Local state mirror to avoid infinite loops when writing back
  const [remoteAdmins, setRemoteAdmins] = useState<Admin[]>([]);
  const [remoteCampaigns, setRemoteCampaigns] = useState<Campaign[]>([]);
  const [remoteLeads, setRemoteLeads] = useState<Lead[]>([]);
  const [remoteWaLinks, setRemoteWaLinks] = useState<WaLink[]>([]);
  const [remoteSmartLinks, setRemoteSmartLinks] = useState<SmartLink[]>([]);
  const [remoteBioLinks, setRemoteBioLinks] = useState<BioLink[]>([]);

  const [products, setProductsState] = useState<Product[]>([]);
  const [orders, setOrdersState] = useState<Order[]>([]);
  const [remoteProducts, setRemoteProducts] = useState<Product[]>([]);
  const [remoteOrders, setRemoteOrders] = useState<Order[]>([]);


  useEffect(() => {
    let unsubscribeAuth: () => void;
    let unsubAdmins: () => void;
    let unsubCampaigns: () => void;
    let unsubLeads: () => void;
    let unsubWaLinks: () => void;
    let unsubSmartLinks: () => void;
    let unsubBioLinks: () => void;

    let unsubProducts: () => void;
    let unsubOrders: () => void;


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
          unsubWaLinks = onSnapshot(query(collection(db, 'walinks'), where('userId', '==', currentUser.uid)), (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }) as WaLink);
            setWaLinksState(data);
            setRemoteWaLinks(data);
          });
          unsubSmartLinks = onSnapshot(query(collection(db, 'smartlinks'), where('userId', '==', currentUser.uid)), (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }) as SmartLink);
            setSmartLinksState(data);
            setRemoteSmartLinks(data);
          });
          unsubBioLinks = onSnapshot(query(collection(db, 'biolinks'), where('userId', '==', currentUser.uid)), (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }) as BioLink);
            setBioLinksState(data);
            setRemoteBioLinks(data);
          });
          
          unsubProducts = onSnapshot(query(collection(db, 'products'), where('userId', '==', currentUser.uid)), (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Product);
            setProductsState(data);
            setRemoteProducts(data);
          });
          unsubOrders = onSnapshot(query(collection(db, 'orders'), where('userId', '==', currentUser.uid)), (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Order);
            setOrdersState(data);
            setRemoteOrders(data);
          });

          setIsLoading(false);
        } else {
          setAdminsState([]);
          setCampaignsState([]);
          setLeadsState([]);
          setWaLinksState([]);
          setSmartLinksState([]);
          setBioLinksState([]);

          setProductsState([]);
          setOrdersState([]);

          if (unsubAdmins) unsubAdmins();
          if (unsubCampaigns) unsubCampaigns();
          if (unsubLeads) unsubLeads();
          if (unsubWaLinks) unsubWaLinks();
          if (unsubSmartLinks) unsubSmartLinks();
          if (unsubBioLinks) unsubBioLinks();

          if (unsubProducts) unsubProducts();
          if (unsubOrders) unsubOrders();

          setIsLoading(false);
        }
      });
    });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubAdmins) unsubAdmins();
      if (unsubCampaigns) unsubCampaigns();
      if (unsubLeads) unsubLeads();
      if (unsubWaLinks) unsubWaLinks();
      if (unsubSmartLinks) unsubSmartLinks();
      if (unsubBioLinks) unsubBioLinks();

          if (unsubProducts) unsubProducts();
          if (unsubOrders) unsubOrders();

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

  useEffect(() => {
    if (!user) return;
    const syncWaLinks = async () => {
      if (JSON.stringify(waLinks) === JSON.stringify(remoteWaLinks)) return;
      const { db } = await initFirebase();
      const batch = writeBatch(db);
      waLinks.forEach(link => {
        const docRef = doc(db, 'walinks', link.id);
        batch.set(docRef, { ...link, userId: user.uid });
      });
      await batch.commit();
    };
    syncWaLinks();
  }, [waLinks, user, remoteWaLinks]);

  useEffect(() => {
    if (!user) return;
    const syncSmartLinks = async () => {
      if (JSON.stringify(smartLinks) === JSON.stringify(remoteSmartLinks)) return;
      const { db } = await initFirebase();
      const batch = writeBatch(db);
      smartLinks.forEach(link => {
        const docRef = doc(db, 'smartlinks', link.id);
        batch.set(docRef, { ...link, userId: user.uid });
      });
      await batch.commit();
    };
    syncSmartLinks();
  }, [smartLinks, user, remoteSmartLinks]);

  useEffect(() => {
    if (!user) return;
    const syncBioLinks = async () => {
      if (JSON.stringify(bioLinks) === JSON.stringify(remoteBioLinks)) return;
      const { db } = await initFirebase();
      const batch = writeBatch(db);
      bioLinks.forEach(link => {
        const docRef = doc(db, 'biolinks', link.id);
        batch.set(docRef, { ...link, userId: user.uid });
      });
      await batch.commit();
    };
    syncBioLinks();
  }, [bioLinks, user, remoteBioLinks]);

  // Provide wrappers for setters to update local state immediately
  
  useEffect(() => {
    if (!user) return;
    const syncProducts = async () => {
      if (JSON.stringify(products) === JSON.stringify(remoteProducts)) return;
      const { db } = await initFirebase();
      const batch = writeBatch(db);
      products.forEach(item => {
        const docRef = doc(db, 'products', item.id);
        batch.set(docRef, { ...item, userId: user.uid, creatorId: user.uid });
      });
      await batch.commit();
    };
    syncProducts();
  }, [products, user, remoteProducts]);

  useEffect(() => {
    if (!user) return;
    const syncOrders = async () => {
      if (JSON.stringify(orders) === JSON.stringify(remoteOrders)) return;
      const { db } = await initFirebase();
      const batch = writeBatch(db);
      orders.forEach(item => {
        const docRef = doc(db, 'orders', item.id);
        batch.set(docRef, { ...item, userId: user.uid, creatorId: user.uid });
      });
      await batch.commit();
    };
    syncOrders();
  }, [orders, user, remoteOrders]);

  const setAdmins = (action: React.SetStateAction<Admin[]>) => {
    setAdminsState(action);
  };
  const setCampaigns = (action: React.SetStateAction<Campaign[]>) => {
    setCampaignsState(action);
  };
  const setLeads = (action: React.SetStateAction<Lead[]>) => {
    setLeadsState(action);
  };
  const setWaLinks = (action: React.SetStateAction<WaLink[]>) => {
    setWaLinksState(action);
  };
  const setSmartLinks = (action: React.SetStateAction<SmartLink[]>) => {
    setSmartLinksState(action);
  };
  const setBioLinks = (action: React.SetStateAction<BioLink[]>) => {
    setBioLinksState(action);
  };

  
  const setProducts = (action: React.SetStateAction<Product[]>) => setProductsState(action);
  const setOrders = (action: React.SetStateAction<Order[]>) => setOrdersState(action);

  const logout = async () => {
    const { auth } = await initFirebase();
    await signOut(auth);
  };

  return (
    <AppContext.Provider value={{ admins, setAdmins, campaigns, setCampaigns, leads, setLeads, waLinks, setWaLinks, smartLinks, setSmartLinks, bioLinks, setBioLinks, products, setProducts, orders, setOrders, isAuthenticated, user, isLoading, logout }}>
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
