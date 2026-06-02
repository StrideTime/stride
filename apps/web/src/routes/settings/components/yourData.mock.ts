// Mock capture data for the "Your data" settings surface.
// Stand-in until the Session flow lands and real signal is recorded.
// Deterministic generators so the table, pagination, and filtering behave
// the same on every render.

export type Feeling = 'frown' | 'neutral' | 'smile' | 'target';

export type SessionRecord = {
  id: string;
  at: string;
  actionTitle: string;
  specKey: string | null;
  durationMin: number;
  feeling: Feeling | null;
};

export type CheckInRecord = {
  id: string;
  at: string;
  feeling: Feeling;
  note: string;
  onAction: string;
};

export type CaptureRecord = {
  id: string;
  at: string;
  kind: 'Insight' | 'Next';
  text: string;
};

const ACTION_POOL: ReadonlyArray<readonly [string, string | null]> = [
  ['Wire the offline queue drainer', 'PLAT-218'],
  ['Fix the RLS gap on spec sync', 'PLAT-204'],
  ['Feeling check-in on session end', 'APP-77'],
  ['Refactor the app-shell navigation', 'APP-61'],
  ['Spec view dependency table', 'APP-90'],
  ['OKLCH token layer pass', 'DES-12'],
  ['Jira webhook consumer worker', 'PLAT-231'],
  ['Backlog filter chips', 'APP-58'],
  ['Schedule day-canvas drag and resize', 'APP-103'],
  ['Tray idle and live states', 'DE-19'],
  ['Settings section routing', 'APP-66'],
  ['Session timer drift fix', 'APP-81'],
  ['Source vocabulary mapping UI', 'PLAT-240'],
  ['Empty states for the backlog', 'APP-71'],
  ['Keyboard navigation audit', 'APP-95'],
  ['Standalone action quick-add', 'APP-83'],
  ['Review PR feedback', null],
  ['Pair on the sync edge cases', null],
  ['Weekly planning block', null],
  ['Read up on Postgres RLS', null],
];

const NOTE_POOL: readonly string[] = [
  'Flowed once the schema was clear.',
  'Got pulled into a meeting halfway through.',
  'Estimate was off, took longer than I expected.',
  'Clean run, finished ahead of the estimate.',
  'Stuck on a flaky test for most of it.',
  'Good momentum, want to keep going tomorrow.',
  'Context-switched too much, hard to settle.',
  'Finally understood the queue logic.',
  'Low energy, mostly cleanup work.',
  'Solid stretch, no blockers.',
  '',
  'Felt slow, but the groundwork is done.',
];

const INSIGHT_POOL: readonly string[] = [
  'The drainer should own retries, not the caller.',
  'Estimates drift most on anything that touches sync.',
  'Mornings are consistently my best deep-work block.',
  'The token layer needs a contrast pass before launch.',
  'RLS context has to be set per transaction, not per request.',
  'Most of my over-runs are research time I never planned for.',
  'Smaller actions get estimated far more accurately.',
];

const NEXT_POOL: readonly string[] = [
  'Split the sync worker into ingest and apply.',
  'Add a skeleton state to the spec view.',
  'Ask Morgan about the Linear cycle mapping.',
  'Write the test for idempotent retries.',
  'Check whether off-hours capacity is double-counted.',
  'Document the BUILD_TARGET split.',
  'Revisit the tray banner timing.',
];

const FEELING_CYCLE: readonly Feeling[] = [
  'target', 'smile', 'neutral', 'smile', 'frown', 'smile', 'neutral', 'target', 'smile',
];

const ANCHOR = Date.UTC(2026, 4, 21, 21, 0);

const pad = (n: number) => String(n).padStart(3, '0');

function pick<T>(list: readonly T[], index: number): T {
  return list[((index % list.length) + list.length) % list.length] as T;
}

function buildSessions(count: number): SessionRecord[] {
  const rows: SessionRecord[] = [];
  let cursor = ANCHOR;
  for (let i = 0; i < count; i += 1) {
    const pool = pick(ACTION_POOL, i);
    cursor -= ((14 + ((i * 9) % 40)) * 3600 + ((i * 41) % 60) * 60) * 1000;
    rows.push({
      id: `ses-${pad(i + 1)}`,
      at: new Date(cursor).toISOString(),
      actionTitle: pool[0],
      specKey: pool[1],
      durationMin: 20 + ((i * 23) % 116),
      feeling: i % 11 === 5 ? null : pick(FEELING_CYCLE, i),
    });
  }
  return rows;
}

function buildCheckIns(count: number): CheckInRecord[] {
  const rows: CheckInRecord[] = [];
  let cursor = ANCHOR - 3 * 3600 * 1000;
  for (let i = 0; i < count; i += 1) {
    const pool = pick(ACTION_POOL, i * 3);
    cursor -= ((16 + ((i * 11) % 44)) * 3600 + ((i * 29) % 60) * 60) * 1000;
    rows.push({
      id: `chk-${pad(i + 1)}`,
      at: new Date(cursor).toISOString(),
      feeling: pick(FEELING_CYCLE, i * 4),
      note: pick(NOTE_POOL, i),
      onAction: pool[0],
    });
  }
  return rows;
}

function buildCaptures(count: number): CaptureRecord[] {
  const rows: CaptureRecord[] = [];
  let cursor = ANCHOR - 5400 * 1000;
  for (let i = 0; i < count; i += 1) {
    const isInsight = i % 2 === 0;
    cursor -= ((10 + ((i * 7) % 32)) * 3600 + ((i * 47) % 60) * 60) * 1000;
    rows.push({
      id: `cap-${pad(i + 1)}`,
      at: new Date(cursor).toISOString(),
      kind: isInsight ? 'Insight' : 'Next',
      text: isInsight ? pick(INSIGHT_POOL, i) : pick(NEXT_POOL, i),
    });
  }
  return rows;
}

export const sessionRecords: SessionRecord[] = buildSessions(54);
export const checkInRecords: CheckInRecord[] = buildCheckIns(47);
export const captureRecords: CaptureRecord[] = buildCaptures(63);
