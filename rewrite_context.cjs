const fs = require('fs');

let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// 1. Add Product and Order types
const typesToAdd = `
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
`;

code = code.replace(/export type BioLinkSocial = {/, typesToAdd + '\nexport type BioLinkSocial = {');

// 2. Add to AppContextType
const contextTypesToAdd = `
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
`;
code = code.replace(/bioLinks: BioLink\[\];\n  setBioLinks: React.Dispatch<React.SetStateAction<BioLink\[\]>>;/g, `bioLinks: BioLink[];\n  setBioLinks: React.Dispatch<React.SetStateAction<BioLink[]>>;\n${contextTypesToAdd}`);

// 3. Add States
const statesToAdd = `
  const [products, setProductsState] = useState<Product[]>([]);
  const [orders, setOrdersState] = useState<Order[]>([]);
  const [remoteProducts, setRemoteProducts] = useState<Product[]>([]);
  const [remoteOrders, setRemoteOrders] = useState<Order[]>([]);
`;
code = code.replace(/const \[remoteBioLinks, setRemoteBioLinks\] = useState<BioLink\[\]>\(\[\]\);/g, `const [remoteBioLinks, setRemoteBioLinks] = useState<BioLink[]>([]);\n${statesToAdd}`);

// 4. Add subscriptions
const subsToAdd = `
    let unsubProducts: () => void;
    let unsubOrders: () => void;
`;
code = code.replace(/let unsubBioLinks: \(\) => void;/g, `let unsubBioLinks: () => void;\n${subsToAdd}`);

const subImplsToAdd = `
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
`;
code = code.replace(/setIsLoading\(false\);\n        } else {/g, `${subImplsToAdd}\n          setIsLoading(false);\n        } else {`);

const clearStateToAdd = `
          setProductsState([]);
          setOrdersState([]);
`;
code = code.replace(/setBioLinksState\(\[\]\);/g, `setBioLinksState([]);\n${clearStateToAdd}`);

const unsubClearToAdd = `
          if (unsubProducts) unsubProducts();
          if (unsubOrders) unsubOrders();
`;
code = code.replace(/if \(unsubBioLinks\) unsubBioLinks\(\);/g, `if (unsubBioLinks) unsubBioLinks();\n${unsubClearToAdd}`);

const unsubReturnToAdd = `
      if (unsubProducts) unsubProducts();
      if (unsubOrders) unsubOrders();
`;
code = code.replace(/if \(unsubBioLinks\) unsubBioLinks\(\);\n    };/g, `if (unsubBioLinks) unsubBioLinks();\n${unsubReturnToAdd}    };`);

// 5. Add Sync Hooks
const syncHooksToAdd = `
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
`;
code = code.replace(/const setAdmins = \(action: React.SetStateAction<Admin\[\]>\) => {/g, `${syncHooksToAdd}\n  const setAdmins = (action: React.SetStateAction<Admin[]>) => {`);

// 6. Add Wrappers
const wrappersToAdd = `
  const setProducts = (action: React.SetStateAction<Product[]>) => setProductsState(action);
  const setOrders = (action: React.SetStateAction<Order[]>) => setOrdersState(action);
`;
code = code.replace(/const logout = async \(\) => {/g, `${wrappersToAdd}\n  const logout = async () => {`);

// 7. Add to context provider value
code = code.replace(/bioLinks, setBioLinks,/g, `bioLinks, setBioLinks, products, setProducts, orders, setOrders,`);

fs.writeFileSync('src/context/AppContext.tsx', code);
console.log('Done rewriting AppContext.tsx');
