import { Role, Status } from '../models/models';

export function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  const d = Math.floor(h / 24);
  if (d < 30) return d + 'd ago';
  return new Date(isoStr).toLocaleDateString();
}

export function formatDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const STATUS_SLUGS: Record<Status, string> = {
  Open: 'open',
  'In Progress': 'progress',
  Resolved: 'resolved',
  Closed: 'closed',
};
export function statusSlug(status: Status): string {
  return STATUS_SLUGS[status];
}

const ROLE_LABELS: Record<string, string> = {
  customer: 'Customer',
  admin: 'Company Admin',
  superadmin: 'Super Admin',
  system: 'System',
};
export function roleLabel(role: Role | string): string {
  return ROLE_LABELS[role] ?? role;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0)).join('').toUpperCase();
}
