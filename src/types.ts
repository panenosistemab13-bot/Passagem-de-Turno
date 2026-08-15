export type OccurrenceStatus = 'acompanhar' | 'resolvido' | 'para conhecimento';

export interface Leader {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  shift?: string; // Plantão adicionado separadamente (ex: "Plantões A e B", "Plantão A", "Plantão B")
  createdAt: string;
}

export interface Occurrence {
  id: string;
  date: string; // e.g. "2026-08-14" or "Plantão 14/08/2026"
  shiftDate: string; // Formatting like "Plantão 14/08/2026"
  leaderId: string;
  leaderName: string;
  title: string;
  description: string;
  status: OccurrenceStatus;
  riskLevel: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
  category: 'Segurança' | 'Operação' | 'Logística' | 'Rastreamento' | 'Qualidade' | 'Manutenção' | 'Instabilidade / Tecnologia' | 'Outros';
  
  // Detalhes Operacionais da Viagem / Veículo
  plate?: string;
  carrier?: string;
  unit?: string;
  
  // Registro de Instabilidade & Chamados
  recordType?: 'padrao' | 'instabilidade';
  instabilitySystem?: string; // Telefonia, Sascar, Trafegus, etc.
  ticketNumber?: string; // Número do Chamado de acompanhamento
  affectedTechnology?: string;

  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  positives: number;
  negatives: number;
}

export type EmployeeLogType = 
  | 'ponto_positivo' 
  | 'ponto_negativo' 
  | 'atestado' 
  | 'falta' 
  | 'saiu_mais_cedo' 
  | 'erro_cometido' 
  | 'otimo_desempenho';

export interface EmployeeLog {
  id: string;
  employeeId: string;
  employeeName: string;
  type: EmployeeLogType;
  description: string;
  date: string;
  leaderName: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  type: 'reuniao' | 'manutencao' | 'auditoria' | 'lembrete';
  leaderName: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: string;
  isAdmin?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  createdAt: string;
  read: boolean;
}
