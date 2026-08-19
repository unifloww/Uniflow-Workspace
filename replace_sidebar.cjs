const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const newMenu = `
const menuCategories = [
  {
    title: 'MARKETING TOOLS',
    items: [
      { id: 'smartlink', icon: Link2, label: 'Smart Link Tools', sub: 'Shortlink dan QR' },
      { id: 'wame', icon: MessageCircle, label: 'WA.me Builder', sub: 'Pembuat link WhatsApp' },
      { id: 'biolink', icon: LayoutTemplate, label: 'Link in Bio', sub: 'Mini landing page' },
    ]
  },
  {
    title: 'COMMERCE',
    items: [
      { id: 'products', icon: Package, label: 'Digital Products', sub: 'Kelola jualan' },
      { id: 'orders', icon: ShoppingCart, label: 'Orders', sub: 'Data Transaksi' },
      { id: 'wallet', icon: Wallet, label: 'Wallet', sub: 'Saldo & Penarikan' },
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
`;

code = code.replace(/const menuCategories = \[\s*\{\s*title: 'MARKETING TOOLS',[\s\S]*?\}\s*\];/m, newMenu);

// add icon imports
code = code.replace(/import { LayoutDashboard, Users, UserPlus, Database, User, Link2, LogOut, MessageCircle, Share2, MousePointerClick, X, Activity, Settings, Paintbrush, Globe, DollarSign, CreditCard, BookOpen, LifeBuoy, LayoutTemplate } from 'lucide-react';/, 
`import { LayoutDashboard, Users, UserPlus, Database, User, Link2, LogOut, MessageCircle, Share2, MousePointerClick, X, Activity, Settings, Paintbrush, Globe, DollarSign, CreditCard, BookOpen, LifeBuoy, LayoutTemplate, Package, ShoppingCart, Wallet } from 'lucide-react';`);

fs.writeFileSync('src/components/Sidebar.tsx', code);
