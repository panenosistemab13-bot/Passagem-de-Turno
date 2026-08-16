export interface TripReportRecord {
  id: string;
  plate: string;
  carrier: string;
  unit: string;
  driver?: string;
  route?: string;
  origin?: string;
  destination?: string;
}

// Relatório padrão de viagens / frotas frequentes do Café Três Corações
export const DEFAULT_TRIP_RECORDS: TripReportRecord[] = [
  { id: 'trip-1', plate: 'ABC-1D23', carrier: 'JSL Logística', unit: 'Fábrica Natal / RN', driver: 'Carlos Eduardo', route: 'Natal -> Recife' },
  { id: 'trip-2', plate: 'BRA-2E34', carrier: 'Patrus Transportes', unit: 'CD Varginha / MG', driver: 'Marcos Silva', route: 'Varginha -> Betim' },
  { id: 'trip-3', plate: 'RTC-3F45', carrier: 'Tegma Logística', unit: 'Fábrica Eusébio / CE', driver: 'Antônio Ferreira', route: 'Eusébio -> Fortaleza' },
  { id: 'trip-4', plate: 'KLP-4G56', carrier: 'Transportadora Rodonaves', unit: 'CD Salvador / BA', driver: 'José Pereira', route: 'Salvador -> Feira de Santana' },
  { id: 'trip-5', plate: 'XYZ-5H67', carrier: 'Jamef Transportes', unit: 'CD Santa Luzia / MG', driver: 'Valdemir Souza', route: 'Santa Luzia -> São Paulo' },
  { id: 'trip-6', plate: 'QWE-6I78', carrier: 'Braspress Transportes', unit: 'CD Embu das Artes / SP', driver: 'Lucas Mendes', route: 'Embu -> Santos' },
  { id: 'trip-7', plate: 'TRC-7J89', carrier: 'Coopercarga', unit: 'Fábrica Montes Claros / MG', driver: 'Fernando Alves', route: 'Montes Claros -> Brasília' },
  { id: 'trip-8', plate: 'LOG-8K90', carrier: 'Directlog / Sequoia', unit: 'CD Vitória da Conquista / BA', driver: 'Renato Lima', route: 'Vitória da Conquista -> Ilhéus' },
  { id: 'trip-9', plate: 'CTC-9L01', carrier: 'Transportes Dalton', unit: 'Fábrica Manhuaçu / MG', driver: 'Claudemir Rocha', route: 'Manhuaçu -> Rio de Janeiro' },
  { id: 'trip-10', plate: 'ROD-0M12', carrier: 'Solística Logística', unit: 'CD Belém / PA', driver: 'Adriano Santos', route: 'Belém -> Castanhal' }
];

// Títulos oficiais de ocorrência solicitados pelo usuário
export const OCCURRENCE_TITLES = [
  "Problema mecânico ou elétrico",
  "Parada para manutenção corretiva ou preventiva",
  "Perda de sinal",
  "Acionamento sascar ativo",
  "Espelhamento retirado",
  "Sinistro confirmado",
  "Suspeita de sinistro",
  "Tentativa de sinistro",
  "Sinistro seguro transportador",
  "Problema de sensores",
  "Problema de atuadores",
  "Parada prolongada",
  "Transbordo"
] as const;

// Categorias e Tipos de Instabilidade solicitadas para passagem de plantão
export const INSTABILITY_SYSTEMS = [
  "Telefonia",
  "Sascar",
  "Trafegus",
  "Estrutura da Central / Internet",
  "Sistema de Espelhamento"
] as const;

// Unidades frequentes de operação do Grupo 3C iniciais
export const INITIAL_UNITS = [
  "CD Varginha / MG",
  "Fábrica Natal / RN",
  "Fábrica Eusébio / CE",
  "Fábrica Montes Claros / MG",
  "Fábrica Manhuaçu / MG",
  "CD Santa Luzia / MG",
  "CD Salvador / BA",
  "CD Embu das Artes / SP",
  "CD Vitória da Conquista / BA",
  "CD Belém / PA",
  "CD Rio de Janeiro / RJ",
  "CD Curitiba / PR"
];

export const COMMON_UNITS = INITIAL_UNITS;

// Transportadoras parceiras
export const COMMON_CARRIERS = [
  "JSL Logística",
  "Patrus Transportes",
  "Tegma Logística",
  "Transportadora Rodonaves",
  "Jamef Transportes",
  "Braspress Transportes",
  "Coopercarga",
  "Transportes Dalton",
  "Solística Logística",
  "Directlog / Sequoia",
  "Translovato",
  "Outra Transportadora"
];
