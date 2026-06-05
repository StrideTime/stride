import { pgTable, text, jsonb, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { SpecActivityType } from '../enums/SpecActivityType';
import { workspacesTable } from './workspaces';
import { specsTable } from './specs';
import { usersTable } from './users';
import { workspaceIsolationPolicy } from './rls';

// Append-only audit / activity log for a Spec. Records only NON-derivable events (source
// syncs, status/priority/owner changes, ownership transfers); the Spec view's History tab
// merges these with Action/Session timestamps. **No soft delete — this is immutable history**
// (it also has no `updatedAt`). Backs the ownership/provenance commitment (decisions.mdc
// 2026-05-21).
export const specActivityTable = pgTable(
  'spec_activity',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspacesTable.id),
    specId: text('spec_id')
      .notNull()
      .references(() => specsTable.id),
    type: text('type').$type<SpecActivityType>().notNull(),
    actorUserId: text('actor_user_id').references(() => usersTable.id), // null = system / source
    isSourceOriginated: boolean('is_source_originated').notNull().default(false),
    payload: jsonb('payload').$type<Record<string, unknown>>(), // e.g. { from, to }
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [
    index('idx_spec_activity_spec').on(table.specId),
    workspaceIsolationPolicy('spec_activity', table.workspaceId),
  ],
).enableRLS();

export const insertSpecActivitySchema = createInsertSchema(specActivityTable);
export const selectSpecActivitySchema = createSelectSchema(specActivityTable);

export type SpecActivity = typeof specActivityTable.$inferSelect;
export type InsertSpecActivity = typeof specActivityTable.$inferInsert;
