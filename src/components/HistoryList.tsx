import React, { useState, useEffect } from 'react';
import { onValue, ref } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { Occurrence, OccurrenceStatus, Leader } from '../types';
import { Search, Filter, Trash2, Edit, Check, X, Truck, Building2, Tag, Wifi, AlertTriangle } from 'lucide-react';

interface HistoryListProps {
  occurrences: Occurrence[];
  leaders: Leader[];
  isAdmin: boolean;
  onUpdateStatus: (id: string, status: OccurrenceStatus) => void;
  onDeleteOccurrence: (id: string) => void;
  onEditOccurrence: (updated: Occurrence) => void;
}

export default function HistoryList({
  occurrences: initialOccurrences,
  leaders,
  isAdmin,
  onUpdateStatus,
  onDeleteOccurrence,
  onEditOccurrence
}: HistoryListProps) {
  const [occurrences, setOccurrences] = useState<Occurrence[]>(initialOccurrences || []);

  useEffect(() => {
    const unsub = onValue(ref(rtdb, 'dados-globais/ocorrencias'), (snapshot) => {
      setOccurrences(snapshot.exists() ? Object.values(snapshot.val()) : []);
    });
    return () => unsub();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeaderFilter, setSelectedLeaderFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('');

  const filteredOccurrences = occurrences.filter((occ) => {
    const matchesSearch = 
      occ.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      occ.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (occ.plate && occ.plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (occ.carrier && occ.carrier.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLeader = selectedLeaderFilter === '' || occ.leaderName === selectedLeaderFilter;
    const matchesStatus = selectedStatusFilter === '' || occ.status === selectedStatusFilter;
    const matchesRisk = selectedRiskFilter === '' || occ.riskLevel === selectedRiskFilter;
    
    let matchesType = true;
    if (selectedTypeFilter === 'padrao') matchesType = !occ.instabilitySystem;
    if (selectedTypeFilter === 'instabilidade') matchesType = !!occ.instabilitySystem;

    return matchesSearch && matchesLeader && matchesStatus && matchesRisk && matchesType;
  });

  const sortedOccurrences = filteredOccurrences.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedLeaderFilter('');
    setSelectedStatusFilter('');
    setSelectedRiskFilter('');
    setSelectedTypeFilter('');
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      
      {/* Header and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="text-lg font-black text-[#0F172A] tracking-tight">Histórico Operacional</h2>
            <p className="text-xs text-slate-500 mt-1">Gerencie os registros de turno, ocorrências e instabilidades.</p>
          </div>
          <button onClick={handleClearFilters} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
            Limpar Filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative md:col-span-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar ocorrência..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          </div>

          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
          >
            <option value="">Todos os Tipos</option>
            <option value="padrao">Veículos e Frotas</option>
            <option value="instabilidade">Instabilidade / Chamado</option>
          </select>

          <select
            value={selectedLeaderFilter}
            onChange={(e) => setSelectedLeaderFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
          >
            <option value="">Todos os Líderes</option>
            {leaders.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
          </select>

          <select
            value={selectedRiskFilter}
            onChange={(e) => setSelectedRiskFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
          >
            <option value="">Risco: Todos</option>
            <option value="Baixo">Baixo</option>
            <option value="Médio">Médio</option>
            <option value="Alto">Alto</option>
            <option value="Crítico">Crítico</option>
          </select>
        </div>
      </div>

      {/* Corporate Table View */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-5 py-4">Data/Hora</th>
                <th className="px-5 py-4">Tipo/Descrição</th>
                <th className="px-5 py-4">Líder</th>
                <th className="px-5 py-4">Classificação</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedOccurrences.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500 text-xs">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                sortedOccurrences.map(occ => {
                  const dateObj = new Date(occ.createdAt);
                  return (
                    <tr key={occ.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{dateObj.toLocaleDateString('pt-BR')}</span>
                          <span className="text-[10px] text-slate-500">{dateObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 max-w-xs truncate">
                        <div className="flex items-center gap-2 mb-1">
                          {occ.instabilitySystem ? (
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">
                              <Wifi className="w-3 h-3 inline mr-1" /> Sist. / TI
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">
                              <Truck className="w-3 h-3 inline mr-1" /> Operação
                            </span>
                          )}
                          <span className="font-bold text-[#0F172A] text-xs truncate">{occ.title}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">{occ.description}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">{occ.leaderName}</span>
                          <span className="text-[10px] text-slate-400">{occ.shiftDate}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          occ.riskLevel === 'Crítico' ? 'bg-red-50 text-red-700 border-red-200' :
                          occ.riskLevel === 'Alto' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          occ.riskLevel === 'Médio' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {occ.riskLevel}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={occ.status}
                          onChange={(e) => onUpdateStatus(occ.id, e.target.value as OccurrenceStatus)}
                          className="bg-transparent border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-700 focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="acompanhar">Acompanhar</option>
                          <option value="resolvido">Resolvido</option>
                          <option value="para conhecimento">Para Conhecimento</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          {isAdmin && (
                            <button
                              onClick={() => {
                                if (confirm('Excluir este registro?')) {
                                  onDeleteOccurrence(occ.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
