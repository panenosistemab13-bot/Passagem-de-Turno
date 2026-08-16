import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  FileSpreadsheet, 
  Plus, 
  SlidersHorizontal,
  ChevronRight,
  TrendingDown,
  Lock,
  Zap,
  Activity,
  Layers,
  Crosshair
} from 'lucide-react';
import ThreeDCard from './ThreeDCard';

export default function RiskManagement() {
  const [risks, setRisks] = useState([
    {
      id: 'r-1',
      title: 'Vulnerabilidade em Portão Perimetral 02',
      unit: 'Unidade Fortaleza / CE',
      severity: 'Crítico',
      probability: 'Média',
      impact: 'Alto',
      mitigationPlan: 'Reforço de vigilância armada e instalação de sensor de barreira infravermelho duplo.',
      deadline: '18/08/2026',
      responsible: 'Cristiane Fialho',
      status: 'Em Tratamento'
    },
    {
      id: 'r-2',
      title: 'Intermitência no Rastreamento Telemetria Sascar',
      unit: 'Frota Regional Nordeste',
      severity: 'Alto',
      probability: 'Alta',
      impact: 'Médio',
      mitigationPlan: 'Abertura de chamado emergencial e espelhamento redundante via Trafegus.',
      deadline: '16/08/2026',
      responsible: 'Airton Carvalho',
      status: 'Em Tratamento'
    },
    {
      id: 'r-3',
      title: 'Oscilação Térmica Silo de Grãos Cru #04',
      unit: 'CD Varginha / MG',
      severity: 'Médio',
      probability: 'Baixa',
      impact: 'Médio',
      mitigationPlan: 'Manutenção preventiva no sistema de exaustão e termometria.',
      deadline: '22/08/2026',
      responsible: 'Luzia Freitas',
      status: 'Acompanhamento'
    },
    {
      id: 'r-4',
      title: 'Falta de Iluminação no Acesso de Balança',
      unit: 'Fábrica Natal / RN',
      severity: 'Baixo',
      probability: 'Baixa',
      impact: 'Baixo',
      mitigationPlan: 'Substituição de 4 refletores LED de alta potência.',
      deadline: '19/08/2026',
      responsible: 'Lucas Alves',
      status: 'Resolvido'
    }
  ]);

  return (
    <div className="space-y-6 max-w-full overflow-hidden text-[#E2E8F0] select-none">
      
      {/* 3D Master Header */}
      <ThreeDCard className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#D4A373] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" /> ISO 31000 COMPLIANCE PROTOCOL
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight mt-1">
              Matriz de Riscos, Ameaças & Planos de Mitigação
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Identificação proativa de vulnerabilidades perimetrais, operacionais e de tecnologia da informação.
            </p>
          </div>

          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#84532B] via-[#D4A373] to-[#C68A4C] text-black text-xs font-bold shadow-[0_0_20px_rgba(212,163,115,0.3)] hover:brightness-110 transition-all cursor-pointer shrink-0">
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Risco</span>
          </button>
        </div>
      </ThreeDCard>

      {/* 4 3D Risk KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ThreeDCard glowColor="rgba(239, 68, 68, 0.25)" className="p-4 bg-[#140C0E]/90 border-red-900/40">
          <span className="text-[10px] font-mono uppercase font-bold text-red-400 flex items-center gap-1">
            <Flame className="w-3 h-3 text-red-500 animate-pulse" /> RISCOS CRÍTICOS
          </span>
          <p className="text-3xl font-black text-red-400 font-mono mt-1">01</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Intervenção Imediata</span>
        </ThreeDCard>

        <ThreeDCard glowColor="rgba(249, 115, 22, 0.2)" className="p-4 bg-[#14100C]/90 border-amber-900/40">
          <span className="text-[10px] font-mono uppercase font-bold text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-500" /> RISCO ELEVADO
          </span>
          <p className="text-3xl font-black text-amber-400 font-mono mt-1">01</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Plano de Contingência</span>
        </ThreeDCard>

        <ThreeDCard glowColor="rgba(59, 130, 246, 0.2)" className="p-4 bg-[#0C121A]/90 border-blue-900/40">
          <span className="text-[10px] font-mono uppercase font-bold text-blue-400 flex items-center gap-1">
            <Activity className="w-3 h-3 text-blue-500" /> RISCO MODERADO
          </span>
          <p className="text-3xl font-black text-blue-400 font-mono mt-1">01</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Monitoramento Contínuo</span>
        </ThreeDCard>

        <ThreeDCard glowColor="rgba(16, 185, 129, 0.2)" className="p-4 bg-[#0C1612]/90 border-emerald-900/40">
          <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> CONTROLADOS
          </span>
          <p className="text-3xl font-black text-emerald-400 font-mono mt-1">01</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Mitigado com Sucesso</span>
        </ThreeDCard>
      </div>

      {/* 3D Holographic ISO 31000 Matrix Heatmap */}
      <ThreeDCard className="p-5 sm:p-6">
        <div className="flex items-center justify-between border-b border-[#1A2536] pb-3 mb-5">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-[#D4A373]" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Matriz 5x5 de Probabilidade vs Impacto (ISO 31000)
            </h3>
          </div>
          <span className="text-[10px] font-mono bg-[#141C29] text-[#D4A373] px-2 py-0.5 rounded border border-[#223048]">
            Atualização em Tempo Real
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-mono">
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 font-bold flex flex-col items-center justify-center">
            <span>MUITO ALTO</span>
            <span className="text-xs font-black text-white mt-1">Crítico (r-1)</span>
          </div>
          <div className="p-3 rounded-xl bg-orange-950/60 border border-orange-800 text-orange-300 font-bold flex flex-col items-center justify-center">
            <span>ALTO</span>
            <span className="text-xs font-black text-white mt-1">Severo (r-2)</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 font-bold flex flex-col items-center justify-center">
            <span>MÉDIO</span>
            <span className="text-xs font-black text-white mt-1">Moderado (r-3)</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800 text-blue-300 font-bold flex flex-col items-center justify-center">
            <span>BAIXO</span>
            <span className="text-xs font-black text-white mt-1">Aceitável</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-bold flex flex-col items-center justify-center">
            <span>MÍNIMO</span>
            <span className="text-xs font-black text-white mt-1">Insignificante (r-4)</span>
          </div>
        </div>
      </ThreeDCard>

      {/* Risk Actions Dossier Feed */}
      <div className="space-y-4">
        {risks.map((risk) => (
          <ThreeDCard key={risk.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                  risk.severity === 'Crítico' ? 'bg-red-950 text-red-400 border border-red-800 shadow-[0_0_10px_rgba(239,68,68,0.3)]' :
                  risk.severity === 'Alto' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                  risk.severity === 'Médio' ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {risk.severity}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-[#121A26] px-2 py-0.5 rounded border border-[#1E2B40]">
                  {risk.unit}
                </span>
                <span className="text-[10px] font-mono text-[#D4A373]">
                  Resp: {risk.responsible}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white">{risk.title}</h4>
              <p className="text-xs text-slate-300 bg-[#090D14] p-3 rounded-xl border border-[#162233]">
                <strong className="text-[#D4A373]">Plano de Mitigação:</strong> {risk.mitigationPlan}
              </p>
            </div>

            <div className="shrink-0 text-right space-y-2">
              <span className={`inline-block text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md ${
                risk.status === 'Resolvido' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' : 'bg-amber-950/80 text-amber-400 border border-amber-800'
              }`}>
                {risk.status}
              </span>
              <p className="text-[10px] font-mono text-slate-500">Prazo: {risk.deadline}</p>
            </div>
          </ThreeDCard>
        ))}
      </div>

    </div>
  );
}
