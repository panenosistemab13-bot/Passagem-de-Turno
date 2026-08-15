import React, { useState, useEffect, useRef } from 'react';
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
  ArrowRight,
  Database,
  Truck
} from 'lucide-react';

import { Leader, Occurrence, Employee, EmployeeLog, Reminder, ChatMessage, Notification, OccurrenceStatus, VehicleRecord } from './types';
import { 
  INITIAL_LEADERS, 
  INITIAL_OCCURRENCES, 
  INITIAL_EMPLOYEES, 
  INITIAL_EMPLOYEE_LOGS, 
  INITIAL_REMINDERS, 
  INITIAL_CHAT_MESSAGES 
} from './initialData';

import {
  auth,
  ensureAnonymousAuth,
  rtdb,
  dbRefs,
  snapshotToArray,
  pushOccurrenceToFirebase,
  updateOccurrenceInFirebase,
  deleteOccurrenceFromFirebase,
  pushVehicleRecordToFirebase,
  updateVehicleRecordInFirebase,
  deleteVehicleRecordFromFirebase,
  pushChatMessageToFirebase,
  pushNotificationToFirebase,
  syncLeadersToFirebase,
  syncOccurrencesToFirebase,
  syncEmployeesToFirebase,
  syncEmployeeLogsToFirebase,
  syncRemindersToFirebase,
  syncChatMessagesToFirebase,
  syncNotificationsToFirebase,
  initializeFirebaseDataIfEmpty
} from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { onValue } from 'firebase/database';

// Component imports
import Header from './components/Header';
import DashboardStatus from './components/DashboardStatus';
import OccurrenceForm from './components/OccurrenceForm';
import HistoryList from './components/HistoryList';
import LeaderFolders from './components/LeaderFolders';
import EmployeeList from './components/EmployeeList';
import CalendarComponent from './components/CalendarComponent';
import ChatComponent from './components/ChatComponent';
import VehicleManager from './components/VehicleManager';

