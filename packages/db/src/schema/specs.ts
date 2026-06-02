import { pgTable, text, jsonb, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { SourceType } from '../enums/SourceType';
import type { SpecStatus } from '../enums/SpecStatus';
import { workspacesTable } from './workspaces';
import { usersTable } from './users';
import { sourceConnectionsTable } from './sourceConnections';

// Source-native grouping (Jira Sprint / Linear Cycle / GitHub Milestone / Epic). Stored
// source-native — there is no unified Project/Sprint entity. Normalized at the display layer.
export type SourceGrouping = {
  kind: string; // 'sprint' | 'cycle' | 'epic' | 'milestone' | 'project'
  label: string;
  sourceId?: string;
};

// A ticket synced from a source. Always has a source system (no Stride-native Specs).
// `status` is Stride's internal lifecycle (open|closed); `sourceStatus`/`sourcePriority` are
// the raw source strings displayed using the source's own vocabulary.
//
// `readiness` and the backlog view tabs (Breakdown / In Flight / Blocked / Next Up /
// Completed) are DERIVED in the query layer from these primitives — never stored here (Q4).
export const specsTable = pgTable(
  'specs',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspacesTable.id),
    sourceConnectionId: text('source_connection_id')
      .notNull()
      .references(() => sourceConnectionsTable.id),
    sourceType: text('source_type').$type<SourceType>().notNull(),
    sourceId: text('source_id').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').$type<SpecStatus>().notNull().default('open'),
    sourceStatus: text('source_status').notNull(),
    priority: text('priority'),
    sourcePriority: text('source_priority'),
    assigneeUserId: text('assignee_user_id').references(() => usersTable.id),
    reporter: text('reporter'),
    due: timestamp('due', { withTimezone: true }),
    labels: jsonb('labels').$type<string[]>().notNull().default([]),
    sourceGrouping: jsonb('source_grouping').$type<SourceGrouping>(),
    sourceData: jsonb('source_data').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),
  },
  table => [
    index('idx_specs_workspace').on(table.workspaceId),
    index('idx_specs_source').on(table.sourceType, table.sourceId),
    index('idx_specs_assignee').on(table.assigneeUserId),
  ],
);

export const insertSpecSchema = createInsertSchema(specsTable);
export const selectSpecSchema = createSelectSchema(specsTable);

export type Spec = typeof specsTable.$inferSelect;
export type InsertSpec = typeof specsTable.$inferInsert;
