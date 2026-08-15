import React, { useState } from 'react';
import { Employee, EmployeeLog, EmployeeLogType, Leader } from '../types';
import { 
  Users, 
  ThumbsUp, 
  ThumbsDown, 
  FileCheck2, 
  Plus, 
  UserPlus, 
  Trash2, 
  AlertCircle,
  Award,
  Clock,
  Briefcase
} from 'lucide-react';
import ThreeDIcon from './ThreeDIcon';

interface EmployeeListProps {
  employees: Employee[];
  employeeLogs: EmployeeLog[];
  leaders: Leader[];
  selectedLeaderId: string;
  isAdmin: boolean;
  onAddEmployee: (name: string, role: string, department: string) => void;
  onAddEmployeeLog: (log: Omit<EmployeeLog, 'id' | 'createdAt'>) => void;
  onDeleteLog: (id: string) => void;
  onDeleteEmployee: (id: string) => void;
}

export default function EmployeeList({
  employees,
  employeeLogs,
  leaders,
  selectedLeaderId,
  isAdmin,
  onAddEmployee,
  onAddEmployeeLog,
  onDeleteLog,
  onDeleteEmployee
}: EmployeeListProps) {
  
  // Tab within Employee: "directory" vs "logs"
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'logs'>('directory');
  
  // Selected Employee to register a log for
  const [selectedEmpForLog, setSelectedEmpForLog] = useState<Employee | null>(null);

  // New Employee fields
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('Logística');

  // New Employee Log fields
  const [logType, setLogType] = useState<EmployeeLogType>('ponto_positivo');
  const [logDesc, setLogDesc] = useState('');

  const currentLeader = leaders.find(l => l.id === selectedLeaderId) || leaders[0];

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmpName.trim() && newEmpRole.trim()) {
      onAddEmployee(newEmpName.trim(), newEmpRole.trim(), newEmpDept);
      setNewEmpName('');
      setNewEmpRole('');
    }
  };

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpForLog) return;
    if (!logDesc.trim()) {
      alert('Por favor, adicione uma descrição/justificativa!');
      return;
    }

    onAddEmployeeLog({
      employeeId: selectedEmpForLog.id,
      employeeName: selectedEmpForLog.name,
      type: logType,
      description: logDesc.trim(),
      date: new Date().toLocaleDateString('pt-BR'),
      leaderName: currentLeader.name
    });

    // Reset log inputs
    setLogDesc('');
    setSelectedEmpForLog(null);
  };

  const getLogTypeBadge = (type: EmployeeLogType) => {
    switch(type) {
      case 'ponto_positivo':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> Ponto Positivo</span>;
      case 'ponto_negativo':
        return <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1"><ThumbsDown className="w-3 h-3" /> Ponto Negativo</span>;
      case 'atestado':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1">Atestado Médico</span>;
      case 'falta':
        return <span className="bg-red-100 text-red-800 border border-red-200 text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1">Falta Sem Justificativa</span>;
      case 'saiu_mais_cedo':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1">Saída Antecipada</span>;
      case 'erro_cometido':
        return <span className="bg-orange-100 text-orange-800 border border-orange-200 text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1">Erro de Operação</span>;
      case 'otimo_desempenho':
        return <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1"><Award className="w-3 h-3 text-amber-300" /> Ótimo Desempenho</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-[#2C1810] text-white p-4 rounded-lg shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black uppercase text-[#C8102E] tracking-wider">Acompanhamento de Colaboradores</h2>
          <p className="text-xs text-slate-300">Monitore pontos positivos, negativos, atestados, faltas e saídas de plantão.</p>
        </div>
        <ThreeDIcon icon={Users} color="coffee" size="md" />
      </div>

      {/* Sub tabs navigation */}
      <div className="flex gap-2 border-b border-[#E0D8D0] pb-2">
        <button
          onClick={() => { setActiveSubTab('directory'); setSelectedEmpForLog(null); }}
          className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
            activeSubTab === 'directory' 
              ? 'bg-[#2C1810] text-white' 
              : 'text-[#8C7B70] hover:bg-[#F4F1EE]'
          }`}
        >
          Quadro de Funcionários
        </button>
        <button
          onClick={() => { setActiveSubTab('logs'); setSelectedEmpForLog(null); }}
          className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
            activeSubTab === 'logs' 
              ? 'bg-[#2C1810] text-white' 
              : 'text-[#8C7B70] hover:bg-[#F4F1EE]'
          }`}
        >
          Histórico de Avaliações / Ocorrências de Pessoal
        </button>
      </div>

      {activeSubTab === 'directory' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Main List Column */}
          <div className="lg:col-span-2 space-y-3">
            
            <div className="bg-white rounded-lg border border-[#E0D8D0] overflow-hidden shadow-sm">
              <div className="bg-[#FAF9F7] p-3 border-b border-[#E0D8D0] flex items-center justify-between">
                <span className="text-xs font-black uppercase text-[#2C1810] tracking-wider">Lista de Colaboradores de Turno</span>
                <span className="text-[10px] font-black text-[#2C1810] bg-[#E0D8D0]/50 px-2 py-0.5 rounded-full">{employees.length} Ativos</span>
              </div>

              <div className="divide-y divide-[#E0D8D0]">
                {employees.map(emp => (
                  <div key={emp.id} className="p-3 flex items-center justify-between hover:bg-[#F4F1EE]/30 transition-colors">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-[#2C1810] text-xs">{emp.name}</h4>
                      <p className="text-[10px] text-[#8C7B70] font-semibold">{emp.role} • <span className="font-bold text-[#5D4037]">{emp.department}</span></p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Points Counter Indicators */}
                      <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                        <ThumbsUp className="w-3 h-3" />
                        <span className="font-black">{emp.positives}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-100 px-1.5 py-0.5 rounded text-[10px]">
                        <ThumbsDown className="w-3 h-3" />
                        <span className="font-black">{emp.negatives}</span>
                      </div>

                      {/* Log Action Trigger */}
                      <button
                        onClick={() => setSelectedEmpForLog(emp)}
                        className="px-2.5 py-1 bg-[#C8102E] text-white font-black text-[9px] uppercase rounded hover:bg-[#a80c24] transition-colors cursor-pointer"
                      >
                        Avaliar
                      </button>

                      {/* Admin delete employee */}
                      {isAdmin && (
                        <button
                          onClick={() => {
                            if (confirm(`Remover o colaborador ${emp.name} do sistema de turno?`)) {
                              onDeleteEmployee(emp.id);
                            }
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remover Funcionário"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Side Forms Column */}
          <div className="space-y-4">
            
            {/* Dynamic Modal-like Form to Assess the selected employee */}
            {selectedEmpForLog ? (
              <div className="bg-white rounded-lg border-2 border-[#C8102E] p-4 shadow-md space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#F4F1EE]">
                  <div>
                    <span className="text-[9px] text-[#C8102E] font-black uppercase">Registrar Avaliação</span>
                    <h3 className="text-xs font-black text-[#2C1810] truncate max-w-[150px]">{selectedEmpForLog.name}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedEmpForLog(null)}
                    className="text-[#8C7B70] hover:text-[#2C1810] font-bold text-[10px]"
                  >
                    Fechar [x]
                  </button>
                </div>

                <form onSubmit={handleCreateLog} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#2C1810] mb-0.5">Ocorrência / Desempenho</label>
                    <select
                      value={logType}
                      onChange={(e) => setLogType(e.target.value as EmployeeLogType)}
                      className="w-full bg-[#F4F1EE] border border-[#E0D8D0] rounded px-2.5 py-1.5 text-xs font-bold text-[#2C1810] focus:outline-none"
                    >
                      <option value="ponto_positivo">👍 Ponto Positivo (+1 ponto)</option>
                      <option value="otimo_desempenho">⭐ Ótimo Desempenho (+2 pontos)</option>
                      <option value="ponto_negativo">👎 Ponto Negativo (-1 ponto)</option>
                      <option value="atestado">🏥 Atestado Médico</option>
                      <option value="falta">❌ Falta Sem Justificativa (-2 pontos)</option>
                      <option value="saiu_mais_cedo">🚶 Saída Antecipada</option>
                      <option value="erro_cometido">⚠ Erro de Operação / Risco</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#2C1810] mb-0.5">Justificativa / Descrição Manual</label>
                    <textarea
                      value={logDesc}
                      onChange={(e) => setLogDesc(e.target.value)}
                      placeholder="Descreva o motivo de forma detalhada..."
                      rows={3}
                      className="w-full bg-[#F4F1EE] border border-[#E0D8D0] rounded p-2 text-xs focus:outline-none leading-relaxed text-[#2C1810]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#C8102E] hover:bg-[#a80c24] text-white font-black text-xs uppercase py-2 rounded shadow flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" /> Registrar Avaliação
                  </button>
                </form>
              </div>
            ) : (
              // Add New Employee form
              <div className="bg-white rounded-lg border border-[#E0D8D0] p-4 shadow-sm space-y-3">
                <div className="pb-1.5 border-b border-[#F4F1EE] flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#C8102E]" />
                  <h3 className="text-xs font-black text-[#2C1810] uppercase tracking-wider">Cadastrar Colaborador</h3>
                </div>

                <form onSubmit={handleCreateEmployee} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#2C1810] mb-0.5">Nome Completo</label>
                    <input
                      type="text"
                      value={newEmpName}
                      onChange={(e) => setNewEmpName(e.target.value)}
                      placeholder="Ex: Carlos Roberto"
                      className="w-full bg-[#F4F1EE] border border-[#E0D8D0] rounded px-2.5 py-1.5 text-xs focus:outline-none text-[#2C1810]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#2C1810] mb-0.5">Cargo / Função</label>
                    <input
                      type="text"
                      value={newEmpRole}
                      onChange={(e) => setNewEmpRole(e.target.value)}
                      placeholder="Ex: Motorista de Rodotrem"
                      className="w-full bg-[#F4F1EE] border border-[#E0D8D0] rounded px-2.5 py-1.5 text-xs focus:outline-none text-[#2C1810]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#2C1810] mb-0.5">Departamento</label>
                    <select
                      value={newEmpDept}
                      onChange={(e) => setNewEmpDept(e.target.value)}
                      className="w-full bg-[#F4F1EE] border border-[#E0D8D0] rounded px-2.5 py-1.5 text-xs font-bold text-[#2C1810] focus:outline-none"
                    >
                      <option value="Logística">Logística (Frotas)</option>
                      <option value="Gerenciamento de Riscos">Central de Monitoramento</option>
                      <option value="Operação">Operação</option>
                      <option value="Manutenção">Manutenção Preventiva</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#2C1810] hover:bg-[#3D261C] text-white font-black text-xs uppercase py-2 rounded flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Confirmar Cadastro
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>
      ) : (
        // Feed logs section
        <div className="bg-white rounded-lg border border-[#E0D8D0] p-4 shadow-sm space-y-3">
          <div className="pb-1.5 border-b border-[#F4F1EE]">
            <h3 className="text-xs font-black text-[#2C1810] uppercase tracking-wider">Histórico Geral de Avaliações de Funcionários</h3>
            <p className="text-[10px] text-[#8C7B70]">Todos os apontamentos de pontos positivos/negativos, atestados e infrações cometidas.</p>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {employeeLogs.length === 0 ? (
              <div className="text-center text-[#8C7B70] text-xs py-8">
                Nenhum apontamento registrado no sistema.
              </div>
            ) : (
              employeeLogs.map((log) => (
                <div key={log.id} className="bg-[#FAF9F7] border border-[#E0D8D0] rounded p-3 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-xs text-[#2C1810]">{log.employeeName}</span>
                      {getLogTypeBadge(log.type)}
                    </div>
                    
                    <p className="text-xs text-[#5D4037] leading-normal">{log.description}</p>
                    
                    <div className="flex items-center gap-3 text-[9px] text-[#8C7B70] font-medium">
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> Registrado em {log.date}</span>
                      <span className="flex items-center gap-0.5"><Briefcase className="w-3 h-3" /> Avaliado por: <span className="font-bold text-[#5D4037]">{log.leaderName}</span></span>
                    </div>
                  </div>

                  {/* Admin can delete logs */}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja remover este registro do funcionário?')) {
                          onDeleteLog(log.id);
                        }
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Apagar Registro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
