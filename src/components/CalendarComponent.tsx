import React, { useState } from 'react';
import { Reminder, Leader } from '../types';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Shield, Users, MapPin, Search, Coffee } from 'lucide-react';

export default function CalendarComponent({ 
  reminders, 
  leaders, 
  selectedLeaderId, 
  isAdmin, 
  onAddReminder, 
  onDeleteReminder 
}: { 
  reminders: Reminder[], 
  leaders: Leader[], 
  selectedLeaderId: string, 
  isAdmin: boolean, 
  onAddReminder: (reminder: Reminder) => void, 
  onDeleteReminder: (id: string) => void 
}) {
  const [filter, setFilter] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newType, setNewType] = useState<'reuniao' | 'checklist' | 'manutencao' | 'outro'>('reuniao');

  const filtered = reminders.filter(r => r.title.toLowerCase().includes(filter.toLowerCase()));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const item: Reminder = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDescription,
      date: newDate,
      time: '08:00',
      type: newType,
      leaderId: selectedLeaderId || (leaders[0]?.id || '1'),
      leaderName: leaders.find(l => l.id === selectedLeaderId)?.name || 'Líder Geral',
      status: 'pendente'
    };
    onAddReminder(item);
    setNewTitle('');
    setNewDescription('');
    setShowNewModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-[#E2E8F0]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#D4A373]">
            CRONOGRAMA OPERACIONAL
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white font-serif">Agenda & Eventos Corporativos</h2>
          <p className="text-xs text-slate-400">Planejamento de auditorias, inspeções patrimoniais e manutenções.</p>
        </div>
        <button 
          onClick={() => setShowNewModal(true)}
          className="bg-gradient-to-r from-[#C68A4C] to-[#E2B170] hover:brightness-110 text-black px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Novo Agendamento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#121620] border border-[#222B3B] rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b border-[#1E2838] pb-4">
              <h3 className="text-xs font-extrabold uppercase text-[#E2B170] tracking-wider font-serif">Compromissos Agendados</h3>
              <div className="relative w-64">
                <input 
                  type="text" 
                  value={filter} 
                  onChange={e => setFilter(e.target.value)} 
                  placeholder="Pesquisar compromisso..." 
                  className="w-full bg-[#1A2230] border border-[#2A374C] rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A373]" 
                />
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              </div>
            </div>
            
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Nenhum evento registrado na agenda.
                </div>
              ) : (
                filtered.map(r => (
                  <div key={r.id} className="group flex gap-4 p-4 border border-[#222B3B] rounded-2xl hover:border-[#D4A373]/50 transition-all bg-[#161D27]">
                    <div className="flex flex-col items-center justify-center min-w-[60px] border-r border-[#253247] pr-4">
                      <span className="text-2xl font-black text-[#E2B170] font-serif">
                        {new Date(r.date).getDate().toString().padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        {new Date(r.date).toLocaleString('pt-BR', { month: 'short' })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-xs font-bold text-white truncate mb-1">{r.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{r.description}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        r.type === 'reuniao' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                        r.type === 'checklist' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                        'bg-[#D4A373]/20 text-[#E2B170] border border-[#D4A373]/40'
                      }`}>
                        {r.type}
                      </span>
                      {isAdmin && (
                        <button 
                          onClick={() => onDeleteReminder(r.id)} 
                          className="text-slate-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                          title="Remover"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info Card */}
        <div className="space-y-6">
          <div className="bg-[#121620] border border-[#222B3B] rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xs font-extrabold uppercase text-[#E2B170] tracking-wider mb-4 font-serif">
              Resumo Operacional
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-[#161D27] border border-[#253247]">
                <span className="text-slate-400">Total de Eventos:</span>
                <span className="font-bold text-white">{reminders.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-[#161D27] border border-[#253247]">
                <span className="text-slate-400">Inspeções Periódicas:</span>
                <span className="font-bold text-emerald-400">Em dia</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-[#161D27] border border-[#253247]">
                <span className="text-slate-400">Unidade:</span>
                <span className="font-bold text-[#E2B170]">Matriz Fortaleza</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Event Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-[#222B3B] rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-serif">Novo Agendamento</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Título do Evento</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                  placeholder="Ex: Auditoria de Câmeras Perimetrais" 
                  required 
                  className="w-full bg-[#1A2230] border border-[#2A374C] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#D4A373]"
                />
              </div>
              <div>
                <label className="text-slate-300 font-bold block mb-1">Data</label>
                <input 
                  type="date" 
                  value={newDate} 
                  onChange={e => setNewDate(e.target.value)} 
                  required 
                  className="w-full bg-[#1A2230] border border-[#2A374C] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#D4A373]"
                />
              </div>
              <div>
                <label className="text-slate-300 font-bold block mb-1">Tipo</label>
                <select 
                  value={newType} 
                  onChange={e => setNewType(e.target.value as any)}
                  className="w-full bg-[#1A2230] border border-[#2A374C] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#D4A373]"
                >
                  <option value="reuniao">Reunião de Alinhamento</option>
                  <option value="checklist">Checklist / Ronda</option>
                  <option value="manutencao">Manutenção de CFTV / Portaria</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="text-slate-300 font-bold block mb-1">Descrição</label>
                <textarea 
                  value={newDescription} 
                  onChange={e => setNewDescription(e.target.value)} 
                  rows={3} 
                  placeholder="Detalhes adicionais..." 
                  className="w-full bg-[#1A2230] border border-[#2A374C] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#D4A373]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E2838]">
                <button 
                  type="button" 
                  onClick={() => setShowNewModal(false)} 
                  className="px-4 py-2 bg-[#1A2230] text-slate-300 rounded-xl hover:bg-[#253247] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-gradient-to-r from-[#C68A4C] to-[#E2B170] text-black font-bold rounded-xl hover:brightness-110 transition-all cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
