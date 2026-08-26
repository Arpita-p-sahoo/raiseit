export type Role = 'customer' | 'admin' | 'superadmin' | 'system';
export type Status = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export const STATUSES: Status[] = ['Open', 'In Progress', 'Resolved', 'Closed'];
export const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];
export const INDUSTRIES = [
  'Software & Technology',
  'Logistics & Transportation',
  'Retail & Ecommerce',
  'Financial Services',
  'Healthcare',
  'Manufacturing',
  'Other',
];
export const SIZES = ['1-10', '11-50', '51-200', '201-1,000', '1,000+'];

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  companyId: string | null;
  notify: boolean;
  createdAt: string;
}

export interface ActivityEntry {
  userId: string;
  name: string;
  role: Role;
  message: string;
  at: string;
}

export interface Ticket {
  id: string;
  companyId: string;
  title: string;
  raisedById: string;
  raisedByName: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  updatedAt: string;
  activity: ActivityEntry[];
}

export interface AppState {
  nextTicketId: number;
  nextCompanyId: number;
  nextUserId: number;
  companies: Company[];
  users: User[];
  tickets: Ticket[];
}

export interface TicketCardOptions {
  showCompany: boolean;
  allowReply: boolean;
  allowStatus: boolean;
  replyRole: Role;
}

export interface Filters {
  status: string;
  priority: string;
  company: string;
  role: string;
}

export function defaultFilters(): Filters {
  return { status: 'all', priority: 'all', company: 'all', role: 'all' };
}
