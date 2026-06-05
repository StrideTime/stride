/**
 * Deterministic seed dataset. One definition feeds local dev, staging, and the E2E baseline
 * branch (see docs/architecture/environments.md). Idempotent — safe to run repeatedly against
 * a migrated database (onConflictDoNothing on fixed UUIDs).
 *
 * Make this DELIBERATELY ADVERSARIAL as it grows: huge/empty accounts, emoji/RTL text,
 * boundary timestamps, soft-deleted rows — the edge cases real data would expose, so we catch
 * them without ever copying production data.
 *
 *   pnpm db:seed
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  usersTable,
  workspacesTable,
  membershipsTable,
  teamsTable,
  teamMembersTable,
  scheduledEventTypesTable,
  defaultScheduledEventTypes,
} from './schema';

// Fixed IDs so the dataset is stable across runs and assertions can hard-code them.
const IDS = {
  workspace: '00000000-0000-4000-8000-000000000001',
  founder: '00000000-0000-4000-8000-000000000002',
  member: '00000000-0000-4000-8000-000000000003',
  founderMembership: '00000000-0000-4000-8000-000000000004',
  memberMembership: '00000000-0000-4000-8000-000000000005',
  team: '00000000-0000-4000-8000-000000000006',
  founderTeamMember: '00000000-0000-4000-8000-000000000007',
  memberTeamMember: '00000000-0000-4000-8000-000000000008',
  eventTypeActions: '00000000-0000-4000-8000-000000000009',
  eventTypeMeeting: '00000000-0000-4000-8000-000000000010',
  eventTypeBreak: '00000000-0000-4000-8000-000000000011',
  eventTypeFocus: '00000000-0000-4000-8000-000000000012',
  eventTypePersonal: '00000000-0000-4000-8000-000000000013',
  eventTypeBuffer: '00000000-0000-4000-8000-000000000014',
  eventTypeExternalCalendar: '00000000-0000-4000-8000-000000000015',
} as const;

export async function seed(db: ReturnType<typeof drizzle>): Promise<void> {
  await db
    .insert(usersTable)
    .values([
      { id: IDS.founder, email: 'founder@stride.test', name: 'Ada Founder' },
      // edge case: emoji + RTL in a display name
      { id: IDS.member, email: 'member@stride.test', name: 'Иван 🌊 مطوّر' },
    ])
    .onConflictDoNothing();

  await db
    .insert(workspacesTable)
    .values({ id: IDS.workspace, name: 'Acme Engineering', plan: 'free' })
    .onConflictDoNothing();

  await db
    .insert(membershipsTable)
    .values([
      { id: IDS.founderMembership, workspaceId: IDS.workspace, userId: IDS.founder, role: 'workspace_admin' },
      { id: IDS.memberMembership, workspaceId: IDS.workspace, userId: IDS.member, role: 'member' },
    ])
    .onConflictDoNothing();

  await db
    .insert(teamsTable)
    .values({ id: IDS.team, workspaceId: IDS.workspace, name: 'Platform' })
    .onConflictDoNothing();

  await db
    .insert(teamMembersTable)
    .values([
      { id: IDS.founderTeamMember, teamId: IDS.team, userId: IDS.founder, role: 'team_admin' },
      { id: IDS.memberTeamMember, teamId: IDS.team, userId: IDS.member, role: 'member' },
    ])
    .onConflictDoNothing();

  const eventTypeIds = [
    IDS.eventTypeActions,
    IDS.eventTypeMeeting,
    IDS.eventTypeBreak,
    IDS.eventTypeFocus,
    IDS.eventTypePersonal,
    IDS.eventTypeBuffer,
    IDS.eventTypeExternalCalendar,
  ];

  await db
    .insert(scheduledEventTypesTable)
    .values(
      defaultScheduledEventTypes.map((eventType, index) => ({
        id: eventTypeIds[index]!,
        workspaceId: IDS.workspace,
        ...eventType,
      })),
    )
    .onConflictDoNothing();

  // TODO extend as the product grows: sourceConnections, specs (incl. a huge backlog + an empty
  // one), actions, sessions, scheduledEvents, notifications, soft-deleted rows, boundary dates.
}

// Run directly: `tsx src/seed.ts`
if (import.meta.url === `file://${process.argv[1]}`) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required to seed');
  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql);
  seed(db)
    .then(() => console.log('Seed complete.'))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => sql.end());
}
