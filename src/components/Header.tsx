import React, { useState, useRef } from 'react';
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
  X,
  Camera,
  Upload,
  Database
} from 'lucide-react';

interface HeaderProps {
  leaders: Leader[];
  selectedLeaderId: string;
  setSelectedLeaderId: (id: string) => void;
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
  notifications: Notification[];
  onMarkNotificationsAsRead: () => void;
  onAddLeader: (name: string, role: string, shift?: string, avatar?: string) => void;
  onDeleteLeader: (id: string) => void;
  onUpdateLeader: (id: string, name: string, role: string, shift?: string, avatar?: string) => void;
  isFirebaseConnected?: boolean;
}

// Client-side helper to compress and convert uploaded image into lightweight Data URL
const processImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 240; // optimized for avatars and snappy storage
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

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
  
  // New Leader State
  const [newLeaderName, setNewLeaderName] = useState('');
  const [newLeaderRole, setNewLeaderRole] = useState('Líder diurna');
  const [newLeaderShift, setNewLeaderShift] = useState('Plantões A e B');
  const [newLeaderAvatar, setNewLeaderAvatar] = useState<string | undefined>(undefined);
  const [isDraggingNew, setIsDraggingNew] = useState(false);
  const newFileInputRef = useRef<HTMLInputElement | null>(null);

  // Inline Leader Editing State
  const [editingLeaderId, setEditingLeaderId] = useState<string | null>(null);
  const [editLeaderName, setEditLeaderName] = useState('');
  const [editLeaderRole, setEditLeaderRole] = useState('');
  const [editLeaderShift, setEditLeaderShift] = useState('');
  const [editLeaderAvatar, setEditLeaderAvatar] = useState<string | undefined>(undefined);
  const [isDraggingEdit, setIsDraggingEdit] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedLeader = leaders.find(l => l.id === selectedLeaderId);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleCreateLeaderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLeaderName.trim()) {
      onAddLeader(newLeaderName.trim(), newLeaderRole.trim(), newLeaderShift.trim(), newLeaderAvatar);
      setNewLeaderName('');
      setNewLeaderRole('Líder diurna');
      setNewLeaderShift('Plantões A e B');
      setNewLeaderAvatar(undefined);
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
    setEditLeaderAvatar(leader.avatar);
  };

  const cancelEditingLeader = () => {
    setEditingLeaderId(null);
    setEditLeaderAvatar(undefined);
  };

  const handleSaveLeaderEdit = (id: string) => {
    if (editLeaderName.trim()) {
      onUpdateLeader(id, editLeaderName.trim(), editLeaderRole.trim(), editLeaderShift.trim(), editLeaderAvatar);
      setEditingLeaderId(null);
      setEditLeaderAvatar(undefined);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await processImageFile(file);
        if (isEdit) {
          setEditLeaderAvatar(base64);
        } else {
          setNewLeaderAvatar(base64);
        }
      } catch (err) {
        console.error('Erro ao processar imagem:', err);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, isEdit: boolean) => {
    e.preventDefault();
    if (isEdit) setIsDraggingEdit(false);
    else setIsDraggingNew(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const base64 = await processImageFile(file);
        if (isEdit) {
          setEditLeaderAvatar(base64);
        } else {
          setNewLeaderAvatar(base64);
        }
      } catch (err) {
        console.error('Erro ao processar imagem:', err);
      }
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
        
        {/* Firebase Realtime Database Live Indicator */}
        <div 
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[#E0D8D0] bg-[#FAF9F7] text-[#5D4037]"
          title="Conectado ao Firebase Realtime Database (passagem-de-turno-1d855)"
        >
          <Database className="w-3 h-3 text-[#C8102E]" />
          <span className="font-extrabold text-[#2C1810]">Firebase RTDB</span>
          <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </span>
        </div>

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
            {selectedLeader?.avatar ? (
              <img 
                src={selectedLeader.avatar} 
                alt={selectedLeader.name} 
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover border border-[#C8102E]/50 shadow-2xs"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#C8102E]/10 text-[#C8102E] flex items-center justify-center text-[10px] font-black border border-[#C8102E]/20">
                {selectedLeader ? selectedLeader.name.charAt(0) : <User className="w-3.5 h-3.5" />}
              </div>
            )}
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
                  <span className="text-[9px] text-[#8C7B70]">Gerencie líderes, fotos e plantões operacionais</span>
                </div>
                <button 
                  onClick={() => {
                    setShowAddLeaderForm(!showAddLeaderForm);
                    setEditingLeaderId(null);
                  }}
                  className="bg-[#C8102E] text-white hover:bg-[#a80c24] px-2.5 py-1 rounded flex items-center gap-1 text-[10px] font-bold shadow-xs cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Adicionar
                </button>
              </div>

              {/* Add New Leader Form */}
              {showAddLeaderForm && (
                <form onSubmit={handleCreateLeaderSubmit} className="p-3 bg-[#F4F1EE] border-b border-[#E0D8D0] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#C8102E]">Novo Cadastro de Líder</span>
                    <button 
                      type="button" 
                      onClick={() => setShowAddLeaderForm(false)}
                      className="text-[#8C7B70] hover:text-[#2C1810]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Photo Upload Area */}
                  <div>
                    <label className="text-[9px] text-[#8C7B70] block font-bold mb-1 uppercase">Foto do Líder (Importar do Dispositivo)</label>
                    <input 
                      type="file" 
                      ref={newFileInputRef}
                      onChange={(e) => handleFileChange(e, false)}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingNew(true); }}
                      onDragLeave={() => setIsDraggingNew(false)}
                      onDrop={(e) => handleDrop(e, false)}
                      onClick={() => newFileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-2.5 flex items-center gap-3 cursor-pointer transition-all ${
                        isDraggingNew ? 'border-[#C8102E] bg-[#C8102E]/10' : 'border-[#D4C8BE] bg-white hover:border-[#C8102E]/60'
                      }`}
                    >
                      {newLeaderAvatar ? (
                        <div className="relative group">
                          <img 
                            src={newLeaderAvatar} 
                            alt="Preview" 
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-full object-cover border border-[#C8102E]"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNewLeaderAvatar(undefined);
                            }}
                            className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 shadow hover:bg-red-700"
                            title="Remover foto"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#F4F1EE] border border-[#E0D8D0] flex items-center justify-center text-[#8C7B70]">
                          <Camera className="w-5 h-5 text-[#8C7B70]" />
                        </div>
                      )}

                      <div className="flex-1 text-left min-w-0">
                        <div className="text-xs font-bold text-[#2C1810] flex items-center gap-1">
                          <Upload className="w-3 h-3 text-[#C8102E]" />
                          <span>{newLeaderAvatar ? 'Alterar foto selecionada' : 'Importar foto do celular/PC'}</span>
                        </div>
                        <p className="text-[9px] text-[#8C7B70] mt-0.5">Clique para buscar na galeria ou arraste aqui</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] text-[#8C7B70] block font-bold mb-0.5 uppercase">Nome Completo <span className="text-[#C8102E]">*</span></label>
                    <input 
                      type="text" 
                      value={newLeaderName}
                      onChange={(e) => setNewLeaderName(e.target.value)}
                      placeholder="Ex: Cristiane Fialho"
                      className="w-full bg-white border border-[#E0D8D0] rounded px-2.5 py-1.5 text-xs text-[#2C1810] font-semibold focus:outline-none focus:border-[#C8102E]"
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
                        className="w-full bg-white border border-[#E0D8D0] rounded px-2.5 py-1.5 text-xs text-[#2C1810] font-semibold focus:outline-none focus:border-[#C8102E]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-[#8C7B70] block font-bold mb-0.5 uppercase">Plantão Separado</label>
                      <select
                        value={newLeaderShift}
                        onChange={(e) => setNewLeaderShift(e.target.value)}
                        className="w-full bg-white border border-[#E0D8D0] rounded px-2.5 py-1.5 text-xs text-[#2C1810] font-semibold focus:outline-none focus:border-[#C8102E]"
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
                      className="flex-1 bg-[#C8102E] hover:bg-[#a80c24] text-white rounded text-xs font-bold py-1.5 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Salvar Líder com Foto
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowAddLeaderForm(false)}
                      className="px-3 bg-white border border-[#E0D8D0] hover:bg-slate-50 text-[#8C7B70] rounded text-xs py-1.5 cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* Leaders List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-[#F4F1EE]">
                {leaders.map((leader) => {
                  const isEditing = editingLeaderId === leader.id;

                  if (isEditing) {
                    return (
                      <div key={leader.id} className="p-3 bg-[#F4F1EE] border-b border-[#E0D8D0] space-y-2.5">
                        <div className="text-[10px] font-black uppercase text-[#C8102E]">Editar Líder e Foto</div>
                        
                        {/* Edit Photo Upload */}
                        <div>
                          <label className="text-[8px] text-[#8C7B70] font-black uppercase block mb-1">Foto / Avatar do Dispositivo</label>
                          <input 
                            type="file" 
                            ref={editFileInputRef}
                            onChange={(e) => handleFileChange(e, true)}
                            accept="image/*"
                            className="hidden"
                          />
                          <div 
                            onDragOver={(e) => { e.preventDefault(); setIsDraggingEdit(true); }}
                            onDragLeave={() => setIsDraggingEdit(false)}
                            onDrop={(e) => handleDrop(e, true)}
                            onClick={() => editFileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-lg p-2 flex items-center gap-3 cursor-pointer bg-white transition-all ${
                              isDraggingEdit ? 'border-[#C8102E] bg-[#C8102E]/10' : 'border-[#D4C8BE] hover:border-[#C8102E]'
                            }`}
                          >
                            {editLeaderAvatar ? (
                              <div className="relative group">
                                <img 
                                  src={editLeaderAvatar} 
                                  alt="Preview" 
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-full object-cover border border-[#C8102E]"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditLeaderAvatar(undefined);
                                  }}
                                  className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 shadow hover:bg-red-700"
                                  title="Remover foto"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#F4F1EE] border border-[#E0D8D0] flex items-center justify-center text-[#8C7B70]">
                                <Camera className="w-4 h-4 text-[#8C7B70]" />
                              </div>
                            )}

                            <div className="flex-1 text-left min-w-0">
                              <div className="text-[11px] font-bold text-[#2C1810] flex items-center gap-1">
                                <Upload className="w-3 h-3 text-[#C8102E]" />
                                <span>{editLeaderAvatar ? 'Trocar foto do líder' : 'Importar foto da galeria'}</span>
                              </div>
                              <p className="text-[8px] text-[#8C7B70]">Clique para selecionar ou arraste</p>
                            </div>
                          </div>
                        </div>

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
                      {/* Clickable Select Action with Avatar */}
                      <button
                        onClick={() => handleSelectLeader(leader.id)}
                        className="flex-1 text-left min-w-0 pr-2 cursor-pointer focus:outline-none flex items-center gap-2.5"
                      >
                        {/* Leader Avatar or Initials */}
                        {leader.avatar ? (
                          <img 
                            src={leader.avatar} 
                            alt={leader.name} 
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-[#D4C8BE] shrink-0 shadow-2xs"
                          />
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${
                            leader.id === selectedLeaderId
                              ? 'bg-[#C8102E] text-white border-[#C8102E]'
                              : 'bg-[#F4F1EE] text-[#5D4037] border-[#E0D8D0]'
                          }`}>
                            {leader.name.charAt(0)}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
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
                          title="Editar Líder, Foto e Plantão"
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