export default function App() {
  
  // Tab/Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  // Core App States with LocalStorage Hydration as initial baseline
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
    return local ? JSON.parse(local) : [
      {
        id: 'notif-init',
        title: 'Firebase Conectado',
        message: 'Banco de Dados Realtime Database (passagem-de-turno-1d855) ativo e sincronizado.',
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

  // Flag to avoid loop reflections during initial remote hydrate
  const isRemoteUpdate = useRef(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize and listen to Firebase Realtime Database
  useEffect(() => {
    // Attempt anonymous authentication in background (if enabled in Firebase Console)
    ensureAnonymousAuth().then(user => {
      if (user) setCurrentUser(user);
    });

    // Check initial seed
    initializeFirebaseDataIfEmpty();

    // Connection status listener
    const unsubConnected = onValue(dbRefs.connected, (snap) => {
      setIsFirebaseConnected(Boolean(snap.val()));
    });

    // Realtime Global State listener (dados-globais) for auxiliary metadata
    const unsubGlobal = onValue(dbRefs.globalData, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        if (data) {
          isRemoteUpdate.current = true;
          if (data.leaders && Array.isArray(data.leaders) && data.leaders.length > 0) {
            setLeaders(data.leaders);
          }
          if (data.employees) {
            setEmployees(snapshotToArray<Employee>(data.employees));
          }
          if (data.employeeLogs) {
            setEmployeeLogs(snapshotToArray<EmployeeLog>(data.employeeLogs));
          }
          if (data.reminders) {
            setReminders(snapshotToArray<Reminder>(data.reminders));
          }
          if (data.chatMessages) {
            setChatMessages(snapshotToArray<ChatMessage>(data.chatMessages));
          }
          if (data.notifications) {
            setNotifications(snapshotToArray<Notification>(data.notifications));
          }
        }
      }
    });

    // Realtime Leaders listener
    const unsubLeaders = onValue(dbRefs.leaders, (snap) => {
      if (snap.exists()) {
        const remoteLeaders = snapshotToArray<Leader>(snap.val());
        if (remoteLeaders.length > 0) {
          isRemoteUpdate.current = true;
          setLeaders(remoteLeaders);
          setSelectedLeaderId(prev => {
            if (remoteLeaders.some(l => l.id === prev)) return prev;
            return remoteLeaders[0]?.id || '';
          });
        }
      }
    });

    // Authoritative Realtime Occurrences listener directly from 'dados-globais/ocorrencias'
    const unsubOccurrences = onValue(dbRefs.occurrences, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const remoteOccurrences = snapshotToArray<Occurrence>(val);
        isRemoteUpdate.current = true;
        // Sort newest first
        remoteOccurrences.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
        setOccurrences(remoteOccurrences);
      } else {
        setOccurrences([]);
      }
    });

    // Realtime Employees listener
    const unsubEmployees = onValue(dbRefs.employees, (snap) => {
      if (snap.exists()) {
        const remoteEmployees = snapshotToArray<Employee>(snap.val());
        isRemoteUpdate.current = true;
        setEmployees(remoteEmployees);
      }
    });

    // Realtime EmployeeLogs listener
    const unsubEmployeeLogs = onValue(dbRefs.employeeLogs, (snap) => {
      if (snap.exists()) {
        const remoteLogs = snapshotToArray<EmployeeLog>(snap.val());
        isRemoteUpdate.current = true;
        setEmployeeLogs(remoteLogs);
      }
    });

    // Realtime Reminders listener
    const unsubReminders = onValue(dbRefs.reminders, (snap) => {
      if (snap.exists()) {
        const remoteReminders = snapshotToArray<Reminder>(snap.val());
        isRemoteUpdate.current = true;
        setReminders(remoteReminders);
      }
    });

    // Realtime Chat listener
    const unsubChat = onValue(dbRefs.chatMessages, (snap) => {
      if (snap.exists()) {
        const remoteChat = snapshotToArray<ChatMessage>(snap.val());
        isRemoteUpdate.current = true;
        setChatMessages(remoteChat);
      }
    });

    // Realtime Notifications listener
    const unsubNotifications = onValue(dbRefs.notifications, (snap) => {
      if (snap.exists()) {
        const remoteNotifs = snapshotToArray<Notification>(snap.val());
        if (remoteNotifs.length > 0) {
          isRemoteUpdate.current = true;
          setNotifications(remoteNotifs);
        }
      }
    });

    // Realtime Vehicles listener
    const unsubVehicles = onValue(dbRefs.vehicles, (snap) => {
      if (snap.exists()) {
        const remoteVehicles = snapshotToArray<VehicleRecord>(snap.val());
        isRemoteUpdate.current = true;
        setVehicles(remoteVehicles);
      } else {
        setVehicles([]);
      }
    });

    // Safe auth state listener
    let unsubAuth: (() => void) | null = null;
    const currentAuth = auth;
    if (currentAuth) {
      try {
        unsubAuth = onAuthStateChanged(currentAuth, (user) => {
          if (user) {
            setCurrentUser(user);
          }
        });
      } catch (err) {
        console.warn("Auth listener setup warning:", err);
      }
    }

    return () => {
      if (unsubAuth) unsubAuth();
      unsubConnected();
      unsubGlobal();
      unsubLeaders();
      unsubOccurrences();
      unsubEmployees();
      unsubEmployeeLogs();
      unsubReminders();
      unsubChat();
      unsubNotifications();
      unsubVehicles();
    };
  }, []);

  // LocalStorage Cache
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
    localStorage.setItem('3c_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('3c_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('3c_is_admin', JSON.stringify(isAdmin));
  }, [isAdmin]);

  // Handler helpers with Firebase Sync
  const handleAddLeader = (name: string, role: string, shift?: string, avatar?: string) => {
    const newLeader: Leader = {
      id: `leader-${Date.now()}`,
      name,
      role,
      shift: shift || 'Plantão Geral',
      avatar,
      createdAt: new Date().toLocaleDateString('pt-BR')
    };
    const updated = [...leaders, newLeader];
    setLeaders(updated);
    setSelectedLeaderId(newLeader.id);
    syncLeadersToFirebase(updated);

    handleAddNotification(
      'Novo Líder Cadastrado',
      `O líder ${name} (${role} - ${newLeader.shift}) foi salvo no Firebase Realtime Database.`,
      'success'
    );
  };

  const handleDeleteLeader = (id: string) => {
    const updated = leaders.filter(l => l.id !== id);
    setLeaders(updated);
    if (selectedLeaderId === id && updated.length > 0) {
      setSelectedLeaderId(updated[0].id);
    }
    syncLeadersToFirebase(updated);

    handleAddNotification(
      'Líder Removido',
      'Um líder foi deletado do diretório pelo administrador.',
      'info'
    );
  };

  const handleUpdateLeader = (id: string, name: string, role: string, shift?: string, avatar?: string) => {
    const updated = leaders.map(l => l.id === id ? { 
      ...l, 
      name, 
      role, 
      ...(shift ? { shift } : {}),
      avatar: avatar !== undefined ? avatar : l.avatar
    } : l);
    setLeaders(updated);
    syncLeadersToFirebase(updated);

    handleAddNotification(
      'Líder Atualizado',
      `Informações de ${name} foram sincronizadas no Firebase.`,
      'info'
    );
  };

  const handleAddOccurrence = async (newOcc: Omit<Occurrence, 'id' | 'createdAt'>) => {
    const payload: any = {
      ...newOcc,
      createdAt: new Date().toISOString()
    };

    // Guarantee no undefined properties are sent
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        payload[key] = '';
      }
    });

    const savedOcc = await pushOccurrenceToFirebase(payload);

    if (savedOcc) {
      setOccurrences(prev => [savedOcc, ...prev.filter(o => o.id !== savedOcc.id)]);
    }
  };

  const handleUpdateOccurrenceStatus = async (id: string, newStatus: OccurrenceStatus) => {
    const target = occurrences.find(o => o.id === id);
    if (!target) return;

    const updatedOcc = { ...target, status: newStatus };
    const updated = occurrences.map(o => o.id === id ? updatedOcc : o);
    setOccurrences(updated);
    await updateOccurrenceInFirebase(updatedOcc);
    
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
      `O líder ${leaderText} alterou a ação para [${statusLabel}]. Todos os demais foram notificados em tempo real.`,
      type
    );
  };

  const handleDeleteOccurrence = async (id: string) => {
    const updated = occurrences.filter(o => o.id !== id);
    setOccurrences(updated);
    await deleteOccurrenceFromFirebase(id);

    handleAddNotification(
      'Registro Excluído',
      'Uma ocorrência foi apagada do histórico operacional.',
      'info'
    );
  };

  const handleEditOccurrence = async (updatedOcc: Occurrence) => {
    const updated = occurrences.map(o => o.id === updatedOcc.id ? updatedOcc : o);
    setOccurrences(updated);
    await updateOccurrenceInFirebase(updatedOcc);

    handleAddNotification(
      'Registro Editado',
      `Ocorrência "${updatedOcc.title}" foi sincronizada com sucesso.`,
      'info'
    );
  };

  const handleAddVehicle = async (record: Omit<VehicleRecord, 'id' | 'createdAt'>) => {
    const saved = await pushVehicleRecordToFirebase({
      ...record,
      createdAt: new Date().toISOString()
    });
    if (saved) {
      setVehicles(prev => [saved, ...prev.filter(v => v.id !== saved.id)]);
      handleAddNotification(
        'Veículo Cadastrado',
        `Cavalo ${saved.cavaloPlate} (${saved.carrier}) foi adicionado com sucesso.`,
        'success'
      );
    }
  };

  const handleUpdateVehicle = async (record: VehicleRecord) => {
    setVehicles(prev => prev.map(v => v.id === record.id ? record : v));
    await updateVehicleRecordInFirebase(record);
    handleAddNotification(
      'Veículo Atualizado',
      `Os dados do cavalo ${record.cavaloPlate} foram atualizados.`,
      'info'
    );
  };

  const handleDeleteVehicle = async (id: string) => {
    const target = vehicles.find(v => v.id === id);
    setVehicles(prev => prev.filter(v => v.id !== id));
    await deleteVehicleRecordFromFirebase(id);
    handleAddNotification(
      'Veículo Removido',
      `O registro do veículo ${target?.cavaloPlate || ''} foi excluído.`,
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
    const updated = [...employees, newEmp];
    setEmployees(updated);
    syncEmployeesToFirebase(updated);
  };

  const handleDeleteEmployee = (id: string) => {
    const updatedEmps = employees.filter(e => e.id !== id);
    const updatedLogs = employeeLogs.filter(l => l.employeeId !== id);
    setEmployees(updatedEmps);
    setEmployeeLogs(updatedLogs);
    syncEmployeesToFirebase(updatedEmps);
    syncEmployeeLogsToFirebase(updatedLogs);
  };

  const handleAddEmployeeLog = (newLog: Omit<EmployeeLog, 'id' | 'createdAt'>) => {
    const log: EmployeeLog = {
      ...newLog,
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updatedLogs = [log, ...employeeLogs];
    setEmployeeLogs(updatedLogs);
    syncEmployeeLogsToFirebase(updatedLogs);

    // Adjust positive/negative counters on the employee record dynamically
    const updatedEmps = employees.map(emp => {
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
    });
    setEmployees(updatedEmps);
    syncEmployeesToFirebase(updatedEmps);

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
    const updatedEmps = employees.map(emp => {
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
    });
    setEmployees(updatedEmps);
    syncEmployeesToFirebase(updatedEmps);

    const updatedLogs = employeeLogs.filter(l => l.id !== id);
    setEmployeeLogs(updatedLogs);
    syncEmployeeLogsToFirebase(updatedLogs);
  };

  const handleAddReminder = (newRem: Omit<Reminder, 'id'>) => {
    const rem: Reminder = {
      ...newRem,
      id: `rem-${Date.now()}`
    };
    const updated = [...reminders, rem];
    setReminders(updated);
    syncRemindersToFirebase(updated);

    handleAddNotification(
      'Compromisso Agendado',
      `Evento [${newRem.title}] salvo no Firebase.`,
      'info'
    );
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    syncRemindersToFirebase(updated);
  };

  const handleSendMessage = async (messageText: string) => {
    const activeLeader = leaders.find(l => l.id === selectedLeaderId) || leaders[0];
    const newMsg = {
      senderName: activeLeader.name,
      senderRole: activeLeader.role,
      message: messageText,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    const savedMsg = await pushChatMessageToFirebase(newMsg);
    if (savedMsg) {
      setChatMessages(prev => [...prev.filter(m => m.id !== savedMsg.id), savedMsg]);
    }
  };

  const handleSimulateReply = async (senderName: string, senderRole: string, messageText: string) => {
    const newMsg = {
      senderName,
      senderRole,
      message: messageText,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    const savedMsg = await pushChatMessageToFirebase(newMsg);
    if (savedMsg) {
      setChatMessages(prev => [...prev.filter(m => m.id !== savedMsg.id), savedMsg]);
    }
  };

  const handleClearChat = () => {
    setChatMessages([]);
    syncChatMessagesToFirebase([]);
  };

  const handleAddNotification = async (title: string, message: string, type: 'info' | 'warning' | 'success') => {
    const newNotif = {
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
      read: false
    };
    const savedNotif = await pushNotificationToFirebase(newNotif);
    if (savedNotif) {
      setNotifications(prev => [savedNotif, ...prev.filter(n => n.id !== savedNotif.id)]);
    }
  };

  const handleMarkNotificationsAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    syncNotificationsToFirebase(updated);
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
            vehicles={vehicles}
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
            onEditOccurrence={handleEditOccurrence}
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
      case 'veiculos':
        return (
          <VehicleManager
            vehicles={vehicles}
            onAddVehicle={handleAddVehicle}
            onUpdateVehicle={handleUpdateVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            isAdmin={isAdmin}
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
    { id: 'veiculos', label: 'Placas de Veículos', icon: Truck },
    { id: 'pastas', label: 'Pastas dos Líderes', icon: Folder },
    { id: 'funcionarios', label: 'Acompanhamento de Staff', icon: Users },
    { id: 'calendario', label: 'Agenda & Lembretes', icon: Calendar },
    { id: 'chat', label: 'Chat Equipe', icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans text-[#0F172A]">
      
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
        onDeleteLeader={handleDeleteLeader}
        onUpdateLeader={handleUpdateLeader}
        isFirebaseConnected={isFirebaseConnected}
      />

      <div className="flex-1 flex flex-col md:flex-row relative">
        
        {/* Navigation Sidebar (High Density Corporate Navy Blue & Slate Grays) */}
        <aside className="hidden md:flex flex-col w-64 bg-[#0F172A] text-white border-r border-[#1E293B] shrink-0 p-4 space-y-4 shadow-xl">
          
          {/* Brand block */}
          <div className="p-3 bg-gradient-to-r from-[#1E40AF] to-[#2563EB] flex items-center gap-3 rounded-xl shadow-md border border-blue-400/20">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg shrink-0">
              <div className="w-4 h-4 bg-[#1E40AF] rotate-45"></div>
            </div>
            <span className="font-extrabold text-xs tracking-tight uppercase italic text-white">Três Corações</span>
          </div>

          {/* Quick status box */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-3 space-y-2.5 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'} shadow-sm`} />
                <span className="text-[9px] font-black uppercase text-[#94A3B8]">Firebase Realtime</span>
              </div>
              <span className="text-[8px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                passagem-de-turno
              </span>
            </div>
            
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-[#94A3B8] block uppercase">Líder em Exercício</span>
              <p className="text-xs font-black text-white truncate">
                {leaders.find(l => l.id === selectedLeaderId)?.name || 'Nenhum'}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1">
            <span className="text-[9px] font-bold uppercase text-[#64748B] tracking-widest block px-2.5 mb-1.5">Aplicações</span>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all duration-150 cursor-pointer text-left ${
                    isSelected 
                      ? 'bg-[#2563EB] text-white font-black shadow-md shadow-blue-900/30' 
                      : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer of the sidebar */}
          <div className="pt-2.5 border-t border-[#1E293B] text-center">
            <div className="text-[9px] text-[#94A3B8] font-bold">
              Três Corações Alimentos © 2026
            </div>
            <div className="text-[8px] text-[#64748B] font-medium mt-0.5">
              v2.1.4 Build Prod
            </div>
          </div>

        </aside>

        {/* Mobile menu navigation trigger bar */}
        <div className="md:hidden bg-[#0F172A] border-b border-[#1E293B] p-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#2563EB] rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-white rotate-45"></div>
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-white">Três Corações</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 bg-[#1E293B] border border-[#334155] rounded-lg text-white"
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
              className="absolute inset-x-0 bg-[#0F172A] text-white p-4 border-b border-[#1E293B] z-40 space-y-3 md:hidden shadow-2xl"
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
                        isSelected ? 'bg-[#2563EB] text-white' : 'text-[#94A3B8] hover:bg-[#1E293B]'
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
