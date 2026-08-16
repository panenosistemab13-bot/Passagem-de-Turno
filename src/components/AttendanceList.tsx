import React, { useState, useEffect, useMemo } from 'react';
import { STAFF_MEMBERS, StaffMember } from '../attendanceData';
import { DailyAttendance, AttendanceStatus } from '../types';
import { onValue, ref, set } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { Calendar, Save, CheckCircle, XCircle, Clock, Stethoscope, AlertCircle, Gift } from 'lucide-react';

interface AttendanceListProps {
  isAdmin: boolean;
}

export default function AttendanceList({ isAdmin }: AttendanceListProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<DailyAttendance | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load from Firebase on date change
  useEffect(() => {
    const unsub = onValue(ref(rtdb, `dados-globais/presenca/${selectedDate}`), (snapshot) => {
      if (snapshot.exists()) {
        setAttendance(snapshot.val());
      } else {
        // Initialize empty
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

  const checkBirthday = (dobString: string, checkType: 'month' | 'day') => {
    if (!dobString) return false;
    
    // dobString is usually DD/MM/YYYY or D/M/YYYY
    const parts = dobString.split('/');
    if (parts.length < 2) return false;
    
    const birthDay = parseInt(parts[0], 10);
    const birthMonth = parseInt(parts[1], 10);
    
    const current = new Date(selectedDate);
    const currentDay = current.getDate() + 1; // getUTCDate logic to avoid timezone shifts, assuming selectedDate is YYYY-MM-DD
    // Actually selectedDate is a string "YYYY-MM-DD", let's parse it safely
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

  // Group by role? Let's just list alphabetically
  const sortedStaff = useMemo(() => {
    return [...STAFF_MEMBERS].sort((a, b) => a.nome.localeCompare(b.nome));
  }, []);

  const totalStaff = sortedStaff.length;
  const countWorking = sortedStaff.filter(s => attendance?.records[s.matricula]?.status === 'trabalhou').length;
  const countAbsent = sortedStaff.filter(s => attendance?.records[s.matricula]?.status === 'faltou').length;
  const countMedical = sortedStaff.filter(s => attendance?.records[s.matricula]?.status === 'atestado').length;
  const countOff = sortedStaff.filter(s => attendance?.records[s.matricula]?.status === 'folga').length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
        <div>
          <h2 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-300" />
            Lista de Presença
          </h2>
          <p className="text-blue-200 text-sm mt-1">Acompanhamento diário da equipe operacional</p>
        </div>
        
        <div className="flex items-center gap-3">
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
    </div>
  );
}
