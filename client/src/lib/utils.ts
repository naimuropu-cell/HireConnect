import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(min?: number | null, max?: number | null, currency = 'USD'): string {
  const lo = min ?? null;
  const hi = max ?? null;
  if (lo == null && hi == null) return 'Not specified';
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 });
  if (lo != null && hi != null) return `${fmt.format(lo)} – ${fmt.format(hi)}`;
  if (lo != null) return `From ${fmt.format(lo)}`;
  return `Up to ${fmt.format(hi as number)}`;
}

export function formatDate(date?: string | Date | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(date?: string | Date | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

export function timeAgo(date?: string | Date | null): string {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const intervals: [number, string][] = [
    [31536000, 'year'],
    [2592000, 'month'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ];
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

export function initials(first?: string, last?: string): string {
  return `${(first || '?')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();
}

export function titleCase(s?: string): string {
  if (!s) return '';
  return s.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
