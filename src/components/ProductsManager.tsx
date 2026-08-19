import React, { useState } from 'react';
import { useAppContext, Product, ProductType } from '../context/AppContext';
import { Package, Plus, Search, Edit2, Trash2 } from 'lucide-react';

export default function ProductsManager() {
  const { products, setProducts, user } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    type: 'DIGITAL',
    name: '',
    slug: '',
    description: '',
    price: 0,
    status: 'DRAFT'
  });

  const saveProduct = () => {
    if (!formData.name || formData.price === undefined) {
      alert("Nama dan harga harus diisi!");
      return;
    }
    
    const newProduct: Product = {
      id: formData.id || Date.now().toString(),
      creatorId: user?.uid,
      type: formData.type as ProductType,
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: formData.description || '',
      price: Number(formData.price),
      status: formData.status as any,
      createdAt: formData.createdAt || new Date().toISOString()
    };
    
    if (formData.id) {
      setProducts(products.map(p => p.id === formData.id ? newProduct : p));
    } else {
      setProducts([newProduct, ...products]);
    }
    
    setIsFormOpen(false);
  };

  const deleteProduct = (id: string) => {
    if(confirm('Hapus produk ini?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <Package className="text-emerald-500" /> Kelola Produk
          </h1>
          <p className="text-gray-500 text-sm mt-1">Buat dan kelola produk digital, kelas, dan layanan Anda.</p>
        </div>
        <button 
          onClick={() => { setFormData({ type: 'DIGITAL', name: '', slug: '', description: '', price: 0, status: 'DRAFT' }); setIsFormOpen(true); }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md flex items-center gap-2"
        >
          <Plus size={16} /> Tambah Produk
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold mb-6 border-b pb-2">{formData.id ? 'Edit Produk' : 'Produk Baru'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Tipe Produk</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ProductType})} className="w-full border rounded-lg p-2 text-sm">
                <option value="DIGITAL">Produk Digital (E-book, File)</option>
                <option value="COURSE">Video Course</option>
                <option value="EVENT">Webinar / Event</option>
                <option value="APPOINTMENT">Booking Konsultasi</option>
                <option value="DONATION">Dukungan / Donasi</option>
              </select>
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">Status</label>
               <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full border rounded-lg p-2 text-sm">
                 <option value="DRAFT">Draft</option>
                 <option value="ACTIVE">Active (Live)</option>
                 <option value="ARCHIVED">Archived</option>
               </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1">Nama Produk</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-2 text-sm" placeholder="Contoh: E-book Strategi Marketing" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Harga (Rp)</label>
              <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border rounded-lg p-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1">Deskripsi</label>
              <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded-lg p-2 text-sm" placeholder="Jelaskan detail produk ini..."></textarea>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Batal</button>
            <button onClick={saveProduct} className="px-4 py-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl">Simpan Produk</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="relative w-64">
             <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
             <input type="text" placeholder="Cari produk..." className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs font-bold">
            <tr>
              <th className="p-4">Produk</th>
              <th className="p-4">Tipe</th>
              <th className="p-4">Harga</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Belum ada produk.</td></tr>
            ) : products.map(p => (
              <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                  <p className="text-xs text-gray-500">/{p.slug}</p>
                </td>
                <td className="p-4"><span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md">{p.type}</span></td>
                <td className="p-4 text-sm font-bold text-gray-900">Rp {p.price.toLocaleString('id-ID')}</td>
                <td className="p-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>{p.status}</span>
                </td>
                <td className="p-4 flex justify-end gap-2">
                  <button onClick={() => { setFormData(p); setIsFormOpen(true); }} className="p-1.5 text-gray-400 hover:text-emerald-500 rounded"><Edit2 size={16}/></button>
                  <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
