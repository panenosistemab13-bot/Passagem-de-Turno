import React, { useState, useEffect } from 'react';
import { Leader, OccurrenceStatus, Occurrence, VehicleRecord } from '../types';
import { 
  FileText, 
  User, 
  Calendar, 
  AlertTriangle, 
  Tag, 
  Bell, 
  CheckCircle2, 
  Eye, 
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
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import ThreeDIcon from './ThreeDIcon';
import { 
  OCCURRENCE_TITLES, 
  INSTABILITY_SYSTEMS, 
  COMMON_UNITS, 
  COMMON_CARRIERS, 
  DEFAULT_TRIP_RECORDS,
  TripReportRecord 
} from '../tripData';
import { pushOccurrenceToFirebase, rtdb, snapshotToArray } from '../lib/firebase';
import { onValue, ref } from 'firebase/database';

interface OccurrenceFormProps {
  leaders: Leader[];
  selectedLeaderId: string;
  onAddOccurrence: (occurrence: Omit<Occurrence, 'id' | 'createdAt'>) => void;
  onAddNotification: (title: string, message: string, type: 'info' | 'warning' | 'success') => void;
  onSelectTab: (tab: string) => void;
  vehicles?: VehicleRecord[];
}

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
  
  // Registration Mode: Standard Vehicle/Transport Occurrence vs Instability / Systems Occurrence
  const [recordType, setRecordType] = useState<'padrao' | 'instabilidade'>('padrao');

  // Core Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [leaderId, setLeaderId] = useState(selectedLeaderId);
  const [customShiftDate, setCustomShiftDate] = useState('');
  const [status, setStatus] = useState<OccurrenceStatus>('acompanhar');
  const [riskLevel, setRiskLevel] = useState<'Baixo' | 'Médio' | 'Alto' | 'Crítico'>('Médio');
  const [category, setCategory] = useState<'Segurança' | 'Operação' | 'Logística' | 'Rastreamento' | 'Qualidade' | 'Manutenção' | 'Instabilidade / Tecnologia' | 'Outros'>('Logística');
  const [rawDate, setRawDate] = useState('');

  // Transport & Vehicle fields (Placa, Transportadora, Unidade)
  const [plate, setPlate] = useState('');
  const [carrier, setCarrier] = useState('');
  const [unit, setUnit] = useState('');
  
  // Instability & Tickets fields
  const [instabilitySystem, setInstabilitySystem] = useState<string>('Telefonia');
  const [ticketNumber, setTicketNumber] = useState('');
  const [affectedTechnology, setAffectedTechnology] = useState('');

  // Trip Report auto-lookup & modal search helper
  const [tripSearchOpen, setTripSearchOpen] = useState(false);
  const [tripSearchTerm, setTripSearchTerm] = useState('');
  const [selectedTripReport, setSelectedTripReport] = useState<TripReportRecord | null>(null);

  // Update leader state when global selection changes
  useEffect(() => {
    setLeaderId(selectedLeaderId);
  }, [selectedLeaderId]);

  // Set default raw date and shift label on load
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setRawDate(`${yyyy}-${mm}-${dd}`);
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

  // Switch between Standard (Placa/Transportadora/Unidade) and Instability modes
  const handleModeChange = (mode: 'padrao' | 'instabilidade') => {
    setRecordType(mode);
    if (mode === 'instabilidade') {
      setCategory('Instabilidade / Tecnologia');
      if (!title || OCCURRENCE_TITLES.includes(title as any)) {
        setTitle(`Instabilidade de ${instabilitySystem}`);
      }
    } else {
      setCategory('Logística');
      if (title.startsWith('Instabilidade de')) {
        setTitle('');
      }
    }
  };

  // Quick title selection helper
  const handleSelectTitle = (selected: string) => {
    setTitle(selected);
    // Auto-adjust risk and category intelligently based on selected title
    if (selected.includes('Sinistro confirmado') || selected.includes('Suspeita de sinistro')) {
      setRiskLevel('Crítico');
      setCategory('Segurança');
    } else if (selected.includes('Perda de sinal') || selected.includes('Acionamento sascar') || selected.includes('Espelhamento retirado') || selected.includes('Problema de sensores') || selected.includes('Problema de atuadores')) {
      setRiskLevel('Alto');
      setCategory('Rastreamento');
    } else if (selected.includes('Problema mecânico') || selected.includes('Parada para manutenção')) {
      setRiskLevel('Médio');
      setCategory('Manutenção');
    } else if (selected.includes('Transbordo') || selected.includes('Parada prolongada')) {
      setRiskLevel('Médio');
      setCategory('Logística');
    }
  };

  // Select instability preset
  const handleSelectInstabilitySystem = (sys: string) => {
    setInstabilitySystem(sys);
    setTitle(`Instabilidade de ${sys}`);
    setAffectedTechnology(sys);
  };

  // Auto-fill from Trip Report
  const handleApplyTripReport = (item: TripReportRecord) => {
    setPlate(item.plate);
    setCarrier(item.carrier);
    setUnit(item.unit);
    setSelectedTripReport(item);
    setTripSearchOpen(false);

    // If description is empty, populate with intelligent template
    if (!description.trim()) {
      setDescription(`Veículo: ${item.plate} | Transportadora: ${item.carrier} | Unidade: ${item.unit}${item.driver ? ` | Motorista: ${item.driver}` : ''}${item.route ? ` | Rota: ${item.route}` : ''}\n\nDescrição da Ocorrência: `);
    }
  };

  // Auto-fill from registered Vehicles page
  const handleApplyVehicleRecord = (veh: VehicleRecord) => {
    const combinedPlates = veh.carretaPlates 
      ? `${veh.cavaloPlate} / Carretas: ${veh.carretaPlates}` 
      : veh.cavaloPlate;
    setPlate(combinedPlates);
    setCarrier(veh.carrier);
    if (!description.trim()) {
      setDescription(`Veículo (Cavalo): ${veh.cavaloPlate}${veh.carretaPlates ? ` | Carretas: ${veh.carretaPlates}` : ''} | Transportadora: ${veh.carrier}${veh.driverName ? ` | Motorista: ${veh.driverName}` : ''}${veh.notes ? ` | Obs: ${veh.notes}` : ''}\n\nDescrição da Ocorrência: `);
    }
  };

  // Filtered trips for lookup modal/dropdown
  const filteredTrips = DEFAULT_TRIP_RECORDS.filter(t => 
    t.plate.toLowerCase().includes(tripSearchTerm.toLowerCase()) ||
    t.carrier.toLowerCase().includes(tripSearchTerm.toLowerCase()) ||
    t.unit.toLowerCase().includes(tripSearchTerm.toLowerCase()) ||
    (t.driver && t.driver.toLowerCase().includes(tripSearchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert('Por favor, preencha o Título e a Descrição da ocorrência!');
      return;
    }

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

    // Guarantee no undefined fields exist in payload before sending to Firebase
    Object.keys(newRecord).forEach(key => {
      if (newRecord[key] === undefined) {
        newRecord[key] = '';
      }
    });

    // Save directly to Firebase Realtime Database
    if (onAddOccurrence) {
      await onAddOccurrence(newRecord);
    } else {
      await pushOccurrenceToFirebase(newRecord);
    }

    // Generate notification based on status
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

    // Reset fields
    setTitle('');
    setDescription('');
    setPlate('');
    setCarrier('');
    setUnit('');
    setTicketNumber('');
    setAffectedTechnology('');
    setSelectedTripReport(null);
    setStatus('acompanhar');
    setRiskLevel('Médio');
    setCategory('Logística');

    // Redirect to status/history
    onSelectTab('dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-xl p-4 text-white shadow-lg border border-[#334155] flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#2563EB] bg-white px-2 py-0.5 rounded shadow-sm">
              Passagem de Turno
            </span>
            <span className="text-xs text-slate-300 font-bold">Café Três Corações</span>
          </div>
          <h2 className="text-base font-extrabold text-white">Novo Registro de Ocorrência & Passagem</h2>
          <p className="text-xs text-slate-300">Lançamento integrado com frotas, placas, transportadoras, unidades e instabilidades de sistemas.</p>
        </div>
        <ThreeDIcon icon={FileText} color="coffee" size="md" />
      </div>

      {/* Record Type Mode Switcher (Veículos / Frotas vs Instabilidade de Sistemas) */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-1.5 shadow-sm flex gap-2">
        <button
          type="button"
          onClick={() => handleModeChange('padrao')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-black uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
            recordType === 'padrao'
              ? 'bg-[#0F172A] text-white shadow-sm'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
          }`}
        >
          <Truck className="w-4 h-4 text-[#2563EB]" />
          <span>Ocorrência Operacional / Veículo</span>
          <span className="text-[9px] font-bold opacity-80 hidden sm:inline">(Placa, Transportadora, Unidade)</span>
        </button>

        <button
          type="button"
          onClick={() => handleModeChange('instabilidade')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-black uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
            recordType === 'instabilidade'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
          }`}
        >
          <Wifi className="w-4 h-4 text-white" />
          <span>Instabilidade & Chamados</span>
          <span className="text-[9px] font-bold opacity-80 hidden sm:inline">(Telefonia, Sascar, Trafegus)</span>
        </button>
      </div>

      {/* Main Form Box */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* SECTION A: PRESET TITLES SELECTOR */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-black uppercase text-[#0F172A]">
                {recordType === 'padrao' ? 'Selecione ou Digite o Título da Ocorrência' : 'Selecione a Instabilidade do Sistema'} <span className="text-[#2563EB]">*</span>
              </label>
              <span className="text-[10px] text-[#64748B] font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#2563EB]" /> Clique nos atalhos para preencher
              </span>
            </div>

            {/* Quick preset chips based on mode */}
            {recordType === 'padrao' ? (
              <div className="mb-2 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                {OCCURRENCE_TITLES.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectTitle(t)}
                    className={`text-[10.5px] px-2.5 py-1 rounded-md font-bold transition-all border text-left cursor-pointer flex items-center gap-1 ${
                      title === t
                        ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                        : 'bg-white text-[#334155] border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#0F172A]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mb-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 p-2 bg-blue-50/50 rounded-lg border border-blue-200">
                {INSTABILITY_SYSTEMS.map((sys, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectInstabilitySystem(sys)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-extrabold border transition-all text-center cursor-pointer flex flex-col items-center gap-1 ${
                      instabilitySystem === sys
                        ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-sm'
                        : 'bg-white text-[#0F172A] border-blue-200 hover:border-[#2563EB]'
                    }`}
                  >
                    {sys === 'Telefonia' && <PhoneCall className="w-4 h-4 text-[#2563EB]" />}
                    {sys === 'Sascar' && <Radio className="w-4 h-4 text-emerald-600" />}
                    {sys === 'Trafegus' && <Layers className="w-4 h-4 text-blue-600" />}
                    {sys.includes('Central') && <Building2 className="w-4 h-4 text-purple-600" />}
                    {sys.includes('Espelhamento') && <Wifi className="w-4 h-4 text-amber-600" />}
                    <span>{sys}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Title Text Input */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={recordType === 'padrao' ? "Ex: Problema mecânico ou elétrico / Perda de sinal / Sinistro" : "Ex: Instabilidade de Telefonia / Queda Sascar"}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all font-bold"
              required
            />
          </div>

          {/* SECTION B: PLACA, TRANSPORTADORA, UNIDADE + RELATÓRIO DE VIAGENS (When Mode is Padrão) */}
          {recordType === 'padrao' && (
            <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-3.5 space-y-3">
              
              {/* Trip Report Pull Helper Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#2563EB]" />
                  <span className="text-xs font-black uppercase text-[#0F172A]">
                    Dados do Veículo e Transporte
                  </span>
                  <span className="text-[10px] font-bold text-[#64748B] bg-[#E2E8F0] px-2 py-0.5 rounded">
                    Placa, Transportadora e Unidade
                  </span>
                </div>

                {/* Open Relatório de Viagens Modal/Button */}
                <button
                  type="button"
                  onClick={() => setTripSearchOpen(!tripSearchOpen)}
                  className="px-3 py-1 bg-[#0F172A] text-white hover:bg-[#1E293B] rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{tripSearchOpen ? 'Fechar Relatório' : 'Puxar do Relatório de Viagens'}</span>
                </button>
              </div>

              {/* Collapsible/Interactive Relatório de Viagens Quick Selector */}
              {tripSearchOpen && (
                <div className="bg-white rounded-lg border border-blue-200 p-3 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0F172A]">
                      <Search className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Selecione a viagem para autopreencher Placa, Transportadora e Unidade:</span>
                    </div>
                    <span className="text-[10px] text-[#64748B] font-bold">{filteredTrips.length} viagens disponíveis</span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={tripSearchTerm}
                      onChange={(e) => setTripSearchTerm(e.target.value)}
                      placeholder="Pesquisar por Placa, Transportadora, Unidade ou Motorista..."
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] font-medium"
                    />
                    <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-2" />
                  </div>

                  <div className="max-h-48 overflow-y-auto divide-y divide-[#F1F5F9] border border-[#E2E8F0] rounded-lg">
                    {filteredTrips.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleApplyTripReport(item)}
                        className="p-2 hover:bg-blue-50/60 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-xs text-[#2563EB] bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#E2E8F0]">
                            {item.plate}
                          </span>
                          <div>
                            <div className="font-bold text-[#0F172A]">{item.carrier}</div>
                            <div className="text-[10px] text-[#64748B]">{item.unit} {item.driver ? `• Mot: ${item.driver}` : ''} {item.route ? `(${item.route})` : ''}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="text-[10px] font-bold text-white bg-[#2563EB] px-2.5 py-1 rounded hover:bg-[#1D4ED8]"
                        >
                          Usar dados
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grid with Placa, Transportadora, Unidade fields */}
              <div className="space-y-3">
                {/* Registered Vehicles Quick Dropdown (Puxar da página Placas de Veículos) */}
                {vehiclesList.length > 0 && (
                  <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-800">
                        Puxar veículo cadastrado ({vehiclesList.length}):
                      </span>
                    </div>
                    <select
                      onChange={(e) => {
                        const found = vehiclesList.find(v => v.id === e.target.value);
                        if (found) handleApplyVehicleRecord(found);
                      }}
                      defaultValue=""
                      className="bg-white border border-blue-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-xs"
                    >
                      <option value="" disabled>-- Selecionar veículo da lista --</option>
                      {vehiclesList.map((v) => (
                        <option key={v.id} value={v.id}>
                          🚛 {v.cavaloPlate} {v.carretaPlates ? `(Carretas: ${v.carretaPlates})` : ''} - {v.carrier} {v.driverName ? `[${v.driverName}]` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                {/* 1. Placa */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-[#0F172A] mb-1">
                    Placa do Veículo / Rodotrem
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={plate}
                      onChange={(e) => setPlate(e.target.value.toUpperCase())}
                      placeholder="Ex: ABC-1D23"
                      className="w-full uppercase font-mono font-bold bg-white border border-[#E2E8F0] rounded-lg pl-8 pr-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    />
                    <Truck className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#64748B]" />
                  </div>
                </div>

                {/* 2. Transportadora */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-[#0F172A] mb-1">
                    Transportadora
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="carrier-suggestions"
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      placeholder="Ex: JSL Logística, Patrus..."
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-8 pr-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] font-semibold"
                    />
                    <Building2 className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#64748B]" />
                    <datalist id="carrier-suggestions">
                      {COMMON_CARRIERS.map((c, i) => (
                        <option key={i} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* 3. Unidade */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-[#0F172A] mb-1">
                    Unidade Grupo 3 Corações
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="unit-suggestions"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="Ex: CD Varginha, Fábrica Natal..."
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-8 pr-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] font-semibold"
                    />
                    <Tag className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#64748B]" />
                    <datalist id="unit-suggestions">
                      {COMMON_UNITS.map((u, i) => (
                        <option key={i} value={u} />
                      ))}
                    </datalist>
                  </div>
                </div>

              </div>

            </div>
          </div>
          )}

          {/* SECTION C: INSTABILITY & TICKETS (When Mode is Instabilidade) */}
          {recordType === 'instabilidade' && (
            <div className="bg-blue-50/50 rounded-xl border border-blue-200 p-3.5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-blue-200">
                <Wifi className="w-4 h-4 text-[#2563EB]" />
                <span className="text-xs font-black uppercase text-[#0F172A]">
                  Acompanhamento de Tecnologia & Estrutura da Central
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase text-[#0F172A] mb-1">
                    Sistema Afetado <span className="text-[#2563EB]">*</span>
                  </label>
                  <select
                    value={instabilitySystem}
                    onChange={(e) => handleSelectInstabilitySystem(e.target.value)}
                    className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs text-[#0F172A] font-bold focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    {INSTABILITY_SYSTEMS.map((s, i) => (
                      <option key={i} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-[#0F172A] mb-1">
                    Nº do Chamado / Ticket de Suporte
                  </label>
                  <input
                    type="text"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                    placeholder="Ex: INC-98421 / TKT-4412"
                    className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs text-[#0F172A] font-bold focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-[#0F172A] mb-1">
                    Operadora / Tecnologia
                  </label>
                  <input
                    type="text"
                    value={affectedTechnology}
                    onChange={(e) => setAffectedTechnology(e.target.value)}
                    placeholder="Ex: Vivo / Sascar / Links Dedicados"
                    className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs text-[#0F172A] font-bold focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION D: LEADER, DATE AND SHIFT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div>
              <label className="block text-xs font-black uppercase text-[#0F172A] mb-1">
                Líder Responsável <span className="text-[#2563EB]">*</span>
              </label>
              <div className="relative">
                <select
                  value={leaderId}
                  onChange={(e) => setLeaderId(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-8 pr-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] appearance-none font-semibold"
                >
                  {leaders.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.role}{l.shift ? ` - ${l.shift}` : ''})
                    </option>
                  ))}
                </select>
                <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#64748B]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[#0F172A] mb-1">
                Data do Registro <span className="text-[#2563EB]">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={rawDate}
                  onChange={handleDateChange}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-8 pr-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] font-semibold"
                  required
                />
                <Calendar className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#64748B]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[#0F172A] mb-1">
                Selo de Turno (Auto-calculado)
              </label>
              <input
                type="text"
                value={customShiftDate}
                onChange={(e) => setCustomShiftDate(e.target.value)}
                placeholder="Ex: Plantão 15/08/2026"
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#64748B] focus:outline-none cursor-not-allowed font-bold"
                readOnly
              />
            </div>

          </div>

          {/* SECTION E: STATUS, RISK, CATEGORY */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div>
              <label className="block text-xs font-black uppercase text-[#0F172A] mb-1">
                Ação / Status do Registro <span className="text-[#2563EB]">*</span>
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OccurrenceStatus)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-8 pr-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] appearance-none font-semibold"
                >
                  <option value="acompanhar">⚠ Acompanhar (Requer Monitoramento)</option>
                  <option value="resolvido">✓ Resolvido (Ação Concluída)</option>
                  <option value="para conhecimento">ℹ Para Conhecimento (Notificação)</option>
                </select>
                <Sliders className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#64748B]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[#0F172A] mb-1">
                Classificação de Risco <span className="text-[#2563EB]">*</span>
              </label>
              <div className="relative">
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as any)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-8 pr-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] appearance-none font-semibold"
                >
                  <option value="Baixo">Baixo (Normal)</option>
                  <option value="Médio">Médio (Atenção)</option>
                  <option value="Alto">Alto (Alerta)</option>
                  <option value="Crítico">Crítico (Imediato)</option>
                </select>
                <AlertTriangle className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#64748B]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[#0F172A] mb-1">
                Área / Categoria <span className="text-[#2563EB]">*</span>
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-8 pr-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] appearance-none font-semibold"
                >
                  <option value="Logística">Logística (Frotas/Rotas)</option>
                  <option value="Rastreamento">Rastreamento</option>
                  <option value="Segurança">Segurança (Monitoramento)</option>
                  <option value="Operação">Operação Geral</option>
                  <option value="Qualidade">Qualidade de Carga</option>
                  <option value="Manutenção">Manutenção de Frota</option>
                  <option value="Instabilidade / Tecnologia">Instabilidade / Tecnologia</option>
                  <option value="Outros">Outros Incidentes</option>
                </select>
                <Tag className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#64748B]" />
              </div>
            </div>

          </div>

          {/* SECTION F: DETAILED DESCRIPTION */}
          <div>
            <label className="block text-xs font-black uppercase text-[#0F172A] mb-1">
              Descrição Detalhada da Ocorrência <span className="text-[#2563EB]">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Digite com detalhes o ocorrido, motorista envolvido, localidade/quilômetro da rodovia, providências adotadas pelo plantão, chamado aberto e próximos passos na passagem de turno..."
              rows={4}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all leading-relaxed"
              required
            />
          </div>

          {/* SECTION G: FORM ACTIONS */}
          <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onSelectTab('dashboard')}
              className="px-4 py-2 rounded-lg text-xs font-bold uppercase text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-xs font-black uppercase text-white bg-[#2563EB] hover:bg-[#1D4ED8] transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Bell className="w-3.5 h-3.5" /> Registrar e Notificar Equipe
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
