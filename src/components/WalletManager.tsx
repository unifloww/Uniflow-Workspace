import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function WalletManager() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <Wallet className="text-emerald-500" /> Wallet & Saldo
          </h1>
          <p className="text-gray-500 text-sm mt-1">Kelola pendapatan dari produk digital dan donasi Anda.</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md">
          Tarik Saldo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-bold mb-2">Saldo Tersedia</p>
          <p className="text-3xl font-black text-gray-900">Rp 0</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-bold mb-2">Saldo Tertunda</p>
          <p className="text-3xl font-black text-gray-900">Rp 0</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-bold mb-2">Total Pendapatan</p>
          <p className="text-3xl font-black text-emerald-600">Rp 0</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-700">Riwayat Transaksi</h2>
        </div>
        <div className="p-12 text-center text-gray-400">
          <Wallet size={32} className="mx-auto mb-2 opacity-50" />
          <p>Belum ada riwayat transaksi dompet.</p>
        </div>
      </div>
    </div>
  );
}
