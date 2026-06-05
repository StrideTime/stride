import { pgTable, text, integer, boolean, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { Feeling } from '../enums/Feeling';
import { workspacesTable } from './workspaces';
import { actionsTable } from './actions';
import { usersTable } from './users';
import { workspaceIsolationPolicy } from './rls';

// RESERVED, unused in v1. The provenance-ready slot for later git/file correlation — which
// commits and files fell inside the Session window — so the timeshape→content upgrade needs
// no migration (Q21, decisions.mdc 2026-06-02).
export type ContentSignal = {
  commits?: string[];
  filesTouched?: string[];
};

// Actual timed work against an Action. Sessions always go through an Action, never a Spec.
// One runs at a time per user; ephemeral while running (`endedAt` null), then archived.
export const sessionsTable = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspacesTable.id),
    actionId: text('action_id')
      .notNull()
      .references(() => actionsTable.id),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    elapsedMin: integer('elapsed_min').notNull().default(0),
    // Set at the end-of-session check-in:
    feeling: text('feeling').$type<Feeling>(),
    markDone: boolean('mark_done').notNull().default(false),
    contentSignal: jsonb('content_signal').$type<ContentSignal>(),
    signalSource: text('signal_source'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),
  },
  table => [
    index('idx_sessions_workspace').on(table.workspaceId),
    index('idx_sessions_action').on(table.actionId),
    index('idx_sessions_user').on(table.userId),
    workspaceIsolationPolicy('sessions', table.workspaceId),
  ],
).enableRLS();

export const insertSessionSchema = createInsertSchema(sessionsTable);
export const selectSessionSchema = createSelectSchema(sessionsTable);

export type Session = typeof sessionsTable.$inferSelect;
export type InsertSession = typeof sessionsTable.$inferInsert;
