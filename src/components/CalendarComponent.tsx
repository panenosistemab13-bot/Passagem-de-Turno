import React, { useState } from 'react';
import { Reminder, Leader } from '../types';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Shield, Users, MapPin, Search } from 'lucide-react';

export default function CalendarComponent({ reminders }: { reminders: Reminder[], leaders: Leader[], selectedLeaderId: string, isAdmin: boolean, onAddReminder: any, onDeleteReminder: any }) {
  const [filter, setFilter] = useState('');

  const filtered = reminders.filter(r => r.title.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#0F172A]">Agenda e Lembretes</h2>
          <p className="text-sm text-slate-500">Planejamento de reuniões, checklists e manutenção de frota.</p>
        </div>
        <button className="bg-[#1E40AF] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Novo Evento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-sm font-black uppercase text-[#0F172A] tracking-wider">Cronograma</h3>
              <div className="relative w-64">
                <input type="text" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Pesquisar..." className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500" />
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              </div>
            </div>
            
            <div className="space-y-3">
              {filtered.map(r => (
                <div key={r.id} className="group flex gap-4 p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all bg-slate-50/50">
                  <div className="flex flex-col items-center justify-center min-w-[60px] border-r border-slate-200 pr-4">
                    <span className="text-2xl font-black text-[#1E40AF]">
                      {new Date(r.date).getDate().toString().padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-500">
                      {new Date(r.date).toLocaleString('pt-BR', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-slate-800 truncate mb-1">{r.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{r.description}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      r.type === 'reuniao' ? 'bg-blue-100 text-blue-700' :
                      r.type === 'manutencao' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {r.type === 'reuniao' ? 'Reunião' : r.type === 'manutencao' ? 'Manutenção' : 'Checklist'}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-slate-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#0F172A] rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
            <h3 className="text-sm font-black uppercase tracking-wider mb-4 relative z-10">Resumo do Mês</h3>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-slate-300 text-xs">Reuniões</span>
                <span className="font-mono font-bold text-lg">12</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-slate-300 text-xs">Manutenções Frota</span>
                <span className="font-mono font-bold text-lg text-amber-400">04</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-xs">Checklists</span>
                <span className="font-mono font-bold text-lg text-emerald-400">08</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
