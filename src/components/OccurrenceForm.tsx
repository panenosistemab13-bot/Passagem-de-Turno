import React, { useState, useEffect, useMemo } from 'react';
import { Leader, OccurrenceStatus, Occurrence, VehicleRecord } from '../types';
import { 
  FileText, 
  User, 
  Calendar, 
  Clock,
  AlertTriangle, 
  Tag, 
  Bell, 
  CheckCircle2, 
  Sliders,
  Truck,
  Building2,
  PhoneCall,
  Radio,
  Wifi,
  Search,
  Check,
  ChevronDown,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  Edit3,
  X,
  MapPin,
  Shield,
  ShieldAlert,
  Zap,
  Activity,
  AlertOctagon,
  Flame,
  CheckCircle,
  HelpCircle,
  Navigation,
  Compass,
  Database,
  Satellite,
  Lock,
  ArrowRight,
  Info,
  RotateCcw,
  Send
} from 'lucide-react';
import { 
  OCCURRENCE_TITLES, 
  INSTABILITY_SYSTEMS, 
  COMMON_UNITS, 
  COMMON_CARRIERS, 
  DEFAULT_TRIP_RECORDS,
  TripReportRecord 
} from '../tripData';
import { pushOccurrenceToFirebase, rtdb, snapshotToArray } from '../lib/firebase';
import { onValue, ref, set } from 'firebase/database';

interface OccurrenceFormProps {
  leaders: Leader[];
  selectedLeaderId: string;
  onAddOccurrence: (occurrence: Omit<Occurrence, 'id' | 'createdAt'>) => void;
  onAddNotification: (title: string, message: string, type: 'info' | 'warning' | 'success') => void;
  onSelectTab: (tab: string) => void;
  vehicles?: VehicleRecord[];
}

// 3D Visual categories for the primary selection grid
interface CategoryPill {
  id: string;
  label: string;
  titlePreset: string;
  category: 'Segurança' | 'Operação' | 'Logística' | 'Rastreamento' | 'Qualidade' | 'Manutenção' | 'Instabilidade / Tecnologia' | 'Outros';
  risk: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
  icon: React.ElementType;
  glowColor: string;
  borderColor: string;
}

const CATEGORY_PILLS: CategoryPill[] = [
  {
    id: 'mecanico',
    label: 'Problema Mecânico',
    titlePreset: 'Problema mecânico ou elétrico no veículo',
    category: 'Manutenção',
    risk: 'Médio',
    icon: Zap,
    glowColor: 'rgba(212, 163, 115, 0.25)',
    borderColor: '#D4A373'
  },
  {
    id: 'acidente',
    label: 'Acidente / Colisão',
    titlePreset: 'Sinistro confirmado - Colisão rodoviária',
    category: 'Segurança',
    risk: 'Crítico',
    icon: AlertOctagon,
    glowColor: 'rgba(239, 68, 68, 0.35)',
    borderColor: '#EF4444'
  },
  {
    id: 'roubo_furto',
    label: 'Roubo / Furto / Sinistro',
    titlePreset: 'Suspeita de sinistro / Tentativa de furto',
    category: 'Segurança',
    risk: 'Crítico',
    icon: ShieldAlert,
    glowColor: 'rgba(239, 68, 68, 0.4)',
    borderColor: '#DC2626'
  },
  {
    id: 'desvio_rota',
    label: 'Desvio de Rota',
    titlePreset: 'Desvio de rota não programado / Alerta de percurso',
    category: 'Rastreamento',
    risk: 'Alto',
    icon: Navigation,
    glowColor: 'rgba(245, 158, 11, 0.3)',
    borderColor: '#F59E0B'
  },
  {
    id: 'atraso',
    label: 'Atraso Logístico',
    titlePreset: 'Atraso operacional / Parada prolongada em trânsito',
    category: 'Logística',
    risk: 'Médio',
    icon: Clock,
    glowColor: 'rgba(56, 189, 248, 0.25)',
    borderColor: '#38BDF8'
  },
  {
    id: 'perda_sinal',
    label: 'Perda de Sinal / Sascar',
    titlePreset: 'Perda de sinal de telemetria / Acionamento Sascar',
    category: 'Rastreamento',
    risk: 'Alto',
    icon: Radio,
    glowColor: 'rgba(168, 85, 247, 0.3)',
    borderColor: '#A855F7'
  },
  {
    id: 'problema_operacional',
    label: 'Problema Operacional',
    titlePreset: 'Transbordo de carga / Divergência em doca',
    category: 'Operação',
    risk: 'Médio',
    icon: Activity,
    glowColor: 'rgba(212, 163, 115, 0.25)',
    borderColor: '#D4A373'
  },
  {
    id: 'violacao',
    label: 'Violação de Procedimento',
    titlePreset: 'Violação de sensor / Espelhamento retirado sem autorização',
    category: 'Segurança',
    risk: 'Alto',
    icon: Lock,
    glowColor: 'rgba(244, 63, 94, 0.3)',
    borderColor: '#F43F5E'
  },
  {
    id: 'instabilidade_tech',
    label: 'Instabilidade de Tecnologia',
    titlePreset: 'Instabilidade de Telefonia / Central / Links',
    category: 'Instabilidade / Tecnologia',
    risk: 'Médio',
    icon: Wifi,
    glowColor: 'rgba(16, 185, 129, 0.25)',
    borderColor: '#10B981'
  },
  {
    id: 'outros',
    label: 'Outros Incidentes',
    titlePreset: 'Ocorrência operacional complementar',
    category: 'Outros',
    risk: 'Baixo',
    icon: FileText,
    glowColor: 'rgba(148, 163, 184, 0.2)',
    borderColor: '#64748B'
  }
];

