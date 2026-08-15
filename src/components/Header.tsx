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
  UserCheck,
  Trash2,
  Edit,
  X
} from 'lucide-react';

interface HeaderProps {
  leaders: Leader[];
  selectedLeaderId: string;
  setSelectedLeaderId: (id: string) => void;
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
  notifications: Notification[];
  onMarkNotificationsAsRead: () => void;
  onAddLeader: (name: string, role: string, shift?: string) => void;
  onDeleteLeader: (id: string) => void;
  onUpdateLeader: (id: string, name: string, role: string, shift?: string) => void;
}

export default function Header({
  leaders,
  selectedLeaderId,
  setSelectedLeaderId,
  isAdmin,
  setIsAdmin,
  notifications,
  onMarkNotificationsAsRead,
  onAddLeader,
  onDeleteLeader,
  onUpdateLeader
}: HeaderProps) {
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showLeaderDropdown, setShowLeaderDropdown] = useState(false);
  const [showAddLeaderForm, setShowAddLeaderForm] = useState(false);
  const [newLeaderName, setNewLeaderName] = useState('');
  const [newLeaderRole, setNewLeaderRole] = useState('Líder diurna');
  const [newLeaderShift, setNewLeaderShift] = useState('Plantões A e B');

  // Inline Leader Editing State
  const [editingLeaderId, setEditingLeaderId] = useState<string | null>(null);
  const [editLeaderName, setEditLeaderName] = useState('');
  const [editLeaderRole, setEditLeaderRole] = useState('');
  const [editLeaderShift, setEditLeaderShift] = useState('');

  const selectedLeader = leaders.find(l => l.id === selectedLeaderId);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleCreateLeaderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLeaderName.trim()) {
      onAddLeader(newLeaderName.trim(), newLeaderRole.trim(), newLeaderShift.trim());
      setNewLeaderName('');
      setNewLeaderRole('Líder diurna');
      setNewLeaderShift('Plantões A e B');
      setShowAddLeaderForm(false);
    }
  };

  const handleSelectLeader = (id: string) => {
    setSelectedLeaderId(id);
    setShowLeaderDropdown(false);
  };

  const startEditingLeader = (leader: Leader) => {
    setEditingLeaderId(leader.id);
    setEditLeaderName(leader.name);
    setEditLeaderRole(leader.role);
    setEditLeaderShift(leader.shift || 'Plantão A');
  };

  const cancelEditingLeader = () => {
    setEditingLeaderId(null);
  };

  const handleSaveLeaderEdit = (id: string) => {
    if (editLeaderName.trim()) {
      onUpdateLeader(id, editLeaderName.trim(), editLeaderRole.trim(), editLeaderShift.trim());
      setEditingLeaderId(null);
    }
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
            className="flex items-center gap-2 bg-[#F4F1EE] hover:bg-white px-3 py-1.5 border border-[#E0D8D0] rounded-lg text-xs font-bold text-[#2C1810] cursor-pointer transition-all duration-150 shadow-sm"
          >
            <User className="w-3.5 h-3.5 text-[#C8102E]" />
            <div className="flex items-center gap-1.5 max-w-[200px] truncate">
              <span className="truncate">{selectedLeader ? selectedLeader.name : 'Selecionar Líder'}</span>
              {selectedLeader?.shift && (
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-[#C8102E]/10 text-[#C8102E] border border-[#C8102E]/20">
                  {selectedLeader.shift}
                </span>
              )}
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 border border-green-600 shadow-sm ml-0.5" />
          </button>

          {showLeaderDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E0D8D0] rounded-lg shadow-xl py-1 z-50 text-[#2C1810]">
              <div className="px-3 py-2 border-b border-[#F4F1EE] flex items-center justify-between bg-[#FAF9F7]">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#2C1810] block">Líderes Ativos</span>
                  <span className="text-[9px] text-[#8C7B70]">Gerencie líderes, funções e plantões operacionais</span>
                </div>
                <button 
                  onClick={() => setShowAddLeaderForm(!showAddLeaderForm)}
                  className="bg-[#C8102E] text-white hover:bg-[#a80c24] px-2.5 py-1 rounded flex items-center gap-1 text-[10px] font-bold shadow-xs cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Adicionar
                </button>
              </div>

              {/* Add New Leader Form */}
              {showAddLeaderForm && (
                <form onSubmit={handleCreateLeaderSubmit} className="p-3 bg-[#F4F1EE] border-b border-[#E0D8D0] space-y-2">
                  <div className="text-[10px] font-black uppercase text-[#C8102E]">Novo Líder de Plantão</div>
                  <div>
                    <label className="text-[9px] text-[#8C7B70] block font-bold mb-0.5 uppercase">Nome Completo <span className="text-[#C8102E]">*</span></label>
                    <input 
                      type="text" 
                      value={newLeaderName}
                      onChange={(e) => setNewLeaderName(e.target.value)}
                      placeholder="Ex: Cristiane Fialho"
                      className="w-full bg-white border border-[#E0D8D0] rounded px-2 py-1 text-xs text-[#2C1810] font-semibold focus:outline-none focus:border-[#C8102E]"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-[#8C7B70] block font-bold mb-0.5 uppercase">Função / Cargo</label>
                      <input 
                        type="text" 
                        value={newLeaderRole}
                        onChange={(e) => setNewLeaderRole(e.target.value)}
                        placeholder="Ex: Líder diurna"
                        className="w-full bg-white border border-[#E0D8D0] rounded px-2 py-1 text-xs text-[#2C1810] font-semibold focus:outline-none focus:border-[#C8102E]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-[#8C7B70] block font-bold mb-0.5 uppercase">Plantão Separado</label>
                      <select
                        value={newLeaderShift}
                        onChange={(e) => setNewLeaderShift(e.target.value)}
                        className="w-full bg-white border border-[#E0D8D0] rounded px-2 py-1 text-xs text-[#2C1810] font-semibold focus:outline-none focus:border-[#C8102E]"
                      >
                        <option value="Plantão A">Plantão A</option>
                        <option value="Plantão B">Plantão B</option>
                        <option value="Plantões A e B">Plantões A e B</option>
                        <option value="Plantão C">Plantão C</option>
                        <option value="Plantão Geral">Plantão Geral</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button 
                      type="submit"
                      className="flex-1 bg-[#C8102E] hover:bg-[#a80c24] text-white rounded text-xs font-bold py-1 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" /> Salvar Líder
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowAddLeaderForm(false)}
                      className="px-3 bg-white border border-[#E0D8D0] hover:bg-slate-50 text-[#8C7B70] rounded text-xs py-1 cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* Leaders List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-[#F4F1EE]">
                {leaders.map((leader) => {
                  const isEditing = editingLeaderId === leader.id;

                  if (isEditing) {
                    return (
                      <div key={leader.id} className="p-3 bg-[#F4F1EE] border-b border-[#E0D8D0] space-y-2">
                        <div className="text-[10px] font-black uppercase text-[#C8102E]">Editar Cadastro do Líder</div>
                        <div>
                          <label className="text-[8px] text-[#8C7B70] font-black uppercase block mb-0.5">Nome</label>
                          <input 
                            type="text"
                            value={editLeaderName}
                            onChange={(e) => setEditLeaderName(e.target.value)}
                            className="w-full bg-white border border-[#E0D8D0] rounded px-2 py-1 text-xs text-[#2C1810] font-bold focus:outline-none focus:border-[#C8102E]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[8px] text-[#8C7B70] font-black uppercase block mb-0.5">Função</label>
                            <input 
                              type="text"
                              value={editLeaderRole}
                              onChange={(e) => setEditLeaderRole(e.target.value)}
                              placeholder="Ex: Noturno, Líder diurna"
                              className="w-full bg-white border border-[#E0D8D0] rounded px-2 py-1 text-xs text-[#2C1810] focus:outline-none focus:border-[#C8102E]"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] text-[#8C7B70] font-black uppercase block mb-0.5">Plantão</label>
                            <input 
                              type="text"
                              value={editLeaderShift}
                              onChange={(e) => setEditLeaderShift(e.target.value)}
                              placeholder="Ex: Plantão A, Plantão B"
                              className="w-full bg-white border border-[#E0D8D0] rounded px-2 py-1 text-xs text-[#2C1810] font-bold focus:outline-none focus:border-[#C8102E]"
                            />
                          </div>
                        </div>
                        <div className="flex gap-1.5 pt-0.5">
                          <button
                            onClick={() => handleSaveLeaderEdit(leader.id)}
                            className="flex-1 bg-[#C8102E] hover:bg-[#a80c24] text-white rounded text-[10px] font-bold py-1 flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3" /> Atualizar
                          </button>
                          <button
                            onClick={cancelEditingLeader}
                            className="px-2 bg-white border border-[#E0D8D0] text-[#8C7B70] rounded text-[10px] py-1 cursor-pointer"
                          >
                            <X className="w-3 h-3" /> Cancelar
                          </button>
                        </div>
                      </div>
                    );
                  }

                  const getShiftBadgeStyle = (shiftStr?: string) => {
                    const s = (shiftStr || '').toLowerCase();
                    if (s.includes('plantões a e b') || s.includes('a e b')) {
                      return 'bg-amber-50 text-amber-800 border-amber-300';
                    }
                    if (s.includes('plantão a') || s.includes('turno a')) {
                      return 'bg-blue-50 text-blue-800 border-blue-200';
                    }
                    if (s.includes('plantão b') || s.includes('turno b')) {
                      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
                    }
                    return 'bg-purple-50 text-purple-800 border-purple-200';
                  };

                  return (
                    <div 
                      key={leader.id}
                      className={`px-3 py-2.5 flex items-center justify-between text-xs transition-colors hover:bg-[#F4F1EE]/50 ${
                        leader.id === selectedLeaderId ? 'bg-[#C8102E]/5 font-bold text-[#C8102E]' : 'text-[#2C1810]'
                      }`}
                    >
                      {/* Clickable Select Action */}
                      <button
                        onClick={() => handleSelectLeader(leader.id)}
                        className="flex-1 text-left min-w-0 pr-2 cursor-pointer focus:outline-none"
                      >
                        <div className="font-black flex items-center gap-1.5 text-xs text-[#2C1810]">
                          <span className="truncate">{leader.name}</span>
                          {leader.id === selectedLeaderId && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase text-[#C8102E] bg-[#C8102E]/10 px-1.5 py-0.2 rounded shrink-0">
                              <UserCheck className="w-3 h-3" /> Ativo
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-[#5D4037] font-medium truncate">
                            {leader.role}
                          </span>
                          {leader.shift && (
                            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border shrink-0 ${getShiftBadgeStyle(leader.shift)}`}>
                              {leader.shift}
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Action buttons (Edit & Delete) */}
                      <div className="flex items-center gap-1 shadow-xs rounded-md bg-white border border-[#E0D8D0] p-0.5 shrink-0">
                        {/* Edit button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingLeader(leader);
                          }}
                          className="p-1 text-slate-500 hover:text-[#2C1810] hover:bg-[#F4F1EE] rounded transition-colors cursor-pointer"
                          title="Editar Líder e Plantão"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete button (only allow if leaders.length > 1) */}
                        {leaders.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Tem certeza que deseja remover o líder "${leader.name}"?`)) {
                                onDeleteLeader(leader.id);
                              }
                            }}
                            className="p-1 text-[#C8102E] hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Remover Líder"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
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
