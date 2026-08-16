import React, { useState } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Download, 
  Calendar, 
  FileSpreadsheet, 
  Layers, 
  ShieldCheck,
  Truck,
  Users
} from 'lucide-react';
import { Occurrence } from '../types';

export default function AnalyticsReports({ occurrences = [] }: { occurrences?: Occurrence[] }) {
  const [selectedFilter, setSelectedFilter] = useState('Agosto / 2026');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 text-[#E2E8F0]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4A373]">
            INTELIGÊNCIA & BUSINESS INTELLIGENCE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-serif">
            Relatórios & Analytics Operacional
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Métricas de desempenho, frotas, segurança e prontidão das unidades Café 3 Corações
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#161D29] border border-[#28354A] text-xs font-bold text-slate-300 hover:text-white hover:bg-[#1E2838] transition-all">
            <Download className="w-4 h-4 text-[#D4A373]" />
            <span>Exportar XLS / PDF</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#121620] border border-[#222B3B]">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Ocorrências (Mês)</span>
          <p className="text-2xl font-black text-white font-serif mt-1">142</p>
          <span className="text-[10px] text-emerald-400 font-semibold">-14% em relação a Julho</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121620] border border-[#222B3B]">
          <span className="text-[10px] uppercase font-bold text-slate-400">Tempo Médio Resposta</span>
          <p className="text-2xl font-black text-[#D4A373] font-serif mt-1">4.8 min</p>
          <span className="text-[10px] text-emerald-400 font-semibold">Dentro do SLA de 10 min</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121620] border border-[#222B3B]">
          <span className="text-[10px] uppercase font-bold text-slate-400">Viagens Monitoradas</span>
          <p className="text-2xl font-black text-white font-serif mt-1">1.280</p>
          <span className="text-[10px] text-emerald-400 font-semibold">100% integridade de carga</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121620] border border-[#222B3B]">
          <span className="text-[10px] uppercase font-bold text-slate-400">Índice Conformidade</span>
          <p className="text-2xl font-black text-emerald-400 font-serif mt-1">98.6%</p>
          <span className="text-[10px] text-slate-400">Auditoria Operacional</span>
        </div>
      </div>

      {/* Detailed Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trend Graph Box */}
        <div className="rounded-3xl bg-[#121620] border border-[#222B3B] p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#D4A373]" />
              Evolução Semanal de Ocorrências
            </h3>
            <span className="text-[10px] text-[#D4A373] bg-[#261C14] px-2.5 py-1 rounded-full font-bold">
              Últimas 4 Semanas
            </span>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-4 border-b border-[#222B3B]">
            {[
              { week: 'Semana 1', val: 42, height: '65%' },
              { week: 'Semana 2', val: 38, height: '58%' },
              { week: 'Semana 3', val: 31, height: '48%' },
              { week: 'Semana 4', val: 24, height: '38%' }
            ].map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[11px] font-bold text-[#E2B170] group-hover:scale-110 transition-transform">
                  {item.val}
                </span>
                <div 
                  style={{ height: item.height }}
                  className="w-full max-w-[48px] bg-gradient-to-t from-[#7C4E23] via-[#C68A4C] to-[#E2B170] rounded-t-lg group-hover:brightness-125 transition-all shadow-lg"
                ></div>
                <span className="text-[11px] text-[#94A3B8] font-semibold">{item.week}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 text-center pt-1">
            Tendência de redução contínua de ocorrências por turno devido ao reforço em rondas preventivas.
          </p>
        </div>

        {/* Categories Distribution */}
        <div className="rounded-3xl bg-[#121620] border border-[#222B3B] p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#D4A373]" />
              Classificação por Categoria
            </h3>
            <span className="text-[10px] text-slate-400">Total: 100%</span>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-white">Segurança Patrimonial</span>
                <span className="font-bold text-[#D4A373]">36% (51 eventos)</span>
              </div>
              <div className="w-full bg-[#18202D] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#C68A4C] h-full rounded-full" style={{ width: '36%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-white">Trânsito & Frotas</span>
                <span className="font-bold text-[#38BDF8]">28% (40 eventos)</span>
              </div>
              <div className="w-full bg-[#18202D] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#38BDF8] h-full rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-white">Manutenção & Infraestrutura</span>
                <span className="font-bold text-[#94A3B8]">18% (25 eventos)</span>
              </div>
              <div className="w-full bg-[#18202D] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#94A3B8] h-full rounded-full" style={{ width: '18%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-white">Instabilidade de Tecnologia / Rastreamento</span>
                <span className="font-bold text-amber-400">10% (14 eventos)</span>
              </div>
              <div className="w-full bg-[#18202D] h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-white">Outros / Administrativo</span>
                <span className="font-bold text-slate-400">8% (12 eventos)</span>
              </div>
              <div className="w-full bg-[#18202D] h-2.5 rounded-full overflow-hidden">
                <div className="bg-slate-500 h-full rounded-full" style={{ width: '8%' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
