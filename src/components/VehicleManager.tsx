import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Building2, 
  User, 
  Satellite, 
  ShieldCheck, 
  Activity, 
  Navigation, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle,
  X
} from 'lucide-react';
import { VehicleRecord } from '../types';
import { rtdb } from '../lib/firebase';
import { onValue, ref } from 'firebase/database';
import { pushVehicleRecordToFirebase, deleteVehicleRecordFromFirebase } from '../lib/firebase';
import ThreeDCard from './ThreeDCard';

export default function VehicleManager() {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCavalo, setNewCavalo] = useState('');
  const [newCarreta, setNewCarreta] = useState('');
  const [newCarrier, setNewCarrier] = useState('');
  const [newDriver, setNewDriver] = useState('');

  useEffect(() => {
    const unsub = onValue(ref(rtdb, 'dados-globais/veiculos'), snap => setVehicles(snap.exists() ? Object.values(snap.val()) : []));
    return () => unsub();
  }, []);

  const filtered = vehicles.filter(v => 
    v.cavaloPlate.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (v.carretaPlates && v.carretaPlates.toLowerCase().includes(searchTerm.toLowerCase())) ||
    v.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.driverName && v.driverName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCavalo || !newCarrier) return;

    const newRecord: VehicleRecord = {
      id: crypto.randomUUID(),
      cavaloPlate: newCavalo.toUpperCase().trim(),
      carretaPlates: newCarreta.toUpperCase().trim(),
      carrier: newCarrier.trim(),
      driverName: newDriver.trim(),
      createdAt: new Date().toISOString(),
    };

    await pushVehicleRecordToFirebase(newRecord);
    setShowAddModal(false);
    setNewCavalo('');
    setNewCarreta('');
    setNewCarrier('');
    setNewDriver('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente remover este veículo da telemetria?')) {
      await deleteVehicleRecordFromFirebase(id);
    }
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden text-[#E2E8F0] select-none">
      
      {/* 3D Master Header */}
      <ThreeDCard className="p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1A2536] pb-4 mb-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#D4A373] flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5 text-pink-400 animate-pulse" /> SASCAR TELEMETRY CORE
              </span>
              <span className="bg-[#1B293E] text-[#D4A373] border border-[#2B3F5C] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                {filtered.length} Ativos
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight mt-1">
              Centro de Gestão de Frotas & Rastreamento
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitoramento via satélite em tempo real, integração Sascar e controle de carretas de grãos.
            </p>
          </div>

          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-[#84532B] via-[#D4A373] to-[#C68A4C] text-black font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(212,163,115,0.3)] hover:brightness-110 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Cadastrar Veículo
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por placa do cavalo, carreta, motorista ou transportadora..."
            className="w-full bg-[#0A0E17] border border-[#1E2B40] rounded-xl pl-11 pr-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-[#D4A373] shadow-inner"
          />
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
        </div>
      </ThreeDCard>

      {/* 3D Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(v => (
          <ThreeDCard key={v.id} glowColor="rgba(212, 163, 115, 0.2)" className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4 border-b border-[#182436] pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#090D14] text-[#E2B170] font-mono font-black text-sm rounded-lg border border-[#3D2C1E] tracking-wider shadow-inner">
                    {v.cavaloPlate}
                  </span>
                  <span className="text-[9px] font-mono font-bold uppercase text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> SAT ONLINE
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleDelete(v.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-[#1A2230] rounded-lg transition-colors cursor-pointer"
                    title="Excluir Veículo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-xs">
                  <Truck className="w-4 h-4 text-[#D4A373] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-mono text-slate-400 uppercase">Carreta(s) / Baú</p>
                    <p className="font-mono text-white font-bold truncate">{v.carretaPlates || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-mono text-slate-400 uppercase">Transportadora Parceira</p>
                    <p className="text-slate-200 font-bold truncate">{v.carrier}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-mono text-slate-400 uppercase">Condutor Responsável</p>
                    <p className="text-slate-300 font-medium truncate">{v.driverName || 'Não Informado'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#182436] flex items-center justify-between text-[10px] font-mono text-slate-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#D4A373]" /> Sascar Telemetria Ativa
              </div>
              <span>{new Date(v.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
          </ThreeDCard>
        ))}
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C121C] border border-[#25354D] rounded-3xl max-w-md w-full p-6 shadow-[0_0_60px_rgba(0,0,0,0.9)] text-[#E2E8F0]">
            <div className="flex items-center justify-between border-b border-[#1A2536] pb-3 mb-4">
              <h3 className="text-base font-black text-white">Cadastrar Novo Veículo na Frota</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl bg-[#141C29] text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Placa do Cavalo Mecânico *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: ABC1D23"
                  value={newCavalo}
                  onChange={e => setNewCavalo(e.target.value)}
                  className="w-full bg-[#070A0F] border border-[#1E2B40] rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-[#D4A373]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Placa(s) das Carretas
                </label>
                <input
                  type="text"
                  placeholder="Ex: XYZ9876 / KJH5432"
                  value={newCarreta}
                  onChange={e => setNewCarreta(e.target.value)}
                  className="w-full bg-[#070A0F] border border-[#1E2B40] rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-[#D4A373]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Transportadora *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rodonaves / Braspress / Própria"
                  value={newCarrier}
                  onChange={e => setNewCarrier(e.target.value)}
                  className="w-full bg-[#070A0F] border border-[#1E2B40] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4A373]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Nome do Motorista
                </label>
                <input
                  type="text"
                  placeholder="Ex: Carlos Eduardo Silveira"
                  value={newDriver}
                  onChange={e => setNewDriver(e.target.value)}
                  className="w-full bg-[#070A0F] border border-[#1E2B40] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4A373]"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-[#1A2536]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#141C29] text-slate-300 text-xs font-bold hover:bg-[#1C2738] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D4A373] text-black text-xs font-bold hover:bg-[#E2B170] cursor-pointer shadow-md"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
