import React, { useState } from 'react';
import { Leader, Occurrence, EmployeeLog } from '../types';
import { Folder, ArrowLeft, Shield, Calendar, Trash2, Tag, BadgeInfo, Building2, Users } from 'lucide-react';

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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#1E40AF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Diretório
          </button>
        </div>

        <div className="flex items-start gap-6 mb-8">
          <img src={currentLeader.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentLeader.name)}&background=0F172A&color=fff`} className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover" alt="" />
          <div>
            <h2 className="text-2xl font-black text-[#0F172A] mb-1">{currentLeader.name}</h2>
            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-1.5"><BadgeInfo className="w-4 h-4" /> {currentLeader.role}</span>
              <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> Matriz Fortaleza</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {currentLeader.shift || 'Integral'}</span>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-[#0F172A] mb-4">Ocorrências Registradas</h3>
        <div className="space-y-4">
          {leaderOccs.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma ocorrência registrada por este líder.</p>
          ) : (
            leaderOccs.map(occ => (
              <div key={occ.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex gap-4">
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm mb-1">{occ.category} - {occ.subcategory}</p>
                  <p className="text-xs text-slate-600 line-clamp-2">{occ.description}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    occ.riskLevel === 'Crítico' ? 'bg-red-100 text-red-700' :
                    occ.riskLevel === 'Alto' ? 'bg-orange-100 text-orange-700' :
                    occ.riskLevel === 'Moderado' ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {occ.riskLevel}
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#0F172A]">Pastas dos Líderes</h2>
          <p className="text-sm text-slate-500">Gerenciamento de equipes e status operacional por liderança.</p>
        </div>
        
        <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm w-fit">
          {['Todos', 'Ativos', 'Em atenção', 'Críticos'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filter === f 
                  ? 'bg-slate-100 text-[#0F172A] shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredLeaders.map(leader => {
          const stats = getLeaderStats(leader);
          return (
            <button
              key={leader.id}
              onClick={() => setSelectedLeaderId(leader.id)}
              className="bg-white rounded-2xl p-6 text-left border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col items-center"
            >
              <div className="relative mb-4">
                <img 
                  src={leader.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name)}&background=0F172A&color=fff`} 
                  alt={leader.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 shadow-sm group-hover:scale-105 transition-transform"
                />
                <span className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white ${
                  stats.status === 'Crítico' ? 'bg-red-500' :
                  stats.status === 'Em atenção' ? 'bg-amber-500' :
                  'bg-emerald-500'
                }`}></span>
              </div>
              
              <h3 className="text-[15px] font-black text-[#0F172A] mb-1">{leader.name}</h3>
              <p className="text-[11px] font-bold text-[#1E40AF] uppercase tracking-wider mb-4">{leader.role}</p>

              <div className="w-full grid grid-cols-2 gap-2 text-center border-t border-slate-100 pt-4">
                <div>
                  <p className="text-lg font-black text-slate-700">{stats.occurrencesCount}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Ocorrências</p>
                </div>
                <div>
                  <p className="text-lg font-black text-slate-700">{stats.employeesCount}</p>
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
