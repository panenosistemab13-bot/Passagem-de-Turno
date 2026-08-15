import React, { useState, useEffect } from 'react';
import { Leader, OccurrenceStatus, Occurrence } from '../types';
import { 
  FileText, 
  User, 
  Calendar, 
  AlertTriangle, 
  Tag, 
  Bell, 
  CheckCircle2, 
  Eye, 
  Sliders 
} from 'lucide-react';
import ThreeDIcon from './ThreeDIcon';

interface OccurrenceFormProps {
  leaders: Leader[];
  selectedLeaderId: string;
  onAddOccurrence: (occurrence: Omit<Occurrence, 'id' | 'createdAt'>) => void;
  onAddNotification: (title: string, message: string, type: 'info' | 'warning' | 'success') => void;
  onSelectTab: (tab: string) => void;
}

export default function OccurrenceForm({
  leaders,
  selectedLeaderId,
  onAddOccurrence,
  onAddNotification,
  onSelectTab
}: OccurrenceFormProps) {
  
  // Local states for fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [leaderId, setLeaderId] = useState(selectedLeaderId);
  const [customShiftDate, setCustomShiftDate] = useState('');
  const [status, setStatus] = useState<OccurrenceStatus>('acompanhar');
  const [riskLevel, setRiskLevel] = useState<'Baixo' | 'Médio' | 'Alto' | 'Crítico'>('Médio');
  const [category, setCategory] = useState<'Segurança' | 'Operação' | 'Logística' | 'Qualidade' | 'Manutenção' | 'Outros'>('Logística');
  const [rawDate, setRawDate] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    const currentLeader = leaders.find(l => l.id === leaderId) || leaders[0];

    onAddOccurrence({
      date: rawDate,
      shiftDate: customShiftDate,
      leaderId: currentLeader.id,
      leaderName: currentLeader.name,
      title,
      description,
      status,
      riskLevel,
      category
    });

    // Generate notification based on status
    let notifType: 'info' | 'warning' | 'success' = 'info';
    let notifTitle = '';
    let notifMsg = '';

    if (status === 'acompanhar') {
      notifType = 'warning';
      notifTitle = `Nova Ocorrência sob Acompanhamento: ${title}`;
      notifMsg = `Registrada por ${currentLeader.name}. Risco: ${riskLevel}. Requer monitoramento ativo.`;
    } else if (status === 'resolvido') {
      notifType = 'success';
      notifTitle = `Incidente Resolvido: ${title}`;
      notifMsg = `Lançado diretamente como concluído pelo líder ${currentLeader.name}.`;
    } else {
      notifType = 'info';
      notifTitle = `Para Conhecimento: ${title}`;
      notifMsg = `Aviso operacional registrado por ${currentLeader.name}.`;
    }

    onAddNotification(notifTitle, notifMsg, notifType);

    // Reset fields
    setTitle('');
    setDescription('');
    setStatus('acompanhar');
    setRiskLevel('Médio');
    setCategory('Logística');

    // Redirect to status/history
    onSelectTab('dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Introduction Card */}
      <div className="bg-gradient-to-r from-[#2C1810] to-[#3D261C] rounded-lg p-4 text-white shadow-sm mb-4 flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#C8102E]">Registro de Ocorrências e Riscos</h2>
          <p className="text-xs text-slate-300">Lançamento oficial no sistema de passagens de turno do Café Três Corações.</p>
        </div>
        <ThreeDIcon icon={FileText} color="coffee" size="md" />
      </div>

      <div className="bg-white rounded-lg border border-[#E0D8D0] p-5 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Main Title Section */}
          <div>
            <label className="block text-xs font-black uppercase text-[#2C1810] mb-1">
              Título da Ocorrência <span className="text-[#C8102E]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Escolta de rodotrem atrasada ou Inconsistência de lacre"
              className="w-full bg-[#F4F1EE] border border-[#E0D8D0] rounded-lg px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] transition-all font-semibold"
              required
            />
          </div>

          {/* Core Row 1: Leader, Date and Plantao */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div>
              <label className="block text-xs font-black uppercase text-[#2C1810] mb-1">
                Líder Responsável <span className="text-[#C8102E]">*</span>
              </label>
              <div className="relative">
                <select
                  value={leaderId}
                  onChange={(e) => setLeaderId(e.target.value)}
                  className="w-full bg-[#F4F1EE] border border-[#E0D8D0] rounded-lg pl-8 pr-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] appearance-none font-semibold"
                >
                  {leaders.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
                <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#8C7B70]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[#2C1810] mb-1">
                Data do Registro <span className="text-[#C8102E]">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={rawDate}
                  onChange={handleDateChange}
                  className="w-full bg-[#F4F1EE] border border-[#E0D8D0] rounded-lg pl-8 pr-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] font-semibold"
                  required
                />
                <Calendar className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#8C7B70]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[#2C1810] mb-1">
                Selo de Turno (Auto-calculado)
              </label>
              <input
                type="text"
                value={customShiftDate}
                onChange={(e) => setCustomShiftDate(e.target.value)}
                placeholder="Ex: Plantão 14/08/2026"
                className="w-full bg-[#F4F1EE] border border-[#E0D8D0] rounded-lg px-3 py-2 text-xs text-[#8C7B70] focus:outline-none cursor-not-allowed font-bold"
                readOnly
              />
            </div>

          </div>

          {/* Core Row 2: Status Menu, Risk, Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* User-requested custom Status Menu */}
            <div>
              <label className="block text-xs font-black uppercase text-[#2C1810] mb-1">
                Ação / Status do Registro <span className="text-[#C8102E]">*</span>
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OccurrenceStatus)}
                  className="w-full bg-[#F4F1EE] border border-[#E0D8D0] rounded-lg pl-8 pr-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] appearance-none font-semibold"
                >
                  <option value="acompanhar">⚠ Acompanhar (Requer Monitoramento)</option>
                  <option value="resolvido">✓ Resolvido (Ação Concluída)</option>
                  <option value="para conhecimento">ℹ Para Conhecimento (Notificação)</option>
                </select>
                <Sliders className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#8C7B70]" />
              </div>
              <p className="text-[9px] text-[#8C7B70] mt-0.5">
                Opção dispara um alerta automático instantâneo para a equipe.
              </p>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[#2C1810] mb-1">
                Classificação de Risco <span className="text-[#C8102E]">*</span>
              </label>
              <div className="relative">
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as any)}
                  className="w-full bg-[#F4F1EE] border border-[#E0D8D0] rounded-lg pl-8 pr-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] appearance-none font-semibold"
                >
                  <option value="Baixo">Baixo (Normal)</option>
                  <option value="Médio">Médio (Atenção)</option>
                  <option value="Alto">Alto (Alerta)</option>
                  <option value="Crítico">Crítico (Imediato)</option>
                </select>
                <AlertTriangle className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#8C7B70]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[#2C1810] mb-1">
                Área / Categoria <span className="text-[#C8102E]">*</span>
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#F4F1EE] border border-[#E0D8D0] rounded-lg pl-8 pr-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] appearance-none font-semibold"
                >
                  <option value="Logística">Logística (Frotas/Rotas)</option>
                  <option value="Segurança">Segurança (Monitoramento)</option>
                  <option value="Operação">Operação Geral</option>
                  <option value="Qualidade">Qualidade de Carga</option>
                  <option value="Manutenção">Manutenção de Frota</option>
                  <option value="Outros">Outros Incidentes</option>
                </select>
                <Tag className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#8C7B70]" />
              </div>
            </div>

          </div>

          {/* Description manual */}
          <div>
            <label className="block text-xs font-black uppercase text-[#2C1810] mb-1">
              Descrição Detalhada (Preenchimento Manual) <span className="text-[#C8102E]">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Digite com detalhes o ocorrido, as placas dos veículos rodotrens envolvidos, o valor de Nota Fiscal, os números dos baús lacrados e as rotas afetadas..."
              rows={4}
              className="w-full bg-[#F4F1EE] border border-[#E0D8D0] rounded-lg p-3 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] transition-all leading-relaxed"
              required
            />
          </div>

          {/* Actions bottom */}
          <div className="pt-3 border-t border-[#E0D8D0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onSelectTab('dashboard')}
              className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase text-[#8C7B70] hover:bg-[#F4F1EE] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-black uppercase text-white bg-[#C8102E] hover:bg-[#a80c24] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" /> Registrar e Notificar Equipe
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
