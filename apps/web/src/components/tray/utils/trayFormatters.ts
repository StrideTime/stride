import type { ScheduleBlock } from '../../schedule/schedule.mock';

export function getProgressTone(progress: number) {
  if (progress > 1.08) return 'progressOver';
  if (progress >= 1) return 'progressComplete';
  return 'progressNormal';
}

export function getArcStroke(progress: number) {
  if (progress > 1.08) return 'var(--color-overtime)';
  if (progress >= 1) return 'var(--color-success)';
  if (progress < 0.86) return 'var(--color-accent)';
  const successMix = Math.round(((progress - 0.86) / 0.14) * 100);
  return `color-mix(in oklch, var(--color-success) ${successMix}%, var(--color-accent))`;
}

export function formatProgressLabel(progress: number, overByMin: number) {
  if (progress > 1) return `${formatMinutes(Math.max(1, overByMin))} over estimate`;
  if (progress >= 1) return 'Estimate reached';
  if (progress >= 0.86) return 'Close to estimate';
  return 'In progress';
}

export function isDevEnvironment() {
  return ((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV ?? false);
}

export function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatSessionTimer(hours: number, minutes: number, seconds: number) {
  return [hours, minutes, seconds]
    .map(value => value.toString().padStart(2, '0'))
    .join(':');
}

export function formatStartedAt(startedAt: number) {
  return `Started ${new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(startedAt)}`;
}

export function formatBlockRange(block: ScheduleBlock) {
  return `${formatMinute(block.startMin)}–${formatMinute(block.startMin + block.durationMin)}`;
}

export function formatMinute(minute: number) {
  const hours = Math.floor(minute / 60);
  const minutes = minute % 60;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(date);
}

export function formatRemaining(block: ScheduleBlock, progress: number) {
  return formatMinutes(Math.max(Math.ceil(block.durationMin * (1 - progress)), 0));
}

export function formatUntil(block: ScheduleBlock) {
  const now = new Date();
  const minute = now.getHours() * 60 + now.getMinutes();
  return formatMinutes(Math.max(block.startMin - minute, 0));
}

export function formatTrayDate(date: Date) {
  return new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
}

export function formatBlockType(type: ScheduleBlock['type']) {
  const labels: Record<ScheduleBlock['type'], string> = {
    action: 'Action',
    meeting: 'Meeting',
    break: 'Break',
    focus: 'Focus',
    personal: 'Personal',
    buffer: 'Buffer',
    external: 'External',
    research: 'Research',
    learning: 'Learning',
    session: 'Session',
  };
  return labels[type];
}

export function toDateKey(date: Date) {
  return [
    date.getFullYear(),
    (date.getMonth() + 1).toString().padStart(2, '0'),
    date.getDate().toString().padStart(2, '0'),
  ].join('-');
}
