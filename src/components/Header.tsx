import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronDown, 
  Shield, 
  ShieldCheck, 
  RefreshCw,
  Cpu,
  Wifi,
  Satellite,
  Zap,
  Activity,
  Terminal,
  Layers,
  Sparkles
} from 'lucide-react';
import { Notification } from '../types';
import { ASSETS } from '../assets/brandAssets';

interface HeaderProps {
  notifications: Notification[];
  onMarkNotificationsAsRead: () => void;
  isFirebaseConnected: boolean;
  isAdmin?: boolean;
  onToggleAdminRole?: () => void;
  performanceMode?: boolean;
  onTogglePerformanceMode?: () => void;
  onTriggerBootSequence?: () => void;
}

export default function Header({
  notifications,
  onMarkNotificationsAsRead,
  isFirebaseConnected,
  isAdmin = true,
  onToggleAdminRole,
  performanceMode = false,
  onTogglePerformanceMode,
  onTriggerBootSequence,
}: HeaderProps) {
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-[#070A0F]/90 backdrop-blur-md border-b border-[#1A2536] sticky top-0 z-40 text-[#E2E8F0] select-none shadow-[0_4px_30px_rgba(0,0,0,0.7)]">
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Left Side: Telemetry Node, Location & High-Precision Clock */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs text-[#94A3B8] font-medium min-w-0">
          
          {/* Online System Status Pill */}
          <div 
            onClick={onTriggerBootSequence}
            className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#0B1410] border border-[#166534]/60 text-emerald-400 font-mono text-[11px] font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)] cursor-pointer hover:border-emerald-400 transition-all shrink-0"
            title="Clique para executar autodiagnóstico do sistema"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="tracking-wider">SISTEMA ONLINE (4K)</span>
          </div>

          {/* Satellite Telemetry Sync */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-[#D4A373] bg-[#141210] border border-[#422C1A] px-2.5 py-1 rounded-xl">
            <Satellite className="w-3.5 h-3.5 animate-pulse text-[#E2B170]" />
            <span>SASCAR SAT • 14ms</span>
          </div>

          {/* Location */}
          <div className="hidden md:flex items-center gap-1.5 hover:text-[#D4A373] transition-colors cursor-pointer">
            <MapPin className="w-3.5 h-3.5 text-[#D4A373]" />
            <span className="text-[#E2E8F0] font-semibold text-xs truncate">Fortaleza (Matriz)</span>
          </div>

          {/* High-tech Live Digital Clock */}
          <div className="hidden sm:flex items-center gap-2 bg-[#0C121C] border border-[#1E2C40] px-3 py-1 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-[#D4A373]" />
            <span className="font-mono text-white font-bold text-xs tracking-wider">
              {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-[10px] text-slate-500 font-mono hidden xl:inline">
              BRT UTC-3
            </span>
          </div>
        </div>

        {/* Right Side: Performance Mode, Security Shield, Notifications & User */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          
          {/* Performance Mode Switch (3D Ultra vs Eco Mode) */}
          {onTogglePerformanceMode && (
            <button
              onClick={onTogglePerformanceMode}
              title={performanceMode ? "Modo Eco Ativo (Clique para Ultra 3D)" : "Modo Ultra 3D Ativo (Clique para Modo Eco)"}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold font-mono transition-all cursor-pointer border ${
                performanceMode
                  ? 'bg-[#141B26] border-slate-700 text-slate-400 hover:text-white'
                  : 'bg-gradient-to-r from-[#2A1D13] to-[#17120D] border-[#D4A373]/60 text-[#E2B170] shadow-[0_0_15px_rgba(212,163,115,0.25)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{performanceMode ? 'ECO MODE' : 'ULTRA 3D'}</span>
            </button>
          )}

          {/* Shield Status Button */}
          <button 
            onClick={() => setShowSecurityModal(true)}
            title="Integridade e Segurança da Rede"
            className="w-9 h-9 rounded-xl bg-[#0D131D] border border-[#223048] flex items-center justify-center text-[#D4A373] hover:border-[#D4A373] hover:bg-[#141E2E] transition-all cursor-pointer shadow-md"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Notifications Bell with 3D Glass Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotificationDropdown(!showNotificationDropdown);
                if (!showNotificationDropdown && unreadCount > 0) {
                  onMarkNotificationsAsRead();
                }
              }}
              title="Notificações e Alertas"
              className="w-9 h-9 rounded-xl bg-[#0D131D] border border-[#223048] flex items-center justify-center text-[#E2E8F0] hover:border-[#D4A373] hover:text-[#D4A373] transition-all relative cursor-pointer shadow-md"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-[#070A0F] rounded-full flex items-center justify-center text-[8px] font-mono font-bold text-white shadow-sm animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotificationDropdown && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#0E1420]/95 backdrop-blur-xl border border-[#26374E] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-[#1C283B]">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#D4A373]" />
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Alertas & Telemetria</h3>
                  </div>
                  <span className="text-[10px] bg-[#162233] text-[#D4A373] border border-[#2B3F5C] px-2 py-0.5 rounded-md font-mono font-bold">
                    {notifications.length} logs
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto mt-2 space-y-2 divide-y divide-[#182333]">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 font-mono">
                      Nenhum alerta crítico ativo no momento.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="pt-2 first:pt-0">
                        <div className="flex items-start gap-2.5">
                          <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            notif.type === 'warning' ? 'bg-amber-400 shadow-[0_0_8px_#F59E0B]' :
                            notif.type === 'success' ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]' : 'bg-red-500 shadow-[0_0_8px_#EF4444]'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{notif.title}</p>
                            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{notif.message}</p>
                            <span className="text-[9px] font-mono text-slate-500 mt-1 block">
                              {new Date(notif.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Capsule */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 pl-2 pr-1.5 py-1 rounded-2xl bg-[#0D131D] border border-[#223048] hover:border-[#D4A373] transition-all group cursor-pointer shadow-md"
            >
              <div className="relative">
                <img 
                  src={ASSETS.cristianeAvatar} 
                  alt="Cristiane Fialho"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-xl object-cover ring-1 ring-[#D4A373]/80 group-hover:ring-[#D4A373] transition-all shadow-sm"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#070A0F]"></span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-black text-white leading-tight group-hover:text-[#D4A373] transition-colors">
                  Cristiane Fialho
                </span>
                <span className="text-[9px] font-mono text-[#D4A373] leading-none mt-0.5">
                  {isAdmin ? 'ADMINISTRADOR' : 'LÍDER DE TURNO'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-64 bg-[#0E1420]/95 backdrop-blur-xl border border-[#26374E] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-3 z-50">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#141E2C] border border-[#22334A] mb-2">
                  <img 
                    src={ASSETS.cristianeAvatar} 
                    alt="Cristiane Fialho"
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#D4A373]"
                  />
                  <div>
                    <p className="text-xs font-black text-white">Cristiane Fialho</p>
                    <p className="text-[10px] font-mono text-[#D4A373]">Matrícula 1-06126</p>
                    <p className="text-[10px] text-slate-400">Fortaleza, Ceará</p>
                  </div>
                </div>

                <div className="space-y-1">
                  {onToggleAdminRole && (
                    <button 
                      onClick={() => {
                        onToggleAdminRole();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:bg-[#182333] rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 text-[#D4A373]" />
                        Modo: <strong className="text-white">{isAdmin ? 'Admin' : 'Líder'}</strong>
                      </span>
                      <span className="text-[10px] bg-[#D4A373]/20 text-[#D4A373] px-2 py-0.5 rounded font-bold">
                        Alternar
                      </span>
                    </button>
                  )}

                  <div className="pt-2 border-t border-[#1C283B] mt-2">
                    <div className="px-3 py-1.5 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                      <span>NUVEM FIREBASE</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> CONECTADO
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Security Status Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C121C] border border-[#25354D] rounded-3xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(0,0,0,0.9)] text-[#E2E8F0]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Central de Segurança Integrada</h3>
                <p className="text-xs text-emerald-400 font-semibold font-mono">PROTOCOLOS 100% OPERACIONAIS</p>
              </div>
            </div>

            <div className="space-y-3 py-3 border-y border-[#1C283B] text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Criptografia de Rede:</span>
                <span className="font-semibold text-emerald-400">AES-256 / TLS 1.3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Banco em Nuvem:</span>
                <span className="font-semibold text-emerald-400">Firebase RTDB Ativo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Câmeras & Sensores:</span>
                <span className="font-semibold text-white">48/48 Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Rondas Patrimoniais:</span>
                <span className="font-semibold text-white">8 em andamento</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowSecurityModal(false)}
                className="px-5 py-2 rounded-xl bg-[#D4A373] text-[#0A0D12] text-xs font-extrabold hover:bg-[#E2B170] transition-colors cursor-pointer shadow-md"
              >
                Fechar Painel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
