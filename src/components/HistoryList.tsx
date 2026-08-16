import React, { useState, useEffect } from 'react';
import { onValue, ref } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { Occurrence, OccurrenceStatus, Leader } from '../types';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Truck, 
  Building2, 
  Tag, 
  Wifi, 
  AlertTriangle, 
  Download, 
  FileSpreadsheet, 
  ShieldCheck, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Layers
} from 'lucide-react';
import ThreeDCard from './ThreeDCard';

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
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);

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

  const handleExportCSV = () => {
    const headers = ['ID', 'Data/Hora', 'Título', 'Líder', 'Risco', 'Status', 'Placa', 'Transportadora'];
    const rows = sortedOccurrences.map(o => [
      o.id,
      new Date(o.createdAt).toLocaleString('pt-BR'),
      `"${o.title.replace(/"/g, '""')}"`,
      `"${o.leaderName}"`,
      o.riskLevel,
      o.status,
      o.plate || 'N/A',
      o.carrier || 'N/A'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `3C_Auditoria_Ocorrencias_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden text-[#E2E8F0] select-none">
      
      {/* 3D Header and Tactical Filter Deck */}
      <ThreeDCard className="p-5 sm:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#1A2536] pb-4 mb-5">
          <div>
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#D4A373] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4A373] animate-pulse" />
              SISTEMA DE AUDITORIA & REGISTROS
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight mt-0.5">
              Histórico Operacional de Incidentes
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Registros imutáveis com carimbo de tempo para conformidade ISO 31000 e governança corporativa.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-[#141E2C] border border-[#22334A] hover:border-[#D4A373] text-xs font-mono font-bold text-[#D4A373] hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
            <button 
              onClick={handleClearFilters} 
              className="text-xs font-bold text-slate-400 hover:text-[#D4A373] transition-colors cursor-pointer px-2 py-1"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Filter Input Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="relative md:col-span-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por placa, título, motorista..."
              className="w-full bg-[#0A0E17] border border-[#1E2B40] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A373] transition-all font-mono"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          </div>

          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="w-full bg-[#0A0E17] border border-[#1E2B40] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A373] cursor-pointer"
          >
            <option value="">Todos os Tipos</option>
            <option value="padrao">Veículos e Frotas</option>
            <option value="instabilidade">Instabilidade / TI</option>
          </select>

          <select
            value={selectedLeaderFilter}
            onChange={(e) => setSelectedLeaderFilter(e.target.value)}
            className="w-full bg-[#0A0E17] border border-[#1E2B40] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A373] cursor-pointer"
          >
            <option value="">Todos os Líderes</option>
            {leaders.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
          </select>

          <select
            value={selectedRiskFilter}
            onChange={(e) => setSelectedRiskFilter(e.target.value)}
            className="w-full bg-[#0A0E17] border border-[#1E2B40] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A373] cursor-pointer"
          >
            <option value="">Risco: Todos</option>
            <option value="baixo">Baixo</option>
            <option value="medio">Médio</option>
            <option value="alto">Alto</option>
            <option value="critico">Crítico</option>
          </select>
        </div>
      </ThreeDCard>

      {/* 3D Tactical Table View */}
      <ThreeDCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0B1019] border-b border-[#1A2536] text-slate-400 text-[10px] uppercase font-mono tracking-wider font-bold">
              <tr>
                <th className="px-5 py-4">Data/Hora (BRT)</th>
                <th className="px-5 py-4">Título & Setor</th>
                <th className="px-5 py-4">Líder Responsável</th>
                <th className="px-5 py-4">Severidade</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141E2C]">
              {sortedOccurrences.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500 text-xs font-mono">
                    Nenhum registro correspondente aos filtros selecionados.
                  </td>
                </tr>
              ) : (
                sortedOccurrences.map(occ => {
                  const dateObj = new Date(occ.createdAt);
                  return (
                    <tr 
                      key={occ.id} 
                      onClick={() => setSelectedOccurrence(occ)}
                      className="hover:bg-[#101724]/90 transition-colors group cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <div className="flex flex-col font-mono">
                          <span className="text-xs font-bold text-white">
                            {dateObj.toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white group-hover:text-[#D4A373] transition-colors flex items-center gap-1.5">
                            {occ.instabilitySystem && <Wifi className="w-3.5 h-3.5 text-pink-400 shrink-0" />}
                            {occ.title}
                          </span>
                          <span className="text-[11px] text-slate-400 line-clamp-1 max-w-sm mt-0.5">
                            {occ.description}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs font-medium text-slate-300">
                          {occ.leaderName}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase ${
                          occ.riskLevel === 'critico' ? 'bg-red-950/80 text-red-400 border border-red-800/80 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
                          occ.riskLevel === 'alto' ? 'bg-orange-950/80 text-orange-400 border border-orange-800/80' :
                          occ.riskLevel === 'medio' ? 'bg-amber-950/80 text-amber-400 border border-amber-800/80' :
                          'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            occ.riskLevel === 'critico' ? 'bg-red-400 animate-pulse' :
                            occ.riskLevel === 'alto' ? 'bg-orange-400' :
                            occ.riskLevel === 'medio' ? 'bg-amber-400' : 'bg-emerald-400'
                          }`} />
                          {occ.riskLevel}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase ${
                          occ.status === 'resolvido' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60' :
                          occ.status === 'em_andamento' ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60' :
                          'bg-red-950/60 text-red-400 border border-red-800/60'
                        }`}>
                          {occ.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {isAdmin && (
                            <button
                              onClick={() => onDeleteOccurrence(occ.id)}
                              title="Excluir Ocorrência"
                              className="p-1.5 rounded-lg bg-[#151D2A] border border-[#223046] text-slate-400 hover:text-red-400 hover:border-red-500/50 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOccurrence(occ)}
                            title="Ver Detalhes Táticos"
                            className="p-1.5 rounded-lg bg-[#151D2A] border border-[#223046] text-[#D4A373] hover:text-white hover:border-[#D4A373] transition-all cursor-pointer"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </ThreeDCard>

      {/* Holographic Occurrence Detail Modal */}
      {selectedOccurrence && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C121C] border border-[#25354D] rounded-3xl max-w-xl w-full p-6 shadow-[0_0_60px_rgba(0,0,0,0.9)] text-[#E2E8F0]">
            <div className="flex items-center justify-between border-b border-[#1A2536] pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#D4A373]">
                  DOSSIÊ DE INCIDENTE #{selectedOccurrence.id.slice(0, 8)}
                </span>
                <h3 className="text-base font-black text-white">{selectedOccurrence.title}</h3>
              </div>
              <button
                onClick={() => setSelectedOccurrence(null)}
                className="p-1.5 rounded-xl bg-[#141C29] text-slate-400 hover:text-white hover:bg-[#1A2536] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#070A0F] rounded-xl border border-[#182333] font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] block">LÍDER RESPONSÁVEL</span>
                  <span className="font-bold text-white">{selectedOccurrence.leaderName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">DATA DO REGISTRO</span>
                  <span className="font-bold text-white">{new Date(selectedOccurrence.createdAt).toLocaleString('pt-BR')}</span>
                </div>
                {selectedOccurrence.plate && (
                  <div>
                    <span className="text-slate-500 text-[10px] block">PLACA / VEÍCULO</span>
                    <span className="font-bold text-[#D4A373]">{selectedOccurrence.plate}</span>
                  </div>
                )}
                {selectedOccurrence.carrier && (
                  <div>
                    <span className="text-slate-500 text-[10px] block">TRANSPORTADORA</span>
                    <span className="font-bold text-white">{selectedOccurrence.carrier}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  DESCRIÇÃO DETALHADA
                </span>
                <p className="p-3 bg-[#070A0F] rounded-xl border border-[#182333] text-slate-300 text-xs leading-relaxed">
                  {selectedOccurrence.description}
                </p>
              </div>

              {selectedOccurrence.actionsTaken && (
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#D4A373] block mb-1">
                    AÇÕES DE CONTENÇÃO EXECUTADAS
                  </span>
                  <p className="p-3 bg-[#070A0F] rounded-xl border border-[#182333] text-emerald-300 text-xs leading-relaxed">
                    {selectedOccurrence.actionsTaken}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-3 pt-3 border-t border-[#1A2536]">
              <button
                onClick={() => setSelectedOccurrence(null)}
                className="px-5 py-2 rounded-xl bg-[#D4A373] text-black text-xs font-bold hover:bg-[#E2B170] transition-colors cursor-pointer"
              >
                Concluir Visualização
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
