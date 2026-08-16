import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, PlusCircle, History, Folder, Calendar, MessageSquare,
  Menu, X, ShieldAlert, Map, Settings, HelpCircle, Truck, ClipboardCheck
} from 'lucide-react';

import { Leader, Occurrence, Employee, EmployeeLog, Reminder, ChatMessage, Notification, VehicleRecord } from './types';
import { INITIAL_LEADERS, INITIAL_OCCURRENCES, INITIAL_EMPLOYEES, INITIAL_EMPLOYEE_LOGS, INITIAL_REMINDERS, INITIAL_CHAT_MESSAGES } from './initialData';
import { auth, ensureAnonymousAuth, rtdb, dbRefs, snapshotToArray, 
  pushOccurrenceToFirebase, updateOccurrenceInFirebase, deleteOccurrenceFromFirebase, 
  pushVehicleRecordToFirebase, updateVehicleRecordInFirebase, deleteVehicleRecordFromFirebase, 
  pushChatMessageToFirebase, pushNotificationToFirebase, syncLeadersToFirebase, syncOccurrencesToFirebase, 
  syncEmployeesToFirebase, syncEmployeeLogsToFirebase, syncRemindersToFirebase, syncChatMessagesToFirebase, 
  syncNotificationsToFirebase, initializeFirebaseDataIfEmpty
} from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { onValue } from 'firebase/database';

import Header from './components/Header';
import Dashboard from './components/Dashboard';
import OccurrenceForm from './components/OccurrenceForm';
import HistoryList from './components/HistoryList';
import LeaderFolders from './components/LeaderFolders';
import CalendarComponent from './components/CalendarComponent';
import ChatComponent from './components/ChatComponent';
import VehicleManager from './components/VehicleManager';
import AttendanceList from './components/AttendanceList';
import { runVehicleMigration } from './runMigration';

