export interface VehicleRecord {
  id: string;
  cavaloPlate: string;
  carretaPlates: string;
  carrier: string;
  driverName?: string;
  notes?: string;
  createdAt: string;
}

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
  time?: string;
  title: string;
  description: string;
  type: 'reuniao' | 'manutencao' | 'auditoria' | 'lembrete' | 'checklist' | 'outro';
  leaderId?: string;
  leaderName: string;
  status?: 'pendente' | 'concluido';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  content: string;
  timestamp: string;
  isSystem?: boolean;
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

export type AttendanceStatus = 'trabalhou' | 'faltou' | 'atestado' | 'folga' | 'pendente';

export interface AttendanceRecord {
  matricula: string;
  status: AttendanceStatus;
}

export interface DailyAttendance {
  date: string; // YYYY-MM-DD
  records: Record<string, AttendanceRecord>; // Map de matricula para AttendanceRecord
}
