import { Leader, Occurrence, Employee, EmployeeLog, Reminder, ChatMessage } from './types';

export const INITIAL_LEADERS: Leader[] = [
  { id: '1', name: 'Paulo de Oliveira Ramos', role: 'Líder Turno A', createdAt: '2026-08-10' },
  { id: '2', name: 'Wendel Polozzi Reis Maia', role: 'Líder Turno B', createdAt: '2026-08-11' },
  { id: '3', name: 'Paulo Pereira de Sousa', role: 'Líder Turno C', createdAt: '2026-08-12' },
  { id: '4', name: 'Jonatas Silva Matias', role: 'Supervisor de Gerenciamento de Riscos', createdAt: '2026-08-12' },
];

export const INITIAL_OCCURRENCES: Occurrence[] = [];

export const INITIAL_EMPLOYEES: Employee[] = [];

export const INITIAL_EMPLOYEE_LOGS: EmployeeLog[] = [];

export const INITIAL_REMINDERS: Reminder[] = [];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];
