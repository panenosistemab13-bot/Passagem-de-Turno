import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  User, 
  QrCode, 
  AlertTriangle, 
  Plus, 
  ChevronRight, 
  Calendar,
  Sparkles
} from 'lucide-react';

export default function PatrolChecklist() {
  const [patrols, setPatrols] = useState([
    {
      id: 'p-1',
      unit: 'Fábrica Eusébio / CE',
      route: 'Rota 01 - Perímetro Industrial & Silos',
      officer: 'Lucas Ferreira',
      shift: 'Plantão Diurno',
      checkpointsTotal: 12,
      checkpointsCompleted: 12,
      status: 'Concluída',
      time: '08:00 - 09:15',
      anomalies: 0
    },
    {
      id: 'p-2',
      unit: 'CD Varginha / MG',
      route: 'Rota 02 - Doca de Carregamento & Galpões',
      officer: 'Airton Carvalho',
      shift: 'Plantão Diurno',
      checkpointsTotal: 10,
      checkpointsCompleted: 8,
      status: 'Em Andamento',
      time: '13:00 - 14:30',
      anomalies: 1
    },
    {
      id: 'p-3',
      unit: 'Unidade Fortaleza / CE',
      route: 'Rota 03 - Portaria, Estacionamento & Balança',
      officer: 'Diego Souza',
      shift: 'Plantão Diurno',
      checkpointsTotal: 8,
      checkpointsCompleted: 8,
      status: 'Concluída',
      time: '11:00 - 11:45',
      anomalies: 0
    },
    {
      id: 'p-4',
      unit: 'Fábrica Natal / RN',
      route: 'Rota Noturna - Perímetro Externo & Subestação',
      officer: 'Equipe Noturna Alpha',
      shift: 'Noturno',
      checkpointsTotal: 14,
      checkpointsCompleted: 0,
      status: 'Programada',
      time: '22:00 - 23:30',
      anomalies: 0
    }
  ]);

  const [showQrModal, setShowQrModal] = useState(false);
  const [activePatrolForModal, setActivePatrolForModal] = useState<string | null>(null);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 text-[#E2E8F0]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4A373]">
            RONDA PATRIMONIAL & TELEMETRIA
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-serif">
            Rondas & Checklists Operacionais
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Validação de pontos de controle com QR Code e geolocalização em tempo real
          </p>
        </div>

        <button 
          onClick={() => setShowQrModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C68A4C] to-[#E2B170] text-black text-xs font-bold hover:brightness-110 transition-all shadow-lg"
        >
          <QrCode className="w-4 h-4" />
          <span>Escanear Ponto de Ronda</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#121620] border border-[#222B3B]">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Programadas Hoje</span>
          <p className="text-2xl font-black text-white font-serif mt-1">18</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#121620] border border-[#222B3B]">
          <span className="text-[10px] uppercase font-bold text-slate-400">Rondas Concluídas</span>
          <p className="text-2xl font-black text-emerald-400 font-serif mt-1">14 (78%)</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#121620] border border-[#222B3B]">
          <span className="text-[10px] uppercase font-bold text-slate-400">Em Deslocamento</span>
          <p className="text-2xl font-black text-amber-400 font-serif mt-1">04</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#121620] border border-[#222B3B]">
          <span className="text-[10px] uppercase font-bold text-slate-400">Anomalias Apontadas</span>
          <p className="text-2xl font-black text-red-400 font-serif mt-1">01</p>
        </div>
      </div>

      {/* Patrol List Table */}
      <div className="rounded-3xl bg-[#121620] border border-[#222B3B] p-5 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-[#1E2838]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D4A373]" />
            Cronograma de Rondas por Unidade
          </h3>
          <span className="text-xs text-slate-400">Data: 16 de Agosto, 2026</span>
        </div>

        <div className="divide-y divide-[#1C2534] mt-2">
          {patrols.map((p) => (
            <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#161D2A] px-3 rounded-2xl transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    p.status === 'Concluída' ? 'bg-emerald-400' :
                    p.status === 'Em Andamento' ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'
                  }`} />
                  <h4 className="text-sm font-bold text-white">{p.route}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1F293D] text-[#D4A373] font-semibold">
                    {p.unit}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#D4A373]" />
                    {p.officer}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#D4A373]" />
                    {p.time}
                  </span>
                  <span>Pontos: <strong className="text-white">{p.checkpointsCompleted}/{p.checkpointsTotal}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {p.anomalies > 0 && (
                  <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 px-2.5 py-1 rounded-full font-bold">
                    {p.anomalies} Anomalia
                  </span>
                )}
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  p.status === 'Concluída' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                  p.status === 'Em Andamento' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Code Scan Modal Simulation */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121722] border border-[#28354A] rounded-3xl max-w-md w-full p-6 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-3xl bg-[#261C14] border border-[#523A25] text-[#D4A373] mx-auto flex items-center justify-center mb-4">
              <QrCode className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">Leitor de Ponto de Ronda</h3>
            <p className="text-xs text-slate-400 mt-1">Aponte a câmera para o QR Code fixado no ponto de controle</p>

            <div className="my-6 p-6 rounded-2xl bg-black/60 border border-dashed border-[#D4A373]/50 flex flex-col items-center justify-center">
              <div className="w-32 h-32 border-2 border-[#D4A373] rounded-2xl relative flex items-center justify-center">
                <span className="w-full h-0.5 bg-red-500 absolute top-1/2 -translate-y-1/2 animate-bounce"></span>
                <span className="text-[10px] text-slate-400">Área de Leitura</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowQrModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#D4A373] text-black text-xs font-bold hover:bg-[#E2B170] transition-colors"
              >
                Simular Check-in com Sucesso
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
