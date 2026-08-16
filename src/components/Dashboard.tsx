import React from 'react';
import { motion } from 'motion/react';
import { Folder, PlusCircle, AlertTriangle, Users, Map, ShieldAlert, Calendar, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { Leader, Occurrence, VehicleRecord } from '../types';

export default function Dashboard({
  leaders,
  occurrences,
  vehicles,
  setActiveTab
}: {
  leaders: Leader[],
  occurrences: Occurrence[],
  vehicles: VehicleRecord[],
  setActiveTab: (tab: string) => void
}) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Banner */}
      <div className="relative w-full h-[280px] rounded-3xl overflow-hidden shadow-md">
        <img 
          src="https://images.unsplash.com/photo-1599059021750-82716ae2b661?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
          alt="Fortaleza Ceará" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/90 via-[#0F172A]/60 to-transparent"></div>
        <div className="absolute inset-0 p-8 flex flex-col justify-center text-white">
          <p className="text-xs font-bold tracking-widest text-[#D4AF37] mb-2 uppercase">BEM-VINDO(A),</p>
          <h1 className="text-4xl font-extrabold mb-3">Cristiane Fialho</h1>
          <p className="text-sm font-medium text-slate-200 max-w-md leading-relaxed">
            Gerencie registros, equipes e riscos com eficiência e segurança.
          </p>
        </div>

        {/* Floating Cards */}
        <div className="absolute bottom-6 left-8 flex gap-4 overflow-x-auto right-8 pb-2">
          <div className="bg-[#0F172A]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[160px] shadow-lg flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{leaders.length}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">Pastas Ativas</p>
            </div>
          </div>

          <div className="bg-[#0F172A]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[160px] shadow-lg flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">
                {occurrences.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">Registros Hoje</p>
            </div>
          </div>

          <div className="bg-[#0F172A]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[160px] shadow-lg flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">
                {occurrences.filter(o => o.riskLevel === 'Crítico' || o.riskLevel === 'Alto').length}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">Riscos Críticos</p>
            </div>
          </div>

          <div className="bg-[#0F172A]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[160px] shadow-lg flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">12</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">Membros Online</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Acesso Rápido */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-black uppercase text-[#0F172A] tracking-wider mb-2">Acesso Rápido</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => setActiveTab('registrar')} className="bg-white border border-[#E2E8F0] p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-3 hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-xl flex items-center justify-center text-[#0F172A] group-hover:bg-[#1E40AF] group-hover:text-white transition-colors">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0F172A]">Novo Registro</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Registrar ocorrência</p>
              </div>
            </button>

            <button onClick={() => setActiveTab('presenca')} className="bg-white border border-[#E2E8F0] p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-3 hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-xl flex items-center justify-center text-[#0F172A] group-hover:bg-[#1E40AF] group-hover:text-white transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0F172A]">Lista de Presença</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Acompanhar equipe</p>
              </div>
            </button>

            <button onClick={() => setActiveTab('veiculos')} className="bg-white border border-[#E2E8F0] p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-3 hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-xl flex items-center justify-center text-[#0F172A] group-hover:bg-[#1E40AF] group-hover:text-white transition-colors">
                <div className="border-2 border-current px-1.5 py-0.5 rounded text-[10px] font-black tracking-widest">
                  ABC1D23
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-[#0F172A]">Placas de Veículos</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Cadastrar / Consultar</p>
              </div>
            </button>

            <button onClick={() => setActiveTab('riscos')} className="bg-white border border-[#E2E8F0] p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-3 hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-xl flex items-center justify-center text-[#0F172A] group-hover:bg-[#1E40AF] group-hover:text-white transition-colors">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0F172A]">Gestão de Riscos</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Identificar e controlar</p>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {/* Atividades Recentes */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black text-[#0F172A]">Atividades Recentes</h3>
                <button onClick={() => setActiveTab('historico')} className="text-xs font-bold text-blue-600 hover:underline">Ver todas</button>
              </div>
              <div className="space-y-4">
                {occurrences.slice(0, 3).map(o => (
                  <div key={o.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center shrink-0 text-slate-500">
                      <Folder className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0F172A] truncate">Registro na região de {o.location}</p>
                      <p className="text-[10px] text-slate-500 truncate">{o.description}</p>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Próximos Lembretes */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black text-[#0F172A]">Próximos Lembretes</h3>
                <button onClick={() => setActiveTab('calendario')} className="text-xs font-bold text-blue-600 hover:underline">Agenda</button>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#0F172A] truncate">Reunião de Segurança</p>
                    <p className="text-[10px] text-slate-500 truncate">16/08/2026 • 08:00</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Hoje</span>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#0F172A] truncate">Checklist Semanal</p>
                    <p className="text-[10px] text-slate-500 truncate">17/08/2026 • 09:00</p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Amanhã</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Mapa & Indicadores */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-[#0F172A]">Mapa de Riscos - Brasil</h3>
            </div>
            <div className="aspect-[4/3] bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] relative overflow-hidden flex items-center justify-center mb-4">
              {/* Map Placeholder Image */}
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Brazil_Blank_Map.svg/512px-Brazil_Blank_Map.svg.png" className="w-[80%] h-[80%] object-contain opacity-50 drop-shadow-md" alt="Mapa do Brasil" />
              
              <div className="absolute right-4 top-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-lg border border-slate-200 shadow-sm text-[10px] font-bold space-y-1.5">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Baixo</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Moderado</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Alto</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-600"></span> Crítico</div>
              </div>
            </div>
            <button onClick={() => setActiveTab('mapa')} className="w-full bg-[#0F172A] hover:bg-[#1E40AF] text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
              Ver Mapa Completo
            </button>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-black text-[#0F172A] mb-4">Indicadores</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-center">
                <p className="text-xl font-black text-[#1E40AF]">98%</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Conformidade</p>
              </div>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-center">
                <p className="text-xl font-black text-[#1E40AF]">24h</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Tempo Resposta</p>
              </div>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-center">
                <p className="text-xl font-black text-[#1E40AF]">{occurrences.length}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Registros Mês</p>
              </div>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-center">
                <p className="text-xl font-black text-[#1E40AF]">4.8/5</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Satisfação</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
