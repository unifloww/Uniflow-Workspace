import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ShoppingCart, Search, FileText } from 'lucide-react';

export default function OrdersManager() {
  const { orders } = useAppContext();

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <ShoppingCart className="text-emerald-500" /> Pesanan
          </h1>
          <p className="text-gray-500 text-sm mt-1">Daftar transaksi dan penjualan produk Anda.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="relative w-64">
             <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
             <input type="text" placeholder="Cari order..." className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs font-bold">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Pelanggan</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Tanggal</th>
              <th className="p-4 text-right">Detail</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400"><ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />Belum ada pesanan masuk.</td></tr>
            ) : orders.map(o => (
              <tr key={o.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-mono text-xs text-gray-500">{o.orderNumber}</td>
                <td className="p-4">
                  <p className="text-sm font-bold text-gray-900">{o.customerName}</p>
                  <p className="text-xs text-gray-500">{o.customerEmail}</p>
                </td>
                <td className="p-4 text-sm font-bold text-gray-900">Rp {o.grossAmount.toLocaleString('id-ID')}</td>
                <td className="p-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${o.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{o.status}</span>
                </td>
                <td className="p-4 text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString('id-ID')}</td>
                <td className="p-4 text-right">
                  <button className="text-emerald-500 hover:text-emerald-600 font-bold text-xs">Lihat</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
