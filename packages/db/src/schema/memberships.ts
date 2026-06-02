import { pgTable, text, jsonb, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { MembershipRole } from '../enums/MembershipRole';
import { usersTable } from './users';
import { workspacesTable } from './workspaces';

// One personal working-hours setting per Workspace (seeded from a Team on join, then owned
// by the member). Days are 0–6 (Sun–Sat).
export type WorkingHours = {
  start: string; // 'HH:mm'
  end: string; // 'HH:mm'
  days: number[];
  timezone: string;
};

// Joins a User to a Workspace with a role, plus the member's per-workspace personal settings.
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
    role: text('role').$type<MembershipRole>().notNull().default('member'),
    workingHours: jsonb('working_hours').$type<WorkingHours>(),
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
  ],
);

export const insertMembershipSchema = createInsertSchema(membershipsTable);
export const selectMembershipSchema = createSelectSchema(membershipsTable);

export type Membership = typeof membershipsTable.$inferSelect;
export type InsertMembership = typeof membershipsTable.$inferInsert;
