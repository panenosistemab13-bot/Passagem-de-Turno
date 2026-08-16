import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, PlusCircle, History, Folder, Calendar, MessageSquare,
  Menu, X, Truck, ClipboardCheck
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
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import OccurrenceForm from './components/OccurrenceForm';
import HistoryList from './components/HistoryList';
import LeaderFolders from './components/LeaderFolders';
import CalendarComponent from './components/CalendarComponent';
import ChatComponent from './components/ChatComponent';
import VehicleManager from './components/VehicleManager';
import AttendanceList from './components/AttendanceList';
import CameraMonitoring from './components/CameraMonitoring';
import PatrolChecklist from './components/PatrolChecklist';
import RiskManagement from './components/RiskManagement';
import AnalyticsReports from './components/AnalyticsReports';
import ShiftHandover from './components/ShiftHandover';
import SettingsView from './components/SettingsView';
import BrandStoryModal from './components/BrandStoryModal';
import BootSequenceModal from './components/BootSequenceModal';
import SciFiBackground from './components/SciFiBackground';
import Footer from './components/Footer';
import { runVehicleMigration } from './runMigration';

export default function App() {
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isBrandStoryOpen, setIsBrandStoryOpen] = useState<boolean>(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [performanceMode, setPerformanceMode] = useState<boolean>(false);
  const [showBootSequence, setShowBootSequence] = useState<boolean>(false);

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
  }, [leaders]);

  useEffect(() => {
    if (isRemoteUpdate.current) { isRemoteUpdate.current = false; return; }
    localStorage.setItem('3c_occurrences', JSON.stringify(occurrences));
  }, [occurrences]);

  useEffect(() => {
    if (isRemoteUpdate.current) { isRemoteUpdate.current = false; return; }
    localStorage.setItem('3c_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    if (isRemoteUpdate.current) { isRemoteUpdate.current = false; return; }
    localStorage.setItem('3c_employee_logs', JSON.stringify(employeeLogs));
  }, [employeeLogs]);

  useEffect(() => {
    if (isRemoteUpdate.current) { isRemoteUpdate.current = false; return; }
    localStorage.setItem('3c_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    if (isRemoteUpdate.current) { isRemoteUpdate.current = false; return; }
    localStorage.setItem('3c_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

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
      case 'ocorrencias':
      case 'registrar':
        return <OccurrenceForm leaders={leaders} selectedLeaderId={selectedLeaderId} onAddOccurrence={handleAddOccurrence} onAddNotification={handleAddNotification} onSelectTab={setActiveTab} vehicles={vehicles} />;
      case 'plantao':
        return <ShiftHandover />;
      case 'lideres':
      case 'pastas':
        return <LeaderFolders leaders={leaders} occurrences={occurrences} employeeLogs={employeeLogs} isAdmin={isAdmin} onDeleteLeader={handleDeleteLeader} onUpdateOccurrenceStatus={handleUpdateOccurrenceStatus} />;
      case 'rondas':
        return <PatrolChecklist />;
      case 'riscos':
        return <RiskManagement />;
      case 'cameras':
        return <CameraMonitoring />;
      case 'comunicacoes':
      case 'chat':
        return <ChatComponent messages={chatMessages} leaders={leaders} selectedLeaderId={selectedLeaderId} isAdmin={isAdmin} onSendMessage={handleSendMessage} onClearChat={handleClearChat} onSimulateReply={handleSimulateReply} />;
      case 'relatorios':
        return <AnalyticsReports />;
      case 'agenda':
      case 'calendario':
        return <CalendarComponent reminders={reminders} leaders={leaders} selectedLeaderId={selectedLeaderId} isAdmin={isAdmin} onAddReminder={handleAddReminder} onDeleteReminder={handleDeleteReminder} />;
      case 'configuracoes':
        return <SettingsView />;
      case 'veiculos':
        return <VehicleManager />;
      case 'presenca':
        return <AttendanceList isAdmin={isAdmin} />;
      case 'historico':
        return <HistoryList occurrences={occurrences} leaders={leaders} isAdmin={isAdmin} onUpdateStatus={handleUpdateOccurrenceStatus} onDeleteOccurrence={handleDeleteOccurrence} onEditOccurrence={handleEditOccurrence} />;

      default:
        return <Dashboard leaders={leaders} occurrences={occurrences} vehicles={vehicles} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#05070B] text-[#E2E8F0] flex font-sans selection:bg-[#D4A373] selection:text-black relative overflow-x-hidden">
      
      {/* 3D Dynamic Holographic Background Canvas */}
      <SciFiBackground performanceMode={performanceMode} />

      {/* Floating 3D Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onOpenBrandStory={() => setIsBrandStoryOpen(true)}
      />

      {/* Main Content Area - 1920x1080 Native Widescreen Support */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10">
        
        {/* Mobile Header Trigger */}
        <div className="lg:hidden bg-[#070A0F]/90 backdrop-blur-md px-4 py-3 border-b border-[#1A2536] flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-8 h-8 rounded-xl p-0.5 bg-gradient-to-br from-[#E2B170] via-[#C68A4C] to-[#533621] flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-[#0A0D12] rounded-[10px] flex items-center justify-center">
                <span className="font-serif font-black text-xs text-[#E2B170]">3C</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-wider text-[#D4A373] uppercase">CAFÉ 3C</span>
              <span className="text-[9px] font-mono text-slate-400 -mt-1">COMANDO TÁTICO</span>
            </div>
          </div>
          
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-[#101724] text-[#D4A373] border border-[#22334A] hover:bg-[#162233] cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Global 3D Tactical Header */}
        <Header 
          notifications={notifications} 
          onMarkNotificationsAsRead={handleMarkNotificationsAsRead} 
          isFirebaseConnected={isFirebaseConnected}
          isAdmin={isAdmin}
          onToggleAdminRole={() => setIsAdmin(!isAdmin)}
          performanceMode={performanceMode}
          onTogglePerformanceMode={() => setPerformanceMode(!performanceMode)}
          onTriggerBootSequence={() => setShowBootSequence(true)}
        />

        {/* Dynamic Route View - 1920x1080 Fluid Layout */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1920px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.99 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Global Luxury Footer */}
        <Footer onOpenBrandStory={() => setIsBrandStoryOpen(true)} />

      </div>

      {/* Brand Heritage Story Modal */}
      <BrandStoryModal 
        isOpen={isBrandStoryOpen} 
        onClose={() => setIsBrandStoryOpen(false)} 
      />

      {/* 3D Boot / Self-Diagnostic Sequence Modal */}
      <BootSequenceModal
        isOpen={showBootSequence}
        onComplete={() => setShowBootSequence(false)}
      />

    </div>
  );
}
