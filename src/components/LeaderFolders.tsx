import React, { useState } from 'react';
import { Leader, Occurrence, EmployeeLog } from '../types';
import { Folder, ArrowLeft, Shield, Calendar, Trash2, Tag, BadgeInfo } from 'lucide-react';
import { LeaderFolder } from './ThreeDIcon';

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

  const handleBack = () => {
    setSelectedLeaderId(null);
  };

  const currentLeader = leaders.find(l => l.id === selectedLeaderId);

  // Filter occurrences and logs by leader
  const filteredOccurrences = occurrences.filter(
    o => o.leaderName.toLowerCase() === currentLeader?.name.toLowerCase() || o.leaderId === currentLeader?.id
  );
  
  const filteredLogs = employeeLogs.filter(
    l => l.leaderName.toLowerCase() === currentLeader?.name.toLowerCase()
  );

  const colors: Array<'blue' | 'coffee' | 'amber' | 'green' | 'purple'> = ['blue', 'coffee', 'amber', 'green', 'purple'];

  return (
    <div className="space-y-6">
      {!selectedLeaderId ? (
        // Grid View of All Folders
        <div>
          <div className="mb-4">
            <h2 className="text-sm font-black uppercase text-[#2C1810] tracking-wider">Diretório de Líderes (Pastas 3D)</h2>
            <p className="text-xs text-[#8C7B70]">Clique na pasta de um líder para visualizar todas as suas atividades e ocorrências individuais.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {leaders.map((leader, index) => {
              const leaderOccs = occurrences.filter(
                o => o.leaderName.toLowerCase() === leader.name.toLowerCase() || o.leaderId === leader.id
              ).length;
              
              const leaderLogs = employeeLogs.filter(
                l => l.leaderName.toLowerCase() === leader.name.toLowerCase()
              ).length;

              return (
                <LeaderFolder
                  key={leader.id}
                  name={leader.name}
                  role={leader.role}
                  occurrencesCount={leaderOccs}
                  employeesCount={leaderLogs}
                  onClick={() => setSelectedLeaderId(leader.id)}
                  color={colors[index % colors.length] as 'blue' | 'coffee' | 'amber' | 'green' | 'purple'}
                />
              );
            })}
          </div>
        </div>
      ) : (
        // Detailed Folder Interior view
        <div className="bg-white rounded-lg border border-[#E0D8D0] shadow-sm p-5">
          {/* Detailed View Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F4F1EE] pb-4 mb-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-xs font-bold uppercase text-[#8C7B70] hover:text-[#2C1810] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Diretório
            </button>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => {
                    if (confirm(`Tem certeza que deseja remover o líder ${currentLeader?.name}?`)) {
                      onDeleteLeader(currentLeader!.id);
                      setSelectedLeaderId(null);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Excluir Pasta de Líder
                </button>
              )}
            </div>
          </div>

          {/* Folder Inner profile badge */}
          <div className="bg-gradient-to-r from-[#2C1810] to-[#3D261C] rounded-lg p-5 text-white mb-5 shadow flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#C8102E]/20 text-[#C8102E] border border-[#C8102E]/30 bg-white flex items-center justify-center font-black text-xl uppercase shadow-inner">
              {currentLeader?.name.charAt(0)}
            </div>
            <div>
              <span className="text-[9px] tracking-widest text-[#E0D8D0] font-black uppercase">Ficha Individual do Líder</span>
              <h3 className="text-base font-black text-white">{currentLeader?.name}</h3>
              <p className="text-[10px] text-slate-300 mt-0.5">{currentLeader?.role} • Cadastrado em {currentLeader?.createdAt}</p>
            </div>
          </div>

          {/* Folder Activity Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Occurrences registered */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#F4F1EE] pb-1.5">
                <h4 className="text-xs font-black uppercase text-[#2C1810] flex items-center gap-1">
                  <Folder className="w-4 h-4 text-[#C8102E]" /> Ocorrências Registradas ({filteredOccurrences.length})
                </h4>
              </div>

              {filteredOccurrences.length === 0 ? (
                <div className="p-6 text-center text-[#8C7B70] text-xs bg-[#FAF9F7] rounded-lg border border-dashed border-[#E0D8D0]">
                  Nenhuma ocorrência registrada por este líder.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {filteredOccurrences.map(occ => (
                    <div key={occ.id} className="bg-[#FAF9F7] border border-[#E0D8D0] rounded p-3 hover:border-[#C8102E]/40 transition-all">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-[10px] text-[#8C7B70] font-bold flex items-center gap-0.5">
                          <Calendar className="w-3.5 h-3.5 text-[#C8102E]" />
                          {occ.shiftDate}
                        </span>
                        
                        {/* Custom status selector directly here inside leader detailed view */}
                        <div className="flex items-center gap-1.5">
                          <select
                            value={occ.status}
                            onChange={(e) => onUpdateOccurrenceStatus(occ.id, e.target.value as any)}
                            className="text-[9px] font-bold bg-white border border-[#E0D8D0] rounded px-1 py-0.5 focus:outline-none"
                          >
                            <option value="acompanhar">Acompanhar</option>
                            <option value="resolvido">Resolvido</option>
                            <option value="para conhecimento">Cientificado</option>
                          </select>
                          
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                            occ.riskLevel === 'Crítico' ? 'bg-red-50 text-red-700' :
                            occ.riskLevel === 'Alto' ? 'bg-orange-50 text-orange-700' :
                            occ.riskLevel === 'Médio' ? 'bg-amber-50 text-amber-700' :
                            'bg-emerald-50 text-emerald-700'
                          }`}>
                            {occ.riskLevel}
                          </span>
                        </div>
                      </div>
                      
                      <h5 className="font-bold text-xs text-[#2C1810] mb-0.5">{occ.title}</h5>
                      <p className="text-xs text-[#5D4037] line-clamp-3 leading-relaxed">{occ.description}</p>
                      
                      <div className="mt-1.5 pt-1.5 border-t border-[#E0D8D0]/40 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-[#8C7B70]" />
                        <span className="text-[9px] text-[#8C7B70] font-medium">Categoria: {occ.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Employee notes and updates */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#F4F1EE] pb-1.5">
                <h4 className="text-xs font-black uppercase text-[#2C1810] flex items-center gap-1">
                  <BadgeInfo className="w-4 h-4 text-[#C8102E]" /> Histórico de Colaboradores Avaliados ({filteredLogs.length})
                </h4>
              </div>

              {filteredLogs.length === 0 ? (
                <div className="p-6 text-center text-[#8C7B70] text-xs bg-[#FAF9F7] rounded-lg border border-dashed border-[#E0D8D0]">
                  Nenhum colaborador avaliado por este líder.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {filteredLogs.map(log => (
                    <div key={log.id} className="bg-[#FAF9F7] border border-[#E0D8D0] rounded p-3">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-xs text-[#2C1810]">{log.employeeName}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                          log.type === 'otimo_desempenho' || log.type === 'ponto_positivo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          log.type === 'atestado' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {log.type.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <p className="text-xs text-[#5D4037] leading-normal">{log.description}</p>
                      
                      <div className="text-[9px] text-[#8C7B70] mt-1.5 flex items-center justify-between">
                        <span>Data: {log.date}</span>
                        <span>Líder: {log.leaderName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
