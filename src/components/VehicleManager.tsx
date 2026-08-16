import React, { useState, useEffect } from 'react';
import { Truck, Search, Plus, Edit, Trash2, Clock, Building2, User } from 'lucide-react';
import { VehicleRecord } from '../types';
import { rtdb } from '../lib/firebase';
import { onValue, ref } from 'firebase/database';

export default function VehicleManager() {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsub = onValue(ref(rtdb, 'dados-globais/veiculos'), snap => setVehicles(snap.exists() ? Object.values(snap.val()) : []));
    return () => unsub();
  }, []);

  const filtered = vehicles.filter(v => 
    v.cavaloPlate.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (v.carretaPlates && v.carretaPlates.toLowerCase().includes(searchTerm.toLowerCase())) ||
    v.carrier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#0F172A]">Controle de Frotas</h2>
          <p className="text-sm text-slate-500">Cadastro e consulta rápida de cavalos, carretas e motoristas.</p>
        </div>
        <button className="bg-[#1E40AF] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Cadastrar Veículo
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar por placa ou transportadora..."
          className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
        />
        <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(v => (
          <div key={v.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col group relative">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1.5 bg-[#0F172A] text-white font-mono font-black text-sm rounded-lg shadow-sm border border-slate-800 tracking-wider">
                  {v.cavaloPlate}
                </span>
                <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Ativo</span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Carreta(s)</p>
                  <p className="font-mono text-slate-700 font-bold truncate">{v.carretaPlates || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Transportadora</p>
                  <p className="text-slate-800 font-bold truncate">{v.carrier}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Motorista</p>
                  <p className="text-slate-600 font-medium truncate">{v.driverName || '-'}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Atualizado recentemente
              </div>
              <span>{new Date(v.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