export default function App() {
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  // States
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
  const [vehicles, setVehicles] = useState<VehicleRecord[]>(() => {
    const local = localStorage.getItem('3c_vehicles');
    return local ? JSON.parse(local) : [];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const local = localStorage.getItem('3c_notifications');
    return local ? JSON.parse(local) : [];
  });

  const [isAdmin, setIsAdmin] = useState(true);
  const isRemoteUpdate = React.useRef(false);

  useEffect(() => {
    runVehicleMigration(vehicles.length);
  }, [vehicles.length]);

  useEffect(() => {
    ensureAnonymousAuth();
    initializeFirebaseDataIfEmpty();
  }, []);

  useEffect(() => {
    if (isRemoteUpdate.current) { isRemoteUpdate.current = false; return; }
    localStorage.setItem('3c_leaders', JSON.stringify(leaders));
    syncLeadersToFirebase(leaders);
  }, [leaders]);

  useEffect(() => {
    if (isRemoteUpdate.current) { isRemoteUpdate.current = false; return; }
    localStorage.setItem('3c_occurrences', JSON.stringify(occurrences));
  }, [occurrences]);

  useEffect(() => {
    if (isRemoteUpdate.current) { isRemoteUpdate.current = false; return; }
    localStorage.setItem('3c_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    if (isRemoteUpdate.current) { isRemoteUpdate.current = false; return; }
    localStorage.setItem('3c_reminders', JSON.stringify(reminders));
    syncRemindersToFirebase(reminders);
  }, [reminders]);

  useEffect(() => {
    if (isRemoteUpdate.current) { isRemoteUpdate.current = false; return; }
    localStorage.setItem('3c_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('3c_selected_leader', selectedLeaderId);
  }, [selectedLeaderId]);

  useEffect(() => {
    if (isRemoteUpdate.current) { isRemoteUpdate.current = false; return; }
    localStorage.setItem('3c_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    // Listeners
    const unsubLeaders = onValue(dbRefs.leaders, (snap) => {
      if (snap.exists()) {
        isRemoteUpdate.current = true;
        setLeaders(snapshotToArray<Leader>(snap.val()));
      }
    });

    const unsubOccurrences = onValue(dbRefs.occurrences, (snap) => {
      if (snap.exists()) {
        isRemoteUpdate.current = true;
        setOccurrences(snapshotToArray<Occurrence>(snap.val()));
      }
    });

    const unsubChat = onValue(dbRefs.chatMessages, (snap) => {
      if (snap.exists()) {
        isRemoteUpdate.current = true;
        setChatMessages(snapshotToArray<ChatMessage>(snap.val()));
      }
    });

    const unsubReminders = onValue(dbRefs.reminders, (snap) => {
      if (snap.exists()) {
        isRemoteUpdate.current = true;
        setReminders(snapshotToArray<Reminder>(snap.val()));
      }
    });

    const unsubNotifications = onValue(dbRefs.notifications, (snap) => {
      if (snap.exists()) {
        isRemoteUpdate.current = true;
        setNotifications(snapshotToArray<Notification>(snap.val()));
      }
    });

    const unsubVehicles = onValue(dbRefs.vehicles, (snap) => {
      if (snap.exists()) {
        isRemoteUpdate.current = true;
        setVehicles(snapshotToArray<VehicleRecord>(snap.val()));
      } else {
        setVehicles([]);
      }
    });

    let unsubAuth: (() => void) | null = null;
    const currentAuth = auth;
    if (currentAuth) {
      unsubAuth = onAuthStateChanged(currentAuth, (user) => {
        setIsFirebaseConnected(!!user);
      });
    }

    return () => {
      unsubLeaders();
      unsubOccurrences();
      unsubChat();
      unsubReminders();
      unsubNotifications();
      unsubVehicles();
      if (unsubAuth) unsubAuth();
    };
  }, []);

  // Handlers
  const handleAddOccurrence = async (occurrence: Occurrence) => {
    const updated = [occurrence, ...occurrences];
    setOccurrences(updated);
    await pushOccurrenceToFirebase(occurrence);
  };

  const handleUpdateOccurrenceStatus = async (id: string, newStatus: any) => {
    const occ = occurrences.find(o => o.id === id);
    if (occ) {
      const updatedOcc = { ...occ, status: newStatus };
      setOccurrences(occurrences.map(o => o.id === id ? updatedOcc : o));
      await updateOccurrenceInFirebase(updatedOcc);
    }
  };

  const handleDeleteOccurrence = async (id: string) => {
    setOccurrences(occurrences.filter(o => o.id === id));
    await deleteOccurrenceFromFirebase(id);
  };

  const handleEditOccurrence = async (updatedOcc: Occurrence) => {
    setOccurrences(occurrences.map(o => o.id === updatedOcc.id ? updatedOcc : o));
    await updateOccurrenceInFirebase(updatedOcc);
  };

  const handleAddNotification = async (title: string, message: string, type: 'info' | 'warning' | 'success') => {
    const notif: Notification = {
      id: crypto.randomUUID(),
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
      read: false
    };
    const updated = [notif, ...notifications];
    setNotifications(updated);
    await pushNotificationToFirebase(notif);
  };

  const handleSendMessage = async (msg: ChatMessage) => {
    const updated = [...chatMessages, msg];
    setChatMessages(updated);
    await pushChatMessageToFirebase(msg);
  };

  const handleClearChat = () => {
    setChatMessages([]);
    syncChatMessagesToFirebase([]);
  };

  const handleSimulateReply = async () => {
    setTimeout(async () => {
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        senderId: 'system',
        senderName: 'Central de Apoio',
        content: 'Recebido. A equipe de suporte já foi notificada e está acompanhando o caso. Por favor, mantenha o painel atualizado.',
        timestamp: new Date().toISOString(),
        isSystem: true
      };
      const updated = [...chatMessages, reply];
      setChatMessages(updated);
      await pushChatMessageToFirebase(reply);
      
      const notif: Notification = {
        id: crypto.randomUUID(),
        title: 'Nova mensagem no Chat',
        message: 'A Central de Apoio respondeu no canal da equipe.',
        type: 'info',
        createdAt: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [notif, ...prev]);
      await pushNotificationToFirebase(notif);
    }, 2500);
  };

  const handleAddReminder = (r: Reminder) => {
    setReminders([...reminders, r]);
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const handleDeleteLeader = (id: string) => {
    setLeaders(leaders.filter(l => l.id !== id));
    if (selectedLeaderId === id && leaders.length > 1) {
      const nextLeader = leaders.find(l => l.id !== id);
      if (nextLeader) setSelectedLeaderId(nextLeader.id);
    }
  };

  const handleMarkNotificationsAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    syncNotificationsToFirebase(updated);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard leaders={leaders} occurrences={occurrences} vehicles={vehicles} setActiveTab={setActiveTab} />;
      case 'registrar':
        return <OccurrenceForm leaders={leaders} selectedLeaderId={selectedLeaderId} onAddOccurrence={handleAddOccurrence} onAddNotification={handleAddNotification} onSelectTab={setActiveTab} vehicles={vehicles} />;
      case 'historico':
        return <HistoryList occurrences={occurrences} leaders={leaders} isAdmin={isAdmin} onUpdateStatus={handleUpdateOccurrenceStatus} onDeleteOccurrence={handleDeleteOccurrence} onEditOccurrence={handleEditOccurrence} />;
      case 'pastas':
        return <LeaderFolders leaders={leaders} occurrences={occurrences} employeeLogs={employeeLogs} isAdmin={isAdmin} onDeleteLeader={handleDeleteLeader} onUpdateOccurrenceStatus={handleUpdateOccurrenceStatus} />;
      case 'calendario':
        return <CalendarComponent reminders={reminders} leaders={leaders} selectedLeaderId={selectedLeaderId} isAdmin={isAdmin} onAddReminder={handleAddReminder} onDeleteReminder={handleDeleteReminder} />;
      case 'chat':
        return <ChatComponent messages={chatMessages} leaders={leaders} selectedLeaderId={selectedLeaderId} isAdmin={isAdmin} onSendMessage={handleSendMessage} onClearChat={handleClearChat} onSimulateReply={handleSimulateReply} />;
      case 'veiculos':
        return <VehicleManager />;
      case 'presenca':
        return <AttendanceList isAdmin={isAdmin} />;
      case 'mapa':
      case 'riscos':
      case 'configuracoes':
      case 'ajuda':
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
            <ShieldAlert className="w-16 h-16 text-slate-300 mb-4" />
            <h2 className="text-xl font-black text-[#0F172A] mb-2">Módulo em Desenvolvimento</h2>
            <p className="text-sm text-slate-500 max-w-md">
              Esta seção está sendo preparada para a próxima atualização do sistema. 
              Ela incluirá dashboards avançados e relatórios detalhados.
            </p>
          </div>
        );
      default:
        return <Dashboard leaders={leaders} occurrences={occurrences} vehicles={vehicles} setActiveTab={setActiveTab} />;
    }
  };

  const sidebarGroups = [
    {
      title: 'PRINCIPAL',
      items: [
        { id: 'dashboard', label: 'Painel Principal', icon: LayoutDashboard },
        { id: 'pastas', label: 'Pastas dos Líderes', icon: Folder },
        { id: 'registrar', label: 'Novo Registro', icon: PlusCircle },
        { id: 'historico', label: 'Histórico Operacional', icon: History }
      ]
    },
    {
      title: 'OPERAÇÃO',
      items: [
        { id: 'presenca', label: 'Lista de Presença', icon: ClipboardCheck },
        { id: 'veiculos', label: 'Placas de Veículos', icon: Truck },
        { id: 'calendario', label: 'Agenda & Lembretes', icon: Calendar },
        { id: 'chat', label: 'Chat Equipe', icon: MessageSquare }
      ]
    },
    {
      title: 'MAPAS & RISCOS',
      items: [
        { id: 'mapa', label: 'Mapa do Brasil', icon: Map },
        { id: 'riscos', label: 'Gestão de Riscos', icon: ShieldAlert }
      ]
    },
    {
      title: 'CONFIGURAÇÕES',
      items: [
        { id: 'configuracoes', label: 'Configurações', icon: Settings },
        { id: 'ajuda', label: 'Ajuda e Suporte', icon: HelpCircle }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-[#0F172A] selection:bg-[#1E40AF] selection:text-white">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-[260px] bg-[#0A192F] text-slate-300 shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 bg-[#051124] border-b border-white/5 flex items-center gap-3">
          {/* Logo Placeholder */}
          <div className="w-10 h-10 rounded bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden">
            <span className="font-serif font-bold text-white text-lg relative z-10">3C</span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-[11px] uppercase tracking-widest text-[#D4AF37] leading-tight">Café</span>
            <span className="font-serif text-[15px] font-bold text-white leading-none">três corações</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-6">
          {sidebarGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.15em] block px-3 mb-2">{group.title}</span>
              {group.items.map(item => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer text-left ${
                      isSelected 
                        ? 'bg-gradient-to-r from-[#1E40AF] to-[#2563EB] text-white shadow-md shadow-blue-900/40' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 bg-[#051124]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] text-slate-400">Ceará, Brasil</span>
          </div>
          <p className="text-[10px] text-slate-600 mt-1">Versão 3.0.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Mobile menu trigger */}
        <div className="md:hidden bg-[#0A192F] p-4 flex items-center justify-between text-white shrink-0 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center">
              <span className="font-serif font-bold text-white text-xs">3C</span>
            </div>
            <span className="font-serif text-sm font-bold">três corações</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-white/10 rounded-lg">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0A192F] border-b border-white/10 overflow-hidden shrink-0"
            >
              <nav className="p-4 space-y-4">
                {sidebarGroups.map((group, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block px-2 mb-1">{group.title}</span>
                    {group.items.map(item => {
                      const Icon = item.icon;
                      const isSelected = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-left ${
                            isSelected ? 'bg-[#1E40AF] text-white' : 'text-slate-400 hover:bg-white/5'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        <Header 
          notifications={notifications} 
          onMarkNotificationsAsRead={handleMarkNotificationsAsRead} 
          isFirebaseConnected={isFirebaseConnected} 
        />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#F8FAFC]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
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
