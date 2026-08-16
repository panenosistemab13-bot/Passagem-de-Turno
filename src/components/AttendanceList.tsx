import React, { useState, useEffect } from 'react';
import { onValue, ref } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { Employee, EmployeeLog } from '../types';
import { Search, UserCheck, UserX, Stethoscope, Coffee, RefreshCw } from 'lucide-react';

export default function AttendanceList({ isAdmin }: { isAdmin: boolean }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [logs, setLogs] = useState<EmployeeLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubEmp = onValue(ref(rtdb, 'dados-globais/funcionarios'), snap => setEmployees(snap.exists() ? Object.values(snap.val()) : []));
    const unsubLog = onValue(ref(rtdb, 'dados-globais/registros-funcionarios'), snap => setLogs(snap.exists() ? Object.values(snap.val()) : []));
    return () => { unsubEmp(); unsubLog(); };
  }, []);

  const getTodayLog = (empId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return logs.find(l => l.employeeId === empId && l.date.startsWith(todayStr));
  };

  const filtered = employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.matricula.includes(searchTerm));

  const stats = {
    total: employees.length,
    trabalhou: filtered.filter(e => getTodayLog(e.id)?.status === 'Trabalhou').length,
    faltou: filtered.filter(e => getTodayLog(e.id)?.status === 'Faltou').length,
    atestado: filtered.filter(e => getTodayLog(e.id)?.status === 'Atestado').length,
    folga: filtered.filter(e => getTodayLog(e.id)?.status === 'Folga').length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-xl font-black text-[#0F172A] mb-4">Controle de Presença Diária</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-slate-800">{stats.total}</p>
            <p className="text-[10px] font-bold uppercase text-slate-500">Total Equipe</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-emerald-700">{stats.trabalhou}</p>
            <p className="text-[10px] font-bold uppercase text-emerald-600">Trabalhou</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-red-700">{stats.faltou}</p>
            <p className="text-[10px] font-bold uppercase text-red-600">Faltou</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-amber-700">{stats.atestado}</p>
            <p className="text-[10px] font-bold uppercase text-amber-600">Atestado</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-blue-700">{stats.folga}</p>
            <p className="text-[10px] font-bold uppercase text-blue-600">Folga</p>
          </div>
        </div>

        <div className="relative mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou matrícula..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
              <tr>
                <th className="px-5 py-3">Matrícula</th>
                <th className="px-5 py-3">Colaborador</th>
                <th className="px-5 py-3">Admissão</th>
                <th className="px-5 py-3">Status Hoje</th>
                <th className="px-5 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map(emp => {
                const log = getTodayLog(emp.id);
                return (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-slate-600">{emp.matricula}</td>
                    <td className="px-5 py-3 font-bold text-[#0F172A]">{emp.name}</td>
                    <td className="px-5 py-3 text-slate-500">{emp.admissionDate || '-'}</td>
                    <td className="px-5 py-3">
                      {log ? (
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                          log.status === 'Trabalhou' ? 'bg-emerald-100 text-emerald-700' :
                          log.status === 'Faltou' ? 'bg-red-100 text-red-700' :
                          log.status === 'Atestado' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {log.status}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Pendente</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5">
                        <button className="px-2 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 rounded text-[10px] font-bold uppercase transition-colors">Trabalhou</button>
                        <button className="px-2 py-1 bg-slate-100 hover:bg-red-100 hover:text-red-700 text-slate-600 rounded text-[10px] font-bold uppercase transition-colors">Faltou</button>
                        <button className="px-2 py-1 bg-slate-100 hover:bg-amber-100 hover:text-amber-700 text-slate-600 rounded text-[10px] font-bold uppercase transition-colors">Atestado</button>
                        <button className="px-2 py-1 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 rounded text-[10px] font-bold uppercase transition-colors">Folga</button>
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
  );
}
