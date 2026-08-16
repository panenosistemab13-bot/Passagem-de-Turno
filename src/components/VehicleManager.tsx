import React, { useState, useEffect } from 'react';
import { Truck, Search, Plus, Edit, Trash2, Calendar, Clock, Building2, Shield, X, Check, AlertCircle } from 'lucide-react';
import { VehicleRecord } from '../types';
import { rtdb, snapshotToArray } from '../lib/firebase';
import { onValue, ref } from 'firebase/database';

interface VehicleManagerProps {
  vehicles: VehicleRecord[];
  onAddVehicle: (record: Omit<VehicleRecord, 'id'>) => Promise<void>;
  onUpdateVehicle: (record: VehicleRecord) => Promise<void>;
  onDeleteVehicle: (id: string) => Promise<void>;
  isAdmin: boolean;
}

export default function VehicleManager({
  vehicles: initialVehicles,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  isAdmin
}: VehicleManagerProps) {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>(initialVehicles || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'cavalo' | 'carreta' | 'transportadora'>('all');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [cavaloPlate, setCavaloPlate] = useState('');
  const [carretaPlates, setCarretaPlates] = useState('');
  const [carrier, setCarrier] = useState('');
  const [driverName, setDriverName] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Realtime listener for vehicle records
  useEffect(() => {
    const unsub = onValue(ref(rtdb, 'dados-globais/veiculos'), (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list = snapshotToArray<VehicleRecord>(val);
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setVehicles(list);
      } else {
        setVehicles([]);
      }
    });
    return () => unsub();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setCavaloPlate('');
    setCarretaPlates('');
    setCarrier('');
    setDriverName('');
    setNotes('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: VehicleRecord) => {
    setEditingId(v.id);
    setCavaloPlate(v.cavaloPlate || '');
    setCarretaPlates(v.carretaPlates || '');
    setCarrier(v.carrier || '');
    setDriverName(v.driverName || '');
    setNotes(v.notes || '');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cavaloPlate.trim() || !carrier.trim()) {
      setErrorMsg('Preencha pelo menos a Placa do Cavalo e a Transportadora.');
      return;
    }

    const payload = {
      cavaloPlate: cavaloPlate.trim().toUpperCase(),
      carretaPlates: carretaPlates.trim().toUpperCase(),
      carrier: carrier.trim(),
      driverName: driverName.trim(),
      notes: notes.trim()
    };

    try {
      if (editingId) {
        const existing = vehicles.find(v => v.id === editingId);
        await onUpdateVehicle({
          ...existing,
          id: editingId,
          ...payload,
          createdAt: existing?.createdAt || new Date().toISOString()
        });
      } else {
        await onAddVehicle({
          ...payload,
          createdAt: new Date().toISOString()
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving vehicle record:", err);
      setErrorMsg('Erro ao salvar no Firebase. Tente novamente.');
    }
  };

  // Filter logic
  const filteredVehicles = vehicles.filter(v => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      v.cavaloPlate?.toLowerCase().includes(term) ||
      v.carretaPlates?.toLowerCase().includes(term) ||
      v.carrier?.toLowerCase().includes(term) ||
      (v.driverName && v.driverName.toLowerCase().includes(term)) ||
      (v.notes && v.notes.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (filterType === 'cavalo') {
      return v.cavaloPlate?.toLowerCase().includes(term);
    }
    if (filterType === 'carreta') {
      return v.carretaPlates?.toLowerCase().includes(term);
    }
    if (filterType === 'transportadora') {
      return v.carrier?.toLowerCase().includes(term);
    }

    return true;
  });

  const formatDate = (isoString: string) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Placas de Veículos</h1>
              <p className="text-sm text-slate-500">Controle e cadastro de cavalos, carretas e transportadoras</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Cadastrar Veículo</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar placa, transportadora..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>

        <div className="hidden items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">Filtrar por:</span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({vehicles.length})
          </button>
          <button
            onClick={() => setFilterType('cavalo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'cavalo' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Placa Cavalo
          </button>
          <button
            onClick={() => setFilterType('carreta')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'carreta' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Placa Carreta
          </button>
          <button
            onClick={() => setFilterType('transportadora')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'transportadora' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Transportadora
          </button>
        </div>
      </div>

      {/* Vehicle List Grid / Table */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">Nenhum veículo encontrado</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Não há registros correspondentes aos filtros selecionados ou nenhum veículo foi cadastrado ainda.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Primeiro Veículo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVehicles.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between relative group"
            >
              <div>
                {/* Header card */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-mono font-bold text-sm rounded-lg border border-blue-100">
                      🚛 {v.cavaloPlate}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(v)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Deseja excluir o registro do veículo ${v.cavaloPlate}?`)) {
                          onDeleteVehicle(v.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-slate-400 font-medium min-w-[90px]">Carretas:</span>
                    <span className="text-slate-800 font-mono font-medium">{v.carretaPlates || 'Nenhuma informada'}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-xs block">Transportadora</span>
                      <span className="text-slate-800 font-medium">{v.carrier}</span>
                    </div>
                  </div>
                  {v.driverName && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-slate-400 font-medium min-w-[90px]">Motorista:</span>
                      <span className="text-slate-700">{v.driverName}</span>
                    </div>
                  )}
                  {v.notes && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl mt-2 border border-slate-100 italic">
                      "{v.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Footer Timestamp */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Cadastrado em:</span>
                </div>
                <span className="font-medium text-slate-600">{formatDate(v.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  {editingId ? 'Editar Registro de Veículo' : 'Novo Cadastro de Veículo'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Placa do Cavalo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ABC-1234"
                    value={cavaloPlate}
                    onChange={(e) => setCavaloPlate(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Placa(s) da Carreta
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: XYZ-9876, DEF-5432"
                    value={carretaPlates}
                    onChange={(e) => setCarretaPlates(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Transportadora *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome da transportadora"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Nome do Motorista (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Nome completo do motorista"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Observações (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Informações adicionais sobre a viagem, horário de entrada/saída, lacres, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? 'Salvar Alterações' : 'Cadastrar Veículo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
