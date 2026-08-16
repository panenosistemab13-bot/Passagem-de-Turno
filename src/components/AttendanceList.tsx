import React, { useState, useEffect, useMemo } from 'react';
import { STAFF_MEMBERS, StaffMember } from '../attendanceData';
import { DailyAttendance, AttendanceStatus } from '../types';
import { onValue, ref, set, push, remove, update } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { Calendar, Save, CheckCircle, XCircle, Clock, Stethoscope, AlertCircle, Gift, Users, Edit2, Trash2, X, Plus } from 'lucide-react';

interface AttendanceListProps {
  isAdmin: boolean;
}

export default function AttendanceList({ isAdmin }: AttendanceListProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<DailyAttendance | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Staff Management State
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState<StaffMember>({
    matricula: '', nome: '', funcao: '', admissao: '', nascimento: ''
  });

  // Load Staff from Firebase
  useEffect(() => {
    const unsubStaff = onValue(ref(rtdb, 'dados-globais/colaboradores'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const parsedStaff = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setStaffList(parsedStaff);
      } else {
        // Seed initial data if empty
        STAFF_MEMBERS.forEach(staff => {
          push(ref(rtdb, 'dados-globais/colaboradores'), staff);
        });
      }
    });

    return () => unsubStaff();
  }, []);

  // Load Attendance from Firebase
  useEffect(() => {
    const unsub = onValue(ref(rtdb, `dados-globais/presenca/${selectedDate}`), (snapshot) => {
      if (snapshot.exists()) {
        setAttendance(snapshot.val());
      } else {
        setAttendance({
          date: selectedDate,
          records: {}
        });
      }
    });

    return () => unsub();
  }, [selectedDate]);

  const handleStatusChange = (matricula: string, status: AttendanceStatus) => {
    if (!isAdmin) return;
    
    setAttendance(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        records: {
          ...prev.records,
          [matricula]: { matricula, status }
        }
      };
    });
  };

  const handleSave = async () => {
    if (!isAdmin || !attendance) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await set(ref(rtdb, `dados-globais/presenca/${selectedDate}`), attendance);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("Erro ao salvar a lista de presença.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Staff Management Functions ---
  const handleSaveStaff = async () => {
    if (!staffForm.nome || !staffForm.matricula) {
      alert("Nome e matrícula são obrigatórios.");
      return;
    }

    if (editingStaffId) {
      // Edit existing
      await update(ref(rtdb, `dados-globais/colaboradores/${editingStaffId}`), staffForm);
    } else {
      // Add new
      await push(ref(rtdb, 'dados-globais/colaboradores'), staffForm);
    }

    // Reset form
    setEditingStaffId(null);
    setStaffForm({ matricula: '', nome: '', funcao: '', admissao: '', nascimento: '' });
  };

  const handleEditStaff = (staff: StaffMember) => {
    setStaffForm(staff);
    setEditingStaffId(staff.id || null);
  };

  const handleDeleteStaff = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este colaborador?")) {
      await remove(ref(rtdb, `dados-globais/colaboradores/${id}`));
    }
  };

  const handleCancelEdit = () => {
    setEditingStaffId(null);
    setStaffForm({ matricula: '', nome: '', funcao: '', admissao: '', nascimento: '' });
  };

  // --- Utility Functions ---
  const checkBirthday = (dobString: string, checkType: 'month' | 'day') => {
    if (!dobString) return false;
    const parts = dobString.split('/');
    if (parts.length < 2) return false;
    
    const birthDay = parseInt(parts[0], 10);
    const birthMonth = parseInt(parts[1], 10);
    
    const [y, m, d] = selectedDate.split('-');
    const currentM = parseInt(m, 10);
    const currentD = parseInt(d, 10);

    if (checkType === 'month') return birthMonth === currentM;
    if (checkType === 'day') return birthMonth === currentM && birthDay === currentD;
    return false;
  };

  const StatusIcon = ({ status }: { status?: AttendanceStatus }) => {
    switch (status) {
      case 'trabalhou': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'faltou': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'atestado': return <Stethoscope className="w-4 h-4 text-blue-500" />;
      case 'folga': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <XCircle className="w-4 h-4 text-slate-300" />;
    }
  };

  const sortedStaff = useMemo(() => {
    return [...staffList].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [staffList]);

  const totalStaff = sortedStaff.length;
  const countWorking = sortedStaff.filter(s => attendance?.records[s.matricula]?.status === 'trabalhou').length;
  const countAbsent = sortedStaff.filter(s => attendance?.records[s.matricula]?.status === 'faltou').length;
  const countMedical = sortedStaff.filter(s => attendance?.records[s.matricula]?.status === 'atestado').length;
  const countOff = sortedStaff.filter(s => attendance?.records[s.matricula]?.status === 'folga').length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full animate-in fade-in duration-300 relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
        <div>
          <h2 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-300" />
            Lista de Presença
          </h2>
          <p className="text-blue-200 text-sm mt-1">Acompanhamento diário da equipe operacional</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => setIsManageModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm bg-blue-800 hover:bg-blue-700 border border-blue-600 transition-all shadow-sm"
            >
              <Users className="w-4 h-4" />
              Gerenciar Equipe
            </button>
          )}

          <div className="bg-blue-950/40 border border-blue-400/30 rounded-lg p-1.5 flex items-center gap-2">
            <span className="text-xs font-bold text-blue-200 uppercase px-2">Data do Plantão:</span>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white text-slate-900 text-sm font-bold rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          
          {isAdmin && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md
                ${saveSuccess ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'}
                ${isSaving ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Salvando...' : saveSuccess ? 'Salvo!' : 'Salvar Presença'}
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-slate-50 border-b border-slate-200">
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total</span>
          <span className="text-xl font-black text-slate-800">{totalStaff}</span>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 shadow-sm flex flex-col items-center justify-center">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Trabalhou</span>
          <span className="text-xl font-black text-emerald-700">{countWorking}</span>
        </div>
        <div className="bg-red-50 rounded-xl p-3 border border-red-200 shadow-sm flex flex-col items-center justify-center">
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Faltou</span>
          <span className="text-xl font-black text-red-700">{countAbsent}</span>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-200 shadow-sm flex flex-col items-center justify-center">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Atestado</span>
          <span className="text-xl font-black text-blue-700">{countMedical}</span>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 shadow-sm flex flex-col items-center justify-center">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Folga</span>
          <span className="text-xl font-black text-amber-700">{countOff}</span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="p-3 text-xs font-black text-slate-600 uppercase w-24">Matrícula</th>
                  <th className="p-3 text-xs font-black text-slate-600 uppercase">Colaborador</th>
                  <th className="p-3 text-xs font-black text-slate-600 uppercase w-28 text-center">Admissão</th>
                  <th className="p-3 text-xs font-black text-slate-600 uppercase w-28 text-center">Nascimento</th>
                  <th className="p-3 text-xs font-black text-slate-600 uppercase w-48 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedStaff.map((staff, idx) => {
                  const isBirthdayMonth = checkBirthday(staff.nascimento, 'month');
                  const isBirthdayDay = checkBirthday(staff.nascimento, 'day');
                  const currentStatus = attendance?.records[staff.matricula]?.status;

                  return (
                    <tr key={staff.matricula || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-xs font-semibold text-slate-500 font-mono">
                        {staff.matricula || '-'}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 uppercase">{staff.nome}</span>
                          
                          {isBirthdayMonth && (
                            <div 
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                isBirthdayDay 
                                  ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white border-transparent shadow-sm animate-pulse' 
                                  : 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200'
                              }`}
                            >
                              <Gift className={`w-3 h-3 ${isBirthdayDay ? 'text-white' : 'text-fuchsia-500'}`} />
                              {isBirthdayDay ? 'Aniversariante do Dia!' : 'Aniversariante do Mês'}
                            </div>
                          )}
                        </div>
                        {staff.funcao && (
                          <div className="text-[10px] font-semibold text-slate-400 mt-0.5">{staff.funcao}</div>
                        )}
                      </td>
                      <td className="p-3 text-center text-xs font-medium text-slate-600">
                        {staff.admissao || '-'}
                      </td>
                      <td className="p-3 text-center text-xs font-medium text-slate-600">
                        {staff.nascimento || '-'}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center">
                          <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                            {(['trabalhou', 'faltou', 'atestado', 'folga'] as AttendanceStatus[]).map((opt) => (
                              <button
                                key={opt}
                                onClick={() => handleStatusChange(staff.matricula, opt)}
                                disabled={!isAdmin}
                                className={`
                                  px-3 py-1.5 text-[10px] font-black uppercase rounded-md transition-all flex items-center gap-1.5
                                  ${!isAdmin ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}
                                  ${currentStatus === opt 
                                    ? opt === 'trabalhou' ? 'bg-emerald-500 text-white shadow-sm'
                                    : opt === 'faltou' ? 'bg-red-500 text-white shadow-sm'
                                    : opt === 'atestado' ? 'bg-blue-500 text-white shadow-sm'
                                    : 'bg-amber-500 text-white shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-200'
                                  }
                                `}
                              >
                                {currentStatus === opt && <StatusIcon status={opt} />}
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Manage Staff Modal */}
      {isManageModalOpen && isAdmin && (
        <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Gerenciar Equipe
              </h3>
              <button 
                onClick={() => setIsManageModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 flex flex-col md:flex-row gap-8">
              {/* Form Column */}
              <div className="w-full md:w-1/3 flex flex-col gap-4">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <h4 className="text-sm font-black uppercase tracking-wider text-blue-800 mb-4 flex items-center gap-2">
                    {editingStaffId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingStaffId ? 'Editar Colaborador' : 'Novo Colaborador'}
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Matrícula*</label>
                      <input 
                        type="text" 
                        value={staffForm.matricula}
                        onChange={(e) => setStaffForm({...staffForm, matricula: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Ex: 1-12345"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Nome Completo*</label>
                      <input 
                        type="text" 
                        value={staffForm.nome}
                        onChange={(e) => setStaffForm({...staffForm, nome: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Nome do colaborador"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Função</label>
                      <input 
                        type="text" 
                        value={staffForm.funcao}
                        onChange={(e) => setStaffForm({...staffForm, funcao: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Ex: OP MONIT ELETRONICO"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Admissão</label>
                        <input 
                          type="text" 
                          value={staffForm.admissao}
                          onChange={(e) => setStaffForm({...staffForm, admissao: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          placeholder="DD/MM/AAAA"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Nascimento</label>
                        <input 
                          type="text" 
                          value={staffForm.nascimento}
                          onChange={(e) => setStaffForm({...staffForm, nascimento: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          placeholder="DD/MM/AAAA"
                        />
                      </div>
                    </div>
                    
                    <div className="pt-2 flex items-center gap-2">
                      <button 
                        onClick={handleSaveStaff}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-sm transition-colors"
                      >
                        {editingStaffId ? 'Salvar Alterações' : 'Adicionar'}
                      </button>
                      {editingStaffId && (
                        <button 
                          onClick={handleCancelEdit}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* List Column */}
              <div className="w-full md:w-2/3 flex flex-col">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
                  <div className="bg-slate-100 p-3 border-b border-slate-200 text-xs font-black text-slate-600 uppercase tracking-wider">
                    Colaboradores Cadastrados ({sortedStaff.length})
                  </div>
                  <div className="flex-1 overflow-auto p-2 space-y-1">
                    {sortedStaff.map((staff) => (
                      <div key={staff.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 uppercase">{staff.nome}</span>
                          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-0.5">
                            <span className="font-mono text-[10px] bg-slate-100 px-1.5 rounded">{staff.matricula}</span>
                            {staff.funcao && <span>{staff.funcao}</span>}
                            {staff.admissao && <span>Admissão: {staff.admissao}</span>}
                            {staff.nascimento && <span>Nasc: {staff.nascimento}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleEditStaff(staff)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteStaff(staff.id!)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {sortedStaff.length === 0 && (
                      <div className="text-center p-8 text-slate-400 text-sm font-medium">
                        Nenhum colaborador cadastrado.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
