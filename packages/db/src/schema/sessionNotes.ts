import { pgTable, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { workspacesTable } from './workspaces';
import { sessionsTable } from './sessions';
import { usersTable } from './users';
import { workspaceIsolationPolicy } from './rls';

export type SessionNoteSource = 'manual' | 'session_end' | 'capture';

// Crawlable note timeline for Sessions. Session-end feedback is a note with
// `source = 'session_end'`; future capture behavior can add `capture` notes without changing
// the shape AI traverses.
export const sessionNotesTable = pgTable(
  'session_notes',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspacesTable.id),
    sessionId: text('session_id')
      .notNull()
      .references(() => sessionsTable.id),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id),
    body: text('body').notNull(),
    source: text('source').$type<SessionNoteSource>().notNull().default('manual'),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),
  },
  table => [
    index('idx_session_notes_workspace').on(table.workspaceId),
    index('idx_session_notes_session').on(table.sessionId),
    index('idx_session_notes_user').on(table.userId),
    index('idx_session_notes_occurred_at').on(table.occurredAt),
    workspaceIsolationPolicy('session_notes', table.workspaceId),
  ],
).enableRLS();

export const insertSessionNoteSchema = createInsertSchema(sessionNotesTable);
export const selectSessionNoteSchema = createSelectSchema(sessionNotesTable);

export type SessionNote = typeof sessionNotesTable.$inferSelect;
export type InsertSessionNote = typeof sessionNotesTable.$inferInsert;
