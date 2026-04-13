export function formatCurrency(amount: number, currency = 'SAR'): string {
  if (!amount) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr));
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function isWarrantyExpired(warrantyExpiry: string): boolean {
  if (!warrantyExpiry) return false;
  return new Date(warrantyExpiry) < new Date();
}

export function isWarrantyExpiringSoon(warrantyExpiry: string, daysThreshold = 30): boolean {
  if (!warrantyExpiry) return false;
  const expiry = new Date(warrantyExpiry);
  const now = new Date();
  const diff = expiry.getTime() - now.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  return days > 0 && days <= daysThreshold;
}
