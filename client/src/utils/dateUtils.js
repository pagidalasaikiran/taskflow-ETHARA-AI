/**
 * Lightweight date utility helpers (avoids date-fns dependency)
 */

export function formatDistanceToNow(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return format(dateString);
}

export function format(dateString, style = 'short') {
  const date = new Date(dateString);
  if (style === 'short') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatFull(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function isToday(date) {
  const d = new Date(date);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function isBefore(date, compareDate) {
  return new Date(date) < new Date(compareDate);
}

export function isAfter(date, compareDate) {
  return new Date(date) > new Date(compareDate);
}

export function isOverdue(dueDate, status) {
  if (!dueDate || status === 'completed') return false;
  return isBefore(new Date(dueDate), new Date());
}

export function getDueDateStatus(dueDate, status) {
  if (!dueDate) return 'none';
  if (status === 'completed') return 'completed';
  const due = new Date(dueDate);
  const now = new Date();
  if (isBefore(due, now)) return 'overdue';
  if (isToday(due)) return 'today';
  return 'upcoming';
}

export function toInputDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
}
