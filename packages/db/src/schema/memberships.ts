import { pgTable, text, jsonb, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { WorkspaceRole } from '../enums/WorkspaceRole';
import { usersTable } from './users';
import { workspacesTable } from './workspaces';
import { workspaceIsolationPolicy } from './rls';

// One personal working-hours setting per Workspace (seeded from a Team on join, then owned
// by the member). Days are 0–6 (Sun–Sat). Multiple windows per day are allowed, but windows
// for the same day must not overlap (validated in service/Zod logic).
export type WorkingHoursWindow = {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  start: string; // 'HH:mm'
  end: string; // 'HH:mm'
};

export type WorkingHours = {
  timezone: string;
  windows: WorkingHoursWindow[];
};

// Joins a User to a Workspace with a workspace-level role, plus the member's per-workspace
// personal settings. Team roles live independently on `team_members`.
export const membershipsTable = pgTable(
  'memberships',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspacesTable.id),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id),
    role: text('role').$type<WorkspaceRole>().notNull().default('member'),
    workingHours: jsonb('working_hours').$type<WorkingHours>(),
    // Per-workspace notification overrides (the granular My-notifications toggles). Account-wide
    // defaults live on `users.settings`. Kept as jsonb — preferences, not relational data.
    notificationPrefs: jsonb('notification_prefs').$type<Record<string, unknown>>(),
    calendarOptIn: boolean('calendar_opt_in').notNull().default(false),
    // Privacy default OFF, opt-in only — presence / focus-status indicators
    // (commitments, decisions.mdc 2026-05-21).
    presenceEnabled: boolean('presence_enabled').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),
  },
  table => [
    index('idx_memberships_workspace').on(table.workspaceId),
    index('idx_memberships_user').on(table.userId),
    workspaceIsolationPolicy('memberships', table.workspaceId),
  ],
).enableRLS();

export const insertMembershipSchema = createInsertSchema(membershipsTable);
export const selectMembershipSchema = createSelectSchema(membershipsTable);

export type Membership = typeof membershipsTable.$inferSelect;
export type InsertMembership = typeof membershipsTable.$inferInsert;
