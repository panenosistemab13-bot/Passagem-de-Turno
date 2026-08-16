import React, { useState } from 'react';
import { Reminder, Leader } from '../types';
import { CalendarDays, Plus, Clock, ClipboardList, Trash2, Calendar } from 'lucide-react';
import ThreeDIcon from './ThreeDIcon';

interface CalendarComponentProps {
  reminders: Reminder[];
  leaders: Leader[];
  selectedLeaderId: string;
  isAdmin: boolean;
  onAddReminder: (reminder: Omit<Reminder, 'id'>) => void;
  onDeleteReminder: (id: string) => void;
}

export default function CalendarComponent({
  reminders,
  leaders,
  selectedLeaderId,
  isAdmin,
  onAddReminder,
  onDeleteReminder
}: CalendarComponentProps) {
  
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 15)); // Aug 2026 as per time metadata
  const [selectedDayStr, setSelectedDayStr] = useState('2026-08-14'); // Initial active day

  // Form states
  const [remTitle, setRemTitle] = useState('');
  const [remDesc, setRemDesc] = useState('');
  const [remType, setRemType] = useState<'reuniao' | 'manutencao' | 'auditoria' | 'lembrete'>('lembrete');

  const currentLeader = leaders.find(l => l.id === selectedLeaderId) || leaders[0];

  // Calendar math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // First day of month index (0: Sun, 1: Mon, etc.)
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const daysArray = [];
  // Fill leading empty days
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  // Fill actual month days
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  const handleDaySelect = (day: number) => {
    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(month + 1).padStart(2, '0');
    setSelectedDayStr(`${year}-${formattedMonth}-${formattedDay}`);
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle.trim()) return;

    onAddReminder({
      date: selectedDayStr,
      title: remTitle.trim(),
      description: remDesc.trim(),
      type: remType,
      leaderName: currentLeader.name
    });

    setRemTitle('');
    setRemDesc('');
    setRemType('lembrete');
  };

  // Filter reminders for active selected day
  const activeReminders = reminders.filter(r => r.date === selectedDayStr);

  const getRemindersForDay = (day: number) => {
    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(month + 1).padStart(2, '0');
    const dayStr = `${year}-${formattedMonth}-${formattedDay}`;
    return reminders.filter(r => r.date === dayStr);
  };

  const getTypeBadgeStyle = (type: string) => {
    switch(type) {
      case 'reuniao': return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'manutencao': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'auditoria': return 'bg-red-100 text-red-700 border border-red-200';
      default: return 'bg-blue-100 text-blue-700 border border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Calendar header intro */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white p-4 rounded-xl shadow-lg border border-[#334155] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black uppercase text-[#2563EB] bg-white px-2 py-0.5 rounded shadow-sm inline-block tracking-wider mb-1">
            Calendário e Lembretes
          </h2>
          <p className="text-xs text-slate-300">Agende reuniões de passagem de plantão, manutenções preventivas de frotas e auditorias.</p>
        </div>
        <ThreeDIcon icon={CalendarDays} color="coffee" size="md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        
        {/* Left Side: Calendar Board Grid */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm space-y-3">
          
          {/* Navigation Month Control */}
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2.5">
            <h3 className="font-black text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#2563EB]" />
              {monthNames[month]} {year}
            </h3>

            <div className="flex items-center gap-1">
              <button 
                onClick={handlePrevMonth}
                className="px-2 py-1 rounded border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-[10px] font-black text-[#0F172A] cursor-pointer"
              >
                Anterior
              </button>
              <button 
                onClick={handleNextMonth}
                className="px-2 py-1 rounded border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-[10px] font-black text-[#0F172A] cursor-pointer"
              >
                Próximo
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[9px] text-[#64748B] uppercase tracking-wider pb-1">
            <span>Dom</span>
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {daysArray.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="h-12 bg-[#F8FAFC]/50 rounded-lg border border-transparent" />;
              }

              const formattedDay = String(day).padStart(2, '0');
              const formattedMonth = String(month + 1).padStart(2, '0');
              const dayStr = `${year}-${formattedMonth}-${formattedDay}`;
              const isSelected = dayStr === selectedDayStr;
              const dayReminders = getRemindersForDay(day);

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => handleDaySelect(day)}
                  className={`h-12 rounded-lg border flex flex-col justify-between p-1 transition-all focus:outline-none relative ${
                    isSelected 
                      ? 'bg-[#2563EB] border-[#1D4ED8] text-white font-black shadow-sm scale-[1.02] z-10' 
                      : 'bg-white border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9] font-semibold'
                  }`}
                >
                  <span className="text-[10px]">{day}</span>
                  
                  {/* Indicators / Dots for events */}
                  {dayReminders.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 justify-center max-w-full">
                      {dayReminders.slice(0, 3).map((r, rIdx) => (
                        <span 
                          key={rIdx} 
                          className={`w-1 h-1 rounded-full ${
                            isSelected ? 'bg-white' : 
                            r.type === 'reuniao' ? 'bg-purple-500' :
                            r.type === 'manutencao' ? 'bg-amber-500' :
                            r.type === 'auditoria' ? 'bg-red-500' : 'bg-blue-500'
                          }`} 
                        />
                      ))}
                      {dayReminders.length > 3 && (
                        <span className={`text-[8px] leading-none ${isSelected ? 'text-white' : 'text-[#64748B]'}`}>+</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Right Side: Agenda and Quick scheduling form */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Day List Agenda */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm space-y-3">
            <div className="border-b border-[#F1F5F9] pb-2 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-[#2563EB] font-black uppercase">Compromissos</span>
                <h4 className="text-[10px] font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-1">
                  <ClipboardList className="w-3.5 h-3.5 text-[#2563EB]" /> 
                  Agenda: {selectedDayStr.split('-').reverse().join('/')}
                </h4>
              </div>
              <span className="text-[9px] font-black bg-[#F1F5F9] text-[#0F172A] px-2 py-0.5 rounded">
                {activeReminders.length} Eventos
              </span>
            </div>

            {/* Event list */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {activeReminders.length === 0 ? (
                <div className="text-center text-[#64748B] text-[11px] py-6">
                  Nenhum compromisso agendado para esta data.
                </div>
              ) : (
                activeReminders.map((rem) => (
                  <div key={rem.id} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2.5 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${getTypeBadgeStyle(rem.type)}`}>
                        {rem.type}
                      </span>

                      {/* Admin delete reminder */}
                      {isAdmin && (
                        <button
                          onClick={() => onDeleteReminder(rem.id)}
                          className="text-red-500 hover:text-red-700 p-0.5 rounded"
                          title="Excluir"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <h5 className="font-extrabold text-[11px] text-[#0F172A] leading-tight">{rem.title}</h5>
                    {rem.description && <p className="text-[10px] text-[#334155] leading-normal">{rem.description}</p>}
                    
                    <div className="text-[9px] text-[#64748B] pt-1 border-t border-[#E2E8F0] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Agendado por: <span className="font-bold text-[#334155]">{rem.leaderName}</span></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Schedule input form */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm space-y-3">
            <div className="pb-1.5 border-b border-[#F1F5F9] flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#2563EB]" />
              <h4 className="text-[10px] font-black text-[#0F172A] uppercase tracking-wider">Agendar no Calendário</h4>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-3">
              <div>
                <label className="block text-[9px] font-black uppercase text-[#0F172A] mb-0.5">Título do Evento</label>
                <input
                  type="text"
                  value={remTitle}
                  onChange={(e) => setRemTitle(e.target.value)}
                  placeholder="Ex: Auditoria do Rodotrem SAS2D02"
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded px-2.5 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black uppercase text-[#0F172A] mb-0.5">Categoria</label>
                  <select
                    value={remType}
                    onChange={(e) => setRemType(e.target.value as any)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded px-2 py-1.5 text-xs text-[#0F172A] font-bold focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="lembrete">Lembrete</option>
                    <option value="reuniao">Reunião</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="auditoria">Auditoria</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-[#0F172A] mb-0.5">Data</label>
                  <input
                    type="text"
                    value={selectedDayStr.split('-').reverse().join('/')}
                    disabled
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded px-2 py-1.5 text-xs text-[#64748B] font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase text-[#0F172A] mb-0.5">Descrição</label>
                <textarea
                  value={remDesc}
                  onChange={(e) => setRemDesc(e.target.value)}
                  placeholder="Insira detalhes..."
                  rows={2}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] text-[#0F172A]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs uppercase py-2 rounded shadow transition-all cursor-pointer"
              >
                Agendar Evento
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
