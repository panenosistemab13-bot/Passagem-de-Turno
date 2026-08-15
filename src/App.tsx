import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Folder, 
  Users, 
  Calendar, 
  MessageSquare,
  Menu,
  X,
  Coffee,
  Shield,
  Bell,
  ArrowRight
} from 'lucide-react';

import { Leader, Occurrence, Employee, EmployeeLog, Reminder, ChatMessage, Notification, OccurrenceStatus } from './types';
import { 
  INITIAL_LEADERS, 
  INITIAL_OCCURRENCES, 
  INITIAL_EMPLOYEES, 
  INITIAL_EMPLOYEE_LOGS, 
  INITIAL_REMINDERS, 
  INITIAL_CHAT_MESSAGES 
} from './initialData';

// Component imports
import Header from './components/Header';
import DashboardStatus from './components/DashboardStatus';
import OccurrenceForm from './components/OccurrenceForm';
import HistoryList from './components/HistoryList';
import LeaderFolders from './components/LeaderFolders';
import EmployeeList from './components/EmployeeList';
import CalendarComponent from './components/CalendarComponent';
import ChatComponent from './components/ChatComponent';

export default function App() {
  
  // A one-time migration to force-clear previous mock data in localStorage
  if (typeof window !== 'undefined' && !localStorage.getItem('3c_clean_slate_v4')) {
    localStorage.removeItem('3c_occurrences');
    localStorage.removeItem('3c_employees');
    localStorage.removeItem('3c_employee_logs');
    localStorage.removeItem('3c_reminders');
    localStorage.removeItem('3c_chat_messages');
    localStorage.setItem('3c_clean_slate_v4', 'true');
  }

  // Tab/Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Core App States with LocalStorage Hydration
  const [leaders, setLeaders] = useState<Leader[]>(() => {
    const local = localStorage.getItem('3c_leaders');
    return local ? JSON.parse(local) : INITIAL_LEADERS;
  });

  const [selectedLeaderId, setSelectedLeaderId] = useState<string>(() => {
    const local = localStorage.getItem('3c_selected_leader');
    return local || (INITIAL_LEADERS[0]?.id || '');
  });

  const [occurrences, setOccurrences] = useState<Occurrence[]>(() => {
    const local = localStorage.getItem('3c_occurrences');
    return local ? JSON.parse(local) : INITIAL_OCCURRENCES;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const local = localStorage.getItem('3c_employees');
    return local ? JSON.parse(local) : INITIAL_EMPLOYEES;
  });

  const [employeeLogs, setEmployeeLogs] = useState<EmployeeLog[]>(() => {
    const local = localStorage.getItem('3c_employee_logs');
    return local ? JSON.parse(local) : INITIAL_EMPLOYEE_LOGS;
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const local = localStorage.getItem('3c_reminders');
    return local ? JSON.parse(local) : INITIAL_REMINDERS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const local = localStorage.getItem('3c_chat_messages');
    return local ? JSON.parse(local) : INITIAL_CHAT_MESSAGES;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const local = localStorage.getItem('3c_notifications');
    return local ? JSON.parse(local) : [
      {
        id: 'notif-init',
        title: 'Sistema Ativo',
        message: 'Canal de Gerenciamento de Riscos e Passagem de Turno carregado com sucesso.',
        type: 'success',
        createdAt: new Date().toISOString(),
        read: false
      }
    ];
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const local = localStorage.getItem('3c_is_admin');
    return local ? JSON.parse(local) : false;
  });

  // LocalStorage Syncer
  useEffect(() => {
    localStorage.setItem('3c_leaders', JSON.stringify(leaders));
  }, [leaders]);

  useEffect(() => {
    localStorage.setItem('3c_selected_leader', selectedLeaderId);
  }, [selectedLeaderId]);

  useEffect(() => {
    localStorage.setItem('3c_occurrences', JSON.stringify(occurrences));
  }, [occurrences]);

  useEffect(() => {
    localStorage.setItem('3c_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('3c_employee_logs', JSON.stringify(employeeLogs));
  }, [employeeLogs]);

  useEffect(() => {
    localStorage.setItem('3c_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('3c_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('3c_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('3c_is_admin', JSON.stringify(isAdmin));
  }, [isAdmin]);

  // Handler helpers
  const handleAddLeader = (name: string, role: string) => {
    const newLeader: Leader = {
      id: `leader-${Date.now()}`,
      name,
      role,
      createdAt: new Date().toLocaleDateString('pt-BR')
    };
    setLeaders(prev => [...prev, newLeader]);
    setSelectedLeaderId(newLeader.id);
    handleAddNotification(
      'Novo Líder Cadastrado',
      `O líder de plantão ${name} foi integrado com sucesso ao menu suspenso.`,
      'success'
    );
  };

  const handleDeleteLeader = (id: string) => {
    setLeaders(prev => prev.filter(l => l.id !== id));
    if (selectedLeaderId === id) {
      const remaining = leaders.filter(l => l.id !== id);
      if (remaining.length > 0) {
        setSelectedLeaderId(remaining[0].id);
      }
    }
    handleAddNotification(
      'Líder Removido',
      'Um líder foi deletado do diretório pelo administrador.',
      'info'
    );
  };

  const handleAddOccurrence = (newOcc: Omit<Occurrence, 'id' | 'createdAt'>) => {
    const completedOcc: Occurrence = {
      ...newOcc,
      id: `occ-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setOccurrences(prev => [completedOcc, ...prev]);
  };

  const handleUpdateOccurrenceStatus = (id: string, newStatus: OccurrenceStatus) => {
    const target = occurrences.find(o => o.id === id);
    if (!target) return;

    setOccurrences(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    
    // Trigger notification to other users as requested
    const leaderText = leaders.find(l => l.id === selectedLeaderId)?.name || 'Líder';
    let statusLabel = '';
    let type: 'info' | 'warning' | 'success' = 'info';

    if (newStatus === 'resolvido') {
      statusLabel = 'RESOLVIDO';
      type = 'success';
    } else if (newStatus === 'acompanhar') {
      statusLabel = 'SOB ACOMPANHAMENTO';
      type = 'warning';
    } else {
      statusLabel = 'CIENTIFICADO (PARA CONHECIMENTO)';
      type = 'info';
    }

    handleAddNotification(
      `Status Atualizado: ${target.title}`,
      `O líder ${leaderText} alterou a ação para [${statusLabel}]. Todos os demais foram notificados.`,
      type
    );
  };

  const handleDeleteOccurrence = (id: string) => {
    setOccurrences(prev => prev.filter(o => o.id !== id));
    handleAddNotification(
      'Registro Excluído',
      'Uma ocorrência foi apagada do histórico operacional.',
      'info'
    );
  };

  const handleAddEmployee = (name: string, role: string, department: string) => {
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name,
      role,
      department,
      positives: 0,
      negatives: 0
    };
    setEmployees(prev => [...prev, newEmp]);
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    setEmployeeLogs(prev => prev.filter(l => l.employeeId !== id));
  };

  const handleAddEmployeeLog = (newLog: Omit<EmployeeLog, 'id' | 'createdAt'>) => {
    const log: EmployeeLog = {
      ...newLog,
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setEmployeeLogs(prev => [log, ...prev]);

    // Adjust positive/negative counters on the employee record dynamically
    setEmployees(prev => prev.map(emp => {
      if (emp.id === newLog.employeeId) {
        if (newLog.type === 'ponto_positivo') {
          return { ...emp, positives: emp.positives + 1 };
        } else if (newLog.type === 'otimo_desempenho') {
          return { ...emp, positives: emp.positives + 2 };
        } else if (newLog.type === 'ponto_negativo') {
          return { ...emp, negatives: emp.negatives + 1 };
        } else if (newLog.type === 'falta') {
          return { ...emp, negatives: emp.negatives + 2 };
        } else if (newLog.type === 'erro_cometido') {
          return { ...emp, negatives: emp.negatives + 1 };
        }
      }
      return emp;
    }));

    handleAddNotification(
      'Ficha de Colaborador Atualizada',
      `Um novo registro do tipo [${newLog.type.replace('_', ' ')}] foi incluído para ${newLog.employeeName}.`,
      newLog.type === 'otimo_desempenho' || newLog.type === 'ponto_positivo' ? 'success' : 'warning'
    );
  };

  const handleDeleteLog = (id: string) => {
    const target = employeeLogs.find(l => l.id === id);
    if (!target) return;

    // Revert employee score changes
    setEmployees(prev => prev.map(emp => {
      if (emp.id === target.employeeId) {
        if (target.type === 'ponto_positivo') {
          return { ...emp, positives: Math.max(0, emp.positives - 1) };
        } else if (target.type === 'otimo_desempenho') {
          return { ...emp, positives: Math.max(0, emp.positives - 2) };
        } else if (target.type === 'ponto_negativo') {
          return { ...emp, negatives: Math.max(0, emp.negatives - 1) };
        } else if (target.type === 'falta') {
          return { ...emp, negatives: Math.max(0, emp.negatives - 2) };
        } else if (target.type === 'erro_cometido') {
          return { ...emp, negatives: Math.max(0, emp.negatives - 1) };
        }
      }
      return emp;
    }));

    setEmployeeLogs(prev => prev.filter(l => l.id !== id));
  };

  const handleAddReminder = (newRem: Omit<Reminder, 'id'>) => {
    const rem: Reminder = {
      ...newRem,
      id: `rem-${Date.now()}`
    };
    setReminders(prev => [...prev, rem]);
    handleAddNotification(
      'Compromisso Agendado',
      `Evento [${newRem.title}] adicionado ao calendário.`,
      'info'
    );
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const handleSendMessage = (messageText: string) => {
    const activeLeader = leaders.find(l => l.id === selectedLeaderId) || leaders[0];
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderName: activeLeader.name,
      senderRole: activeLeader.role,
      message: messageText,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const handleSimulateReply = (senderName: string, senderRole: string, messageText: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderName,
      senderRole,
      message: messageText,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const handleClearChat = () => {
    setChatMessages([]);
  };

  const handleAddNotification = (title: string, message: string, type: 'info' | 'warning' | 'success') => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleMarkNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Render correct Active Tab/View
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardStatus occurrences={occurrences} onSelectTab={setActiveTab} />;
      case 'registrar':
        return (
          <OccurrenceForm
            leaders={leaders}
            selectedLeaderId={selectedLeaderId}
            onAddOccurrence={handleAddOccurrence}
            onAddNotification={handleAddNotification}
            onSelectTab={setActiveTab}
          />
        );
      case 'historico':
        return (
          <HistoryList
            occurrences={occurrences}
            leaders={leaders}
            isAdmin={isAdmin}
            onUpdateStatus={handleUpdateOccurrenceStatus}
            onDeleteOccurrence={handleDeleteOccurrence}
          />
        );
      case 'pastas':
        return (
          <LeaderFolders
            leaders={leaders}
            occurrences={occurrences}
            employeeLogs={employeeLogs}
            isAdmin={isAdmin}
            onDeleteLeader={handleDeleteLeader}
            onUpdateOccurrenceStatus={handleUpdateOccurrenceStatus}
          />
        );
      case 'funcionarios':
        return (
          <EmployeeList
            employees={employees}
            employeeLogs={employeeLogs}
            leaders={leaders}
            selectedLeaderId={selectedLeaderId}
            isAdmin={isAdmin}
            onAddEmployee={handleAddEmployee}
            onAddEmployeeLog={handleAddEmployeeLog}
            onDeleteLog={handleDeleteLog}
            onDeleteEmployee={handleDeleteEmployee}
          />
        );
      case 'calendario':
        return (
          <CalendarComponent
            reminders={reminders}
            leaders={leaders}
            selectedLeaderId={selectedLeaderId}
            isAdmin={isAdmin}
            onAddReminder={handleAddReminder}
            onDeleteReminder={handleDeleteReminder}
          />
        );
      case 'chat':
        return (
          <ChatComponent
            messages={chatMessages}
            leaders={leaders}
            selectedLeaderId={selectedLeaderId}
            isAdmin={isAdmin}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            onSimulateReply={handleSimulateReply}
          />
        );
      default:
        return <DashboardStatus occurrences={occurrences} onSelectTab={setActiveTab} />;
    }
  };

  // Sidebar link items
  const sidebarItems = [
    { id: 'dashboard', label: 'Painel de Status', icon: LayoutDashboard },
    { id: 'registrar', label: 'Novo Registro', icon: PlusCircle },
    { id: 'historico', label: 'Histórico Operacional', icon: History },
    { id: 'pastas', label: 'Pastas dos Líderes', icon: Folder },
    { id: 'funcionarios', label: 'Acompanhamento de Staff', icon: Users },
    { id: 'calendario', label: 'Agenda & Lembretes', icon: Calendar },
    { id: 'chat', label: 'Chat Equipe', icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-[#F4F1EE] flex flex-col font-sans text-[#2C1810]">
      
      {/* Dynamic Global Header */}
      <Header
        leaders={leaders}
        selectedLeaderId={selectedLeaderId}
        setSelectedLeaderId={setSelectedLeaderId}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        notifications={notifications}
        onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
        onAddLeader={handleAddLeader}
      />

      <div className="flex-1 flex flex-col md:flex-row relative">
        
        {/* Navigation Sidebar (High Density Corporate Coffee & Cherry Red) */}
        <aside className="hidden md:flex flex-col w-64 bg-[#2C1810] text-white border-r border-[#3D261C] shrink-0 p-4 space-y-4">
          
          {/* Brand block (From High Density template) */}
          <div className="p-3 bg-[#C8102E] flex items-center gap-3 rounded-lg shadow-md">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg shrink-0">
              <div className="w-4 h-4 bg-[#C8102E] rotate-45"></div>
            </div>
            <span className="font-extrabold text-xs tracking-tight uppercase italic text-white">Três Corações</span>
          </div>

          {/* Quick status box */}
          <div className="bg-[#3D261C] border border-[#4D362C] rounded-lg p-3 space-y-2.5 shadow-inner">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm" />
              <span className="text-[9px] font-black uppercase text-[#A6897E]">Painel Conectado</span>
            </div>
            
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-[#A6897E] block uppercase">Líder em Exercício</span>
              <p className="text-xs font-black text-white truncate">
                {leaders.find(l => l.id === selectedLeaderId)?.name || 'Nenhum'}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1">
            <span className="text-[9px] font-bold uppercase text-[#A6897E] tracking-widest block px-2.5 mb-1.5">Aplicações</span>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all duration-150 cursor-pointer text-left ${
                    isSelected 
                      ? 'bg-[#C8102E] text-white font-black shadow-md' 
                      : 'text-[#A6897E] hover:bg-[#3D261C] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer of the sidebar */}
          <div className="pt-2.5 border-t border-[#3D261C] text-center">
            <div className="text-[9px] text-[#A6897E] font-bold">
              Três Corações Alimentos © 2026
            </div>
            <div className="text-[8px] text-[#8C7B70] font-medium mt-0.5">
              v2.1.4 Build Prod
            </div>
          </div>

        </aside>

        {/* Mobile menu navigation trigger bar */}
        <div className="md:hidden bg-[#2C1810] border-b border-[#3D261C] p-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#C8102E] rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-white rotate-45"></div>
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-white">Três Corações</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 bg-[#3D261C] border border-[#4D362C] rounded-lg text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 animate-pulse" />}
          </button>
        </div>

        {/* Mobile menu drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-x-0 bg-[#2C1810] text-white p-4 border-b border-[#3D261C] z-40 space-y-3 md:hidden shadow-2xl"
            >
              <div className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-bold uppercase text-left ${
                        isSelected ? 'bg-[#C8102E] text-white' : 'text-[#A6897E] hover:bg-[#3D261C]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Pane */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
}
