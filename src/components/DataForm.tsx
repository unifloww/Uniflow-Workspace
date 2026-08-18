import React, { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { initFirebase } from '../lib/firebase';
import { doc, deleteDoc, writeBatch } from 'firebase/firestore';

export default function DataForm() {
  const { leads, setLeads } = useAppContext();
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeads(leads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(leadId => leadId !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm('Yakin ingin menghapus data yang dipilih?')) {
      const { db } = await initFirebase();
      const batch = writeBatch(db);
      selectedLeads.forEach(id => {
        batch.delete(doc(db, 'leads', id));
      });
      await batch.commit();
      
      setLeads(leads.filter(l => !selectedLeads.includes(l.id)));
      setSelectedLeads([]);
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Yakin ingin menghapus SEMUA data lead? Tindakan ini tidak bisa dibatalkan.')) {
      const { db } = await initFirebase();
      const batch = writeBatch(db);
      leads.forEach(lead => {
        batch.delete(doc(db, 'leads', lead.id));
      });
      await batch.commit();
      
      setLeads([]);
      setSelectedLeads([]);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        
        <div className="relative z-10 space-y-1.5 mb-5 md:mb-0">
          <p className="text-[#107962] text-[11px] font-bold tracking-widest uppercase">LEAD DATABASE</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Data Form</h1>
          <p className="text-gray-500 text-sm font-medium">Semua calon customer yang mengisi form campaign tersimpan di sini.</p>
        </div>
        <div className="relative z-10 flex w-full md:w-auto">
          <button className="flex-1 md:flex-none bg-[#1ca886] hover:bg-[#20b893] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow border border-[#23c29b] transition-all flex items-center justify-center gap-2">
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Action Toolbar */}
        <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/30">
          <p className="text-sm font-bold text-gray-600">
            Centang satu atau beberapa data untuk dihapus.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              disabled={selectedLeads.length === 0}
              onClick={handleDeleteSelected}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors border ${selectedLeads.length > 0 ? 'border-red-200 text-red-600 hover:bg-red-50 bg-white' : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'}`}
            >
              <Trash2 size={16} strokeWidth={2.5} />
              Hapus Terpilih
            </button>
            <button 
              disabled={leads.length === 0}
              onClick={handleDeleteAll}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm border ${leads.length > 0 ? 'bg-red-600 hover:bg-red-700 text-white border-red-700' : 'bg-red-300 text-white border-red-300 cursor-not-allowed'}`}
            >
              Hapus Semua
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest bg-white">
                <th className="px-6 py-4 w-12">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={leads.length > 0 && selectedLeads.length === leads.length}
                    disabled={leads.length === 0}
                    className="w-4 h-4 rounded border-gray-300 text-[#148e73] focus:ring-[#148e73] disabled:opacity-50" 
                  />
                </th>
                <th className="px-6 py-4 whitespace-nowrap">Nama</th>
                <th className="px-6 py-4 whitespace-nowrap">WhatsApp</th>
                <th className="px-6 py-4 whitespace-nowrap">Pesan</th>
                <th className="px-6 py-4 whitespace-nowrap">Campaign</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <p className="text-[#a7f3d0] font-bold text-lg mb-2">Belum ada data lead.</p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => handleSelectOne(lead.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#148e73] focus:ring-[#148e73]" 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-800">{lead.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-600">{lead.whatsapp}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 truncate max-w-[200px]" title={lead.message}>{lead.message}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 bg-gray-100 text-gray-700 text-[10px] font-extrabold tracking-wide rounded-full">
                        {lead.campaign}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-xs font-medium text-gray-500">{lead.date}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center text-[11px] font-medium text-gray-400 py-2">
        Copyright © 2026 PT. LIFIE KARYA NUSANTARA. Seluruh hak cipta dilindungi.
      </div>
    </div>
  );
}
