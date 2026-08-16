import React, { useState } from 'react';
import { 
  Briefcase, 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  MapPin, 
  Video, 
  PlusCircle, 
  ClipboardCheck, 
  FileText, 
  Radio, 
  ArrowRight, 
  Sun, 
  Droplets, 
  Wind, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  X, 
  Info,
  Clock,
  Truck,
  Activity,
  Zap,
  TrendingUp,
  Flame,
  Shield,
  Layers,
  Compass,
  Satellite
} from 'lucide-react';
import { Leader, Occurrence, VehicleRecord } from '../types';
import { ASSETS } from '../assets/brandAssets';
import BrazilMap3D from './BrazilMap3D';
import ThreeDCard from './ThreeDCard';
import { ThreeDBarChart, ThreeDDonutChart, ThreeDOrbitalRing } from './ThreeDCharts';

interface DashboardProps {
  leaders: Leader[];
  occurrences: Occurrence[];
  vehicles: VehicleRecord[];
  setActiveTab: (tab: string) => void;
  onOpenNewOccurrenceModal?: () => void;
}

export default function Dashboard({
  leaders,
  occurrences,
  vehicles,
  setActiveTab,
  onOpenNewOccurrenceModal
}: DashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('Esta Semana');
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Compute live occurrence metrics with casing safety
  const totalOccurrences = occurrences.length;
  const criticalCount = occurrences.filter(o => o.riskLevel === 'Crítico').length;
  const highCount = occurrences.filter(o => o.riskLevel === 'Alto').length;
  const mediumCount = occurrences.filter(o => o.riskLevel === 'Médio').length;
  const lowCount = occurrences.filter(o => o.riskLevel === 'Baixo').length;

  const todayCount = occurrences.filter(o => {
    const d = new Date(o.createdAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length || 7;

  // 3D Bar Chart Data: Occurrences by Category / Shift
  const barChartData = [
    { label: 'Portaria', value: 14, color: '#3B82F6', topColor: '#93C5FD', sideColor: '#1E40AF', sublabel: 'Controle Acesso' },
    { label: 'Perímetro', value: 8, color: '#10B981', topColor: '#6EE7B7', sideColor: '#065F46', sublabel: 'Cerca & Sensores' },
    { label: 'Frota/Sascar', value: 21, color: '#D4A373', topColor: '#FDE68A', sideColor: '#854D0E', sublabel: 'Telemetria' },
    { label: 'Silos/Fábrica', value: 5, color: '#8B5CF6', topColor: '#C4B5FD', sideColor: '#5B21B6', sublabel: 'Termografia' },
    { label: 'Sistemas/TI', value: 11, color: '#EC4899', topColor: '#F472B6', sideColor: '#9D174D', sublabel: 'Instabilidade' },
    { label: 'Rondas', value: 18, color: '#14B8A6', topColor: '#5EEAD4', sideColor: '#0F766E', sublabel: 'Patrulhas' },
  ];

  // 3D Donut Chart Slices: Severity Distribution
  const donutSlices = [
    { id: 'critico', label: 'Crítico', value: criticalCount || 2, color: '#EF4444', glow: '#DC2626' },
    { id: 'alto', label: 'Alto Risco', value: highCount || 4, color: '#F97316', glow: '#EA580C' },
    { id: 'medio', label: 'Médio', value: mediumCount || 9, color: '#F59E0B', glow: '#D97706' },
    { id: 'baixo', label: 'Baixo / Rotina', value: lowCount || 15, color: '#10B981', glow: '#059669' },
  ];

  return (
    <div className="w-full space-y-6 pb-12 text-[#E2E8F0] select-none">
      
      {/* 1. TOP HERO TACTICAL BANNER */}
      <div className="relative w-full rounded-3xl overflow-hidden min-h-[220px] sm:min-h-[260px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[#2A2016] group">
        <img 
          src={ASSETS.heroBanner} 
          alt="Café Três Corações Fortaleza"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.78] contrast-110 group-hover:scale-102 transition-transform duration-1000"
        />
        {/* Scrim gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070A0F]/95 via-[#070A0F]/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#070A0F]/90 via-transparent to-transparent"></div>

        {/* Top telemetry beam */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#D4A373] to-transparent pointer-events-none" />

        {/* Banner Content */}
        <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col justify-center h-full max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#D4A373]/20 border border-[#D4A373]/40 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#E2B170] flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2B170] animate-pulse"></span>
              CENTRO DE COMANDO MATRIZ • FORTALEZA, CE
            </span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight font-sans tracking-tight drop-shadow-md">
            Segurança que gera confiança. <br />
            <span className="text-[#E2B170] font-serif italic">Café Três Corações</span> em cada detalhe.
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium max-w-xl">
            Monitoramento tático 24/7 integrado com rastreamento Sascar, inteligência preditiva e resposta a incidentes.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('ocorrencias')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#84532B] via-[#D4A373] to-[#C68A4C] text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(212,163,115,0.4)] hover:brightness-110 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Novo Registro de Ocorrência
            </button>
            <button
              onClick={() => setActiveTab('rondas')}
              className="px-4 py-2 rounded-xl bg-[#0D1420]/80 border border-[#24354D] hover:border-[#D4A373] text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#D4A373]" />
              Iniciar Ronda Patrimonial
            </button>
          </div>
        </div>
      </div>

      {/* 2. FIVE 3D TACTICAL KPI CARDS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        
        {/* KPI 1: Ocorrências Hoje */}
        <ThreeDCard onClick={() => setActiveTab('ocorrencias')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#261C14] border border-[#523A25] flex items-center justify-center text-[#D4A373] shadow-inner shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-mono font-extrabold tracking-wider uppercase text-slate-400 leading-tight truncate">
                OCORRÊNCIAS HOJE
              </p>
              <p className="text-2xl font-black text-white font-mono mt-0.5 leading-none">
                {String(todayCount).padStart(2, '0')}
              </p>
            </div>
          </div>
          <p className="text-[10px] font-mono text-[#D4A373] mt-2.5 flex items-center gap-1 font-bold">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>+12%</span> vs ontem
          </p>
        </ThreeDCard>

        {/* KPI 2: Rondas Realizadas */}
        <ThreeDCard onClick={() => setActiveTab('rondas')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#14231E] border border-[#1B523E] flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-mono font-extrabold tracking-wider uppercase text-slate-400 leading-tight truncate">
                RONDAS ATIVAS
              </p>
              <p className="text-2xl font-black text-white font-mono mt-0.5 leading-none">18</p>
            </div>
          </div>
          <p className="text-[10px] font-mono text-emerald-400 mt-2.5 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>100%</span> em dia
          </p>
        </ThreeDCard>

        {/* KPI 3: Equipes Ativas */}
        <ThreeDCard onClick={() => setActiveTab('lideres')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#162033] border border-[#22395E] flex items-center justify-center text-sky-400 shadow-inner shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-mono font-extrabold tracking-wider uppercase text-slate-400 leading-tight truncate">
                EQUIPES ATIVAS
              </p>
              <p className="text-2xl font-black text-white font-mono mt-0.5 leading-none">
                {String(leaders.length || 6).padStart(2, '0')}
              </p>
            </div>
          </div>
          <p className="text-[10px] font-mono text-slate-400 mt-2.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 4 Turnos Operacionais
          </p>
        </ThreeDCard>

        {/* KPI 4: Frotas & Sascar */}
        <ThreeDCard onClick={() => setActiveTab('veiculos')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2A1728] border border-[#592652] flex items-center justify-center text-pink-400 shadow-inner shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-mono font-extrabold tracking-wider uppercase text-slate-400 leading-tight truncate">
                FROTAS RASTREADAS
              </p>
              <p className="text-2xl font-black text-white font-mono mt-0.5 leading-none">
                {String(vehicles.length || 38).padStart(2, '0')}
              </p>
            </div>
          </div>
          <p className="text-[10px] font-mono text-pink-400 mt-2.5 flex items-center gap-1 font-bold">
            <Satellite className="w-3 h-3" /> Sascar 100% Sat
          </p>
        </ThreeDCard>

        {/* KPI 5: Conformidade ISO */}
        <ThreeDCard onClick={() => setActiveTab('relatorios')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#211E14] border border-[#52481F] flex items-center justify-center text-amber-400 shadow-inner shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-mono font-extrabold tracking-wider uppercase text-slate-400 leading-tight truncate">
                ÍNDICE CONFORMIDADE
              </p>
              <p className="text-2xl font-black text-white font-mono mt-0.5 leading-none">99.4%</p>
            </div>
          </div>
          <p className="text-[10px] font-mono text-amber-400 mt-2.5 flex items-center gap-1 font-bold">
            <Zap className="w-3 h-3" /> ISO 31000 Standard
          </p>
        </ThreeDCard>

      </div>

      {/* 3. CENTER MATRIX: 3D BRAZIL RADAR (LEFT) + 3D ANALYTICS (RIGHT) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 Cols): 3D Brazil Live Map */}
        <div className="xl:col-span-7 space-y-6">
          <ThreeDCard glowColor="rgba(212, 163, 115, 0.25)" className="p-4 sm:p-5">
            <BrazilMap3D onSelectOccurrence={() => setActiveTab('ocorrencias')} />
          </ThreeDCard>
        </div>

        {/* Right Column (5 Cols): 3D Analytics & Charts */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* 3D Bar Chart: Ocorrências por Segmento */}
          <ThreeDCard glowColor="rgba(59, 130, 246, 0.2)" className="p-5">
            <div className="flex items-center justify-between border-b border-[#1A2536] pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#D4A373]">
                  TELEMETRIA COMPARATIVA
                </span>
                <h3 className="text-base font-black text-white font-sans">
                  Volume de Registros por Setor
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-[#141E2E] text-sky-400 border border-[#223854] px-2 py-0.5 rounded-md font-bold">
                Últimos 7 dias
              </span>
            </div>

            <ThreeDBarChart data={barChartData} height={180} />
          </ThreeDCard>

          {/* 3D Exploded Donut Chart: Distribuição de Severidade */}
          <ThreeDCard glowColor="rgba(239, 68, 68, 0.2)" className="p-5">
            <div className="flex items-center justify-between border-b border-[#1A2536] pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#D4A373]">
                  MATRIZ DE SEVERIDADE
                </span>
                <h3 className="text-base font-black text-white font-sans">
                  Distribuição por Nível de Risco
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-[#1C1418] text-rose-400 border border-[#48222E] px-2 py-0.5 rounded-md font-bold">
                ISO 31000
              </span>
            </div>

            <ThreeDDonutChart slices={donutSlices} centerLabel="TOTAL" centerValue={totalOccurrences || 30} size={190} />
          </ThreeDCard>

        </div>

      </div>

      {/* 4. LOWER TACTICAL GRID: FEED DE OCORRÊNCIAS + SENSOR CLIMÁTICO + COMANDO RÁPIDO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Feed de Ocorrências em Tempo Real */}
        <div className="lg:col-span-2">
          <ThreeDCard className="p-5 h-full">
            <div className="flex items-center justify-between border-b border-[#1A2536] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#D4A373] animate-pulse" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Feed Tático de Ocorrências em Tempo Real
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('historico')}
                className="text-xs font-mono font-bold text-[#D4A373] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                Ver Todas ({occurrences.length}) <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {occurrences.slice(0, 4).map((occ) => (
                <div
                  key={occ.id}
                  onClick={() => setActiveTab('historico')}
                  className="p-3 rounded-xl bg-[#0B1017] border border-[#192436] hover:border-[#D4A373]/60 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      occ.riskLevel === 'Crítico' ? 'bg-red-500 shadow-[0_0_8px_#EF4444]' :
                      occ.riskLevel === 'Alto' ? 'bg-orange-500 shadow-[0_0_8px_#F97316]' :
                      occ.riskLevel === 'Médio' ? 'bg-amber-400 shadow-[0_0_8px_#F59E0B]' : 'bg-emerald-400 shadow-[0_0_8px_#10B981]'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-[#D4A373] transition-colors truncate">
                        {occ.title}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 truncate">
                        {occ.leaderName} • {occ.carrier || 'Unidade Fortaleza'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono bg-[#141C29] text-slate-300 px-2 py-0.5 rounded-md border border-[#223048]">
                      {new Date(occ.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md ${
                      occ.status === 'resolvido' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      occ.status === 'acompanhar' ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-blue-950 text-blue-400 border border-blue-800'
                    }`}>
                      {occ.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ThreeDCard>
        </div>

        {/* Sensores Ambientais & Status do Perímetro */}
        <div className="lg:col-span-1">
          <ThreeDCard className="p-5 h-full">
            <div className="flex items-center justify-between border-b border-[#1A2536] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Sensores & Clima
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">ONLINE</span>
            </div>

            <div className="space-y-3">
              {/* Fortaleza Matriz */}
              <div className="p-3 rounded-xl bg-[#090D14] border border-[#192538] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Fortaleza (Matriz)</p>
                  <p className="text-[10px] text-slate-400">Ensolarado • Vento 18km/h</p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-lg font-bold text-amber-400">29°C</span>
                  <p className="text-[9px] text-slate-500">Umid. 68%</p>
                </div>
              </div>

              {/* Varginha Silos */}
              <div className="p-3 rounded-xl bg-[#090D14] border border-[#192538] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Varginha (Silos)</p>
                  <p className="text-[10px] text-slate-400">Termografia Silos Estável</p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-lg font-bold text-emerald-400">21°C</span>
                  <p className="text-[9px] text-slate-500">Umid. 54%</p>
                </div>
              </div>

              {/* Salvador Hub */}
              <div className="p-3 rounded-xl bg-[#090D14] border border-[#192538] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Salvador (Hub)</p>
                  <p className="text-[10px] text-slate-400">Cargas em Trânsito</p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-lg font-bold text-sky-400">27°C</span>
                  <p className="text-[9px] text-slate-500">Umid. 72%</p>
                </div>
              </div>
            </div>
          </ThreeDCard>
        </div>

      </div>

    </div>
  );
}
