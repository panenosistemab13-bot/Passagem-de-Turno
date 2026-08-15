import { Leader, Occurrence, Employee, EmployeeLog, Reminder, ChatMessage } from './types';

export const INITIAL_LEADERS: Leader[] = [
  { id: '1', name: 'Cristiane Fialho', role: 'Líder diurna', shift: 'Plantões A e B', createdAt: '2026-08-15' },
  { id: '2', name: 'Luzia Freitas', role: 'Noturno', shift: 'Plantão A', createdAt: '2026-08-15' },
  { id: '3', name: 'Gabriele Freire', role: 'Noturno', shift: 'Plantão B', createdAt: '2026-08-15' },
  { id: '4', name: 'Lucas', role: 'Interinos diurnos', shift: 'Plantão A', createdAt: '2026-08-15' },
  { id: '5', name: 'Airton', role: 'Interinos diurnos', shift: 'Plantão B', createdAt: '2026-08-15' },
];

export const INITIAL_OCCURRENCES: Occurrence[] = [];

export const INITIAL_EMPLOYEES: Employee[] = [];

export const INITIAL_EMPLOYEE_LOGS: EmployeeLog[] = [];

export const INITIAL_REMINDERS: Reminder[] = [];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];
