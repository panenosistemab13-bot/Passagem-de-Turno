import React from 'react';
import { 
  LayoutDashboard, 
  FileEdit, 
  Repeat, 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  Video, 
  Radio, 
  TrendingUp, 
  Calendar, 
  Settings,
  Truck,
  History,
  UserCheck,
  X,
  Cpu,
  Activity
} from 'lucide-react';
import { ASSETS } from '../assets/brandAssets';
import ThreeDLogo from './ThreeDLogo';

export interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenBrandStory?: () => void;
}

export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard Geral', icon: LayoutDashboard, badge: 'LIVE' },
  { id: 'ocorrencias', label: 'Registro de Ocorrências', icon: FileEdit, badge: 'ISO' },
  { id: 'historico', label: 'Histórico & Auditoria', icon: History },
  { id: 'plantao', label: 'Passagem de Plantão', icon: Repeat },
  { id: 'lideres', label: 'Líderes & Equipes', icon: Users },
  { id: 'veiculos', label: 'Frotas & Telemetria', icon: Truck, badge: 'GPS' },
  { id: 'presenca', label: 'Presença & Escala', icon: UserCheck },
  { id: 'rondas', label: 'Rondas & Checklists', icon: ShieldCheck },
  { id: 'riscos', label: 'Riscos & Incidentes', icon: ShieldAlert },
  { id: 'cameras', label: 'CFTV & Monitoramento', icon: Video, badge: '48 ON' },
  { id: 'comunicacoes', label: 'Comunicações & Chat', icon: Radio },
  { id: 'relatorios', label: 'Relatórios & Analytics', icon: TrendingUp },
  { id: 'agenda', label: 'Agenda & Eventos', icon: Calendar },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  isOpenMobile,
  onCloseMobile,
  onOpenBrandStory
}: SidebarProps) {

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#070A0F]/95 backdrop-blur-2xl border-r border-[#192436] text-[#E2E8F0] select-none shadow-[10px_0_40px_rgba(0,0,0,0.8)]">
      
      {/* Top Brand Header with 3D Emblem */}
      <div className="pt-6 px-5 pb-4 flex items-center justify-between border-b border-[#141D2B]">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => handleSelectTab('dashboard')}
        >
          <div className="relative w-10 h-10 rounded-2xl p-0.5 bg-gradient-to-br from-[#E2B170] via-[#C68A4C] to-[#533621] shadow-[0_0_20px_rgba(212,163,115,0.3)] flex items-center justify-center group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0A0D12] rounded-[14px] flex items-center justify-center">
              <span className="font-serif font-black text-xs text-[#E2B170] tracking-tighter">3C</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-widest text-[#D4A373] uppercase font-sans">
              CAFÉ 3 CORAÇÕES
            </span>
            <span className="text-[10px] font-mono text-slate-400 -mt-0.5 tracking-wider">
              CENTRO DE COMANDO
            </span>
          </div>
        </div>

        {onCloseMobile && (
          <button 
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#141C29]"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 3D Interactive Brand Medallion */}
      <div className="px-5 py-4 flex flex-col items-center justify-center border-b border-[#141D2B]/80 bg-gradient-to-b from-[#0B1019]/60 to-transparent">
        <ThreeDLogo onClick={onOpenBrandStory} size={90} />
        <div className="mt-2 text-center">
          <span className="text-[10px] font-mono font-bold uppercase text-[#D4A373] tracking-widest block">
            DESDE 1959
          </span>
          <span className="text-[9px] text-slate-400 font-medium">
            Segurança, Qualidade e Tradição
          </span>
        </div>
      </div>

      {/* Navigation Links Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar">
        <div className="px-3 py-1.5 text-[9px] font-mono font-black uppercase tracking-[0.2em] text-[#64748B]">
          Módulos Operacionais
        </div>

        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || 
            (item.id === 'ocorrencias' && activeTab === 'registrar') ||
            (item.id === 'lideres' && activeTab === 'pastas') ||
            (item.id === 'comunicacoes' && activeTab === 'chat') ||
            (item.id === 'agenda' && activeTab === 'calendario');

          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer relative group ${
                isActive
                  ? 'bg-gradient-to-r from-[#2B1E14] to-[#16120D] text-[#FDE68A] border border-[#D4A373]/50 shadow-[0_0_20px_rgba(212,163,115,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-[#0F1622] border border-transparent'
              }`}
            >
              {/* Active Indicator Light on Left */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#E2B170] rounded-r-full shadow-[0_0_8px_#E2B170]" />
              )}

              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-[#D4A373]/20 text-[#E2B170]' : 'text-slate-400 group-hover:text-white group-hover:bg-[#162233]'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="truncate text-left">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                  isActive 
                    ? 'bg-[#D4A373] text-black font-extrabold shadow-sm'
                    : 'bg-[#152030] text-[#94A3B8] border border-[#223048]'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Telemetry HUD Box */}
      <div className="p-3.5 border-t border-[#141D2B] bg-[#05080C]/80">
        <div className="p-3 rounded-2xl bg-[#0B1019] border border-[#1C283B] space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" /> SENSOR REDE
            </span>
            <span className="text-emerald-400 font-bold">100% OK</span>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-[#D4A373]" /> MOTOR 3D
            </span>
            <span className="text-[#D4A373] font-bold">60 FPS</span>
          </div>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Floating Sidebar */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
