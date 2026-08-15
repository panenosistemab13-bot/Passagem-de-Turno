import React, { useState } from 'react';
import { Occurrence, OccurrenceStatus, Leader } from '../types';
import { Search, Filter, Trash2, Calendar, AlertTriangle, Eye, RefreshCw } from 'lucide-react';
import ThreeDIcon from './ThreeDIcon';

interface HistoryListProps {
  occurrences: Occurrence[];
  leaders: Leader[];
  isAdmin: boolean;
  onUpdateStatus: (id: string, status: OccurrenceStatus) => void;
  onDeleteOccurrence: (id: string) => void;
}

export default function HistoryList({
  occurrences,
  leaders,
  isAdmin,
  onUpdateStatus,
  onDeleteOccurrence
}: HistoryListProps) {
  
  // Filtering and Searching states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeaderFilter, setSelectedLeaderFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');

  // Dropdown options of active shift dates
  const uniqueShiftDates = Array.from(new Set(occurrences.map(o => o.shiftDate)));

  // Perform filter logic
  const filteredOccurrences = occurrences.filter((occ) => {
    const matchesSearch = 
      occ.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      occ.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLeader = selectedLeaderFilter ? occ.leaderName === selectedLeaderFilter : true;
    const matchesStatus = selectedStatusFilter ? occ.status === selectedStatusFilter : true;
    const matchesRisk = selectedRiskFilter ? occ.riskLevel === selectedRiskFilter : true;
    const matchesDate = selectedDateFilter ? occ.shiftDate === selectedDateFilter : true;

    return matchesSearch && matchesLeader && matchesStatus && matchesRisk && matchesDate;
  });

  const handleStatusChange = (id: string, newStatus: OccurrenceStatus) => {
    onUpdateStatus(id, newStatus);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedLeaderFilter('');
    setSelectedStatusFilter('');
    setSelectedRiskFilter('');
    setSelectedDateFilter('');
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Header block */}
      <div className="bg-white rounded-lg border border-[#E0D8D0] p-4 shadow-sm">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-b border-[#F4F1EE] pb-3 mb-3">
          <div>
            <h2 className="text-sm font-black uppercase text-[#2C1810] tracking-wider">Histórico de Incidentes e Passagens</h2>
            <p className="text-[10px] text-[#8C7B70]">Filtre, pesquise e acompanhe o andamento das ocorrências em tempo real.</p>
          </div>
          
          {/* Quick Clear */}
          <button
            onClick={handleClearFilters}
            className="text-xs font-bold text-[#C8102E] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Limpar Filtros
          </button>
        </div>

        {/* Input grids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
          
          {/* Text Search input */}
          <div className="relative md:col-span-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar descrição..."
              className="w-full bg-[#F4F1EE] border border-[#E0D8D0] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#C8102E] font-semibold"
            />
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#8C7B70]" />
          </div>

          {/* Leader dropdown Filter */}
          <div className="relative">
            <select
              value={selectedLeaderFilter}
              onChange={(e) => setSelectedLeaderFilter(e.target.value)}
              className="w-full bg-[#F4F1EE] border border-[#E0D8D0] rounded-lg px-2 py-1.5 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#C8102E] appearance-none font-bold"
            >
              <option value="">Líder: Todos</option>
              {leaders.map(l => (
                <option key={l.id} value={l.name}>{l.name}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-2.5 w-3 h-3 text-[#8C7B70] pointer-events-none" />
          </div>

          {/* Status dropdown Filter */}
          <div className="relative">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full bg-[#F4F1EE] border border-[#E0D8D0] rounded-lg px-2 py-1.5 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#C8102E] appearance-none font-bold"
            >
              <option value="">Ação: Todas</option>
              <option value="acompanhar">Acompanhar</option>
              <option value="resolvido">Resolvido</option>
              <option value="para conhecimento">Para Conhecimento</option>
            </select>
            <Filter className="absolute right-3 top-2.5 w-3 h-3 text-[#8C7B70] pointer-events-none" />
          </div>

          {/* Risk level dropdown Filter */}
          <div className="relative">
            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              className="w-full bg-[#F4F1EE] border border-[#E0D8D0] rounded-lg px-2 py-1.5 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#C8102E] appearance-none font-bold"
            >
              <option value="">Risco: Todos</option>
              <option value="Baixo">Baixo</option>
              <option value="Médio">Médio</option>
              <option value="Alto">Alto</option>
              <option value="Crítico">Crítico</option>
            </select>
            <Filter className="absolute right-3 top-2.5 w-3 h-3 text-[#8C7B70] pointer-events-none" />
          </div>

          {/* Plantão date dropdown Filter */}
          <div className="relative">
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="w-full bg-[#F4F1EE] border border-[#E0D8D0] rounded-lg px-2 py-1.5 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#C8102E] appearance-none font-bold"
            >
              <option value="">Plantão: Todos</option>
              {uniqueShiftDates.map((date, idx) => (
                <option key={idx} value={date}>{date}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-2.5 w-3 h-3 text-[#8C7B70] pointer-events-none" />
          </div>

        </div>

      </div>

      {/* Main List Layout */}
      <div className="space-y-3">
        {filteredOccurrences.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#E0D8D0] p-8 text-center text-[#8C7B70] text-xs">
            Nenhuma ocorrência encontrada correspondente aos filtros selecionados.
          </div>
        ) : (
          filteredOccurrences.map((occ) => (
            <div 
              key={occ.id} 
              className="bg-white rounded-lg border border-[#E0D8D0] hover:border-[#C8102E]/60 shadow-sm overflow-hidden transition-all duration-150"
            >
              {/* Card Header */}
              <div className="bg-[#FAF9F7] px-4 py-2.5 border-b border-[#E0D8D0] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-black text-[10px] text-[#2C1810] bg-[#E0D8D0]/50 px-2.5 py-0.5 rounded">
                    {occ.shiftDate}
                  </span>
                  
                  <div className="w-1 h-1 rounded-full bg-[#E0D8D0]" />
                  
                  <span className="text-xs text-[#8C7B70] font-bold flex items-center gap-1">
                    Líder: <span className="text-[#2C1810] font-extrabold">{occ.leaderName}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Category Chip */}
                  <span className="text-[10px] font-bold uppercase text-[#8C7B70] tracking-wider">
                    {occ.category}
                  </span>

                  {/* Risk Chip */}
                  <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase border ${
                    occ.riskLevel === 'Crítico' ? 'bg-red-50 text-red-700 border-red-200' :
                    occ.riskLevel === 'Alto' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    occ.riskLevel === 'Médio' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {occ.riskLevel}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-3">
                
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-[#2C1810]">{occ.title}</h3>
                  <p className="text-xs text-[#5D4037] leading-relaxed whitespace-pre-wrap">{occ.description}</p>
                </div>

                {/* Card Controls Footer: Dropdown & Admin controls */}
                <div className="pt-3 border-t border-[#F4F1EE] flex flex-wrap items-center justify-between gap-2 text-xs">
                  
                  {/* Custom status selector dropdown with immediate team notification trigger */}
                  <div className="flex items-center gap-2 bg-[#F4F1EE] px-2.5 py-1 rounded border border-[#E0D8D0]">
                    <span className="text-[#8C7B70] font-bold text-[10px]">Status:</span>
                    <select
                      value={occ.status}
                      onChange={(e) => handleStatusChange(occ.id, e.target.value as OccurrenceStatus)}
                      className="bg-white border border-[#E0D8D0] rounded px-1.5 py-0.5 text-[10px] font-black text-[#2C1810] focus:outline-none cursor-pointer"
                    >
                      <option value="acompanhar">Acompanhar</option>
                      <option value="resolvido">Resolvido</option>
                      <option value="para conhecimento">Para Conhecimento</option>
                    </select>
                    
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                      occ.status === 'resolvido' ? 'bg-emerald-500' :
                      occ.status === 'acompanhar' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#8C7B70]">
                      Registrado às {new Date(occ.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </span>

                    {/* Admin Delete trigger */}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja apagar permanentemente esta ocorrência do histórico?')) {
                            onDeleteOccurrence(occ.id);
                          }
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Excluir Ocorrência (Permissão de Admin)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>

              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
