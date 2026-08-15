import React, { useState } from 'react';
import { Leader, Notification } from '../types';
import { 
  Bell, 
  User, 
  Shield, 
  ShieldAlert,
  Plus, 
  Clock, 
  CalendarDays,
  Coffee,
  Check,
  UserCheck
} from 'lucide-react';

interface HeaderProps {
  leaders: Leader[];
  selectedLeaderId: string;
  setSelectedLeaderId: (id: string) => void;
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
  notifications: Notification[];
  onMarkNotificationsAsRead: () => void;
  onAddLeader: (name: string, role: string) => void;
}

export default function Header({
  leaders,
  selectedLeaderId,
  setSelectedLeaderId,
  isAdmin,
  setIsAdmin,
  notifications,
  onMarkNotificationsAsRead,
  onAddLeader
}: HeaderProps) {
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showLeaderDropdown, setShowLeaderDropdown] = useState(false);
  const [showAddLeaderForm, setShowAddLeaderForm] = useState(false);
  const [newLeaderName, setNewLeaderName] = useState('');
  const [newLeaderRole, setNewLeaderRole] = useState('Líder de Turno');

  const selectedLeader = leaders.find(l => l.id === selectedLeaderId);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleCreateLeaderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLeaderName.trim()) {
      onAddLeader(newLeaderName.trim(), newLeaderRole);
      setNewLeaderName('');
      setShowAddLeaderForm(false);
    }
  };

  const handleSelectLeader = (id: string) => {
    setSelectedLeaderId(id);
    setShowLeaderDropdown(false);
  };

  // Get current date formatted like "Plantão 15/08/2026"
  const getFormattedShiftDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `Plantão ${day}/${month}/${year}`;
  };

  return (
    <header className="bg-white text-[#2C1810] py-2 px-6 flex flex-wrap items-center justify-between border-b border-[#E0D8D0] shadow-sm sticky top-0 z-50">
      
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="relative p-1.5 bg-[#C8102E] rounded-lg shadow-sm">
          <Coffee className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-[9px] tracking-widest text-[#8C7B70] font-black uppercase block">Café Três Corações</span>
          <h1 className="text-sm font-extrabold leading-none tracking-tight text-[#2C1810] flex items-center gap-1">
            Controle de Turno
            <span className="text-[9px] bg-[#C8102E]/10 text-[#C8102E] px-1.5 py-0.5 rounded font-bold border border-[#C8102E]/20">PRO</span>
          </h1>
        </div>
      </div>

      {/* Date and Time Indicator */}
      <div className="hidden lg:flex items-center gap-3 bg-[#F4F1EE] px-3 py-1 rounded-lg border border-[#E0D8D0] text-xs">
        <div className="flex items-center gap-1 text-[#5D4037] font-semibold">
          <CalendarDays className="w-3.5 h-3.5 text-[#C8102E]" />
          <span>{getFormattedShiftDate()}</span>
        </div>
        <div className="w-px h-3.5 bg-[#E0D8D0]" />
        <div className="flex items-center gap-1 text-[#5D4037] font-semibold">
          <Clock className="w-3.5 h-3.5 text-[#C8102E]" />
          <span>10:28 (Simulado)</span>
        </div>
      </div>

      {/* Control Actions / Menus */}
      <div className="flex items-center gap-3 mt-3 sm:mt-0">
        
        {/* Administrator Mode Toggle */}
        <button
          onClick={() => setIsAdmin(!isAdmin)}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border ${
            isAdmin 
              ? 'bg-[#C8102E]/10 text-[#C8102E] border-[#C8102E]/30 shadow-sm' 
              : 'bg-[#F4F1EE] text-[#8C7B70] border-[#E0D8D0] hover:bg-white'
          }`}
          title="Alternar entre modo operador e administrador com permissões totais"
        >
          {isAdmin ? (
            <>
              <Shield className="w-3.5 h-3.5 text-[#C8102E]" />
              <span>Admin Ativo</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-[#8C7B70]" />
              <span>Modo Padrão</span>
            </>
          )}
        </button>

        {/* Dynamic Leader Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLeaderDropdown(!showLeaderDropdown);
              setShowNotificationDropdown(false);
            }}
            className="flex items-center gap-1.5 bg-[#F4F1EE] hover:bg-white px-3 py-1 border border-[#E0D8D0] rounded-lg text-xs font-bold text-[#2C1810] cursor-pointer transition-all duration-150"
          >
            <User className="w-3.5 h-3.5 text-[#C8102E]" />
            <span className="max-w-[120px] truncate">
              {selectedLeader ? selectedLeader.name : 'Selecionar Líder'}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 border border-green-600 shadow-sm ml-0.5" />
          </button>

          {showLeaderDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E0D8D0] rounded-lg shadow-xl py-1 z-50 text-[#2C1810]">
              <div className="px-3 py-1.5 border-b border-[#F4F1EE] flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#8C7B70]">Líderes Ativos</span>
                <button 
                  onClick={() => setShowAddLeaderForm(!showAddLeaderForm)}
                  className="text-[#C8102E] hover:underline p-1 rounded flex items-center gap-0.5 text-[10px] font-bold"
                >
                  <Plus className="w-3 h-3" /> Adicionar
                </button>
              </div>

              {/* Add New Leader Form */}
              {showAddLeaderForm && (
                <form onSubmit={handleCreateLeaderSubmit} className="p-3 bg-[#F4F1EE] border-b border-[#E0D8D0]">
                  <div className="space-y-2">
                    <div>
                      <label className="text-[9px] text-[#8C7B70] block font-bold mb-1 uppercase">Nome Completo</label>
                      <input 
                        type="text" 
                        value={newLeaderName}
                        onChange={(e) => setNewLeaderName(e.target.value)}
                        placeholder="Ex: João da Silva"
                        className="w-full bg-white border border-[#E0D8D0] rounded px-2 py-1 text-xs text-[#2C1810] focus:outline-none focus:border-[#C8102E]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-[#8C7B70] block font-bold mb-1 uppercase">Cargo/Função</label>
                      <input 
                        type="text" 
                        value={newLeaderRole}
                        onChange={(e) => setNewLeaderRole(e.target.value)}
                        placeholder="Ex: Líder de Turno A"
                        className="w-full bg-white border border-[#E0D8D0] rounded px-2 py-1 text-xs text-[#2C1810] focus:outline-none focus:border-[#C8102E]"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button 
                        type="submit"
                        className="w-full bg-[#C8102E] hover:bg-[#a80c24] text-white rounded text-xs font-bold py-1 flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Confirmar
                      </button>
                      <button 
                        type="button"
                        onClick={() => setShowAddLeaderForm(false)}
                        className="w-1/2 bg-white border border-[#E0D8D0] hover:bg-[#F4F1EE] text-[#8C7B70] rounded text-xs py-1"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Leaders List */}
              <div className="max-h-60 overflow-y-auto">
                {leaders.map((leader) => (
                  <button
                    key={leader.id}
                    onClick={() => handleSelectLeader(leader.id)}
                    className={`w-full px-3 py-2 hover:bg-[#F4F1EE] text-left flex items-center justify-between text-xs transition-colors ${
                      leader.id === selectedLeaderId ? 'bg-[#C8102E]/5 text-[#C8102E] font-bold' : ''
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1">
                        {leader.name}
                        {leader.id === selectedLeaderId && <UserCheck className="w-3.5 h-3.5 text-[#C8102E]" />}
                      </div>
                      <div className="text-[9px] text-[#8C7B70]">{leader.role}</div>
                    </div>
                    {leader.id === selectedLeaderId && (
                      <span className="w-2 h-2 rounded-full bg-[#C8102E] animate-ping" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationDropdown(!showNotificationDropdown);
              setShowLeaderDropdown(false);
              if (!showNotificationDropdown && unreadCount > 0) {
                onMarkNotificationsAsRead();
              }
            }}
            className="p-1.5 rounded-lg bg-[#F4F1EE] border border-[#E0D8D0] hover:bg-white text-[#2C1810] relative cursor-pointer transition-colors"
          >
            <Bell className="w-4 h-4 text-[#2C1810]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C8102E] text-white font-black text-[9px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotificationDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E0D8D0] rounded-lg shadow-xl py-1 z-50 text-[#2C1810]">
              <div className="px-3 py-1.5 border-b border-[#F4F1EE] flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#8C7B70]">Notificações</span>
                <button 
                  onClick={onMarkNotificationsAsRead}
                  className="text-[10px] text-[#C8102E] font-bold hover:underline"
                >
                  Limpar Alertas
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-[#8C7B70]">
                    Nenhuma notificação registrada.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`px-3 py-2 border-b border-[#F4F1EE] text-xs transition-colors ${
                        notif.read ? 'opacity-50' : 'bg-[#F4F1EE]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className={`font-black uppercase text-[8px] px-1.5 py-0.5 rounded ${
                          notif.type === 'warning' ? 'bg-red-50 text-red-600 border border-red-200' :
                          notif.type === 'success' ? 'bg-green-50 text-green-600 border border-green-200' :
                          'bg-blue-50 text-blue-600 border border-blue-200'
                        }`}>
                          {notif.type === 'warning' ? 'ALERTA DE RISCO' : notif.type === 'success' ? 'RESOLVIDO' : 'INFO'}
                        </span>
                        <span className="text-[9px] text-[#8C7B70]">Agora</span>
                      </div>
                      <h5 className="font-bold text-[#2C1810] text-[11px]">{notif.title}</h5>
                      <p className="text-[#5D4037] text-[10px] leading-tight">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
