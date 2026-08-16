import React, { useState, useEffect } from 'react';
import { onValue, ref } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { Occurrence, OccurrenceStatus, Leader } from '../types';
import { 
  Search, 
  Filter, 
  Trash2, 
  Calendar, 
  AlertTriangle, 
  Eye, 
  RefreshCw, 
  Edit, 
  Check, 
  X,
  Truck,
  Building2,
  Tag,
  Wifi,
  PhoneCall,
  Radio,
  FileSpreadsheet
} from 'lucide-react';

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
  // Filtering and Searching states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeaderFilter, setSelectedLeaderFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('');

  // Editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editRisk, setEditRisk] = useState<'Baixo' | 'Médio' | 'Alto' | 'Crítico'>('Baixo');
  const [editCategory, setEditCategory] = useState<'Segurança' | 'Operação' | 'Logística' | 'Rastreamento' | 'Qualidade' | 'Manutenção' | 'Instabilidade / Tecnologia' | 'Outros'>('Outros');
  const [editShiftDate, setEditShiftDate] = useState('');
  const [editLeaderId, setEditLeaderId] = useState('');
  
  // Edit vehicle / instability fields
  const [editPlate, setEditPlate] = useState('');
  const [editCarrier, setEditCarrier] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editTicket, setEditTicket] = useState('');

  // Dropdown options of active shift dates
  const uniqueShiftDates = Array.from(new Set(occurrences.map(o => o.shiftDate)));

  // Perform filter logic
  const filteredOccurrences = occurrences.filter((occ) => {
    const matchesSearch = 
      occ.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      occ.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (occ.plate && occ.plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (occ.carrier && occ.carrier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (occ.unit && occ.unit.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (occ.ticketNumber && occ.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLeader = selectedLeaderFilter ? occ.leaderName === selectedLeaderFilter : true;
    const matchesStatus = selectedStatusFilter ? occ.status === selectedStatusFilter : true;
    const matchesRisk = selectedRiskFilter ? occ.riskLevel === selectedRiskFilter : true;
    const matchesDate = selectedDateFilter ? occ.shiftDate === selectedDateFilter : true;
    const matchesType = selectedTypeFilter 
      ? (selectedTypeFilter === 'instabilidade' ? occ.recordType === 'instabilidade' : occ.recordType !== 'instabilidade')
      : true;

    return matchesSearch && matchesLeader && matchesStatus && matchesRisk && matchesDate && matchesType;
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
    setSelectedTypeFilter('');
  };

  const startEditing = (occ: Occurrence) => {
    setEditingId(occ.id);
    setEditTitle(occ.title);
    setEditDesc(occ.description);
    setEditRisk(occ.riskLevel);
    setEditCategory(occ.category);
    setEditShiftDate(occ.shiftDate);
    setEditPlate(occ.plate || '');
    setEditCarrier(occ.carrier || '');
    setEditUnit(occ.unit || '');
    setEditTicket(occ.ticketNumber || '');
    
    const leaderObj = leaders.find(l => l.name.toLowerCase() === occ.leaderName.toLowerCase());
    setEditLeaderId(leaderObj ? leaderObj.id : (leaders[0]?.id || ''));
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEdit = (occ: Occurrence) => {
    if (!editTitle.trim() || !editDesc.trim() || !editShiftDate.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    const selectedLeader = leaders.find(l => l.id === editLeaderId) || leaders[0];
    const updated: Occurrence = {
      ...occ,
      title: editTitle,
      description: editDesc,
      riskLevel: editRisk,
      category: editCategory,
      shiftDate: editShiftDate,
      leaderId: editLeaderId,
      leaderName: selectedLeader ? selectedLeader.name : occ.leaderName,
      plate: editPlate.trim() ? editPlate.toUpperCase() : undefined,
      carrier: editCarrier.trim() || undefined,
      unit: editUnit.trim() || undefined,
      ticketNumber: editTicket.trim() || undefined
    };
    onEditOccurrence(updated);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Header block */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3 mb-3">
          <div>
            <h2 className="text-sm font-black uppercase text-[#0F172A] tracking-wider flex items-center gap-2">
              <span>Histórico Operacional & Passagem de Plantão</span>
              <span className="text-[10px] bg-[#0F172A] text-white px-2 py-0.5 rounded font-mono">
                {filteredOccurrences.length} registros
              </span>
            </h2>
            <p className="text-[10px] text-[#64748B]">Filtre por placa, transportadora, unidade, chamados de tecnologia ou tipo de risco.</p>
          </div>
          
          {/* Quick Clear */}
          <button
            onClick={handleClearFilters}
            className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Limpar Filtros
          </button>
        </div>

        {/* Input grids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2.5">
          
          {/* Text Search input */}
          <div className="relative md:col-span-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por placa, transportadora, unidade, título..."
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] font-semibold"
            />
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#64748B]" />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] appearance-none font-bold"
            >
              <option value="">Tipo: Todos</option>
              <option value="padrao">🚛 Veículos & Frotas</option>
              <option value="instabilidade">⚡ Instabilidade & Chamados</option>
            </select>
            <Filter className="absolute right-3 top-2.5 w-3 h-3 text-[#64748B] pointer-events-none" />
          </div>

          {/* Leader dropdown Filter */}
          <div className="relative">
            <select
              value={selectedLeaderFilter}
              onChange={(e) => setSelectedLeaderFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] appearance-none font-bold"
            >
              <option value="">Líder: Todos</option>
              {leaders.map(l => (
                <option key={l.id} value={l.name}>{l.name}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-2.5 w-3 h-3 text-[#64748B] pointer-events-none" />
          </div>

          {/* Status dropdown Filter */}
          <div className="relative">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] appearance-none font-bold"
            >
              <option value="">Status: Todos</option>
              <option value="acompanhar">Acompanhar</option>
              <option value="resolvido">Resolvido</option>
              <option value="para conhecimento">Para Conhecimento</option>
            </select>
            <Filter className="absolute right-3 top-2.5 w-3 h-3 text-[#64748B] pointer-events-none" />
          </div>

          {/* Risk level dropdown Filter */}
          <div className="relative">
            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] appearance-none font-bold"
            >
              <option value="">Risco: Todos</option>
              <option value="Baixo">Baixo</option>
              <option value="Médio">Médio</option>
              <option value="Alto">Alto</option>
              <option value="Crítico">Crítico</option>
            </select>
            <Filter className="absolute right-3 top-2.5 w-3 h-3 text-[#64748B] pointer-events-none" />
          </div>

        </div>
      </div>

      {/* Main List Layout */}
      <div className="space-y-3">
        {filteredOccurrences.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center text-[#64748B] text-xs space-y-2">
            <p className="font-bold">Nenhum registro encontrado correspondente aos filtros selecionados.</p>
            <p className="text-[10px]">Utilize a aba "Novo Registro" para cadastrar frotas, ocorrências ou instabilidades de sistemas.</p>
          </div>
        ) : (
          filteredOccurrences.map((occ) => {
            const isEditing = editingId === occ.id;
            const isInstability = occ.recordType === 'instabilidade';
            
            return (
              <div 
                key={occ.id} 
                className={`bg-white rounded-xl border ${
                  isEditing 
                    ? 'border-[#2563EB] ring-1 ring-[#2563EB]/20' 
                    : isInstability 
                      ? 'border-blue-300 hover:border-blue-400' 
                      : 'border-[#E2E8F0] hover:border-[#2563EB]/60'
                } shadow-sm overflow-hidden transition-all duration-150`}
              >
                {/* Card Header (When Not Editing) */}
                {!isEditing ? (
                  <div className={`px-4 py-2.5 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 ${
                    isInstability ? 'bg-blue-50/50' : 'bg-[#F8FAFC]'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[10px] text-[#0F172A] bg-[#E2E8F0] px-2.5 py-0.5 rounded">
                        {occ.shiftDate}
                      </span>
                      
                      <div className="w-1.5 h-1.5 rounded-full bg-[#E2E8F0]" />
                      
                      {(() => {
                        const matchedLeader = leaders.find(l => l.name.toLowerCase() === occ.leaderName.toLowerCase() || l.id === occ.leaderId);
                        return (
                          <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-bold">
                            {matchedLeader?.avatar ? (
                              <img 
                                src={matchedLeader.avatar} 
                                alt={occ.leaderName} 
                                referrerPolicy="no-referrer"
                                className="w-4 h-4 rounded-full object-cover border border-[#CBD5E1]"
                              />
                            ) : null}
                            <span>Líder: <span className="text-[#0F172A] font-extrabold">{occ.leaderName}</span></span>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Type Badge */}
                      {isInstability ? (
                        <span className="px-2 py-0.5 rounded font-black text-[9px] uppercase bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1">
                          <Wifi className="w-3 h-3 text-[#2563EB]" /> Instabilidade
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase text-[#64748B] tracking-wider">
                          {occ.category}
                        </span>
                      )}

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
                ) : (
                  // Card Header (When Editing)
                  <div className="bg-[#F8FAFC] px-4 py-2.5 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black text-[#2563EB] uppercase">Editando Registro</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => saveEdit(occ)}
                        className="flex items-center gap-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded cursor-pointer"
                        title="Salvar Alterações"
                      >
                        <Check className="w-3.5 h-3.5" /> Salvar
                      </button>
                      <button 
                        onClick={cancelEditing}
                        className="flex items-center gap-1 text-[10px] font-bold text-[#0F172A] bg-[#E2E8F0] hover:bg-slate-300 px-2.5 py-1 rounded cursor-pointer"
                        title="Cancelar Edição"
                      >
                        <X className="w-3.5 h-3.5" /> Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Card Content (Standard View vs Editing View) */}
                <div className="p-4 space-y-3">
                  {!isEditing ? (
                    <>
                      {/* Transport / Vehicle Badges Row (Placa, Transportadora, Unidade) */}
                      {(occ.plate || occ.carrier || occ.unit || occ.ticketNumber || occ.instabilitySystem) && (
                        <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
                          {occ.plate && (
                            <div className="flex items-center gap-1 bg-[#0F172A] text-white px-2 py-0.5 rounded font-mono font-black text-[11px] shadow-sm">
                              <Truck className="w-3 h-3 text-[#2563EB]" />
                              <span>{occ.plate}</span>
                            </div>
                          )}

                          {occ.carrier && (
                            <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-[#E2E8F0] text-[#0F172A] font-bold text-[11px]">
                              <Building2 className="w-3 h-3 text-[#64748B]" />
                              <span>{occ.carrier}</span>
                            </div>
                          )}

                          {occ.unit && (
                            <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-[#E2E8F0] text-[#334155] font-semibold text-[11px]">
                              <Tag className="w-3 h-3 text-[#64748B]" />
                              <span>{occ.unit}</span>
                            </div>
                          )}

                          {occ.ticketNumber && (
                            <div className="flex items-center gap-1 bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded font-bold text-[10px]">
                              <span>Chamado: {occ.ticketNumber}</span>
                            </div>
                          )}

                          {occ.instabilitySystem && (
                            <div className="flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-bold text-[10px]">
                              <span>Sistema: {occ.instabilitySystem}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-1">
                        <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wide flex items-center gap-1.5">
                          <span>{occ.title}</span>
                        </h3>
                        <p className="text-xs text-[#334155] leading-relaxed whitespace-pre-wrap">{occ.description}</p>
                      </div>

                      {/* Card Controls Footer */}
                      <div className="pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-2 text-xs">
                        
                        {/* Custom status selector dropdown */}
                        <div className="flex items-center gap-2 bg-[#F1F5F9] px-2.5 py-1 rounded border border-[#E2E8F0]">
                          <span className="text-[#64748B] font-bold text-[10px]">Status:</span>
                          <select
                            value={occ.status}
                            onChange={(e) => handleStatusChange(occ.id, e.target.value as OccurrenceStatus)}
                            className="bg-white border border-[#E2E8F0] rounded px-1.5 py-0.5 text-[10px] font-black text-[#0F172A] focus:outline-none cursor-pointer"
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
                          <span className="text-[10px] text-[#64748B]">
                            Registrado às {new Date(occ.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                          </span>

                          <div className="h-4 w-[1px] bg-[#E2E8F0]" />

                          {/* Edit button */}
                          <button
                            onClick={() => startEditing(occ)}
                            className="p-1 text-slate-500 hover:text-[#0F172A] hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="Editar Registro"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja apagar permanentemente a ocorrência "${occ.title}" do histórico?`)) {
                                onDeleteOccurrence(occ.id);
                              }
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Excluir Ocorrência"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    // EDITING MODE FORM INLINE
                    <div className="space-y-3">
                      
                      {/* Grid settings */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Title input */}
                        <div className="md:col-span-2 space-y-1">
                          <label className="block text-[9px] font-black uppercase text-[#0F172A]">Título da Ocorrência</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded p-1.5 text-xs text-[#0F172A] font-bold focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                            placeholder="Ex: Problema mecânico ou elétrico"
                          />
                        </div>

                        {/* Shift Date input */}
                        <div className="space-y-1">
                          <label className="block text-[9px] font-black uppercase text-[#0F172A]">Plantão / Data</label>
                          <input
                            type="text"
                            value={editShiftDate}
                            onChange={(e) => setEditShiftDate(e.target.value)}
                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded p-1.5 text-xs text-[#0F172A] font-bold focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                            placeholder="Ex: Plantão 15/08/2026"
                          />
                        </div>
                      </div>

                      {/* Placa, Transportadora, Unidade Edit Row */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0]">
                        <div className="space-y-0.5">
                          <label className="block text-[9px] font-black uppercase text-[#0F172A]">Placa</label>
                          <input
                            type="text"
                            value={editPlate}
                            onChange={(e) => setEditPlate(e.target.value.toUpperCase())}
                            className="w-full bg-white border border-[#E2E8F0] rounded p-1 text-xs font-mono font-bold"
                            placeholder="ABC-1D23"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="block text-[9px] font-black uppercase text-[#0F172A]">Transportadora</label>
                          <input
                            type="text"
                            value={editCarrier}
                            onChange={(e) => setEditCarrier(e.target.value)}
                            className="w-full bg-white border border-[#E2E8F0] rounded p-1 text-xs font-semibold"
                            placeholder="JSL / Patrus..."
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="block text-[9px] font-black uppercase text-[#0F172A]">Unidade</label>
                          <input
                            type="text"
                            value={editUnit}
                            onChange={(e) => setEditUnit(e.target.value)}
                            className="w-full bg-white border border-[#E2E8F0] rounded p-1 text-xs font-semibold"
                            placeholder="CD Varginha..."
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="block text-[9px] font-black uppercase text-[#0F172A]">Nº Chamado</label>
                          <input
                            type="text"
                            value={editTicket}
                            onChange={(e) => setEditTicket(e.target.value)}
                            className="w-full bg-white border border-[#E2E8F0] rounded p-1 text-xs font-semibold"
                            placeholder="INC-1234"
                          />
                        </div>
                      </div>

                      {/* Dropdown settings row */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Leader selector */}
                        <div className="space-y-1">
                          <label className="block text-[9px] font-black uppercase text-[#0F172A]">Líder Registrante</label>
                          <select
                            value={editLeaderId}
                            onChange={(e) => setEditLeaderId(e.target.value)}
                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded p-1.5 text-xs text-[#0F172A] font-bold focus:outline-none"
                          >
                            {leaders.map(l => (
                              <option key={l.id} value={l.id}>
                                {l.name} ({l.role}{l.shift ? ` - ${l.shift}` : ''})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Risk Level Selector */}
                        <div className="space-y-1">
                          <label className="block text-[9px] font-black uppercase text-[#0F172A]">Nível de Risco</label>
                          <select
                            value={editRisk}
                            onChange={(e) => setEditRisk(e.target.value as any)}
                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded p-1.5 text-xs text-[#0F172A] font-bold focus:outline-none"
                          >
                            <option value="Baixo">Baixo</option>
                            <option value="Médio">Médio</option>
                            <option value="Alto">Alto</option>
                            <option value="Crítico">Crítico</option>
                          </select>
                        </div>

                        {/* Category Selector */}
                        <div className="space-y-1">
                          <label className="block text-[9px] font-black uppercase text-[#0F172A]">Categoria</label>
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value as any)}
                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded p-1.5 text-xs text-[#0F172A] font-bold focus:outline-none"
                          >
                            <option value="Logística">Logística</option>
                            <option value="Rastreamento">Rastreamento</option>
                            <option value="Segurança">Segurança</option>
                            <option value="Operação">Operação</option>
                            <option value="Qualidade">Qualidade</option>
                            <option value="Manutenção">Manutenção</option>
                            <option value="Instabilidade / Tecnologia">Instabilidade / Tecnologia</option>
                            <option value="Outros">Outros</option>
                          </select>
                        </div>
                      </div>

                      {/* Description textarea */}
                      <div className="space-y-1">
                        <label className="block text-[9px] font-black uppercase text-[#0F172A]">Descrição Detalhada</label>
                        <textarea
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded p-2 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] leading-relaxed font-medium"
                          rows={4}
                          placeholder="Detalhes completos sobre o veículo, lacre, placas e valores de nota fiscal..."
                        />
                      </div>

                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