export default function OccurrenceForm({
  leaders,
  selectedLeaderId,
  onAddOccurrence,
  onAddNotification,
  onSelectTab,
  vehicles: initialVehicles
}: OccurrenceFormProps) {
  const [vehiclesList, setVehiclesList] = useState<VehicleRecord[]>(initialVehicles || []);

  // Realtime listener for vehicles
  useEffect(() => {
    const unsub = onValue(ref(rtdb, 'dados-globais/veiculos'), (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list = snapshotToArray<VehicleRecord>(val);
        setVehiclesList(list);
      } else {
        setVehiclesList([]);
      }
    });
    return () => unsub();
  }, []);
  
  // Registration Mode
  const [recordType, setRecordType] = useState<'padrao' | 'instabilidade'>('padrao');
  const [selectedPillId, setSelectedPillId] = useState<string>('mecanico');

  // Core Form fields
  const [title, setTitle] = useState('Problema mecânico ou elétrico no veículo');
  const [description, setDescription] = useState('');
  const [leaderId, setLeaderId] = useState(selectedLeaderId);
  const [customShiftDate, setCustomShiftDate] = useState('');
  const [status, setStatus] = useState<OccurrenceStatus>('acompanhar');
  const [riskLevel, setRiskLevel] = useState<'Baixo' | 'Médio' | 'Alto' | 'Crítico'>('Médio');
  const [category, setCategory] = useState<'Segurança' | 'Operação' | 'Logística' | 'Rastreamento' | 'Qualidade' | 'Manutenção' | 'Instabilidade / Tecnologia' | 'Outros'>('Manutenção');
  const [rawDate, setRawDate] = useState('');
  const [eventTime, setEventTime] = useState('');

  // Transport & Vehicle fields (Placa, Transportadora, Unidade)
  const [plate, setPlate] = useState('');
  const [carrier, setCarrier] = useState('');
  const [unit, setUnit] = useState('CD Varginha / MG');
  
  // Instability & Tickets fields
  const [instabilitySystem, setInstabilitySystem] = useState<string>('Telefonia');
  const [ticketNumber, setTicketNumber] = useState('');
  const [affectedTechnology, setAffectedTechnology] = useState('Central Telefônica Avaya');

  // Quick Trip / Vehicle Picker
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');

  // Unidades / Lugares Grupo 3 Corações state & management
  const [unitsList, setUnitsList] = useState<string[]>(() => {
    const saved = localStorage.getItem('grupo3c_units');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return [...COMMON_UNITS];
  });
  const [showUnitManagerModal, setShowUnitManagerModal] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [editingUnitIndex, setEditingUnitIndex] = useState<number | null>(null);
  const [editingUnitName, setEditingUnitName] = useState('');

  // Submitting Animation State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update leader state when global selection changes
  useEffect(() => {
    setLeaderId(selectedLeaderId);
  }, [selectedLeaderId]);

  // Set default raw date, current time and shift label on load
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const hh = String(today.getHours()).padStart(2, '0');
    const min = String(today.getMinutes()).padStart(2, '0');
    
    setRawDate(`${yyyy}-${mm}-${dd}`);
    setEventTime(`${hh}:${min}`);
    setCustomShiftDate(`Plantão ${dd}/${mm}/${yyyy}`);
  }, []);

  // Sync raw date with custom plantão label
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateVal = e.target.value;
    setRawDate(dateVal);
    if (dateVal) {
      const [yyyy, mm, dd] = dateVal.split('-');
      setCustomShiftDate(`Plantão ${dd}/${mm}/${yyyy}`);
    }
  };

  // Set current time helper
  const handleSetCurrentTime = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    setEventTime(`${hh}:${min}`);
  };

  // Set today / yesterday date shortcuts
  const handleSetQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setRawDate(`${yyyy}-${mm}-${dd}`);
    setCustomShiftDate(`Plantão ${dd}/${mm}/${yyyy}`);
  };

  // Switch between Standard and Instability modes
  const handleModeChange = (mode: 'padrao' | 'instabilidade') => {
    setRecordType(mode);
    if (mode === 'instabilidade') {
      setCategory('Instabilidade / Tecnologia');
      setSelectedPillId('instabilidade_tech');
      setTitle(`Instabilidade de ${instabilitySystem}`);
      setRiskLevel('Médio');
    } else {
      setCategory('Manutenção');
      setSelectedPillId('mecanico');
      setTitle('Problema mecânico ou elétrico no veículo');
      setRiskLevel('Médio');
    }
  };

  // Select 3D Category Pill
  const handleSelectPill = (pill: CategoryPill) => {
    setSelectedPillId(pill.id);
    setTitle(pill.titlePreset);
    setCategory(pill.category);
    setRiskLevel(pill.risk);

    if (pill.id === 'instabilidade_tech') {
      setRecordType('instabilidade');
    } else {
      setRecordType('padrao');
    }
  };

  // Select instability preset
  const handleSelectInstabilitySystem = (sys: string) => {
    setInstabilitySystem(sys);
    setTitle(`Instabilidade de ${sys}`);
    setAffectedTechnology(sys);
  };

  // Insert Quick Protocol Tag into description
  const handleInsertProtocolTag = (tag: string) => {
    setDescription((prev) => {
      const trimmed = prev.trim();
      const prefix = trimmed ? `${trimmed}\n` : '';
      return `${prefix}[PROTOCOLO EXECUTADO: ${tag}] - `;
    });
  };

  // Auto-fill from registered Vehicles / Trip records
  const handleApplyVehicle = (veh: { plate: string; carrier: string; unit?: string; driver?: string }) => {
    setPlate(veh.plate);
    setCarrier(veh.carrier);
    if (veh.unit) setUnit(veh.unit);
    setShowVehiclePicker(false);

    if (!description.trim()) {
      setDescription(`Veículo: ${veh.plate} | Transportadora: ${veh.carrier}${veh.unit ? ` | Unidade: ${veh.unit}` : ''}${veh.driver ? ` | Condutor: ${veh.driver}` : ''}\n\nDetalhamento da Ocorrência: `);
    }
  };

  // Realtime listener for units from Firebase
  useEffect(() => {
    const unsub = onValue(ref(rtdb, 'dados-globais/unidades'), (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (Array.isArray(val)) {
          setUnitsList(val);
          localStorage.setItem('grupo3c_units', JSON.stringify(val));
        }
      } else {
        set(ref(rtdb, 'dados-globais/unidades'), [...COMMON_UNITS]);
      }
    });
    return () => unsub();
  }, []);

  const saveUnitsToFirebase = async (updated: string[]) => {
    setUnitsList(updated);
    localStorage.setItem('grupo3c_units', JSON.stringify(updated));
    try {
      await set(ref(rtdb, 'dados-globais/unidades'), updated);
    } catch (err) {
      console.error("Error saving units:", err);
    }
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;
    if (unitsList.includes(newUnitName.trim())) {
      onAddNotification("Aviso", "Esta unidade já está cadastrada.", "warning");
      return;
    }
    const updated = [...unitsList, newUnitName.trim()];
    saveUnitsToFirebase(updated);
    setNewUnitName('');
    onAddNotification("Sucesso", "Unidade adicionada com sucesso!", "success");
  };

  const handleUpdateUnit = (index: number) => {
    if (!editingUnitName.trim()) return;
    const updated = [...unitsList];
    updated[index] = editingUnitName.trim();
    saveUnitsToFirebase(updated);
    setEditingUnitIndex(null);
    setEditingUnitName('');
    onAddNotification("Sucesso", "Unidade atualizada com sucesso!", "success");
  };

  const handleDeleteUnit = (index: number) => {
    if (unitsList.length <= 1) {
      onAddNotification("Aviso", "Deve haver pelo menos uma unidade cadastrada.", "warning");
      return;
    }
    const unitToDelete = unitsList[index];
    if (window.confirm(`Deseja apagar a unidade "${unitToDelete}"?`)) {
      const updated = unitsList.filter((_, i) => i !== index);
      saveUnitsToFirebase(updated);
      onAddNotification("Sucesso", "Unidade removida!", "success");
    }
  };

  // Filtered vehicles & trips for quick selection modal
  const combinedVehicles = useMemo(() => {
    const list: Array<{ id: string; plate: string; carrier: string; unit?: string; driver?: string; source: string }> = [];
    
    // Add from vehiclesList
    vehiclesList.forEach(v => {
      list.push({
        id: `veh-${v.id}`,
        plate: v.cavaloPlate + (v.carretaPlates ? ` / ${v.carretaPlates}` : ''),
        carrier: v.carrier,
        driver: v.driverName,
        source: 'Frota Cadastrada'
      });
    });

    // Add default trips
    DEFAULT_TRIP_RECORDS.forEach(t => {
      if (!list.some(item => item.plate.includes(t.plate))) {
        list.push({
          id: `trip-${t.id}`,
          plate: t.plate,
          carrier: t.carrier,
          unit: t.unit,
          driver: t.driver,
          source: 'Escala Ativa'
        });
      }
    });

    if (!vehicleSearchQuery) return list;
    return list.filter(item => 
      item.plate.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
      item.carrier.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
      (item.unit && item.unit.toLowerCase().includes(vehicleSearchQuery.toLowerCase())) ||
      (item.driver && item.driver.toLowerCase().includes(vehicleSearchQuery.toLowerCase()))
    );
  }, [vehiclesList, vehicleSearchQuery]);

  // Risk visual colors & percentage for the 3D gauge
  const riskConfig = useMemo(() => {
    switch (riskLevel) {
      case 'Crítico':
        return {
          pct: 95,
          color: '#EF4444',
          bg: 'bg-red-500/15',
          border: 'border-red-500/60',
          text: 'text-red-400',
          glow: 'shadow-[0_0_25px_rgba(239,68,68,0.4)]',
          label: 'Ameaça Imediata • Resposta em Minutos'
        };
      case 'Alto':
        return {
          pct: 75,
          color: '#F59E0B',
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/60',
          text: 'text-amber-400',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
          label: 'Atenção Elevada • Acompanhamento Ativo'
        };
      case 'Médio':
        return {
          pct: 50,
          color: '#D4A373',
          bg: 'bg-[#D4A373]/15',
          border: 'border-[#D4A373]/60',
          text: 'text-[#D4A373]',
          glow: 'shadow-[0_0_20px_rgba(212,163,115,0.25)]',
          label: 'Monitoramento Padrão • Sem Impacto Direto'
        };
      case 'Baixo':
      default:
        return {
          pct: 25,
          color: '#10B981',
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/60',
          text: 'text-emerald-400',
          glow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]',
          label: 'Rotina Operacional • Registro Preventivo'
        };
    }
  }, [riskLevel]);

  // Suggested SOP / Protocol based on selected category & risk
  const suggestedProtocol = useMemo(() => {
    if (riskLevel === 'Crítico') {
      return {
        title: 'Protocolo de Alta Prioridade (SOP-01)',
        steps: [
          '1. Acionar imediatamente a Escolta Armada e PRF / 190.',
          '2. Bloquear telemetria Sascar e ativar alerta sonoro.',
          '3. Notificar Coordenador de Segurança e Direção de Logística.'
        ]
      };
    }
    if (category === 'Rastreamento' || selectedPillId === 'perda_sinal' || selectedPillId === 'desvio_rota') {
      return {
        title: 'Protocolo de Telemetria & Rastreamento (SOP-04)',
        steps: [
          '1. Estabelecer contato telefônico com o motorista e transportadora.',
          '2. Solicitar espelhamento emergencial à central Sascar/Trafegus.',
          '3. Definir ponto de parada segura para checagem de atuadores.'
        ]
      };
    }
    if (category === 'Manutenção') {
      return {
        title: 'Protocolo de Suporte Mecânico (SOP-07)',
        steps: [
          '1. Encaminhar veículo para ponto de apoio ou concessionária credenciada.',
          '2. Avaliar necessidade de transbordo caso o reparo exceda 4 horas.',
          '3. Registrar fotos do hodômetro e laudo mecânico preliminar.'
        ]
      };
    }
    return {
      title: 'Protocolo de Acompanhamento Padrão (SOP-10)',
      steps: [
        '1. Validar integridade da carga e lacres com o condutor.',
        '2. Registrar histórico no livro de turno para o próximo líder.',
        '3. Atualizar status para Concluído assim que normalizado.'
      ]
    };
  }, [riskLevel, category, selectedPillId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert('Por favor, preencha o Título e a Descrição da ocorrência!');
      return;
    }

    setIsSubmitting(true);

    const currentLeader = leaders.find(l => l.id === leaderId) || leaders[0];

    const newRecord: any = {
      date: rawDate || '',
      shiftDate: customShiftDate || '',
      leaderId: currentLeader?.id || '1',
      leaderName: currentLeader?.name || 'Líder',
      title: title.trim(),
      description: description.trim(),
      status: status || 'acompanhar',
      riskLevel: riskLevel || 'Médio',
      category: category || 'Geral',
      recordType: recordType || 'padrao',
      plate: plate.trim() ? plate.toUpperCase() : '',
      carrier: carrier.trim() || '',
      unit: unit.trim() || '',
      instabilitySystem: recordType === 'instabilidade' ? (instabilitySystem || '') : '',
      ticketNumber: ticketNumber.trim() || '',
      affectedTechnology: affectedTechnology.trim() || '',
      createdAt: new Date().toISOString()
    };

    Object.keys(newRecord).forEach(key => {
      if (newRecord[key] === undefined) {
        newRecord[key] = '';
      }
    });

    try {
      if (onAddOccurrence) {
        await onAddOccurrence(newRecord);
      } else {
        await pushOccurrenceToFirebase(newRecord);
      }

      let notifType: 'info' | 'warning' | 'success' = 'info';
      let notifTitle = '';
      let notifMsg = '';

      if (recordType === 'instabilidade') {
        notifType = 'warning';
        notifTitle = `⚡ Instabilidade Registrada: ${title}`;
        notifMsg = `Sistema: ${instabilitySystem}${ticketNumber ? ` | Chamado: ${ticketNumber}` : ''}. Registrado por ${currentLeader?.name}.`;
      } else if (status === 'acompanhar') {
        notifType = 'warning';
        notifTitle = `Nova Ocorrência sob Acompanhamento: ${title}`;
        notifMsg = `${plate ? `[${plate.toUpperCase()}] ` : ''}Registrada por ${currentLeader?.name}. Risco: ${riskLevel}. Requer monitoramento ativo.`;
      } else if (status === 'resolvido') {
        notifType = 'success';
        notifTitle = `Incidente Concluído: ${title}`;
        notifMsg = `Lançado diretamente como concluído pelo líder ${currentLeader?.name}.`;
      } else {
        notifType = 'info';
        notifTitle = `Para Conhecimento: ${title}`;
        notifMsg = `Aviso operacional registrado por ${currentLeader?.name}.`;
      }

      onAddNotification(notifTitle, notifMsg, notifType);

      setTimeout(() => {
        setIsSubmitting(false);
        onSelectTab('dashboard');
      }, 400);

    } catch (err) {
      console.error("Erro ao registrar:", err);
      setIsSubmitting(false);
      alert("Erro ao gravar ocorrência. Verifique a conexão com o banco de dados.");
    }
  };

  return (
    <div className="w-full text-[#E2E8F0] space-y-5 select-none pb-12">
      
      {/* 1. TOP HEADER BAR: 3D Control Center Style */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B0F17] via-[#101726] to-[#0A0D14] border border-[#223048] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        {/* Subtle Ambient Glow Light */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-[#D4A373]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-24 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black uppercase tracking-widest bg-gradient-to-r from-[#C68A4C] to-[#E2B170] text-black shadow-sm">
                CENTRAL DE RISCO & OPERAÇÕES
              </span>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                TELEMETRIA CONECTADA
              </span>
              <span className="text-[11px] font-mono text-[#D4A373] hidden sm:inline-flex items-center gap-1 bg-[#261C14] border border-[#523A25] px-2 py-0.5 rounded">
                <Satellite className="w-3 h-3" /> SATÉLITE 3C-GEO ONLINE
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight flex items-center gap-2">
              Registro de Ocorrências & Gestão de Incidentes
            </h1>
            <p className="text-xs text-slate-400">
              Protocolo corporativo unificado para lançamento, rastreamento de frotas e despacho de respostas operacionais
            </p>
          </div>

          {/* Mode Selector Tabs (3D Glass Toggle) */}
          <div className="flex items-center gap-2 bg-[#06090E] p-1.5 rounded-xl border border-[#1F2B3E] shadow-inner shrink-0">
            <button
              type="button"
              onClick={() => handleModeChange('padrao')}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                recordType === 'padrao'
                  ? 'bg-gradient-to-r from-[#C68A4C] via-[#D4A373] to-[#E2B170] text-black shadow-[0_4px_16px_rgba(212,163,115,0.35)] scale-100'
                  : 'text-slate-400 hover:text-white hover:bg-[#131A26]'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Frota & Logística</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('instabilidade')}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                recordType === 'instabilidade'
                  ? 'bg-gradient-to-r from-[#C68A4C] via-[#D4A373] to-[#E2B170] text-black shadow-[0_4px_16px_rgba(212,163,115,0.35)] scale-100'
                  : 'text-slate-400 hover:text-white hover:bg-[#131A26]'
              }`}
            >
              <Wifi className="w-4 h-4" />
              <span>Sistemas & Chamados</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN WIDESCREEN 1920x1080 2-COLUMN GRID */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: PRIMARY REGISTRATION MODULES (8 of 12 cols on Widescreen) */}
        <div className="xl:col-span-8 space-y-5">
          
          {/* ============================================================ */}
          {/* CARD 01 — TIPO DE OCORRÊNCIA (3D Dynamic Matrix of Pills) */}
          {/* ============================================================ */}
          <div className="relative rounded-2xl bg-[#0C111A] border border-[#1F2B3E] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all hover:border-[#2D3F59]">
            <div className="flex items-center justify-between border-b border-[#1A2536] pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2A1D13] to-[#17120D] border border-[#5E4228] text-[#E2B170] flex items-center justify-center text-xs font-mono font-bold shadow-md">
                  01
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 font-sans">
                  Tipo de Ocorrência & Classificação Rápida
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#D4A373] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Seleção com Auto-Preenchimento
              </span>
            </div>

            {/* 3D Interactive Pills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 mb-4">
              {CATEGORY_PILLS.map((pill) => {
                const Icon = pill.icon;
                const isSelected = selectedPillId === pill.id;

                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => handleSelectPill(pill)}
                    style={{
                      boxShadow: isSelected ? `0 6px 20px ${pill.glowColor}` : 'none'
                    }}
                    className={`relative p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-24 overflow-hidden group ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#182333] to-[#0E1522] border-[#D4A373] text-white -translate-y-0.5'
                        : 'bg-[#090D14] border-[#1A2536] text-slate-400 hover:border-[#2C3B52] hover:text-slate-200 hover:bg-[#0E1420]'
                    }`}
                  >
                    {/* Top row with Icon & Risk Badge */}
                    <div className="flex items-center justify-between w-full">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#D4A373]/20 text-[#D4A373]' : 'bg-[#141B26] text-slate-400 group-hover:text-slate-300'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        pill.risk === 'Crítico' ? 'bg-red-950/70 text-red-400 border border-red-800/50' :
                        pill.risk === 'Alto' ? 'bg-amber-950/70 text-amber-400 border border-amber-800/50' :
                        pill.risk === 'Médio' ? 'bg-amber-950/40 text-[#D4A373] border border-[#523A25]' :
                        'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40'
                      }`}>
                        {pill.risk}
                      </span>
                    </div>

                    {/* Bottom Label */}
                    <div>
                      <p className="text-[11px] font-bold leading-tight line-clamp-2">
                        {pill.label}
                      </p>
                    </div>

                    {/* Active Accent Light Corner */}
                    {isSelected && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-gradient-to-tl from-[#D4A373] to-transparent rounded-tl" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom / Editable Title Input Field with 3D Depth */}
            <div className="relative">
              <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1.5 font-sans">
                Título Oficial da Ocorrência <span className="text-[#D4A373]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Descreva resumidamente o evento..."
                  className="w-full bg-[#080C13] border border-[#233145] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] transition-all placeholder:text-slate-500 shadow-inner"
                  required
                />
                <Tag className="absolute left-3 top-3 w-4 h-4 text-[#D4A373]" />
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* CARD 02 — VEÍCULO, FROTAS & UNIDADE (When Mode is Frota) */}
          {/* ============================================================ */}
          {recordType === 'padrao' ? (
            <div className="relative rounded-2xl bg-[#0C111A] border border-[#1F2B3E] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all hover:border-[#2D3F59]">
              <div className="flex items-center justify-between border-b border-[#1A2536] pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2A1D13] to-[#17120D] border border-[#5E4228] text-[#E2B170] flex items-center justify-center text-xs font-mono font-bold shadow-md">
                    02
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 font-sans">
                    Veículo, Transportadora & Unidade Operacional
                  </h3>
                </div>

                {/* Quick Frota Lookup Button */}
                <button
                  type="button"
                  onClick={() => setShowVehiclePicker(true)}
                  className="px-2.5 py-1 rounded-lg bg-[#141C29] border border-[#25354D] hover:border-[#D4A373] text-[10px] font-bold text-[#D4A373] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Search className="w-3 h-3" />
                  <span>Buscar na Frota Ativa</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Placa do Veículo */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1.5 font-sans">
                    Placa do Veículo (Cavalo / Carreta)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={plate}
                      onChange={(e) => setPlate(e.target.value.toUpperCase())}
                      placeholder="Ex: ABC-1D23 / BRA-4E56"
                      className="w-full uppercase font-mono font-bold bg-[#080C13] border border-[#233145] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] transition-all shadow-inner"
                    />
                    <Truck className="absolute left-3 top-3 w-4 h-4 text-[#D4A373]" />
                  </div>
                </div>

                {/* 2. Transportadora */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1.5 font-sans">
                    Transportadora Parceira
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="carrier-datalist"
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      placeholder="Ex: JSL Logística, Patrus..."
                      className="w-full bg-[#080C13] border border-[#233145] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] font-semibold transition-all shadow-inner"
                    />
                    <Building2 className="absolute left-3 top-3 w-4 h-4 text-[#D4A373]" />
                    <datalist id="carrier-datalist">
                      {COMMON_CARRIERS.map((c, i) => (
                        <option key={i} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* 3. Unidade 3 Corações */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold uppercase text-slate-300 font-sans">
                      Unidade / Operação 3C
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowUnitManagerModal(true)}
                      className="text-[9px] text-[#D4A373] hover:underline font-mono"
                    >
                      + Gerenciar
                    </button>
                  </div>
                  <div className="relative">
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full bg-[#080C13] border border-[#233145] rounded-xl pl-10 pr-8 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] font-semibold transition-all appearance-none cursor-pointer shadow-inner"
                    >
                      {unitsList.map((u, i) => (
                        <option key={i} value={u}>{u}</option>
                      ))}
                    </select>
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#D4A373]" />
                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* CARD 02B: INSTABILIDADE & SISTEMAS */
            <div className="relative rounded-2xl bg-[#0C111A] border border-[#1F2B3E] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all hover:border-[#2D3F59]">
              <div className="flex items-center gap-2.5 border-b border-[#1A2536] pb-3 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2A1D13] to-[#17120D] border border-[#5E4228] text-[#E2B170] flex items-center justify-center text-xs font-mono font-bold shadow-md">
                  02
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 font-sans">
                  Infraestrutura de Tecnologia & Rastreamento Afetada
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1.5 font-sans">
                    Sistema / Serviço <span className="text-[#D4A373]">*</span>
                  </label>
                  <select
                    value={instabilitySystem}
                    onChange={(e) => handleSelectInstabilitySystem(e.target.value)}
                    className="w-full bg-[#080C13] border border-[#233145] rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-[#D4A373] shadow-inner"
                  >
                    {INSTABILITY_SYSTEMS.map((s, i) => (
                      <option key={i} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1.5 font-sans">
                    Nº do Chamado / Ticket Técnico
                  </label>
                  <input
                    type="text"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                    placeholder="Ex: INC-99420 / TKT-8841"
                    className="w-full bg-[#080C13] border border-[#233145] rounded-xl px-3 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-[#D4A373] shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1.5 font-sans">
                    Operadora / Tecnologia
                  </label>
                  <input
                    type="text"
                    value={affectedTechnology}
                    onChange={(e) => setAffectedTechnology(e.target.value)}
                    placeholder="Ex: Sascar / Trafegus / Link Vivo 500M"
                    className="w-full bg-[#080C13] border border-[#233145] rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-[#D4A373] shadow-inner"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* CARD 03 — RESPONSÁVEL, DATA & HORA DO EVENTO */}
          {/* ============================================================ */}
          <div className="relative rounded-2xl bg-[#0C111A] border border-[#1F2B3E] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all hover:border-[#2D3F59]">
            <div className="flex items-center justify-between border-b border-[#1A2536] pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2A1D13] to-[#17120D] border border-[#5E4228] text-[#E2B170] flex items-center justify-center text-xs font-mono font-bold shadow-md">
                  03
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 font-sans">
                  Responsável, Data & Horário do Evento
                </h3>
              </div>

              {/* Quick Date Shortcuts */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSetQuickDate(0)}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#141C29] border border-[#223048] text-slate-300 hover:text-white hover:border-[#D4A373] transition-colors"
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => handleSetQuickDate(1)}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#141C29] border border-[#223048] text-slate-300 hover:text-white hover:border-[#D4A373] transition-colors"
                >
                  Ontem
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* 1. Líder Responsável */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1.5 font-sans">
                  Líder Responsável <span className="text-[#D4A373]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={leaderId}
                    onChange={(e) => setLeaderId(e.target.value)}
                    className="w-full bg-[#080C13] border border-[#233145] rounded-xl pl-10 pr-8 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A373] font-semibold appearance-none cursor-pointer shadow-inner"
                  >
                    {leaders.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.role})
                      </option>
                    ))}
                  </select>
                  <User className="absolute left-3 top-3 w-4 h-4 text-[#D4A373]" />
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* 2. Data da Ocorrência */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1.5 font-sans">
                  Data da Ocorrência <span className="text-[#D4A373]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={rawDate}
                    onChange={handleDateChange}
                    className="w-full bg-[#080C13] border border-[#233145] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A373] font-semibold shadow-inner"
                    required
                  />
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-[#D4A373]" />
                </div>
              </div>

              {/* 3. Hora do Evento */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase text-slate-300 font-sans">
                    Hora do Evento
                  </label>
                  <button
                    type="button"
                    onClick={handleSetCurrentTime}
                    className="text-[9px] text-[#D4A373] hover:underline font-mono"
                  >
                    Agora
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full bg-[#080C13] border border-[#233145] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A373] font-semibold shadow-inner"
                  />
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-[#D4A373]" />
                </div>
              </div>

            </div>
          </div>

          {/* ============================================================ */}
          {/* CARD 04 — STATUS E CLASSIFICAÇÃO DE RISCO (3D Gauges & Badges) */}
          {/* ============================================================ */}
          <div className="relative rounded-2xl bg-[#0C111A] border border-[#1F2B3E] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all hover:border-[#2D3F59]">
            <div className="flex items-center gap-2.5 border-b border-[#1A2536] pb-3 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2A1D13] to-[#17120D] border border-[#5E4228] text-[#E2B170] flex items-center justify-center text-xs font-mono font-bold shadow-md">
                04
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 font-sans">
                Status Operacional, Nível de Risco & Categoria
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* 1. Status da Ocorrência */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1.5 font-sans">
                  Status Operacional <span className="text-[#D4A373]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OccurrenceStatus)}
                    className="w-full bg-[#080C13] border border-[#233145] rounded-xl pl-10 pr-8 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A373] font-semibold appearance-none cursor-pointer shadow-inner"
                  >
                    <option value="acompanhar">⚠ Acompanhar (Requer Monitoramento)</option>
                    <option value="resolvido">✓ Resolvido (Ação Concluída)</option>
                    <option value="para conhecimento">ℹ Para Conhecimento (Informativo)</option>
                  </select>
                  <Sliders className="absolute left-3 top-3 w-4 h-4 text-[#D4A373]" />
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* 2. Nível de Risco (With Visual Intensity Bar) */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1.5 font-sans">
                  Nível de Risco <span className="text-[#D4A373]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value as any)}
                    className="w-full bg-[#080C13] border border-[#233145] rounded-xl pl-10 pr-8 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A373] font-bold appearance-none cursor-pointer shadow-inner"
                  >
                    <option value="Baixo">Baixo (Normal / Preventivo)</option>
                    <option value="Médio">Médio (Atenção / Padrão)</option>
                    <option value="Alto">Alto (Alerta Operacional)</option>
                    <option value="Crítico">Crítico (Emergência Imediata)</option>
                  </select>
                  <AlertTriangle className={`absolute left-3 top-3 w-4 h-4 ${riskConfig.text}`} />
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Micro 3D Intensity Bar */}
                <div className="mt-2 w-full h-1.5 bg-[#06090E] rounded-full overflow-hidden border border-[#1A2536]">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${riskConfig.pct}%`,
                      backgroundColor: riskConfig.color
                    }}
                  />
                </div>
              </div>

              {/* 3. Área / Categoria */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1.5 font-sans">
                  Área / Categoria <span className="text-[#D4A373]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#080C13] border border-[#233145] rounded-xl pl-10 pr-8 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A373] font-semibold appearance-none cursor-pointer shadow-inner"
                  >
                    <option value="Logística">Logística & Frotas</option>
                    <option value="Rastreamento">Rastreamento & Telemetria</option>
                    <option value="Segurança">Segurança Patrimonial</option>
                    <option value="Operação">Operação Geral</option>
                    <option value="Qualidade">Qualidade de Carga</option>
                    <option value="Manutenção">Manutenção de Instalações</option>
                    <option value="Instabilidade / Tecnologia">Instabilidade de Tecnologia</option>
                    <option value="Outros">Outros</option>
                  </select>
                  <Tag className="absolute left-3 top-3 w-4 h-4 text-[#D4A373]" />
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

            </div>
          </div>

          {/* ============================================================ */}
          {/* CARD 05 — DESCRIÇÃO DETALHADA & PROTOCOLOS */}
          {/* ============================================================ */}
          <div className="relative rounded-2xl bg-[#0C111A] border border-[#1F2B3E] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all hover:border-[#2D3F59]">
            <div className="flex items-center justify-between border-b border-[#1A2536] pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2A1D13] to-[#17120D] border border-[#5E4228] text-[#E2B170] flex items-center justify-center text-xs font-mono font-bold shadow-md">
                  05
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 font-sans">
                  Descrição Detalhada da Ocorrência
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {description.length} caracteres
              </span>
            </div>

            {/* Quick Action Protocol Snippet Chips */}
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase mr-1 flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#D4A373]" /> Inserir Tag Rápida:
              </span>
              {[
                'Acionamento de Escolta',
                'Polícia Rodoviária (190)',
                'Sascar Notificado',
                'Pátio Seguro Solicitado',
                'Guincho em Trânsito',
                'Motorista Ciente'
              ].map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleInsertProtocolTag(tag)}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#141C29] border border-[#223048] hover:border-[#D4A373] text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  + {tag}
                </button>
              ))}
            </div>

            {/* Expansive 3D Textarea */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva detalhadamente o evento, circunstâncias locais, providências adotadas pela equipe de segurança e instruções operacionais para o turno subsequente..."
              rows={6}
              className="w-full bg-[#080C13] border border-[#233145] rounded-xl p-4 text-xs text-white focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] transition-all leading-relaxed placeholder:text-slate-500 shadow-inner font-sans"
              required
            />
          </div>

          {/* ============================================================ */}
          {/* ACTIONS: CANCEL & 3D REGISTER BUTTON */}
          {/* ============================================================ */}
          <div className="rounded-2xl bg-[#0B0F17] border border-[#1E2838] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Info className="w-4 h-4 text-[#D4A373]" />
              <span className="text-[11px]">O registro será propagado instantaneamente para toda a equipe do plantão.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => onSelectTab('dashboard')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase text-slate-400 hover:text-white hover:bg-[#141C29] transition-all cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-xl text-xs font-black uppercase text-black bg-gradient-to-r from-[#C68A4C] via-[#D4A373] to-[#E2B170] hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_6px_25px_rgba(212,163,115,0.4)] flex items-center gap-2 cursor-pointer border border-[#E2B170]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Gravando Ocorrência...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Registrar Ocorrência</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: LIVE TACTICAL SUMMARY & 3D RISK MATRIX (4 of 12 cols on Widescreen) */}
        <div className="xl:col-span-4 space-y-5">
          
          {/* TACTICAL CARD 01: Live Risk Assessment Gauge */}
          <div className="rounded-2xl bg-[#0C111A] border border-[#1F2B3E] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#1A2536] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#D4A373]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  Matriz de Risco em Tempo Real
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">ISO 31000</span>
            </div>

            {/* Circular Gauge Representation */}
            <div className="flex items-center gap-4 bg-[#080C13] border border-[#1A2536] rounded-xl p-4">
              <div className="relative w-16 h-16 rounded-full flex items-center justify-center border-4" style={{ borderColor: riskConfig.color }}>
                <span className="text-sm font-mono font-black text-white">{riskConfig.pct}%</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">Gravidade:</span>
                  <span className={`text-xs font-black uppercase px-2 py-0.5 rounded ${riskConfig.bg} ${riskConfig.text} border ${riskConfig.border}`}>
                    {riskLevel}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  {riskConfig.label}
                </p>
              </div>
            </div>

            {/* Category / Scope Preview */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[10px] font-mono">
              <div className="bg-[#080C13] border border-[#1A2536] p-2 rounded-lg">
                <span className="text-slate-400 block text-[9px] uppercase">Categoria</span>
                <span className="text-[#D4A373] font-bold truncate block">{category}</span>
              </div>
              <div className="bg-[#080C13] border border-[#1A2536] p-2 rounded-lg">
                <span className="text-slate-400 block text-[9px] uppercase">Status Inicial</span>
                <span className="text-emerald-400 font-bold uppercase block">{status}</span>
              </div>
            </div>
          </div>

          {/* TACTICAL CARD 02: SOP / Standard Operating Procedure */}
          <div className="rounded-2xl bg-[#0C111A] border border-[#1F2B3E] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2 border-b border-[#1A2536] pb-3 mb-3">
              <Shield className="w-4 h-4 text-[#D4A373]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                {suggestedProtocol.title}
              </h3>
            </div>

            <div className="space-y-2 bg-[#080C13] border border-[#1A2536] p-3.5 rounded-xl">
              {suggestedProtocol.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-300 leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A373] shrink-0 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TACTICAL CARD 03: Live Preview of Executive Ticket */}
          <div className="rounded-2xl bg-[#0C111A] border border-[#1F2B3E] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between border-b border-[#1A2536] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#D4A373]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  Prévia do Registro Oficial
                </h3>
              </div>
              <span className="text-[9px] font-mono bg-[#1E293B] px-1.5 py-0.5 rounded text-slate-300">LIVE PREVIEW</span>
            </div>

            <div className="bg-[#080C13] border border-[#233145] rounded-xl p-3.5 space-y-2.5 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Assunto</span>
                <span className="text-white font-bold text-xs">{title || '—'}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1A2536]">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Placa / Recurso</span>
                  <span className="text-[#D4A373] font-bold">{plate || ticketNumber || 'Geral'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Unidade</span>
                  <span className="text-slate-300 font-bold truncate block">{unit || 'Matriz'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1A2536]">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Líder</span>
                  <span className="text-slate-300">{leaders.find(l => l.id === leaderId)?.name || 'Líder'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Horário</span>
                  <span className="text-slate-300">{eventTime || 'Agora'}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </form>

      {/* ============================================================ */}
      {/* MODAL 01: QUICK FLEET / VEHICLE PICKER */}
      {/* ============================================================ */}
      {showVehiclePicker && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0E1420] rounded-3xl shadow-2xl max-w-2xl w-full border border-[#24334A] overflow-hidden">
            <div className="bg-[#141C2B] text-white px-6 py-4 flex items-center justify-between border-b border-[#25354D]">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#E2B170]" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider">
                  Selecionar Veículo / Viagem Ativa
                </h3>
              </div>
              <button
                onClick={() => setShowVehiclePicker(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={vehicleSearchQuery}
                  onChange={(e) => setVehicleSearchQuery(e.target.value)}
                  placeholder="Pesquisar por placa, transportadora ou condutor..."
                  className="w-full bg-[#080C13] border border-[#233145] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A373]"
                  autoFocus
                />
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {combinedVehicles.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Nenhum veículo encontrado com os termos digitados.
                  </div>
                ) : (
                  combinedVehicles.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => handleApplyVehicle(v)}
                      className="p-3 bg-[#090D14] hover:bg-[#141D2B] border border-[#1A2536] hover:border-[#D4A373] rounded-xl transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-white bg-[#1A2536] px-2 py-0.5 rounded">
                            {v.plate}
                          </span>
                          <span className="text-[11px] font-bold text-[#D4A373]">{v.carrier}</span>
                          <span className="text-[9px] text-slate-500 font-mono uppercase">({v.source})</span>
                        </div>
                        {v.driver && (
                          <p className="text-[11px] text-slate-400">Condutor: {v.driver}</p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#D4A373] group-hover:translate-x-1 transition-all" />
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-[#1E2838] flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowVehiclePicker(false)}
                  className="bg-[#141C29] hover:bg-[#1E2A3D] text-white px-5 py-2 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 02: UNIT MANAGER MODAL */}
      {/* ============================================================ */}
      {showUnitManagerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0E1420] rounded-3xl shadow-2xl max-w-lg w-full border border-[#24334A] overflow-hidden">
            <div className="bg-[#141C2B] text-white px-6 py-4 flex items-center justify-between border-b border-[#25354D]">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#E2B170]" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider">Gerenciar Unidades & Plantas 3C</h3>
              </div>
              <button
                onClick={() => setShowUnitManagerModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <form onSubmit={handleAddUnit} className="flex gap-2">
                <input
                  type="text"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  placeholder="Nome da unidade (Ex: CD Campinas / SP)"
                  className="flex-1 bg-[#080C13] border border-[#233145] rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-[#D4A373]"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#C68A4C] to-[#E2B170] text-black hover:brightness-110 px-4 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </form>

              <div className="border-t border-[#1E2838] pt-3">
                <p className="text-[11px] font-bold uppercase text-[#D4A373] mb-2">
                  Unidades Cadastradas ({unitsList.length})
                </p>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {unitsList.map((unitItem, index) => (
                    <div key={index} className="flex items-center justify-between bg-[#090D14] border border-[#1A2536] rounded-xl p-3">
                      {editingUnitIndex === index ? (
                        <div className="flex items-center gap-2 flex-1 mr-2">
                          <input
                            type="text"
                            value={editingUnitName}
                            onChange={(e) => setEditingUnitName(e.target.value)}
                            className="flex-1 bg-[#141C29] border border-[#D4A373] rounded-lg px-2 py-1 text-xs font-semibold text-white focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateUnit(index)}
                            className="bg-[#D4A373] text-black px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Salvar
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditingUnitIndex(null); setEditingUnitName(''); }}
                            className="bg-[#1A2536] text-slate-300 px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#D4A373] shrink-0" />
                            <span className="text-xs font-bold text-slate-200">{unitItem}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => { setEditingUnitIndex(index); setEditingUnitName(unitItem); }}
                              className="p-1.5 text-slate-400 hover:text-[#D4A373] hover:bg-[#141C29] rounded-lg transition-colors cursor-pointer"
                              title="Editar unidade"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUnit(index)}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-[#141C29] rounded-lg transition-colors cursor-pointer"
                              title="Apagar unidade"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#1E2838] flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowUnitManagerModal(false)}
                  className="bg-[#141C29] hover:bg-[#1E2A3D] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  Concluir / Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
