import React, { useState } from 'react';
import { Leader, Occurrence, EmployeeLog } from '../types';
import { Folder, ArrowLeft, Shield, Calendar, Trash2, Tag, BadgeInfo, Building2, Users, Coffee, CheckCircle2 } from 'lucide-react';

interface LeaderFoldersProps {
  leaders: Leader[];
  occurrences: Occurrence[];
  employeeLogs: EmployeeLog[];
  isAdmin: boolean;
  onDeleteLeader: (id: string) => void;
  onUpdateOccurrenceStatus: (id: string, status: any) => void;
}

export default function LeaderFolders({
  leaders,
  occurrences,
  employeeLogs,
  isAdmin,
  onDeleteLeader,
  onUpdateOccurrenceStatus
}: LeaderFoldersProps) {
  const [selectedLeaderId, setSelectedLeaderId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'Todos' | 'Ativos' | 'Em atenção' | 'Críticos'>('Todos');

  const handleBack = () => setSelectedLeaderId(null);

  const currentLeader = leaders.find(l => l.id === selectedLeaderId);

  // Compute stats and status for each leader
  const getLeaderStats = (leader: Leader) => {
    const occs = occurrences.filter(o => o.leaderId === leader.id || o.leaderName === leader.name);
    const criticalOccs = occs.filter(o => o.riskLevel === 'Crítico');
    const logs = employeeLogs.filter(l => l.leaderName === leader.name);
    
    let status: 'Ativo' | 'Em atenção' | 'Crítico' = 'Ativo';
    if (criticalOccs.length > 2) status = 'Crítico';
    else if (occs.length > 5 || criticalOccs.length > 0) status = 'Em atenção';

    return { occurrencesCount: occs.length, employeesCount: logs.length, status };
  };

  const filteredLeaders = leaders.filter(l => {
    if (filter === 'Todos') return true;
    const { status } = getLeaderStats(l);
    if (filter === 'Ativos') return status === 'Ativo';
    if (filter === 'Em atenção') return status === 'Em atenção';
    if (filter === 'Críticos') return status === 'Crítico';
    return true;
  });

  if (selectedLeaderId && currentLeader) {
    const leaderOccs = occurrences.filter(o => o.leaderName === currentLeader.name || o.leaderId === currentLeader.id);
    return (
      <div className="bg-[#121620] rounded-3xl border border-[#222B3B] shadow-2xl p-6 sm:p-8 text-[#E2E8F0] max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E2838] pb-6 mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-xs font-bold text-[#D4A373] hover:text-[#E2B170] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Diretório de Líderes
          </button>

          <span className="text-[11px] font-bold text-slate-400 bg-[#1A2230] px-3 py-1 rounded-full border border-[#2A374C]">
            ID Líder: #{currentLeader.id}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 bg-[#161D27] p-6 rounded-2xl border border-[#253247]">
          <div className="relative">
            <img 
              src={currentLeader.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentLeader.name)}&background=0F172A&color=fff`} 
              className="w-24 h-24 rounded-full border-2 border-[#D4A373] shadow-lg object-cover" 
              alt={currentLeader.name} 
            />
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#121620]" />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-black text-white font-serif">{currentLeader.name}</h2>
              <span className="text-[10px] bg-[#D4A373]/20 text-[#E2B170] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Liderança Ativa
              </span>
            </div>

            <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs font-medium text-slate-400 mt-2">
              <span className="flex items-center gap-1.5 text-slate-300">
                <BadgeInfo className="w-4 h-4 text-[#D4A373]" /> {currentLeader.role}
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Building2 className="w-4 h-4 text-[#D4A373]" /> Matriz Fortaleza - CE
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Users className="w-4 h-4 text-[#D4A373]" /> Turno: {currentLeader.shift || 'Integral'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#E2B170] uppercase tracking-wider font-serif">
            Ocorrências Vinculadas ({leaderOccs.length})
          </h3>
        </div>

        <div className="space-y-3">
          {leaderOccs.length === 0 ? (
            <div className="p-8 text-center bg-[#161D27] rounded-2xl border border-[#222B3B] text-slate-400 text-xs">
              Nenhuma ocorrência registrada por este líder no período selecionado.
            </div>
          ) : (
            leaderOccs.map(occ => (
              <div key={occ.id} className="p-4 border border-[#222B3B] rounded-2xl bg-[#161D27] hover:border-[#D4A373]/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] bg-[#1F293D] text-[#D4A373] px-2 py-0.5 rounded font-bold uppercase">
                      {occ.category}
                    </span>
                    <p className="font-bold text-white text-xs truncate">{occ.title}</p>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{occ.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    occ.riskLevel === 'Crítico' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                    occ.riskLevel === 'Alto' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                    occ.riskLevel === 'Médio' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    {occ.riskLevel}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(occ.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#E2E8F0]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#D4A373]">
            DIRETÓRIO OPERACIONAL
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white font-serif">Pastas dos Líderes & Plantão</h2>
          <p className="text-xs text-slate-400">Gerenciamento de equipes, custódia e status de segurança por liderança.</p>
        </div>
        
        <div className="flex bg-[#121620] rounded-xl border border-[#222B3B] p-1 shadow-sm w-fit">
          {['Todos', 'Ativos', 'Em atenção', 'Críticos'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === f 
                  ? 'bg-gradient-to-r from-[#C68A4C] to-[#E2B170] text-black shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-[#1A2230]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Leaders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredLeaders.map(leader => {
          const stats = getLeaderStats(leader);
          return (
            <button
              key={leader.id}
              onClick={() => setSelectedLeaderId(leader.id)}
              className="bg-[#121620] hover:bg-[#161C27] rounded-3xl p-6 text-left border border-[#222B3B] hover:border-[#D4A373]/50 shadow-xl transition-all group flex flex-col items-center cursor-pointer relative overflow-hidden"
            >
              <div className="relative mb-4">
                <img 
                  src={leader.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name)}&background=0F172A&color=fff`} 
                  alt={leader.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#D4A373] shadow-md group-hover:scale-105 transition-transform"
                />
                <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#121620] ${
                  stats.status === 'Crítico' ? 'bg-red-500' :
                  stats.status === 'Em atenção' ? 'bg-amber-500' :
                  'bg-emerald-500'
                }`}></span>
              </div>
              
              <h3 className="text-sm font-black text-white group-hover:text-[#E2B170] transition-colors mb-0.5 text-center">{leader.name}</h3>
              <p className="text-[10px] font-bold text-[#D4A373] uppercase tracking-wider mb-4 text-center">{leader.role}</p>

              <div className="w-full grid grid-cols-2 gap-2 text-center border-t border-[#1E2838] pt-4">
                <div className="bg-[#161D27] p-2 rounded-xl border border-[#222B3B]">
                  <p className="text-base font-black text-white">{stats.occurrencesCount}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Ocorrências</p>
                </div>
                <div className="bg-[#161D27] p-2 rounded-xl border border-[#222B3B]">
                  <p className="text-base font-black text-white">{stats.employeesCount}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Membros</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
